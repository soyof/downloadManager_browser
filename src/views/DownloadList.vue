<template>
  <div class="download-list-container">
    <!-- 顶部操作栏 -->
    <DownloadHeader
      :stats="stats"
      :searchText="searchText"
      :currentTheme="currentTheme"
      :currentLocale="currentLocale"
      @search="searchText = $event"
      @themeChange="handleThemeChange"
      @localeChange="handleLocaleChange"
      @openSettings="showSettings = true"
    />

    <!-- 筛选栏 -->
    <FilterBar
      :filterStatus="filterStatus"
      :filterFileType="filterFileType"
      :filterTimeRange="filterTimeRange"
      :filterSizeRange="filterSizeRange"
      :filterFileExists="filterFileExists"
      :sortBy="sortBy"
      :sortOrder="sortOrder"
      :useScrollLoad="useScrollLoad"
      @update:filterStatus="filterStatus = $event"
      @update:filterFileType="filterFileType = $event"
      @update:filterTimeRange="filterTimeRange = $event"
      @update:filterSizeRange="filterSizeRange = $event"
      @update:filterFileExists="filterFileExists = $event"
      @update:sortBy="sortBy = $event as SortBy"
      @toggleSortOrder="toggleSortOrder"
      @toggleLoadMode="handleToggleLoadMode"
    />

    <!-- 下载列表 -->
    <DownloadListContent
      :isLoading="downloadStore.isLoading"
      :downloads="displayDownloads"
      :currentPage="downloadStore.currentPage"
      :pageSize="downloadStore.pageSize"
      :total="sortedDownloads.length"
      :useScrollLoad="useScrollLoad"
      :hasMoreItems="downloadStore.hasMoreItems"
      @pageChange="handlePageChange"
      @sizeChange="handleSizeChange"
      @loadMore="handleLoadMore"
    >
      <template #default="{ item }">
        <DownloadItem
          :downloadItem="item"
          class="list-item"
        />
      </template>
    </DownloadListContent>

    <!-- 设置对话框 -->
    <SettingsDialog v-model="showSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDownloadStore } from '@/store/download'
import { useSettingsStore } from '@/store/settings'
import { SortBy, SortOrder } from '@/types/download'
import DownloadItem from '@/components/DownloadItem.vue'
import DownloadHeader from '@/components/DownloadList/DownloadHeader.vue'
import FilterBar from '@/components/DownloadList/FilterBar.vue'
import DownloadListContent from '@/components/DownloadList/DownloadListContent.vue'
import SettingsDialog from '@/components/DownloadList/SettingsDialog.vue'
import type { ThemeName } from '@/utils/theme'
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/i18n/types'

const downloadStore = useDownloadStore()
const settingsStore = useSettingsStore()
const { locale: i18nLocale } = useI18n()

onMounted(() => {
  currentTheme.value = settingsStore.theme
  currentLocale.value = settingsStore.locale
  i18nLocale.value = settingsStore.locale

  // 初始化滚动加载设置
  if (useScrollLoad.value) {
    const initialSize = settingsStore.downloadSettings.scrollLoadInitialSize ?? 10
    downloadStore.resetScrollLoad(initialSize)
  }
})

const searchText = ref('')
const filterStatus = ref<string>('')
const filterFileType = ref<string>('')
const filterTimeRange = ref<string>('')
const filterSizeRange = ref<string>('')
const filterFileExists = ref<string>('')
const sortBy = ref<SortBy>(SortBy.TIME)
const sortOrder = ref<SortOrder>(SortOrder.DESC)
const showSettings = ref(false)

// 主题和语言状态
const currentTheme = ref<ThemeName>(settingsStore.theme)
const currentLocale = ref<Locale>(settingsStore.locale)

// 处理主题变更（实时生效）
const handleThemeChange = (value: ThemeName) => {
  settingsStore.setThemeValue(value)
}

// 处理语言变更（实时生效）
const handleLocaleChange = (value: Locale) => {
  settingsStore.setLocaleValue(value)
}

// 监听 store 中的主题和语言变化
watch(
  () => settingsStore.theme,
  (newTheme: ThemeName) => {
    currentTheme.value = newTheme
  }
)

watch(
  () => settingsStore.locale,
  (newLocale: Locale) => {
    currentLocale.value = newLocale
    // 通过 vue-i18n 切换语言
    i18nLocale.value = newLocale
  }
)

const stats = computed(() => downloadStore.stats)
const sortedDownloads = computed(() => downloadStore.sortedDownloads)
const paginatedDownloads = computed(() => downloadStore.paginatedDownloads)
const scrollLoadDownloads = computed(() => downloadStore.scrollLoadDownloads)

// 根据设置决定使用分页还是滚动加载
const useScrollLoad = computed(() => settingsStore.downloadSettings.useScrollLoad ?? false)

// 显示的下载列表
const displayDownloads = computed(() => {
  return useScrollLoad.value ? scrollLoadDownloads.value : paginatedDownloads.value
})

const handlePageChange = (page: number) => {
  downloadStore.setCurrentPage(page)
}

const handleSizeChange = (size: number) => {
  downloadStore.setPageSize(size)
}

// 监听筛选条件变化
watch([searchText, filterStatus, filterFileType, filterTimeRange, filterSizeRange, filterFileExists], () => {
  downloadStore.setFilterOptions({
    searchText: searchText.value || undefined,
    status: (filterStatus.value as any) || undefined,
    fileType: (filterFileType.value as any) || undefined,
    timeRange: (filterTimeRange.value as any) || undefined,
    sizeRange: (filterSizeRange.value as any) || undefined,
    fileExists: filterFileExists.value !== '' ? filterFileExists.value === 'true' : undefined
  })
})

// 监听滚动加载设置变化
watch(() => settingsStore.downloadSettings.useScrollLoad, (newVal) => {
  if (newVal) {
    const initialSize = settingsStore.downloadSettings.scrollLoadInitialSize ?? 10
    downloadStore.resetScrollLoad(initialSize)
  }
})

// 监听初始大小变化
watch(() => settingsStore.downloadSettings.scrollLoadInitialSize, (newSize) => {
  if (useScrollLoad.value && newSize !== undefined) {
    downloadStore.resetScrollLoad(newSize)
  }
})

// 监听排序变化
watch([sortBy, sortOrder], () => {
  downloadStore.setSortOptions({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value
  })
})

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
}

// 切换加载模式
const handleToggleLoadMode = () => {
  const newMode = !useScrollLoad.value
  settingsStore.updateDownloadSettings({
    useScrollLoad: newMode
  })
  // 重置滚动加载
  if (newMode) {
    const initialSize = settingsStore.downloadSettings.scrollLoadInitialSize ?? 10
    downloadStore.resetScrollLoad(initialSize)
  }
}

// 加载更多（滚动加载）
const handleLoadMore = () => {
  downloadStore.loadMoreItems(10)
}

</script>

<style lang="scss" scoped>
.download-list-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

.header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color);
  border-bottom: none;
  min-height: 56px;
  position: relative;
  z-index: 10;

  // 使用微妙的渐变分隔线，更现代
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 24px;
    right: 24px;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent 0%,
      var(--el-border-color-lighter) 20%,
      var(--el-border-color-lighter) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 0 0 auto;
    min-width: 0;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
      line-height: 1.4;
      white-space: nowrap;
      flex-shrink: 0;
      letter-spacing: -0.01em;
    }

    .stats {
      display: flex;
      gap: 10px;
      font-size: 13px;
      color: $text-secondary;
      flex-shrink: 0;

      .stat-item {
        padding: 4px 12px;
        background: var(--el-fill-color-light);
        border-radius: $radius-md;
        white-space: nowrap;
        transition: all 0.2s ease;

        &:hover {
          background: var(--el-fill-color);
        }

        .stat-number {
          font-weight: 700;
          font-size: 14px;

          &.stat-downloading {
            color: var(--el-color-primary);
          }

          &.stat-completed {
            color: $success-color;
          }
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1 1 auto;
    min-width: 0;
    justify-content: flex-end;

    .search-input {
      width: 300px;
      flex-shrink: 1;
      min-width: 220px;

      // 搜索框样式
      // 使用 box-shadow inset 代替 border，避免影响盒子高度
      :deep(.el-input__wrapper) {
        min-height: 32px;
        height: 32px;
        padding: 0 12px;
        background: var(--el-fill-color-light);
        border: none;
        box-shadow: 0 0 0 1px var(--el-border-color-lighter) inset;
        transition: all 0.2s ease;

        &:hover {
          box-shadow: 0 0 0 1px var(--el-border-color) inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 2px var(--el-color-primary-light-9);
        }
      }

      :deep(.el-input__inner) {
        font-size: 13px;
      }
    }

    .settings-controls {
      display: flex;
      align-items: center;
      gap: 4px;

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

        // 字体图标样式
        .iconfont {
          font-size: 16px;
          line-height: 1;
        }
      }

      :deep(.el-icon) {
        font-size: 16px;
      }
    }
  }
}

// 下拉菜单激活项样式 - 使用 Element Plus CSS 变量
:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

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
        box-shadow: none; // 移除 box-shadow，避免与边框重复
        outline: none; // 移除浏览器默认的 outline
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
    margin-left: 0;
    background: transparent;
    border: none;
    box-shadow: none;
    color: var(--el-text-color-regular);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: $radius-sm;
    min-width: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    // 移除 Element Plus 默认的 padding 和间距
    :deep(.el-button__inner) {
      padding: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      line-height: 1;
    }

    // 确保图标容器没有额外间距
    :deep(.el-icon) {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    .sort-icon {
      font-size: 16px;
      transition: transform 0.2s ease;
      color: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;

      &.sort-asc {
        transform: rotate(180deg);
      }

      &.sort-desc {
        transform: rotate(0deg);
      }
    }

    &:hover .sort-icon {
      color: var(--el-color-primary);

      &.sort-asc {
        transform: rotate(180deg);
      }

      &.sort-desc {
        transform: rotate(0deg);
      }
    }
  }
}

.download-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

// Loading 状态样式
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;

  .loading-spinner {
    margin-bottom: 16px;

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--el-border-color-lighter);
      border-top-color: var(--el-color-primary);
      border-radius: 50%;
      animation: spinner-rotate 0.8s linear infinite;
    }
  }

  .loading-text {
    font-size: 14px;
    color: $text-secondary;
    font-weight: 500;
  }
}

// Spinner 旋转动画
@keyframes spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: $text-secondary;
  width: 100%;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }

  .empty-text {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 8px;
    color: $text-primary;
  }

  .empty-desc {
    font-size: 14px;
  }
}

.download-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative; // 为绝对定位的 leave 动画提供定位上下文
}

// 列表和空状态之间的过渡动画
.fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 列表项动画优化 - 更顺滑的过渡效果
.list-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.list-leave-active {
  transition: all 0.25s cubic-bezier(0.55, 0, 0.55, 0.2);
  position: absolute;
  width: 100%;
  z-index: 1; // 确保离开的元素在其他元素之上
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-15px) scale(0.96);
}

.list-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.list-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.96);
}

.list-move {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>
