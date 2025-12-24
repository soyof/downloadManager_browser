<template>
  <div class="download-list-wrapper">
    <div
      ref="listContainerRef"
      class="download-list"
    >
      <!-- 使用 transition 包裹，优化过渡效果，避免闪烁 -->
      <transition
        name="smooth-fade"
        mode="out-in"
      >
        <!-- Loading 状态 - 骨架屏 -->
        <DownloadSkeleton
          v-if="isLoading"
          key="loading"
          :count="pageSize"
        />

        <!-- 有数据时显示列表 -->
        <transition-group
          v-else-if="downloads.length > 0"
          key="list"
          tag="div"
          class="download-items"
          enterActiveClass="animate__animated animate__fadeInUp"
          leaveActiveClass="animate__animated animate__fadeOutDown"
          moveClass="animate__animated animate__fadeIn"
        >
          <slot
            v-for="item in downloads"
            :key="item.id"
            :item="item"
          ></slot>
        </transition-group>

        <!-- 无数据时显示空状态 -->
        <div
          v-else
          key="empty"
          class="empty-state"
        >
          <div class="empty-icon">
            📥
          </div>
          <div class="empty-text">
            {{ t('downloadEmpty') }}
          </div>
          <div class="empty-desc">
            {{ t('downloadEmptyDesc') }}
          </div>
        </div>
      </transition>
    </div>

    <!-- 分页组件 -->
    <div
      v-if="!isLoading && total > 0 && !useScrollLoad"
      class="pagination-wrapper"
    >
      <el-pagination
        :currentPage="currentPage"
        :pageSize="pageSize"
        :total="total"
        :pageSizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        small
        :hideOnSinglePage="false"
        @currentChange="handlePageChange"
        @sizeChange="handleSizeChange"
      />
    </div>

    <!-- 滚动加载提示 -->
    <div
      v-if="!isLoading && useScrollLoad && hasMoreItems"
      class="scroll-load-hint"
    >
      <div class="hint-text">
        {{ t('scrollLoadMoreHint') }}
      </div>
    </div>

    <!-- 滚动加载完成提示 -->
    <div
      v-if="!isLoading && useScrollLoad && !hasMoreItems && total > 0"
      class="scroll-load-complete"
    >
      <div class="complete-text">
        {{ t('scrollLoadComplete') }}
      </div>
    </div>

    <!-- 滚动到顶部按钮 -->
    <el-backtop
      target=".download-list"
      :visibilityHeight="300"
      :right="12"
      :bottom="50"
    >
      <template #default>
        <el-icon :size="16">
          <Top />
        </el-icon>
      </template>
    </el-backtop>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Top } from '@element-plus/icons-vue'
import type { DownloadItem } from '@/types/download'
import DownloadSkeleton from './DownloadSkeleton.vue'

const props = defineProps<{
  isLoading: boolean
  downloads: DownloadItem[]
  currentPage: number
  pageSize: number
  total: number
  useScrollLoad?: boolean
  hasMoreItems?: boolean
}>()

const emit = defineEmits<{
  pageChange: [page: number]
  sizeChange: [size: number]
  loadMore: []
}>()

const { t } = useI18n()
// eslint-disable-next-line no-undef
const listContainerRef = ref<HTMLElement | null>(null)
const isLoadingMore = ref(false)

const handlePageChange = (page: number) => {
  emit('pageChange', page)
  // 滚动到顶部
  if (listContainerRef.value) {
    listContainerRef.value.scrollTop = 0
  }
}

const handleSizeChange = (size: number) => {
  emit('sizeChange', size)
  // 滚动到顶部
  if (listContainerRef.value) {
    listContainerRef.value.scrollTop = 0
  }
}

// 滚动加载处理
const handleScroll = () => {
  if (!props.useScrollLoad || isLoadingMore.value || !props.hasMoreItems) {
    return
  }

  const container = listContainerRef.value
  if (!container) {
    return
  }

  // 计算滚动位置，当滚动到距离底部 200px 时加载更多
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight
  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  if (distanceToBottom < 200) {
    isLoadingMore.value = true
    emit('loadMore')
    // 延迟重置加载状态，避免频繁触发
    setTimeout(() => {
      isLoadingMore.value = false
    }, 300)
  }
}

// 监听当前页变化，滚动到顶部
watch(() => props.currentPage, () => {
  if (listContainerRef.value && !props.useScrollLoad) {
    listContainerRef.value.scrollTop = 0
  }
})

// 监听滚动加载模式变化，重置滚动位置
watch(() => props.useScrollLoad, () => {
  if (listContainerRef.value) {
    listContainerRef.value.scrollTop = 0
  }
})

onMounted(() => {
  if (listContainerRef.value && props.useScrollLoad) {
    listContainerRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (listContainerRef.value) {
    listContainerRef.value.removeEventListener('scroll', handleScroll)
  }
})

// 监听滚动加载模式变化，添加/移除滚动监听器
watch(() => props.useScrollLoad, (newVal) => {
  if (listContainerRef.value) {
    if (newVal) {
      listContainerRef.value.addEventListener('scroll', handleScroll)
    } else {
      listContainerRef.value.removeEventListener('scroll', handleScroll)
    }
  }
})
</script>

<style lang="scss" scoped>
.download-list-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.download-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.pagination-wrapper {
  padding: 8px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  min-height: 48px;
}

.scroll-load-hint {
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  min-height: 40px;

  .hint-text {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}

.scroll-load-complete {
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  min-height: 40px;

  .complete-text {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    text-align: center;
  }

  :deep(.el-pagination) {
    .el-pagination__total {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .el-pagination__sizes {
      .el-select {
        .el-select__wrapper {
          height: 28px;
          font-size: 13px;
        }
      }
    }

    .btn-prev,
    .btn-next {
      height: 28px;
      width: 28px;
      font-size: 13px;
    }

    .el-pager {
      li {
        height: 28px;
        min-width: 28px;
        font-size: 13px;
        line-height: 28px;
      }
    }

    .el-pagination__jump {
      font-size: 13px;
      color: var(--el-text-color-regular);

      .el-input {
        .el-input__wrapper {
          height: 28px;
          font-size: 13px;
        }
      }
    }
  }
}

.download-items {
  display: flex;
  flex-direction: column;
  gap: 5px; // 每项之间8px间距
  width: 100%;
  align-items: stretch;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 300px;

  .loading-spinner {
    margin-bottom: 16px;

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--el-border-color-lighter);
      border-top-color: var(--el-color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .loading-text {
    font-size: 14px;
    color: $text-secondary;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 300px;
  text-align: center;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 16px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 8px;
  }

  .empty-desc {
    font-size: 14px;
    color: $text-secondary;
  }
}

// 使用 animate.css 动画，自定义动画时长和延迟
:deep(.animate__animated) {
  --animate-duration: 0.3s;
}

:deep(.animate__fadeInUp) {
  --animate-duration: 0.3s;
}

:deep(.animate__fadeOutDown) {
  --animate-duration: 0.2s;
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
}

:deep(.animate__fadeIn) {
  --animate-duration: 0.3s;
}

// 平滑淡入淡出动画 - 优化骨架屏到真实数据的过渡，避免闪烁
.smooth-fade-enter-active {
  transition: opacity 0.15s ease-out;
  will-change: opacity;
}

.smooth-fade-leave-active {
  transition: opacity 0.1s ease-in;
  will-change: opacity;
}

.smooth-fade-enter-from {
  opacity: 0;
}

.smooth-fade-leave-to {
  opacity: 0;
}

// 滚动到顶部按钮样式 - 玻璃效果
:deep(.el-backtop) {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.55);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.25) inset;
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }

  .el-icon {
    color: var(--el-color-primary);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover .el-icon {
    transform: translateY(-2px);
    color: var(--el-color-primary-light-3);
  }
}

// 暗色主题适配
[data-theme="dark-night"] {
  :deep(.el-backtop) {
    background: rgba(96, 165, 250, 0.15);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(96, 165, 250, 0.3);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(96, 165, 250, 0.1) inset;

    &:hover {
      background: rgba(96, 165, 250, 0.25);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(96, 165, 250, 0.2) inset;
      border-color: rgba(96, 165, 250, 0.5);
    }

    &:active {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(96, 165, 250, 0.1) inset;
    }

    .el-icon {
      color: var(--el-color-primary-light-2);
    }

    &:hover .el-icon {
      transform: translateY(-2px);
      color: var(--el-color-primary);
    }
  }
}
</style>
