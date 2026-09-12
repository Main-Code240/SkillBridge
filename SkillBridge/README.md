# SIH26044 — Academia Industry Skill Portal

MERN foundation for Smart India Hackathon problem SIH26044.

## Structure
- `frontend/` — React + TypeScript + Vite + Tailwind
- `backend/` — Node.js + Express + MongoDB/Mongoose + JWT
- `scripts/` — project utility scripts

## Local setup
1. Copy `frontend/.env.example` to `frontend/.env`.
2. Copy `backend/.env.example` to `backend/.env` and set MongoDB/JWT values.
3. Run `npm install` inside `frontend` and `backend`.
4. Start backend with `npm run backend` from the root.
5. Start frontend with `npm run frontend` from the root.

The frontend still contains the Bolt-generated Supabase integration temporarily so existing UI pages are not broken during migration. The intended production architecture is Express + MongoDB; migrate individual Supabase calls to API hooks/services before removing that dependency.
