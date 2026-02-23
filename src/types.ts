export type ContentType = 'blog' | 'article' | 'ad' | 'product' | 'social' | 'email' | 'other';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface WritingConfig {
  type: ContentType;
  topic: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  additionalInstructions?: string;
}

export interface GeneratedContent {
  id: string;
  title: string;
  body: string;
  type: ContentType;
  createdAt: number;
}
