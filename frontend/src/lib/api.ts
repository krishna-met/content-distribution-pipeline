import { APIResponse, SentimentAnalysis, AdaptedContent } from '@/types';
import axios from 'axios';

// Frontend service that calls backend API (recommended approach)
export class ContentAPIService {
  private static readonly API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  // HTTP client configuration
  private static getAxiosConfig() {
    return {
      baseURL: this.API_URL,
      timeout: 30000, // 30 second timeout for AI operations
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  // Main entry point - calls backend API
  static async processContent(content: string): Promise<APIResponse> {
    try {
      // Validate input
      if (!content || typeof content !== 'string') {
        return {
          success: false,
          data: {
            adaptedContent: {} as AdaptedContent,
            sentiment: {} as SentimentAnalysis
          },
          error: 'Content is required and must be a string'
        };
      }

      if (content.trim().length < 10) {
        return {
          success: false,
          data: {
            adaptedContent: {} as AdaptedContent,
            sentiment: {} as SentimentAnalysis
          },
          error: 'Content must be at least 10 characters long'
        };
      }

      // Call backend API
      const response = await axios.post('http://localhost:3000/api/content/process-content', 
        { content: content.trim() }, 
        this.getAxiosConfig()
      );

      return response.data;

    } catch (error) {
      console.error('ContentAPIService error:', error);
      
      // Handle different error types
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        const statusCode = error.response?.status;

        return {
          success: false,
          data: {
            adaptedContent: {} as AdaptedContent,
            sentiment: {} as SentimentAnalysis
          },
          error: `API Error (${statusCode}): ${errorMessage}`
        };
      }

      return {
        success: false,
        data: {
          adaptedContent: {} as AdaptedContent,
          sentiment: {} as SentimentAnalysis
        },
        error: 'Failed to process content - network error'
      };
    }
  }

  // Health check method
  static async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await axios.get('/api/health', this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend server is not responding');
    }
  }

  // Fallback methods for offline/development use
  private static fallbackSentimentAnalysis(content: string): SentimentAnalysis {
    const positiveWords = ['great', 'amazing', 'excellent', 'wonderful', 'fantastic', 'love', 'best', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing'];
    
    const words = content.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length;
    const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length;
    
    let score = (positiveCount - negativeCount) / Math.max(words.length / 10, 1);
    score = Math.max(-1, Math.min(1, score));
    
    let label: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';
    
    return {
      score,
      label,
      confidence: Math.min(0.95, 0.6 + Math.abs(score) * 0.4),
      emotions: {
        joy: label === 'positive' ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3,
        anger: label === 'negative' ? 0.6 + Math.random() * 0.4 : Math.random() * 0.2,
        fear: Math.random() * 0.3,
        sadness: label === 'negative' ? 0.4 + Math.random() * 0.3 : Math.random() * 0.2,
        surprise: Math.random() * 0.4,
      }
    };
  }

  // Fallback content generation (for offline use)
  static async processContentOffline(content: string): Promise<APIResponse> {
    try {
      const sentiment = this.fallbackSentimentAnalysis(content);
      
      // Create mock adapted content
      const adaptedContent: AdaptedContent = {
        twitter: {
          tweets: this.createTwitterThread(content),
          hashtags: ['#content', '#marketing', '#twitter'],
          characterCount: Math.min(content.length, 250)
        },
        linkedin: {
          post: this.createLinkedInPost(content, sentiment),
          hashtags: ['#professional', '#business', '#linkedin'],
          characterCount: content.length + 100
        },
        instagram: {
          caption: this.createInstagramCaption(content),
          hashtags: ['#instagram', '#visual', '#creative'],
          characterCount: Math.min(content.length, 200) + 50
        },
        newsletter: {
          subject: `Weekly Insights: ${content.split(' ').slice(0, 5).join(' ')}...`,
          content: `Dear Subscriber,\n\n${content}\n\nBest regards,\nThe Content Team`,
          preview: content.substring(0, 100) + '...'
        }
      };

      return {
        success: true,
        data: {
          adaptedContent,
          sentiment
        }
      };

    } catch (error) {
      console.error('Offline processing error:', error);
      
      return {
        success: false,
        data: {
          adaptedContent: {} as AdaptedContent,
          sentiment: {} as SentimentAnalysis
        },
        error: 'Failed to process content offline'
      };
    }
  }

  // Helper methods for fallback content generation
  private static createTwitterThread(content: string): string[] {
    const sentences = content.split('.').filter(s => s.trim().length > 0);
    const threads: string[] = [];
    let currentThread = '';
    let threadCount = 1;

    for (const sentence of sentences) {
      const potentialThread = currentThread + sentence.trim() + '. ';
      if (potentialThread.length <= 250) {
        currentThread = potentialThread;
      } else {
        if (currentThread) {
          threads.push(`${threadCount}/ ${currentThread.trim()}`);
          threadCount++;
        }
        currentThread = sentence.trim() + '. ';
      }
    }

    if (currentThread) {
      threads.push(`${threadCount}/ ${currentThread.trim()}`);
    }

    return threads.length > 0 ? threads : [`1/ ${content.substring(0, 250)}...`];
  }

  private static createLinkedInPost(content: string, sentiment: SentimentAnalysis): string {
    const professionalIntro = sentiment.label === 'positive' ? 
      "I'm excited to share some insights about " :
      sentiment.label === 'negative' ? 
      "I've been reflecting on some challenges regarding " :
      "Here are my thoughts on ";

    return `${professionalIntro}this topic:\n\n${content}\n\nWhat are your thoughts on this? I'd love to hear your perspective in the comments.\n\n#ThoughtLeadership #ProfessionalGrowth`;
  }

  private static createInstagramCaption(content: string): string {
    const emojis = ['✨', '💫', '🚀', '💡', '🎯', '📈', '🌟', '💪'];
    const randomEmojis = emojis.sort(() => 0.5 - Math.random()).slice(0, 3).join(' ');
    
    const shortContent = content.length > 200 ? content.substring(0, 200) + '...' : content;
    return `${randomEmojis}\n\n${shortContent}\n\n${randomEmojis}\n\nDouble tap if you agree! 👆`;
  }
}
