import { ContentType } from './types';
import { 
  FileText, 
  Layout, 
  Megaphone, 
  ShoppingBag, 
  Share2, 
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
