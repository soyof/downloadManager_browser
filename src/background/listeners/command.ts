/**
 * 命令监听器
 */

/**
 * 初始化命令监听器
 */
export const initCommandListeners = () => {
  chrome.commands.onCommand.addListener((command: string) => {
    if (command === 'open-download-manager') {
      chrome.action.openPopup()
    }
  })
}

