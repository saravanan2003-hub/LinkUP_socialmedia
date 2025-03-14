import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, getDoc, addDoc, collection, query, where, deleteDoc, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
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

const showImg = document.getElementById("ProfileImg");
const docRef = doc(db, "users", localStorage.getItem("uid"));
const docSnap = await getDoc(docRef);

showImg.src = docSnap.data().profileimg;

if (localStorage.getItem("src")) {
    const showImg = document.getElementById("ProfileImg");
    const savedSrc = localStorage.getItem("src"); 
    showImg.setAttribute("src", savedSrc);       
}


// fetch data from firestore
async function fetchDatas() {
    const userPostContainer = document.getElementById("fileDisplay");
    const querySnapshot = await getDocs(
        query(
            collection(db, "Posts"), 
            where("uid", "==", localStorage.getItem("uid")),
            orderBy("postTime", "desc") 
        )
    );
    const SnapEmpty = querySnapshot.empty;

    if (SnapEmpty) {
        const noPostMsgDiv = document.createElement("div");
        noPostMsgDiv.innerHTML = `<p class="PostEmptyMsg">No Post Yet</p>`;
        noPostMsgDiv.classList.add("noPostMsgDiv");
        userPostContainer.appendChild(noPostMsgDiv)
        console.log(SnapEmpty);
    }
    else {


        querySnapshot.forEach((doc) => {


            // Create and configure the image element
            var postId = doc.id;
            const postURL = doc.data().postURL;
            const postType = doc.data().postType;
            if (postType === "image") {
                const imgElement = document.createElement("img");
                imgElement.classList.add("post-image");
                imgElement.setAttribute("id", postId)
                imgElement.src = doc.data().postURL;
                const postUID = doc.data().uid
                userPostContainer.appendChild(imgElement);
                imgElement.addEventListener("dblclick" ,() =>{
                    displayPost(postId,postURL,postUID,postType);
                })
            }
            else{
                var imgElement = document.createElement("video");
                imgElement.classList.add("post-image");
                imgElement.setAttribute("id", postId)
                imgElement.src = doc.data().postURL;
                const postUID = doc.data().uid
                imgElement.setAttribute("controls", "")
                userPostContainer.appendChild(imgElement);
                imgElement.addEventListener("click" ,() =>{
                    displayPost(postId,postURL,postUID,postType);
                })
            }
        });
    }
}
fetchDatas()

function displayPost(postId,postURL,postUID,postType){
        const showPost = document.getElementById("showPost");
        showPost.innerHTML = `
        <div id="postImg-${postId}" class="postImg">
            <div class="Delete">
                <i class="fa-regular fa-circle-xmark" id="showProfileXmark"></i>
                <button id="deleteBtn-${postId}" class="deleteBtn"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
            <div class="showPostImage">
                <div id="postdiv-${postId}">
                
                </div>
                <div>
                    <i class="fa-solid fa-heart" id="ShowImgLike-${postId}" ></i>
                    <i class="fa-solid fa-comment" id="showImgComment${postId}"></i>
                </div>
            </div>
        </div>
    `;

        showPost.style.display = "block";
        const imageAndVideoDiv = document.getElementById(`postdiv-${postId}`)
        if(postType == "image"){
            imageAndVideoDiv.innerHTML = `
            <img  src="${postURL}"alt="Post Image" id="popupImg">
            `
        }
        else{
            imageAndVideoDiv.innerHTML = `
            <video  src="${postURL}"alt="Post video" id="popupImg" controls class="popupVideo"><video>
            `
        }


        /////////////////////// xMark function /////////////
        const showProfileXmark = document.getElementById("showProfileXmark");
        showProfileXmark.addEventListener("click", () => {
            const showPost = document.getElementById("showPost");

            showPost.style.display = "none"

        })

        ////// only delete button actions div calls
        const deleteBtn = document.getElementById(`deleteBtn-${postId}`);
        deleteBtn.addEventListener("click", async () => {

            const DeleteConfrim = document.getElementById("DeleteConfrim");
            DeleteConfrim.style.display = "block"

            /// delete confrim action 
            const deleteOkay = document.getElementById("deleteOkay");
            deleteOkay.addEventListener("click", () => {
                deletePost(postURL, postId)
            })


            /// delete cancel action
            const deleteNo = document.getElementById("deleteNo")
            deleteNo.addEventListener("click", () => {
                const DeleteConfrim = document.getElementById("DeleteConfrim");
                DeleteConfrim.style.display = "none"
            })
        })

        /////////////   show like and comments //////////
        const ShowImgLike = document.getElementById(`ShowImgLike-${postId}`);
        ShowImgLike.addEventListener("click", () => {
            ShowLikedPeople(postId, postUID);
        })

        const showComments = document.getElementById(`showImgComment${postId}`);
        showComments.addEventListener("click", () => {
            showComment(postId, postUID);
        })


    

}
///////////////////////////////    Delete  post function   ////////////////////////

async function deletePost(postURL, postId) {
    try {
        // Step 1: Query Firestore to find the document with the matching postURL
        const q = query(collection(db, "Posts"), where("postURL", "==", postURL));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No document found with the specified postURL.");
            return;
        }

        
        for (const doc of querySnapshot.docs) {
            // Delete the document from Firestore
            await deleteDoc(doc.ref);
            console.log("Document deleted from Firestore:", doc.id);
        }

        // Step 3: Delete the file from Firebase Storage
        // const fileRef = ref(storage, postURL); // Reference the file in storage
        // await deleteObject(fileRef);
        // console.log("File deleted from Firebase Storage.");

        // Step 4: Remove the associated DOM element
        const parentElement = document.getElementById(`postImg-${postId}`);
        const showPost = document.getElementById("showPost");
        const DeleteConfrimClass = document.getElementsByClassName("DeleteConfrim")[0];
        const DeleteConfrim = document.getElementById("DeleteConfrim")
        if (parentElement) {
            parentElement.remove();
            showPost.remove();
            DeleteConfrimClass.remove();
            DeleteConfrim.innerHTML = `
                <div class="successMsg">
                    <div><p class="SuccessMsgP">Your Post Deleted Sucessfully!!</p></div>
                    <div><button id="deleteBack">Back</button></div>
                </div>
            `;

            const deleteBack = document.getElementById("deleteBack");
            deleteBack.addEventListener("click", () => {
                DeleteConfrim.style.display = "none";
                window.location.reload(true);
            });


        } else {
            console.log("DOM element not found.");
        }

    } catch (error) {
        console.error("Post Not Deleted Successfully:", error);
    }
}

//////////// Show liked people function ///////
async function ShowLikedPeople(postId, postUID) {
    try {
        const likeDisplayDiv = document.getElementById("likeDisplayDiv");
        likeDisplayDiv.style.display = "block"
        const likeDisplay = document.getElementById("likeDisplay");
        const showPost = document.getElementById("showPost");
        showPost.style.display = "none"

        const Back = document.getElementById("back");



        // Fetch likes data for the post
        const likesDocRef = doc(db, "Likes", postId);
        const likesDocSnap = await getDoc(likesDocRef);
        const likesData = likesDocSnap.data() || { likedPeople: [] };
        const likedPeople = likesData.likedPeople

        if (!likesData || !likesData.likedPeople) {
            console.error("No likedPeople data available.");
            return;
        }

        if (likesData.likedPeople.length === 0) {
            const emptyMsgDisplayDiv = document.getElementsByClassName("emptyMsgDisplayDiv")[0];
            emptyMsgDisplayDiv.style.display = "block";
            Back.addEventListener("click", () => {
                likeDisplayDiv.style.display = "none";
                showPost.style.display = "block"
                likeDisplay.innerHTML = ""
                emptyMsgDisplayDiv.style.display = "none";
            })
        }
        else {
            for (const peoples of likedPeople) {
                const userDocRef = doc(db, "users", peoples);
                const docSnap = await getDoc(userDocRef);
                const userData = docSnap.data() || {};

                if (docSnap.exists()) {
                    const userData = docSnap.data() || {};
                    const username = userData.username;
                    const userProfile = userData.profileimg

                    /////   get back button here


                    const likedPeopleDiv = document.createElement("div");
                    likedPeopleDiv.classList.add("likedPeopleDiv")
                    likedPeopleDiv.innerHTML = `
                    <img src="${userProfile}" alt="Profile Img" class="LikedPeopleProfile">
                    <p class="likedPeoplesName">${username}</p>
                `

                    likeDisplay.appendChild(likedPeopleDiv)


                    Back.addEventListener("click", () => {
                        likeDisplayDiv.style.display = "none";
                        showPost.style.display = "block"
                        likeDisplay.innerHTML = ""
                    })

                }
            }
        }
    }
    catch (error) {
        console.log("Error to Show liked peoples :" + error)
    }


}

///////////////////////////  show comments function /////////////
async function showComment(postId, postUID) {
    try {
        const showPost = document.getElementById("showPost");
        showPost.style.display = "none";

        // Get the container for displaying comments
        const commentsDisplayDiv = document.getElementById("commentsDisplayDiv");
        commentsDisplayDiv.style.display = "block";
        const commentsDisplay = document.getElementById("commentsDisplay");
        const emptyCommentMsg = document.getElementsByClassName("emptyCommentMsg")[0];
        emptyCommentMsg.style.display = "none"
        const commentsBack = document.getElementById("commentsBack");

        const commentsDocRef = doc(db, "Comments", postId);
        const commentsDocSnap = await getDoc(commentsDocRef);



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
                    commentsDisplay.appendChild(commentDiv)

                    commentsBack.addEventListener("click", () => {
                        commentsDisplayDiv.style.display = "none";
                        showPost.style.display = "block"
                        commentsDisplay.innerHTML = ""
                    })

                } catch (userError) {
                    console.error("Error fetching user data for comment:", comment, userError);
                }
            }
        } else {
            console.log("No comments found for this post.");

            // Show "No Comments Yet" if the comments document doesn't exist
            const emptyCommentMsg = document.getElementsByClassName("emptyCommentMsg")[0];
            emptyCommentMsg.style.display = "block"

            commentsBack.addEventListener("click", () => {
                commentsDisplayDiv.style.display = "none";
                showPost.style.display = "block"
                commentsDisplay.innerHTML = ""
            })
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
    }
}



// upload pofile from firestore
const upload = document.getElementById("Choose");
upload.addEventListener("change", () => {
    uploadImage();
})

async function uploadImage() {

    const uid = localStorage.getItem("uid");
    const messageShow = document.getElementById("ProfileImg");
    const file = upload.files[0];
    if (file && file.type.startsWith("image/")) {
        try {

            const storageRef = ref(storage, `image/${file.name}`);
            await uploadBytes(storageRef, file);
            console.log("File Uploaded Successfully");
            const ProfileURL = URL.createObjectURL(file);
            messageShow.removeAttribute("src");
            messageShow.setAttribute("src", ProfileURL)

            const downloadURL = await getDownloadURL(storageRef);
            const docRef = doc(db, "users", localStorage.getItem("uid"));
            const docSnap = await getDoc(docRef);
            await updateDoc(docRef, { profileimg: downloadURL });
            messageShow.style.display = "block";

        } catch (error) {
            console.error("Error:", error);
        }

    } else {
        alert("Please upload a valid image file.");
    }

}

////////////////////////////////////// user name change function /////////////
const pen = document.getElementById("pen");
pen.addEventListener("click", () => {
    const popup = document.getElementsByClassName("popUp")[0];
    if (popup.style.display == "none") {
        popup.style.display = "block";
    }
    else {
        popup.style.display = "none"
    }
});



const okay = document.getElementById("okay");
const cancel = document.getElementById("cancel");
const profileXmark = document.getElementById("profileXmark");
okay.addEventListener("click", (event) => {
    event.preventDefault();
    if (valid()) {
        const usernameChange = document.getElementById("usernameChange");
        const usernameChangeVal = usernameChange.value.trim();
        const docRef = doc(db, "users", localStorage.getItem("uid"));
        const docSnap = getDoc(docRef);
        updateDoc(docRef, { username: usernameChangeVal });

        setTimeout(() => {
            window.location.reload(true); // Force reload from the server
        }, 2000);
    }

});

profileXmark.addEventListener("click", () => {
    const popup = document.getElementsByClassName("popUp")[0];
    popup.style.display = "none";
})

cancel.addEventListener("click", () => {
    const usernameChange = document.getElementById("usernameChange")
    const usernameChangeVal = usernameChange.value = "";
})
///////////////////////////////////// username valitation //////////////////////
function valid() {
    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z][a-zA-Z0-9_-]{3,19}$/

    const usernameChange = document.getElementById("usernameChange");
    const usernameChangeVal = usernameChange.value.trim();

    let isValid = true;
    const changeError = document.getElementsByClassName("nameChangeError");

    if (usernameChangeVal === "") {
        changeError[0].textContent = "Please enter a username";
        isValid = false;
    }
    else if (usernameChangeVal.length < 3 || usernameChangeVal.length > 19) {
        changeError[0].textContent = "length between 3 and 19 char.";
        isValid = false;
    }

    else if (!usernameRegex.test(usernameChangeVal)) {
        changeError[0].textContent = "Please enter a valid username";
        isValid = false;
    } else {
        changeError[0].textContent = ""; // Clear any error message
        isValid = true;
    }

    return isValid;
}



//ellipsis button action 
const profileSettings = document.getElementById("ProfileImg");
profileSettings.addEventListener("click", () => {
    const settings = document.getElementsByClassName("settings");
    if (settings[0].style.display === "none") {
        settings[0].style.display = "block";
    }
    else {
        settings[0].style.display = "none";
    }
})



// Remove button action
const Remove = document.getElementById("Remove");
Remove.addEventListener("click", async () => {
    // Confirm with the user
    const confirmation = confirm("Are you sure you want to remove the profile?");
    if (!confirmation) {
        return; // Exit if the user cancels
    }

    const showImg = document.getElementById("ProfileImg");

    try {
        // Get the document reference
        const docRef = doc(db, "users", localStorage.getItem("uid"));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const userProfile = userData.profileimg;
            const fileRef = ref(storage, userProfile); // Reference the file in storage

            // Delete the file from Firebase Storage
            await deleteObject(fileRef);

            // Update Firestore with the dummy image path
            const dummyImagePath = "../assests/photos/dummy-image.jpg";
            await updateDoc(docRef, { profileimg: dummyImagePath });

            // Update the image source in the UI
            showImg.setAttribute("src", dummyImagePath);
        } else {
            console.error("No such document!");
        }

        console.log("File deleted successfully and profile updated.");
    } catch (error) {
        console.error("Error deleting file:", error);

        // Handle errors gracefully
        alert("Failed to remove the file from storage.");
    }
});

const ProfileRemoveCancel = document.getElementById("ProfileRemoveCancel");
ProfileRemoveCancel.addEventListener("click", () => {
    const settings = document.getElementsByClassName("settings");
    if (settings[0].style.display === "block") {
        settings[0].style.display = "none";
    }
})




// user name fetch function
async function getUsername() {
    const nameDis = document.getElementById("nameDis");
    const bio = document.getElementsByClassName("Bio")[0];
    // Get the UID from localStorage
    const userUID = localStorage.getItem("uid");

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

            // Display the username
            nameDis.textContent = userData.username || "No username found.";
            bio.textContent = userData.userBio
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


async function followers() {
    const followPeople = document.getElementById("followers");
    const showFollowers = document.getElementById("showFollowers");
    try {
        const userUID = localStorage.getItem("uid");
        // const docRef = doc(db, "followers", "0FJTHXq7PoSvgySnSiQRodX259w1");
        const docRef = doc(db, "followers", userUID);
        const docSnap = await getDoc(docRef);
        const followers = docSnap.data().followers;
        if (!followers) {
            console.error("no one follow this")
        }
        else {
            followPeople.textContent = `${followers.length} followers`;
            if (followers.length != 0) {
                followPeople.addEventListener("click", async () => {
                    followPeople.style.opacity = "0.5"; // Make it appear dimmed
                    followPeople.style.pointerEvents = "none"; // Disable interaction

                    const displayFollowers = document.getElementsByClassName("displayFollowers")[0];
                    showFollowers.style.display = "block";
                    for (const people of followers) {
                        const docRef = doc(db, "users", people);
                        const docSnap = await getDoc(docRef);
                        const userData = docSnap.data();
                        const username = userData.username;
                        const userProfile = userData.profileimg;
                        const showFollowerPeople = document.createElement("div");
                        showFollowerPeople.classList.add("showFollowerPeople")
                        showFollowerPeople.innerHTML = `
                            <img src="${userProfile}" alt="Profile Image" class="followersProfile">
                            <p class="followersName">${username}</p>
                        `
                        displayFollowers.appendChild(showFollowerPeople)

                    }

                });

            }
        }


    }
    catch (error) {
        console.error(error);
    }
}
followers();

const followersXmark = document.getElementById("followersXmark");
followersXmark.addEventListener("click", () => {
    const showFollowers = document.getElementById("showFollowers");
    const followPeople = document.getElementById("followers");
    const following = document.getElementById("following");
    const displayFollowers = document.getElementsByClassName("displayFollowers")[0];
    showFollowers.style.display = "none";
    displayFollowers.innerHTML = ""
    followPeople.style.opacity = "1"; // Make it appear dimmed
    followPeople.style.pointerEvents = "auto";
    following.style.opacity = "1"; // Make it appear dimmed
    following.style.pointerEvents = "auto";
})

async function following() {
    const userUID = localStorage.getItem("uid");
    var followingCount = 0;
    const following = document.getElementById("following");

    try {

        const followingquerySnapshot = await getDocs(query(collection(db, "followers")));
        followingquerySnapshot.forEach(doc => {
            const array = doc.data().followers;
            if (array.length != 0) {
                if (array.includes(userUID)) {
                    followingCount++;
                    const followingPeopleId = doc.id;
                    following.addEventListener("click", async () => {
                        following.style.opacity = "0.5"; // Make it appear dimmed
                        following.style.pointerEvents = "none";
                        showFollowingPeople(followingPeopleId);
                    })
                }
            }
        });
        following.textContent = `${followingCount} following`;
    }
    catch (error) {
        console.error(error)
    }
}

following()

async function showFollowingPeople(followingPeopleId) {
    const displayFollowers = document.getElementsByClassName("displayFollowers")[0];
    const showFollowers = document.getElementById("showFollowers")
    showFollowers.style.display = "block";
    const docRef = doc(db, "users", followingPeopleId);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    const username = userData.username;
    const userProfile = userData.profileimg;
    const showFollowerPeople = document.createElement("div");
    showFollowerPeople.classList.add("showFollowerPeople")
    showFollowerPeople.innerHTML = `
    <img src="${userProfile}" alt="Profile Image" class="followersProfile">
    <p class="followersName">${username}</p>
    `
    displayFollowers.appendChild(showFollowerPeople)
}

////////////////  Bio set function //////////////////////////
const bio = document.getElementsByClassName("Bio")[0];
const setBioBtn = document.getElementById("setBio");
const bioInputDIv = document.getElementsByClassName("bioInputDIv")[0];
setBioBtn.addEventListener("click", () => {
    bio.style.display = "none"
    bioInputDIv.style.display = "block";
})

const BioSetButton = document.getElementsByClassName("fa-check")[0];
BioSetButton.addEventListener("click", () => {
    const bioInput = document.getElementById("bioInput").value.trim();
    if (bioInput.length === 0) {
        bioInputDIv.style.display = "none";
        bio.style.display = "block";
    }
    else if (bioInput.length >= 5 && bioInput.length <= 45) {
        const documentRef = doc(db, "users", localStorage.getItem("uid"));
        updateDoc(documentRef, {
            userBio: bioInput // Replace with your field name and value
        })
        bio.textContent = bioInput;
        bioInputDIv.style.display = "none";
        bio.style.display = "block";
    }
    else {
        alert("Bio length must be 5 to 45 letters")
    }

})





// logout function
const LogoutPost = document.getElementById("ProfileLogout");

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












