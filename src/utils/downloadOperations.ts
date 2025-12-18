/**
 * 下载操作工具函数
 */

import type { DownloadItem } from '@/types/download'
import { resumeDownload } from './downloadControl'

/**
 * 打开文件
 */
export const openFile = async(downloadId: number): Promise<void> => {
  try {
    // 检查权限
    if (!chrome.downloads || typeof chrome.downloads.open !== 'function') {
      throw new Error('下载 API 不可用，请确保扩展已正确安装')
    }

    await chrome.downloads.open(downloadId)
  } catch (error: unknown) {
    console.error('Failed to open file:', error)

    // Chrome API 错误处理
    const chromeError = error as chrome.runtime.LastError
    if (chromeError?.message) {
      // 检查是否是权限错误
      if (chromeError.message.includes('downloads.open') || chromeError.message.includes('permission')) {
        throw new Error('缺少 "downloads.open" 权限。请重新加载扩展程序以应用权限更改。')
      }
      throw new Error(chromeError.message)
    }

    // 通用错误处理
    if (error instanceof Error) {
      // 检查是否是权限相关的错误
      if (error.message.includes('downloads.open') || error.message.includes('permission')) {
        throw new Error('缺少 "downloads.open" 权限。请重新加载扩展程序以应用权限更改。')
      }
      throw error
    }

    throw new Error('无法打开文件，文件可能已被删除或移动')
  }
}

/**
 * 打开文件夹
 */
export const openFolder = async(downloadId: number): Promise<void> => {
  try {
    await chrome.downloads.show(downloadId)
  } catch (error) {
    console.error('Failed to open folder:', error)
    throw error
  }
}

/**
 * 删除下载记录（仅删除记录，不删除文件）
 */
export const deleteDownloadRecord = async(downloadId: number): Promise<void> => {
  try {
    await chrome.downloads.erase({ id: downloadId })
  } catch (error: unknown) {
    console.error('Failed to delete download record:', error)
    const chromeError = error as chrome.runtime.LastError
    if (chromeError?.message) {
      throw new Error(chromeError.message)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('删除记录失败')
  }
}

/**
 * 删除下载文件和记录
 */
export const deleteDownloadFileAndRecord = async(downloadId: number): Promise<void> => {
  try {
    // 先尝试删除文件（如果文件不存在，这个操作可能会失败，但不影响删除记录）
    try {
      await chrome.downloads.removeFile(downloadId)
    } catch (fileError) {
      // 文件可能已经不存在，继续删除记录
      console.warn('File may not exist, continuing to delete record:', fileError)
    }
    // 删除记录
    await chrome.downloads.erase({ id: downloadId })
  } catch (error: unknown) {
    console.error('Failed to delete download file and record:', error)
    const chromeError = error as chrome.runtime.LastError
    if (chromeError?.message) {
      throw new Error(chromeError.message)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('删除文件和记录失败')
  }
}

/**
 * 重试下载
 * 优先尝试恢复现有下载，如果无法恢复则删除原记录并创建新下载
 * 返回：{ resumed: boolean, newDownloadId?: number, oldDownloadId?: number }
 * - resumed: true 表示恢复成功，false 表示创建了新下载
 * - newDownloadId: 如果创建了新下载，返回新下载ID
 * - oldDownloadId: 如果创建了新下载，返回被替换的旧下载ID
 */
/**
 * 从 URL 或路径中提取文件名
 */
const extractFilename = (downloadItem: DownloadItem): string | undefined => {
  // 优先从 path 提取
  if (downloadItem?.path) {
    const pathParts = downloadItem.path.split(/[/\\]/)
    const filename = pathParts[pathParts.length - 1]
    if (filename && filename.trim() !== '' && filename !== 'download') {
      return filename
    }
  }

  // 从 URL 提取
  if (downloadItem.url) {
    try {
      const urlMatch = downloadItem.url.match(/\/([^/]+\.[^/?]+)(?:\?|$)/)
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1]
      }
      // 如果正则匹配失败，尝试简单的路径分割
      const urlParts = downloadItem.url.split('/')
      const lastPart = urlParts[urlParts.length - 1] || ''
      if (lastPart && lastPart.includes('.')) {
        return lastPart.split('?')[0]
      }
    } catch {
      // URL 解析失败，返回 undefined
    }
  }

  return undefined
}

export const retryDownload = async(downloadItem: DownloadItem): Promise<{ resumed: boolean; newDownloadId?: number; oldDownloadId?: number }> => {
  try {
    // 首先尝试恢复现有下载（如果下载项仍然存在且可以恢复）
    if (downloadItem.id) {
      try {
        // 查询下载项，检查是否仍然存在
        const results = await new Promise<chrome.downloads.DownloadItem[]>((resolve, reject) => {
          chrome.downloads.search({ id: downloadItem.id }, (results: chrome.downloads.DownloadItem[]) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError)
            } else {
              resolve(results)
            }
          })
        })

        // 如果下载项存在且可以恢复，尝试恢复
        if (results.length > 0 && results[0]) {
          const existingItem = results[0]

          // 检查状态：如果是暂停或中断状态，且可以恢复
          const isPaused = existingItem.state === 'in_progress' && existingItem.paused
          const isInterrupted = existingItem.state === 'interrupted'
          const canResume = existingItem.canResume === true

          if ((isPaused || isInterrupted) && canResume) {
            try {
              await resumeDownload(downloadItem.id)
              return { resumed: true }
            } catch {
              try {
                await chrome.downloads.erase({ id: downloadItem.id })
              } catch (eraseError) {
                console.warn('Failed to erase old download record:', eraseError)
              }
            }
          } else {
            try {
              await chrome.downloads.erase({ id: downloadItem.id })
            } catch (eraseError) {
              console.warn('Failed to erase old download record:', eraseError)
            }
          }
        }
      } catch {
        // 下载项不存在，直接创建新下载
      }
    }
    const oldDownloadId = downloadItem.id

    const filename = extractFilename(downloadItem)

    if (!downloadItem?.url) {
      throw new Error('Download URL is required')
    }

    const downloadOptions: chrome.downloads.DownloadOptions = {
      url: downloadItem.url
    }

    if (filename) {
      downloadOptions.filename = filename
    }

    const newDownloadId = await new Promise<number>((resolve, reject) => {
      chrome.downloads.download(downloadOptions, (downloadId) => {
        if (chrome.runtime.lastError) {
          const error = new Error(chrome.runtime.lastError.message)
          console.error('Failed to create new download:', error)
          reject(error)
        } else {
          resolve(downloadId)
        }
      })
    })

    return {
      resumed: false,
      newDownloadId,
      oldDownloadId
    }
  } catch (error) {
    console.error('Failed to retry download:', error)
    throw error
  }
}

