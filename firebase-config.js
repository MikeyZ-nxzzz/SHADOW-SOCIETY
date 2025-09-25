// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDS9Op-pKKg3AjgLXNrglTSVLA-q4R9PIs",
    authDomain: "shadow-society.firebaseapp.com",
    projectId: "shadow-society",
    storageBucket: "shadow-society.firebasestorage.app",
    messagingSenderId: "557495386085",
    appId: "1:557495386085:web:6730997e8d3a1551db390c",
    measurementId: "G-4G7KDVC5LR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

window.firebaseApp = app;
window.firebaseDB = db;
window.firebaseAuth = auth;