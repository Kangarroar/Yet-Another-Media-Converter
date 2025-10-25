<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const languageStore = useLanguageStore()

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="home-container">
    <div class="content">
      <h1 class="title">{{ languageStore.t.title }}</h1>
      <p class="subtitle">{{ languageStore.t.subtitle }}</p>
      
      <div class="buttons-grid">
        <button @click="navigateTo('/image')" class="converter-btn">
          <div class="btn-icon">🖼️</div>
          <span>{{ languageStore.t.image }}</span>
        </button>
        
        <button @click="navigateTo('/audio')" class="converter-btn">
          <div class="btn-icon">🎵</div>
          <span>{{ languageStore.t.audio }}</span>
        </button>
        
        <button @click="navigateTo('/video')" class="converter-btn">
          <div class="btn-icon">🎬</div>
          <span>{{ languageStore.t.video }}</span>
        </button>
        
        <button @click="navigateTo('/compress')" class="converter-btn">
          <div class="btn-icon">🗜️</div>
          <span>{{ languageStore.t.compress }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.content {
  text-align: center;
  max-width: 600px;
}

.title {
  font-size: 3.5rem;
  font-weight: 300;
  color: #ffffff;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.2rem;
  color: #a0a0a0;
  margin-bottom: 3rem;
  font-weight: 400;
}

.buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.converter-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  min-height: 120px;
  justify-content: center;
}

.converter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.btn-icon {
  font-size: 2rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .buttons-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .converter-btn {
    padding: 1.5rem 1rem;
    min-height: 100px;
  }
}

@media (max-width: 480px) {
  .buttons-grid {
    grid-template-columns: 1fr;
  }
}
</style>
