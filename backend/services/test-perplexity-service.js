// test-perplexity-service.js
import PerplexityAIService from './openaiService.js';

async function testPerplexityService() {
  console.log('🧪 Testing Perplexity AI Service...');

  try {
    // Test content to process
    const testContent = "Artificial intelligence is revolutionizing the way we work and live, bringing both exciting opportunities and new challenges.";

    console.log('📝 Processing content:', testContent);
    console.log('⏳ Please wait...');

    // Process the content
    const result = await PerplexityAIService.processContent(testContent);

    if (result.success) {
      console.log('✅ Success! Here\'s what we got:');
      console.log('\n📊 Sentiment Analysis:');
      console.log('- Score:', result.data.sentiment.score);
      console.log('- Label:', result.data.sentiment.label);
      console.log('- Confidence:', result.data.sentiment.confidence);
      console.log('- Emotions:', result.data.sentiment.emotions);

      console.log('\n📱 Platform Content:');
      Object.keys(result.data.adaptedContent).forEach(platform => {
        console.log(`\n--- ${platform.toUpperCase()} ---`);
        const content = result.data.adaptedContent[platform];

        if (platform === 'twitter') {
          console.log('Tweets:', content.tweets.length);
          content.tweets.forEach((tweet, i) => {
            console.log(`  ${i + 1}. ${tweet.substring(0, 100)}...`);
          });
        } else if (platform === 'newsletter') {
          console.log('Subject:', content.subject);
          console.log('Preview:', content.preview);
        } else {
          console.log('Content:', content.post.substring(0, 200) + '...');
        }

        if (content.hashtags) {
          console.log('Hashtags:', content.hashtags.join(' '));
        }
        if (content.characterCount) {
          console.log('Character count:', content.characterCount);
        }
      });

    } else {
      console.error('❌ Error:', result.error);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure PERPLEXITY_API_KEY is set in your .env file');
    console.log('2. Check that your API key is valid (starts with "pplx-")');
    console.log('3. Ensure you have internet connection');
    console.log('4. Verify your API key has sufficient credits');
  }
}

// Run the test
testPerplexityService();