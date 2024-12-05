import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, getDoc, addDoc, collection, query, where} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL,deleteObject,listAll } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
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
const folderRef = ref(storage, 'Posts')

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


/////////////////////////////////////////////     user name fetch function    /////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////  fetch post    ///////////////////////////////////////
async function fetchPosts() {
    try {
        const feed = document.getElementById("feed");

        if (!feed) {
            console.error("Feed element not found in the DOM.");
            return;
        }

        // Fetch all posts from the "Posts" collection
        const postsSnapshot = await getDocs(query(collection(db, "Posts")));

        if (postsSnapshot.empty) {
            console.warn("No posts found.");
            return;
        }

        // Loop through each post document
        for (const postDoc of postsSnapshot.docs) {
            const postData = postDoc.data();
            const postURL = postData.postURL;
            const postUID = postData.uid;

            if (!postURL || !postUID) {
                console.warn("Post missing required fields:", postData);
                continue; // Skip invalid posts
            }

            // Fetch user data for the post author
            
            // const userSnapshot = await getDoc(userQuery);
            // console.log(userSnapshot.data());
            

        
            const userDocRef = doc(db, 'users',postUID);
            const docSnap = await getDoc(userDocRef);
            const userData=docSnap.data()
            console.log(userData);
            
            const username = userData.username || "Unknown User";
            const profileimg = userData.profileimg || "default-profile.png";

            // Create post box
            const box = document.createElement("div");
            box.className = "box";
            box.innerHTML = `
                <div class="profilePicture">
                    <div>
                        <img src="${profileimg}" alt="Profile Image" class="userPhoto" id="userPhoto">
                    </div>
                    <div>
                        <p class="username" id="username">${username}</p>
                    </div>
                </div>
                <div class="mainPicture">
                    <img src="${postURL}" alt="Post Image" class="postImg">
                </div>
                <div class="like">
                    <button class="LikeYes">
                        <i class="fa-regular fa-heart heart"></i>
                    </button>
                </div>
            `;

            // Add like button functionality
            const likeButton = box.querySelector(".LikeYes .heart");
            likeButton.addEventListener("click", () => {
                likeButton.classList.toggle("fa-regular");
                likeButton.classList.toggle("fa-solid");
            });

            // Append box to the feed
            feed.appendChild(box);

            const userPhoto = document.getElementById("userPhoto");
            userPhoto.addEventListener("click", () =>{
                window.location.href = "./profile.html"
            });

            const username1 = document.getElementById("username");
            username1.addEventListener("click", () =>{
                window.location.href = "./profile.html"
            })
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

fetchPosts();




///////////////////////////////////////  logout function //////////////////////////////////////////////////
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






