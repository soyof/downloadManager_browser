/**
 * 下载控制操作（暂停、继续、取消）
 */

/**
 * 暂停下载
 */
export const pauseDownload = async(downloadId: number): Promise<void> => {
  try {
    await chrome.downloads.pause(downloadId)
  } catch (error) {
    console.error('Failed to pause download:', error)
    throw error
  }
}

/**
 * 继续下载
 */
export const resumeDownload = async(downloadId: number): Promise<void> => {
  try {
    const results = await new Promise<chrome.downloads.DownloadItem[]>((resolve, reject) => {
      chrome.downloads.search({ id: downloadId }, (results: chrome.downloads.DownloadItem[]) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(results)
        }
      })
    })

    if (results.length === 0 || !results[0]) {
      throw new Error('下载项不存在')
    }

    const downloadItem = results[0]

    const isPaused = downloadItem.state === 'in_progress' && downloadItem.paused
    const isInterrupted = downloadItem.state === 'interrupted'

    if (!isPaused && !isInterrupted) {
      throw new Error(`下载状态不正确，无法恢复。当前状态: ${downloadItem.state}`)
    }

    if (downloadItem.canResume !== true) {
      throw new Error('DownloadItem.canResume must be true')
    }

    await chrome.downloads.resume(downloadId)
  } catch (error) {
    console.error('Failed to resume download:', error)
    throw error
  }
}

/**
 * 取消下载
 */
export const cancelDownload = async(downloadId: number): Promise<void> => {
  try {
    await chrome.downloads.cancel(downloadId)
  } catch (error) {
    console.error('Failed to cancel download:', error)
    throw error
  }
}

