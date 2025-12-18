/**
 * Vue I18n 配置，兼容 Chrome Extension _locales 目录结构
 */

import { createI18n } from 'vue-i18n'
import type { Locale } from './types'

// 语言代码映射
export const chromeLocaleMap: Record<string, Locale> = {
  'zh-CN': 'zh_CN',
  zh_CN: 'zh_CN',
  'zh-TW': 'zh_TW',
  zh_TW: 'zh_TW',
  'zh-HK': 'zh_TW',
  zh_HK: 'zh_TW',
  en: 'en',
  'en-US': 'en',
  en_US: 'en',
  ja: 'ja',
  'ja-JP': 'ja',
  ja_JP: 'ja'
}

const LOCALE_STORAGE_KEY = 'download-manager-locale'

/**
 * 从 _locales 目录加载翻译文件
 */
const loadMessages = async(locale: Locale): Promise<Record<string, string>> => {
  try {
    const response = await fetch(`/_locales/${locale}/messages.json`)
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.status}`)
    }

    const data = await response.json()

    // 将 Chrome Extension 格式转换为 vue-i18n 格式
    const messages: Record<string, string> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && 'message' in value) {
        messages[key] = (value as { message: string }).message
      }
    }

    return messages
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error)
    return {}
  }
}

/**
 * 获取当前语言
 */
const getCurrentLocale = (): Locale => {
  // 优先从 localStorage 读取用户设置
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
    if (stored && ['zh_CN', 'zh_TW', 'en', 'ja'].includes(stored)) {
      return stored
    }
  }

  // 检测浏览器语言
  if (typeof chrome !== 'undefined' && chrome.i18n) {
    const chromeLocale = chrome.i18n.getUILanguage()
    return chromeLocaleMap[chromeLocale] || chromeLocaleMap[chromeLocale.split('-')[0]] || 'zh_CN'
  }

  const browserLang = navigator.language || (navigator as any).userLanguage
  return chromeLocaleMap[browserLang] || chromeLocaleMap[browserLang.split('-')[0]] || 'zh_CN'
}

/**
 * 初始化 i18n
 */
const initI18n = async() => {
  const currentLocale = getCurrentLocale()

  // 加载所有语言的翻译文件
  const [zh_CN, zh_TW, en, ja] = await Promise.all([
    loadMessages('zh_CN'),
    loadMessages('zh_TW'),
    loadMessages('en'),
    loadMessages('ja')
  ])

  const i18n = createI18n({
    legacy: false, // 使用 Composition API 模式
    locale: currentLocale,
    fallbackLocale: 'zh_CN',
    messages: {
      zh_CN,
      zh_TW,
      en,
      ja
    },
    missingWarn: false,
    fallbackWarn: false
  })

  return i18n
}

// 导出初始化函数和类型
export { initI18n, getCurrentLocale }
export type { Locale }
