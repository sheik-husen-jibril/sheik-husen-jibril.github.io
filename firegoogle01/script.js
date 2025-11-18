import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js"; // Use a stable/recent version
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js"; // Import Auth functions

// Your Firebase Configuration (Keep this as is)
const firebaseConfig = {
  apiKey: "AIzaSyBUhcN9oviRFxFyYi27Hg9MxtaE0gJy4q4",
  authDomain: "loginregister01-51805.firebaseapp.com",
  projectId: "loginregister01-51805",
  storageBucket: "loginregister01-51805.firebasestorage.app",
  messagingSenderId: "605068863596",
  appId: "1:605068863596:web:c1048d32fdfaefa0041049",
};

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Get Auth instance and Google Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Note: With the Modular SDK, there is generally no separate "signUpWithPopup" for Google.
// "signInWithPopup" handles both sign-up (for new users) and sign-in (for existing users).

function loginGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      // The result object has the user credential and token details
      const user = result.user;
      const message = document.getElementById("message");
      message.innerHTML = `✅ Login successful! <br><small>Welcome, ${user.displayName}!</small>`;
    })
    .catch((error) => {
      const message = document.getElementById("message");
      message.innerHTML = `❌ Login error: ${error.message}`;
    });
}

// You likely don't need a separate register function for Google sign-in.
// You can remove this function or simply call loginGoogle() from your registration button.
function registerGoogle() {
  loginGoogle(); // Simply use the same logic, as it handles both
}
