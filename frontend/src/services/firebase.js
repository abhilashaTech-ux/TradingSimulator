import { initializeApp } from "firebase/app";

import {
  getAuth
} from "firebase/auth";

import {
  getFirestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZ-qjLFjHLhEvsKpGONBucwE_RKOxjA_c",
  authDomain: "trading-simulator-b1fc7.firebaseapp.com",
  projectId: "trading-simulator-b1fc7",
  storageBucket: "trading-simulator-b1fc7.firebasestorage.app",
  messagingSenderId: "977901909021",
  appId: "1:977901909021:web:71c81f3fccbb3121b202f4"
};



// Initialize Firebase

const app =
  initializeApp(firebaseConfig);


// Firebase Authentication

export const auth =
  getAuth(app);


// Firestore Database

export const db =
  getFirestore(app);


