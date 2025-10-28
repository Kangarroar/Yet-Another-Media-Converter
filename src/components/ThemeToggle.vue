<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <button @click="themeStore.toggleTheme" class="btn theme-toggle" :class="{ minimal: themeStore.isMinimal }" style="position: fixed; top: 2rem; right: 2rem; z-index: 1001; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
    <div class="toggle-label text--sm">
      {{ themeStore.isModern ? 'Minimal' : 'Modern' }}
    </div>
  </button>
</template>

<style scoped>
.theme-toggle {
  backdrop-filter: blur(10px);
}

.theme-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
}

/* Minimal theme styles */
.minimal {
  background: rgba(0, 0, 0, 0.8);
  border: 1px dashed #666666;
  border-radius: 0;
  color: #ffffff;
  font-family: Arial, sans-serif;
  font-weight: normal;
}

.minimal:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: #999999;
}

@media (max-width: 768px) {
  .theme-toggle {
    top: 1rem;
    right: 1rem;
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .toggle-label {
    display: none;
  }
}
</style>
