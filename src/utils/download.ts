/**
 * 下载管理工具函数（统一导出）
 * 此文件用于向后兼容，实际功能已拆分到各个模块
 */

// 格式化工具
export {
  formatFileSize,
  formatSpeed,
  formatTime,
  formatRemainingTime
} from './formatters'

// 转换工具
export { convertChromeDownload } from './downloadConverter'

// 操作工具
export {
  openFile,
  openFolder,
  deleteDownloadRecord,
  deleteDownloadFileAndRecord,
  retryDownload
} from './downloadOperations'

// 控制工具
export {
  pauseDownload,
  resumeDownload,
  cancelDownload
} from './downloadControl'

