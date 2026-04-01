import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBggYG_Kj7UJw6Bm-d5ca2cbNpshvpAU-0",
  authDomain: "auth-30faa.firebaseapp.com",
  projectId: "auth-30faa",
  storageBucket: "auth-30faa.firebasestorage.app",
  messagingSenderId: "745112660730",
  appId: "1:745112660730:web:75b0d9d6c1bb2475813743",
};

let app, auth, provider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  
  // Force Google login to always show the account selector, useful for debugging
  provider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (error) {
  console.error("Firebase Initialization Failed:", error);
}

export { auth, provider };