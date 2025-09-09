// scripts/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDV56FUyAlePJDFla4ZBvRkv4OUe8b9c8g",
    authDomain: "cham-phong.firebaseapp.com",
    projectId: "cham-phong",
    storageBucket: "cham-phong.firebasestorage.app",
    messagingSenderId: "871544721414",
    appId: "1:871544721414:web:b6619c3c49bdcdf44ff387",
    measurementId: "G-43GW7XRBXF"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
