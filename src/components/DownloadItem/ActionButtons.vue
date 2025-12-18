<template>
  <div class="item-actions">
    <!-- 下载中/暂停/失败状态的操作 -->
    <div
      v-if="downloadItem.status !== 'completed'"
      class="actions-row"
    >
      <ElTooltip
        v-if="downloadItem.status === 'downloading'"
        :content="$t('downloadPauseDownload')"
        placement="top"
      >
        <el-button
          size="small"
          circle
          :icon="VideoPause"
          @click="$emit('pause')"
        />
      </ElTooltip>

      <!-- 暂停状态：根据 canResume 决定显示继续下载还是重新下载 -->
      <ElTooltip
        v-if="downloadItem.status === 'paused' && downloadItem.canResume === true"
        :content="$t('downloadResumeDownload')"
        placement="top"
      >
        <el-button
          size="small"
          type="primary"
          circle
          :icon="VideoPlay"
          @click="$emit('resume')"
        />
      </ElTooltip>

      <ElTooltip
        v-if="downloadItem.status === 'paused' && downloadItem.canResume !== true"
        :content="$t('downloadRedownload')"
        placement="top"
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
      </ElTooltip>

      <!-- 失败状态：重试下载 -->
      <ElTooltip
        v-if="downloadItem.status === 'failed'"
        :content="$t('downloadRetryDownload')"
        placement="top"
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
      </ElTooltip>

      <!-- 取消状态：重新下载 -->
      <ElTooltip
        v-if="downloadItem.status === 'cancelled'"
        :content="$t('downloadRedownload')"
        placement="top"
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
      </ElTooltip>

      <!-- 复制下载地址 -->
      <ElTooltip
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
      </ElTooltip>

      <ElTooltip
        :content="$t('commonDelete')"
        placement="top"
      >
        <el-dropdown
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
              <el-dropdown-item command="cancel">
                {{ $t('downloadCancelDownload') }}
              </el-dropdown-item>
              <el-dropdown-item command="deleteRecord">
                {{ $t('downloadDeleteRecord') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </ElTooltip>
    </div>

    <!-- 已完成状态的操作 -->
    <div
      v-if="downloadItem.status === 'completed'"
      class="actions-row"
    >
      <!-- 文件已删除：显示重新下载按钮 -->
      <template v-if="isFileDeleted">
        <ElTooltip
          :content="$t('downloadRedownload')"
          placement="top"
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
        </ElTooltip>
      </template>

      <!-- 文件存在：显示打开文件夹和打开文件按钮 -->
      <template v-else>
        <ElTooltip
          :content="$t('downloadOpenFolder')"
          placement="top"
        >
          <el-button
            size="small"
            circle
            :icon="FolderOpened"
            @click="$emit('openFolder')"
          />
        </ElTooltip>

        <ElTooltip
          :content="$t('downloadOpenFile')"
          placement="top"
        >
          <el-button
            size="small"
            circle
            :icon="Document"
            @click="$emit('openFile')"
          />
        </ElTooltip>
      </template>

      <!-- 复制下载地址 -->
      <ElTooltip
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
      </ElTooltip>

      <ElTooltip
        :content="$t('commonDelete')"
        placement="top"
      >
        <el-dropdown
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
              <el-dropdown-item
                v-if="!isFileDeleted"
                command="deleteFileAndRecord"
              >
                {{ $t('downloadDeleteFileAndRecord') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </ElTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElTooltip } from 'element-plus'
import {
  VideoPause,
  VideoPlay,
  Refresh,
  FolderOpened,
  Document,
  Delete,
  CopyDocument
} from '@element-plus/icons-vue'
import type { DownloadItem } from '@/types/download'
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
}>()

const { t: $t } = useI18n()

// 检查文件是否已删除
const isFileDeleted = computed(() => {
  return props.downloadItem.status === 'completed' && props.downloadItem.exists === false
})
</script>

<style lang="scss" scoped>
.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

