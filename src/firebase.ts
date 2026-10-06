import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCnZfVW0OuSN8BU1MNZeparC0FHWqnmEg4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mathgame-a3d23.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mathgame-a3d23',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mathgame-a3d23.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '704930897650',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:704930897650:web:12317a1aa61583023fba6b',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-P8LMEK5G86',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user as User;
}

export async function savePlayerScore(uid: string, name: string, score: number) {
  const playerRef = doc(db, 'scores', uid);
  const existing = await getDoc(playerRef);

  if (existing.exists() && Number(existing.data().score || 0) >= score) {
    return;
  }

  await setDoc(playerRef, {
    uid,
    name,
    score,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToLeaderboard(
  callback: (entries: Array<{ uid: string; name: string; score: number }>) => void
) {
  const q = query(collection(db, 'scores'), orderBy('score', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map((docSnapshot) => ({
      uid: docSnapshot.id,
      name: docSnapshot.data().name || 'Player',
      score: Number(docSnapshot.data().score || 0),
    }));

    callback(entries);
  });
}
