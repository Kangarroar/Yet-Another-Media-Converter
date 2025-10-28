<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import '@/assets/styles/popup.css'

// MediaBunny imports
import { 
  BlobSource, 
  BufferTarget, 
  Conversion, 
  Input, 
  Output,
  Mp3OutputFormat,
  AdtsOutputFormat,
  OggOutputFormat,
  FlacOutputFormat,
  ALL_FORMATS
} from 'mediabunny'
import type { AudioCodec } from 'mediabunny'

const router = useRouter()
const languageStore = useLanguageStore()
const supportedFormats = ['aac', 'opus', 'mp3', 'vorbis', 'flac'] as const
type AudioFormat = typeof supportedFormats[number]

// Reactive state
const selectedFile = ref<File | null>(null)
const detectedFormat = ref<AudioFormat | null>(null)
const outputFormat = ref<AudioFormat>('mp3')
const showAdvanced = ref(false)
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Conversion state
const isConverting = ref(false)
const conversionProgress = ref(0)
const conversionError = ref<string | null>(null)
const convertedFile = ref<Blob | null>(null)
const conversionComplete = ref(false)

// NEED TO CHANGE DEPENDING ON OUTPUT FORMAT
// Advanced
const bitrate = ref(128)
const channels = ref(2)
const sampleRate = ref(44100)

// Bitrate
const bitrateOptions = [64, 96, 128, 160, 192, 256, 320]

// Sample rate
const sampleRateOptions = [8000, 11025, 16000, 22050, 32000, 44100, 48000, 88200, 96000]

const goBack = () => {
  router.push('/')
}

// Outside close handler
const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    goBack()
  }
}

const handleFileSelect = (file: File) => {
  selectedFile.value = file
  
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension && supportedFormats.includes(extension as AudioFormat)) {
    detectedFormat.value = extension as AudioFormat
  } else {
    // ?
    detectedFormat.value = null
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0 && files[0]) {
    handleFileSelect(files[0])
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0 && files[0]) {
    handleFileSelect(files[0])
  }
}

const removeFile = () => {
  selectedFile.value = null
  detectedFormat.value = null
}

const convertAudio = async () => {
  if (!selectedFile.value) return
  
  try {
    console.log('File:', selectedFile.value.name, 'Size:', selectedFile.value.size)
    console.log({
      outputFormat: outputFormat.value,
      bitrate: bitrate.value,
      channels: channels.value,
      sampleRate: sampleRate.value
    })
    
    isConverting.value = true
    conversionError.value = null
    conversionProgress.value = 0
    const inputSource = new BlobSource(selectedFile.value)
    
    const input = new Input({
      source: inputSource,
      formats: ALL_FORMATS
    })
    
    //Conversion fails on some outputs due to mismatched parameters?
    const getOutputFormat = (format: AudioFormat) => {
      switch (format) {
        case 'mp3': return new Mp3OutputFormat()
        case 'aac': return new AdtsOutputFormat() 
        case 'opus': return new OggOutputFormat() 
        case 'vorbis': return new OggOutputFormat() 
        case 'flac': return new FlacOutputFormat()
        default: return new Mp3OutputFormat()
      }
    }
    
    const outputTarget = new BufferTarget()

    //console.log('Output', outputFormat.value)
    const output = new Output({
      format: getOutputFormat(outputFormat.value),
      target: outputTarget
    })
    
    // Conversion 
    const conversion = await Conversion.init({
      input,
      output,
      audio: {
        codec: outputFormat.value as AudioCodec,
        bitrate: bitrate.value * 1000, // Convert kbps to bps
        numberOfChannels: channels.value,
        sampleRate: sampleRate.value
      }
    })
    
    console.log(conversion.isValid)
    console.log(conversion.discardedTracks)
    console.log(conversion.utilizedTracks)
    
    // Check if conversion is valid
    if (!conversion.isValid) {
      throw new Error('Invalid conversion configuration')
    }
    
    conversion.onProgress = (progress: number) => {
      const percentage = Math.round(progress * 100)
      conversionProgress.value = percentage
    }
    
    await conversion.execute()
    
    if (outputTarget.buffer) {
      convertedFile.value = new Blob([outputTarget.buffer], { 
        type: `audio/${outputFormat.value}` 
      })
      conversionComplete.value = true
    } else {
      console.warn('No buffer data')
    }
    
  } catch (error) {
    console.error('Conversion error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      //message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    conversionError.value = error instanceof Error ? error.message : 'Conversion failed'
  } finally {
    isConverting.value = false
  }
}

const formatDisplayName = (format: AudioFormat) => {
  return format.toUpperCase()
}

const downloadConvertedFile = () => {
  if (!convertedFile.value) return
  
  const url = URL.createObjectURL(convertedFile.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedFile.value?.name.split('.')[0] || 'converted'}.${outputFormat.value}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const resetConversion = () => {
  conversionComplete.value = false
  convertedFile.value = null
  conversionProgress.value = 0
  conversionError.value = null
}

const canConvert = computed(() => {
  return selectedFile.value && outputFormat.value && !isConverting.value
})
</script>

<template>
  <div class="popup-overlay" @click="handleOverlayClick">
    <div class="popup-container">
      <div class="popup-header">
        <button @click="goBack" class="back-btn">{{ languageStore.t.back }}</button>
        <h2>{{ languageStore.t.audioConverter }}</h2>
      </div>
      
      <div class="popup-content">
        <!-- File Upload Area -->
        <div class="upload-area">
          <div 
            v-if="!selectedFile"
            class="upload-box"
            :class="{ 'drag-over': isDragOver }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @click="fileInput?.click()"
          >
            <div class="upload-icon">🎵</div>
            <p>{{ languageStore.t.dropFile }}</p>
            <p class="upload-hint">{{ languageStore.t.audioHint }}</p>
            <input 
              ref="fileInput"
              type="file" 
              accept="audio/*"
              @change="handleFileInput"
              style="display: none"
            />
          </div>
          
          <!-- Selected File Display -->
          <div v-else class="selected-file">
            <div class="file-info">
              <div class="file-icon">🎵</div>
              <div class="file-details">
                <h3>{{ selectedFile.name }}</h3>
                <p v-if="detectedFormat" class="file-format">
                  {{ languageStore.t.selectedAudioFile }}: {{ formatDisplayName(detectedFormat) }}
                </p>
                <p v-else class="file-format">
                  {{ languageStore.t.selectedAudioFile }}: {{ selectedFile.type || 'Unknown' }}
                </p>
                <p class="file-size">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
              <button @click="removeFile" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <!-- Conversion Settings -->
        <div v-if="selectedFile" class="conversion-settings">
          <!-- Output Format Selection -->
          <div class="setting-group">
            <label class="setting-label">{{ languageStore.t.selectOutputFormat }}</label>
            <select v-model="outputFormat" class="format-select">
              <option 
                v-for="format in supportedFormats" 
                :key="format" 
                :value="format"
                :disabled="format === detectedFormat"
              >
                {{ formatDisplayName(format) }}
                <span v-if="format === detectedFormat"> </span>
              </option>
            </select>
          </div>

          <!-- Advanced Settings Toggle -->
          <div class="advanced-toggle">
            <button 
              @click="showAdvanced = !showAdvanced" 
              class="advanced-btn"
              :class="{ active: showAdvanced }"
            >
              {{ languageStore.t.advanced }}
              <span class="toggle-icon">{{ showAdvanced ? '▼' : '▶' }}</span>
            </button>
          </div>

          <!-- Advanced Settings Panel -->
          <div v-if="showAdvanced" class="advanced-settings">
            <div class="settings-grid">
              <!-- Bitrate -->
              <div class="setting-group">
                <label class="setting-label">{{ languageStore.t.bitrate }} (kbps)</label>
                <select v-model="bitrate" class="setting-select">
                  <option v-for="rate in bitrateOptions" :key="rate" :value="rate">
                    {{ rate }}
                  </option>
                </select>
              </div>

              <!-- Channels -->
              <div class="setting-group">
                <label class="setting-label">{{ languageStore.t.channels }}</label>
                <select v-model="channels" class="setting-select">
                  <option :value="1">{{ languageStore.t.mono }}</option>
                  <option :value="2">{{ languageStore.t.stereo }}</option>
                </select>
              </div>

              <!-- Sample Rate -->
              <div class="setting-group">
                <label class="setting-label">{{ languageStore.t.sampleRate }} (Hz)</label>
                <select v-model="sampleRate" class="setting-select">
                  <option v-for="rate in sampleRateOptions" :key="rate" :value="rate">
                    {{ rate.toLocaleString() }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Convert Button -->
          <div class="convert-section">
            <button 
              @click="convertAudio" 
              class="convert-btn"
              :disabled="!canConvert"
            >
              {{ isConverting ? 'Converting...' : languageStore.t.convertAudio }}
            </button>
          </div>

          <!-- Progress Bar -->
          <div v-if="isConverting" class="progress-section">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${conversionProgress}%` }"
              ></div>
            </div>
            <div class="progress-text">
              {{ conversionProgress }}% Complete
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="conversionError" class="error-section">
            <div class="error-message">
              <span class="error-icon">⚠️</span>
              {{ conversionError }}
            </div>
            <button @click="resetConversion" class="retry-btn">
              {{ languageStore.t.retry }}
            </button>
          </div>

          <!-- Conversion Results -->
          <div v-if="conversionComplete && convertedFile" class="results-section">
            <div class="result-panel">
              <div class="result-header">
                <h3>✅ {{ languageStore.t.compressionComplete }}</h3>
              </div>
              <div class="result-content">
                <div class="file-info">
                  <div class="file-name">
                    {{ selectedFile?.name.split('.')[0] }}.{{ outputFormat }}
                  </div>
                  <div class="file-size">
                    {{ (convertedFile.size / 1024 / 1024).toFixed(2) }} MB
                  </div>
                </div>
                <div class="result-actions">
                  <button @click="downloadConvertedFile" class="download-btn">
                    {{ languageStore.t.download }}
                  </button>
                  <button @click="resetConversion" class="retry-btn">
                    {{ languageStore.t.compressAgain }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Info Section -->
        <div class="converter-info">
          <p>{{ languageStore.t.audioDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
