// Enhanced server.js with tone selection support
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ContentAPIService from './services/contentService.js';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

if (!perplexityApiKey) {
  console.error("PERPLEXITY_API_KEY not found. Please check your .env file.");
  process.exit(1);
}

const contentAPIService = new ContentAPIService(perplexityApiKey);

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Enhanced Content Distribution API is running!',
    perplexityStatus: perplexityApiKey ? 'configured' : 'missing',
    availableFeatures: ['sentiment-analysis', 'tone-selection', 'ai-hashtags', 'multi-platform']
  });
});

// Get available tones endpoint
app.get('/api/content/tones', (req, res) => {
  res.json({
    success: true,
    tones: contentAPIService.getAvailableTones(),
    default: 'professional'
  });
});

// Enhanced content processing endpoint with tone support
app.post('/api/content/process', async (req, res) => {
  try {
    const { content, tone = 'professional' } = req.body;

    // Enhanced validation
    if (!content) {
      return res.status(400).json({ 
        success: false,
        error: 'Content is required.',
        code: 'MISSING_CONTENT'
      });
    }

    if (typeof content !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Content must be a string.',
        code: 'INVALID_CONTENT_TYPE'
      });
    }

    if (content.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        error: 'Content must be at least 10 characters long.',
        code: 'CONTENT_TOO_SHORT'
      });
    }

    if (content.length > 3000) {
      return res.status(400).json({ 
        success: false,
        error: 'Content must not exceed 3000 characters.',
        code: 'CONTENT_TOO_LONG'
      });
    }

    // Validate tone if provided
    const availableTones = contentAPIService.getAvailableTones();
    const selectedTone = availableTones.includes(tone) ? tone : 'professional';

    console.log(`Processing content with tone: ${selectedTone}`);

    // Process content with enhanced service
    const result = await contentAPIService.processContent(content.trim(), selectedTone);

    // Add processing metadata
    const enhancedResult = {
      ...result,
      metadata: {
        processedAt: new Date().toISOString(),
        toneUsed: selectedTone,
        contentLength: content.trim().length,
        processingTime: Date.now()
      }
    };

    res.json(enhancedResult);

  } catch (error) {
    console.error('Backend API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process content.',
      code: 'PROCESSING_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Batch processing endpoint (for multiple contents)
app.post('/api/content/batch-process', async (req, res) => {
  try {
    const { contents, tone = 'professional' } = req.body;

    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contents must be a non-empty array.',
        code: 'INVALID_BATCH_INPUT'
      });
    }

    if (contents.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 contents allowed per batch.',
        code: 'BATCH_TOO_LARGE'
      });
    }

    const results = await Promise.allSettled(
      contents.map(content => contentAPIService.processContent(content, tone))
    );

    const batchResult = {
      success: true,
      results: results.map((result, index) => ({
        index,
        status: result.status,
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      })),
      metadata: {
        processedAt: new Date().toISOString(),
        batchSize: contents.length,
        toneUsed: tone
      }
    };

    res.json(batchResult);

  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch processing failed.',
      code: 'BATCH_PROCESSING_ERROR'
    });
  }
});

// Alternative endpoint for backward compatibility
app.post('/api/content/process-content', (req, res) => {
  req.url = '/api/content/process';
  return app._router.handle(req, res);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/content/tones',
      'POST /api/content/process',
      'POST /api/content/batch-process'
    ]
  });
});

// Enhanced global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Content Distribution API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Available tones: http://localhost:${PORT}/api/content/tones`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Perplexity AI: ${perplexityApiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`✨ Features: Tone Selection, AI Hashtags, Multi-Platform, Batch Processing`);
});
