// backend/server.js
import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Loads .env file

const app = express();
app.use(express.json()); // For parsing application/json
app.use(cors()); // To allow requests from your frontend

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/process-content', async (req, res) => {
  try {
    const { content } = req.body;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content }],
      model: "gpt-3.5-turbo",
    });
    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('An error occurred while processing content.');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});