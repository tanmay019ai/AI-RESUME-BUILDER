# AI-RESUME-BUILDER

Production-ready AI Resume Builder SaaS MVP.

## Folder structure

- `client/` — React (Vite) + Tailwind + Router + Framer Motion + Axios
- `server/` — Express + MongoDB (Mongoose) + JWT + Razorpay + Gemini + PDF

## Prerequisites

- Node.js 18+ (recommended)
- MongoDB (local or Atlas)
- Razorpay account (test keys)
- Google AI Studio (Gemini API key)

## Setup

1) Install dependencies

```bash
npm run install:all
```

2) Configure env vars

- Create `server/.env` from `server/.env.example`
- Create `client/.env` from `client/.env.example`

3) Run dev

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:8080 (or whatever `PORT` is set to)

## Notes

- Free users can generate 1 resume only (enforced by `resumeCount`).
- Free user PDF downloads include a watermark.
- Pro upgrade is done through Razorpay order + signature verification.

