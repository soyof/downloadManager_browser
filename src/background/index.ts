/**
 * Background Service Worker
 * 后台服务，负责监听下载事件并管理下载状态
 */

import { updateBadge } from './utils/badge'
import { initDownloadListeners } from './listeners/download'
import { initMessageListeners } from './listeners/message'
import { initCommandListeners } from './listeners/command'

// 初始化时更新徽章
updateBadge()

// 监听扩展启动时更新徽章
chrome.runtime.onStartup.addListener(() => {
  updateBadge()
})

initDownloadListeners()
initMessageListeners()
initCommandListeners()
