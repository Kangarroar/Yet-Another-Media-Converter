<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useCompressionStore } from '@/stores/compression'
import { VideoCompressor } from '@/modules/compress/compressor'
import { VideoCompressor as VideoCompressorUtil } from '@/modules/compress/compressor'
import ResultPanel from '@/components/ResultPanel.vue'

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
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6" @click="handleOverlayClick">
    <div class="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-linear-to-b from-zinc-900/95 to-black/95 backdrop-blur-3xl shadow-2xl shadow-black/50 ring-1 ring-white/5" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-8 py-5 backdrop-blur-sm">
        <button @click="goBack" class="group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white">
          <svg class="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ languageStore.t.back }}
        </button>
        <h2 class="text-xl font-bold text-white tracking-tight">{{ languageStore.t.videoCompressor }}</h2>
        <div class="w-[88px]"></div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        <!-- Upload Zone -->
        <div v-if="!hasFile" class="space-y-4">
          <div
            class="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-16 text-center cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:from-orange-500/10 hover:to-orange-500/5 hover:shadow-lg hover:shadow-orange-500/10"
            :class="{ 'border-orange-500! from-orange-500/20! to-orange-500/10! scale-[1.02]': isDragOver }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @click="openFileDialog"
          >
            <div class="absolute inset-0 opacity-30 pointer-events-none">
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl"></div>
            </div>

            <div class="relative flex flex-col items-center gap-4">
              <div class="flex items-center justify-center h-20 w-20 rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:ring-orange-500/50">
                📹
              </div>
              <div>
                <p class="text-lg font-semibold text-white mb-2">{{ languageStore.t.dropFile }}</p>
                <p class="text-sm text-gray-400">{{ languageStore.t.selectFile }}</p>
                <p class="mt-2 text-xs text-gray-500">MP4 {{ languageStore.t.filesOnly || 'files only' }}</p>
              </div>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".mp4,video/mp4"
            @change="handleFileSelect"
            class="hidden"
          />
        </div>

        <!-- Selected File -->
        <div v-if="hasFile && !isComplete" class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div class="flex items-start gap-4">
            <div class="text-3xl">📁</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-white truncate mb-1">{{ compressionStore.selectedFile?.name }}</p>
              <p class="text-sm text-gray-400">{{ VideoCompressorUtil.formatFileSize(compressionStore.selectedFile?.size || 0) }}</p>
            </div>
            <button @click="openFileDialog" class="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-white/10">
              {{ languageStore.t.changeFile || 'Change' }}
            </button>
          </div>
        </div>

        <!-- Settings -->
        <div v-if="hasFile && !isComplete" class="space-y-6">
          <!-- Presets -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">{{ languageStore.t.qualityPreset }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="key in ['low', 'medium', 'high']"
                :key="key"
                @click="handlePresetChange(key)"
                :class="[
                  'rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60',
                  compressionStore.selectedPreset === key
                    ? 'border-transparent bg-orange-500 text-white shadow-[0_10px_40px_-15px_rgba(249,115,22,0.8)]'
                    : 'border-white/10 bg-zinc-900 text-slate-200 hover:border-white/20 hover:bg-zinc-800'
                ]"
              >
                {{ languageStore.t[key as keyof typeof languageStore.t] }}
              </button>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="space-y-4">
            <button
              class="w-full flex items-center justify-between px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
              @click="showAdvancedSettings = !showAdvancedSettings"
            >
              <span>{{ languageStore.t.advancedSettings }}</span>
              <svg class="h-5 w-5 transition-transform" :class="{ 'rotate-180': showAdvancedSettings }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="showAdvancedSettings" class="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
              <div>
                <div class="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>{{ languageStore.t.videoBitrate }}</span>
                  <span class="font-medium text-white">{{ VideoCompressorUtil.formatBitrate(compressionStore.currentSettings.videoBitrate) }}</span>
                </div>
                <input
                  type="range"
                  :min="500000"
                  :max="10000000"
                  :step="100000"
                  :value="compressionStore.currentSettings.videoBitrate"
                  @input="handleCustomSettingsChange('videoBitrate', parseInt(($event.target as HTMLInputElement).value))"
                  class="w-full accent-orange-500"
                />
              </div>

              <div>
                <div class="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>{{ languageStore.t.audioBitrate }}</span>
                  <span class="font-medium text-white">{{ VideoCompressorUtil.formatBitrate(compressionStore.currentSettings.audioBitrate) }}</span>
                </div>
                <input
                  type="range"
                  :min="32000"
                  :max="320000"
                  :step="8000"
                  :value="compressionStore.currentSettings.audioBitrate"
                  @input="handleCustomSettingsChange('audioBitrate', parseInt(($event.target as HTMLInputElement).value))"
                  class="w-full accent-orange-500"
                />
              </div>
            </div>
          </div>

          <!-- Compress Button -->
          <button
            @click="startCompression"
            :disabled="!canCompress"
            class="w-full px-6 py-4 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isProcessing ? languageStore.t.compressing : languageStore.t.compressVideo }}
          </button>
        </div>

        <!-- Progress -->
        <div v-if="isProcessing" class="space-y-3">
          <div class="h-3 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full bg-linear-to-r from-orange-500 to-orange-600 transition-all duration-300" :style="{ width: `${compressionStore.progress.percentage}%` }"></div>
          </div>
          <p class="text-center text-sm font-medium text-white">
            {{ compressionStore.progress.stage }} · {{ compressionStore.progress.percentage }}%
          </p>
        </div>

        <!-- Error -->
        <div v-if="hasError" class="rounded-xl border border-red-500/30 bg-red-500/10 p-6 space-y-4">
          <div class="flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <p class="text-sm text-red-200">{{ compressionStore.error }}</p>
          </div>
          <button @click="resetCompression" class="w-full px-4 py-3 rounded-lg border border-red-500/50 bg-red-500/20 text-red-200 font-medium transition-colors hover:bg-red-500/30">
            {{ languageStore.t.retry }}
          </button>
        </div>

        <!-- Results -->
        <div v-if="isComplete && compressionStore.result" class="rounded-xl border border-white/10 bg-white/5 p-4">
          <ResultPanel
            :result="compressionStore.result"
            :on-download="downloadResult"
            :on-retry="resetCompression"
          />
        </div>

        <!-- Info -->
        <div class="rounded-lg border border-white/10 bg-white/5 p-4">
          <p class="text-sm text-gray-400">{{ languageStore.t.compressorInfo || languageStore.t.videoDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template>