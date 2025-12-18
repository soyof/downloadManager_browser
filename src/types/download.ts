/**
 * 下载项状态枚举
 */
export enum DownloadStatus {
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 文件类型枚举
 */
export enum FileType {
  FILE = 'file',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  OTHER = 'other'
}

/**
 * 排序方式枚举
 */
export enum SortBy {
  TIME = 'time',
  SIZE = 'size',
  NAME = 'name'
}

/**
 * 排序顺序枚举
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * 下载项接口
 */
export interface DownloadItem {
  id: number // Chrome downloads API 的 downloadId
  name: string // 文件名
  url: string // 下载 URL
  path: string // 存储路径
  size: number // 文件大小（字节）
  receivedBytes: number // 已接收字节数
  progress: number // 进度百分比 (0-100)
  status: DownloadStatus // 状态
  speed: number // 下载速度（字节/秒）
  startTime: number // 开始时间（时间戳）
  endTime?: number // 结束时间（时间戳）
  error?: string // 错误信息
  mimeType?: string // MIME 类型
  fileType: FileType // 文件类型
  canResume?: boolean // 是否可以恢复下载
  exists?: boolean // 文件是否存在
}

/**
 * 下载设置接口
 */
export interface DownloadSettings {
  openFolder: boolean // 下载完成后打开文件夹
  showNotification: boolean // 显示通知
  playSound: boolean // 播放声音
}

/**
 * 筛选条件接口
 */
export interface FilterOptions {
  status?: DownloadStatus // 状态筛选
  fileType?: FileType // 文件类型筛选
  searchText?: string // 搜索文本
}

/**
 * 排序选项接口
 */
export interface SortOptions {
  sortBy: SortBy // 排序字段
  sortOrder: SortOrder // 排序顺序
}

/**
 * 应用设置接口
 */
export interface AppSettings {
  theme: string // 主题名称
  locale: string // 语言代码
  downloadSettings: DownloadSettings // 下载设置
}

