/**
 * 设置管理工具
 */

/**
 * 获取下载设置
 */
export const getDownloadSettings = async(): Promise<{
  openFolder?: boolean
  showNotification?: boolean
  playSound?: boolean
}> => {
  try {
    // 使用 Promise 包装 chrome.storage.local.get
    const result = await new Promise<{ [key: string]: any }>((resolve, reject) => {
      chrome.storage.local.get('download-manager-settings', (items) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(items)
        }
      })
    })

    const settingsStr = result['download-manager-settings']
    if (settingsStr && typeof settingsStr === 'string') {
      try {
        const settings = JSON.parse(settingsStr) as {
          downloadSettings?: {
            autoOpen?: boolean
            showNotification?: boolean
            openFolder?: boolean
            autoRetry?: boolean
            retryCount?: number
            playSound?: boolean
          }
        }
        if (settings.downloadSettings) {
          let playSound = settings.downloadSettings.playSound
          if (typeof playSound !== 'boolean') {
            playSound = playSound === true || playSound === 'true' || playSound === 1
          }

          let showNotification = settings.downloadSettings.showNotification
          if (typeof showNotification !== 'boolean') {
            showNotification = showNotification !== false
          }

          return {
            openFolder: settings.downloadSettings.openFolder ?? false,
            showNotification: showNotification ?? true,
            playSound: playSound ?? false
          }
        }
      } catch (parseError) {
        console.error('Failed to parse settings:', parseError)
      }
    }
  } catch (error) {
    console.error('Failed to get download settings:', error)
  }

  return {
    openFolder: false,
    showNotification: true,
    playSound: false
  }
}

