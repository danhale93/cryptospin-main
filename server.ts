
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = 3000;

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

app.post('/api/gemini', async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent({ contents, ...config });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
