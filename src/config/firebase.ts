import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

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

// Initialize analytics
try {
  const analytics = getAnalytics(app);
  console.log("Firebase Analytics initialized successfully");
} catch (error) {
  console.warn("Firebase Analytics initialization warning:", error);
  // Analytics is not critical, so we continue even if it fails
}
