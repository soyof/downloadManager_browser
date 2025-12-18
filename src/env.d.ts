// / <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明 .css 文件模块
declare module '*.css' {
  const content: string
  export default content
}

// 声明 .scss 文件模块
declare module '*.scss' {
  const content: string
  export default content
}

// 声明 .sass 文件模块
declare module '*.sass' {
  const content: string
  export default content
}
