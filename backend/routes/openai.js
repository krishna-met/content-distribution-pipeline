// backend/routes/openai.js
import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load the .env file

const router = express.Router();

// Initialize the OpenAI client with the key from your .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/process-content', async (req, res) => {
  try {
    const { content } = req.body;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: content }],
      model: "gpt-3.5-turbo",
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to process content with OpenAI.' });
  }
});

export default router;