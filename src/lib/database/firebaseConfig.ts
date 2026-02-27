import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBWbAMK6_WHvC6rg8LvPpM82yHoPCKZBLQ",
    authDomain: "in-stocker-d26b7.firebaseapp.com",
    projectId: "in-stocker-d26b7",
    storageBucket: "in-stocker-d26b7.firebasestorage.app",
    messagingSenderId: "244355441035",
    appId: "1:244355441035:web:8a7c1de29e31c144648f8e",
    measurementId: "G-RX0G0S96CS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
