/**
 * 下载项转换工具
 */

import type { DownloadItem } from '@/types/download'
import { DownloadStatus } from '@/types/download'
import { useDownloadStore } from '@/store/download'

/**
 * 从 URL 提取文件名
 */
const extractFileNameFromUrl = (url: string): string | null => {
  try {
    // 使用字符串解析提取文件名（兼容所有环境）
    // 匹配 URL 路径中的文件名（包含扩展名）
    const urlMatch = url.match(/\/([^/]+\.[^/?]+)(?:\?|$)/)
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1]
    }
    // 如果正则匹配失败，尝试简单的路径分割
    const urlParts = url.split('/')
    const lastPart = urlParts[urlParts.length - 1] || ''
    if (lastPart && lastPart.includes('.')) {
      // 移除查询参数
      const fileName = lastPart.split('?')[0]
      if (fileName) {
        return fileName
      }
    }
  } catch {
    // URL 解析失败
  }
  return null
}

/**
 * 从 Chrome DownloadItem 中提取有效的文件名
 * 优先级：filename > URL 提取 > null（过滤掉）
 */
const extractValidFileName = (chromeDownload: chrome.downloads.DownloadItem): string | null => {
  // 1. 首先尝试从 filename 字段提取文件名
  let fileName: string | null = null

  if (chromeDownload.filename && chromeDownload.filename.trim() !== '') {
    // filename 不为空，提取文件名部分（去掉路径）
    const pathParts = chromeDownload.filename.split(/[/\\]/)
    const extracted = pathParts[pathParts.length - 1]
    if (extracted && extracted.trim() !== '') {
      fileName = extracted.trim()
    }
  }

  // 2. 如果 filename 为空或无效，尝试从 URL 提取
  if (!fileName && chromeDownload.url) {
    fileName = extractFileNameFromUrl(chromeDownload.url)
  }

  // 3. 如果仍然没有文件名，检查是否是测试下载
  if (!fileName) {
    // 无法提取文件名，可能是无效的下载项
    return null
  }

  // 4. 检查是否是 Chrome 测试消息
  const testMessages = [
    '请点击取消',
    '这是Chrono在测试下载配置',
    'Chrono',
    '测试下载配置',
    '请确保关闭浏览器另存为对话框',
    '默认下载路径为可写入的'
  ]

  const containsTestMessage = testMessages.some(msg => fileName!.includes(msg))
  if (containsTestMessage) {
    // 如果是测试消息，尝试从 URL 重新提取
    if (chromeDownload.url) {
      const urlFileName = extractFileNameFromUrl(chromeDownload.url)
      if (urlFileName) {
        return urlFileName
      }
    }
    // 无法从 URL 提取，过滤掉此下载项
    return null
  }

  return fileName
}

/**
 * 将 Chrome downloads API 的下载项转换为应用内的下载项
 */
export const convertChromeDownload = (chromeDownload: chrome.downloads.DownloadItem): DownloadItem | null => {
  const store = useDownloadStore()

  // 提取有效的文件名（从根源上解决，不依赖默认值）
  const fileName = extractValidFileName(chromeDownload)

  // 如果无法提取有效文件名，过滤掉此下载项
  if (!fileName) {
    return null
  }

  const fileType = store.getFileType(chromeDownload.filename, chromeDownload.mime)

  let status: DownloadStatus = DownloadStatus.DOWNLOADING
  if (chromeDownload.state === 'complete') {
    status = DownloadStatus.COMPLETED
  } else if (chromeDownload.state === 'interrupted') {
    status = chromeDownload.paused ? DownloadStatus.PAUSED : DownloadStatus.FAILED
  } else if (chromeDownload.state === 'in_progress') {
    status = chromeDownload.paused ? DownloadStatus.PAUSED : DownloadStatus.DOWNLOADING
  }

  const size = chromeDownload.totalBytes || chromeDownload.bytesReceived || 0
  const receivedBytes = chromeDownload.bytesReceived || 0
  const progress = size > 0 ? Math.round((receivedBytes / size) * 100) : 0

  // 计算下载速度（仅在下载中时计算）
  let speed = 0
  if (status === DownloadStatus.DOWNLOADING && receivedBytes > 0) {
    speed = store.calculateSpeed(chromeDownload.id, receivedBytes)
  } else {
    // 非下载中状态，清除速度缓存
    store.clearSpeedCache(chromeDownload.id)
  }

  return {
    id: chromeDownload.id,
    name: fileName,
    url: chromeDownload.url,
    path: chromeDownload.filename || '', // filename 可能为空，使用空字符串
    size,
    receivedBytes,
    progress,
    status,
    speed,
    startTime: chromeDownload.startTime ? new Date(chromeDownload.startTime).getTime() : Date.now(),
    endTime: chromeDownload.endTime ? new Date(chromeDownload.endTime).getTime() : undefined,
    error: chromeDownload.error,
    mimeType: chromeDownload.mime,
    fileType,
    canResume: chromeDownload.canResume,
    exists: chromeDownload.exists !== false // 默认为 true，如果明确为 false 则标记为不存在
  }
}

