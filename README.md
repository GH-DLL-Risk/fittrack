# FitTrack

A personal fitness tracker that installs on Android as a web app (PWA) and works offline.

- Daily log: body weight, body fat %, sleep, calories eaten, cardio (with distance and heart rate) and weight lifting sets
- Library of ~100 strength exercises and ~35 cardio activities, plus custom ones and workout templates
- Progress: goals with projections, trends, energy balance, per-exercise and per-activity charts, muscle group balance

## Privacy

All data stays in the browser on your phone. The app has no server, no accounts and no tracking, and its
Content-Security-Policy blocks it from making network connections. Optional app lock and backup passwords
encrypt data with AES-256-GCM (PBKDF2-SHA256 key derivation).

## Team rankings

The Ranking tab compares team members on exercises, weight/body fat goal progress and calories. Members join
with an invite code and a nickname (anonymous account, no email or password). Every metric is opt-in, and only
summary numbers are sent; the backend is Supabase, set up with [`supabase/schema.sql`](supabase/schema.sql), where
tables are closed to direct access and all reads/writes go through functions that check team membership.

## Install

- **Android:** open the link in Chrome, then ⋮ → **Install app** / **Add to Home screen**.
- **iPhone:** open the link in Safari, then Share → **Add to Home Screen**.
