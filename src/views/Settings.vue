<template>
  <div class="settings-container">
    <!-- 下载完成行为 -->
    <div class="settings-section">
      <div class="section-title">
        {{ $t('settingsDownloadBehavior') }}
      </div>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-content">
            <div class="setting-label">
              {{ $t('settingsOpenFolder') }}
            </div>
            <div class="setting-description">
              {{ $t('settingsOpenFolderDesc') }}
            </div>
          </div>
          <el-switch v-model="formData.openFolder" />
        </div>
      </div>
    </div>

    <!-- 通知设置 -->
    <div class="settings-section">
      <div class="section-title">
        {{ $t('settingsNotification') }}
      </div>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-content">
            <div class="setting-label">
              {{ $t('settingsShowNotification') }}
            </div>
            <div class="setting-description">
              {{ $t('settingsShowNotificationDesc') }}
            </div>
          </div>
          <el-switch v-model="formData.showNotification" />
        </div>
        <div class="setting-item">
          <div class="setting-content">
            <div class="setting-label">
              {{ $t('settingsPlaySound') }}
            </div>
            <div class="setting-description">
              {{ $t('settingsPlaySoundDesc') }}
            </div>
          </div>
          <el-switch v-model="formData.playSound" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useSettingsStore } from '@/store/settings'

const emit = defineEmits<{
  close: []
}>()

const { t: $t } = useI18n()
const settingsStore = useSettingsStore()

import type { DownloadSettings } from '@/types/download'

const formData = ref<Partial<DownloadSettings>>({
  openFolder: false,
  showNotification: true,
  playSound: false
})

onMounted(async() => {
  // 确保设置已加载
  await settingsStore.loadSettings()

  // 加载当前设置
  const settings = settingsStore.downloadSettings
  formData.value = {
    openFolder: settings.openFolder ?? false,
    showNotification: settings.showNotification ?? true,
    playSound: settings.playSound ?? false
  }
})

async function handleSave() {
  try {
    settingsStore.updateDownloadSettings({
      openFolder: formData.value.openFolder,
      showNotification: formData.value.showNotification,
      playSound: formData.value.playSound
    })

    // 确保设置已保存到 chrome.storage
    await new Promise<void>((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get('download-manager-settings', () => {
          resolve()
        })
      } else {
        resolve()
      }
    })

    ElMessage.success($t('settingsSaveSuccess'))
    emit('close')
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error($t('settingsSaveFailed'))
  }
}

const handleReset = () => {
  settingsStore.updateDownloadSettings({
    openFolder: false,
    showNotification: true,
    playSound: false
  })
  formData.value = {
    openFolder: false,
    showNotification: true,
    playSound: false
  }
  ElMessage.success($t('settingsSaveSuccess'))
}

// 暴露方法供父组件调用
defineExpose({
  handleSave,
  handleReset
})
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 12px 0;
  width: 100%;
  box-sizing: border-box;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $bg-tertiary;
    border-radius: $radius-sm;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-color;
    border-radius: $radius-sm;

    &:hover {
      background: $border-hover;
    }
  }
}

.settings-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
  padding: 0 16px;
  letter-spacing: 0.01em;
}

.settings-group {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: $radius-md;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--el-fill-color-lighter);
  }

  &.nested {
    padding-left: 32px;
    background: var(--el-fill-color-extra-light);
  }
}

.setting-content {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 4px;
  line-height: 1.4;
}

.setting-description {
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.4;
}

.conflict-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
}

.retry-input {
  width: 100px;
}

:deep(.el-switch) {
  flex-shrink: 0;
}

:deep(.el-radio) {
  color: $text-primary;
  font-size: 13px;
  margin-right: 0;
  margin-bottom: 0;
  padding: 4px 0;
}

:deep(.el-radio__label) {
  padding-left: 8px;
}

:deep(.el-input-number) {
  .el-input__wrapper {
    padding: 4px 8px;
  }
}
</style>
