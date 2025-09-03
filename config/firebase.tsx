import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdAHSAMh5fq8N8CzAF7IqYPAxULwzDaPU",
  authDomain: "fresh-on-time.firebaseapp.com",
  projectId: "fresh-on-time",
  storageBucket: "fresh-on-time.firebasestorage.app",
  messagingSenderId: "722952706056",
  appId: "1:722952706056:web:f704b7149f1153dd9959bd",
  measurementId: "G-XDJR7RJCB2",
};

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
auth.useDeviceLanguage();

const db = getFirestore(app);

export { auth, db };
