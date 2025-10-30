<script setup lang="ts">
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { VideoCompressor } from '@/modules/compress/compressor'
import type { CompressionResult } from '@/types/compression'

interface Props {
  result: CompressionResult
  onDownload: () => void
  onRetry: () => void
}

const props = defineProps<Props>()
const languageStore = useLanguageStore()

const formatFileSize = (bytes: number): string => {
  return VideoCompressor.formatFileSize(bytes)
}

const compressionPercentage = computed(() => {
  return Math.round(props.result.compressionRatio)
})

const sizeDifference = computed(() => {
  return props.result.originalSize - props.result.compressedSize
})

const sizeDifferenceFormatted = computed(() => {
  return formatFileSize(sizeDifference.value)
})

const compressedPercent = computed(() => {
  if (!props.result.originalSize) return 0
  return Math.round((props.result.compressedSize / props.result.originalSize) * 100)
})

const savingsPercent = computed(() => {
  return Math.max(0, 100 - compressedPercent.value)
})
</script>

<template>
  <div class="space-y-6 text-white">
    <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-2xl">✅</div>
          <div>
            <h3 class="text-lg font-semibold">{{ languageStore.t.compressionComplete }}</h3>
            <p class="text-sm text-gray-400 truncate">{{ props.result.originalFileName }}</p>
          </div>
        </div>
        <div class="rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-200">
          {{ savingsPercent }}% {{ languageStore.t.saved || 'Smaller' }}
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
          <p class="text-xs uppercase tracking-[0.25em] text-gray-400">{{ languageStore.t.originalSize }}</p>
          <p class="text-lg font-semibold">{{ formatFileSize(props.result.originalSize) }}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
          <p class="text-xs uppercase tracking-[0.25em] text-gray-400">{{ languageStore.t.compressedSize }}</p>
          <p class="text-lg font-semibold">{{ formatFileSize(props.result.compressedSize) }}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
          <p class="text-xs uppercase tracking-[0.25em] text-gray-400">{{ languageStore.t.saved }}</p>
          <p class="text-lg font-semibold text-green-300">{{ sizeDifferenceFormatted }}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
          <p class="text-xs uppercase tracking-[0.25em] text-gray-400">{{ languageStore.t.compressionRatio }}</p>
          <p class="text-lg font-semibold">{{ compressionPercentage }}%</p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="h-3 rounded-full border border-white/10 bg-black/40 overflow-hidden">
          <div class="h-full bg-linear-to-r from-orange-500 via-orange-400 to-green-500" :style="{ width: `${compressedPercent}%` }"></div>
        </div>
        <div class="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
          <span>{{ languageStore.t.originalSize }}</span>
          <span>{{ languageStore.t.compressedSize }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button
        @click="onDownload"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
      >
        📥 {{ languageStore.t.download }}
      </button>
      <button
        @click="onRetry"
        class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
      >
        🔄 {{ languageStore.t.compressAgain }}
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
