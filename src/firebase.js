// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDt2oscYK_HUiiaF1ynjcIctoQSgYLqryU",
  authDomain: "sinalize-2139e.firebaseapp.com",
  projectId: "sinalize-2139e",
  storageBucket: "sinalize-2139e.appspot.com",
  messagingSenderId: "980807065168",
  appId: "1:980807065168:web:245077798364dbfe64bb55",
  measurementId: "G-NKGMKVRZL7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default app;

export const auth = getAuth(app);
export const database = db;
