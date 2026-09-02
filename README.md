# SkateComp - Inline Skate Competition Management System

SkateComp is a modern web application designed for organizing, managing, and tracking inline skate competitions. The system integrates three user roles — **Participants (Peserta)**, **Judges (Juri)**, and **Administrators (Admin)** — each with their own dedicated dashboard and protected routes.

## Features
- **Registration & Verification**: Streamlined participant registration and payment proof upload, with admin verification via Supabase Storage.
- **Admin Dashboard**: Real-time management of participants, payment statuses, judge accounts, and scoring recaps.
- **Judge Scoring & Recap**: Multi-aspect judge scoring system (3 aspects per participant) with automatic final score calculation.
- **Competition Results**: Winners (1st, 2nd, 3rd place) announced per schedule and category.
- **Role-Based Access**: JWT-authenticated login with separate protected dashboards for Peserta, Juri, and Admin.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL (via Supabase), JWT, bcryptjs
- **Storage**: Supabase Storage (payment proof files)
- **Deployment**: Vercel (primary) / GitHub Pages (alternative)
