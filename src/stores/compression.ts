import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  CompressionSettings, 
  CompressionState, 
  CompressionResult, 
  CompressionProgress,
  QualityPreset 
} from '@/types/compression'
import { QUALITY_PRESETS } from '@/types/compression'

export const useCompressionStore = defineStore('compression', () => {
  // State
  const currentState = ref<CompressionState>('idle')
  const selectedFile = ref<File | null>(null)
  const selectedPreset = ref<string>('medium')
  const customSettings = ref<CompressionSettings>({
    videoBitrate: QUALITY_PRESETS.medium?.videoBitrate || 2_000_000,
    audioBitrate: QUALITY_PRESETS.medium?.audioBitrate || 128_000,
    fps: 30,
    audioChannels: 2
  })
  const progress = ref<CompressionProgress>({ percentage: 0, stage: '' })
  const result = ref<CompressionResult | null>(null)
  const error = ref<string | null>(null)
  const compressedBlob = ref<Blob | null>(null)

  // Getters
  const isProcessing = computed(() => currentState.value === 'processing')
  const isComplete = computed(() => currentState.value === 'complete')
  const hasError = computed(() => currentState.value === 'error')
  const canCompress = computed(() => selectedFile.value !== null && currentState.value === 'idle')
  
  const currentSettings = computed(() => {
    if (selectedPreset.value === 'custom') {
      return customSettings.value
    }
    const preset = QUALITY_PRESETS[selectedPreset.value]
    if (!preset) {
      return customSettings.value
    }
    return {
      videoBitrate: preset.videoBitrate,
      audioBitrate: preset.audioBitrate,
      fps: customSettings.value.fps,
      audioChannels: customSettings.value.audioChannels
    }
  })

  // Actions
  const setFile = (file: File) => {
    selectedFile.value = file
    currentState.value = 'idle'
    result.value = null
    error.value = null
    compressedBlob.value = null
    progress.value = { percentage: 0, stage: '' }
  }

  const setPreset = (preset: string) => {
    selectedPreset.value = preset
    if (preset !== 'custom') {
      const presetData = QUALITY_PRESETS[preset]
      if (presetData) {
        customSettings.value.videoBitrate = presetData.videoBitrate
        customSettings.value.audioBitrate = presetData.audioBitrate
      }
    }
  }

  const updateCustomSettings = (settings: Partial<CompressionSettings>) => {
    customSettings.value = { ...customSettings.value, ...settings }
    if (selectedPreset.value !== 'custom') {
      selectedPreset.value = 'custom'
    }
  }

  const startCompression = () => {
    currentState.value = 'processing'
    progress.value = { percentage: 0, stage: 'Initializing...' }
    error.value = null
    result.value = null
    compressedBlob.value = null
  }

  const updateProgress = (progressData: CompressionProgress) => {
    progress.value = progressData
  }

  const setResult = (compressionResult: CompressionResult, blob: Blob) => {
    result.value = compressionResult
    compressedBlob.value = blob
    currentState.value = 'complete'
    progress.value = { percentage: 100, stage: 'Complete' }
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
    currentState.value = 'error'
    progress.value = { percentage: 0, stage: 'Error' }
  }

  const reset = () => {
    currentState.value = 'idle'
    selectedFile.value = null
    selectedPreset.value = 'medium'
    customSettings.value = {
      videoBitrate: QUALITY_PRESETS.medium?.videoBitrate || 2_000_000,
      audioBitrate: QUALITY_PRESETS.medium?.audioBitrate || 128_000,
      fps: 30,
      audioChannels: 2
    }
    progress.value = { percentage: 0, stage: '' }
    result.value = null
    error.value = null
    compressedBlob.value = null
  }

  const downloadCompressed = () => {
    if (compressedBlob.value && result.value) {
      const url = URL.createObjectURL(compressedBlob.value)
      const a = document.createElement('a')
      a.href = url
      a.download = result.value.compressedFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return {
    // State
    currentState,
    selectedFile,
    selectedPreset,
    customSettings,
    progress,
    result,
    error,
    compressedBlob,
    
    // Getters
    isProcessing,
    isComplete,
    hasError,
    canCompress,
    currentSettings,
    
    // Actions
    setFile,
    setPreset,
    updateCustomSettings,
    startCompression,
    updateProgress,
    setResult,
    setError,
    reset,
    downloadCompressed
  }
})
