// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  projectId: "remindexcel",
  appId: "1:977116603882:web:ec767b0b195b56688afe93",
  storageBucket: "remindexcel.firebasestorage.app",
  apiKey: "AIzaSyA-EBUC2tvlXeBY24E3jgsrcDJ2KNm89V4",
  authDomain: "remindexcel.firebaseapp.com",
  messagingSenderId: "977116603882",
  databaseURL: "https://remindexcel-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getDatabase(app);

export { auth, app, db };
