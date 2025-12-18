/**
 * 徽章更新工具
 */

/**
 * 更新扩展图标徽章，显示正在下载的任务数量
 */
export const updateBadge = () => {
  try {
    // 查询所有正在进行的下载任务
    chrome.downloads.search({}, (results: chrome.downloads.DownloadItem[]) => {
      // 统计正在下载的任务（包括下载中和暂停的任务）
      const downloadingCount = results.filter((item) => {
        // 正在下载中
        if (item.state === 'in_progress' && !item.paused) {
          return true
        }
        // 暂停的下载（可以继续的）
        if (item.state === 'interrupted' && item.paused && item.canResume) {
          return true
        }
        return false
      }).length

      if (downloadingCount > 0) {
        // 设置徽章文本为下载任务数量（最多显示99+）
        const badgeText = downloadingCount > 99 ? '99+' : downloadingCount.toString()
        chrome.action.setBadgeText({ text: badgeText })
        // 设置徽章背景颜色为主色调（蓝色）
        chrome.action.setBadgeBackgroundColor({ color: '#2563eb' })
      } else {
        // 没有下载任务时，清除徽章
        chrome.action.setBadgeText({ text: '' })
      }
    })
  } catch (error) {
    console.error('Failed to update badge:', error)
  }
}

