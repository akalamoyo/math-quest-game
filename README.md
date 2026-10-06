# Math Quest Adventure

A colorful math game for children ages 5-8 built with React, Vite, and Firebase.

Features:
- Google Sign-In with Firebase Authentication
- 10 progressive math levels
- Friendly leaderboard with Firebase Firestore
- Unlock-based progression: Level 1 unlocks Level 2, and so on
- Kid-friendly UI with vibrant colors and simple interactions
- Firebase Hosting ready

## Local setup

1. Install dependencies:
   npm install

2. Create a `.env.local` file in the root using `.env.example` as a guide.

3. Start the app:
   npm run dev

## Firebase deployment

1. Install Firebase CLI if needed:
   npm install -g firebase-tools

2. Login:
   firebase login

3. Run the project setup commands if needed:
   firebase init hosting

4. Deploy:
   npm run deploy

## Firebase config values

Use your Firebase web config values in the `.env.local` file. The project is set up to use Google authentication and Firestore.
