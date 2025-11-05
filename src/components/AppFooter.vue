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
  <footer class="mt-auto border-t border-white/10 bg-zinc-900/70 backdrop-blur-xl py-10 text-slate-200">
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid gap-10 md:grid-cols-2">
        <!-- Quick Access Section -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            {{ languageStore.t.quickAccess }}
          </h3>
          <p class="mb-5 max-w-sm text-sm text-slate-400">
            {{ languageStore.t.subtitle }}
          </p>
          <div class="flex flex-wrap justify-center gap-3 md:justify-start">
            <button
              @click="navigateTo('/image')"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            >
              {{ languageStore.t.image }}
            </button>
            <button
              @click="navigateTo('/audio')"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            >
              {{ languageStore.t.audio }}
            </button>
            <button
              @click="navigateTo('/video')"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            >
              {{ languageStore.t.video }}
            </button>
            <button
              @click="navigateTo('/compress')"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            >
              {{ languageStore.t.compress }}
            </button>
          </div>
        </div>

        <!-- Language Selection Section -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            {{ languageStore.t.changeLanguage }}
          </h3>
          <p class="mb-5 max-w-sm text-sm text-slate-400">
            {{ languageStore.currentLanguage === 'es'
              ? ''
              : '' }}
          </p>
          <div class="flex flex-wrap justify-center gap-3 md:justify-start">
            <button
              @click="languageStore.setLanguage('en')"
              :class="[
                'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60',
                languageStore.currentLanguage === 'en'
                  ? 'border-transparent bg-orange-500 text-white shadow-[0_10px_40px_-15px_rgba(249,115,22,0.8)]'
                  : 'border-white/10 bg-zinc-800/70 text-slate-200 hover:border-white/20 hover:bg-zinc-700/70'
              ]"
            >
              🇺🇸 {{ languageStore.t.english }}
            </button>
            <button
              @click="languageStore.setLanguage('es')"
              :class="[
                'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60',
                languageStore.currentLanguage === 'es'
                  ? 'border-transparent bg-orange-500 text-white shadow-[0_10px_40px_-15px_rgba(249,115,22,0.8)]'
                  : 'border-white/10 bg-zinc-800/70 text-slate-200 hover:border-white/20 hover:bg-zinc-700/70'
              ]"
            >
              🇪🇸 {{ languageStore.t.spanish }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>