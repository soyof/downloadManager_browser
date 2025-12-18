/**
 * 消息监听器
 */

import { convertChromeDownload } from '../utils/converter'
import { updateBadge } from '../utils/badge'

/**
 * 初始化消息监听器
 */
export const initMessageListeners = () => {
  chrome.runtime.onMessage.addListener(
    (message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (message.type === 'GET_DOWNLOADS') {
        // 获取所有下载记录
        chrome.downloads.search({}, (results: chrome.downloads.DownloadItem[]) => {
          const downloads = results.map(convertChromeDownload).filter((item): item is NonNullable<typeof item> => item !== null)
          sendResponse({ success: true, data: downloads })
        })
        return true // 异步响应
      }

      if (message.type === 'GET_DOWNLOAD') {
        // 获取单个下载记录
        chrome.downloads.search({ id: message.downloadId }, (results: chrome.downloads.DownloadItem[]) => {
          if (results.length > 0 && results[0]) {
            const download = convertChromeDownload(results[0] as chrome.downloads.DownloadItem)
            if (download) {
              sendResponse({ success: true, data: download })
            } else {
              sendResponse({ success: false, error: 'Invalid download item' })
            }
          } else {
            sendResponse({ success: false, error: 'Download not found' })
          }
        })
        return true
      }

      if (message.type === 'UPDATE_BADGE') {
        // 手动触发徽章更新
        updateBadge()
        sendResponse({ success: true })
        return true
      }
    }
  )
}

