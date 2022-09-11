// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getStorage } from "firebase/storage";
// import * as firebase from "firebase/app";
// import "firebase/firestore";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import 'firebase/compat/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjW2A2j8EsB4P9XLwR6_CTPBYFMVM2KKU",
  authDomain: "datapocket-d280f.firebaseapp.com",
  projectId: "datapocket-d280f",
  storageBucket: "datapocket-d280f.appspot.com",
  messagingSenderId: "266063052652",
  appId: "1:266063052652:web:ffb83565d6f2c44c9abd49",
  measurementId: "G-XSEJVH8PD0",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
export default db;
