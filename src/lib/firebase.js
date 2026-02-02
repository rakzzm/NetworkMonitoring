// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiSfu4bczNTtDoohx0j2lELXCOxl4TI-E",
  authDomain: "networkmanager-811c9.firebaseapp.com",
  projectId: "networkmanager-811c9",
  storageBucket: "networkmanager-811c9.firebasestorage.app",
  messagingSenderId: "213773148705",
  appId: "1:213773148705:web:de6f1f56ac26f0c2923960",
  measurementId: "G-G8HXJBSBY2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
