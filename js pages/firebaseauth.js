// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

document.addEventListener("DOMContentLoaded", () => {
    const eyeIcon = document.getElementById("eyeC");
    const passwordInput = document.getElementById("password");

    eyeIcon.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash")
           
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
        }
    });
});

// Form elements
const form = document.querySelector('#form');
const username = document.querySelector('#username');
const emailInput = document.querySelector('#Email');
const password = document.querySelector('#password');
const Cpass = document.getElementById("CPass");

// Add event listener to the form
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    if (validateInputs()) {
        // Proceed with user creation
        const userVal1 = username.value.trim()
        const spl = userVal1.split("");
        const upper = spl[0].toUpperCase();
        spl[0] = upper;
        const join = spl.join("")
        const userVal = join;
        const emailVal = emailInput.value.trim();
        const passwordVal = password.value.trim();

        createUserWithEmailAndPassword(auth, emailVal, passwordVal)
            .then((userCredential) => {
                const user = userCredential.user;
                const userData = { 
                    username: userVal,
                    email: emailVal,
                    profileimg :"../assests/photos/dummy-image.jpg",

                };
                // Store user data in Firestore
                const docRef = doc(db, "users", user.uid);
                setDoc(docRef, userData)
                    .then(() => {
                        showMessage('Account created successfully', 'signInMessage');
                        window.location.href = "../index.html"; // Redirect to login page
                    })
                    .catch((error) => {
                        console.error("Error writing document:", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/email-already-in-use') {
                    showMessage("Email Address Already Exists!!", 'signInMessage');
                } else {
                    showMessage('Unable to create User: ' + error.message, 'signInMessage');
                }
            });
    }
});

// Validate inputs function
function validateInputs() {
    let isValid = true; // Assume valid initially
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z][a-zA-Z0-9_-]{3,19}$/
    
    const usernameVal = username.value.trim();
    const emailVal = emailInput.value.trim();
    const passwordVal = password.value.trim();
    const CPassVal = Cpass.value.trim();


   


    // Get error message elements
    const userError = document.getElementById("userError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const CpassError = document.getElementById("cPassError");

    // Username validation
    if (usernameVal === '') {
        userError.textContent = "Username is required";
        isValid = false;
    }
    else if(!usernameRegex.test(usernameVal) ){
        userError.textContent = "Please enter a valid username";
        isValid = false;
    }
     else {
        userError.textContent = ""; // Clear error if valid
    }

    // Email validation
    if (emailVal === '') {
        emailError.textContent = "Email is required";
        isValid = false;
    } else if (!validateEmail(emailVal)) {
        emailError.textContent = "Please check your Email";
        isValid = false;
    }
    
    else {
        emailError.textContent = ""; // Clear error if valid
    }


    // Password validation
    if (passwordVal === '') {
        passwordError.textContent = "Password is required";
        isValid = false;
    } 
    else if(!strongPasswordRegex.test(passwordVal)){
        passwordError.textContent = "include's special char, 3 numbers, CAPS letter"
        isValid = false
    }
    else if (passwordVal.length < 12) {
        passwordError.textContent = "Password must be at least 12 characters";
        isValid = false;
    } 
    else {
        passwordError.textContent = ""; // Clear error if valid
    }

    //Confrim password Validation
    if(passwordVal !== CPassVal){
        CpassError.textContent = "please enter correct & same password"
        isValid = false  
    }

    
    return isValid; // Return overall validity
}

// Email validation function
const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/i;  //^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simplified email regex
    return emailPattern.test(email);
};

// Show message function
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(() => {
        messageDiv.style.opacity = 0;
        messageDiv.style.display = "none";
    }, 5000);
}





