import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ecotracker-9f467.firebaseapp.com",
  projectId: "ecotracker-9f467",
  storageBucket: "ecotracker-9f467.firebasestorage.app",
  messagingSenderId: "178403577005",
  appId: "1:178403577005:web:793eb6b55569458e7d0a24",
  measurementId: "G-88EQDTVEVX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);

export {db};