<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

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
        <h2 class="text-xl font-bold text-white tracking-tight">{{ languageStore.t.videoConverter }}</h2>
        <div class="w-[88px]"></div>
      </div>

      <div class="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        <!-- Upload Zone -->
        <div 
          v-if="!selectedFile"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-16 text-center cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:from-orange-500/10 hover:to-orange-500/5 hover:shadow-lg hover:shadow-orange-500/10"
          :class="{ 'border-orange-500! from-orange-500/20! to-orange-500/10! scale-[1.02]': isDragOver }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @click="fileInput?.click()"
        >
          <div class="absolute inset-0 opacity-30 pointer-events-none">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl"></div>
          </div>

          <div class="relative flex flex-col items-center gap-4">
            <div class="flex items-center justify-center h-20 w-20 rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:ring-orange-500/50">
              🎬
            </div>
            <div>
              <p class="text-lg font-semibold text-white mb-2">{{ languageStore.t.dropFile }}</p>
              <p class="text-sm text-gray-400">{{ languageStore.t.videoHint }}</p>
            </div>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept="video/*"
            @change="handleFileInput"
            class="hidden"
          />
        </div>

        <!-- Selected File Display -->
        <div v-else class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div class="flex items-start gap-4">
            <div class="text-3xl">🎬</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-white truncate mb-1">{{ selectedFile.name }}</p>
              <p v-if="detectedFormat" class="text-sm text-gray-400">
                {{ languageStore.t.selectedFile }}: {{ formatDisplayName(detectedFormat) }}
              </p>
              <p v-else class="text-sm text-gray-400">
                {{ languageStore.t.selectedFile }}: {{ selectedFile.type || 'Unknown' }}
              </p>
              <p class="text-sm text-gray-400">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
            </div>
            <button @click="removeFile" class="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              ×
            </button>
          </div>
        </div>

        <!-- Settings -->
        <div v-if="selectedFile" class="space-y-6">
          <!-- Output Format Selection -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">{{ languageStore.t.selectOutputFormat }}</label>
            <select v-model="outputFormat" class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-orange-500/50 transition-colors">
              <option v-for="format in supportedFormats" :key="format" :value="format">
                {{ formatDisplayName(format) }}{{ format === detectedFormat ? ' (Current)' : '' }}
              </option>
            </select>
          </div>

          <!-- Basic Settings -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Frame Rate (fps)</label>
              <select v-model="frameRate" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                <option v-for="rate in frameRateOptions" :key="rate" :value="rate">{{ rate }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">{{ languageStore.t.bitrate }} (kbps)</label>
              <select v-model="bitrate" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                <option v-for="rate in bitrateOptions" :key="rate" :value="rate">{{ rate }}</option>
              </select>
            </div>
          </div>

          <!-- Advanced Settings Toggle -->
          <button
            @click="showAdvanced = !showAdvanced"
            class="w-full flex items-center justify-between px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
          >
            <span>{{ languageStore.t.advanced }}</span>
            <svg class="h-5 w-5 transition-transform" :class="{ 'rotate-180': showAdvanced }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Advanced Settings Panel -->
          <div v-if="showAdvanced" class="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-white mb-2">Video Codec</label>
                <select v-model="videoCodec" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                  <option v-for="codec in supportedCodecs" :key="codec" :value="codec">{{ codecDisplayName(codec) }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-white mb-2">Width (px)</label>
                <input v-model.number="width" type="number" min="1" placeholder="Auto" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
              </div>
              <div>
                <label class="block text-sm font-medium text-white mb-2">Height (px)</label>
                <input v-model.number="height" type="number" min="1" placeholder="Auto" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
              </div>
              <div>
                <label class="block text-sm font-medium text-white mb-2">Fit</label>
                <select v-model="fit" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                  <option v-for="option in fitOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-white mb-2">Rotation</label>
                <select v-model="rotate" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                  <option v-for="option in rotateOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-white mb-2">Enable Crop</label>
                <button
                  @click="crop = crop ? null : { left: 0, top: 0, width: 100, height: 100 }"
                  class="w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all"
                  :class="crop !== null
                    ? 'border-transparent bg-orange-500 text-white shadow-[0_10px_40px_-15px_rgba(249,115,22,0.8)]'
                    : 'border-white/10 bg-zinc-900 text-slate-200 hover:border-white/20 hover:bg-zinc-800'"
                >
                  {{ crop ? 'Enabled' : 'Disabled' }}
                </button>
              </div>
            </div>

            <div v-if="crop" class="rounded-xl border border-white/10 bg-zinc-900/80 p-4 space-y-4">
              <h4 class="text-sm font-medium text-white">Crop Settings</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label class="block text-xs uppercase tracking-wide text-gray-400 mb-1">Left (px)</label>
                  <input v-model.number="crop.left" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-white focus:outline-none focus:border-orange-500/50">
                </div>
                <div>
                  <label class="block text-xs uppercase tracking-wide text-gray-400 mb-1">Top (px)</label>
                  <input v-model.number="crop.top" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-white focus:outline-none focus:border-orange-500/50">
                </div>
                <div>
                  <label class="block text-xs uppercase tracking-wide text-gray-400 mb-1">Width (px)</label>
                  <input v-model.number="crop.width" type="number" min="1" class="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-white focus:outline-none focus:border-orange-500/50">
                </div>
                <div>
                  <label class="block text-xs uppercase tracking-wide text-gray-400 mb-1">Height (px)</label>
                  <input v-model.number="crop.height" type="number" min="1" class="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-white focus:outline-none focus:border-orange-500/50">
                </div>
              </div>
            </div>
          </div>

          <!-- Convert Button -->
          <button
            @click="convertVideo"
            :disabled="!canConvert"
            class="w-full px-6 py-4 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isConverting ? languageStore.t.compressing || 'Processing…' : languageStore.t.convertVideo || 'Convert Video' }}
          </button>

          <!-- Progress -->
          <div v-if="isConverting" class="space-y-3">
            <div class="h-3 rounded-full bg-white/10 overflow-hidden">
              <div class="h-full bg-linear-to-r from-orange-500 to-orange-600 transition-all duration-300" :style="{ width: `${conversionProgress}%` }"></div>
            </div>
            <p class="text-center text-sm font-medium text-white">{{ conversionProgress }}% Complete</p>
          </div>

          <!-- Error -->
          <div v-if="conversionError" class="rounded-xl border border-red-500/30 bg-red-500/10 p-6 space-y-4">
            <div class="flex items-start gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <p class="font-semibold text-red-300 mb-1">{{ languageStore.t.error || 'Conversion Failed' }}</p>
                <p class="text-sm text-red-200">{{ conversionError }}</p>
              </div>
            </div>
            <button @click="resetConversion" class="w-full px-4 py-3 rounded-lg border border-red-500/50 bg-red-500/20 text-red-200 font-medium transition-colors hover:bg-red-500/30">
              {{ languageStore.t.retry }}
            </button>
          </div>

          <!-- Success -->
          <div v-if="conversionComplete && convertedFile" class="rounded-xl border border-green-500/30 bg-green-500/10 p-6 space-y-4">
            <div class="text-center">
              <p class="inline-flex items-center gap-2 text-lg font-semibold text-green-300 mb-2">
                <span class="text-2xl">✓</span>
                {{ languageStore.t.compressionComplete || 'Conversion Complete' }}
              </p>
            </div>

            <div class="rounded-lg border border-white/10 bg-white/5 p-4">
              <p class="font-semibold text-white truncate">{{ selectedFile?.name.split('.')[0] }}.{{ outputFormat }}</p>
              <p class="text-sm text-gray-400">{{ (convertedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button @click="downloadConvertedFile" class="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold transition-colors hover:bg-orange-600">
                📥 {{ languageStore.t.download }}
              </button>
              <button @click="resetConversion" class="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold transition-colors hover:bg-white/10">
                🔄 {{ languageStore.t.compressAgain }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Info Section -->
        <div class="rounded-lg border border-white/10 bg-white/5 p-4">
          <p class="text-sm text-gray-400">{{ languageStore.t.videoDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template>