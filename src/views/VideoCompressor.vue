<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useCompressionStore } from '@/stores/compression'
import { VideoCompressor } from '@/modules/compress/compressor'
import { VideoCompressor as VideoCompressorUtil } from '@/modules/compress/compressor'
import ResultPanel from '@/components/ResultPanel.vue'
import '@/assets/styles/popup.css'
import '@/assets/styles/video-compression.css'

const router = useRouter()
const languageStore = useLanguageStore()
const compressionStore = useCompressionStore()

// UI State
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const showAdvancedSettings = ref(false)

// Computed
const hasFile = computed(() => compressionStore.selectedFile !== null)
const canCompress = computed(() => compressionStore.canCompress)
const isProcessing = computed(() => compressionStore.isProcessing)
const hasError = computed(() => compressionStore.hasError)
const isComplete = computed(() => compressionStore.isComplete)

// File handling
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type === 'video/mp4') {
    compressionStore.setFile(file)
  } else if (file) {
    alert('Please select an MP4 file')
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const file = event.dataTransfer?.files[0]
  if (file && file.type === 'video/mp4') {
    compressionStore.setFile(file)
  } else if (file) {
    alert('Please drop an MP4 file')
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const openFileDialog = () => {
  fileInput.value?.click()
}

// Settings
const handlePresetChange = (preset: string) => {
  compressionStore.setPreset(preset)
}

const handleCustomSettingsChange = (field: string, value: number) => {
  compressionStore.updateCustomSettings({ [field]: value })
}

// Compression
const startCompression = async () => {
  if (!compressionStore.selectedFile) return
  
  compressionStore.startCompression()
  
  try {
    const compressor = new VideoCompressor((progress) => {
      compressionStore.updateProgress(progress)
    })
    
    const { result, blob } = await compressor.compress(
      compressionStore.selectedFile,
      compressionStore.currentSettings
    )
    
    compressionStore.setResult(result, blob)
  } catch (error) {
    compressionStore.setError(error instanceof Error ? error.message : 'Compression failed')
  }
}

const downloadResult = () => {
  compressionStore.downloadCompressed()
}

const resetCompression = () => {
  compressionStore.reset()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Watch for file changes to reset input
watch(() => compressionStore.selectedFile, (newFile) => {
  if (!newFile && fileInput.value) {
    fileInput.value.value = ''
  }
})

const goBack = () => {
  router.push('/')
}
// Outside close handler
const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    goBack()
  }
}
</script>

<template>
  <div class="popup-overlay" @click="handleOverlayClick">
    <div class="popup-container">
      <div class="popup-header">
        <button @click="goBack" class="back-btn">{{ languageStore.t.back }}</button>
        <h2>{{ languageStore.t.videoCompressor }}</h2>
      </div>
      
      <div class="popup-content">
        <!-- Upload Area -->
        <div v-if="!hasFile" class="upload-area">
          <div 
            class="upload-box"
            :class="{ 'drag-over': isDragOver }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @click="openFileDialog"
          >
            <div class="upload-icon">📹</div>
            <p>{{ languageStore.t.dropFile }}</p>
            <p class="upload-hint">{{ languageStore.t.selectFile }}</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".mp4,video/mp4"
            @change="handleFileSelect"
            style="display: none"
          />
        </div>

        <!-- File Selected -->
        <div v-if="hasFile && !isComplete" class="file-selected">
          <div class="file-info">
            <div class="file-icon">📁</div>
            <div class="file-details">
              <div class="file-name">{{ compressionStore.selectedFile?.name }}</div>
              <div class="file-size">{{ VideoCompressorUtil.formatFileSize(compressionStore.selectedFile?.size || 0) }}</div>
            </div>
          </div>
        </div>

        <!-- Settings Section -->
        <div v-if="hasFile && !isComplete" class="settings-section">
          <!-- Quality Presets -->
          <div class="preset-section">
            <h3>{{ languageStore.t.qualityPreset }}</h3>
            <div class="preset-buttons">
              <button
                v-for="(preset, key) in { low: 'Low', medium: 'Medium', high: 'High' }"
                :key="key"
                :class="['preset-btn', { active: compressionStore.selectedPreset === key }]"
                @click="handlePresetChange(key)"
              >
                {{ languageStore.t[key as keyof typeof languageStore.t] }}
              </button>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="advanced-section">
            <button 
              class="advanced-toggle"
              @click="showAdvancedSettings = !showAdvancedSettings"
            >
              {{ languageStore.t.advancedSettings }}
              <span class="toggle-icon">{{ showAdvancedSettings ? '▼' : '▶' }}</span>
            </button>
            
            <div v-if="showAdvancedSettings" class="advanced-content">
              <div class="setting-group">
                <label>{{ languageStore.t.videoBitrate }}</label>
                <div class="bitrate-control">
                  <input
                    type="range"
                    :min="500000"
                    :max="10000000"
                    :step="100000"
                    :value="compressionStore.currentSettings.videoBitrate"
                    @input="handleCustomSettingsChange('videoBitrate', parseInt(($event.target as HTMLInputElement).value))"
                    class="bitrate-slider"
                  />
                  <span class="bitrate-value">{{ VideoCompressorUtil.formatBitrate(compressionStore.currentSettings.videoBitrate) }}</span>
                </div>
              </div>
              
              <div class="setting-group">
                <label>{{ languageStore.t.audioBitrate }}</label>
                <div class="bitrate-control">
                  <input
                    type="range"
                    :min="32000"
                    :max="320000"
                    :step="8000"
                    :value="compressionStore.currentSettings.audioBitrate"
                    @input="handleCustomSettingsChange('audioBitrate', parseInt(($event.target as HTMLInputElement).value))"
                    class="bitrate-slider"
                  />
                  <span class="bitrate-value">{{ VideoCompressorUtil.formatBitrate(compressionStore.currentSettings.audioBitrate) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Compress Button -->
          <div class="compress-section">
            <button 
              @click="startCompression"
              :disabled="!canCompress"
              class="compress-btn"
              :class="{ processing: isProcessing }"
            >
              <span v-if="!isProcessing">{{ languageStore.t.compressVideo }}</span>
              <span v-else>{{ languageStore.t.compressing }}</span>
            </button>
          </div>
        </div>

        <!-- Progress Section -->
        <div v-if="isProcessing" class="progress-section">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${compressionStore.progress.percentage}%` }"
            ></div>
          </div>
          <div class="progress-text">
            {{ compressionStore.progress.stage }} ({{ compressionStore.progress.percentage }}%)
          </div>
        </div>

        <!-- Error Section -->
        <div v-if="hasError" class="error-section">
          <div class="error-message">
            <span class="error-icon">⚠️</span>
            {{ compressionStore.error }}
          </div>
          <button @click="resetCompression" class="retry-btn">
            {{ languageStore.t.retry }}
          </button>
        </div>

        <!-- Results Section -->
        <div v-if="isComplete && compressionStore.result" class="results-section">
          <ResultPanel
            :result="compressionStore.result"
            :on-download="downloadResult"
            :on-retry="resetCompression"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles moved to video-compression.css */
</style>