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
  <main class="flex flex-1 items-center justify-center px-6 py-12">
    <div class="mx-auto w-full max-w-4xl text-center">
      <!-- Hero Section -->
      <div class="mb-16">
        <h1 class="mb-4 text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
          {{ languageStore.t.title }}
        </h1>
        <p class="mx-auto max-w-2xl text-lg text-[--color-muted] md:text-xl">
          {{ languageStore.t.subtitle }}
        </p>
      </div>

      <!-- Converter Cards Grid -->
      <div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Image Converter -->
        <button
          @click="navigateTo('/image')"
          class="group flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl bg-white/10 px-6 py-8 text-[--color-text] font-medium ring-1 ring-white/15 backdrop-blur-xl transition-all duration-200 hover:bg-white/15 hover:ring-white/25 hover:-translate-y-1 hover:shadow-xl hover:shadow-[--color-primary-500]/10 active:scale-95"
        >
          <div class="text-4xl transition-transform duration-200 group-hover:scale-110">🖼️</div>
          <span class="text-sm">{{ languageStore.t.image }}</span>
        </button>

        <!-- Audio Converter -->
        <button
          @click="navigateTo('/audio')"
          class="group flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl bg-white/10 px-6 py-8 text-[--color-text] font-medium ring-1 ring-white/15 backdrop-blur-xl transition-all duration-200 hover:bg-white/15 hover:ring-white/25 hover:-translate-y-1 hover:shadow-xl hover:shadow-[--color-primary-500]/10 active:scale-95"
        >
          <div class="text-4xl transition-transform duration-200 group-hover:scale-110">🎵</div>
          <span class="text-sm">{{ languageStore.t.audio }}</span>
        </button>

        <!-- Video Converter -->
        <button
          @click="navigateTo('/video')"
          class="group flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl bg-white/10 px-6 py-8 text-[--color-text] font-medium ring-1 ring-white/15 backdrop-blur-xl transition-all duration-200 hover:bg-white/15 hover:ring-white/25 hover:-translate-y-1 hover:shadow-xl hover:shadow-[--color-primary-500]/10 active:scale-95"
        >
          <div class="text-4xl transition-transform duration-200 group-hover:scale-110">🎬</div>
          <span class="text-sm">{{ languageStore.t.video }}</span>
        </button>

        <!-- Video Compressor -->
        <button
          @click="navigateTo('/compress')"
          class="group flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl bg-white/10 px-6 py-8 text-[--color-text] font-medium ring-1 ring-white/15 backdrop-blur-xl transition-all duration-200 hover:bg-white/15 hover:ring-white/25 hover:-translate-y-1 hover:shadow-xl hover:shadow-[--color-primary-500]/10 active:scale-95"
        >
          <div class="text-4xl transition-transform duration-200 group-hover:scale-110">🗜️</div>
          <span class="text-sm">{{ languageStore.t.compress }}</span>
        </button>
      </div>
    </div>
  </main>
</template>
