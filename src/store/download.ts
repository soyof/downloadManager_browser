/**
 * 下载管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { DownloadItem, FilterOptions, SortOptions } from '@/types/download'
import { DownloadStatus, FileType, SortBy, SortOrder } from '@/types/download'

export const useDownloadStore = defineStore('download', () => {
  // 状态
  const downloads = ref<DownloadItem[]>([])
  const filterOptions = ref<FilterOptions>({})
  const sortOptions = ref<SortOptions>({
    sortBy: SortBy.TIME,
    sortOrder: SortOrder.DESC
  })
  const isLoading = ref<boolean>(true) // 数据加载状态

  // 分页相关状态（从存储加载）
  const PAGINATION_STORAGE_KEY = 'download-manager-pagination'
  const loadPaginationSettings = (): { currentPage: number; pageSize: number } => {
    try {
      const stored = localStorage.getItem(PAGINATION_STORAGE_KEY)
      if (stored) {
        const settings = JSON.parse(stored)
        return {
          currentPage: settings.currentPage || 1,
          pageSize: settings.pageSize || 20
        }
      }
    } catch (error) {
      console.error('Failed to load pagination settings:', error)
    }
    return { currentPage: 1, pageSize: 20 }
  }

  const savePaginationSettings = (currentPage: number, pageSize: number) => {
    try {
      const settings = { currentPage, pageSize }
      localStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify(settings))
      // 同时保存到 chrome.storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [PAGINATION_STORAGE_KEY]: JSON.stringify(settings) }).catch(() => {
          // 忽略错误
        })
      }
    } catch (error) {
      console.error('Failed to save pagination settings:', error)
    }
  }

  const paginationSettings = loadPaginationSettings()
  const currentPage = ref<number>(paginationSettings.currentPage)
  const pageSize = ref<number>(paginationSettings.pageSize)

  // 用于计算下载速度的缓存数据
  const downloadSpeedCache = ref<Map<number, { bytesReceived: number; timestamp: number }>>(new Map())

  // 用于保存重新下载时的原始下载时间（URL -> { startTime, endTime }）
  // 这样无论哪个事件先触发，都能保留原下载时间
  const preservedDownloadTimes = ref<Map<string, { startTime: number; endTime?: number }>>(new Map())

  // 计算属性：筛选后的下载列表
  const filteredDownloads = computed(() => {
    let result = [...downloads.value]

    // 状态筛选
    if (filterOptions.value.status) {
      result = result.filter(item => item.status === filterOptions.value.status)
    }

    // 文件类型筛选
    if (filterOptions.value.fileType) {
      result = result.filter(item => item.fileType === filterOptions.value.fileType)
    }

    // 搜索筛选
    if (filterOptions.value.searchText) {
      const searchText = filterOptions.value.searchText.toLowerCase()
      result = result.filter(item => item.name.toLowerCase().includes(searchText))
    }

    return result
  })

  // 计算属性：排序后的下载列表
  const sortedDownloads = computed(() => {
    const result = [...filteredDownloads.value]

    result.sort((a, b) => {
      let compareA: string | number
      let compareB: string | number

      switch (sortOptions.value.sortBy) {
        case SortBy.NAME:
          compareA = a.name.toLowerCase()
          compareB = b.name.toLowerCase()
          break
        case SortBy.SIZE:
          compareA = a.size
          compareB = b.size
          break
        case SortBy.TIME:
        default:
          compareA = a.startTime
          compareB = b.startTime
          break
      }

      if (compareA < compareB) {
        return sortOptions.value.sortOrder === SortOrder.ASC ? -1 : 1
      }
      if (compareA > compareB) {
        return sortOptions.value.sortOrder === SortOrder.ASC ? 1 : -1
      }
      return 0
    })

    return result
  })

  // 计算属性：分页后的下载列表
  const paginatedDownloads = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sortedDownloads.value.slice(start, end)
  })

  // 计算属性：总页数
  const totalPages = computed(() => {
    return Math.ceil(sortedDownloads.value.length / pageSize.value)
  })

  // 计算属性：统计信息
  const stats = computed(() => {
    return {
      total: downloads.value.length,
      downloading: downloads.value.filter(
        (item: DownloadItem) => item.status === DownloadStatus.DOWNLOADING
      ).length,
      completed: downloads.value.filter(
        (item: DownloadItem) => item.status === DownloadStatus.COMPLETED
      ).length,
      paused: downloads.value.filter((item: DownloadItem) => item.status === DownloadStatus.PAUSED)
        .length,
      failed: downloads.value.filter((item: DownloadItem) => item.status === DownloadStatus.FAILED)
        .length
    }
  })

  // Actions
  /**
   * 获取并应用保存的下载时间（如果存在）
   */
  const applyPreservedDownloadTime = (item: DownloadItem): DownloadItem => {
    const preserved = preservedDownloadTimes.value.get(item.url)
    if (preserved) {
      item.startTime = preserved.startTime
      if (preserved.endTime !== undefined) {
        item.endTime = preserved.endTime
      }
    }
    return item
  }

  /**
   * 添加下载项
   */
  const addDownload = (item: DownloadItem) => {
    const itemWithPreservedTimeBase = applyPreservedDownloadTime({ ...item })

    let itemWithPreservedTime = itemWithPreservedTimeBase
    if (!preservedDownloadTimes.value.has(itemWithPreservedTime.url)) {
      const oldItemByUrl = downloads.value.find((d: DownloadItem) => d.url === itemWithPreservedTime.url && d.id !== itemWithPreservedTime.id)
      if (oldItemByUrl) {
        itemWithPreservedTime = {
          ...itemWithPreservedTime,
          startTime: oldItemByUrl.startTime,
          endTime: oldItemByUrl.endTime
        }
      }
    }

    const index = downloads.value.findIndex((d: DownloadItem) => d.id === itemWithPreservedTime.id)
    if (index >= 0) {
      const existing = downloads.value[index]
      if (existing) {
        if (!preservedDownloadTimes.value.has(itemWithPreservedTime.url) && existing.startTime < itemWithPreservedTime.startTime) {
          itemWithPreservedTime.startTime = existing.startTime
          itemWithPreservedTime.endTime = existing.endTime
        }
      }
      downloads.value[index] = itemWithPreservedTime
    } else {
      downloads.value.push(itemWithPreservedTime)
    }
  }

  /**
   * 更新下载项
   */
  const updateDownload = (id: number, updates: Partial<DownloadItem>) => {
    const index = downloads.value.findIndex((d: DownloadItem) => d.id === id)
    if (index >= 0) {
      const current = downloads.value[index]
      if (current) {
        Object.assign(current, updates)
      }
    }
  }

  /**
   * 计算并更新下载速度
   */
  const calculateSpeed = (id: number, currentBytesReceived: number): number => {
    const cache = downloadSpeedCache.value.get(id)
    const now = Date.now()

    if (!cache) {
      // 首次记录
      downloadSpeedCache.value.set(id, {
        bytesReceived: currentBytesReceived,
        timestamp: now
      })
      return 0
    }

    const timeDelta = (now - cache.timestamp) / 1000 // 转换为秒
    if (timeDelta <= 0) {
      return 0
    }

    const bytesDelta = currentBytesReceived - cache.bytesReceived
    const speed = bytesDelta / timeDelta // 字节/秒

    // 更新缓存
    downloadSpeedCache.value.set(id, {
      bytesReceived: currentBytesReceived,
      timestamp: now
    })

    return Math.max(0, speed) // 确保速度不为负数
  }

  /**
   * 清除下载速度缓存
   */
  const clearSpeedCache = (id: number) => {
    downloadSpeedCache.value.delete(id)
  }

  /**
   * 删除下载项
   */
  const removeDownload = (id: number) => {
    const index = downloads.value.findIndex((d: DownloadItem) => d.id === id)
    if (index >= 0) {
      downloads.value.splice(index, 1)
    }
  }

  /**
   * 通过ID替换下载项（用于重新下载时替换旧记录）
   */
  const replaceDownloadById = (oldId: number, newDownloadItem: DownloadItem) => {
    const index = downloads.value.findIndex((d: DownloadItem) => d.id === oldId)
    if (index >= 0) {
      const oldDownloadItem = downloads.value[index]
      if (!oldDownloadItem) {
        return false
      }
      const preservedStartTime = oldDownloadItem.startTime
      const preservedEndTime = oldDownloadItem.endTime

      downloads.value[index] = {
        ...newDownloadItem,
        startTime: preservedStartTime ?? newDownloadItem.startTime,
        endTime: preservedEndTime ?? newDownloadItem.endTime
      }

      return true
    }
    return false
  }

  /**
   * 通过URL替换下载项（用于重新下载时替换旧记录）
   */
  const replaceDownloadByUrl = (url: string, newDownloadItem: DownloadItem) => {
    const index = downloads.value.findIndex((d: DownloadItem) => d.url === url)
    if (index >= 0) {
      const oldDownloadItem = downloads.value[index]
      const preservedStartTime = oldDownloadItem?.startTime
      const preservedEndTime = oldDownloadItem?.endTime

      downloads.value[index] = {
        ...newDownloadItem,
        startTime: preservedStartTime ?? newDownloadItem.startTime,
        endTime: preservedEndTime ?? newDownloadItem.endTime
      }
      return true
    }
    return false
  }

  /**
   * 设置筛选选项
   */
  const setFilterOptions = (options: FilterOptions) => {
    filterOptions.value = { ...filterOptions.value, ...options }
  }

  /**
   * 设置排序选项
   */
  const setSortOptions = (options: SortOptions) => {
    sortOptions.value = { ...sortOptions.value, ...options }
  }

  /**
   * 清空筛选
   */
  const clearFilters = () => {
    filterOptions.value = {}
  }

  /**
   * 设置加载状态
   */
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  /**
   * 根据文件扩展名判断文件类型
   */
  const getFileType = (filename: string, mimeType?: string): FileType => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''

    // 图片类型
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
    if (imageExts.includes(ext) || mimeType?.startsWith('image/')) {
      return FileType.IMAGE
    }

    // 视频类型
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v']
    if (videoExts.includes(ext) || mimeType?.startsWith('video/')) {
      return FileType.VIDEO
    }

    // 音频类型
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma']
    if (audioExts.includes(ext) || mimeType?.startsWith('audio/')) {
      return FileType.AUDIO
    }

    // 文档类型
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']
    if (docExts.includes(ext) || mimeType?.includes('document') || mimeType?.includes('pdf')) {
      return FileType.DOCUMENT
    }

    return FileType.FILE
  }

  // 设置当前页
  const setCurrentPage = (page: number) => {
    currentPage.value = page
    savePaginationSettings(currentPage.value, pageSize.value)
  }

  // 设置每页数量
  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // 重置到第一页
    savePaginationSettings(currentPage.value, pageSize.value)
  }

  // 监听筛选条件变化，重置到第一页（但不保存，因为这是临时重置）
  watch([filterOptions, sortOptions], () => {
    currentPage.value = 1
  }, { deep: true })

  return {
    // State
    downloads,
    filterOptions,
    sortOptions,
    isLoading,
    currentPage,
    pageSize,
    // Computed
    filteredDownloads,
    sortedDownloads,
    paginatedDownloads,
    totalPages,
    stats,
    // Actions
    addDownload,
    updateDownload,
    removeDownload,
    replaceDownloadById,
    replaceDownloadByUrl,
    setFilterOptions,
    setSortOptions,
    clearFilters,
    getFileType,
    calculateSpeed,
    clearSpeedCache,
    setLoading,
    setCurrentPage,
    setPageSize
  }
})
