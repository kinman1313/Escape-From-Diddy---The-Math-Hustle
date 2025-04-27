// escape-from-diddy/README.md

# Escape From Diddy: The Math Hustle

This is a hilarious, gamified 7th-grade math quiz game built with Next.js and Tailwind CSS. It uses Firebase Auth + Firestore to track user progress, gear unlocks, and answer streaks while dodging the wrath of Diddy.

## 🚀 Setup Instructions

### 1. Clone the Repo
You can copy the file structure from here or build it manually. 

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Firebase Config
Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```
Then add your Firebase credentials to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally
```bash
npm run dev
```

## ✨ Features
- Firebase Auth (Google + Email)
- Question engine with JSON-powered questions
- Streak tracking + Diddy Proximity Meter
- Closet system for unlocked gear
- Meme SFX support (Howler.js)

## 🧠 Tech Stack
- Next.js
- Tailwind CSS
- Firebase (Auth + Firestore)
- Howler.js (for sound FX)

## 📂 Directory Overview
```
/components             # Game UI elements (DiddyMeter, QuestionCard, etc)
/data/questions.json     # Math questions
/lib/firebase.ts         # Firebase init config
/pages                   # Home, Game, Closet
/public/sounds           # Meme sound FX files
/styles                  # Tailwind base styles
```

## ✅ Next Steps
- Add more math questions to `/data/questions.json`
- Add hint/"I don't know" mechanic for Honest Abe Top Hat
- Implement Diddy cutscenes and pursuit animations
- Build gear bonus combos and synergy effects
- Add difficulty scaling and timed rounds

---

> Made for education. Powered by memes. Inspired by chaos.
> Escape From Diddy is where math meets the remix. 🎩📐🔥
