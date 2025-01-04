import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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
const auth = getAuth(app);
const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("click", () => {
    uploadImage();
});

async function uploadImage() {
    const messageShow = document.getElementById("messageShow");
    const upload = document.getElementById("upload");
    const file = upload.files[0];


    if (!file) {
        alert("No Photo/Image selected");
        return;
    }


    try {
        const storageRef = ref(storage, `image/${file.name}`);
        await uploadBytes(storageRef, file);
        console.log("File Uploaded Successfully");


        const downloadURL = await getDownloadURL(storageRef);
        console.log(downloadURL);
        insertPost(downloadURL);
        messageShow.style.display = "block";
        setTimeout(() => {
            window.location.href = "./homepage.html"
        }, 2000);
    } catch (error) {
        console.error("Error:", error);
    }

}





async function insertPost(downloadURL) {
   
    const uploadInput = document.getElementById("upload");
    const file = uploadInput.files[0];
    const postCaption = document.getElementById("PostCaption");
    const captionVal = postCaption.value

    const postData = {
        postURL: downloadURL,
        postTime: new Date().toISOString(),
        postName: file.name,
        uid: localStorage.getItem("uid"),
        postDes: captionVal
    };




    try {
        const docRef = await addDoc(collection(db, "Posts"), postData);
    }
    catch (error) {
        console.error("Error Adding Document:", error);
    }
}

// _____________________________--------------------------------------upload----

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
    // Show the confirmation box before signing out
    const userChoice = confirm("Are you sure you want to log out?");

    if (userChoice) {
        // Proceed with signing out
        auth.signOut()
            .then(() => {
                console.log("User signed out.");
                localStorage.removeItem('uid');
                localStorage.clear();

                // Redirect to the home page after sign-out
                window.location.href = "../index.html";
            })
            .catch((error) => {
                console.error("Error signing out: ", error);
            });
    } else {
        // If user clicks "Cancel", just log that the logout was canceled
        console.log("Logout canceled by the user.");
    }
});



