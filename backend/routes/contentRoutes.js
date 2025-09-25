// backend/routes/contentRoutes.js
import express from 'express';
import openaiService from '../services/openaiService.js';

const router = express.Router();

// Simple validation function
const validateContent = (content) => {
  const errors = [];
  
  if (!content) {
    errors.push({ field: 'content', message: 'Content is required' });
  } else if (typeof content !== 'string') {
    errors.push({ field: 'content', message: 'Content must be a string' });
  } else if (content.trim().length < 10) {
    errors.push({ field: 'content', message: 'Content must be at least 10 characters long' });
  } else if (content.length > 2000) {
    errors.push({ field: 'content', message: 'Content must not exceed 2000 characters' });
  }
  
  return errors;
};

// Content processing endpoint
router.post('/process', async (req, res) => {
  try {
    const { content } = req.body;

    // Validate input
    const validationErrors = validateContent(content);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    // Process content with OpenAI
    const result = await openaiService.processContent(content.trim());

    res.json(result);

  } catch (error) {
    console.error('Content processing endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
