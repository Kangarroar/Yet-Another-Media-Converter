<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const languageStore = useLanguageStore()

const navigateTo = (route: string) => {
  router.push(route)
}

const toggleLanguage = () => {
  const newLang = languageStore.currentLanguage === 'en' ? 'es' : 'en'
  languageStore.setLanguage(newLang)
}
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="quick-access">
        <h3>{{ languageStore.t.quickAccess }}</h3>
        <div class="access-buttons">
          <button @click="navigateTo('/image')" class="access-btn">
            <span>{{ languageStore.t.image }}</span>
          </button>
          <button @click="navigateTo('/audio')" class="access-btn">
            <span>{{ languageStore.t.audio }}</span>
          </button>
          <button @click="navigateTo('/video')" class="access-btn">
            <span>{{ languageStore.t.video }}</span>
          </button>
          <button @click="navigateTo('/compress')" class="access-btn">
            <span>{{ languageStore.t.compress }}</span>
          </button>
        </div>
      </div>
      
      <div class="language-section">
        <h3>{{ languageStore.t.changeLanguage }}</h3>
        <div class="language-buttons">
          <button 
            @click="languageStore.setLanguage('en')" 
            :class="['lang-btn', { active: languageStore.currentLanguage === 'en' }]"
          >
            🇺🇸 {{ languageStore.t.english }}
          </button>
          <button 
            @click="languageStore.setLanguage('es')" 
            :class="['lang-btn', { active: languageStore.currentLanguage === 'es' }]"
          >
            🇪🇸 {{ languageStore.t.spanish }}
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>


<style scoped>
/* POR FAVOR DEJA DE BLURREARTE */
.app-footer {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3rem;
  align-items: start;
}

.quick-access h3,
.language-section h3 {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.access-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.access-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.8rem 1.2rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.access-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.1rem;
}

.language-buttons {
  display: flex;
  gap: 0.5rem;
}

.lang-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 500;
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.lang-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 1rem;
  }
  
  .access-buttons {
    justify-content: center;
  }
  
  .language-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .access-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .access-btn {
    width: 200px;
    justify-content: center;
  }
}
</style>