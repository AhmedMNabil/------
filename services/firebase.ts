
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// ============================================================================
// NOTE: The data you provided was a Service Account Key (for backends).
// Frontend apps use a different set of keys (API Key, App ID).
//
// I have filled in the Project ID based on your data.
// You must fill in the remaining fields (apiKey, appId) from:
// Firebase Console -> Project Settings -> General -> Your apps
// ============================================================================

const firebaseConfig = {
  // 1. Get this from Firebase Console -> Project Settings
  apiKey: "AIzaSyAuJf5YDH58K6gOclUrkMDSTGnmXvwMcNg",

  // These are derived from your project ID "agent-6b6d1"
  authDomain: "agent-6b6d1.firebaseapp.com",
  projectId: "agent-6b6d1",
  storageBucket: "agent-6b6d1.appspot.com",
  databaseURL: "https://agent-6b6d1-default-rtdb.firebaseio.com/",

  // 2. Get these from Firebase Console -> Project Settings
  messagingSenderId: "736243321420",
  appId: "1:736243321420:web:62281d846be87828c082e9"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase App Initialized:", app.name);
} else {
  app = getApp();
  console.log("Firebase App Retrieved:", app.name);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const database = getDatabase(app);

console.log("Auth Initialized:", auth);
export default app;
