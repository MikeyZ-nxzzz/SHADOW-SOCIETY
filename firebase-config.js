// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAF1jliPFlZZ3o5mxDFnMhwUdkOIcCWZKU",
    authDomain: "shadow-society1.firebaseapp.com",
    projectId: "shadow-society1",
    storageBucket: "shadow-society1.firebasestorage.app",
    messagingSenderId: "444011718463",
    appId: "1:444011718463:web:4070e8a343d634bb38958a",
    measurementId: "G-4X4LCRQ5TG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.firebaseApp = app;
window.firebaseDB = db;
window.firebaseAuth = auth;

console.log("✅ Firebase config chargée !");