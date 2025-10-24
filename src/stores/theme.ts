import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme = 'modern' | 'minimal'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('modern')

  const isModern = computed(() => currentTheme.value === 'modern')
  const isMinimal = computed(() => currentTheme.value === 'minimal')

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem('yemc-theme', theme)
    updateDocumentClass()
  }

  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'modern' ? 'minimal' : 'modern'
    setTheme(newTheme)
  }

  const updateDocumentClass = () => {
    document.documentElement.className = currentTheme.value
  }

  const initializeTheme = () => {
    const saved = localStorage.getItem('yemc-theme') as Theme
    if (saved && (saved === 'modern' || saved === 'minimal')) {
      currentTheme.value = saved
    }
    updateDocumentClass()
  }

  return {
    currentTheme,
    isModern,
    isMinimal,
    setTheme,
    toggleTheme,
    initializeTheme
  }
})
