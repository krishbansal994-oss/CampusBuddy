import { initializeApp } from "firebase/app";
import {
  getAuth,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCpTlmHOiSq3UhNDbR9TkI47brIJnbzMoE",
  authDomain: "codeflux-b11e0.firebaseapp.com",
  projectId: "codeflux-b11e0",
  storageBucket: "codeflux-b11e0.firebasestorage.app",
  messagingSenderId: "683748050064",
  appId: "1:683748050064:web:2d56b45f6c959fd8b98415",
  measurementId: "G-7HGDQH69BY",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

/*
 * IMPORTANT:
 * Use session persistence instead of local persistence.
 *
 * This means every browser tab gets its own Firebase login session.
 * Admin can stay logged in on one tab while Student is logged in
 * on another tab using the same browser.
 */
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Could not set session authentication persistence:", error);
});

export const db = getFirestore(app);

isSupported()
  .then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  })
  .catch(() => {});

export default app;