# Smart Study Companion

AI-powered study platform for **Sri Lankan students**. Upload lecture PDFs/slides and get cheat sheets, flashcards, Tamil explanations, mock viva practice, and **ElevenLabs** voice lessons.

Built for the **Best Build by ElevenLabs** category.

## Features

| Feature | Description |
|--------|-------------|
| PDF/Slide upload | Students & lecturers upload lecture materials |
| Cheat sheet generator | Exam-focused markdown notes |
| Flashcards | Q&A cards with completion tracking |
| Tamil explanation | Simple Tamil / Tamil-English mix |
| Lecturer-style Tamil | “Explain like my lecturer in Tamil” |
| Voice mode | ElevenLabs multilingual TTS |
| Mock viva | One-by-one questions + AI feedback |
| Lecturer panel | Approve uploads, summaries, custom viva sets |
| Admin panel | Users, usage stats, content moderation |

## Tech stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (Mongoose)
- **AI:** OpenAI GPT-4o-mini
- **Voice:** ElevenLabs API
- **PDF:** pdf-parse

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Install

```bash
cd smart-study-companion   # your project folder (aaha)
npm run install:all
```

### 2. Configure server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/smart-study-companion
JWT_SECRET=your-long-secret
OPENAI_API_KEY=sk-...          # required for full AI features
ELEVENLABS_API_KEY=...         # required for voice mode
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### 3. Configure client

```bash
cp client/.env.example client/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Seed demo users

```bash
npm run seed
```

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.lk | student123 |
| Lecturer | lecturer@demo.lk | lecturer123 |
| Admin | admin@demo.lk | admin123 |

### 5. Run

```bash
npm run dev
```

- App: http://localhost:3000  
- API: http://localhost:5000/api/health  

## Demo flow (Operating Systems viva)

1. Login as **student@demo.lk**
2. Upload a PDF (e.g. deadlock lecture notes)
3. Open the document → **Generate Cheat Sheet**
4. **Create Flashcards** → **Explain in Tamil** → **Explain like my lecturer in Tamil**
5. **Voice Explanation** (ElevenLabs) — listen while revising
6. **Mock Viva Questions** — answer and get feedback
7. **Save to library** and download notes

## Project structure

```
├── client/          # Next.js frontend
├── server/          # Express API
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/   # OpenAI, ElevenLabs, PDF
└── README.md
```

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Sign up |
| POST | `/api/auth/login` | Login |
| POST | `/api/documents/upload` | Upload PDF/PPT |
| POST | `/api/study/cheat-sheet/:id` | Generate cheat sheet |
| POST | `/api/study/flashcards/:id` | Generate flashcards |
| POST | `/api/study/tamil/:id` | Tamil explanation |
| POST | `/api/study/voice/:id` | ElevenLabs voice |
| POST | `/api/study/viva/generate/:id` | Start mock viva |
| GET | `/api/admin/stats` | Admin analytics |

## Deployment

**Live**

- App: https://aaha1.netlify.app
- API: https://smart-study-api-sjc4.onrender.com/api/health
- Repo: https://github.com/AhamedAAHA/SmartStudyCompanionAAHA

**Netlify** (`client/`)

- Base directory: `client`
- Build: `npm run build`
- Publish directory: *(empty — Next.js plugin)*
- Env: `NEXT_PUBLIC_API_URL=https://smart-study-api-sjc4.onrender.com/api`

**Render** (`server/`)

- Root directory: `server`
- Build: `npm install && npm run build`
- Start: `npm start`
- Env: copy from `server/.env.example` — set `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `CLIENT_URL=https://aaha1.netlify.app`

**Database:** MongoDB Atlas (allow `0.0.0.0/0` for Render)

## Notes

- Without `OPENAI_API_KEY`, the app returns **demo placeholders** so judges can click through the UI.
- Voice mode requires a valid **ElevenLabs** key.
- PowerPoint files get placeholder text; **PDF** is recommended for best extraction.

## License

MIT — for educational and hackathon use.
