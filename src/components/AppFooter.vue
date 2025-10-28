<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const languageStore = useLanguageStore()

const navigateTo = (route: string) => {
  router.push(route)
}

// const toggleLanguage = () => {
//   const newLang = languageStore.currentLanguage === 'en' ? 'es' : 'en'
//   languageStore.setLanguage(newLang)
// }
</script>

<template>
  <footer class="app-footer" style="background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); padding: 2rem 0; margin-top: auto;">
    <div class="container">
      <div class="grid grid--2 gap--xl flex--center" style="align-items: start;">
        <div class="quick-access">
          <h3 class="text--lg font--medium text--white" style="margin-bottom: 1rem; opacity: 0.9;">{{ languageStore.t.quickAccess }}</h3>
          <div class="flex flex--wrap gap--md">
            <button @click="navigateTo('/image')" class="btn access-btn">
              <span>{{ languageStore.t.image }}</span>
            </button>
            <button @click="navigateTo('/audio')" class="btn access-btn">
              <span>{{ languageStore.t.audio }}</span>
            </button>
            <button @click="navigateTo('/video')" class="btn access-btn">
              <span>{{ languageStore.t.video }}</span>
            </button>
            <button @click="navigateTo('/compress')" class="btn access-btn">
              <span>{{ languageStore.t.compress }}</span>
            </button>
          </div>
        </div>
        
        <div class="language-section">
          <h3 class="text--lg font--medium text--white" style="margin-bottom: 1rem; opacity: 0.9;">{{ languageStore.t.changeLanguage }}</h3>
          <div class="flex gap--sm">
            <button 
              @click="languageStore.setLanguage('en')" 
              :class="['btn btn--sm', { 'btn--active': languageStore.currentLanguage === 'en' }]"
            >
              🇺🇸 {{ languageStore.t.english }}
            </button>
            <button 
              @click="languageStore.setLanguage('es')" 
              :class="['btn btn--sm', { 'btn--active': languageStore.currentLanguage === 'es' }]"
            >
              🇪🇸 {{ languageStore.t.spanish }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@media (max-width: 768px) {
  .grid--2 {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .flex--wrap {
    justify-content: center;
  }
  
  .flex.gap--sm {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .flex--wrap {
    flex-direction: column;
    align-items: center;
  }
  
  .access-btn {
    width: 200px;
    justify-content: center;
  }
}
</style>