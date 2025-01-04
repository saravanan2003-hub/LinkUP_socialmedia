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


const resetPasswordForm = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const messageDiv = document.getElementById("message");

function emailvalitation(){
    const emailError = document.getElementById("emailErr");
    const emailVal = document.getElementById("email").value;
    let isValid = true;
    
    if (emailVal === '') {
        emailError.textContent = "Email is required";
        isValid = false;
    } else if (!validateEmail(emailVal)) {
        emailError.textContent = "Please check your email";
        isValid = false;
    } else {
        emailError.textContent = ""; // Clear error if valid
        isValid = true;
    }
}

const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simplified email regex
    return emailPattern.test(email);
};

resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (emailvalitation()) {
        const email = emailInput.value.trim();

        if (!email) {
            messageDiv.innerHTML = `<p style="color: red;">Please enter a valid email address.</p>`;
            return;
        }

        try {
            // Sending password reset email
            await sendPasswordResetEmail(auth, email);
            console.log(`Password reset email sent to: ${email}`);
            messageDiv.innerHTML = `<p style="color:#00FF9C;">Password reset email sent! Check your inbox.</p>`;
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
            messageDiv.innerHTML = `<p style="color: red;">${errorMessage}</p>`;
        }
    }
});
