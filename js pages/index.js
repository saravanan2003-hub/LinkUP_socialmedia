import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcMGctxDkc6nbPfPlz8y9VQzIK8DZvmyw",
    authDomain: "login-page-bdc79.firebaseapp.com",
    projectId: "login-page-bdc79",
    storageBucket: "login-page-bdc79.appspot.com",
    messagingSenderId: "538575381624",
    appId: "1:538575381624:web:bd0a5d2a1ec0ce2c19798d",
    measurementId: "G-DQ5DBRCF8D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Redirect to homepage if uid is present
if (localStorage.getItem("uid")) {
    window.location.href = "./pages/homepage.html";
}

function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(() => {
        messageDiv.style.opacity = 0;
        messageDiv.style.display = "none"; // Hide the message after fading out
    }, 5000);
}

// Validate login inputs function
function validateLoginInputs() {
    let isValid = true; // Assume valid initially

    const emailInput = document.getElementById("Login-Email");
    const passwordInput = document.getElementById("Login-password");

    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value.trim();

    // Get error message elements
    const emailError = document.querySelector('.emailError');
    const passwordError = document.querySelector('.passwordError');

    // Email validation
    if (emailVal === '') {
        emailError.textContent = "Email is required";
        isValid = false;
    } else if (!validateEmail(emailVal)) {
        emailError.textContent = "Please check your email";
        isValid = false;
    } else {
        emailError.textContent = ""; // Clear error if valid
    }

    // Password validation
    if (passwordVal === '') {
        passwordError.textContent = "Password is required";
        isValid = false;
    } else if (passwordVal.length < 8) {
        passwordError.textContent = "Password must be at least 8 characters";
        isValid = false;
    } else {
        passwordError.textContent = ""; // Clear error if valid
    }

    return isValid; // Return overall validity
}

// Email validation function
const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simplified email regex
    return emailPattern.test(email);
};

// Event listener for login form submission
const loginForm = document.getElementById("form");
loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    if (validateLoginInputs()) {
        const email = document.getElementById("Login-Email").value.trim();
        const password = document.getElementById("Login-password").value.trim();

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                showMessage('Login successful', 'signInMessage');
                localStorage.setItem('uid', user.uid);
              window.location.href = "./pages/homepage.html"// Adjust path if necessary
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
                    showMessage('Incorrect email or password', 'signInMessage');
                } else {
                    showMessage('Login failed. Please try again.', 'signInMessage');
                }
            });
    }
});





