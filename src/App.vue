<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useLanguageStore } from '@/stores/language'
import ThemeToggle from '@/components/ThemeToggle.vue'
import AppFooter from '@/components/AppFooter.vue'
import '@/assets/styles/minimal.css'

const themeStore = useThemeStore()
const languageStore = useLanguageStore()

onMounted(() => {
  themeStore.initializeTheme()
  languageStore.initializeLanguage()
})
</script>

<template>
  <div id="app">
    <RouterView />
    <ThemeToggle />
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
  background: linear-gradient(135deg, #1a0b0b 0%, #110a0a 50%, #1a1b1f 100%);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Blur overlay */
#app::after {
  content: '';
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(1px);
  pointer-events: none;
}
</style>
