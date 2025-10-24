<script setup lang="ts">
import { useRouter } from 'vue-router'
import '@/assets/styles/popup.css'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="popup-overlay">
    <div class="popup-container">
      <div class="popup-header">
        <button @click="goBack" class="back-btn">← Back</button>
        <h2>Video Compressor</h2>
      </div>
      
      <div class="popup-content">
        <div class="upload-area">
          <div class="upload-box">
            <div class="upload-icon">🗜️</div>
            <p>Drop your video file here or click to browse</p>
            <p class="upload-hint">Compress with custom bitrate settings</p>
          </div>
        </div>
        
        <div class="converter-info">
          <p>Reduce video file size</p>
        </div>
      </div>
    </div>
  </div>
</template>
