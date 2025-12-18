<template>
  <div class="app-container">
    <div class="tech-bg"></div>
    <div class="app-content">
      <DownloadList v-if="mounted" />
      <div v-else class="loading">
        加载中...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { useDownloadStore } from '@/store/download'
import { convertChromeDownload } from '@/utils/download'
import DownloadList from '@/views/DownloadList.vue'

const settingsStore = useSettingsStore()
const downloadStore = useDownloadStore()
const mounted = ref(false)
let pollingInterval: number | null = null

/**
 * 更新正在下载的项目
 */
const updateDownloadingItems = async() => {
  try {
    // 只查询正在下载的项目
    const results = await new Promise<chrome.downloads.DownloadItem[]>((resolve, reject) => {
      chrome.downloads.search(
        { state: 'in_progress' },
        (results: chrome.downloads.DownloadItem[]) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(results)
          }
        }
      )
    })

    // 更新每个正在下载的项目（只添加有效的下载项）
    results.forEach(item => {
      if (!item.paused) {
        const downloadItem = convertChromeDownload(item)
        if (downloadItem) {
          downloadStore.addDownload(downloadItem)
        }
      }
    })
  } catch (error) {
    console.error('Failed to update downloading items:', error)
  }
}

onMounted(async() => {
  // 设置加载状态
  downloadStore.setLoading(true)
  mounted.value = true

  // 加载设置
  settingsStore.loadSettings()

  // 加载下载记录
  try {
    const results = await new Promise<chrome.downloads.DownloadItem[]>((resolve, reject) => {
      chrome.downloads.search({}, (results: chrome.downloads.DownloadItem[]) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(results)
        }
      })
    })

    results.forEach(item => {
      const downloadItem = convertChromeDownload(item)
      if (downloadItem) {
        downloadStore.addDownload(downloadItem)
      }
    })
  } catch (error) {
    console.error('Failed to load downloads:', error)
  } finally {
    // 数据加载完成，关闭 loading 状态
    downloadStore.setLoading(false)
  }

  // 监听下载变化
  try {
    chrome.downloads.onChanged.addListener((downloadDelta: chrome.downloads.DownloadDelta) => {
      if (downloadDelta.id !== undefined) {
        chrome.downloads.search(
          { id: downloadDelta.id },
          (results: chrome.downloads.DownloadItem[]) => {
            if (results.length > 0 && results[0]) {
              const downloadItem = convertChromeDownload(results[0])
              if (downloadItem) {
                downloadStore.addDownload(downloadItem)
              } else {
                downloadStore.removeDownload(downloadDelta.id)
              }
            } else {
              downloadStore.removeDownload(downloadDelta.id)
            }
          }
        )
      }
    })

    chrome.downloads.onCreated.addListener((downloadItem: chrome.downloads.DownloadItem) => {
      const item = convertChromeDownload(downloadItem)
      if (item) {
        downloadStore.addDownload(item)

        const oldItemByUrl = downloadStore.downloads.find((d: any) => d.url === item.url && d.id !== item.id)
        if (oldItemByUrl) {
          downloadStore.removeDownload(oldItemByUrl.id)
        }
      }
    })
  } catch (error) {
    console.error('Failed to register download listeners:', error)
  }

  pollingInterval = window.setInterval(() => {
    updateDownloadingItems()
  }, 500)
})

onUnmounted(() => {
  if (pollingInterval !== null) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  position: relative;
  overflow: hidden;
}

.app-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
