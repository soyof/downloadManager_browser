import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'

// 自定义插件：复制 manifest.json 和 public 目录到 dist
function copyManifest() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')

      // 确保 dist 目录存在
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
      }

      // 复制 manifest.json
      const manifestSrc = resolve(__dirname, 'public/manifest.json')
      const manifestDest = resolve(__dirname, 'dist/manifest.json')
      if (existsSync(manifestSrc)) {
        // 确保目标目录存在
        const manifestDestDir = dirname(manifestDest)
        if (!existsSync(manifestDestDir)) {
          mkdirSync(manifestDestDir, { recursive: true })
        }
        copyFileSync(manifestSrc, manifestDest)
      }

      // 复制 public 目录下的其他文件（如 icons）
      const publicDir = resolve(__dirname, 'public')

      function copyDir(src: string, dest: string) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true })
        }

        if (!existsSync(src)) {
          return
        }

        const files = readdirSync(src)
        files.forEach(file => {
          const srcPath = join(src, file)
          const destPath = join(dest, file)

          // 跳过 manifest.json，因为已经单独处理了
          if (file === 'manifest.json') {
            return
          }

          const stat = statSync(srcPath)

          if (stat.isDirectory()) {
            copyDir(srcPath, destPath)
          } else {
            const destFileDir = dirname(destPath)
            if (!existsSync(destFileDir)) {
              mkdirSync(destFileDir, { recursive: true })
            }
            copyFileSync(srcPath, destPath)
          }
        })
      }

      if (existsSync(publicDir)) {
        copyDir(publicDir, distDir)
      }
    }
  }
}

export default defineConfig({
  // Chrome Extension 需要使用相对路径
  base: './',
  plugins: [
    vue({
      // 使用运行时构建，不包含模板编译器
      template: {
        compilerOptions: {
          isCustomElement: () => false
        }
      }
      // 使用运行时构建（默认行为）
    }),
    copyManifest()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
      // 注意：不在这里设置 vue alias，避免 TypeScript 类型解析问题
      // Vue 运行时构建在 build.rollupOptions.external 中处理
    }
  },
  define: {
    // 确保 Vue 使用生产模式
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    // 禁用 vue-i18n 的运行时编译和所有可能导致 eval 的功能
    __VUE_I18N_FULL_INSTALL__: false,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
    // 强制使用编译模式
    __INTLIFY_JIT_COMPILATION__: false,
    // 禁用所有运行时编译
    'process.env.NODE_ENV': '"production"'
  },
  optimizeDeps: {
    // 预构建 vue-i18n 以避免运行时编译
    include: ['vue-i18n']
  },
  build: {
    outDir: 'dist',
    // 调整 chunk 大小警告限制（可选，但最好通过代码分割解决）
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/index.ts')
      },
      output: {
        entryFileNames: chunkInfo => {
          return chunkInfo.name === 'background'
            ? 'background/[name].js'
            : 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 确保不使用 eval
        format: 'es',
        generatedCode: {
          constBindings: true
        },
        // 手动分割代码块
        manualChunks: id => {
          // 将 node_modules 中的依赖分离
          if (id.includes('node_modules')) {
            // Element Plus 单独打包
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            // Element Plus 图标单独打包
            if (id.includes('@element-plus/icons-vue')) {
              return 'element-icons'
            }
            // Vue 相关库单独打包
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            // 其他第三方库
            return 'vendor'
          }
        }
      }
    },
    emptyOutDir: true,
    // 确保不使用 eval
    target: 'esnext',
    minify: 'esbuild',
    // 禁用 sourcemap 以避免潜在问题
    sourcemap: false
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})
