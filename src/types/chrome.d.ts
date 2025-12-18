/**
 * Chrome Extensions API 类型声明
 */

declare namespace chrome {
  namespace downloads {
    interface DownloadItem {
      id: number
      url: string
      referrer?: string
      filename: string
      incognito: boolean
      danger: string
      mime?: string
      startTime?: string
      endTime?: string
      estimatedEndTime?: string
      state: 'in_progress' | 'complete' | 'interrupted'
      paused: boolean
      canResume: boolean
      error?: string
      bytesReceived: number
      totalBytes: number
      fileSize: number
      exists: boolean
    }

    interface DownloadDelta {
      id: number
      url?: DownloadDeltaChange<string>
      filename?: DownloadDeltaChange<string>
      danger?: DownloadDeltaChange<string>
      mime?: DownloadDeltaChange<string>
      startTime?: DownloadDeltaChange<string>
      endTime?: DownloadDeltaChange<string>
      state?: DownloadDeltaChange<DownloadItem['state']>
      paused?: DownloadDeltaChange<boolean>
      error?: DownloadDeltaChange<string>
      totalBytes?: DownloadDeltaChange<number>
      fileSize?: DownloadDeltaChange<number>
      exists?: DownloadDeltaChange<boolean>
    }

    interface DownloadDeltaChange<T> {
      current?: T
      previous?: T
    }

    interface DownloadOptions {
      url: string
      filename?: string
      conflictAction?: 'uniquify' | 'overwrite' | 'prompt'
      saveAs?: boolean
      method?: 'GET' | 'POST'
      headers?: Array<{ name: string; value: string }>
      body?: string
    }

    function search(query: { query?: string[]; id?: number; url?: string; filename?: string; filenameRegex?: string; orderBy?: string[]; limit?: number; state?: string; danger?: string; paused?: boolean }, callback: (results: DownloadItem[]) => void): void
    function pause(downloadId: number, callback?: () => void): void
    function resume(downloadId: number, callback?: () => void): void
    function cancel(downloadId: number, callback?: () => void): void
    function getFileIcon(downloadId: number, options?: { size?: number }, callback?: (iconURL?: string) => void): void
    function open(downloadId: number): Promise<void>
    function show(downloadId: number): Promise<void>
    function showDefaultFolder(): void
    function download(options: DownloadOptions, callback?: (downloadId: number) => void): void
    function removeFile(downloadId: number, callback?: () => void): void
    function erase(query: { id?: number; url?: string; filename?: string; filenameRegex?: string; startedBefore?: string; startedAfter?: string; endedBefore?: string; endedAfter?: string; totalBytesGreater?: number; totalBytesLess?: number; state?: string; limit?: number; orderBy?: string[] }, callback?: (downloadIds: number[]) => void): void
    function acceptDanger(downloadId: number, callback?: () => void): void
    function drag(downloadId: number): void
    function setShelfEnabled(enabled: boolean): void

    const onCreated: {
      addListener(callback: (downloadItem: DownloadItem) => void): void
      removeListener(callback: (downloadItem: DownloadItem) => void): void
      hasListener(callback: (downloadItem: DownloadItem) => void): boolean
    }

    const onChanged: {
      addListener(callback: (downloadDelta: DownloadDelta) => void): void
      removeListener(callback: (downloadDelta: DownloadDelta) => void): void
      hasListener(callback: (downloadDelta: DownloadDelta) => void): boolean
    }

    const onErased: {
      addListener(callback: (downloadId: number) => void): void
      removeListener(callback: (downloadId: number) => void): void
      hasListener(callback: (downloadId: number) => void): boolean
    }

    const onDeterminingFilename: {
      addListener(callback: (downloadItem: DownloadItem, suggest: (suggestion: { filename?: string; conflictAction?: string }) => void) => void): void
      removeListener(callback: (downloadItem: DownloadItem, suggest: (suggestion: { filename?: string; conflictAction?: string }) => void) => void): void
      hasListener(callback: (downloadItem: DownloadItem, suggest: (suggestion: { filename?: string; conflictAction?: string }) => void) => boolean): boolean
    }
  }

  namespace runtime {
    interface MessageSender {
      tab?: any
      frameId?: number
      id?: string
      url?: string
      tlsChannelId?: string
    }

    interface LastError {
      message?: string
    }

    const lastError: LastError | undefined

    function sendMessage(message: any, responseCallback?: (response: any) => void): void
    function sendMessage(message: any, options: { includeTlsChannelId?: boolean }, responseCallback?: (response: any) => void): void
    function sendMessage(extensionId: string, message: any, responseCallback?: (response: any) => void): void
    function sendMessage(extensionId: string, message: any, options: { includeTlsChannelId?: boolean }, responseCallback?: (response: any) => void): void

    const onMessage: {
      addListener(callback: (message: any, sender: MessageSender, sendResponse: (response?: any) => void) => void | boolean): void
      removeListener(callback: (message: any, sender: MessageSender, sendResponse: (response?: any) => void) => void): void
      hasListener(callback: (message: any, sender: MessageSender, sendResponse: (response?: any) => void) => boolean): boolean
    }
  }

  namespace action {
    function openPopup(): void
  }

  namespace commands {
    interface Command {
      name?: string
      shortcut?: string
      description?: string
    }

    const onCommand: {
      addListener(callback: (command: string) => void): void
      removeListener(callback: (command: string) => void): void
      hasListener(callback: (command: string) => void): boolean
    }
  }
}

