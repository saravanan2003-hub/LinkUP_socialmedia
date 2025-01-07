import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcMGctxDkc6nbPfPlz8y9VQzIK8DZvmyw",
    authDomain: "login-page-bdc79.firebaseapp.com",
    projectId: "login-page-bdc79",
    storageBucket: "login-page-bdc79.appspot.com",
    messagingSenderId: "538575381624",
    appId: "1:538575381624:web:bd0a5d2a1ec0ce2c19798d",
    measurementId: "G-DQ5DBRCF8D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

// DOM Elements
const resetPasswordForm = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const messageDiv = document.getElementById("message");
const emailError = document.getElementById("emailErr");

// Validate email format
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Validate form input
const validateForm = () => {
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
        emailError.textContent = "Email is required";
        return false;
    } else if (!validateEmail(emailVal)) {
        emailError.textContent = "Invalid email format. Please check and try again.";
        return false;
    } else {
        emailError.textContent = ""; // Clear any previous errors
        return true;
    }
};

// Display feedback messages
const displayMessage = (message, color) => {
    messageDiv.innerHTML = `<p style="color: ${color};">${message}</p>`;
};

// Handle form submission
resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent form from refreshing page

    if (validateForm()) {
        const email = emailInput.value.trim();

        try {
            // Send password reset email
            await sendPasswordResetEmail(auth, email);
            console.log(`Password reset email sent to: ${email}`);
            displayMessage("Password reset email sent! Check your inbox.", "#00FF9C");
            emailInput.value = ""; // Clear input field
        } catch (error) {
            console.error("Error resetting password:", error);
            let errorMessage;
            switch (error.code) {
                case "auth/invalid-email":
                    errorMessage = "Invalid email address. Please check and try again.";
                    break;
                case "auth/user-not-found":
                    errorMessage = "No user found with this email. Please check and try again.";
                    break;
                default:
                    errorMessage = "Failed to send reset email. Please try again later.";
            }
            displayMessage(errorMessage, "red");
        }
    }
});
