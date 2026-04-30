import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_8gplelZCfeDrr03K9pna4iIph0iKBd0",
  authDomain: "vuln-spectra.firebaseapp.com",
  projectId: "vuln-spectra",
  storageBucket: "vuln-spectra.firebasestorage.app",
  messagingSenderId: "1083623884393",
  appId: "1:1083623884393:web:0680134b5411004ac144f8",
  measurementId: "G-PJ082B5J9F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
