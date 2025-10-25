import { 
  Input, 
  Output, 
  Conversion, 
  BlobSource, 
  BufferTarget, 
  Mp4OutputFormat,
  Mp4InputFormat
} from 'mediabunny'
import type { CompressionSettings, CompressionResult, CompressionProgress } from '@/types/compression'

export class VideoCompressor {
  private onProgress?: (progress: CompressionProgress) => void

  constructor(onProgress?: (progress: CompressionProgress) => void) {
    this.onProgress = onProgress
  }

  async compress(
    file: File, 
    settings: CompressionSettings
  ): Promise<{ result: CompressionResult; blob: Blob }> {
    try {
      this.updateProgress(0, 'Initializing compression...')

      // Create input source from file
      const input = new Input({
        source: new BlobSource(file),
        formats: [new Mp4InputFormat()]
      })

      // Create output target
      const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget()
      })

      this.updateProgress(10, 'Setting up conversion...')

      const conversion = await Conversion.init({
        input,
        output,
        video: {
          bitrate: settings.videoBitrate
        },
        audio: {
          numberOfChannels: settings.audioChannels || 2,
          bitrate: settings.audioBitrate
        },
        tags: {}
      })

      this.updateProgress(20, 'Starting compression...')

      conversion.onProgress = (progress: number) => {
        const adjustedProgress = 20 + (progress * 70)
        this.updateProgress(
          Math.round(adjustedProgress), 
          `Compressing video...`
        )
      }

      await conversion.execute()

      this.updateProgress(90, 'Finalizing compression...')

      // Get compressed data
      const compressedBuffer = output.target.buffer
      if (!compressedBuffer) {
        throw new Error('Compression failed: No output buffer generated')
      }
      const compressedBlob = new Blob([compressedBuffer], { type: 'video/mp4' })

      // Calculate results
      const originalSize = file.size
      const compressedSize = compressedBlob.size
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

      const result: CompressionResult = {
        originalSize,
        compressedSize,
        compressionRatio,
        originalFileName: file.name,
        compressedFileName: this.generateCompressedFileName(file.name)
      }

      this.updateProgress(100, 'Compression complete!')

      return { result, blob: compressedBlob }

    } catch (error) {
      console.error('Compression error:', error)
      throw new Error(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private updateProgress(percentage: number, stage: string) {
    if (this.onProgress) {
      this.onProgress({ percentage, stage })
    }
  }

  private generateCompressedFileName(originalName: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    return `${nameWithoutExt}_compressed.mp4`
  }

  
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static formatBitrate(bps: number): string {
    if (bps < 1000) return `${bps} bps`
    if (bps < 1000000) return `${(bps / 1000).toFixed(0)} kbps`
    return `${(bps / 1000000).toFixed(1)} Mbps`
  }
}
