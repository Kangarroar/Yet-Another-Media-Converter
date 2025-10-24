<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <button @click="themeStore.toggleTheme" class="theme-toggle" :class="{ minimal: themeStore.isMinimal }">
    <div class="toggle-label">
      {{ themeStore.isModern ? 'Minimal' : 'Modern' }}
    </div>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
}

.toggle-icon {
  font-size: 1.1rem;
  opacity: 0.8;
}

.toggle-label {
  font-size: 0.85rem;
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
