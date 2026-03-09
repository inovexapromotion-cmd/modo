export type ContentType = 'blog' | 'article' | 'ad' | 'product' | 'social' | 'email' | 'other';
export type AdStyle = 'modern' | 'cinematic' | 'minimal' | 'luxury' | 'tech' | 'social';
export type VideoDuration = '10s' | '15s' | '30s' | '60s';
export type Resolution = '720p' | '1080p' | '4K';
export type ExportFormat = 'MP4' | 'Reels' | 'Shorts' | 'TikTok';

export interface WritingConfig {
  type: ContentType;
  topic: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  additionalInstructions?: string;
}

export interface AdConfig {
  productName: string;
  description: string;
  price: string;
  brand: string;
  targetAudience: string;
  style: AdStyle;
  duration: VideoDuration;
  media?: string[]; // base64 or URLs
}

export interface AppSettings {
  language: string;
  voiceStyle: string;
  resolution: Resolution;
  animationIntensity: number;
  subtitles: boolean;
  musicVolume: number;
  brandColor: string;
  logoWatermark?: string;
  exportFormat: ExportFormat;
  apiKey?: string;
}

export interface GeneratedAd {
  id: string;
  title: string;
  script: string;
  config: AdConfig;
  createdAt: number;
  videoUrl?: string; // Placeholder for now
}

export interface GeneratedContent {
  id: string;
  title: string;
  body: string;
  type: ContentType;
  createdAt: number;
}
