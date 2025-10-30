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
  Mp3OutputFormat,
  AdtsOutputFormat,
  OggOutputFormat,
  FlacOutputFormat,
  WavOutputFormat,
  ALL_FORMATS,
  getEncodableAudioCodecs
} from 'mediabunny'
import type { AudioCodec } from 'mediabunny'

// Register MP3 encoder
import { registerMp3Encoder } from '@mediabunny/mp3-encoder'
registerMp3Encoder()

const router = useRouter()
const languageStore = useLanguageStore()
const allPossibleFormats = ['aac', 'opus', 'mp3', 'vorbis', 'flac', 'wav'] as const
type AudioFormat = typeof allPossibleFormats[number]

// Will be populated with browser-supported formats
const supportedFormats = ref<AudioFormat[]>([])

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

// Advanced
const bitrate = ref(128)
const bitrateMode = ref<'constant' | 'variable'>('variable')
const channels = ref(2)
const sampleRate = ref(44100)

// Bitrate
const bitrateOptions = [64, 96, 128, 160, 192, 256, 320]

// Sample rate
const sampleRateOptions = [8000, 11025, 16000, 22050, 32000, 44100, 48000, 88200, 96000]

// Check which audio codecs are supported by the browser
const checkSupportedCodecs = async () => {
  try {
    console.log('Checking supported audio codecs...')
    const compressedFormats = allPossibleFormats.filter(f => f !== 'wav') as AudioCodec[]
    const encodableCodecs = await getEncodableAudioCodecs([...compressedFormats] as AudioCodec[], {
      numberOfChannels: 2,
      sampleRate: 44100,
      bitrate: 128000
    })
    
    console.log('Encodable codecs:', encodableCodecs)
    
    const detectedFormats = allPossibleFormats.filter(format => {
      if (format === 'wav') return true // WAV always supported 
      if (format === 'mp3') return true // MP3 is almost always supported
      return encodableCodecs.includes(format as AudioCodec)
    }) as AudioFormat[]
    
    supportedFormats.value = detectedFormats
    
    console.log('Supported formats for this browser:', supportedFormats.value)
    
    // Set default output format to first supported format
    if (supportedFormats.value.length > 0) {
      outputFormat.value = supportedFormats.value[0]!
    }
  } catch (error) {
    console.error('Error checking supported codecs:', error)
    // Fallback to basic formats if check fails
    supportedFormats.value = ['mp3', 'aac', 'wav'] as AudioFormat[]
    outputFormat.value = 'mp3'
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
  if (extension && supportedFormats.value.includes(extension as AudioFormat)) {
    detectedFormat.value = extension as AudioFormat
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

const convertAudio = async () => {
  if (!selectedFile.value) return
  
  try {
    console.log('File:', selectedFile.value.name, 'Size:', selectedFile.value.size)
    console.log({
      outputFormat: outputFormat.value,
      bitrate: bitrate.value,
      bitrateMode: bitrateMode.value,
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
    
    const getOutputFormat = (format: AudioFormat) => {
      switch (format) {
        case 'mp3': return new Mp3OutputFormat()
        case 'aac': return new AdtsOutputFormat() 
        case 'opus': return new OggOutputFormat() 
        case 'vorbis': return new OggOutputFormat() 
        case 'flac': return new FlacOutputFormat()
        case 'wav': return new WavOutputFormat()
        default: return new Mp3OutputFormat()
      }
    }
    
    const getCodecForFormat = (format: AudioFormat): AudioCodec => {
      if (format === 'wav') {
        return 'pcm-s16'
      }
      return format as AudioCodec
    }
    
    const outputTarget = new BufferTarget()

    const output = new Output({
      format: getOutputFormat(outputFormat.value),
      target: outputTarget
    })

    const audioOptions: {
      codec: AudioCodec
      numberOfChannels: number
      sampleRate: number
      bitrateMode?: 'constant' | 'variable'
      bitrate?: number
    } = {
      codec: getCodecForFormat(outputFormat.value),
      numberOfChannels: channels.value,
      sampleRate: sampleRate.value
    }
    
    // Only add bitrate for compressed formats
    if (outputFormat.value !== 'wav') {
      audioOptions.bitrate = bitrate.value * 1000 // Convert kbps to bps
      audioOptions.bitrateMode = bitrateMode.value
    }
    
    // Conversion 
    const conversion = await Conversion.init({
      input,
      output,
      audio: audioOptions
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
      const getMimeType = (format: AudioFormat): string => {
        const mimeTypes: Record<AudioFormat, string> = {
          'mp3': 'audio/mpeg',
          'aac': 'audio/aac',
          'opus': 'audio/opus',
          'vorbis': 'audio/vorbis',
          'flac': 'audio/flac',
          'wav': 'audio/wav'
        }
        return mimeTypes[format] || `audio/${format}`
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

const formatDisplayName = (format: AudioFormat) => {
  const names: Record<AudioFormat, string> = {
    'mp3': 'MP3',
    'aac': 'AAC',
    'opus': 'Opus',
    'vorbis': 'Vorbis',
    'flac': 'FLAC',
    'wav': 'WAV'
  }
  return names[format] || format.toUpperCase()
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
  <!-- Overlay -->
  <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 sm:p-6" @click="handleOverlayClick">
    <!-- Modal Container -->
    <div class="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/95 backdrop-blur-3xl shadow-2xl shadow-black/50 ring-1 ring-white/5" @click.stop>
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-8 py-5 backdrop-blur-sm">
        <button @click="goBack" class="group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white">
          <svg class="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          {{ languageStore.t.back }}
        </button>
        <h2 class="text-xl font-bold text-white tracking-tight">{{ languageStore.t.audioConverter }}</h2>
        <div class="w-[88px]"></div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        
        <!-- Upload Zone -->
        <div 
          v-if="!selectedFile"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-16 text-center cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:from-orange-500/10 hover:to-orange-500/5 hover:shadow-lg hover:shadow-orange-500/10"
          :class="{ '!border-orange-500 !from-orange-500/20 !to-orange-500/10 scale-[1.02]': isDragOver }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @click="fileInput?.click()"
        >
          <!-- Background glow -->
          <div class="absolute inset-0 opacity-30 pointer-events-none">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl"></div>
          </div>
          
          <!-- Content -->
          <div class="relative flex flex-col items-center gap-4">
            <div class="flex items-center justify-center h-20 w-20 rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:ring-orange-500/50">
              🎵
            </div>
            <div>
              <p class="text-lg font-semibold text-white mb-2">{{ languageStore.t.dropFile }}</p>
              <p class="text-sm text-gray-400">{{ languageStore.t.audioHint }}</p>
            </div>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept="audio/*"
            @change="handleFileInput"
            class="hidden"
          />
        </div>

        <!-- File Selected -->
        <div v-else class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div class="flex items-center gap-4">
            <div class="text-3xl">🎵</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-white truncate mb-1">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-400">
                {{ detectedFormat ? formatDisplayName(detectedFormat) : selectedFile.type }} · 
                {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
              </p>
            </div>
            <button 
              @click="removeFile" 
              class="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Settings -->
        <div v-if="selectedFile" class="space-y-6">
          
          <!-- Format Selection -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">Output Format</label>
            <select 
              v-model="outputFormat" 
              class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            >
              <option v-for="format in supportedFormats" :key="format" :value="format">
                {{ formatDisplayName(format) }}{{ format === detectedFormat ? ' (Current)' : '' }}
              </option>
            </select>
          </div>

          <!-- Advanced Toggle -->
          <button 
            @click="showAdvanced = !showAdvanced" 
            class="w-full flex items-center justify-between px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
          >
            <span>{{ languageStore.t.advanced }}</span>
            <svg class="h-5 w-5 transition-transform" :class="{ 'rotate-180': showAdvanced }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Advanced Panel -->
          <div v-if="showAdvanced" class="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div v-if="outputFormat !== 'wav'">
                <label class="block text-sm font-medium text-white mb-2">Bitrate Mode</label>
                <select v-model="bitrateMode" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                  <option value="variable">Variable</option>
                  <option value="constant">Constant</option>
                </select>
              </div>

              <div v-if="outputFormat !== 'wav'">
                <label class="block text-sm font-medium text-white mb-2">Bitrate (kbps)</label>
                <select v-model="bitrate" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                  <option v-for="rate in bitrateOptions" :key="rate" :value="rate">{{ rate }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-white mb-2">Channels</label>
                <select v-model="channels" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                  <option :value="1">Mono</option>
                  <option :value="2">Stereo</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-white mb-2">Sample Rate (Hz)</label>
                <select v-model="sampleRate" class="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-900 text-white focus:outline-none focus:border-orange-500/50">
                  <option v-for="rate in sampleRateOptions" :key="rate" :value="rate">{{ rate.toLocaleString() }}</option>
                </select>
              </div>

            </div>
          </div>

          <!-- Convert Button -->
          <button 
            @click="convertAudio" 
            :disabled="!canConvert"
            class="w-full px-6 py-4 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ isConverting ? 'Converting...' : 'Convert Audio' }}
          </button>

          <!-- Progress -->
          <div v-if="isConverting" class="space-y-3">
            <div class="h-3 rounded-full bg-white/10 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300" :style="{ width: `${conversionProgress}%` }"></div>
            </div>
            <p class="text-center text-sm font-medium text-white">{{ conversionProgress }}% Complete</p>
          </div>

          <!-- Error -->
          <div v-if="conversionError" class="rounded-xl border border-red-500/30 bg-red-500/10 p-6 space-y-4">
            <div class="flex items-start gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <p class="font-semibold text-red-300 mb-1">Conversion Failed</p>
                <p class="text-sm text-red-200">{{ conversionError }}</p>
              </div>
            </div>
            <button @click="resetConversion" class="w-full px-4 py-3 rounded-lg border border-red-500/50 bg-red-500/20 text-red-200 font-medium hover:bg-red-500/30 transition-colors">
              Retry
            </button>
          </div>

          <!-- Success -->
          <div v-if="conversionComplete && convertedFile" class="rounded-xl border border-green-500/30 bg-green-500/10 p-6 space-y-4">
            <div class="text-center">
              <p class="inline-flex items-center gap-2 text-lg font-semibold text-green-300 mb-2">
                <span class="text-2xl">✓</span>
                Conversion Complete
              </p>
            </div>
            
            <div class="rounded-lg border border-white/10 bg-white/5 p-4">
              <p class="font-semibold text-white truncate">{{ selectedFile?.name.split('.')[0] }}.{{ outputFormat }}</p>
              <p class="text-sm text-gray-400">{{ (convertedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button @click="downloadConvertedFile" class="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors">
                Download
              </button>
              <button @click="resetConversion" class="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors">
                Convert Again
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>
