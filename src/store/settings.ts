/**
 * 设置管理 Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DownloadSettings, AppSettings } from '@/types/download'
import { getCurrentTheme, setTheme, type ThemeName } from '@/utils/theme'
import { getCurrentLocale } from '@/i18n'
import type { Locale } from '@/i18n/types'

const SETTINGS_STORAGE_KEY = 'download-manager-settings'

const defaultDownloadSettings: DownloadSettings = {
  openFolder: false,
  showNotification: true,
  playSound: false
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const theme = ref<ThemeName>(getCurrentTheme())
  // Chrome Extension 使用下划线格式：zh_CN
  // 初始化时使用同步方式获取，后续会通过 loadSettings 更新
  const locale = ref<Locale>('zh_CN')
  const downloadSettings = ref<DownloadSettings>({ ...defaultDownloadSettings })

  // 初始化语言
  locale.value = getCurrentLocale()

  // 初始化：从存储加载设置
  const loadSettings = async() => {
    try {
      // 优先从 localStorage 读取（popup 页面）
      let stored = localStorage.getItem(SETTINGS_STORAGE_KEY)

      // 如果 localStorage 没有，尝试从 chrome.storage 读取（background service worker）
      if (!stored && typeof chrome !== 'undefined' && chrome.storage) {
        try {
          const result = await chrome.storage.local.get(SETTINGS_STORAGE_KEY)
          const storedValue = result[SETTINGS_STORAGE_KEY]
          if (typeof storedValue === 'string') {
            stored = storedValue
          }
        } catch (error) {
          console.error('Failed to load settings from chrome.storage:', error)
        }
      }

      if (stored) {
        const settings: AppSettings = JSON.parse(stored)
        theme.value = settings.theme as ThemeName
        locale.value = settings.locale as Locale

        // 合并默认设置和保存的设置
        const loadedSettings = { ...defaultDownloadSettings, ...settings.downloadSettings }

        downloadSettings.value = loadedSettings

        setTheme(theme.value)

        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: stored }).catch(() => {
            // 忽略错误
          })
        }
      } else {
        locale.value = getCurrentLocale()
        downloadSettings.value = { ...defaultDownloadSettings }
        saveSettings()
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      downloadSettings.value = { ...defaultDownloadSettings }
    }
  }

  // 保存设置
  const saveSettings = () => {
    try {
      const settings: AppSettings = {
        theme: theme.value,
        locale: locale.value,
        downloadSettings: downloadSettings.value
      }

      const settingsStr = JSON.stringify(settings)

      localStorage.setItem(SETTINGS_STORAGE_KEY, settingsStr)

      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settingsStr }, () => {
          if (chrome.runtime.lastError) {
            console.error('Failed to save settings to chrome.storage:', chrome.runtime.lastError)
          }
        })
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  // 设置主题
  const setThemeValue = (newTheme: ThemeName) => {
    theme.value = newTheme
    setTheme(newTheme)
    saveSettings()
  }

  // 设置语言
  const setLocaleValue = (newLocale: Locale) => {
    locale.value = newLocale
    // 保存到 localStorage（vue-i18n 会在组件中处理语言切换）
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('download-manager-locale', newLocale)
    }
    saveSettings()
  }

  // 更新下载设置
  const updateDownloadSettings = (updates: Partial<DownloadSettings>) => {
    downloadSettings.value = { ...downloadSettings.value, ...updates }
    saveSettings()
  }

  // 重置设置
  const resetSettings = () => {
    theme.value = getCurrentTheme()
    locale.value = getCurrentLocale()
    downloadSettings.value = { ...defaultDownloadSettings }
    // 保存到 localStorage（vue-i18n 会在组件中处理语言切换）
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('download-manager-locale', locale.value)
    }
    saveSettings()
  }

  return {
    // State
    theme,
    locale,
    downloadSettings,
    // Actions
    loadSettings,
    saveSettings,
    setThemeValue,
    setLocaleValue,
    updateDownloadSettings,
    resetSettings
  }
})
