import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, getDoc, addDoc, collection, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
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
        for (var postDoc of postsSnapshot.docs) {
            console.log(postDoc.id);

            const postData = postDoc.data();
            const postURL = postData.postURL;
            const postUID = postData.uid;
            const postid = postDoc.id

            if (postData.postDes === undefined || postData.postDes === "undefined") {
                var postDes = " ";
            } else {
                var postDes = postData.postDes;
            }




            if (!postURL || !postUID) {
                console.warn("Post missing required fields:", postData);
                continue; // Skip invalid posts
            }

            // Fetch user data for the post author

            // const userSnapshot = await getDoc(userQuery);
            // console.log(userSnapshot.data());



            const userDocRef = doc(db, 'users', postUID);
            const docSnap = await getDoc(userDocRef);
            const userData = docSnap.data()
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
                        <div><p>${postDes}</p></div>
                        <div class="like_count">
                            <i class="fa-regular fa-heart heart"></i>
                            <span id="like-count">0</span>
                            <button id="showlike">View</like>
                        </div>
                    </button>
                </div>
            `;

            const like = box.getElementsByClassName("LikeYes", "heart")[0];
            like.addEventListener("click", async () => {
                try {
                    // Reference to the Likes collection
                    const likesCollectionRef = collection(db, "Likes");

                    // Fetch all documents in the collection
                    const querySnapshot = await getDocs(likesCollectionRef);

                    // Iterate through the documents and log the data
                    querySnapshot.forEach(async (doc) => {
                        try {
                            const docData = doc.data(); // Get the current document data
                            const userUID = localStorage.getItem("uid"); // Get the user UID
                    
                            // Check if this document matches the desired postUID and userUID is not in likedPeople
                            if (postid === docData.postID) {
                                // Ensure `likedPeople` exists and is an array
                                if (!Array.isArray(docData.likedPeople)) {
                                    docData.likedPeople = [];
                                }
                    
                                if (!docData.likedPeople.includes(userUID)) {
                                    // Add userUID to the array
                                    docData.likedPeople.push(userUID);
                    
                                    // Update the document in Firestore
                                    await setDoc(doc.ref, docData); // Use doc.ref to update the specific document

                                    const likeCount = document.getElementById("like-count")
                                    likeCount.textContent = docData.likedPeople.length
                                    console.log(docData.likedPeople.length);
                                    
                                    
                                    console.log(`Document ${doc.id} successfully updated!`);
                                } else {
                                    if (docData.likedPeople.includes(userUID)) {
                                        // Remove userUID from the array
                                        docData.likedPeople = docData.likedPeople.filter((uid) => uid !== userUID);
                                    
                                        // Optionally update the document in Firestore
                                        try {
                                            await setDoc(doc.ref, docData); // Save the updated data back to Firestore
                                            console.log(`User ${userUID} removed from likedPeople.`);

                                            const likeCount = document.getElementById("like-count")
                                            likeCount.textContent = docData.likedPeople.length
                                            console.log(docData.likedPeople.length);
                                        } catch (error) {
                                            console.error("Error updating document:", error);
                                        }
                                    } else {
                                        console.log(`User ${userUID} is not in the likedPeople array.`);
                                    }
                                    
                                }
                            } else {
                                console.log(`No match found for postUID: ${postid} with docData.postID: ${docData.postID}`);
                            }
                        } catch (error) {
                            console.error(`Error updating document ${doc.id}:`, error);
                        }
                    });
                    
                    
                    

                } catch (error) {
                    console.error("Error fetching documents:", error);
                }




            });
            // Append box to the feed
            feed.appendChild(box);

            const userPhoto = document.getElementById("userPhoto");
            userPhoto.addEventListener("click", () => {
                window.location.href = "./profile.html"
            });

            const username1 = document.getElementById("username");
            username1.addEventListener("click", () => {
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

const logout1 = document.getElementById("Logout")
logout1.addEventListener('click', () => {
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






