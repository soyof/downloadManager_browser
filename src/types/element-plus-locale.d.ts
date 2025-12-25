/**
 * Element Plus Locale 模块类型声明
 * 用于解决 TypeScript 无法识别 .mjs 文件的问题
 */
declare module 'element-plus/dist/locale/zh-cn.mjs' {
  import type { Language } from 'element-plus/es/locale'
  const zhCn: Language
  export default zhCn
}

declare module 'element-plus/dist/locale/zh-tw.mjs' {
  import type { Language } from 'element-plus/es/locale'
  const zhTw: Language
  export default zhTw
}

declare module 'element-plus/dist/locale/en.mjs' {
  import type { Language } from 'element-plus/es/locale'
  const en: Language
  export default en
}

declare module 'element-plus/dist/locale/ja.mjs' {
  import type { Language } from 'element-plus/es/locale'
  const ja: Language
  export default ja
}

