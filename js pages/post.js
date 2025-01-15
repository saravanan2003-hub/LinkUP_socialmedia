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
const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/tiff", "image/x-icon", "image/svg+xml", "image/heif", "image/heic"];
const allowedVideoTypes = ["video/mp4", "video/avi", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv", "video/webm", "video/3gpp", "video/3gpp2", "video/x-matroska"];

uploadBtn.addEventListener("click", () => {
    uploadBtn.style.pointerEvents = "none";
    uploadImage();
});

async function uploadImage() {
    const messageShow = document.getElementById("messageShow");
    const upload = document.getElementById("upload");
    const file = upload.files[0];
    console.log(file.type)


    if (!file) {
        alert("No Photo/Image selected");
        return;
    }
    if (allowedImageTypes.includes(file.type)) {
        try {
            const storageRef = ref(storage, `image/${file.name}`);
            await uploadBytes(storageRef, file);
            console.log("File Uploaded Successfully");


            const downloadURL = await getDownloadURL(storageRef);
            const postType = "image";
            insertPost(downloadURL, postType);
            messageShow.style.display = "block";

            setTimeout(() => {
                window.location.href = "./homepage.html"
                uploadBtn.style.pointerEvents = "auto";
            }, 2000);
        } catch (error) {
            console.error("Error:", error);
        }
    }
    else if (allowedVideoTypes) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Linkup assets");
        let cloudinaryEndpoint = "https://api.cloudinary.com/v1_1/dvdp7km2p/video/upload";
        const response = await fetch(cloudinaryEndpoint, {
            method: "POST",
            body: formData,
        });
        const postType = "Video";
        const data = await response.json();
        const postLink = data.secure_url;
        insertPost(postLink, postType)
    }
    else {
        alert("Only video and image files can upload")
    }

}

const postCaption = document.getElementById("PostCaption");

postCaption.addEventListener("input", () => {
    captionVal();
});

function captionVal(){
    const caption = postCaption.value; 
    if (caption.length <= 250) {
        postCaption.removeAttribute("readonly");
        return caption;
    } else {
        postCaption.setAttribute("readonly", true);
        return caption;
    }
}

postCaption.addEventListener("focus", () => {
    if (postCaption.hasAttribute("readonly")) {
        postCaption.removeAttribute("readonly");
        postCaption.style.cursor = "text";
    }
});


async function insertPost(downloadURL, postType) {

    const uploadInput = document.getElementById("upload");
    const file = uploadInput.files[0];
    const postData = {
        postURL: downloadURL,
        postTime: new Date().toISOString(),
        postName: file.name,
        uid: localStorage.getItem("uid"),
        postDes: captionVal(),
        postType: postType
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
const postVideo = document.getElementById("postVideo")

upload.addEventListener("change", () => {
    const file = upload.files[0];
    const imagePreview = document.getElementsByClassName("imagePreview")[0];
    if (file && allowedImageTypes.includes(file.type)) {
        const imageUrl = URL.createObjectURL(file);
        imagePreview.style.display = "none"
        showImg.setAttribute("src", imageUrl);
        postVideo.style.display = "none"
        showImg.style.display  = "block"
    } else if(file&& allowedVideoTypes.includes(file.type)){
        const videoUrl = URL.createObjectURL(file);
        postVideo.setAttribute("src",videoUrl)
        showImg.style.display = "none"
        postVideo.style.display = "block"
        imagePreview.style.display = "none"
    }else{
        alert("Only video and image files can upload")
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



