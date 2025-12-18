<template>
  <div
    class="download-item tech-card"
    :class="[statusClass, { 'file-deleted': isFileDeleted }]"
    :style="downloadProgressStyle"
  >
    <!-- 进度背景层：下载中或暂停时显示 -->
    <ProgressBar
      v-if="downloadItem.status === 'downloading' || downloadItem.status === 'paused'"
      :progress="downloadItem.progress"
      :status="downloadItem.status"
    />

    <div class="item-main">
      <!-- 第一行：文件信息（包含操作按钮）和状态 -->
      <div class="item-main-top">
        <!-- 文件信息 -->
        <FileInfo
          :downloadItem="downloadItem"
          :fileIcon="fileIcon"
          :errorMessage="errorMessage"
          :remainingTimeText="remainingTimeText"
          :directoryPath="directoryPath"
        >
          <!-- 操作按钮插槽 -->
          <template #actions>
            <ActionButtons
              :downloadItem="downloadItem"
              :isRetrying="isRetrying"
              @pause="handlePause"
              @resume="handleResume"
              @retry="handleRetry"
              @copyUrl="handleCopyUrl"
              @openFolder="handleOpenFolder"
              @openFile="handleOpenFile"
              @command="handleCommand"
            />
          </template>
        </FileInfo>

        <!-- 状态标签 -->
        <StatusBadge :downloadItem="downloadItem" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DownloadItem as IDownloadItem } from '@/types/download'
import { DownloadStatus } from '@/types/download'
import {
  formatRemainingTime,
  pauseDownload,
  resumeDownload,
  retryDownload,
  openFile,
  openFolder,
  cancelDownload,
  deleteDownloadRecord,
  deleteDownloadFileAndRecord
} from '@/utils/download'
import { convertChromeDownload } from '@/utils/download'
import { useDownloadStore } from '@/store/download'
import ProgressBar from './DownloadItem/ProgressBar.vue'
import FileInfo from './DownloadItem/FileInfo.vue'
import ActionButtons from './DownloadItem/ActionButtons.vue'
import StatusBadge from './DownloadItem/StatusBadge.vue'

const props = defineProps<{
  downloadItem: IDownloadItem
}>()

const { t: $t } = useI18n()
const downloadStore = useDownloadStore()

// 重试操作的 loading 状态
const isRetrying = ref(false)

const statusClass = computed(() => `status-${props.downloadItem.status}`)

// 检查文件是否已删除
const isFileDeleted = computed(() => {
  // 已完成状态但文件不存在，标记为已删除
  return props.downloadItem.status === 'completed' && props.downloadItem.exists === false
})

const fileIcon = computed(() => {
  const typeMap: Record<string, string> = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    document: '📄',
    file: '📦'
  }
  return typeMap[props.downloadItem.fileType] || '📦'
})

// 计算剩余时间
const remainingTimeText = computed(() => {
  if (props.downloadItem.status !== 'downloading' || props.downloadItem.speed === 0) {
    return '--'
  }
  const remainingBytes = props.downloadItem.size - props.downloadItem.receivedBytes
  const timeText = formatRemainingTime(remainingBytes, props.downloadItem.speed)
  return `还有 ${timeText}`
})

// 翻译错误信息
const errorMessage = computed(() => {
  if (!props.downloadItem.error) {
    return ''
  }

  // Chrome downloads API 的错误代码通常是 "USER_CANCELED" 这样的格式
  // 将其转换为驼峰命名格式的翻译键 "errorUserCanceled"
  const errorCode = props.downloadItem.error.toUpperCase()
  // 将 "USER_CANCELED" 转换为 "userCanceled"
  const camelCaseCode = errorCode
    .split('_')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase()
      }
      return word.charAt(0) + word.slice(1).toLowerCase()
    })
    .join('')
  const translationKey = `error${camelCaseCode.charAt(0).toUpperCase() + camelCaseCode.slice(1)}`

  // 尝试获取翻译
  const translated = $t(translationKey)

  // 如果翻译键存在且不等于原始 key，说明找到了翻译
  if (translated && translated !== translationKey) {
    return translated
  }

  // 如果没有找到翻译，返回原始错误信息（可能是自定义错误）
  return props.downloadItem.error
})

// 提取目录路径（去掉文件名）
const directoryPath = computed(() => {
  if (!props.downloadItem.path) {
    return ''
  }

  const path = props.downloadItem.path
  // 处理不同操作系统的路径分隔符
  const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))

  if (lastSlashIndex === -1) {
    // 如果没有路径分隔符，说明只有文件名，返回空或当前目录
    return ''
  }

  // 返回最后一个分隔符之前的部分（目录路径）
  return path.substring(0, lastSlashIndex)
})

// 下载进度背景样式：下载中或暂停时都需要
const downloadProgressStyle = computed((): Record<string, string> => {
  if (props.downloadItem.status !== 'downloading' && props.downloadItem.status !== 'paused') {
    return {}
  }
  return {
    position: 'relative',
    overflow: 'hidden'
  }
})

const handlePause = async() => {
  try {
    await pauseDownload(props.downloadItem.id)
    ElMessage.success($t('messagePauseSuccess'))
  } catch {
    ElMessage.error($t('messageRetryFailed'))
  }
}

const handleResume = async() => {
  try {
    // 先查询最新的下载状态，因为暂停后等待时间长了，状态可能已经变化
    const results = await new Promise<chrome.downloads.DownloadItem[]>((resolve, reject) => {
      chrome.downloads.search({ id: props.downloadItem.id }, (results: chrome.downloads.DownloadItem[]) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(results)
        }
      })
    })

    if (results.length === 0 || !results[0]) {
      ElMessage.info($t('messageRetryingDownload'))
      await handleRetry(true)
      return
    }

    const currentItem = results[0]
    const isPaused = currentItem.state === 'in_progress' && currentItem.paused
    const isInterrupted = currentItem.state === 'interrupted'

    if ((!isPaused && !isInterrupted) || currentItem.canResume !== true) {
      ElMessage.info($t('messageRetryingDownload'))
      await handleRetry(true)
      return
    }

    await resumeDownload(props.downloadItem.id)

    await new Promise(resolve => setTimeout(resolve, 1000))
    const checkResults = await new Promise<chrome.downloads.DownloadItem[]>((resolve, reject) => {
      chrome.downloads.search({ id: props.downloadItem.id }, (results: chrome.downloads.DownloadItem[]) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(results)
        }
      })
    })

    if (checkResults.length > 0 && checkResults[0]) {
      const checkItem = checkResults[0]
      if (checkItem.state === 'interrupted' && checkItem.canResume === true) {
        try {
          await resumeDownload(props.downloadItem.id)
          await new Promise(resolve => setTimeout(resolve, 500))
          const finalResults = await new Promise<chrome.downloads.DownloadItem[]>((resolve, reject) => {
            chrome.downloads.search({ id: props.downloadItem.id }, (results: chrome.downloads.DownloadItem[]) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
              } else {
                resolve(results)
              }
            })
          })
          if (finalResults.length > 0 && finalResults[0] && finalResults[0].state === 'in_progress') {
            ElMessage.success($t('messageResumeSuccess'))
          } else {
            ElMessage.info($t('messageRetryingDownload'))
            await handleRetry(true)
          }
          return
        } catch {
          ElMessage.info($t('messageRetryingDownload'))
          await handleRetry(true)
          return
        }
      }
      if (checkItem.state === 'in_progress' && !checkItem.paused) {
        ElMessage.success($t('messageResumeSuccess'))
        return
      }
    }

    ElMessage.info($t('messageRetryingDownload'))
    await handleRetry(true)
  } catch {
    try {
      ElMessage.info($t('messageRetryingDownload'))
      await handleRetry(true)
    } catch (retryError) {
      console.error('Retry download also failed:', retryError)
      ElMessage.error($t('messageRetryFailed'))
    }
  }
}

// 节流定时器
let retryThrottleTimer: number | null = null
const RETRY_THROTTLE_DELAY = 2000 // 2秒内只能点击一次

const handleRetry = async(silent = false) => {
  // 如果正在重试中，直接返回
  if (isRetrying.value) {
    return
  }

  // 节流：如果距离上次点击不足2秒，忽略本次点击
  if (retryThrottleTimer !== null) {
    return
  }

  // 设置 loading 状态
  isRetrying.value = true

  // 立即更新状态为 downloading，提供即时反馈
  // 清除 error 字段，避免显示警告图标
  downloadStore.updateDownload(props.downloadItem.id, {
    status: DownloadStatus.DOWNLOADING,
    progress: props.downloadItem.progress || 0,
    speed: 0,
    error: undefined
  })

  try {
    // retryDownload 会先尝试恢复现有下载，如果无法恢复才创建新下载
    const result = await retryDownload(props.downloadItem)

    if (result.resumed) {
      // 恢复成功，立即显示成功消息（onChanged 事件会自动更新 store）
      if (!silent) {
        ElMessage.success($t('messageResumeSuccess'))
      }
    } else if (result.newDownloadId && result.oldDownloadId) {
      // 创建了新下载，使用 replaceDownloadById 实现无感替换
      // 先创建临时下载项
      const tempDownloadItem: IDownloadItem = {
        id: result.newDownloadId,
        name: props.downloadItem.name,
        url: props.downloadItem.url,
        path: props.downloadItem.path,
        size: props.downloadItem.size,
        receivedBytes: props.downloadItem.receivedBytes || 0,
        progress: props.downloadItem.progress || 0,
        status: DownloadStatus.DOWNLOADING,
        speed: 0,
        startTime: props.downloadItem.startTime,
        endTime: props.downloadItem.endTime,
        error: undefined,
        mimeType: props.downloadItem.mimeType,
        fileType: props.downloadItem.fileType,
        canResume: undefined
      }

      // 使用 replaceDownloadById 替换，直接更新数组项，避免触发 transition-group 动画
      const replaced = downloadStore.replaceDownloadById(result.oldDownloadId, tempDownloadItem)
      if (!replaced) {
        // 如果替换失败，使用 replaceDownloadByUrl 作为备选方案
        const replacedByUrl = downloadStore.replaceDownloadByUrl(props.downloadItem.url, tempDownloadItem)
        if (!replacedByUrl) {
          // 如果都失败，直接添加
          downloadStore.addDownload(tempDownloadItem)
        }
      }

      // 后续查询真实数据并更新（onChanged 事件也会自动更新，这里作为补充）
      // 使用异步方式，不阻塞 UI
      setTimeout(async() => {
        try {
          const results = await new Promise<chrome.downloads.DownloadItem[]>((resolve, reject) => {
            chrome.downloads.search({ id: result.newDownloadId }, (results: chrome.downloads.DownloadItem[]) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
              } else {
                resolve(results)
              }
            })
          })

          if (results.length > 0 && results[0]) {
            const newDownloadItem = convertChromeDownload(results[0])
            if (newDownloadItem !== null && result.newDownloadId) {
              // 优先使用 replaceDownloadById 更新，避免触发动画
              const replaced = downloadStore.replaceDownloadById(result.newDownloadId, newDownloadItem)
              if (!replaced) {
                // 如果替换失败，使用 replaceDownloadByUrl 作为备选
                const replacedByUrl = downloadStore.replaceDownloadByUrl(props.downloadItem.url, newDownloadItem)
                if (!replacedByUrl) {
                  // 如果都失败，使用 addDownload（可能已经被 onCreated 事件添加了）
                  downloadStore.addDownload(newDownloadItem)
                }
              }
            }
          }
        } catch {
          // 查询失败不影响，onChanged 事件会自动更新
        }
      }, 100)

      if (!silent) {
        ElMessage.success($t('messageRetrySuccess'))
      }
    } else {
      if (!silent) {
        ElMessage.success($t('messageRetrySuccess'))
      }
    }
  } catch (error) {
    console.error('Retry download error:', error)
    if (!silent) {
      ElMessage.error($t('messageRetryFailed'))
    } else {
      throw error
    }
  } finally {
    isRetrying.value = false

    retryThrottleTimer = window.setTimeout(() => {
      retryThrottleTimer = null
    }, RETRY_THROTTLE_DELAY)
  }
}

// 复制下载地址
const handleCopyUrl = async() => {
  if (!props.downloadItem.url) {
    return
  }

  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(props.downloadItem.url)
      ElMessage.success($t('messageCopySuccess'))
      return
    }

    // 降级方案：使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = props.downloadItem.url
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (successful) {
      ElMessage.success($t('messageCopySuccess'))
    } else {
      ElMessage.error($t('messageCopyFailed'))
    }
  } catch {
    ElMessage.error($t('messageCopyFailed'))
  }
}

const handleOpenFile = async() => {
  try {
    await openFile(props.downloadItem.id)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '无法打开文件，文件可能已被删除或移动'
    ElMessage.error(errorMessage)
  }
}

const handleOpenFolder = async() => {
  try {
    await openFolder(props.downloadItem.id)
  } catch {
    ElMessage.error('Failed to open folder')
  }
}

const handleCommand = async(command: string) => {
  if (command === 'cancel') {
    try {
      await cancelDownload(props.downloadItem.id)
      ElMessage.success($t('messageCancelSuccess'))
    } catch {
      ElMessage.error('Failed to cancel')
    }
  } else if (command === 'deleteRecord') {
    // 只删除记录，不删除文件（不需要二次确认）
    try {
      await deleteDownloadRecord(props.downloadItem.id)
      downloadStore.removeDownload(props.downloadItem.id)
      ElMessage.success($t('messageDeleteSuccess'))
    } catch {
      ElMessage.error($t('messageDeleteFailed'))
    }
  } else if (command === 'deleteFileAndRecord') {
    // 删除文件和记录（需要确认，因为会删除文件）
    try {
      await ElMessageBox.confirm(
        $t('messageDeleteFileAndRecordConfirm'),
        $t('commonDelete'),
        {
          type: 'warning',
          confirmButtonText: $t('commonConfirm'),
          cancelButtonText: $t('commonCancel'),
          buttonSize: 'default'
        }
      )
      await deleteDownloadFileAndRecord(props.downloadItem.id)
      downloadStore.removeDownload(props.downloadItem.id)
      ElMessage.success($t('messageDeleteSuccess'))
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error($t('messageDeleteFailed'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.download-item {
  padding: 8px 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  &.status-downloading {
    border-left: 3px solid $info-color;
  }

  &.status-completed {
    border-left: 3px solid $success-color;
  }

  &.status-paused {
    border-left: 3px solid $warning-color;
  }

  &.status-failed {
    border-left: 3px solid $error-color;
  }

  &.status-cancelled {
    border-left: 3px solid $warning-color;
  }

  // 文件已删除的特殊样式
  &.file-deleted {
    background: rgba($error-color, 0.08);
    opacity: 0.7;
    border-left: 3px solid rgba(128, 128, 128, 0.6); // 灰色边框

    &:hover {
      background: rgba($error-color, 0.12);
      opacity: 0.85;
      border-left-color: rgba(128, 128, 128, 0.8); // hover 时稍微加深
    }
  }

  // 确保内容在进度背景之上
  .item-main {
    position: relative;
    z-index: 1;
  }
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-main-top {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

</style>

