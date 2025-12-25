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
              @showDetails="showDetailsDialog = true"
            />
          </template>
        </FileInfo>

        <!-- 状态标签 -->
        <StatusBadge :downloadItem="downloadItem" />
      </div>
    </div>

    <!-- 文件详情弹窗 -->
    <FileDetailsDialog
      v-model:visible="showDetailsDialog"
      :downloadItem="downloadItem"
    />
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
import { useDownloadStore } from '@/store/download'
import { useSettingsStore } from '@/store/settings'
import ProgressBar from './DownloadItem/ProgressBar.vue'
import FileInfo from './DownloadItem/FileInfo.vue'
import ActionButtons from './DownloadItem/ActionButtons.vue'
import StatusBadge from './DownloadItem/StatusBadge.vue'
import FileDetailsDialog from './DownloadItem/FileDetailsDialog.vue'

const props = defineProps<{
  downloadItem: IDownloadItem
}>()

const { t: $t } = useI18n()
const downloadStore = useDownloadStore()
const settingsStore = useSettingsStore()

// 重试操作的 loading 状态
const isRetrying = ref(false)

// 详情弹窗显示状态
const showDetailsDialog = ref(false)

const statusClass = computed(() => `status-${props.downloadItem.status}`)

// 检查文件是否已删除
const isFileDeleted = computed(() => {
  return props.downloadItem.status === DownloadStatus.DELETED
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

  // 注意：不应该更新旧记录的状态，只创建新下载
  // 旧记录应该保持其原有状态（失败或暂停），新下载会通过 onCreated 事件自动添加

  try {
    // 按照浏览器默认逻辑：只创建新下载，让浏览器的 onCreated 和 onChanged 事件自动处理
    await retryDownload(props.downloadItem)

    // 显示成功消息，浏览器事件会自动更新 store
    if (!silent) {
      ElMessage.success($t('messageRetrySuccess'))
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
    // 删除文件和记录（根据设置决定是否需要确认）
    try {
      // 检查是否需要二次确认
      const needConfirm = settingsStore.downloadSettings.confirmDelete ?? true

      if (needConfirm) {
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
      }

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

  // 文件已删除的特殊样式 - 使用禁用状态的色调，更明显
  &.file-deleted {
    // 使用禁用状态的背景色和边框色
    background: var(--el-disabled-bg-color, #f5f7fa);
    border-left: 3px solid var(--el-disabled-border-color, #e4e7ed);

    // 文件名称使用接近正常文本的颜色（regular），保持清晰可读
    // 通过删除线、斜体和背景色来表明已删除状态，而不是通过降低文字颜色
    .file-name {
      color: var(--el-text-color-regular, #374151); // 使用 regular 颜色，接近正常文本，确保清晰可读
      text-decoration: line-through;
      text-decoration-color: var(--el-text-color-regular, #374151);
      font-style: italic;
      opacity: 1; // 完全不透明，确保最佳可读性
    }

    .file-meta,
    .download-details {
      color: var(--el-text-color-secondary, #4b5563); // 使用 secondary 颜色，保持清晰
      opacity: 0.85;
    }

    .file-icon {
      opacity: 0.7;
      filter: grayscale(40%); // 降低灰度滤镜强度，保持可见度
    }

    // 下载来源也使用禁用颜色
    .download-source {
      color: var(--el-text-color-placeholder, #9ca3af);
      opacity: 0.8;

      .source-link {
        color: var(--el-text-color-placeholder, #9ca3af);

        &:hover {
          color: var(--el-text-color-placeholder, #9ca3af);
          text-decoration: underline;
        }
      }
    }

    // 整体稍微降低不透明度，但保持可读性
    opacity: 0.85;

    // 禁用 hover 效果，保持禁用状态
    &:hover {
      background: var(--el-disabled-bg-color, #f5f7fa);
      opacity: 0.9; // hover 时稍微提高一点，但保持禁用感
      border-left-color: var(--el-disabled-border-color, #e4e7ed);
      transform: none; // 移除 hover 时的位移效果
      box-shadow: none; // 移除 hover 时的阴影效果
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

