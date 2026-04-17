# MailCraft AI — Professional Email Writer

> Generate polished, context-aware emails instantly using Claude AI.
> Built with Node.js/Express + Vanilla HTML/CSS/JS.

---

## 📸 Features

- ✅ AI-powered email generation (Claude Sonnet via Anthropic API)
- ✅ 6 tone options: Formal, Professional, Friendly, Persuasive, Apologetic, Grateful
- ✅ Pre-categorized recipient types (Boss, HR, Client, Professor, etc.)
- ✅ Optional key points and sender name
- ✅ Structured subject + body output
- ✅ One-click copy to clipboard
- ✅ Save emails locally (up to 20)
- ✅ Loading spinner & error handling
- ✅ Regenerate functionality
- ✅ Fully responsive dark UI
- ✅ Rate limiting & security headers

---

## 🗂 File Structure

```
ai-email-writer/
├── frontend/
│   ├── index.html          # Main UI page
│   ├── style.css           # All styling (dark editorial theme)
│   └── script.js           # Frontend logic, API calls, save/copy
│
├── backend/
│   ├── server.js           # Express server entry point
│   ├── routes/
│   │   └── emailRoutes.js  # API route definitions
│   ├── controllers/
│   │   └── emailController.js  # AI prompt engineering + API call
│   └── middleware/
│       └── rateLimiter.js  # Rate limiting (10 req/min)
│
├── .env.example            # Template — copy to .env
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Local Setup (Step-by-Step)

### Prerequisites
- Node.js 18+ installed → https://nodejs.org
- An Anthropic API key → https://console.anthropic.com

---

### Step 1 — Clone / Download the project

```bash
git clone https://github.com/YOUR_USERNAME/ai-email-writer.git
cd ai-email-writer
```

Or just download and unzip to a folder.

---

### Step 2 — Install Dependencies

```bash
npm install
```

This installs:
- `express` — web server
- `@anthropic-ai/sdk` — Claude AI client
- `cors` — cross-origin resource sharing
- `helmet` — security headers
- `dotenv` — environment variables
- `express-rate-limit` — API rate limiting
- `nodemon` (dev) — auto-restart on file changes

---

### Step 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500
```

**Where to get your Anthropic API key:**
1. Go to https://console.anthropic.com
2. Click "API Keys" in the sidebar
3. Click "Create Key"
4. Copy and paste into `.env`

---

### Step 4 — Start the Backend Server

```bash
# Production start
npm start

# Development (auto-restarts on changes)
npm run dev
```

You should see:
```
🚀 AI Email Writer Backend running!
   Local:   http://localhost:5000
   Mode:    development
   API Key: ✅ Loaded
```

Test it's working:
```
http://localhost:5000/api/health
```

---

### Step 5 — Open the Frontend

**Option A: Use VS Code Live Server (recommended)**
1. Install the "Live Server" extension in VS Code
2. Right-click `frontend/index.html`
3. Select "Open with Live Server"
4. It opens at `http://127.0.0.1:5500`

**Option B: Open directly**
- Just open `frontend/index.html` in your browser
- Note: You may need to adjust CORS in `.env` if the URL differs

---

### Step 6 — Verify Connection

The frontend calls `http://localhost:5000/api/generate-email` by default.

If your backend runs on a different port, update this line in `frontend/script.js`:
```javascript
const API_BASE_URL = "http://localhost:5000";  // ← Change this
```

---

## 🌐 FREE Deployment Guide

### Backend → Deploy on Render (Free tier)

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-email-writer.git
git push -u origin main
```

> ⚠️ IMPORTANT: Make sure `.env` is in `.gitignore` — never push API keys!

**Step 2: Deploy on Render**
1. Go to https://render.com and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your repository
4. Configure:
   - **Name:** `ai-email-writer-api` (or any name)
   - **Root Directory:** leave blank
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Click **"Advanced"** → **"Add Environment Variable"**:
   - Key: `ANTHROPIC_API_KEY` → Value: your key
   - Key: `NODE_ENV` → Value: `production`
   - Key: `FRONTEND_URL` → Value: `https://your-app.netlify.app` (fill in after frontend deploy)
6. Click **"Create Web Service"**
7. Wait 2-3 minutes. You'll get a URL like:
   ```
   https://ai-email-writer-api.onrender.com
   ```

> ⚠️ Free Render services sleep after 15 minutes of inactivity (first request takes ~30s to wake up).

---

### Frontend → Deploy on Netlify (Free tier)

**Step 1: Update the API URL**

Edit `frontend/script.js`:
```javascript
const API_BASE_URL = "https://ai-email-writer-api.onrender.com"; // Your Render URL
```

Commit and push:
```bash
git add frontend/script.js
git commit -m "Update API URL for production"
git push
```

**Step 2: Deploy on Netlify**
1. Go to https://netlify.com and sign up (free)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub and select your repository
4. Configure:
   - **Base directory:** `frontend`
   - **Publish directory:** `frontend`
   - Build command: (leave empty)
5. Click **"Deploy site"**
6. You'll get a URL like:
   ```
   https://mailcraft-ai-yourname.netlify.app
   ```

**Step 3: Update CORS on Render**
1. Go to your Render dashboard → your web service → Environment
2. Update `FRONTEND_URL` to your Netlify URL
3. Render will auto-redeploy

---

### Alternative: Deploy Backend on Railway

1. Go to https://railway.app and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repo
4. Go to **Settings** → **Variables** and add:
   - `ANTHROPIC_API_KEY` = your key
   - `NODE_ENV` = production
5. Go to **Settings** → **Networking** → **Generate Domain**
6. Your URL will be something like `https://ai-email-writer.up.railway.app`

---

## 🔌 API Reference

### POST `/api/generate-email`

**Request Body:**
```json
{
  "purpose": "Job application for Software Engineer at Google",
  "recipientType": "HR Department",
  "tone": "professional",
  "keyPoints": "5 years experience, worked on scalable systems, available immediately",
  "senderName": "Kartiki Sharma"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "subject": "Application for Software Engineer Position",
    "body": "Dear Hiring Team,\n\nI am writing to express...",
    "metadata": {
      "purpose": "...",
      "recipientType": "HR Department",
      "tone": "professional",
      "generatedAt": "2025-01-01T12:00:00.000Z",
      "tokensUsed": 280
    }
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Missing required fields: purpose, recipientType, and tone are required."
}
```

---

### GET `/api/health`

Returns server status. Use to verify deployment is working.

---

## 🛡 Security Notes

- API key stored in `.env` (never committed)
- Rate limiting: 10 requests/minute per IP
- Helmet.js security headers enabled
- CORS restricted to your frontend URL in production
- Input length limits enforced (500 chars purpose, 1000 chars key points)

---

## 🧑‍💻 Troubleshooting

| Problem | Solution |
|---|---|
| `ANTHROPIC_API_KEY is not set` | Copy `.env.example` to `.env` and add your key |
| CORS error in browser | Update `FRONTEND_URL` in `.env` to match your dev URL |
| Port already in use | Change `PORT=5001` in `.env` |
| Fetch fails on live site | Update `API_BASE_URL` in `script.js` to your Render URL |
| Render app slow to start | Free tier sleeps — first request takes ~30s |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js 18+, Express 4 |
| AI | Anthropic Claude (claude-sonnet) |
| Security | Helmet.js, express-rate-limit, CORS |
| Deployment (BE) | Render / Railway |
| Deployment (FE) | Netlify / Vercel |

---

## 🔮 Possible Extensions

- [ ] User authentication (save emails per account)
- [ ] Email history with search
- [ ] More tone/style options
- [ ] Direct Gmail/Outlook integration
- [ ] PDF export
- [ ] Multi-language support

---

Built by Kartiki Sharma · Portfolio Project · 2025
