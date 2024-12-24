import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, getDoc, addDoc, collection, query, where, orderBy,limit } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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

        const postsSnapshot = await getDocs(
            query(collection(db, "Posts"), orderBy("postTime", "desc")) // "desc" for descending order
        );

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
                        <img src="${profileimg}" alt="Profile Image" class="userPhoto ${postUID}" id="userPhoto-${postid}" >
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
                        <div class="postDesDiv"><span class="postDes">${postDes}</span></div>
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


                        // Update UI
                        heart.classList.remove("fa-solid");
                        heart.classList.add("fa-regular");
                        likeCountEl.textContent = updatedLikedPeople.length;
                        console.log(`User ${userUID} unliked the post.`);
                        likePeople()

                    } else {
                        // Like the post
                        likedPeople.push(userUID);
                        await setDoc(likesDocRef, { likedPeople });


                        // Update UI
                        heart.classList.remove("fa-regular");
                        heart.classList.add("fa-solid");
                        likeCountEl.textContent = likedPeople.length;
                        console.log(`User ${userUID} liked the post.`);
                        likePeople()

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
            const postUid = document.getElementsByClassName(`${postUID}`)[0];
            const sli = postUid.className.slice(10);
            
            // console.log(sli)

            

            
            const useruid = localStorage.getItem("uid"); 

            
          
            
                [userPhoto, usernameEl].forEach((element) => {
                    element.addEventListener("click", () => {
                        if(sli == useruid ){
                            window.location.href = "./profile.html";
                        }
                        else{
                            userProfilePageDisplay(sli);
                        }
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

            /// show liked people function
            async function likePeople() {
                try {
                    const popmain = document.getElementById("likeShowPopup");
                    if (!likesData || !likesData.likedPeople) {
                        console.error("No likedPeople data available.");
                        // const NoLikeShowDiv = document.createElement("div");
                        // NoLikeShowDiv.textContent = "No one liked this post";
                        // popmain.appendChild(NoLikeShowDiv)
                        return;
                    }

                    popmain.innerHTML = `<i id="xmark" class="fa-solid fa-xmark"></i>
                    <div class="EmptyLengthMsg">
                            <p>No One Like This Post</p>
                    </div>
                    `;
                    const likedPeoples = likesData.likedPeople; // Array of user IDs who liked the post
                    if (likedPeoples.length === 0) {
                        // Select the first element with the class "EmptyLengthMsg"
                        const EmptyLengthMsg = document.querySelector(".EmptyLengthMsg");
                        // Ensure the message is displayed
                        if (EmptyLengthMsg) {
                            EmptyLengthMsg.style.display = "block";
                        } else {
                            console.error("EmptyLengthMsg element not found!");
                        }
                    }


                    if (!popmain) {
                        console.error("likeShowPopup element not found.");
                        return;
                    }

                    // Clear existing content to avoid duplicates


                    // Fetch user details for each likedPeople
                    for (const userId of likedPeoples) {
                        try {
                            const userDocRef = doc(db, "users", userId);
                            const userDocSnap = await getDoc(userDocRef);

                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();
                                const username = userData.username || "Unknown User";
                                const profileimg = userData.profileimg || "default-profile.png";

                                // Create and append child popup
                                const childPopup = document.createElement("div");
                                childPopup.classList.add("childPopup");
                                childPopup.innerHTML = `
                                    <img src="${profileimg}" alt="profileImg" class="popupPost">
                                    <p class="popupUser">${username}</p>
                                `;
                                popmain.appendChild(childPopup);
                            } else {
                                console.warn(`User data not found for userId: ${userId}`);
                            }
                        } catch (userError) {
                            console.error(`Error fetching data for userId: ${userId}`, userError);
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
                CommentSend.addEventListener("click", async () => {
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
                xmarkComment.addEventListener("click", () => {
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

}

fetchPosts();

async function fetchAndDisplayComments(postid) {
    try {
        const commentsDocRef = doc(db, "Comments", postid);
        const commentsDocSnap = await getDoc(commentsDocRef);

        // Get the container for displaying comments
        const commentsContainer = document.getElementById("commentDisplay");
        commentsContainer.innerHTML = ""; // Clear existing comments

        const emptyCommentMsg = document.getElementsByClassName("emptyCommentMsg")[0];
        emptyCommentMsg.style.display = "none"

        if (commentsDocSnap.exists()) {
            const commentsData = commentsDocSnap.data();
            const commentsArray = commentsData.comments || []; // Default to an empty array if no comments


            // Fetch user data dynamically for each comment
            for (const comment of commentsArray) {
                try {
                    const userDocRef = doc(db, "users", comment.userId);
                    const docSnap = await getDoc(userDocRef);

                    // Default values if user data is missing
                    const userData = docSnap.exists() ? docSnap.data() : {};
                    const username = userData.username || "Unknown User";
                    const profileimg = userData.profileimg || "default-profile.png";

                    // Create a new comment div
                    const commentDiv = document.createElement("div");
                    commentDiv.classList.add("comment-item");

                    // Add comment content
                    commentDiv.innerHTML = `
                        <div class="comment_profileDiv">
                            <small class="commentedTime">${new Date(comment.timestamp).toLocaleString()}</small>
                            <img src="${profileimg}" class="comment-profile" alt="Profile Image">
                            <p>${username}</p>
                        </div>
                        <div class="main_commentDiv">
                            <p>${comment.comment}</p>
                        </div>
                    `;

                    // Append to the container
                    commentsContainer.appendChild(commentDiv);
                } catch (userError) {
                    console.error("Error fetching user data for comment:", comment, userError);
                }
            }
        } else {
            console.log("No comments found for this post.");

            // Show "No Comments Yet" if the comments document doesn't exist
            const emptyCommentMsg = document.getElementsByClassName("emptyCommentMsg")[0];
            emptyCommentMsg.style.display = "block"
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
    }
}


/////////////////////////  user  Profile Page Display function ///////////////////

async function userProfilePageDisplay(otheruserUID){
    const userDocRef = doc(db, "users", otheruserUID);
    const docSnap = await getDoc(userDocRef);
    const userData = docSnap.data() || {};
    const username = userData.username || "Unknown User";
    const profileimg = userData.profileimg || "default-profile.png";
    
    //  get elements from HTML 
    const main = document.getElementsByClassName("main")[0];
    main.style.display = "none";
    const othersProfilePageShow = document.getElementById("othersProfilePageShow");
    othersProfilePageShow.style.display = "block"
    const ProfileImg = document.getElementById("ProfileImg");
    const nameDis = document.getElementById("nameDis");
    nameDis.textContent = username;
    ProfileImg.setAttribute("src" ,profileimg);
    const fileDisplay = document.getElementById("fileDisplay");





     const querySnapshot = await getDocs(query(collection(db, "Posts"), where("uid", "==", otheruserUID)));
    
        console.log(querySnapshot)
    
        querySnapshot.forEach((doc) => {
    
            console.log("Document Data:", doc.data());
    
            // Create and configure the image element
            const postId = doc.id;
            const postURL = doc.data().postURL
            // console.log(postURL)
            const imgElement = document.createElement("img");
            imgElement.classList.add("post-image");
            imgElement.setAttribute("id", postId)
            imgElement.src = doc.data().postURL;
            


        // Append the image element to the container
        fileDisplay.appendChild(imgElement);
        })
}




//////////////////// search bar function /////////////////

const SearchBtn = document.getElementById("SearchBtn");
const searchDetails = document.getElementById("searchDetails");
SearchBtn.addEventListener("click", () => {
    const SearchInp = document.getElementById("SearchInp");

    if (SearchInp.style.display === "none") {
        SearchInp.style.display = "block"
        searchDetails.style.display = "block"
        SearchBtn.style.color = "black"
    } else {
        SearchInp.style.display = "none"
        searchDetails.style.display = "none"
        SearchBtn.style.color = "white"
    }


})


const SearchInp = document.getElementById("SearchInp");
// Listen for input changes

SearchInp.addEventListener("input", async () => {
    const SearchVal = SearchInp.value.trim().toLowerCase();

    if (SearchVal === "") {
        searchDetails.innerHTML = ""; // Clear search results if input is empty
        return;
    }

    try {
        // Query Firestore where username starts with SearchVal
        const q = query(
            collection(db, "users"),
            where("username", ">=", SearchVal),
            where("username", "<=", SearchVal + "\uf8ff"),
            limit(100) // Adjust the limit as needed
        );

        const searchSnapshot = await getDocs(q);

        searchDetails.innerHTML = ""; // Clear previous search results

        if (searchSnapshot.empty) {
            searchDetails.innerHTML = `<p>No results found</p>`;
            return;
        }

        // Display fetched user data
        searchSnapshot.forEach((doc) => {
            const data = doc.data();
            const userid = doc.id;
            const name = data.username || "Unknown User";
            const profileImg = data.profileimg || "default-profile.png";

            // Append user details to the container
            const userDiv = document.createElement("div");
            userDiv.classList.add("searchDiv");
            userDiv.innerHTML = `
                <div>
                    <img src="${profileImg}" alt="Profile Image" class="searchPro">
                    <p class="searchUser">${name}</p>
                    <button id="followBtn-${userid}" class="followBtn" >follow</button>
                </div>
            `;
            searchDetails.appendChild(userDiv);

            const followbtn = document.getElementById(`followBtn-${userid}`);
            followbtn.addEventListener("click", () =>{
                followersAdd(userid);
            })

        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        searchDetails.innerHTML = `<p class="error">An error occurred while fetching data. Please try again later.</p>`;
    }
});



async function followersAdd(userid){

    try {
        const followDocRef = doc(db, "followers", userid); // Reference to the document
        const userUID = localStorage.getItem("uid"); // Current user's UID
        const followBtn = document.getElementById(`followBtn-${userid}`);
    
        if (!userUID) {
            console.error("User UID not found.");
            return;
        }
    
        // Get the current data of the document
        const followDocSnap = await getDoc(followDocRef);
        const followers = followDocSnap.exists()
            ? followDocSnap.data().followers || []
            : []; // Fallback to an empty array if the document doesn't exist
    
            if (followers.includes(userUID)) {
                // Unfollow: Remove the user from followers
                await setDoc(followDocRef, { followers: followers.filter((uid) => uid !== userUID) });
                console.log(`User ${userUID} unfollowed ${userid}`);
        
                // Update UI for unfollow
                followBtn.classList.remove("unFollowBtn");
                followBtn.classList.add("followBtn");
                followBtn.textContent = "Follow";
            } else {
                // Follow: Add the user to followers
                followers.push(userUID);
                await setDoc(followDocRef, { followers });
                console.log(`User ${userUID} followed ${userid}`);
        
                // Update UI for follow
                followBtn.classList.remove("followBtn");
                followBtn.classList.add("unFollowBtn");
                followBtn.textContent = "Unfollow";
            }
        
    } catch (error) {
        console.error("Error toggling follow status:", error);
    }
    

    
}















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

    }
});






