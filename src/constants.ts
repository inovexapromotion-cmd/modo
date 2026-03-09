import { AdStyle, VideoDuration, Resolution, ExportFormat, ContentType } from './types';
import { 
  Video, 
  Music, 
  Mic2, 
  Zap, 
  Settings as SettingsIcon, 
  LayoutDashboard,
  Plus,
  Instagram,
  Youtube,
  Facebook,
  Share2,
  Globe,
  FileText,
  Layout,
  Megaphone,
  ShoppingBag,
  Mail,
  PlusCircle
} from 'lucide-react';

export const CONTENT_TYPES: { type: ContentType; label: string; icon: any; description: string }[] = [
  { 
    type: 'blog', 
    label: 'Blog Post', 
    icon: FileText,
    description: 'Engaging and informative blog articles.'
  },
  { 
    type: 'article', 
    label: 'Article', 
    icon: Layout,
    description: 'Professional and well-structured articles.'
  },
  { 
    type: 'ad', 
    label: 'Advertisement', 
    icon: Megaphone,
    description: 'Persuasive copy for ads and marketing.'
  },
  { 
    type: 'product', 
    label: 'Product Description', 
    icon: ShoppingBag,
    description: 'Clear and compelling product details.'
  },
  { 
    type: 'social', 
    label: 'Social Media', 
    icon: Share2,
    description: 'Catchy posts for social platforms.'
  },
  { 
    type: 'email', 
    label: 'Email', 
    icon: Mail,
    description: 'Professional emails and newsletters.'
  },
  { 
    type: 'other', 
    label: 'Custom Writing', 
    icon: PlusCircle,
    description: 'Anything else you need to write.'
  },
];

export const TONES = [
  'Professional',
  'Casual',
  'Friendly',
  'Authoritative',
  'Witty',
  'Empathetic',
  'Persuasive',
  'Informative'
];

export const AD_STYLES: { value: AdStyle; label: string; description: string }[] = [
  { value: 'modern', label: 'Modern', description: 'Clean lines and vibrant colors.' },
  { value: 'cinematic', label: 'Cinematic', description: 'Epic lighting and dramatic shots.' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, focused, and elegant.' },
  { value: 'luxury', label: 'Luxury', description: 'High-end aesthetic and premium feel.' },
  { value: 'tech', label: 'Tech', description: 'Futuristic and high-tech vibes.' },
  { value: 'social', label: 'Social Media', description: 'Fast-paced and trend-focused.' },
];

export const VIDEO_DURATIONS: VideoDuration[] = ['10s', '15s', '30s', '60s'];

export const RESOLUTIONS: Resolution[] = ['720p', '1080p', '4K'];

export const EXPORT_FORMATS: ExportFormat[] = ['MP4', 'Reels', 'Shorts', 'TikTok'];

export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram Ads', icon: Instagram },
  { id: 'youtube', label: 'YouTube Ads', icon: Youtube },
  { id: 'facebook', label: 'Facebook Ads', icon: Facebook },
  { id: 'tiktok', label: 'TikTok Ads', icon: Share2 },
  { id: 'google', label: 'Google Ads', icon: Globe },
];
