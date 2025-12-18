<template>
  <div class="item-info">
    <div class="file-icon">
      {{ fileIcon }}
    </div>
    <div class="file-info">
      <div
        class="file-name"
        :title="downloadItem.name"
      >
        {{ downloadItem.name }}
        <!-- 文件已删除标识 -->
        <ElTooltip
          v-if="isFileDeleted"
          :content="fileDeletedMessage"
          placement="top"
          :popperStyle="{ maxWidth: '300px' }"
        >
          <span class="deleted-indicator">🗑️</span>
        </ElTooltip>
        <!-- 错误指示器（仅在hover时显示详情） -->
        <ElTooltip
          v-if="downloadItem.error"
          :content="errorMessage"
          placement="top"
          :popperStyle="{ maxWidth: '300px' }"
        >
          <span class="error-indicator">⚠️</span>
        </ElTooltip>
      </div>
      <!-- 下载中的详细信息 -->
      <div
        v-if="downloadItem.status === 'downloading'"
        class="download-details"
      >
        <span>{{ formatSpeed(downloadItem.speed) }}</span>
        <span> - {{ formatFileSize(downloadItem.receivedBytes) }}</span>
        <span> / {{ formatFileSize(downloadItem.size) }}</span>
        <span> | {{ remainingTimeText }}</span>
      </div>
      <!-- 非下载中的基本信息 -->
      <div
        v-else
        class="file-meta"
      >
        <span>{{ formatFileSize(downloadItem.size) }}</span>
        <span>· {{ formatTime(downloadItem.startTime) }}</span>
        <span
          v-if="downloadItem.path"
          class="file-path-inline"
          :title="downloadItem.path"
        >
          · 📁 {{ directoryPath }}
        </span>
      </div>
      <!-- 操作按钮 -->
      <div class="file-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElTooltip } from 'element-plus'
import { useI18n } from 'vue-i18n'
import type { DownloadItem } from '@/types/download'
import { formatFileSize, formatSpeed, formatTime } from '@/utils/download'

const props = defineProps<{
  downloadItem: DownloadItem
  fileIcon: string
  errorMessage: string
  remainingTimeText: string
  directoryPath: string
}>()

const { t } = useI18n()

// 检查文件是否已删除
const isFileDeleted = computed(() => {
  return props.downloadItem.status === 'completed' && props.downloadItem.exists === false
})

const fileDeletedMessage = computed(() => t('downloadFileDeleted'))
</script>

<style lang="scss" scoped>
.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 32px;
  flex-shrink: 0;
  line-height: 1;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-actions {
  display: flex;
  align-items: center;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;

  .error-indicator,
  .deleted-indicator {
    flex-shrink: 0;
    font-size: 14px;
  }

  .deleted-indicator {
    opacity: 0.8;
  }
}

.file-meta,
.download-details {
  font-size: 12px;
  color: $text-secondary;
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  flex-wrap: nowrap; // 防止换行
  align-items: center;
  line-height: 1.4;
  min-height: 16.8px; // 固定最小高度：12px * 1.4 = 16.8px
  height: 16.8px; // 固定高度，防止变化
  overflow: hidden; // 防止内容溢出

  span {
    white-space: nowrap;
    flex-shrink: 0; // 防止文本收缩
  }
}

.file-path-inline {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

