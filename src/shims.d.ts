
// 这个文件用于声明Vue组件的类型，解决TypeScript无法识别.vue文件的问题

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare module 'vue' {
//   export * from '@vue/runtime-dom'

//   // 明确导出常用 API
//   export {
//     ref,
//     reactive,
//     computed,
//     watch,
//     watchEffect,
//     onMounted,
//     onUnmounted,
//     onUpdated,
//     onBeforeMount,
//     onBeforeUnmount,
//     onBeforeUpdate,
//     defineComponent,
//     createApp,
//     h,
//     Fragment,
//     Teleport,
//     Suspense
//   } from 'vue'
// }
