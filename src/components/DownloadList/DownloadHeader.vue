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
          :showAfter="600"
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
                  v-for="theme in themeList"
                  :key="theme.name"
                  :command="theme.name"
                  :class="{ 'is-active': currentTheme === theme.name }"
                >
                  {{ theme.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>

        <!-- 语言选择器（图标） -->
        <el-tooltip
          :content="$t('settingsLanguage')"
          placement="bottom"
          :showAfter="600"
        >
          <el-dropdown
            trigger="click"
            @command="$emit('localeChange', $event)"
          >
            <el-button
              circle
            >
              <i class="iconfont icon-language_change"></i>
            </el-button>
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
                <el-dropdown-item
                  command="ru"
                  :class="{ 'is-active': currentLocale === 'ru' }"
                >
                  Русский
                </el-dropdown-item>
                <el-dropdown-item
                  command="ko"
                  :class="{ 'is-active': currentLocale === 'ko' }"
                >
                  한국어
                </el-dropdown-item>
                <el-dropdown-item
                  command="fr"
                  :class="{ 'is-active': currentLocale === 'fr' }"
                >
                  Français
                </el-dropdown-item>
                <el-dropdown-item
                  command="es"
                  :class="{ 'is-active': currentLocale === 'es' }"
                >
                  Español
                </el-dropdown-item>
                <el-dropdown-item
                  command="de"
                  :class="{ 'is-active': currentLocale === 'de' }"
                >
                  Deutsch
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>

        <!-- 设置按钮（仅图标） -->
        <el-tooltip
          :content="$t('commonSettings')"
          placement="bottom"
          :showAfter="600"
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
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Setting, Brush } from '@element-plus/icons-vue'
import { getThemeList } from '@/utils/theme'
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
const themeList = computed(() => getThemeList())

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

// 下拉菜单激活项样式
:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
</style>

