import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
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
const db = getFirestore(app);
const storage = getStorage(app);
const auth1 = getAuth(app);
const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("click", () =>{
    uploadImage();
});

async function uploadImage(){
    const upload = document.getElementById("upload");
    const file = upload.files[0];


    if(!file){
        console.log("No file Selected");
        return;
    }

    try{
        const storageRef = ref(storage, `image/${file.name}`);
        await uploadBytes(storageRef, file);
        console.log("File Uploaded Sucessfully");
    }
    catch(error){
        console.error("Error Uploading Image:" , error);
    }
}

const upload = document.getElementById("upload");
const showImg = document.getElementById("showImg");

upload.addEventListener("change", () => {
    const file = upload.files[0];

    if (file && file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        showImg.setAttribute("src", imageUrl);
    } else {
        alert("Please upload a valid image file.");
    }
});


const LogoutPost = document.getElementById("LogoutPost");
LogoutPost.addEventListener('click', () => {
    auth1.signOut()
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



