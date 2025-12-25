<template>
  <div class="filter-bar">
    <div class="filter-group">
      <el-select
        :modelValue="filterStatus || ''"
        :placeholder="$t('downloadFilterByStatus')"
        clearable
        style="width: 130px"
        @update:modelValue="$emit('update:filterStatus', $event || '')"
      >
        <el-option
          :label="$t('downloadAll')"
          value=""
        />
        <el-option
          :label="$t('downloadDownloading')"
          value="downloading"
        />
        <el-option
          :label="$t('downloadCompleted')"
          value="completed"
        />
        <el-option
          :label="$t('downloadPaused')"
          value="paused"
        />
        <el-option
          :label="$t('downloadFailed')"
          value="failed"
        />
        <el-option
          :label="$t('downloadDeleted')"
          value="deleted"
        />
      </el-select>

      <el-select
        :modelValue="filterFileType || ''"
        :placeholder="$t('downloadFilterByType')"
        clearable
        style="width: 130px"
        @update:modelValue="$emit('update:filterFileType', $event || '')"
      >
        <el-option
          :label="$t('downloadAll')"
          value=""
        />
        <el-option
          :label="$t('downloadFileTypeImage')"
          value="image"
        />
        <el-option
          :label="$t('downloadFileTypeVideo')"
          value="video"
        />
        <el-option
          :label="$t('downloadFileTypeDocument')"
          value="document"
        />
        <el-option
          :label="$t('downloadFileTypeAudio')"
          value="audio"
        />
        <el-option
          :label="$t('downloadFileTypeOther')"
          value="file"
        />
      </el-select>

      <el-select
        :modelValue="filterTimeRange || ''"
        :placeholder="$t('downloadFilterByTime')"
        clearable
        style="width: 120px"
        @update:modelValue="$emit('update:filterTimeRange', $event || '')"
      >
        <el-option
          :label="$t('downloadAll')"
          value=""
        />
        <el-option
          :label="$t('downloadTimeRangeToday')"
          value="today"
        />
        <el-option
          :label="$t('downloadTimeRangeYesterday')"
          value="yesterday"
        />
        <el-option
          :label="$t('downloadTimeRangeThisWeek')"
          value="this_week"
        />
        <el-option
          :label="$t('downloadTimeRangeThisMonth')"
          value="this_month"
        />
        <el-option
          :label="$t('downloadTimeRangeThisYear')"
          value="this_year"
        />
        <el-option
          :label="$t('downloadTimeRangeOlder')"
          value="older"
        />
      </el-select>

      <el-select
        :modelValue="filterSizeRange || ''"
        :placeholder="$t('downloadFilterBySize')"
        clearable
        style="width: 130px"
        @update:modelValue="$emit('update:filterSizeRange', $event || '')"
      >
        <el-option
          :label="$t('downloadAll')"
          value=""
        />
        <el-option
          :label="$t('downloadSizeRangeSmall')"
          value="small"
        />
        <el-option
          :label="$t('downloadSizeRangeMedium')"
          value="medium"
        />
        <el-option
          :label="$t('downloadSizeRangeLarge')"
          value="large"
        />
        <el-option
          :label="$t('downloadSizeRangeVeryLarge')"
          value="very_large"
        />
      </el-select>

      <el-select
        :modelValue="filterFileExists || ''"
        :placeholder="$t('downloadFilterByExists')"
        clearable
        style="width: 120px"
        @update:modelValue="$emit('update:filterFileExists', $event || '')"
      >
        <el-option
          :label="$t('downloadAll')"
          value=""
        />
        <el-option
          :label="$t('downloadFileExists')"
          value="true"
        />
        <el-option
          :label="$t('downloadFileDeleted')"
          value="false"
        />
      </el-select>
    </div>

    <div class="sort-group">
      <el-select
        :modelValue="sortBy"
        style="width: 100px"
        @update:modelValue="$emit('update:sortBy', $event)"
      >
        <el-option
          :label="$t('downloadSortByTime')"
          value="time"
        />
        <el-option
          :label="$t('downloadSortBySize')"
          value="size"
        />
        <el-option
          :label="$t('downloadSortByName')"
          value="name"
        />
      </el-select>
      <el-tooltip
        :content="
          sortOrder === 'asc' ? $t('downloadSortOrderAsc') : $t('downloadSortOrderDesc')
        "
        placement="top"
        :showAfter="600"
      >
        <el-button
          class="sort-order-btn"
          @click="$emit('toggleSortOrder')"
        >
          <el-icon
            class="sort-icon"
            :class="{ 'sort-asc': sortOrder === 'asc', 'sort-desc': sortOrder === 'desc' }"
          >
            <Sort />
          </el-icon>
        </el-button>
      </el-tooltip>
      <!-- 分页/滚动加载切换按钮 - 仅图标，放在最右侧 -->
      <el-tooltip
        :content="useScrollLoad ? $t('switchToPagination') : $t('switchToScrollLoad')"
        placement="top"
        :showAfter="600"
      >
        <el-button
          class="switch-mode-btn"
          @click="$emit('toggleLoadMode')"
        >
          <el-icon>
            <Document v-if="useScrollLoad" />
            <List v-else />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Sort, Document, List } from '@element-plus/icons-vue'

defineProps<{
  filterStatus: string
  filterFileType: string
  filterTimeRange: string
  filterSizeRange: string
  filterFileExists: string
  sortBy: string
  sortOrder: string
  useScrollLoad: boolean
}>()

defineEmits<{
  'update:filterStatus': [value: string]
  'update:filterFileType': [value: string]
  'update:filterTimeRange': [value: string]
  'update:filterSizeRange': [value: string]
  'update:filterFileExists': [value: string]
  'update:sortBy': [value: string]
  toggleSortOrder: []
  toggleLoadMode: []
}>()

const { t: $t } = useI18n()
</script>

<style lang="scss" scoped>
.filter-bar {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);
  min-height: 40px;
  position: relative;
  z-index: 9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;

  // 隐藏滚动条但保持滚动功能
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE/Edge

  &::-webkit-scrollbar {
    display: none; // Chrome/Safari
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    flex-shrink: 0;
  }

  .sort-group {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  // 下拉选择框样式
  :deep(.el-select) {
    .el-select__wrapper {
      min-height: 28px;
      height: 28px;
      padding: 0 10px;
      background: var(--el-bg-color-page);
      border: 1px solid var(--el-border-color);
      border-radius: $radius-sm;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

      &:hover {
        background: var(--el-fill-color-light);
        border-color: var(--el-color-primary-light-7);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
      }

      &.is-focused {
        background: var(--el-fill-color-light);
        border-color: var(--el-color-primary);
        box-shadow: none;
        outline: none;
      }
    }

    // placeholder 文本字体大小
    .el-select__placeholder {
      font-size: 12px;
    }

    .el-select__selected-item {
      font-size: 12px;
      line-height: 28px;
      // 不强制设置颜色，使用 Element Plus 默认颜色
      font-weight: 500;
    }

    .el-select__caret {
      font-size: 12px;

    }
  }

  // 按钮样式（排除图标按钮）
  :deep(.el-button:not(.switch-mode-btn):not(.sort-order-btn)) {
    padding: 5px 12px;
    height: 28px;
    font-size: 12px;
    border-radius: $radius-sm;
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color);
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-primary-light-7);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    }

    &:active {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
  }

  .switch-mode-btn {
    width: 28px !important;
    height: 28px !important;
    padding: 0 !important;
    margin-left: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: var(--el-text-color-regular) !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    border-radius: $radius-sm !important;
    min-width: 28px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;

    :deep(.el-button__inner) {
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      height: 100% !important;
      line-height: 1 !important;
    }

    :deep(.el-icon) {
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 16px !important;
    }

    &:hover {
      background: var(--el-fill-color-light) !important;
      color: var(--el-color-primary) !important;
      transform: scale(1.05) !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }

    &:active {
      transform: scale(0.95) !important;
    }
  }

  .sort-order-btn {
    width: 28px !important;
    height: 28px !important;
    padding: 0 !important;
    margin-left: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: var(--el-text-color-regular) !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    border-radius: $radius-sm !important;
    min-width: 28px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;

    :deep(.el-button__inner) {
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      height: 100% !important;
      line-height: 1 !important;
    }

    :deep(.el-icon) {
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    &:hover {
      background: var(--el-fill-color-light) !important;
      color: var(--el-color-primary) !important;
      transform: scale(1.05) !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }

    &:active {
      transform: scale(0.95) !important;
    }

    .sort-icon {
      font-size: 16px !important;
      transition: transform 0.2s ease !important;

      &.sort-asc {
        transform: rotate(180deg) !important;
      }

      &.sort-desc {
        transform: rotate(0deg) !important;
      }
    }
  }
}
</style>

