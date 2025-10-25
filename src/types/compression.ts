export interface CompressionSettings {
  videoBitrate: number // in bps
  audioBitrate: number // in bps
  fps?: number
  audioChannels?: number
}

export interface QualityPreset {
  name: string
  videoBitrate: number
  audioBitrate: number
}

export type CompressionState = 'idle' | 'processing' | 'complete' | 'error'

export interface CompressionResult {
  originalSize: number // in bytes
  compressedSize: number // in bytes
  compressionRatio: number // percentage saved
  originalFileName: string
  compressedFileName: string
}

export interface CompressionProgress {
  percentage: number
  stage: string
}

export const QUALITY_PRESETS: Record<string, QualityPreset> = {
  low: {
    name: 'Low',
    videoBitrate: 800_000, // 800 kbps
    audioBitrate: 64_000   // 64 kbps
  },
  medium: {
    name: 'Medium',
    videoBitrate: 2_000_000, // 2 Mbps
    audioBitrate: 128_000    // 128 kbps
  },
  high: {
    name: 'High',
    videoBitrate: 5_000_000, // 5 Mbps
    audioBitrate: 192_000    // 192 kbps
  }
}

export const BITRATE_RANGES = {
  video: { min: 500_000, max: 10_000_000 }, // 500 kbps - 10 Mbps
  audio: { min: 32_000, max: 320_000 }      // 32 kbps - 320 kbps
}
