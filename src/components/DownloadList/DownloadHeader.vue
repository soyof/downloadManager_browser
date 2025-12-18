<template>
  <div class="header">
    <div class="header-left">
      <h1 class="title">
        {{ $t('downloadTitle') }}
      </h1>
      <div class="stats">
        <span class="stat-item">
          {{ $t('downloadDownloading') }}: <strong class="stat-number stat-downloading">{{ stats.downloading }}</strong>
        </span>
        <span class="stat-item">
          {{ $t('downloadCompleted') }}: <strong class="stat-number stat-completed">{{ stats.completed }}</strong>
        </span>
      </div>
    </div>
    <div class="header-right">
      <el-input
        v-model="localSearchText"
        :placeholder="$t('downloadSearchPlaceholder')"
        class="search-input"
        clearable
        @input="$emit('search', localSearchText)"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- 主题、语言和设置图标按钮 -->
      <div class="settings-controls">
        <!-- 主题选择器（图标） -->
        <el-tooltip
          :content="$t('settingsTheme')"
          placement="bottom"
        >
          <el-dropdown
            trigger="click"
            @command="$emit('themeChange', $event)"
          >
            <el-button
              :icon="Brush"
              circle
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  command="minimal-white"
                  :class="{ 'is-active': currentTheme === 'minimal-white' }"
                >
                  明亮现代
                </el-dropdown-item>
                <el-dropdown-item
                  command="tech-blue"
                  :class="{ 'is-active': currentTheme === 'tech-blue' }"
                >
                  科技蓝
                </el-dropdown-item>
                <el-dropdown-item
                  command="cyber-purple"
                  :class="{ 'is-active': currentTheme === 'cyber-purple' }"
                >
                  数字薰衣草
                </el-dropdown-item>
                <el-dropdown-item
                  command="nature-green"
                  :class="{ 'is-active': currentTheme === 'nature-green' }"
                >
                  自然绿色
                </el-dropdown-item>
                <el-dropdown-item
                  command="dark-night"
                  :class="{ 'is-active': currentTheme === 'dark-night' }"
                >
                  柔和深色
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>

        <!-- 语言选择器（图标） -->
        <el-tooltip
          :content="$t('settingsLanguage')"
          placement="bottom"
        >
          <el-dropdown
            trigger="click"
            @command="$emit('localeChange', $event)"
          >
            <el-button
              :icon="ChatLineRound"
              circle
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  command="zh_CN"
                  :class="{ 'is-active': currentLocale === 'zh_CN' }"
                >
                  简体中文
                </el-dropdown-item>
                <el-dropdown-item
                  command="zh_TW"
                  :class="{ 'is-active': currentLocale === 'zh_TW' }"
                >
                  繁體中文
                </el-dropdown-item>
                <el-dropdown-item
                  command="en"
                  :class="{ 'is-active': currentLocale === 'en' }"
                >
                  English
                </el-dropdown-item>
                <el-dropdown-item
                  command="ja"
                  :class="{ 'is-active': currentLocale === 'ja' }"
                >
                  日本語
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>

        <!-- 设置按钮（仅图标） -->
        <el-tooltip
          :content="$t('commonSettings')"
          placement="bottom"
        >
          <el-button
            :icon="Setting"
            circle
            @click="$emit('openSettings')"
          />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Setting, Brush, ChatLineRound } from '@element-plus/icons-vue'
import type { ThemeName } from '@/utils/theme'
import type { Locale } from '@/i18n/types'

const props = defineProps<{
  stats: {
    downloading: number
    completed: number
  }
  searchText: string
  currentTheme: ThemeName
  currentLocale: Locale
}>()

defineEmits<{
  search: [text: string]
  themeChange: [theme: ThemeName]
  localeChange: [locale: Locale]
  openSettings: []
}>()

const { t: $t } = useI18n()
const localSearchText = ref(props.searchText)

watch(() => props.searchText, (newVal) => {
  localSearchText.value = newVal
})
</script>

<style lang="scss" scoped>
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
    flex: 0 0 auto;

    .search-input {
      width: 200px;
      flex-shrink: 0;
    }

    .settings-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  }
}

// 下拉菜单激活项样式
:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
</style>

