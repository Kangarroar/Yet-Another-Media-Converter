<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const languageStore = useLanguageStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const detectedFormat = ref<string | null>(null)
const isDragOver = ref(false)

const availableFormats = ['jpg', 'png', 'webp', 'avif', 'bmp', 'tiff'] as const
const outputFormat = ref<typeof availableFormats[number]>('webp')
const quality = ref(80)

const formattedFileSize = computed(() => {
  if (!selectedFile.value) return '0 MB'
  return `${(selectedFile.value.size / 1024 / 1024).toFixed(2)} MB`
})

const goBack = () => {
  router.push('/')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    goBack()
  }
}

const handleFileSelect = (file: File) => {
  selectedFile.value = file
  const extension = file.name.split('.').pop()?.toLowerCase() || null
  detectedFormat.value = extension
  if (extension && availableFormats.includes(extension as typeof availableFormats[number])) {
    outputFormat.value = extension as typeof availableFormats[number]
  }
}

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFileSelect(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFileSelect(file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const removeFile = () => {
  selectedFile.value = null
  detectedFormat.value = null
  quality.value = 80
}

const canConvert = computed(() => !!selectedFile.value)

const convertImage = () => {
  if (!selectedFile.value) return
  console.log('Pretend converting image with settings:', {
    file: selectedFile.value.name,
    outputFormat: outputFormat.value,
    quality: quality.value
  })
  alert(languageStore.t.comingSoon || 'Conversion coming soon!')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6" @click="handleOverlayClick">
    <div class="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-linear-to-b from-zinc-900/95 to-black/95 backdrop-blur-3xl shadow-2xl shadow-black/50 ring-1 ring-white/5" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/5 bg-white/2 px-8 py-5 backdrop-blur-sm">
        <button @click="goBack" class="group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white">
          <svg class="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ languageStore.t.back }}
        </button>
        <h2 class="text-xl font-bold text-white tracking-tight">{{ languageStore.t.imageConverter }}</h2>
        <div class="w-[88px]"></div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        <!-- Upload Zone -->
        <div v-if="!selectedFile"
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
            <div class="flex items-center justify-center h-20 w-20 rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:ring-orange-500/50">🖼️</div>
            <div>
              <p class="text-lg font-semibold text-white mb-2">{{ languageStore.t.dropFile }}</p>
              <p class="text-sm text-gray-400">{{ languageStore.t.imageHint }}</p>
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileInput"
            class="hidden"
          />
        </div>

        <!-- Selected File -->
        <div v-else class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-6">
          <div class="flex items-start gap-4">
            <div class="text-3xl">🖼️</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-white truncate mb-1">{{ selectedFile?.name }}</p>
              <p v-if="detectedFormat" class="text-sm text-gray-400">
                {{ languageStore.t.selectedFile }}: {{ detectedFormat.toUpperCase() }}
              </p>
              <p v-else class="text-sm text-gray-400">
                {{ languageStore.t.selectedFile }}: {{ selectedFile?.type || 'Unknown' }}
              </p>
              <p class="text-sm text-gray-400">{{ formattedFileSize }}</p>
            </div>
            <button @click="removeFile" class="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">×</button>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-white mb-2">{{ languageStore.t.selectOutputFormat || 'Output Format' }}</label>
              <select v-model="outputFormat" class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-orange-500/50 transition-colors">
                <option v-for="format in availableFormats" :key="format" :value="format">
                  {{ format.toUpperCase() }}
                </option>
              </select>
            </div>

            <div>
              <label class="flex items-center justify-between text-sm font-medium text-white mb-2">
                <span>{{ languageStore.t.compression || 'Compression Quality' }}</span>
                <span class="text-sm text-gray-400">{{ quality }}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                v-model.number="quality"
                class="w-full accent-orange-500"
              />
              <p class="mt-1 text-xs text-gray-500">{{ languageStore.t.qualityHint || 'Higher quality means larger file size.' }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              @click="convertImage"
              :disabled="!canConvert"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ languageStore.t.convertImage || 'Convert Image' }}
            </button>
            <button
              @click="removeFile"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {{ languageStore.t.clear || 'Remove' }}
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <p class="text-sm text-gray-400">{{ languageStore.t.imageDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
