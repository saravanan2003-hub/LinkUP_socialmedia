import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, getDoc, addDoc, collection, query, where} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL,deleteObject } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

//logout function
const logout = document.getElementById('Logout')
logout.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            alert("Are you sure LogOut LinkUp ")

            console.log("User signed out.");
            window.location.href = "../index.html"
            localStorage.removeItem('uid');
            localStorage.clear();
        })
        .catch((error) => {
            console.error("Error signing out: ", error);
        });
});


// user name fetch function
async function getUsername() {
    const nameDis = document.getElementById("nameDisplay");

    // Get the UID from localStorage
    const userUID = localStorage.getItem("uid");
    console.log("UID:", userUID);

    if (!userUID) {
        console.error("No UID found in localStorage.");
        nameDis.textContent = "User not logged in.";
        return;
    }

    // Reference the document directly
    const userDocRef = doc(db, "users", userUID);

    try {
        // Fetch the document
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            // Get user data
            const userData = userDoc.data();
            console.log("User Data:", userData);

            // Display the username
            nameDis.innerHTML = `Hello ${userData.username}` || "No username found.";
        } else {
            console.log("No matching user document found.");
            nameDis.textContent = "User not found.";
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        nameDis.textContent = "Error loading username.";
    }
}

getUsername();

const LogoutRes = document.getElementById("LogoutRes");
LogoutRes.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            alert("Are you sure LogOut LinkUp ")

            console.log("User signed out.");
            window.location.href = "../index.html"
            localStorage.removeItem('uid');
            localStorage.clear();
        })
        .catch((error) => {
            console.error("Error signing out: ", error);
        });
});






