# CURSOR BUILDATHON — Project Submission Document

**Smart Study Companion · Best Build by ElevenLabs**  
*Confidential — For Authorized Use Only*

---

## 01 — Project Overview

### Project Name & One-Line Pitch

**Project Name:** Smart Study Companion

An AI-powered study platform that turns university lecture PDFs into cheat sheets, flashcards, Tamil/Sinhala explanations, mock viva practice, and ElevenLabs voice lessons — built for Sri Lankan students.

### Summary

Sri Lankan university students often revise from dense English lecture slides with little time to rewrite notes, practise orally, or get explanations in Tamil or Sinhala before exams and vivas. Smart Study Companion lets students, lecturers, and admins register and use role-based dashboards. Students upload PDF or PowerPoint lecture materials; the system extracts text with pdf-parse, uses OpenAI GPT-4o-mini to generate exam-focused study assets, and uses ElevenLabs multilingual text-to-speech (eleven_multilingual_v2) so students can listen while revising or walking. OpenAI Whisper transcribes voice doubts and walk interrupts. Lecturers approve uploads, summarize content, and configure custom viva sets; admins monitor usage. The product targets undergraduates at institutions such as SLIIT who need local-language tutoring and voice-first revision without hiring private tutors.

### Submission Details

- **Track:** Best Build by ElevenLabs (ElevenLabs API is core to voice lessons, Walk & Learn segments, doubt responses, and material audio)
- **Team name:** AAHA
- **Live app URL:** https://aaha1.netlify.app
- **Demo video URL:** https://aaha1.netlify.app/demo
- **API health check:** https://smart-study-api-sjc4.onrender.com/api/health
- **Repository:** https://github.com/AhamedAAHA/SmartStudyCompanionAAHA

**Demo login accounts** (after `npm run seed` on MongoDB):

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.lk | student123 |
| Lecturer | lecturer@demo.lk | lecturer123 |
| Admin | admin@demo.lk | admin123 |

---

## 02 — Problem Statement

### The Problem

- **Who:** Sri Lankan university students (especially IT/engineering undergraduates) revising for exams and vivas.
- **Context:** Lecturers share English PDF slides; students need condensed notes, oral practice, and explanations in Tamil, Sinhala, or mixed student English — often while commuting or walking.
- **Consequence if unsolved:** Poor exam performance, anxiety before vivas, and dependence on expensive tuition or memorising slides without understanding.

### Why It Matters

- **High frequency:** Every semester, every module — revision pressure peaks before exams.
- **Current workarounds:** Manual note-taking, ChatGPT without lecture context, generic TTS with robotic voices, WhatsApp voice notes — all lack structured viva practice, lecturer-approved content, and natural multilingual voice tuned to local study habits.

### Root Cause

Lecture knowledge is locked in static PDFs and English-only delivery, while students learn best through layered formats (summary, Q&A, oral explanation, local language) and hands-free audio — a gap generic global study apps do not address for Sri Lankan academic culture.

---

## 03 — Proposed Solution

### What the Product Does

Users register as students, lecturers, or admins with JWT authentication. Students upload PDF or PPT files; the backend extracts text and stores documents in MongoDB. From the study workspace, one click generates cheat sheets, flashcards, study plans, MCQ quizzes, or mock viva. The Languages & doubts hub provides Tamil explanations, Sri Lankan mix modes, ElevenLabs voice lessons, and voice/text doubts. Walk & Learn delivers segmented podcast-style lessons with interrupts. Lecturers approve uploads and publish viva sets; admins view statistics.

### Key Features

- PDF/PPT upload & text extraction
- Cheat sheet generator
- Flashcards with completion tracking
- Tamil, Sinhala, and Sri Lankan student-English explanations
- ElevenLabs voice lessons (browser TTS fallback)
- Mock viva with AI feedback
- Walk & Learn with interrupt actions
- Voice doubt (Whisper + GPT + ElevenLabs)
- Export to PDF/DOCX
- Lecturer & admin panels
- Exam countdown and Pomodoro timer

### Scope

**In scope:** Full study workflow, ElevenLabs integration, JWT roles, Netlify + Render + MongoDB Atlas deployment.

**Out of scope:** OCR for scanned PDFs, full PPT extraction, persistent cloud storage on Render free tier, native mobile apps, billing.

---

## 04 — Functional Requirements

### Must Have

- FR-M1: Register, login, JWT session
- FR-M2: Upload PDF/PPT, view status
- FR-M3: Cheat sheet, flashcards, Tamil explanation
- FR-M4: ElevenLabs voice (+ browser fallback)
- FR-M5: Mock viva with feedback
- FR-M6: Walk & Learn
- FR-M7: Lecturer and admin panels

### Should Have

- FR-S1: Voice doubt
- FR-S2: MCQ quiz and study plan
- FR-S3: PDF/DOCX export
- FR-S4: Exam countdown and Pomodoro

---

## 05 — Non-Functional Requirements

- AI generation: 5–20 seconds typical
- ElevenLabs: 90s timeout, 3 retries, 1800 char cap
- Lecture text truncated to ~12,000 chars for GPT
- Demo placeholders without OpenAI key; browser TTS without ElevenLabs
- Node 18 on Netlify; MongoDB Atlas for production

---

## 06 — Technical Architecture

**Stack:** Next.js 14 (Netlify) → Express + TypeScript (Render) → MongoDB Atlas → OpenAI + ElevenLabs.

**Hosting:**

- Client: Netlify — base `client/`, `NEXT_PUBLIC_API_URL=https://smart-study-api-sjc4.onrender.com/api`
- Server: Render — root `server/`, env from `server/.env.example`
- CORS: `CLIENT_URL` + `*.netlify.app` in production

---

## 07 — Security

- JWT + bcrypt (12 rounds)
- Secrets server-side only
- Multer upload validation (PDF/PPT, 25 MB max)
- No rate limiting in MVP

---

## 08 — User Stories

See README demo flow: login → upload OS PDF → cheat sheet → flashcards → Tamil → voice → viva → library.

---

## 09 — Target Users & Market

Sri Lankan university undergraduates (SLIIT, STEM); expandable to wider LK higher ed and South Asian multilingual ed-tech.

---

## 10 — Business Model

Freemium SaaS; student premium LKR 500–1,000/month; university licences; SLIIT pilot GTM.

---

## 11 — Why This Project Leads the Track

ElevenLabs integrated across voice lessons, walk mode, doubts, and material audio — not a single demo button. Whisper + GPT + ElevenLabs pipeline. Live deploy at https://aaha1.netlify.app.

---

## 12 — Team & Roles

**Ahamed (AAHA)** — Full-stack developer. SLIIT IT (it24102342@my.sliit.lk). Built Next.js UI, Express API, MongoDB, OpenAI, ElevenLabs, deployment.

---

*Cursor Buildathon · Cursor × TechTalk360 · Confidential*
