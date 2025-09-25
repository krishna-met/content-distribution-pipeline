export interface ContentData {
  originalContent: string;
  platforms: Platform[];
  sentiment: SentimentAnalysis;
  adaptedContent: AdaptedContent;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
}

export interface AdaptedContent {
  twitter: {
    tweets: string[];
    hashtags: string[];
    characterCount: number;
  };
  linkedin: {
    post: string;
    hashtags: string[];
    characterCount: number;
  };
  instagram: {
    caption: string;
    hashtags: string[];
    characterCount: number;
  };
  newsletter: {
    subject: string;
    content: string;
    preview: string;
  };
}

export interface APIResponse {
  success: boolean;
  data: {
    adaptedContent: AdaptedContent;
    sentiment: SentimentAnalysis;
  };
  error?: string;
}