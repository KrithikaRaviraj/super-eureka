import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyASj6sii14dZf77_1X3JARKMGkvCUHoBbc",
  authDomain: "lavish-salon-uchila-b9ce4.firebaseapp.com",
  databaseURL: "https://lavish-salon-uchila-b9ce4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lavish-salon-uchila-b9ce4",
  storageBucket: "lavish-salon-uchila-b9ce4.firebasestorage.app",
  messagingSenderId: "1030081981119",
  appId: "1:1030081981119:web:98dd7a1aa0b60e6644f40a",
  measurementId: "G-ZXPL0TL59T"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
