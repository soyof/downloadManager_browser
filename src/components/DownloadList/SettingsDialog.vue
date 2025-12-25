<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('settingsTitle')"
    width="700px"
    class="settings-dialog"
    transition="dialog-bounce"
  >
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

      <!-- 列表显示设置 -->
      <div class="settings-section">
        <div class="section-title">
          {{ $t('settingsListDisplay') }}
        </div>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-content">
              <div class="setting-label">
                {{ $t('settingsUseScrollLoad') }}
              </div>
              <div class="setting-description">
                {{ $t('settingsUseScrollLoadDesc') }}
              </div>
            </div>
            <el-switch v-model="formData.useScrollLoad" />
          </div>
          <div
            v-if="formData.useScrollLoad"
            class="setting-item nested"
          >
            <div class="setting-content">
              <div class="setting-label">
                {{ $t('settingsScrollLoadInitialSize') }}
              </div>
              <div class="setting-description">
                {{ $t('settingsScrollLoadInitialSizeDesc') }}
              </div>
            </div>
            <el-input-number
              v-model="formData.scrollLoadInitialSize"
              :min="5"
              :max="50"
              :step="5"
              class="retry-input"
            />
          </div>
        </div>
      </div>

      <!-- 删除确认设置 -->
      <div class="settings-section">
        <div class="section-title">
          {{ $t('settingsDeleteConfirm') }}
        </div>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-content">
              <div class="setting-label">
                {{ $t('settingsConfirmDelete') }}
              </div>
              <div class="setting-description">
                {{ $t('settingsConfirmDeleteDesc') }}
              </div>
            </div>
            <el-switch v-model="formData.confirmDelete" />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleReset">
          {{ $t('commonReset') }}
        </el-button>
        <el-button
          type="primary"
          @click="handleSave"
        >
          {{ $t('commonSave') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useSettingsStore } from '@/store/settings'
import type { DownloadSettings } from '@/types/download'

const { t: $t } = useI18n()
const settingsStore = useSettingsStore()

// Props
const props = defineProps<{
  modelValue: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 弹窗显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单数据
const formData = ref<Partial<DownloadSettings>>({
  openFolder: false,
  showNotification: true,
  playSound: false,
  useScrollLoad: false,
  scrollLoadInitialSize: 10,
  confirmDelete: true // 默认需要二次确认
})

// 当弹窗打开时加载设置
watch(
  dialogVisible,
  async(newVal: boolean) => {
    if (newVal) {
      // 确保设置已加载
      await settingsStore.loadSettings()

      // 加载当前设置
      const settings = settingsStore.downloadSettings
      formData.value = {
        openFolder: settings.openFolder ?? false,
        showNotification: settings.showNotification ?? true,
        playSound: settings.playSound ?? false,
        useScrollLoad: settings.useScrollLoad ?? false,
        scrollLoadInitialSize: settings.scrollLoadInitialSize ?? 10,
        confirmDelete: settings.confirmDelete ?? true
      }
    }
  },
  { immediate: true }
)

// 处理设置保存
const handleSave = async() => {
  try {
    settingsStore.updateDownloadSettings({
      openFolder: formData.value.openFolder,
      showNotification: formData.value.showNotification,
      playSound: formData.value.playSound,
      useScrollLoad: formData.value.useScrollLoad,
      scrollLoadInitialSize: formData.value.scrollLoadInitialSize,
      confirmDelete: formData.value.confirmDelete
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
    dialogVisible.value = false
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error($t('settingsSaveFailed'))
  }
}

// 处理设置重置
const handleReset = () => {
  settingsStore.updateDownloadSettings({
    openFolder: false,
    showNotification: true,
    playSound: false,
    useScrollLoad: false,
    scrollLoadInitialSize: 10,
    confirmDelete: true
  })
  formData.value = {
    openFolder: false,
    showNotification: true,
    playSound: false,
    useScrollLoad: false,
    scrollLoadInitialSize: 10,
    confirmDelete: true
  }
  ElMessage.success($t('settingsSaveSuccess'))
}
</script>

<style lang="scss" scoped>

.settings-section {
  margin-bottom: 20px;
  padding: 0; // 移除单独设置的 padding，由弹窗统一管理

  &:first-child {
    margin-top: 4px;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  margin-top: 0;
  padding: 0;
  padding-left: 12px;
  letter-spacing: -0.01em;
  text-transform: none;
  line-height: 1.4;
  position: relative;
  display: flex;
  align-items: center;
  border-left: 3px solid var(--el-color-primary);

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--el-border-color-lighter);
    margin-left: 12px;
  }

  &:first-child {
    margin-top: 0;
  }
}

.settings-group {
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: visible;
  box-shadow: none;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: none;
  transition: none;
  min-height: auto;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: transparent;
  }

  &.nested {
    padding-left: 20px;
    padding-top: 6px;
    background: transparent;
    border-top: none;
    margin-top: 2px;

    &:first-child {
      border-top: none;
    }
  }
}

.setting-content {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
  padding-top: 0;
}

.setting-label {
  font-size: 14px;
  font-weight: 400;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.setting-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  margin-top: 2px;
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

  .el-switch__core {
    width: 40px;
    height: 22px;
    border-radius: 11px;

    &::after {
      width: 18px;
      height: 18px;
    }
  }

  &.is-checked .el-switch__core {
    background-color: var(--el-color-primary);
  }
}

:deep(.el-radio) {
  color: var(--el-text-color-primary);
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
    border: 1px solid var(--el-border-color-dark) !important;
    box-shadow: none !important;
    background: var(--el-bg-color) !important;

    &:hover {
      border-color: var(--el-border-color-darker) !important;
    }

    &.is-focus {
      border-color: var(--el-color-primary) !important;
      box-shadow: 0 0 0 2px var(--el-color-primary-light-9) !important;
    }
  }

  .el-input__inner {
    text-align: center;
    color: var(--el-text-color-primary) !important;
  }

  .el-input-number__decrease,
  .el-input-number__increase {
    color: var(--el-text-color-regular);
    background: transparent;

    &:hover {
      color: var(--el-color-primary);
    }

    &:active {
      color: var(--el-color-primary-dark-2);
    }

    &.is-disabled {
      color: var(--el-text-color-disabled);
    }
  }
}
</style>

