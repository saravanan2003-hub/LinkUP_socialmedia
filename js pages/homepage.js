import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, getDoc, addDoc, collection, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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

const loading = document.getElementsByClassName("loading")[0];
setTimeout(() => {
    loading.style.display = "none";
}, 5000);

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
            const postType = postData.postType;

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
            const commentCount = commentsData.comments.length

            const postCommentCountSpan = document.getElementById(`comment-count-${postid}`);
           
            

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
                <div class="mainPicture" id="postDiv-${postid}">
                </div>
                <div class="like">
                    <div class="LikeYes">
                        
                        <div class="like_count">
                            <i class="fa-${isLiked ? "solid" : "regular"} fa-heart heart" id="heart-${postid}"></i>
                            <span id="like-count-${postid}">${likeCount}</span>
                            <button id="showlike-${postid}" class="viewLike">View Likes</button>
                            <i class="fa-solid fa-comment" id="comment-${postid}"></i>
                            <span id="comment-count-${postid}">${commentCount}</span>
                        </div>
                        <div class="postDesDiv"><p class="postDes">${postDes}</p></div>
                        
                    </div>
                </div>
            `;

            // Add event listener to like button
            const heart = box.querySelector(`#heart-${postid}`);
            const likeCountEl = box.querySelector(`#like-count-${postid}`);

            heart.addEventListener("click", async () => {
                likeFunction();

            });



            async function likeFunction() {
                try {
                    const likesDocSnap = await getDoc(likesDocRef);
                    const likesData = likesDocSnap.data() || { likedPeople: [] };

                    const likedPeople = likesData.likedPeople;
                    const userUID = localStorage.getItem("uid");

                    if (likedPeople.includes(userUID)) {
                        // Unlike the post
                        const brokenHeart = document.getElementById(`brokenHeart-${postid}`)
                        brokenHeart.classList.add("show");
                        setTimeout(() => {
                            brokenHeart.classList.remove("show");
                        }, 1000);
                        const updatedLikedPeople = likedPeople.filter((uid) => uid !== userUID);
                        await setDoc(likesDocRef, { likedPeople: updatedLikedPeople });



                        // Update UI
                        heart.classList.remove("fa-solid");
                        heart.classList.add("fa-regular");
                        likeCountEl.textContent = updatedLikedPeople.length;
                        console.log(`User ${userUID} unliked the post.`);


                    } else {
                        const emoji = document.getElementById(`emoji-${postid}`);
                        emoji.classList.add("show");
                        setTimeout(() => {
                            emoji.classList.remove("show");
                        }, 1000);

                        likedPeople.push(userUID);
                        await setDoc(likesDocRef, { likedPeople });


                        // Update UI
                        heart.classList.remove("fa-regular");
                        heart.classList.add("fa-solid");
                        likeCountEl.textContent = likedPeople.length;
                        console.log(`User ${userUID} liked the post.`);

                    }
                } catch (error) {
                    console.error("Error toggling like status:", error);
                }
            }

            // Append box to the feed
            feed.appendChild(box);

            // Add event listeners for user profile redirection
            const userPhoto = box.querySelector(`#userPhoto-${postid}`);
            const usernameEl = box.querySelector(`#username-${postid}`);
            const postUid = document.getElementsByClassName(`${postUID}`)[0];
            const sli = postUid.className.slice(10);




            const useruid = localStorage.getItem("uid");




            [userPhoto, usernameEl].forEach((element) => {
                element.addEventListener("click", () => {
                    if (sli == useruid) {
                        window.location.href = "./profile.html";
                    }
                    else {
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
                const ShowLikedPeopleDiv = document.getElementsByClassName("ShowLikedPeopleDiv")[0];
                ShowLikedPeopleDiv.innerHTML = ""

                const likesDocRef = doc(db, "Likes", postid);
                const likesDocSnap = await getDoc(likesDocRef);
                const likesData = likesDocSnap.data() || { likedPeople: [] };


                popmain.appendChild(ShowLikedPeopleDiv)
                try {
                    const popmain = document.getElementById("likeShowPopup");
                    if (!likesData || !likesData.likedPeople) {
                        console.error("No likedPeople data available.");
                        return;
                    }

                    const likedPeoples = likesData.likedPeople;
                    if (likedPeoples.length === 0) {

                        const EmptyLengthMsg = document.querySelector(".EmptyLengthMsg");

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
                            const likedPeopleUserId = userDocSnap.id;
                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();

                                const username = userData.username || "Unknown User";
                                const profileimg = userData.profileimg || "default-profile.png";

                                // Create and append child popup
                                const childPopup = document.createElement("div");
                                childPopup.classList.add("childPopup");
                                childPopup.innerHTML = `
                                <div class="likedPeopleDisplayDiv">
                                    <img src="${profileimg}" alt="profileImg" class="popupPost" id="likedPeoplePost-${likedPeopleUserId}">
                                    <p class="popupUser">${username}</p>
                                </div>
                                `;
                                ShowLikedPeopleDiv.appendChild(childPopup);

                                const likedPeopleProfile = document.getElementById(`likedPeoplePost-${likedPeopleUserId}`);
                                likedPeopleProfile.addEventListener("click", () => {
                                    userProfilePageDisplay(likedPeopleUserId)
                                })
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
                            const EmptyLengthMsg = document.querySelector(".EmptyLengthMsg");
                            popmain.style.display = "none";
                            ShowLikedPeopleDiv.innerHTML = ""
                            EmptyLengthMsg.style.display = "none"

                        });
                    } else {
                        console.error("xmark element not found.");
                    }
                } catch (error) {
                    console.error("Error in likePeople function:", error);
                }
            }



            const commentButton = document.getElementById(`comment-${postid}`);
            commentButton.addEventListener("click", () => {
                const commentDiv = document.getElementsByClassName("comment")[0];
                commentButton.style.pointerEvents = "none"
                if (commentDiv.style.display === "none") {
                    commentDiv.style.display = "block";
                    commentButton.style.pointerEvents = "none"
                    fetchAndDisplayComments(postid)


                    const commentText = document.getElementById("commentText")
                        commentText.addEventListener("keydown", (event) => {
                            if (event.key === "Enter") { 
                                event.preventDefault(); 
                                CommentSend.click();
                            }
                        });

                    const CommentSend = document.getElementById("CommentSend");
                    CommentSend.addEventListener("click", async () => {
                        CommendSend(postid);
                    });
                } else {
                    commentDiv.style.display = "none";
                    commentButton.style.pointerEvents = "auto"
                }


                const xmarkComment = document.getElementById("xmarkComment");
                xmarkComment.addEventListener("click", () => {
                    const commentDiv = document.getElementsByClassName("comment")[0]; // Select the comment div
                    commentButton.style.pointerEvents = "auto";
                    if (commentDiv.style.display === "block") {
                        commentDiv.style.display = "none";
                    }
                })

            });

            const mainPicture = document.getElementById(`postDiv-${postid}`);
            if (postType === "image") {
                console.log("yes");
                mainPicture.innerHTML = `
                <img src="${postURL}" alt="Post Image" class="postImg" id="postImg-${postid}"></img>
                <div><i class="fa-solid fa-heart emoji" id="emoji-${postid}"></i></div>
                <div><i class="fa-solid fa-heart-crack brokenHeart" id="brokenHeart-${postid}"></i></div>
                `
            }
            else {
                mainPicture.innerHTML = `
               <video src="${postURL}" alt="Post Image" class="postImg" id="postImg-${postid}" controls></video>
                <div><i class="fa-solid fa-heart emoji" id="emoji-${postid}"></i></div>
                <div><i class="fa-solid fa-heart-crack brokenHeart" id="brokenHeart-${postid}"></i></div>
               `
            }

            const post = document.getElementById(`postImg-${postid}`);
            post.addEventListener("dblclick", () => {
                likeFunction();
            })
        }
        
    } catch (error) {
        console.error("Error fetching posts:", error);
    }

    

}

fetchPosts();


async function CommendSend(postid){
    const userUID = localStorage.getItem("uid");
    try {
        const commentText = document.getElementById("commentText").value.trim();

        if (!commentText) return;

        const commentsDocRef = doc(db, "Comments", postid);
        const commentsDocSnap = await getDoc(commentsDocRef);
        const commentsData = commentsDocSnap.data() || { comments: [] }; // Initialize if no data exists


        if (!Array.isArray(commentsData.comments)) {
            commentsData.comments = [];
        }

        const newComment = {
            comment: commentText,
            userId: userUID,
            timestamp: new Date().toISOString()
        };


        document.getElementById("commentText").value = "";


        commentsData.comments.push(newComment);
        await setDoc(commentsDocRef, commentsData);   
        console.log("Comment added successfully!");
        fetchAndDisplayComments(postid)
    } catch (error) {
        console.error("Error in comment function:", error);
    }
} 



async function fetchAndDisplayComments(postid) {
    try {
        const commentsDocRef = doc(db, "Comments", postid);
        const commentsDocSnap = await getDoc(commentsDocRef);
        


        const commentsContainer = document.getElementById("commentDisplay");
        commentsContainer.innerHTML = "";

        const emptyCommentMsg = document.getElementsByClassName("emptyCommentMsg")[0];
        emptyCommentMsg.style.display = "none"

        if (commentsDocSnap.exists()) {
            const commentsData = commentsDocSnap.data();
            const commentsArray = commentsData.comments || [];
            const commentCount = commentsData.comments.length

            const postCommentCountSpan = document.getElementById(`comment-count-${postid}`);
            postCommentCountSpan.textContent = commentCount

            const commentsArraySorted = commentsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            for (const comment of commentsArraySorted) {
                try {
                    const userDocRef = doc(db, "users", comment.userId);
                    const docSnap = await getDoc(userDocRef);
                    const commentedUserId = docSnap.id;


                    const userData = docSnap.exists() ? docSnap.data() : {};
                    const username = userData.username || "Unknown User";
                    const profileimg = userData.profileimg || "default-profile.png";


                    const commentDiv = document.createElement("div");
                    commentDiv.classList.add("comment-item");


                    commentDiv.innerHTML = `
                        <div class="comment_profileDiv">
                            <small class="commentedTime">${new Date(comment.timestamp).toLocaleString()}</small>
                            <img src="${profileimg}" class="comment-profile commentProfile-${commentedUserId}" alt="Profile Image">
                            <p>${username}</p>
                        </div>
                        <div class="main_commentDiv">
                            <p>${comment.comment}</p>
                        </div>
                    `;


                    commentsContainer.appendChild(commentDiv);

                    const commentedUserProfiles = document.getElementsByClassName(`commentProfile-${commentedUserId}`);
                    for (const commentedUserProfile of commentedUserProfiles)
                        commentedUserProfile.addEventListener("click", () => {
                            console.log("button clicked")
                            userProfilePageDisplay(commentedUserId);
                        })

                    
                } catch (userError) {
                    console.error("Error fetching user data for comment:", comment, userError);
                }
            
            }
        } else {
            console.log("No comments found for this post.");


            const emptyCommentMsg = document.getElementsByClassName("emptyCommentMsg")[0];
            emptyCommentMsg.style.display = "block"
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
    }
}


/////////////////////////  user  Profile Page Display function ///////////////////

async function userProfilePageDisplay(otheruserUID) {
    const userUID = localStorage.getItem("uid");
    if (otheruserUID === userUID) {
        window.location.href = "./profile.html"
    }
    else {
        const ProfileFollowDiv = document.getElementsByClassName("ProfileFollowDiv")[0];
        ProfileFollowDiv.innerHTML = ""
        const fileDisplay = document.getElementById("fileDisplay");
        fileDisplay.innerHTML = ""
        const displayFollowers = document.getElementsByClassName("displayFollowers")[0];
        displayFollowers.innerHTML = ""

        const userDocRef = doc(db, "users", otheruserUID);
        const docSnap = await getDoc(userDocRef);
        const userData = docSnap.data() || {};
        const username = userData.username || "Unknown User";
        const profileimg = userData.profileimg || "default-profile.png";
        const Bio = userData.userBio;

        //  get elements from HTML 
        const main = document.getElementsByClassName("main")[0];
        main.style.display = "none";
        const othersProfilePageShow = document.getElementById("othersProfilePageShow");
        othersProfilePageShow.style.display = "block"
        const ProfileImg = document.getElementById("ProfileImg");
        const nameDis = document.getElementById("nameDis");
        nameDis.textContent = username;
        ProfileImg.setAttribute("src", profileimg);
        const othersBio = document.getElementById("othersBio");
        othersBio.textContent = Bio
        followers(otheruserUID);
        following(otheruserUID)
        // const ProfileFollowbtn = document.getElementsByClassName("followBtn")[0]
        const ProfileFollowbtn = document.createElement("button");
        ProfileFollowbtn.classList.add("followBtn");
        ProfileFollowbtn.setAttribute("id", `profileFollow-${otheruserUID}`)
        ProfileFollowDiv.appendChild(ProfileFollowbtn)
        checkFun(otheruserUID, `profileFollow-${otheruserUID}`);


        // const querySnapshot = await getDocs(query(collection(db, "Posts"), where("uid", "==", otheruserUID)));
        const querySnapshot = await getDocs(
                query(
                    collection(db, "Posts"), 
                    where("uid", "==", otheruserUID),
                    orderBy("postTime", "desc") 
                )
            );

        const SnapEmpty = querySnapshot.empty;

        if (SnapEmpty) {
            const noPostMsgDiv = document.createElement("div");
            noPostMsgDiv.innerHTML = `<p class="PostEmptyMsg">No Post Yet</p>`;
            noPostMsgDiv.classList.add("noPostMsgDiv");
            fileDisplay.appendChild(noPostMsgDiv)
            console.log(SnapEmpty);
        } else {
            querySnapshot.forEach((doc) => {

                console.log("Document Data:", doc.data());

                // Create and configure the image element
                const postId = doc.id;
                const postURL = doc.data().postURL
                const postType = doc.data().postType;
                if (postType === "image") {
                    const imgElement = document.createElement("img");
                    imgElement.classList.add("post-image");
                    imgElement.setAttribute("id", postId)
                    imgElement.src = doc.data().postURL;

                    fileDisplay.appendChild(imgElement);
                }
                else{
                    const imgElement = document.createElement("video");
                    imgElement.classList.add("post-image");
                    imgElement.setAttribute("id", postId)
                    imgElement.src = doc.data().postURL;
                    imgElement.setAttribute("controls" ,"")
                    fileDisplay.appendChild(imgElement);
                }





            })
        }

        const othersPageFollowBtn = document.getElementById(`profileFollow-${otheruserUID}`);
        othersPageFollowBtn.addEventListener("click", () => {
            checkFun(otheruserUID, `profileFollow-${otheruserUID}`);
            followersAdd(otheruserUID);
        })
    }
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

SearchInp.addEventListener("input", async () => {
    const SearchVal = SearchInp.value.trim().toLowerCase();

    if (SearchVal === "") {
        searchDetails.innerHTML = "";
        return;
    }

    try {
        // Query Firestore to get all users (be cautious with large datasets)
        const q = query(collection(db, "users"));
        const searchSnapshot = await getDocs(q);

        searchDetails.innerHTML = "";

        if (searchSnapshot.empty) {
            searchDetails.innerHTML = `<p>No results found</p>`;
            return;
        }

        // Filter users by case-insensitive match
        let filteredUsers = [];
        searchSnapshot.forEach((doc) => {
            const data = doc.data();
            const userid = doc.id;
            const username = data.username || "Unknown User";

            // Check if the username matches the search input, case-insensitively
            if (username.toLowerCase().includes(SearchVal)) {
                filteredUsers.push({
                    userid,
                    username,
                    profileImg: data.profileimg || "default-profile.png",
                });
            }
        });

        if (filteredUsers.length === 0) {
            searchDetails.innerHTML = `<p class="SearchbarNoResultMsg">No results found !!</p>`;
            return;
        }

        // Display the filtered results
        filteredUsers.forEach((user) => {
            const { userid, username, profileImg } = user;

            const userDiv = document.createElement("div");
            userDiv.classList.add("searchDiv");
            userDiv.innerHTML = `
                <div>
                    <img src="${profileImg}" alt="Profile Image" class="searchPro" id="SearchProfile-${userid}">
                    <p class="searchUser" id="searchUsername${userid}">${username}</p>
                    <button id="followBtn-${userid}" class="followBtn"></button>
                </div>
            `;

            searchDetails.appendChild(userDiv);

            checkFun(userid, `followBtn-${userid}`);

            // const FollowButtons = [`followBtn-${userid}`,"ProfileFollow"]

            const followbtn = document.getElementById(`followBtn-${userid}`);
            followbtn.addEventListener("click", () => {
                followersAdd(userid);
            });

            const searchprofile = document.getElementById(`SearchProfile-${userid}`);
            const searchUsername = document.getElementById(`searchUsername${userid}`)

            const searchprofileID = searchprofile.getAttribute("id").slice(14);
            searchprofile.addEventListener("click", () => {
                userProfilePageDisplay(searchprofileID);
            })
            searchUsername.addEventListener("click", () => {
                userProfilePageDisplay(searchprofileID);
            })

        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        searchDetails.innerHTML = `<p class="error">An error occurred while fetching data. Please try again later.</p>`;
    }
});

async function checkFun(userid, btnId) {
    try {
        const followDocRef = doc(db, "followers", userid); // Reference to the document
        const userUID = localStorage.getItem("uid"); // Current user's UID
        const followBtn = document.getElementById(btnId);

        if (!userUID) {
            console.error("User UID not found.");
            return;
        }

        // Get the current data of the document
        const followDocSnap = await getDoc(followDocRef);
        const followers = followDocSnap.exists()
            ? followDocSnap.data().followers || []
            : []; // Fallback to an empty array if the document doesn't exist


        if (userid === userUID) {
            const followBtn = document.getElementById(`followBtn-${userid}`);
            followBtn.textContent = "You"
            followBtn.disabled = true;
        }
        else if (followers.includes(userUID)) {
            // Update UI for unfollow
            followBtn.classList.remove("followBtn");
            followBtn.classList.add("unFollowBtn");
            followBtn.textContent = "Unfollow";

        } else if (!followers.includes(userUID)) {
            // Update UI for follow
            followBtn.classList.remove("unFollowBtn");
            followBtn.classList.add("followBtn");
            followBtn.textContent = "Follow";

        }

    } catch (error) {
        console.error("Error toggling follow status:", error);
    }
}

/////// users page follow btn function /////


async function followersAdd(userid) {
    try {
        const followDocRef = doc(db, "followers", userid); 
        const userUID = localStorage.getItem("uid"); 
        const followBtn = document.getElementById(`followBtn-${userid}`);
        const othersPageFollowBtn = document.getElementById(`profileFollow-${userid}`);
        if (!userUID) {
            console.error("User UID not found.");
            return;
        }

        // Get the current data of the document
        const followDocSnap = await getDoc(followDocRef);
        const followers = followDocSnap.exists()
            ? followDocSnap.data().followers || []
            : [];
        if (followers.includes(userUID)) {
            // Unfollow: Remove the user from followers
            await setDoc(followDocRef, { followers: followers.filter((uid) => uid !== userUID) });
            console.log(`User ${userUID} unfollowed ${userid}`);

            // Update UI for unfollow
            followBtn.classList.remove("unFollowBtn");
            followBtn.classList.add("followBtn");
            followBtn.textContent = "Follow";
            othersPageFollowBtn.classList.remove("unFollowBtn");
            othersPageFollowBtn.classList.add("followBtn");
            othersPageFollowBtn.textContent = "Follow"

        } else {
            // Follow: Add the user to followers
            followers.push(userUID);
            await setDoc(followDocRef, { followers });
            console.log(`User ${userUID} followed ${userid}`);

            // Update UI for follow
            followBtn.classList.remove("followBtn");
            followBtn.classList.add("unFollowBtn");
            followBtn.textContent = "Unfollow";
            othersPageFollowBtn.classList.remove("followBtn");
            othersPageFollowBtn.classList.add("unFollowBtn");
            othersPageFollowBtn.textContent = "Unfollow"
        }

    } catch (error) {
        console.error("Error toggling follow status:", error);
    }

}

async function followers(otheruserUID) {
    const followPeople = document.getElementById("followers");
    const showFollowers = document.getElementById("showFollowers");
    const displayFollowers = document.getElementsByClassName("displayFollowers")[0];

    try {
        const userUID = localStorage.getItem("uid");
        const docRef = doc(db, "followers", otheruserUID);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || !docSnap.data().followers) {
            followPeople.textContent = `0 followers`;
            console.warn("No followers found for this user.");
            return;
        }

        const followers = docSnap.data().followers;

        // Update followers count
        followPeople.textContent = `${followers.length} followers`;

        // Attach click event listener (add only once)
        followPeople.onclick = async () => {
            // Prevent duplicate content on repeated clicks
            displayFollowers.innerHTML = "";
            showFollowers.style.display = "block";

            if (followers.length === 0) {
                const noneMsg = document.createElement("div");
                noneMsg.classList.add("noneMsg");
                noneMsg.textContent = "No one follows this person.";
                displayFollowers.appendChild(noneMsg);
                return;
            }

            // Fetch followers' data
            for (const people of followers) {
                try {
                    const userDocRef = doc(db, "users", people);
                    const userDocSnap = await getDoc(userDocRef);

                    if (!userDocSnap.exists()) continue;

                    const userData = userDocSnap.data();
                    const username = userData.username || "Unknown User";
                    const userProfile = userData.profileimg || "default-profile.png";
                    const followersUID = userDocSnap.id;

                    // Create follower display
                    const showFollowerPeople = document.createElement("div");
                    showFollowerPeople.classList.add("showFollowerPeople");
                    showFollowerPeople.innerHTML = `
                        <img src="${userProfile}" alt="Profile Image" class="followersProfile" id="followersProfile-${followersUID}">
                        <p class="followersName">${username}</p>
                    `;
                    displayFollowers.appendChild(showFollowerPeople);

                    // Attach profile redirection
                    const followersProfile = document.getElementById(`followersProfile-${followersUID}`);
                    followersProfile.onclick = () => {
                        followersXmarkf();
                        userProfilePageDisplay(followersUID);
                    };
                } catch (err) {
                    console.error(`Error fetching follower data for UID: ${people}`, err);
                }
            }
        };
    } catch (error) {
        console.error("Error fetching followers:", error);
    }
}


const followersXmark = document.getElementById("followersXmark");
followersXmark.addEventListener("click", () => {
    followersXmarkf()
})

function followersXmarkf() {
    const showFollowers = document.getElementById("showFollowers");
    const followPeople = document.getElementById("followers");
    const following = document.getElementById("following");
    const displayFollowers = document.getElementsByClassName("displayFollowers")[0];
    const noneMsg = document.getElementsByClassName("noneMsg")[0];
    showFollowers.style.display = "none";
    displayFollowers.innerHTML = ""
    followPeople.style.opacity = "1";
    followPeople.style.pointerEvents = "auto";
    following.style.opacity = "1";
    following.style.pointerEvents = "auto";
}


async function following(otheruserUID) {
    const userUID = localStorage.getItem("uid");
    let followingCount = 0;
    const following = document.getElementById("following");

    try {
        const followingQuerySnapshot = await getDocs(query(collection(db, "followers")));
        const followingPeopleIds = []; // To store IDs for all following users

        followingQuerySnapshot.forEach((doc) => {
            const array = doc.data().followers;
            console.log(array);

            if (array.includes(otheruserUID)) {
                followingCount++;
                followingPeopleIds.push(doc.id); // Store all relevant IDs
            } else {
                console.log("no one");
            }
        });

        // Update the following count
        following.textContent = `${followingCount} following`;

        // Attach a single event listener
        following.onclick = async () => {
            following.style.opacity = "0.5"; // Make it appear dimmed
            following.style.pointerEvents = "none"; // Disable interaction

            const displayFollowers = document.getElementsByClassName("displayFollowers")[0];
            const showFollowers = document.getElementById("showFollowers");
            showFollowers.style.display = "block";
            displayFollowers.innerHTML = ""; // Clear previous content

            for (const followingPeopleId of followingPeopleIds) {
                const docRef = doc(db, "users", followingPeopleId);
                const docSnap = await getDoc(docRef);
                const userData = docSnap.data();
                const username = userData.username || "Unknown User";
                const userProfile = userData.profileimg || "default-profile.png";

                console.log(username);
                console.log(userProfile);

                const showFollowerPeople = document.createElement("div");
                showFollowerPeople.classList.add("showFollowerPeople");
                showFollowerPeople.innerHTML = `
                    <img src="${userProfile}" alt="Profile Image" class="followersProfile" id="followes-${followingPeopleId}">
                    <p class="followersName">${username}</p>
                `;
                displayFollowers.appendChild(showFollowerPeople);

                // Add click listener for the follower profile
                const followPeopleProfile = document.getElementById(`followes-${followingPeopleId}`);
                followPeopleProfile.onclick = () => {
                    followersXmarkf();
                    userProfilePageDisplay(followingPeopleId);
                };
            }

            following.style.opacity = "1"; // Reset opacity
            following.style.pointerEvents = "auto"; // Re-enable interaction
        };
    } catch (error) {
        console.error(error);
    }
}

////////////// other user profilepage bac arrow function ///////////
const backArrow = document.getElementsByClassName("fa-arrow-left")[0];
backArrow.addEventListener("click", () => {
    const othersProfilePageShow = document.getElementById("othersProfilePageShow");
    othersProfilePageShow.style.display = "none";
    window.location.reload(true);
})


////////////////////////  comment microphone function ////////////////////////
const microphone = document.getElementById("microphone");
const commentText = document.getElementById("commentText");

let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    const recordMsgDiv = document.getElementsByClassName("recordMsgDiv")[0];
    const recordMsg = document.getElementsByClassName("recordMsg")[0];

    // Set language to Tamil (India) which can also recognize English words
    recognition.lang = 'en-IN', 'ta-IN';

    recognition.onstart = () => {
        recordMsgDiv.style.display = "block";
        recordMsg.innerHTML += '<p>Listening Your Voice...</p>';
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        commentText.value = transcript;
    };

    recognition.onerror = (event) => {
        recordMsg.innerHTML += `<p style="color: red;">Error: ${event.error}</p>`;
    };

    recognition.onend = () => {
        recordMsg.innerHTML += '<p>Stopped listening.</p>';
        setTimeout(() => {
            recordMsgDiv.style.display = "none";
            recordMsg.innerHTML = ""
        }, 3000);
    };
} else {
    alert('Your browser does not support Speech Recognition. Please use Google Chrome.');
}

// Start/Stop Listening on Microphone Button Click
microphone.addEventListener('click', () => {
    if (microphone.classList.contains("fa-microphone")) {
        microphone.classList.add("fa-microphone-slash");
        microphone.classList.remove("fa-microphone");
        if (recognition) recognition.start();
    } else {
        if (recognition) recognition.stop();
        microphone.classList.add("fa-microphone");
        microphone.classList.remove("fa-microphone-slash");
    }
});



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








