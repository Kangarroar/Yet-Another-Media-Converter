<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import AppFooter from '@/components/AppFooter.vue'

const languageStore = useLanguageStore()

onMounted(() => {
  languageStore.initializeLanguage()
})
</script>

<template>
  <div id="app">
    <RouterView />
  </div>

  <div id="footer">
    <AppFooter />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0b0b 0%, #110a0a 50%, #1f1a1a 100%);
  position: relative;
  overflow-x: hidden;
}

/* Blur overlay */
#app::after {
  content: '';
  position: static;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(1px);
  pointer-events: none;
}
</style>
