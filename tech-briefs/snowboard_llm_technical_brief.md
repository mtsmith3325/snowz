# Technical Implementation Brief
## Snowboarding AI Assistant — POC Homepage
**Version 1.0 | Feb 2026 | For Developer Use**

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Recommended Free LLM Options](#2-recommended-free-llm-options)
3. [Project File Structure](#3-project-file-structure)
4. [Step-by-Step Implementation](#4-step-by-step-implementation)
5. [Skill-Level Response Logic](#5-skill-level-response-logic)
6. [Expected LLM Output Topics](#6-expected-llm-output-topics)
7. [VS Code Extensions Recommended](#7-vs-code-extensions-recommended)
8. [Security Checklist](#8-security-checklist)
9. [Implementation Checklist](#9-implementation-checklist)

---

## 1. Project Overview

This document provides step-by-step implementation guidance for integrating a Large Language Model (LLM) into a Proof of Concept (POC) homepage focused on snowboarding. The AI assistant will dynamically respond to user queries about lodging, mountain trail recommendations, and skill-based experiences for beginners through advanced riders.

| | |
|---|---|
| **Goal** | Build an interactive homepage chat agent that provides personalized snowboarding guidance using a free, open-source or free-tier LLM. |
| **Stack** | HTML/CSS/JavaScript frontend + Node.js backend + LLM API (Gemini, Groq/Llama, or Ollama local) |
| **Output** | A working POC page with a chat UI that answers snowboarding queries with relevant, structured results. |

---

## 2. Recommended Free LLM Options

The following LLM providers are safe, free for POC use, and require no credit card for their base tiers:

| LLM / Provider | Free Tier | Best For | Setup Difficulty |
|---|---|---|---|
| Google Gemini 2.0 Flash | Yes (no card required) | General POC, fast setup | Low |
| Groq + Llama 3.3 70B | Yes (rate limited) | Speed, smart responses | Low |
| OpenRouter (free models) | Yes (select models) | Model flexibility | Low |
| Ollama (local) | 100% free | Privacy, offline use | Medium |
| DeepSeek V3 | Yes (free tier) | Reasoning & detail | Low |

> **Recommendation for this POC:** Start with **Google Gemini 2.0 Flash** via Google AI Studio (aistudio.google.com). It requires only a Google account, provides an API key instantly, and has a generous free quota suitable for POC traffic.

---

## 3. Project File Structure

Set up the following folder structure in VS Code before writing any code:

```
snowboard-poc/
├── index.html              # Homepage with chat UI
├── style.css               # Styling for the page and chat widget
├── app.js                  # Frontend logic (UI interaction, API calls)
├── server.js               # Node.js backend (keeps API key secure)
├── prompts/
│   └── system_prompt.txt   # Master system prompt for LLM behavior
├── .env                    # API keys (NEVER commit to Git)
└── package.json            # Node dependencies
```

---

## 4. Step-by-Step Implementation

### Step 1 — Environment Setup

Install required tools and initialize the project in VS Code.

```bash
# In the VS Code terminal:
mkdir snowboard-poc && cd snowboard-poc
npm init -y
npm install express dotenv node-fetch cors
touch .env index.html style.css app.js server.js
echo 'GEMINI_API_KEY=your_key_here' > .env
```

---

### Step 2 — Obtain Your Free API Key

1. Navigate to [aistudio.google.com](https://aistudio.google.com) and sign in with your Google account.
2. Click **"Get API Key"** and create a key for a new or existing project.
3. Copy the key and paste it into your `.env` file as `GEMINI_API_KEY`.

**Alternative providers:**
- **Groq:** Sign up at console.groq.com → generate a free API key → store as `GROQ_API_KEY`
- **Ollama (local):** Install from ollama.ai, then run:
  ```bash
  ollama pull llama3.1
  ```

---

### Step 3 — Write the System Prompt

This is the most critical step. The system prompt shapes ALL responses from the LLM. Create the file `prompts/system_prompt.txt` with the following content:

```
You are SnowBot, an expert snowboarding assistant.
You help users plan snowboarding trips by providing:

1. MOUNTAIN RECOMMENDATIONS: Top resorts by region with trail ratings
   (beginner greens, intermediate blues, advanced blacks, expert double-blacks).

2. LODGING: Nearby hotels, ski-in/ski-out options, cabins, and budget ranges.

3. SKILL-BASED EXPERIENCES:
   - Beginner: lesson availability, gentle slopes, rentals, safety tips
   - Intermediate: varied terrain, park features, half-pipe access
   - Advanced/Expert: backcountry options, off-piste, steep chutes

4. SEASONAL INFO: Best months to visit, snowfall averages, ice conditions.

5. GEAR ADVICE: Board types, boot fitting, layering, helmet recommendations.

Always structure your response with clear headers. Be enthusiastic,
accurate, and safety-conscious. Ask for the user's skill level if not
provided. Never recommend terrain beyond the user's stated skill level.
```

---

### Step 4 — Build the Backend API Route (`server.js`)

The backend securely holds your API key and forwards requests to the LLM:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = require('fs').readFileSync('./prompts/system_prompt.txt', 'utf8');

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='
    + process.env.GEMINI_API_KEY,
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
  const reply = data.candidates[0].content.parts[0].text;
  res.json({ reply });
});

app.listen(3001, () => console.log('SnowBot API running on port 3001'));
```

---

### Step 5 — Build the Homepage (`index.html`)

Create a clean, on-brand homepage with an embedded chat widget:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SnowBot — Your Snowboarding Guide</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>⛷️ SnowBot — Your AI Snowboarding Guide</h1>
    <p>Ask me about mountains, lodging, and rides for your skill level.</p>
  </header>
  <main>
    <div id="chat-container">
      <div id="messages"></div>
      <div id="input-row">
        <input id="user-input" type="text" placeholder="Ask me about snowboarding..."/>
        <button onclick="sendMessage()">Send</button>
      </div>
    </div>
    <!-- Optional: Skill level quick-select buttons -->
    <div id="skill-buttons">
      <button onclick="setSkill('Beginner')">🟢 Beginner</button>
      <button onclick="setSkill('Intermediate')">🔵 Intermediate</button>
      <button onclick="setSkill('Advanced')">⚫ Advanced</button>
      <button onclick="setSkill('Expert')">💀 Expert</button>
    </div>
  </main>
  <script src="app.js"></script>
</body>
</html>
```

---

### Step 6 — Frontend Logic (`app.js`)

Wire the chat UI to your backend API:

```javascript
let skillLevel = '';

function setSkill(level) {
  skillLevel = level;
  document.getElementById('user-input').placeholder = `Asking as a ${level} rider...`;
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const messages = document.getElementById('messages');
  const userText = input.value.trim();
  if (!userText) return;

  const fullMessage = skillLevel
    ? `[Skill Level: ${skillLevel}] ${userText}`
    : userText;

  appendMessage('You', userText, 'user');
  input.value = '';

  const botMsg = appendMessage('SnowBot', 'Thinking...', 'bot');

  const res = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: fullMessage })
  });

  const data = await res.json();
  botMsg.querySelector('.msg-text').textContent = data.reply;
}

function appendMessage(sender, text, type) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${type}-message`;
  div.innerHTML = `<strong>${sender}:</strong> <span class="msg-text">${text}</span>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}
```

---

### Step 7 — Run & Test Locally

```bash
node server.js
# Then open index.html in browser
# Or use the VS Code "Live Server" extension for hot reload
```

**Test these queries to validate LLM output:**

- `"I'm a beginner. What are the best mountains for me on the East Coast?"`
- `"What lodging options are near Park City, Utah?"`
- `"I'm an advanced rider. Where can I find serious terrain in Colorado?"`
- `"What gear do I need for my first snowboarding trip?"`
- `"Compare Whistler and Vail for intermediate riders."`

---

## 5. Skill-Level Response Logic

The system prompt handles skill-level adaptation automatically, but the frontend quick-select buttons (Step 5) inject the rider's level into every message. Here's how the LLM should tailor responses:

| Skill Level | Mountain Focus | Experience Tailoring |
|---|---|---|
| **Beginner** | Green runs, bunny hills, lesson areas | Lessons, rental shops, beginner-friendly resorts, safety gear |
| **Intermediate** | Blue runs, terrain parks, groomed bowls | Freestyle intro, varied terrain, intermediate lodging combos |
| **Advanced** | Black diamond, moguls, tree runs | Off-piste options, patrol info, advanced lift access |
| **Expert** | Double-black, backcountry, heli access | Avalanche safety, backcountry permits, guide services |

---

## 6. Expected LLM Output Topics

The system prompt should reliably yield structured responses across these categories:

### Mountain Recommendations
- Top resorts by U.S. region (Northeast, Rockies, Pacific Northwest, Southeast)
- Trail breakdown by difficulty rating (green / blue / black / double-black)
- Unique terrain features (terrain parks, bowls, half-pipes, chutes)
- Lift infrastructure and crowd levels by month

### Lodging Locations
- Ski-in/ski-out hotels and their typical price ranges
- Nearby town accommodations (budget to luxury)
- Vacation rental options (Airbnb-style cabins, condos)
- Proximity to lifts, restaurants, and gear shops

### Skill-Based Experiences
- **Beginner:** lesson packages, instructor recommendations, first-day tips
- **Intermediate:** park progression, jump safety, off-piste intro
- **Advanced:** backcountry access, cat skiing, steep chute navigation
- **Expert:** heli-skiing regions, avalanche beacon requirements, guide services

### Supporting Content
- Best months to visit each resort (powder windows, conditions)
- Gear recommendations by skill level and budget
- Après-ski culture, dining, and local activities

---

## 7. VS Code Extensions Recommended

| Extension | Purpose |
|---|---|
| **Prettier** | Auto-format HTML, CSS, JS on save |
| **ESLint** | Catch JavaScript errors early |
| **REST Client** or **Thunder Client** | Test `/api/chat` endpoint without Postman |
| **Live Server** | Preview `index.html` with instant hot reload |
| **DotENV** | Syntax highlighting for `.env` files |
| **GitLens** | Track changes as you iterate on the POC |

---

## 8. Security Checklist

```
✅ DO: Store API key in .env and load with dotenv. Never hardcode keys in frontend files.

✅ DO: Add .env to your .gitignore before initializing any Git repository.
        echo '.env' >> .gitignore

✅ DO: Route all LLM calls through server.js so the API key stays server-side.

❌ AVOID: Calling the LLM API directly from app.js — your key will be exposed
          in browser network traffic.

❌ AVOID: Committing .env or any file containing API keys to GitHub.
```

---

## 9. Implementation Checklist

| Step | Task | Details |
|---|---|---|
| 01 | **Setup** | Create folder structure, run `npm init`, install dependencies |
| 02 | **API Key** | Obtain free key from Google AI Studio (or Groq / OpenRouter) |
| 03 | **System Prompt** | Write and save `prompts/system_prompt.txt` with snowboarding context |
| 04 | **Backend** | Build `server.js` with `/api/chat` POST route calling LLM API |
| 05 | **Frontend** | Build `index.html` with chat UI container and input field |
| 06 | **Logic** | Write `app.js` to connect UI to backend and render responses |
| 07 | **Test** | Run `node server.js`, open browser, test 5+ snowboarding queries |
| 08 | **Refine** | Adjust system prompt based on response quality and tone |
| 09 | **Skill Logic** | Verify frontend skill buttons pre-fill context correctly |
| 10 | **Security** | Confirm `.env` is in `.gitignore`, API key not exposed client-side |

---

*SnowBot POC Technical Brief — Internal Use Only — v1.0*
