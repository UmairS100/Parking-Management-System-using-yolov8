// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjkOHyqHhjkADkEoAFs9V7_EbOfcKBTIY",
  authDomain: "parkingmanagement-63328.firebaseapp.com",
  databaseURL: "https://parkingmanagement-63328-default-rtdb.firebaseio.com",
  projectId: "parkingmanagement-63328",
  storageBucket: "parkingmanagement-63328.appspot.com",
  messagingSenderId: "259928285639",
  appId: "1:259928285639:web:ce21d04764fcdbe021f9e2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);