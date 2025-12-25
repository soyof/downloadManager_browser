<template>
  <div class="item-actions">
    <!-- 下载中/暂停/失败状态的操作 -->
    <div
      v-if="downloadItem.status !== 'completed'"
      class="actions-row"
    >
      <el-tooltip
        v-if="downloadItem.status === 'downloading'"
        :content="$t('downloadPauseDownload')"
        placement="top"
        :showAfter="600"
      >
        <el-button
          size="small"
          circle
          :icon="VideoPause"
          @click="$emit('pause')"
        />
      </el-tooltip>

      <!-- 暂停状态：根据 canResume 决定显示继续下载还是重新下载 -->
      <el-tooltip
        v-if="downloadItem.status === 'paused' && downloadItem.canResume === true"
        :content="$t('downloadResumeDownload')"
        placement="top"
        :showAfter="600"
      >
        <el-button
          size="small"
          type="primary"
          circle
          :icon="VideoPlay"
          @click="$emit('resume')"
        />
      </el-tooltip>

      <el-tooltip
        v-if="downloadItem.status === 'paused' && downloadItem.canResume !== true"
        :content="$t('downloadRedownload')"
        placement="top"
        :showAfter="600"
      >
        <el-button
          size="small"
          type="primary"
          circle
          :icon="Refresh"
          :loading="isRetrying"
          :disabled="isRetrying"
          @click="$emit('retry')"
        />
      </el-tooltip>

      <!-- 失败状态：重试下载 -->
      <el-tooltip
        v-if="downloadItem.status === 'failed'"
        :content="$t('downloadRetryDownload')"
        placement="top"
        :showAfter="600"
      >
        <el-button
          size="small"
          type="primary"
          circle
          :icon="Refresh"
          :loading="isRetrying"
          :disabled="isRetrying"
          @click="$emit('retry')"
        />
      </el-tooltip>

      <!-- 取消状态：重新下载 -->
      <el-tooltip
        v-if="downloadItem.status === 'cancelled'"
        :content="$t('downloadRedownload')"
        placement="top"
        :showAfter="600"
      >
        <el-button
          size="small"
          type="primary"
          circle
          :icon="Refresh"
          :loading="isRetrying"
          :disabled="isRetrying"
          @click="$emit('retry')"
        />
      </el-tooltip>

      <!-- 复制下载地址 -->
      <el-tooltip
        v-if="downloadItem.url"
        :content="downloadItem.url"
        placement="top"
        :popperStyle="{ maxWidth: '400px', wordBreak: 'break-all' }"
        :showAfter="300"
      >
        <el-button
          size="small"
          circle
          :icon="CopyDocument"
          @click="$emit('copyUrl')"
        />
      </el-tooltip>

      <!-- 文件详情：所有状态都显示 -->
      <el-tooltip
        :content="$t('downloadFileDetails')"
        placement="top"
        :showAfter="600"
      >
        <el-button
          size="small"
          circle
          :icon="View"
          @click="$emit('showDetails')"
        />
      </el-tooltip>

      <el-tooltip
        :content="$t('commonDelete')"
        placement="top"
        :showAfter="600"
      >
        <!-- 只有一个选项时，直接点击删除 -->
        <el-button
          v-if="(downloadItem.status !== 'downloading' && downloadItem.status !== 'paused')"
          size="small"
          circle
          :icon="Delete"
          @click="$emit('command', 'deleteRecord')"
        />
        <!-- 多个选项时，显示下拉菜单 -->
        <el-dropdown
          v-else
          trigger="click"
          @command="$emit('command', $event)"
        >
          <el-button
            size="small"
            circle
            :icon="Delete"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 取消下载：只在下载中或暂停状态时显示 -->
              <el-dropdown-item command="cancel">
                {{ $t('downloadCancelDownload') }}
              </el-dropdown-item>
              <el-dropdown-item command="deleteRecord">
                {{ $t('downloadDeleteRecord') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>

    <!-- 已完成状态的操作 -->
    <div
      v-if="downloadItem.status === 'completed'"
      class="actions-row"
    >
      <!-- 文件已删除：显示重新下载按钮 -->
      <template v-if="isFileDeleted">
        <el-tooltip
          :content="$t('downloadRedownload')"
          placement="top"
          :showAfter="600"
        >
          <el-button
            size="small"
            type="primary"
            circle
            :icon="Refresh"
            :loading="isRetrying"
            :disabled="isRetrying"
            @click="$emit('retry')"
          />
        </el-tooltip>
      </template>

      <!-- 文件存在：显示打开文件夹和打开文件按钮 -->
      <template v-else>
        <el-tooltip
          :content="$t('downloadOpenFolder')"
          placement="top"
          :showAfter="600"
        >
          <el-button
            size="small"
            circle
            :icon="FolderOpened"
            @click="$emit('openFolder')"
          />
        </el-tooltip>

        <el-tooltip
          :content="$t('downloadOpenFile')"
          placement="top"
          :showAfter="600"
        >
          <el-button
            size="small"
            circle
            :icon="Document"
            @click="$emit('openFile')"
          />
        </el-tooltip>
      </template>

      <!-- 复制下载地址 -->
      <el-tooltip
        v-if="downloadItem.url"
        :content="downloadItem.url"
        placement="top"
        :popperStyle="{ maxWidth: '400px', wordBreak: 'break-all' }"
        :showAfter="300"
      >
        <el-button
          size="small"
          circle
          :icon="CopyDocument"
          @click="$emit('copyUrl')"
        />
      </el-tooltip>

      <!-- 文件详情：所有状态都显示 -->
      <el-tooltip
        :content="$t('downloadFileDetails')"
        placement="top"
        :showAfter="600"
      >
        <el-button
          size="small"
          circle
          :icon="View"
          @click="$emit('showDetails')"
        />
      </el-tooltip>

      <el-tooltip
        :content="$t('commonDelete')"
        placement="top"
        :showAfter="600"
      >
        <!-- 只有一个选项时（文件已删除），直接点击删除 -->
        <el-button
          v-if="isFileDeleted"
          size="small"
          circle
          :icon="Delete"
          @click="$emit('command', 'deleteRecord')"
        />
        <!-- 多个选项时（文件存在），显示下拉菜单 -->
        <el-dropdown
          v-else
          trigger="click"
          @command="$emit('command', $event)"
        >
          <el-button
            size="small"
            circle
            :icon="Delete"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="deleteRecord">
                {{ $t('downloadDeleteRecord') }}
              </el-dropdown-item>
              <el-dropdown-item command="deleteFileAndRecord">
                {{ $t('downloadDeleteFileAndRecord') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  VideoPause,
  VideoPlay,
  Refresh,
  FolderOpened,
  Document,
  Delete,
  CopyDocument,
  View
} from '@element-plus/icons-vue'
import type { DownloadItem } from '@/types/download'
import { DownloadStatus } from '@/types/download'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  downloadItem: DownloadItem
  isRetrying?: boolean
}>()

defineEmits<{
  pause: []
  resume: []
  retry: []
  copyUrl: []
  openFolder: []
  openFile: []
  command: [command: string]
  showDetails: []
}>()

const { t: $t } = useI18n()

// 检查文件是否已删除
const isFileDeleted = computed(() => {
  return props.downloadItem.status === DownloadStatus.DELETED
})
</script>

<style lang="scss" scoped>
.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;

  // 图标按钮样式 - 无边框现代设计
  :deep(.el-button) {
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: none;
    box-shadow: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--el-text-color-regular);

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    // 主要按钮（type="primary"）保持主题色，但无边框
    &.el-button--primary {
      background: transparent;
      color: var(--el-color-primary);

      &:hover {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &:active {
        background: var(--el-color-primary-light-8);
      }
    }

    // loading 状态保持原样
    &.is-loading {
      pointer-events: none;
    }
  }

  :deep(.el-icon) {
    font-size: 16px;
  }
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>

