/**
 * 下载事件监听器
 */

import { updateBadge } from '../utils/badge'
import { getDownloadSettings } from '../utils/settings'

/**
 * 处理下载完成事件
 */
const handleDownloadComplete = async(downloadId: number) => {
  try {
    // 获取下载设置
    const settings = await getDownloadSettings()

    // 获取下载项信息
    chrome.downloads.search({ id: downloadId }, async(results: chrome.downloads.DownloadItem[]) => {
      if (results.length === 0 || !results[0]) {
        console.warn('Download item not found:', downloadId)
        return
      }

      const downloadItem = results[0]

      // 检查下载是否真的完成了（避免重复处理）
      if (downloadItem.state !== 'complete') {
        return
      }

      const fileName = downloadItem.filename.split('/').pop() || downloadItem.filename.split('\\').pop() || '文件'

      if (settings.openFolder === true) {
        try {
          chrome.downloads.show(downloadId)
        } catch (error) {
          console.error('Failed to open folder:', error)
        }
      }

      if (settings.showNotification !== false) {
        try {
          const notificationId = `download-complete-${downloadId}`
          const silent = settings.playSound !== true
          const notificationOptions: chrome.notifications.NotificationCreateOptions = {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon48.png'),
            title: chrome.i18n.getMessage('notificationDownloadComplete'),
            message: chrome.i18n.getMessage('notificationDownloadComplete') + `: "${fileName}"`,
            silent: silent
          }
          await chrome.notifications.create(notificationId, notificationOptions)
        } catch (error) {
          console.error('Failed to show notification:', error)
        }
      }
    })
  } catch (error) {
    console.error('Error handling download completion:', error)
  }
}

/**
 * 处理下载中断事件，尝试自动恢复
 */
const handleDownloadInterrupted = async(downloadDelta: chrome.downloads.DownloadDelta) => {
  // 检查是否从 in_progress 变为 interrupted
  const wasInProgress = downloadDelta.state?.previous === 'in_progress'
  const isInterrupted = downloadDelta.state?.current === 'interrupted'
  const canResume = downloadDelta.canResume?.current === true

  if (wasInProgress && isInterrupted && canResume) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      await chrome.downloads.resume(downloadDelta.id)
    } catch {
      // 自动恢复失败，不抛出错误
    }
  }
}

/**
 * 初始化下载事件监听器
 */
export const initDownloadListeners = () => {
  chrome.downloads.onChanged.addListener(async(downloadDelta: chrome.downloads.DownloadDelta) => {
    updateBadge()

    if (downloadDelta.state && downloadDelta.state.current === 'complete') {
      await handleDownloadComplete(downloadDelta.id)
    }

    if (downloadDelta.state?.current === 'interrupted') {
      await handleDownloadInterrupted(downloadDelta)
    }

    chrome.runtime.sendMessage({
      type: 'DOWNLOAD_CHANGED',
      data: downloadDelta
    }).catch(() => {
      // popup 可能未打开，忽略错误
    })
  })

  chrome.downloads.onCreated.addListener(() => {
    updateBadge()
  })
}

