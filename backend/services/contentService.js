// Updated contentService.js with platform selection support
import OpenAI from 'openai';

export default class ContentAPIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.perplexity.ai',
    });
    this.model = process.env.PERPLEXITY_MODEL || 'sonar-pro';
    this.maxTokens = parseInt(process.env.PERPLEXITY_MAX_TOKENS) || 1500;
    this.temperature = parseFloat(process.env.PERPLEXITY_TEMPERATURE) || 0.7;
    this.availableTones = [
      'professional', 'casual', 'friendly', 'persuasive',
      'creative', 'authoritative', 'humorous', 'inspirational',
      'conversational', 'educational', 'urgent', 'empathetic'
    ];
    this.availablePlatforms = ['twitter', 'linkedin', 'instagram', 'newsletter'];
  }

  // ===== SENTIMENT ANALYSIS =====
  async analyzeSentiment(content) {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a sentiment analysis expert. You MUST respond with ONLY valid JSON, NEVER explain, and follow exactly this format:
            {
              "score": -0.5,
              "label": "negative",
              "confidence": 0.8,
              "emotions": {
                "joy": 0.1,
                "anger": 0.6,
                "fear": 0.2,
                "sadness": 0.7,
                "surprise": 0.1
              }
            }
            Score range: -1.0 to 1.0. Label must be "positive", "neutral", or "negative". Confidence: 0.0 to 1.0. All emotion values: 0.0 to 1.0. Return ONLY JSON, no other text.`
          },
          {
            role: 'user',
            content: `Analyze sentiment of: "${content}". Only reply with valid JSON as described above.`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      });

      let result = completion.choices[0]?.message?.content;
      if (!result) throw new Error('No response from Perplexity');

      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No valid JSON found in response');
      const jsonString = result.substring(jsonStart, jsonEnd + 1);

      const parsed = JSON.parse(jsonString);

      if (typeof parsed.score !== 'number'
        || !['positive', 'neutral', 'negative'].includes(parsed.label)
        || typeof parsed.confidence !== 'number'
        || !parsed.emotions) throw new Error('Invalid sentiment structure');

      parsed.score = Math.max(-1, Math.min(1, parsed.score));
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
      Object.keys(parsed.emotions).forEach(emotion => {
        parsed.emotions[emotion] = Math.max(0, Math.min(1, parsed.emotions[emotion]));
      });
      return parsed;
    } catch (error) {
      return this.basicSentimentAnalysis(content);
    }
  }

  // ===== PLATFORM CONTENT GENERATION =====
  async generatePlatformContent(content, platform, sentiment, tone = 'professional') {
    const platformSpecs = {
      twitter: {
        maxLength: 280,
        hashtagCount: '8-12',
        style: 'concise and engaging'
      },
      linkedin: {
        maxLength: 3000,
        hashtagCount: '10-15',
        style: 'professional and insightful'
      },
      instagram: {
        maxLength: 2200,
        hashtagCount: '15-20',
        style: 'visual and engaging'
      },
      newsletter: {
        maxLength: 1000,
        hashtagCount: '5-8',
        style: 'informative and structured'
      }
    };
    const spec = platformSpecs[platform] || platformSpecs.twitter;

    const systemPrompt = `You are a ${platform} content expert. Your ONLY reply MUST be valid JSON, no explanations, as described.
    {
      "content": "Platform-optimized text here",
      "hashtags": ["tag1", "tag2", "tag3"],
      "characterCount": 123,
      "engagement_tips": ["tip1", "tip2","tip3"]
    }
    Guidelines:
    - Use ${tone} tone and ${sentiment.label} sentiment.
    - Content <= ${spec.maxLength} characters.
    - Include ${spec.hashtagCount} platform-relevant hashtags.
    - Format as above, no extra text before or after.
    - DO NOT explain at all or use markdown.`;

    const userPrompt = `Transform this content: "${content}"
    - Tone: ${tone}
    - Sentiment: ${sentiment.label}
    - Platform: ${platform}
    - Style: ${spec.style}
    Generate ONLY valid JSON in the format provided.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.3
      });

      let result = completion.choices[0]?.message?.content;
      if (!result) throw new Error('No response from Perplexity');

      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No valid JSON found');
      const jsonString = result.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);

      const contentOut = typeof parsed.content === 'string' ? parsed.content : content;
      const hashtagsOut = Array.isArray(parsed.hashtags)
        ? parsed.hashtags.map(tag => String(tag).replace(/^#/, '').trim()).filter(tag => tag.length > 0)
        : this.generateFallbackHashtags(platform, tone);
      const characterCount = typeof parsed.characterCount === 'number'
        ? parsed.characterCount : (contentOut ? contentOut.length : 0);
      const tipsOut = Array.isArray(parsed.engagement_tips)
        ? parsed.engagement_tips.filter(tip => typeof tip === 'string' && tip.trim().length > 0)
        : this.generateFallbackTips(platform);

      return {
        content: contentOut,
        hashtags: hashtagsOut.slice(0, 25),
        characterCount,
        engagement_tips: tipsOut
      };
    } catch (error) {
      return this.generateFallbackContent(content, platform, tone);
    }
  }

  // ===== ENHANCED CONTENT WRAPPER WITH PLATFORM SELECTION =====
  async processContent(content, tone = 'professional', selectedPlatforms = null) {
    try {
      if (!this.availableTones.includes(tone)) {
        tone = 'professional';
      }

      // Use selected platforms or default to all
      const platforms = selectedPlatforms && Array.isArray(selectedPlatforms) && selectedPlatforms.length > 0
        ? selectedPlatforms.filter(p => this.availablePlatforms.includes(p))
        : this.availablePlatforms;

      console.log(`🎯 Processing content for platforms: ${platforms.join(', ')} with ${tone} tone`);

      const sentiment = await this.analyzeSentiment(content);
      console.log(`📊 Sentiment: ${sentiment.label} (${sentiment.score.toFixed(2)})`);

      const contentResults = await Promise.allSettled(
        platforms.map(async platform => {
          try {
            const result = await this.generatePlatformContent(content, platform, sentiment, tone);
            console.log(`✅ Generated ${platform} content: ${result.content.substring(0, 50)}...`);
            return { platform, ...result };
          } catch (error) {
            console.error(`❌ Error generating ${platform} content:`, error.message);
            return { platform, ...this.generateFallbackContent(content, platform, tone) };
          }
        })
      );

      const adaptedContent = {};
      contentResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          if (data.platform === 'twitter') {
            adaptedContent[data.platform] = {
              tweets: this.splitIntoTweets(data.content),
              hashtags: data.hashtags,
              characterCount: data.characterCount,
              engagement_tips: data.engagement_tips
            };
          } else if (data.platform === 'newsletter') {
            adaptedContent[data.platform] = {
              subject: `${content.split(' ').slice(0, 6).join(' ')}...`,
              content: data.content,
              preview: content.substring(0, 100) + '...',
              hashtags: data.hashtags,
              engagement_tips: data.engagement_tips
            };
          } else {
            adaptedContent[data.platform] = {
              post: data.content,
              hashtags: data.hashtags,
              characterCount: data.characterCount,
              engagement_tips: data.engagement_tips
            };
          }
        } else {
          // Handle failed platform generation
          const failedPlatform = platforms.find(p => !adaptedContent[p]);
          if (failedPlatform) {
            adaptedContent[failedPlatform] = this.generateFallbackContent(content, failedPlatform, tone);
          }
        }
      });

      console.log(`✅ Successfully processed content for ${Object.keys(adaptedContent).length} platforms`);

      return {
        success: true,
        data: {
          adaptedContent,
          sentiment,
          tone,
          originalContent: content,
          platformsProcessed: platforms
        }
      };
    } catch (error) {
      console.error('Content processing error:', error);
      return {
        success: false,
        error: 'Content processing failed',
        details: error.message
      };
    }
  }

  splitIntoTweets(content, maxLength = 250) {
    if (content.length <= maxLength) return [content];
    const sentences = content.split('. ');
    const tweets = [];
    let currentTweet = '';
    sentences.forEach((sentence, index) => {
      const nextTweet = currentTweet + (currentTweet ? '. ' : '') + sentence;
      if (nextTweet.length <= maxLength) {
        currentTweet = nextTweet;
      } else {
        if (currentTweet) tweets.push(currentTweet);
        currentTweet = sentence;
      }
      if (index === sentences.length - 1 && currentTweet) {
        tweets.push(currentTweet);
      }
    });
    return tweets.length > 0 ? tweets : [content.substring(0, maxLength)];
  }

  getAvailableTones() {
    return this.availableTones;
  }

  getAvailablePlatforms() {
    return this.availablePlatforms;
  }

  basicSentimentAnalysis(content) {
    const text = content.toLowerCase();
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'awesome', 'wonderful', 'fantastic',
      'love', 'like', 'enjoy', 'happy', 'excited', 'thrilled', 'success', 'win',
      'best', 'perfect', 'brilliant', 'outstanding', 'superb', 'magnificent'
    ];
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry', 'sad',
      'disappointed', 'frustrated', 'annoyed', 'upset', 'worried', 'concerned',
      'problem', 'issue', 'error', 'fail', 'worst', 'disaster', 'crisis'
    ];
    let positiveCount = 0;
    let negativeCount = 0;
    positiveWords.forEach(word => { if (text.includes(word)) positiveCount++; });
    negativeWords.forEach(word => { if (text.includes(word)) negativeCount++; });

    let score = 0, label = 'neutral', confidence = 0.5;
    if (positiveCount > negativeCount) {
      score = Math.min(0.8, (positiveCount - negativeCount) * 0.2);
      label = 'positive';
      confidence = Math.min(0.8, 0.5 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount) {
      score = Math.max(-0.8, -(negativeCount - positiveCount) * 0.2);
      label = 'negative';
      confidence = Math.min(0.8, 0.5 + (negativeCount * 0.1));
    }
    return {
      score,
      label,
      confidence,
      emotions: {
        joy: label === 'positive' ? 0.6 : 0.2,
        anger: label === 'negative' ? 0.6 : 0.1,
        fear: label === 'negative' ? 0.4 : 0.1,
        sadness: label === 'negative' ? 0.5 : 0.1,
        surprise: 0.2
      }
    };
  }

  generateFallbackHashtags(platform, tone) {
    const baseHashtags = {
      twitter: ['twitter', 'content', 'socialmedia', tone],
      linkedin: ['linkedin', 'professional', 'business', tone, 'networking'],
      instagram: ['instagram', 'content', 'visual', tone, 'engagement'],
      newsletter: ['newsletter', 'email', 'content', tone, 'marketing']
    };
    const commonHashtags = ['ai', 'contentcreation', 'digitalmarketing', 'branding'];
    return [...(baseHashtags[platform] || ['content']), ...commonHashtags].slice(0, 12);
  }

  generateFallbackTips(platform) {
    const tips = {
      twitter: ['Tweet during peak hours', 'Use trending hashtags', 'Engage quickly'],
      linkedin: ['Post during business hours', 'Ask questions', 'Share insights'],
      instagram: ['Use high-quality visuals', 'Post consistently', 'Engage with community'],
      newsletter: ['Write good subjects', 'Keep content scannable', 'Call to action']
    };
    return tips[platform] || ['Create engaging content', 'Post consistently', 'Engage with your audience'];
  }

  generateFallbackContent(content, platform, tone) {
    const fallbackContent = `${tone.charAt(0).toUpperCase() + tone.slice(1)} ${platform} content based on: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
    return {
      content: fallbackContent,
      hashtags: this.generateFallbackHashtags(platform, tone),
      characterCount: fallbackContent.length,
      engagement_tips: this.generateFallbackTips(platform)
    };
  }
}