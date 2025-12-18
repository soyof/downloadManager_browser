<template>
  <div
    v-if="showProgress"
    class="progress-background"
    :style="{ width: `${progress}%` }"
  >
    <!-- 流动的小点效果 -->
    <div class="flowing-particles">
      <span class="particle particle-1"></span>
      <span class="particle particle-2"></span>
      <span class="particle particle-3"></span>
      <span class="particle particle-4"></span>
      <span class="particle particle-5"></span>
      <span class="particle particle-6"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  status?: string
}>()

// 暂停或下载中时显示进度（即使进度为0也显示，表示有下载任务）
const showProgress = computed(() => {
  return props.progress > 0 || props.status === 'paused' || props.status === 'downloading'
})
</script>

<style lang="scss" scoped>
// 进度背景层 - 渐变汇聚效果（从浅到深），根据主题自适应
.progress-background {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  // 渐变从浅到深，模拟汇聚效果
  // 使用更暗的颜色，确保在深色主题下文本可读
  background: linear-gradient(
    90deg,
    rgba(var(--el-color-primary-rgb), 0.15) 0%,
    rgba(var(--el-color-primary-rgb), 0.25) 30%,
    rgba(var(--el-color-primary-rgb), 0.35) 60%,
    rgba(var(--el-color-primary-rgb), 0.45) 85%,
    rgba(var(--el-color-primary-rgb), 0.55) 100%
  );
  // 使用更平滑的过渡函数，模拟自然运动
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  // 启用硬件加速
  will-change: width;
  transform: translateZ(0);
  backface-visibility: hidden;
  overflow: hidden; // 隐藏超出边界的元素

  // 添加流动的渐变光效，增强汇聚感
  // 在深色主题下使用更暗的光效
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(var(--el-color-primary-rgb), 0.2) 50%,
      transparent 100%
    );
    animation: progress-flow 2s ease-in-out infinite;
    z-index: 1;
  }
}

// 流动光效动画 - 从左到右流动，增强汇聚感
@keyframes progress-flow {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 流动的小点效果层 - 小点从左侧流向右侧（进度条前端）
.flowing-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  // 使用半透明的主色，在深色主题下更暗
  background: rgba(var(--el-color-primary-rgb), 0.6);
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
  // 启用硬件加速
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;

  // 每个小点的动画延迟不同，形成流动效果
  &.particle-1 {
    animation: particle-flow 3s ease-in-out infinite;
    animation-delay: 0s;
    top: 20%;
  }

  &.particle-2 {
    animation: particle-flow 3.5s ease-in-out infinite;
    animation-delay: 0.5s;
    top: 35%;
  }

  &.particle-3 {
    animation: particle-flow 4s ease-in-out infinite;
    animation-delay: 1s;
    top: 50%;
  }

  &.particle-4 {
    animation: particle-flow 3.2s ease-in-out infinite;
    animation-delay: 1.5s;
    top: 65%;
  }

  &.particle-5 {
    animation: particle-flow 3.8s ease-in-out infinite;
    animation-delay: 2s;
    top: 80%;
  }

  &.particle-6 {
    animation: particle-flow 4.2s ease-in-out infinite;
    animation-delay: 2.5s;
    top: 45%;
  }
}

// 小点流动动画 - 从左侧流向右侧（进度条前端）
@keyframes particle-flow {
  0% {
    left: -10px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: calc(100% - 10px);
    opacity: 0;
  }
}
</style>

