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
  Mp4OutputFormat,
  MovOutputFormat,
  WebMOutputFormat,
  MkvOutputFormat,
  ALL_FORMATS,
  getEncodableVideoCodecs
} from 'mediabunny'
import type { VideoCodec } from 'mediabunny'

const router = useRouter()
const languageStore = useLanguageStore()

// All possible formats we want to support
const allPossibleFormats = ['mp4', 'mov', 'webm', 'mkv'] as const
type VideoFormat = typeof allPossibleFormats[number]

// All possible video codecs
const allVideoCodecs = ['avc', 'hevc', 'vp9', 'av1', 'vp8'] as const
type VideoCodecType = typeof allVideoCodecs[number]

// Will be populated with browser-supported formats
const supportedFormats = ref<VideoFormat[]>([])
const supportedCodecs = ref<VideoCodecType[]>([])

// Reactive state
const selectedFile = ref<File | null>(null)
const detectedFormat = ref<VideoFormat | null>(null)
const outputFormat = ref<VideoFormat>('mp4')
const showAdvanced = ref(false)
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Conversion state
const isConverting = ref(false)
const conversionProgress = ref(0)
const conversionError = ref<string | null>(null)
const convertedFile = ref<Blob | null>(null)
const conversionComplete = ref(false)

// Basic settings
const frameRate = ref(30)
const bitrate = ref(2000) // kbps

// Advanced settings
const width = ref<number | null>(null)
const height = ref<number | null>(null)
const fit = ref<'fill' | 'contain' | 'cover'>('contain')
const rotate = ref<0 | 90 | 180 | 270>(0)
const crop = ref<{ left: number; top: number; width: number; height: number } | null>(null)
const videoCodec = ref<VideoCodecType>('avc')

// Options
const frameRateOptions = [15, 24, 25, 30, 48, 50, 60, 120]
const bitrateOptions = [500, 1000, 1500, 2000, 3000, 4000, 5000, 8000, 10000]
const fitOptions = [
  { value: 'fill', label: 'Fill' },
  { value: 'contain', label: 'Contain' },
  { value: 'cover', label: 'Cover' }
] as const
const rotateOptions = [
  { value: 0, label: '0°' },
  { value: 90, label: '90°' },
  { value: 180, label: '180°' },
  { value: 270, label: '270°' }
] as const

// Check which video codecs are supported by the browser
const checkSupportedCodecs = async () => {
  try {
    console.log('Checking supported video codecs...')
    
    const encodableCodecs = await getEncodableVideoCodecs([...allVideoCodecs] as VideoCodec[], {
      width: 1920,
      height: 1080,
      bitrate: 2000000
    })
    
    console.log('Encodable video codecs:', encodableCodecs)
    
    // Filter our supported codecs to only include those that can be encoded
    const detectedCodecs = allVideoCodecs.filter(codec => 
      encodableCodecs.includes(codec as VideoCodec)
    ) as VideoCodecType[]
    
    supportedCodecs.value = detectedCodecs
    
    console.log('Supported video codecs for this browser:', supportedCodecs.value)
    
    // Set default codec to first supported one
    if (supportedCodecs.value.length > 0) {
      videoCodec.value = supportedCodecs.value[0]!
    }
    
    // For now, assume all formats are supported (they use different containers)
    supportedFormats.value = [...allPossibleFormats]
    
    // Set default output format
    if (supportedFormats.value.length > 0) {
      outputFormat.value = supportedFormats.value[0]!
    }
  } catch (error) {
    console.error('Error checking supported codecs:', error)
    // Fallback to basic formats if check fails
    supportedFormats.value = ['mp4', 'webm'] as VideoFormat[]
    supportedCodecs.value = ['avc', 'vp9'] as VideoCodecType[]
    outputFormat.value = 'mp4'
    videoCodec.value = 'avc'
  }
}

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
  if (extension && supportedFormats.value.includes(extension as VideoFormat)) {
    detectedFormat.value = extension as VideoFormat
  } else {
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

const convertVideo = async () => {
  if (!selectedFile.value) return
  
  try {
    console.log('File:', selectedFile.value.name, 'Size:', selectedFile.value.size)
    console.log({
      outputFormat: outputFormat.value,
      videoCodec: videoCodec.value,
      frameRate: frameRate.value,
      bitrate: bitrate.value,
      width: width.value,
      height: height.value,
      fit: fit.value,
      rotate: rotate.value,
      crop: crop.value
    })
    
    isConverting.value = true
    conversionError.value = null
    conversionProgress.value = 0
    const inputSource = new BlobSource(selectedFile.value)
    
    const input = new Input({
      source: inputSource,
      formats: ALL_FORMATS
    })
    
    const getOutputFormat = (format: VideoFormat) => {
      switch (format) {
        case 'mp4': return new Mp4OutputFormat()
        case 'mov': return new MovOutputFormat()
        case 'webm': return new WebMOutputFormat()
        case 'mkv': return new MkvOutputFormat()
        default: return new Mp4OutputFormat()
      }
    }
    
    const outputTarget = new BufferTarget()

    const output = new Output({
      format: getOutputFormat(outputFormat.value),
      target: outputTarget
    })
    
    // Build video conversion options
    const videoOptions: {
      codec: VideoCodec
      bitrate: number
      frameRate?: number
      width?: number
      height?: number
      fit?: 'fill' | 'contain' | 'cover'
      rotate?: 0 | 90 | 180 | 270
      crop?: { left: number; top: number; width: number; height: number }
    } = {
      codec: videoCodec.value as VideoCodec,
      bitrate: bitrate.value * 1000, // Convert kbps to bps
      frameRate: frameRate.value
    }
    
    // Add optional video settings
    if (width.value !== null) videoOptions.width = width.value
    if (height.value !== null) videoOptions.height = height.value
    if (fit.value !== 'contain') videoOptions.fit = fit.value
    if (rotate.value !== 0) videoOptions.rotate = rotate.value
    if (crop.value !== null) videoOptions.crop = crop.value
    
    // Conversion 
    const conversion = await Conversion.init({
      input,
      output,
      video: videoOptions
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
      // Get proper MIME type for the format
      const getMimeType = (format: VideoFormat): string => {
        const mimeTypes: Record<VideoFormat, string> = {
          'mp4': 'video/mp4',
          'mov': 'video/quicktime',
          'webm': 'video/webm',
          'mkv': 'video/x-matroska'
        }
        return mimeTypes[format] || `video/${format}`
      }
      
      convertedFile.value = new Blob([outputTarget.buffer], { 
        type: getMimeType(outputFormat.value)
      })
      conversionComplete.value = true
    } else {
      console.warn('No buffer data')
    }
    
  } catch (error) {
    console.error('Conversion error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    })
    conversionError.value = error instanceof Error ? error.message : 'Conversion failed'
  } finally {
    isConverting.value = false
  }
}

const formatDisplayName = (format: VideoFormat) => {
  const names: Record<VideoFormat, string> = {
    'mp4': 'MP4',
    'mov': 'MOV',
    'webm': 'WebM',
    'mkv': 'MKV'
  }
  return names[format] || format.toUpperCase()
}

const codecDisplayName = (codec: VideoCodecType) => {
  const names: Record<VideoCodecType, string> = {
    'avc': 'H.264 (AVC)',
    'hevc': 'H.265 (HEVC)',
    'vp9': 'VP9',
    'av1': 'AV1',
    'vp8': 'VP8'
  }
  return names[codec] || codec.toUpperCase()
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
  return selectedFile.value && outputFormat.value && !isConverting.value && supportedFormats.value.length > 0
})

// Initialize codecs
checkSupportedCodecs()
</script>

<template>
  <div class="popup-overlay" @click="handleOverlayClick">
    <div class="popup-container">
      <div class="popup-header">
        <button @click="goBack" class="back-btn">{{ languageStore.t.back }}</button>
        <h2>{{ languageStore.t.videoConverter }}</h2>
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
            <div class="upload-icon">🎬</div>
            <p>{{ languageStore.t.dropFile }}</p>
            <p class="upload-hint">{{ languageStore.t.videoHint }}</p>
            <input 
              ref="fileInput"
              type="file" 
              accept="video/*"
              @change="handleFileInput"
              class="hidden"
            />
          </div>
          
          <!-- Selected File Display -->
          <div v-else class="selected-file">
            <div class="file-info">
              <div class="file-icon">🎬</div>
              <div class="file-details">
                <h3>{{ selectedFile.name }}</h3>
                <p v-if="detectedFormat" class="file-format">
                  {{ languageStore.t.selectedFile }}: {{ formatDisplayName(detectedFormat) }}
                </p>
                <p v-else class="file-format">
                  {{ languageStore.t.selectedFile }}: {{ selectedFile.type || 'Unknown' }}
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
              >
                {{ formatDisplayName(format) }}
                <span v-if="format === detectedFormat"> (Current)</span>
              </option>
            </select>
          </div>

          <!-- Basic Settings -->
          <div class="settings-grid">
            <!-- Frame Rate -->
            <div class="setting-group">
              <label class="setting-label">Frame Rate (fps)</label>
              <select v-model="frameRate" class="setting-select">
                <option v-for="rate in frameRateOptions" :key="rate" :value="rate">
                  {{ rate }}
                </option>
              </select>
            </div>

            <!-- Bitrate -->
            <div class="setting-group">
              <label class="setting-label">{{ languageStore.t.bitrate }} (kbps)</label>
              <select v-model="bitrate" class="setting-select">
                <option v-for="rate in bitrateOptions" :key="rate" :value="rate">
                  {{ rate }}
                </option>
              </select>
            </div>
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
              <!-- Video Codec -->
              <div class="setting-group">
                <label class="setting-label">Video Codec</label>
                <select v-model="videoCodec" class="setting-select">
                  <option 
                    v-for="codec in supportedCodecs" 
                    :key="codec" 
                    :value="codec"
                  >
                    {{ codecDisplayName(codec) }}
                  </option>
                </select>
              </div>

              <!-- Width -->
              <div class="setting-group">
                <label class="setting-label">Width (px)</label>
                <input 
                  v-model.number="width" 
                  type="number" 
                  class="setting-input"
                  placeholder="Auto"
                  min="1"
                />
              </div>

              <!-- Height -->
              <div class="setting-group">
                <label class="setting-label">Height (px)</label>
                <input 
                  v-model.number="height" 
                  type="number" 
                  class="setting-input"
                  placeholder="Auto"
                  min="1"
                />
              </div>

              <!-- Fit -->
              <div class="setting-group">
                <label class="setting-label">Fit</label>
                <select v-model="fit" class="setting-select">
                  <option 
                    v-for="option in fitOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- Rotation -->
              <div class="setting-group">
                <label class="setting-label">Rotation</label>
                <select v-model="rotate" class="setting-select">
                  <option 
                    v-for="option in rotateOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- Crop Toggle -->
              <div class="setting-group">
                <label class="setting-label">Enable Crop</label>
                <button 
                  @click="crop = crop ? null : { left: 0, top: 0, width: 100, height: 100 }"
                  class="toggle-btn"
                  :class="{ active: crop !== null }"
                >
                  {{ crop ? 'Enabled' : 'Disabled' }}
                </button>
              </div>
            </div>

            <!-- Crop Settings -->
            <div v-if="crop" class="crop-settings">
              <h4>Crop Settings</h4>
              <div class="crop-grid">
                <div class="setting-group">
                  <label class="setting-label">Left (px)</label>
                  <input 
                    v-model.number="crop.left" 
                    type="number" 
                    class="setting-input"
                    min="0"
                  />
                </div>
                <div class="setting-group">
                  <label class="setting-label">Top (px)</label>
                  <input 
                    v-model.number="crop.top" 
                    type="number" 
                    class="setting-input"
                    min="0"
                  />
                </div>
                <div class="setting-group">
                  <label class="setting-label">Width (px)</label>
                  <input 
                    v-model.number="crop.width" 
                    type="number" 
                    class="setting-input"
                    min="1"
                  />
                </div>
                <div class="setting-group">
                  <label class="setting-label">Height (px)</label>
                  <input 
                    v-model.number="crop.height" 
                    type="number" 
                    class="setting-input"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Convert Button -->
          <div class="convert-section">
            <button 
              @click="convertVideo" 
              class="convert-btn"
              :disabled="!canConvert"
            >
              {{ isConverting ? 'Converting...' : 'Convert Video' }}
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
          <p>{{ languageStore.t.videoDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.crop-settings {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.crop-settings h4 {
  color: var(--color-white);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.crop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.setting-input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: var(--color-white);
  font-size: 0.9rem;
}

.setting-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.toggle-btn {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: var(--color-white);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.toggle-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .crop-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>