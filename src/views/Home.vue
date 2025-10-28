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
  <div class="home-container flex flex--center" style="min-height: 100vh; padding: 2rem; position: relative; z-index: 1;">
    <div class="content text--center" style="max-width: 600px;">
      <h1 class="text--6xl font--light text--white" style="margin-bottom: 1rem; letter-spacing: -0.02em;">{{ languageStore.t.title }}</h1>
      <p class="text--lg text--secondary" style="margin-bottom: 3rem;">{{ languageStore.t.subtitle }}</p>
      
      <div class="grid grid--auto gap--lg" style="max-width: 500px; margin: 0 auto;">
        <button @click="navigateTo('/image')" class="btn btn--lg converter-btn">
          <div class="btn-icon">🖼️</div>
          <span>{{ languageStore.t.image }}</span>
        </button>
        
        <button @click="navigateTo('/audio')" class="btn btn--lg converter-btn">
          <div class="btn-icon">🎵</div>
          <span>{{ languageStore.t.audio }}</span>
        </button>
        
        <button @click="navigateTo('/video')" class="btn btn--lg converter-btn">
          <div class="btn-icon">🎬</div>
          <span>{{ languageStore.t.video }}</span>
        </button>
        
        <button @click="navigateTo('/compress')" class="btn btn--lg converter-btn">
          <div class="btn-icon">🗜️</div>
          <span>{{ languageStore.t.compress }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.converter-btn {
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  min-height: 120px;
  justify-content: center;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem 1.5rem;
}

.converter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.btn-icon {
  font-size: 2rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .converter-btn {
    padding: 1.5rem 1rem;
    min-height: 100px;
  }
}
</style>
