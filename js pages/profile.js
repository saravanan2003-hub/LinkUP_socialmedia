import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, getDoc, addDoc, collection, query, where, deleteDoc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

if (localStorage.getItem("src")) {
    const showImg = document.getElementById("ProfileImg");
    const savedSrc = localStorage.getItem("src"); // Retrieve the stored image src
    showImg.setAttribute("src", savedSrc);       // Set the image's src attribute
}


// fetch data from firestore
async function fetchDatas(){
    const userPostContainer=document.getElementById("fileDisplay");
    const querySnapshot = await getDocs (query(collection(db, "Posts"),where("uid","==",localStorage.getItem("uid")) ));

    console.log(querySnapshot)

        querySnapshot.forEach((doc) => {
            
            console.log("Document Data:", doc.data());

            // Create and configure the image element
            const imgElement = document.createElement("img");
            imgElement.classList.add("post-image");
            imgElement.src = doc.data().postURL;
            



            // Append the image element to the container
            userPostContainer.appendChild(imgElement);
        });

}

fetchDatas()


// upload pofile from firestore
const upload = document.getElementById("Choose");
upload.addEventListener("change", () =>{
    uploadImage();
})

async function uploadImage(){

    const uid = localStorage.getItem("uid");
    const profileCollection = collection(db, "profile");
    const q = query(profileCollection, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc)=>{
        await deleteDoc(doc.ref);
    })
    const messageShow = document.getElementById("ProfileImg");
    const file = upload.files[0];


    if(!file){
        console.log("No file Selected");
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
        window.location.reload(true);
    } catch (error) {
        console.error("Error:", error);
    }
    
}





// insert post datas to profil image
async function  insertPost(downloadURL){
   
    const uploadInput = document.getElementById("Choose");
    const file = uploadInput.files[0];

    const postData = {
        profileURL : downloadURL,
        profileSetTime : new Date().getTime().toString(),
        profileName :file.name,
        uid :localStorage.getItem("uid")
    };

    try{
        const docRef = await addDoc(collection(db,"profile"),postData);
        
       
    }
    catch(error){
        console.error("Error Adding Document:",error);
    }
}

//ellipsis button action 
const ellipsis = document.getElementById("ellipsis");
ellipsis.addEventListener("click", () =>{
    const settings = document.getElementsByClassName("settings");
    if(settings[0].style.display === "none"){
        settings[0].style.display = "block";
    }
    else{
        settings[0].style.display = "none";
    }
})

// image choose input action
const showImg = document.getElementById("ProfileImg");

upload.addEventListener("change", () => {
    const file = upload.files[0];
    showImg.removeAttribute("src" , "../assests/photos/dummy-image.jpg");

    if (file && file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        console.log(imageUrl)
        
    } else {
        alert("Please upload a valid image file.");
    }
    
   
});


 async function showProfile()
{
    const showImg = document.getElementById("ProfileImg");
    
    try {
        // Get UID from localStorage
        const uid = localStorage.getItem("uid");
        if (!uid) {
            console.error("UID not found in localStorage.");
            return;
        }

        // Query the Firestore 'profile' collection for the matching UID and limit to 1 result
        const profileCollection = collection(db, "profile");
        const q = query(profileCollection, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        // Check if a document exists
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]; // Get the first document
            const data = doc.data();
            console.log("Profile Data:", data);

            // Get the profileURL and use it
            const profileURL = data.profileURL;
            const profileName = data.profileName;
            
            console.log("Profile URL:", profileURL);

            // Example: Setting it to an image element
            const profileImageElement = document.getElementById("ProfileImg");
            if (profileImageElement) {
                profileImageElement.setAttribute("src", profileURL);
                profileImageElement.setAttribute("imgName" ,profileName)
                console.log(profileImageElement);
            }
        } else {
            console.log("No matching profile found.");
        }
    } catch (error) {
        console.error("Error fetching profile URL:", error);
    }
}

showProfile();





// remove button action
const Remove = document.getElementById("Remove");
Remove.addEventListener("click", () =>{
    alert("Are you sure remove the profile");
    const showImg = document.getElementById("ProfileImg");
    showImg.removeAttribute("scr");
    showImg.setAttribute("src", "../assests/photos/dummy-image.jpg") 
})


// user name fetch function
async function getUsername() {
    const nameDis = document.getElementById("nameDis");

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
            nameDis.textContent = userData.username || "No username found.";
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







// logout function
const LogoutPost = document.getElementById("ProfileLogout");
LogoutPost.addEventListener('click', () => {
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












