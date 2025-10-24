<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import '@/assets/styles/popup.css'

const router = useRouter()
const languageStore = useLanguageStore()

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="popup-overlay">
    <div class="popup-container">
      <div class="popup-header">
        <button @click="goBack" class="back-btn">{{ languageStore.t.back }}</button>
        <h2>{{ languageStore.t.videoConverter }}</h2>
      </div>
      
      <div class="popup-content">
        <div class="upload-area">
          <div class="upload-box">
            <div class="upload-icon">🎬</div>
            <p>{{ languageStore.t.dropFile }}</p>
            <p class="upload-hint">{{ languageStore.t.videoHint }}</p>
          </div>
        </div>
        
        <div class="converter-info">
          <p>{{ languageStore.t.videoDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
