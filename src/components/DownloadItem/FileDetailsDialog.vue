<template>
  <el-dialog
    :modelValue="visible"
    :title="$t('downloadFileDetails')"
    width="700px"
    :closeOnClickModal="false"
    appendToBody
    class="file-details-dialog"
    transition="dialog-bounce"
    @update:modelValue="$emit('update:visible', $event)"
  >
    <div class="file-details-content">
      <el-descriptions
        :column="1"
        border
        :labelStyle="{ width: '120px' }"
      >
        <el-descriptions-item :label="$t('downloadStatus')">
          <el-tag :type="getStatusTagType(downloadItem.status)">
            {{ getStatusText(downloadItem.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('downloadFileName')">
          {{ downloadItem.name }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.url"
          :label="$t('downloadUrl')"
        >
          <a
            :href="downloadItem.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ downloadItem.url }}
          </a>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.path"
          :label="$t('downloadFilePath')"
        >
          {{ downloadItem.path }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('downloadFileSize')">
          {{ formatFileSize(downloadItem.size) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.status === 'downloading' || downloadItem.status === 'paused'"
          :label="$t('downloadProgress')"
        >
          {{ downloadItem.progress }}%
          <span
            v-if="downloadItem.size > 0"
            class="progress-detail"
          >
            ({{ formatFileSize(downloadItem.receivedBytes) }} / {{ formatFileSize(downloadItem.size) }})
          </span>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.status === 'downloading'"
          :label="$t('downloadSpeed')"
        >
          {{ formatSpeed(downloadItem.speed) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('downloadStartTime')">
          {{ formatTimeWithSeconds(downloadItem.startTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.endTime"
          :label="$t('downloadEndTime')"
        >
          {{ formatTimeWithSeconds(downloadItem.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.endTime && downloadItem.startTime"
          :label="$t('downloadDuration')"
        >
          {{ formatDuration(downloadItem.endTime - downloadItem.startTime) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('downloadFileType')">
          {{ getFileTypeText(downloadItem.fileType) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.mimeType"
          :label="$t('downloadMimeType')"
        >
          {{ downloadItem.mimeType }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.referrer"
          :label="$t('downloadReferrer')"
        >
          <a
            :href="downloadItem.referrer"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ downloadItem.referrer }}
          </a>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.incognito !== undefined"
          :label="$t('downloadIncognito')"
        >
          {{ downloadItem.incognito ? $t('commonYes') : $t('commonNo') }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.danger"
          :label="$t('downloadDanger')"
        >
          <el-tag :type="getDangerTagType(downloadItem.danger)">
            {{ getDangerText(downloadItem.danger) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.exists !== undefined"
          :label="$t('downloadFileExists')"
        >
          {{ downloadItem.exists ? $t('commonYes') : $t('commonNo') }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.canResume !== undefined && (downloadItem.status === 'paused' || downloadItem.status === 'failed')"
          :label="$t('downloadCanResume')"
        >
          {{ downloadItem.canResume ? $t('commonYes') : $t('commonNo') }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="downloadItem.error"
          :label="$t('downloadError')"
        >
          <el-tag type="danger">
            {{ getErrorText(downloadItem.error) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">
        {{ $t('commonClose') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { DownloadItem } from '@/types/download'
import { DownloadStatus } from '@/types/download'
import { formatFileSize, formatTimeWithSeconds, formatDuration } from '@/utils/download'

const props = defineProps<{
  visible: boolean
  downloadItem: DownloadItem
}>()

defineEmits<{
  'update:visible': [value: boolean]
}>()

const { t: $t } = useI18n()

// 获取文件扩展名
const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return ''
  }
  return filename.substring(lastDot + 1).toLowerCase()
}

// 获取文件类型文本（带扩展名）
const getFileTypeText = (fileType: string): string => {
  const typeMap: Record<string, string> = {
    image: $t('downloadFileTypeImage'),
    video: $t('downloadFileTypeVideo'),
    audio: $t('downloadFileTypeAudio'),
    document: $t('downloadFileTypeDocument'),
    file: $t('downloadFileTypeFile'),
    other: $t('downloadFileTypeOther')
  }
  const typeText = typeMap[fileType] || fileType
  const extension = getFileExtension(props.downloadItem.name)

  if (extension) {
    return `${typeText}（${extension}）`
  }
  return typeText
}

// 获取危险级别文本
const getDangerText = (danger: string): string => {
  const dangerMap: Record<string, string> = {
    safe: $t('downloadDangerSafe'),
    unsafe: $t('downloadDangerUnsafe'),
    user_confirmed: $t('downloadDangerUserConfirmed')
  }
  return dangerMap[danger] || danger
}

// 获取危险级别标签类型
const getDangerTagType = (danger: string): string => {
  const typeMap: Record<string, string> = {
    safe: 'success',
    unsafe: 'danger',
    user_confirmed: 'warning'
  }
  return typeMap[danger] || 'info'
}

// 获取状态文本
const getStatusText = (status: DownloadStatus): string => {
  const statusMap: Record<DownloadStatus, string> = {
    [DownloadStatus.DOWNLOADING]: $t('downloadDownloading'),
    [DownloadStatus.COMPLETED]: $t('downloadCompleted'),
    [DownloadStatus.PAUSED]: $t('downloadPaused'),
    [DownloadStatus.FAILED]: $t('downloadFailed'),
    [DownloadStatus.CANCELLED]: $t('downloadCancelled'),
    [DownloadStatus.DELETED]: $t('downloadFileDeleted')
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status: DownloadStatus): string => {
  const typeMap: Record<DownloadStatus, string> = {
    [DownloadStatus.DOWNLOADING]: 'primary',
    [DownloadStatus.COMPLETED]: 'success',
    [DownloadStatus.PAUSED]: 'warning',
    [DownloadStatus.FAILED]: 'danger',
    [DownloadStatus.CANCELLED]: 'info',
    [DownloadStatus.DELETED]: 'info'
  }
  return typeMap[status] || 'info'
}

// 格式化下载速度
const formatSpeed = (bytesPerSecond: number): string => {
  return `${formatFileSize(bytesPerSecond)}/s`
}

// 获取错误信息文本（将错误代码转换为用户友好的文本）
const getErrorText = (errorCode: string): string => {
  if (!errorCode) {
    return ''
  }

  // Chrome downloads API 的错误代码通常是 "USER_CANCELED" 这样的格式
  // 将其转换为驼峰命名格式的翻译键 "errorUserCanceled"
  const errorCodeUpper = errorCode.toUpperCase()
  // 将 "USER_CANCELED" 转换为 "userCanceled"
  const camelCaseCode = errorCodeUpper
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
  return errorCode
}
</script>

<style lang="scss" scoped>
.file-details-content {
  :deep(.el-descriptions) {
    .el-descriptions__label {
      font-weight: 500;
      width: 80px !important;
      min-width: 80px !important;
      flex-shrink: 0 !important;
      white-space: nowrap;
    }

    .el-descriptions__content {
      word-break: break-all;
      word-wrap: break-word;
      white-space: normal;

      // 链接样式：使用原生 a 标签，允许换行，支持多行下划线
      a {
        color: var(--el-color-primary);
        display: inline;
        word-break: break-all;
        word-wrap: break-word;
        white-space: normal; // 允许换行
        text-decoration: none; // 默认无下划线

        // hover 时显示下划线（浏览器原生支持多行）
        &:hover {
          color: var(--el-color-primary-light-3);
          text-decoration: underline;
        }
      }

      // 进度详情样式
      .progress-detail {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        margin-left: 8px;
      }
    }
  }
}
</style>

