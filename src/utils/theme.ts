/**
 * 主题管理工具
 * 支持动态切换主题，通过修改 data-theme 属性实现
 */

export type ThemeName = 'tech-blue' | 'cyber-purple' | 'dark-night' | 'minimal-white' | 'nature-green'

const THEME_STORAGE_KEY = 'download-manager-theme'

/**
 * 获取当前主题
 */
export const getCurrentTheme = (): ThemeName => {
  if (typeof document === 'undefined') return 'minimal-white'

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null
  if (stored && isValidTheme(stored)) {
    return stored
  }

  // 默认使用明亮现代主题，不跟随系统
  return 'minimal-white'
}

/**
 * 设置主题
 */
export const setTheme = (theme: ThemeName): void => {
  if (typeof document === 'undefined') return

  if (!isValidTheme(theme)) {
    console.warn(`Invalid theme: ${theme}`)
    return
  }

  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_STORAGE_KEY, theme)

  // 触发主题变更事件
  window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme }}))
}

/**
 * 验证主题名称是否有效
 */
const isValidTheme = (theme: string): theme is ThemeName => {
  return ['tech-blue', 'cyber-purple', 'dark-night', 'minimal-white', 'nature-green'].includes(theme)
}

/**
 * 初始化主题
 */
export const initTheme = (): void => {
  if (typeof document === 'undefined') return

  const theme = getCurrentTheme()
  setTheme(theme)

  // 监听系统主题变化
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // 如果用户没有手动设置主题，则跟随系统
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setTheme(e.matches ? 'dark-night' : 'minimal-white')
      }
    })
  }
}

/**
 * 获取主题列表
 */
export const getThemeList = (): Array<{ name: ThemeName; label: string }> => {
  return [
    { name: 'minimal-white', label: '明亮现代' },
    { name: 'tech-blue', label: '科技蓝' },
    { name: 'cyber-purple', label: '数字薰衣草' },
    { name: 'nature-green', label: '自然绿色' },
    { name: 'dark-night', label: '柔和深色' }
  ]
}

