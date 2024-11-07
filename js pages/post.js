import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

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