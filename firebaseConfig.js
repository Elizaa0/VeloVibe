import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyChjXbNq7enfZpeJhP7zlAPAJy1dtmwPzk",
  authDomain: "velovibe-3922e.firebaseapp.com",
  projectId: "velovibe-3922e",
  storageBucket: "velovibe-3922e.appspot.com",
  messagingSenderId: "718267597069",
  appId: "1:718267597069:web:58beac517e9e0f958a3044",
  measurementId: "G-953FXJX7GS"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja Firestore i Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Eksport instancji
export { db, auth };
