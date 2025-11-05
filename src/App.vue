<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import AppFooter from '@/components/AppFooter.vue'

const languageStore = useLanguageStore()
const showFooter = ref(false)

const evaluateScroll = () => {
  const scrollPosition = window.scrollY + window.innerHeight
  const docHeight = document.documentElement.scrollHeight
  const hasScroll = docHeight > window.innerHeight
  const threshold = docHeight - 140
  showFooter.value = hasScroll && scrollPosition >= threshold
}

onMounted(() => {
  languageStore.initializeLanguage()
  const schedule = () => requestAnimationFrame(() => requestAnimationFrame(evaluateScroll))
  schedule()
  window.addEventListener('load', evaluateScroll, { once: true })
  window.addEventListener('scroll', evaluateScroll, { passive: true })
  window.addEventListener('resize', evaluateScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', evaluateScroll)
  window.removeEventListener('resize', evaluateScroll)
})
</script>

<template>
  <div id="app" class="relative flex min-h-screen flex-col overflow-hidden">
    <!-- Decorative background with animation -->
    <div class="pointer-events-none absolute -top-112 -left-112 h-192 w-3xl rounded-full bg-orange-500/10 blur-3xl animate-pulse"></div>
    <div class="pointer-events-none absolute -bottom-112 -right-112 h-192 w-3xl rounded-full bg-orange-600/10 blur-3xl animate-pulse [animation-delay:1s]"></div>

    <!-- Main content -->
    <div class="relative z-10 flex flex-col text-slate-200">
      <RouterView class="min-h-screen pb-32" />
      <AppFooter :class="[
        'transition duration-500 ease-out',
        showFooter
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      ]" />
    </div>
  </div>
</template>
