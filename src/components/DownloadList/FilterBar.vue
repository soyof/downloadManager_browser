<template>
  <div class="filter-bar">
    <div class="filter-group">
      <el-select
        :modelValue="filterStatus"
        :placeholder="$t('downloadFilterByStatus')"
        clearable
        style="width: 150px"
        @update:modelValue="$emit('update:filterStatus', $event)"
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
      </el-select>

      <el-select
        :modelValue="filterFileType"
        :placeholder="$t('downloadFilterByType')"
        clearable
        style="width: 150px; margin-left: 12px"
        @update:modelValue="$emit('update:filterFileType', $event)"
      >
        <el-option
          :label="$t('downloadAll')"
          value=""
        />
        <el-option
          label="图片"
          value="image"
        />
        <el-option
          label="视频"
          value="video"
        />
        <el-option
          label="文档"
          value="document"
        />
        <el-option
          label="音频"
          value="audio"
        />
        <el-option
          label="其他"
          value="file"
        />
      </el-select>
    </div>

    <div class="sort-group">
      <el-select
        :modelValue="sortBy"
        style="width: 120px"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Sort } from '@element-plus/icons-vue'

defineProps<{
  filterStatus: string
  filterFileType: string
  sortBy: string
  sortOrder: string
}>()

defineEmits<{
  'update:filterStatus': [value: string]
  'update:filterFileType': [value: string]
  'update:sortBy': [value: string]
  toggleSortOrder: []
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

  .filter-group,
  .sort-group {
    display: flex;
    align-items: center;
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

    .el-select__placeholder {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    .el-select__selected-item {
      font-size: 12px;
      line-height: 28px;
    }

    .el-select__caret {
      font-size: 12px;
    }
  }

  // 按钮样式
  :deep(.el-button) {
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

  .sort-order-btn {
    width: 28px;
    height: 28px;
    padding: 0 !important;
    margin-left: 6px;
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color);
    color: var(--el-text-color-regular);
    transition: all 0.2s ease;
    border-radius: $radius-sm;
    min-width: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

    :deep(.el-button__inner) {
      padding: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      line-height: 1;
    }

    :deep(.el-icon) {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-primary-light-7);
      color: var(--el-color-primary);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .sort-icon {
      font-size: 14px;
      transition: transform 0.2s ease;

      &.sort-asc {
        transform: rotate(180deg);
      }

      &.sort-desc {
        transform: rotate(0deg);
      }
    }
  }
}
</style>

