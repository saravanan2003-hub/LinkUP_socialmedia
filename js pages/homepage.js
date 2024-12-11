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
        for (const postDoc of postsSnapshot.docs) {
            const postData = postDoc.data();
            const postURL = postData.postURL;
            var postUID = postData.uid;
            const postid = postDoc.id;

            // Default post description if undefined
            const postDes = postData.postDes || " ";

            if (!postURL || !postUID) {
                console.warn("Post missing required fields:", postData);
                continue; // Skip invalid posts
            }

            // Fetch user data for the post author
            const userDocRef = doc(db, "users", postUID);
            const docSnap = await getDoc(userDocRef);
            const userData = docSnap.data() || {};
            const username = userData.username || "Unknown User";
            const profileimg = userData.profileimg || "default-profile.png";

            // Fetch likes data for the post
            const likesDocRef = doc(db, "Likes", postid);
            const likesDocSnap = await getDoc(likesDocRef);
            const likesData = likesDocSnap.data() || { likedPeople: [] };

            //create and fetch comments from comments table
            const commentsDocRef = doc(db, "Comments", postid);
            const commentsDocSnap = await getDoc(commentsDocRef);
            const commentsData = commentsDocSnap.data() || { comments: [] }

            const userUID = localStorage.getItem("uid");
            const isLiked = likesData.likedPeople.includes(userUID);
            const likeCount = likesData.likedPeople.length;

            // Create post box
            const box = document.createElement("div");
            box.className = "box";
            box.innerHTML = `
                <div class="profilePicture">
                    <div>
                        <img src="${profileimg}" alt="Profile Image" class="userPhoto" id="userPhoto-${postid}">
                    </div>
                    <div>
                        <p class="username" id="username-${postid}">${username}</p>
                    </div>
                </div>
                <div class="mainPicture">
                    <img src="${postURL}" alt="Post Image" class="postImg">
                </div>
                <div class="like">
                    <div class="LikeYes">
                        <div><span class="postDes">${postDes}</span></div>
                        <div class="like_count">
                            <i class="fa-${isLiked ? "solid" : "regular"} fa-heart heart" id="heart-${postid}"></i>
                            <span id="like-count-${postid}">${likeCount}</span>
                            <button id="showlike-${postid}" class="viewLike">View Likes</button>
                            <i class="fa-solid fa-comment" id="comment-${postid}"></i>
                        </div>
                    </div>
                </div>
            `;

            // Add event listener to like button
            const heart = box.querySelector(`#heart-${postid}`);
            const likeCountEl = box.querySelector(`#like-count-${postid}`);

            heart.addEventListener("click", async () => {
                try {
                    const likesDocSnap = await getDoc(likesDocRef);
                    const likesData = likesDocSnap.data() || { likedPeople: [] };

                    const likedPeople = likesData.likedPeople;
                    const userUID = localStorage.getItem("uid");

                    if (likedPeople.includes(userUID)) {
                        // Unlike the post
                        const updatedLikedPeople = likedPeople.filter((uid) => uid !== userUID);
                        await setDoc(likesDocRef, { likedPeople: updatedLikedPeople });
                        likePeople()

                        // Update UI
                        heart.classList.remove("fa-solid");
                        heart.classList.add("fa-regular");
                        likeCountEl.textContent = updatedLikedPeople.length;
                        console.log(`User ${userUID} unliked the post.`);

                    } else {
                        // Like the post
                        likedPeople.push(userUID);
                        await setDoc(likesDocRef, { likedPeople });
                        likePeople()

                        // Update UI
                        heart.classList.remove("fa-regular");
                        heart.classList.add("fa-solid");
                        likeCountEl.textContent = likedPeople.length;
                        console.log(`User ${userUID} liked the post.`);

                    }
                } catch (error) {
                    console.error("Error toggling like status:", error);
                }
            });

            // Append box to the feed
            feed.appendChild(box);

            // Add event listeners for user profile redirection
            const userPhoto = box.querySelector(`#userPhoto-${postid}`);
            const usernameEl = box.querySelector(`#username-${postid}`);

            [userPhoto, usernameEl].forEach((element) => {
                element.addEventListener("click", () => {
                    window.location.href = "./profile.html";
                });
            });



            const likeShow = document.getElementById(`showlike-${postid}`);
            const popmain = document.getElementById("likeShowPopup"); // Declare popmain globally

            likeShow.addEventListener("click", () => {
                likePeople();

                // Toggle display of the popup
                if (popmain) {
                    popmain.style.display = (popmain.style.display === "none" || popmain.style.display === "") ? "block" : "none";
                } else {
                    console.error("likeShowPopup element not found.");
                }
            });

            // Who liked show function
            async function likePeople() {
                try {
                    const likedPostID = docSnap.id;
                    console.log(likedPostID);

                    const likedPeoples = likesData.likedPeople;

                    if (!popmain) {
                        console.error("likeShowPopup element not found.");
                        return;
                    }

                    // Clear existing content to avoid duplicates
                    popmain.innerHTML = `<i id="xmark" class="fa-solid fa-xmark"></i>`;

                    for (const people of likedPeoples) {
                        if (likedPostID === people) {
                            const username = userData.username || "Unknown User";
                            const profileimg = userData.profileimg || "default-profile.png";
                            console.log(username);
                            console.log(profileimg);

                            // Create and append child popup
                            const childPopup = document.createElement("div");
                            childPopup.classList.add("childPopup");
                            childPopup.innerHTML = `
                            <img src="${profileimg}" alt="profileImg" class="popupPost">
                            <p class="popupUser">${username}</p>
                            `;
                            popmain.appendChild(childPopup);
                        }
                    }

                    // Close popup on xmark click
                    const xmark = document.getElementById("xmark");
                    if (xmark) {
                        xmark.addEventListener("click", () => {
                            popmain.style.display = "none";
                        });
                    } else {
                        console.error("xmark element not found.");
                    }
                } catch (error) {
                    console.error("Error in likePeople function:", error);
                }
            }


            const commentButton = document.getElementById(`comment-${postid}`); // Button for showing the comment section
            commentButton.addEventListener("click", () => {
                const commentDiv = document.getElementsByClassName("comment")[0]; // Select the comment div
                if (commentDiv.style.display === "none") {
                    commentDiv.style.display = "block"; // Show the comment section
                } else {
                    commentDiv.style.display = "none"; // Hide the comment section
                }

                
                const CommentSend = document.getElementById("CommentSend");
                CommentSend.addEventListener("click", async() =>{
                    try {

                        //comment disabled
                        

                        const commentText = document.getElementById("commentText").value;
                        const commentsDocRef = doc(db, "Comments", postid);
                        const commentsDocSnap = await getDoc(commentsDocRef);
                        const commentsData = commentsDocSnap.data() || { comments: [] }; // Initialize if document doesn't exist
                    
                        // Ensure commentsData.comments is an array
                        if (!Array.isArray(commentsData.comments)) {
                            commentsData.comments = [];
                        }
                    
                        const newComment = {
                            comment: commentText, // The comment text
                            userId: userUID,      // ID of the user making the comment
                            timestamp: new Date().toISOString() // Timestamp of the comment
                        };
                        document.getElementById("commentText").value = "";
                    
                        // Add the new comment to the comments array
                        commentsData.comments.push(newComment);
                    
                        // Update the document in Firestore
                        await setDoc(commentsDocRef, commentsData);
                    
                        console.log("Comment added successfully!");
                        
                    } catch (error) {
                        console.error("Error in comment function:", error);
                    }
                    
                    
                })

                const xmarkComment = document.getElementById("xmarkComment");
                xmarkComment.addEventListener("click", () =>{
                    const commentDiv = document.getElementsByClassName("comment")[0]; // Select the comment div
                if (commentDiv.style.display === "block") {
                    commentDiv.style.display = "none"; // Show the comment section
                }
                })

                fetchAndDisplayComments(postid)

            });




        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }



    async function fetchAndDisplayComments(postid) {
        try {
            const commentsDocRef = doc(db, "Comments", postid);
            const commentsDocSnap = await getDoc(commentsDocRef);
    
            if (commentsDocSnap.exists()) {
                const commentsData = commentsDocSnap.data();
                const commentsArray = commentsData.comments || []; // Default to empty array if no comments
    
    
                
                //// user deatails fetch from firestore.
                const userDocRef = doc(db, "users" ,postUID);
                const docSnap = await getDoc(userDocRef);
                const userData = docSnap.data() || {};
    
                console.log(docSnap.id);
    
               
    
                // Get the container for displaying comments
                const commentsContainer = document.getElementById("commentDisplay");
                commentsContainer.innerHTML = ""; // Clear existing comments
    
                commentsArray.forEach(comment => {
                    // Create a new comment div
                    const commentDiv = document.createElement("div");
                    commentDiv.classList.add("comment-item");
    
                    if(docSnap.id === comment.userId){
                        var username = userData.username || "Unknown User";
                        var profileimg = userData.profileimg || "default-profile.png";
                    }
                       
                    
                    // Add comment content
                    commentDiv.innerHTML = `
                    <div class="comment_profileDiv">
                        <small class="commentedTime">${new Date(comment.timestamp).toLocaleString()}</small>
                        <img src="${profileimg}" class="comment-profile" alt="ProfileImg">
                        <p>${username}</p>
                    </div>
                    <div class="main_commentDiv">
                        <p>${comment.comment}</p>
                        
                    </div>
                    
                       
                                       `;
    
                    // Append to the container
                    commentsContainer.appendChild(commentDiv);
                });
            } else {
                console.log("No comments found for this post.");
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    }
}

// Fetch posts when the page loads
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






