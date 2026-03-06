const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = fs.readFileSync('./tech-briefs/snowboard_llm_system_prompt.txt', 'utf8');

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: message }] }]
      })
    }
  );

  const data = await response.json();
  const reply = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text ? data.candidates[0].content.parts[0].text : 'Sorry, no response.';
  res.json({ reply });
});

app.listen(3001, () => console.log('SnowBot API running on port 3001'));
