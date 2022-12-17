// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBpqcJ-2E0sJOIcyAPXwk6BXix9Kj34Hm8',
  authDomain: 'etherealsun.firebaseapp.com',
  databaseURL: 'https://etherealsun-default-rtdb.firebaseio.com',
  projectId: 'etherealsun',
  storageBucket: 'etherealsun.appspot.com',
  messagingSenderId: '812001406649',
  appId: '1:812001406649:web:762500e7c99a632218f568',
  measurementId: 'G-CJ8B1CL5H2'
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);
