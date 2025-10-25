<script setup lang="ts">
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { VideoCompressor } from '@/modules/compress/compressor'
import type { CompressionResult } from '@/types/compression'
import '@/assets/styles/video-compression.css'

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
</script>

<template>
  <div class="result-panel">
    <div class="result-header">
      <h3>{{ languageStore.t.compressionComplete }}</h3>
    </div>
    
    <div class="result-content">
      <div class="file-info">
        <div class="file-name">
          <strong>{{ result.originalFileName }}</strong>
        </div>
      </div>
      
      <div class="size-comparison">
        <div class="size-item original">
          <div class="size-label">{{ languageStore.t.originalSize }}</div>
          <div class="size-value">{{ formatFileSize(result.originalSize) }}</div>
        </div>
        
        <div class="size-arrow">→</div>
        
        <div class="size-item compressed">
          <div class="size-label">{{ languageStore.t.compressedSize }}</div>
          <div class="size-value">{{ formatFileSize(result.compressedSize) }}</div>
        </div>
      </div>
      
      <div class="compression-stats">
        <div class="stat-item">
          <span class="stat-label">{{ languageStore.t.saved }}:</span>
          <span class="stat-value saved">{{ sizeDifferenceFormatted }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ languageStore.t.compressionRatio }}:</span>
          <span class="stat-value ratio">{{ compressionPercentage }}%</span>
        </div>
      </div>
      
      <div class="visual-indicator">
        <div class="size-bar">
          <div 
            class="size-bar-fill" 
            :style="{ width: `${100 - compressionPercentage}%` }"
          ></div>
        </div>
        <div class="bar-labels">
          <span>{{ languageStore.t.originalSize }}</span>
          <span>{{ languageStore.t.compressedSize }}</span>
        </div>
      </div>
    </div>
    
    <div class="result-actions">
      <button @click="onDownload" class="download-btn">
        📥 {{ languageStore.t.download }}
      </button>
      <button @click="onRetry" class="retry-btn">
        🔄 {{ languageStore.t.compressAgain }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* All styles moved to video-compression.css */
</style>
