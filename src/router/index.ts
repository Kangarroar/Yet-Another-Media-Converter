import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import ImageConverter from '@/views/ImageConverter.vue'
import AudioConverter from '@/views/AudioConverter.vue'
import VideoConverter from '@/views/VideoConverter.vue'
import VideoCompressor from '@/views/VideoCompressor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/image',
      name: 'image',
      component: ImageConverter
    },
    {
      path: '/audio',
      name: 'audio',
      component: AudioConverter
    },
    {
      path: '/video',
      name: 'video',
      component: VideoConverter
    },
    {
      path: '/compress',
      name: 'compress',
      component: VideoCompressor
    }
  ],
})

export default router
