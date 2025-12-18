<template>
  <div
    v-if="downloadItem.status === 'downloading'"
    class="progress-text"
  >
    {{ downloadItem.progress }}%
  </div>
  <div
    v-else
    class="status-badge"
    :class="`status-${downloadItem.status}`"
  >
    {{ statusText }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DownloadItem } from '@/types/download'
import { DownloadStatus } from '@/types/download'

const props = defineProps<{
  downloadItem: DownloadItem
}>()

const { t: $t } = useI18n()

const statusText = computed(() => {
  const statusMap: Record<DownloadStatus, string> = {
    [DownloadStatus.DOWNLOADING]: $t('downloadDownloading'),
    [DownloadStatus.COMPLETED]: $t('downloadCompleted'),
    [DownloadStatus.PAUSED]: $t('downloadPaused'),
    [DownloadStatus.FAILED]: $t('downloadFailed'),
    [DownloadStatus.CANCELLED]: $t('downloadCancelled')
  }
  const status = props.downloadItem.status as DownloadStatus
  return statusMap[status] || ''
})
</script>

<style lang="scss" scoped>
.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: $text-primary;
  flex-shrink: 0;
}

.status-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;

  &.status-completed {
    background: rgba($success-color, 0.1);
    color: $success-color;
  }

  &.status-paused {
    background: rgba($warning-color, 0.1);
    color: $warning-color;
  }

  &.status-failed {
    background: rgba($error-color, 0.1);
    color: $error-color;
  }

  &.status-cancelled {
    background: rgba($warning-color, 0.1);
    color: $warning-color;
  }
}
</style>

