import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class PerplexityAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY, // Safe on backend
      baseURL: 'https://api.perplexity.ai', // Perplexity API endpoint
    });

    // Updated to use Perplexity models
    this.model = process.env.PERPLEXITY_MODEL || 'sonar';
    this.maxTokens = parseInt(process.env.PERPLEXITY_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.PERPLEXITY_TEMPERATURE) || 0.7;
  }

  async analyzeSentiment(content) {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert sentiment analyzer. Return JSON with:
            {
              "score": number between -1 and 1,
              "label": "positive" | "neutral" | "negative", 
              "confidence": number between 0 and 1,
              "emotions": {
                "joy": number between 0 and 1,
                "anger": number between 0 and 1,
                "fear": number between 0 and 1,
                "sadness": number between 0 and 1,
                "surprise": number between 0 and 1
              }
            }`
          },
          {
            role: 'user',
            content: `Analyze sentiment: "${content}"`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });

      const result = completion.choices[0]?.message?.content;
      if (!result) throw new Error('No response from Perplexity');

      return JSON.parse(result);

    } catch (error) {
      console.error('Perplexity sentiment error:', error);
      // Return fallback sentiment
      return {
        score: 0,
        label: 'neutral',
        confidence: 0.5,
        emotions: {
          joy: 0.3,
          anger: 0.1,
          fear: 0.1,
          sadness: 0.1,
          surprise: 0.2
        }
      };
    }
  }

  async generatePlatformContent(content, platform, sentiment) {
    const prompts = {
      twitter: `Create Twitter thread (250 chars per tweet) with sentiment: ${sentiment.label}. Content: "${content}"`,
      linkedin: `Create professional LinkedIn post with sentiment: ${sentiment.label}. Content: "${content}"`,
      instagram: `Create Instagram caption with hashtags, sentiment: ${sentiment.label}. Content: "${content}"`,
      newsletter: `Create newsletter with subject/content/preview, sentiment: ${sentiment.label}. Content: "${content}"`
    };

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a ${platform} content expert. Create platform-optimized content.`
          },
          {
            role: 'user',
            content: prompts[platform]
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        // Perplexity-specific parameters (optional)
        search_mode: 'web', // Use web search for up-to-date information
        return_images: false,
        return_related_questions: false
      });

      const result = completion.choices[0]?.message?.content;
      return result || `Generated ${platform} content for: ${content.substring(0, 50)}...`;

    } catch (error) {
      console.error(`Perplexity ${platform} generation error:`, error);
      return `Generated ${platform} content for: ${content.substring(0, 50)}...`;
    }
  }

  async processContent(content) {
    try {
      // Get sentiment analysis
      const sentiment = await this.analyzeSentiment(content);

      // Generate content for all platforms
      const platforms = ['twitter', 'linkedin', 'instagram', 'newsletter'];
      const contentResults = await Promise.all(
        platforms.map(async platform => ({
          platform,
          content: await this.generatePlatformContent(content, platform, sentiment)
        }))
      );

      // Format response
      const adaptedContent = {};
      contentResults.forEach(result => {
        const baseHashtags = ['#content', '#marketing', '#socialmedia'];
        const sentimentHashtags = sentiment.label === 'positive' ? ['#success'] : ['#business'];

        if (result.platform === 'twitter') {
          // Convert to thread format
          const tweets = result.content.split('\n').filter(t => t.trim().length > 0);
          adaptedContent[result.platform] = {
            tweets: tweets.length > 0 ? tweets : [result.content],
            hashtags: [...baseHashtags, '#twitter'],
            characterCount: result.content.length
          };
        } else if (result.platform === 'newsletter') {
          adaptedContent[result.platform] = {
            subject: `Weekly Insights: ${content.split(' ').slice(0, 5).join(' ')}...`,
            content: result.content,
            preview: content.substring(0, 100) + '...'
          };
        } else {
          adaptedContent[result.platform] = {
            post: result.content,
            hashtags: [...baseHashtags, `#${result.platform}`],
            characterCount: result.content.length
          };
        }
      });

      return {
        success: true,
        data: {
          adaptedContent,
          sentiment
        }
      };

    } catch (error) {
      console.error('Perplexity processing error:', error);
      return {
        success: false,
        error: 'Content processing failed'
      };
    }
  }
}

console.log(process.env.PERPLEXITY_API_KEY); // This will show you the value


export default new PerplexityAIService();