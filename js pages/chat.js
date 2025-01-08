import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, getDoc, addDoc, collection, query, where, orderBy,limit } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, uploadBytes, getDownloadURL, deleteObject, listAll } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
// import {getDatabase,get,ref,onValue,set,remove,} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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
// const storage = getStorage(app);
// const rdb = getDatabase(app);


try {
        const userUID = localStorage.getItem("uid");
        const followingquerySnapshot = await getDocs(query(collection(db, "followers")));
        followingquerySnapshot.forEach(doc => {
            const array = doc.data().followers;
            console.log(array)
            if (array.includes(userUID)) {
                const followingPeopleId = doc.id;
                    showFollowingPeople(followingPeopleId);
                
            }
            else {
                console.log("no one");
            }
        });
        // following.textContent = `${followingCount} following`;
    }
    catch (error) {
        console.error(error)
    }

    async function showFollowingPeople(followingPeopleId) {
        const displayFollowers = document.getElementById("showUsersDiv");
        const showFollowers = document.getElementById("showUsersDiv")
        showFollowers.style.display = "block";
        const docRef = doc(db, "users", followingPeopleId);
        const docSnap = await getDoc(docRef);
        const userId = docSnap.id;
        console.log(userId)
        const userData = docSnap.data();
        const username = userData.username;
        const userProfile = userData.profileimg;
        console.log(username);
        console.log(userProfile);
        const showFollowerPeople = document.createElement("div");
        showFollowerPeople.setAttribute("id", `userId-${userId}`)
        showFollowerPeople.classList.add("showFollowerPeople")
        showFollowerPeople.innerHTML = `
        <img src="${userProfile}" alt="Profile Image" class="followersProfile">
        <p class="followersName">${username}</p>
        `
        displayFollowers.appendChild(showFollowerPeople)
        
        
    }

const arrowMark = document.getElementsByClassName("fa-arrow-left")[0];
arrowMark.addEventListener("click",()=>{
  window.location.href = "homepage.html";
})

      