<template>
  <div class="download-items skeleton-container">
    <div
      v-for="i in count"
      :key="i"
      class="download-item tech-card skeleton-item"
    >
      <div class="item-main">
        <!-- 第一行：文件信息和状态标签 -->
        <div class="item-main-top">
          <!-- 文件信息区域 (item-info) - 完全匹配 FileInfo 组件结构 -->
          <div class="item-info">
            <!-- 文件图标 - 匹配 FileInfo 的 .file-icon -->
            <div class="file-icon skeleton-icon"></div>

            <!-- 文件信息容器 - 匹配 FileInfo 的 .file-info -->
            <div class="file-info">
              <!-- 文件名 - 匹配 FileInfo 的 .file-name -->
              <div class="file-name skeleton-line skeleton-filename"></div>

              <!-- 文件详情 - 匹配 FileInfo 的 .file-meta 或 .download-details -->
              <div class="file-meta skeleton-line skeleton-meta"></div>

              <!-- 操作按钮和来源信息 - 匹配 FileInfo 的 .file-actions-row -->
              <div class="file-actions-row">
                <!-- 操作按钮容器 - 匹配 FileInfo 的 .file-actions -->
                <div class="file-actions skeleton-actions">
                  <div class="skeleton-button"></div>
                  <div class="skeleton-button"></div>
                  <div class="skeleton-button"></div>
                  <div class="skeleton-button"></div>
                </div>
                <!-- 下载来源（可选，骨架屏中不显示） -->
              </div>
            </div>
          </div>

          <!-- 状态标签 - 匹配 StatusBadge 组件 -->
          <div class="skeleton-badge"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  count?: number
}>(), {
  count: 6
})
</script>

<style lang="scss" scoped>
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  align-items: stretch;
}

.skeleton-item {
  padding: 8px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-dark);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--el-box-shadow-light);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(59, 130, 246, 0.2),
      transparent
    );
    animation: skeleton-shimmer 2s infinite;
    z-index: 1;
  }
}


.item-main {
  position: relative;
  z-index: 1;
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

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.skeleton-icon {
  font-size: 32px;
  width: 32px;
  height: 32px;
  line-height: 1;
  flex-shrink: 0;
  background: var(--el-fill-color-darker);
  border-radius: 6px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
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

.skeleton-line {
  border-radius: 4px;
  background: var(--el-fill-color-darker);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border: 1px solid var(--el-border-color-light);

  &.skeleton-filename {
    font-size: 14px;
    font-weight: 500;
    height: 20px; // 14px font-size + 4px margin-bottom + 2px line-height
    width: 60%;
    margin-bottom: 4px;
    background: var(--el-fill-color-darker);
    display: flex;
    align-items: center;
  }

  &.skeleton-meta {
    font-size: 12px;
    height: 16.8px; // 匹配真实数据的固定高度
    min-height: 16.8px;
    width: 50%;
    margin-bottom: 4px;
    background: var(--el-fill-color-dark);
    display: flex;
    align-items: center;
    line-height: 1.4;
  }
}

.file-actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.file-actions {
  display: flex;
  align-items: center;
}

.skeleton-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.skeleton-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-fill-color-darker);
  border: 1px solid var(--el-border-color);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }

  &:nth-child(4) {
    animation-delay: 0.6s;
  }
}

.skeleton-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  min-width: 60px;
  height: 20px;
  background: var(--el-fill-color-darker);
  border: 1px solid var(--el-border-color);
  flex-shrink: 0;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  animation-delay: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes skeleton-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 深色主题适配
[data-theme='dark-night'],
[data-theme='deep-space'] {
  .skeleton-item {
    border-color: var(--el-border-color-darker);

    &::before {
      background: linear-gradient(
        90deg,
        transparent,
        rgba(139, 92, 246, 0.3),
        transparent
      );
    }
  }

  .skeleton-icon,
  .skeleton-line,
  .skeleton-button,
  .skeleton-badge {
    background: var(--el-fill-color-dark);
    border-color: var(--el-border-color-dark);
  }

  .skeleton-line.skeleton-filename {
    background: var(--el-fill-color);
  }
}
</style>
