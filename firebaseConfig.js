import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChjXbNq7enfZpeJhP7zlAPAJy1dtmwPzk",
  authDomain: "velovibe-3922e.firebaseapp.com",
  projectId: "velovibe-3922e",
  storageBucket: "velovibe-3922e.appspot.com",
  messagingSenderId: "718267597069",
  appId: "1:718267597069:web:58beac517e9e0f958a3044",
  measurementId: "G-953FXJX7GS"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('error');

export { auth, db };
