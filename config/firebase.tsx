import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCdAHSAMh5fq8N8CzAF7IqYPAxULwzDaPU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fresh-on-time.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fresh-on-time",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fresh-on-time.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "722952706056",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:722952706056:web:f704b7149f1153dd9959bd",
  measurementId: "G-XDJR7RJCB2",
};

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
auth.useDeviceLanguage();

const db = getFirestore(app);

export { auth, db };
