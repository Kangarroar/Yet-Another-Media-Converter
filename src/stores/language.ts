import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Language = 'en' | 'es'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<Language>('en')

  const translations = {
    en: {
      // Home page
      title: 'Yet Another Media Converter',
      subtitle: 'Convert your media files locally in your browser',
      image: 'Image',
      audio: 'Audio',
      video: 'Video',
      compress: 'Compress',
      
      // Common
      back: '← Back',
      dropFile: 'Drop your file here or click to browse',
      comingSoon: 'Coming soon...',
      
      // Image converter
      imageConverter: 'Image Converter',
      imageHint: 'Supports JPG, PNG, WebP, AVIF',
      imageDescription: 'Convert images between different formats',
      
      // Audio converter
      audioConverter: 'Audio Converter',
      audioHint: 'Supports WAV, MP3, AAC, M4A, FLAC, Opus',
      audioDescription: 'Convert audio files between different formats',
      
      // Video converter
      videoConverter: 'Video Converter',
      videoHint: 'Supports MP4, WebM, MKV with hardware acceleration',
      videoDescription: 'Convert videos between different formats',
      
      // Video compressor
      videoCompressor: 'Video Compressor',
      compressHint: 'Compress with custom bitrate settings',
      compressDescription: 'Reduce video file size',
      uploadVideo: 'Upload Video',
      selectFile: 'Select MP4 file',
      selectedFile: 'Selected file',
      qualityPreset: 'Quality Preset',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      advancedSettings: 'Advanced Settings',
      videoBitrate: 'Video Bitrate',
      audioBitrate: 'Audio Bitrate',
      compress: 'Compress',
      compressing: 'Compressing...',
      compressionComplete: 'Compression Complete',
      originalSize: 'Original Size',
      compressedSize: 'Compressed Size',
      saved: 'Saved',
      download: 'Download',
      compressAgain: 'Compress Again',
      fileSize: 'File Size',
      compressionRatio: 'Compression Ratio',
      processing: 'Processing...',
      error: 'Error',
      retry: 'Retry',
      
      // Footer
      quickAccess: 'Quick Access',
      changeLanguage: 'Change Language',
      language: 'Language',
      english: 'English',
      spanish: 'Spanish'
    },
    es: {
      // Home page
      title: 'Yet Another Media Converter',
      subtitle: 'Convierte tus archivos multimedia localmente en tu navegador',
      image: 'Imagen',
      audio: 'Audio',
      video: 'Video',
      compress: 'Comprimir',
      
      // Common
      back: '← Atrás',
      dropFile: 'Arrastra tu archivo aquí o haz clic para explorar',
      comingSoon: 'Próximamente...',
      
      // Image converter
      imageConverter: 'Convertidor de Imágenes',
      imageHint: 'Soporta JPG, PNG, WebP, AVIF',
      imageDescription: 'Convierte imágenes entre diferentes formatos',
      
      // Audio converter
      audioConverter: 'Convertidor de Audio',
      audioHint: 'Soporta WAV, MP3, AAC, M4A, FLAC, Opus',
      audioDescription: 'Convierte archivos de audio entre diferentes formatos',
      
      // Video converter
      videoConverter: 'Convertidor de Video',
      videoHint: 'Soporta MP4, WebM, MKV con aceleración por hardware',
      videoDescription: 'Convierte videos entre diferentes formatos',
      
      // Video compressor
      videoCompressor: 'Compresor de Video',
      compressHint: 'Comprime con configuraciones de bitrate personalizadas',
      compressDescription: 'Reduce el tamaño del archivo de video',
      uploadVideo: 'Subir Video',
      selectFile: 'Seleccionar archivo MP4',
      selectedFile: 'Archivo seleccionado',
      qualityPreset: 'Preset de Calidad',
      low: 'Bajo',
      medium: 'Medio',
      high: 'Alto',
      advancedSettings: 'Configuración Avanzada',
      videoBitrate: 'Bitrate de Video',
      audioBitrate: 'Bitrate de Audio',
      compressVideo: 'Comprimir',
      compressing: 'Comprimiendo...',
      compressionComplete: 'Compresión Completa',
      originalSize: 'Tamaño Original',
      compressedSize: 'Tamaño Comprimido',
      saved: 'Ahorrado',
      download: 'Descargar',
      compressAgain: 'Comprimir Otra Vez',
      fileSize: 'Tamaño de Archivo',
      compressionRatio: 'Ratio de Compresión',
      processing: 'Procesando...',
      error: 'Error',
      retry: 'Reintentar',
      
      // Footer
      quickAccess: 'Acceso Rápido',
      changeLanguage: 'Cambiar Idioma',
      language: 'Idioma',
      english: 'Inglés',
      spanish: 'Español'
    }
  }

  const t = computed(() => translations[currentLanguage.value])

  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang
    localStorage.setItem('yemc-language', lang)
  }

  const initializeLanguage = () => {
    const saved = localStorage.getItem('yemc-language') as Language
    if (saved && (saved === 'en' || saved === 'es')) {
      currentLanguage.value = saved
    }
  }

  return {
    currentLanguage,
    t,
    setLanguage,
    initializeLanguage
  }
})