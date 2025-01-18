import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcMGctxDkc6nbPfPlz8y9VQzIK8DZvmyw",
  authDomain: "login-page-bdc79.firebaseapp.com",
  projectId: "login-page-bdc79",
  storageBucket: "login-page-bdc79.appspot.com",
  messagingSenderId: "538575381624",
  appId: "1:538575381624:web:bd0a5d2a1ec0ce2c19798d",
  databaseURL: "https://login-page-bdc79-default-rtdb.firebaseio.com/"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);


try {
  const userUID = localStorage.getItem("uid");
  const followingquerySnapshot = await getDocs(query(collection(db, "followers")));
  followingquerySnapshot.forEach(doc => {
    const array = doc.data().followers;
    if (array.includes(userUID)) {
      const followingPeopleId = doc.id;
      showFollowingPeople(followingPeopleId);
    }
  });
 ;
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
  const userData = docSnap.data();
  const username = userData.username;
  const userProfile = userData.profileimg;
  const showFollowerPeople = document.createElement("div");
  showFollowerPeople.setAttribute("id", `userId-${userId}`)
  showFollowerPeople.classList.add("showFollowerPeople")
  showFollowerPeople.setAttribute("id", `followersPeople${followingPeopleId}`)
  showFollowerPeople.innerHTML = `
        <img src="${userProfile}" alt="Profile Image" class="followersProfile">
        <p class="followersName">${username}</p>
        `
  displayFollowers.appendChild(showFollowerPeople)

  const people = document.getElementById(`followersPeople${followingPeopleId}`);
  people.addEventListener("click", () => {
    const UserID = people.getAttribute("id");
    const targetUserId  = userId.slice(0);
    chat(targetUserId,username,userProfile);
    const notSelectiveDiv = document.getElementsByClassName("notSelectiveDiv")[0];
    notSelectiveDiv.style.display = "none";
  })
}

const arrowMark = document.getElementsByClassName("fa-arrow-left")[0];
arrowMark.addEventListener("click", () => {
  window.location.href = "homepage.html";
})

// Encryption and Decryption functions
const secretKey = "Sara@2003"; // Replace with your own secret key
function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}
function decryptMessage(encryptedMessage) {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}


async function chat(targetUserId, username, userProfile) {
  console.log("Chat opened with:", targetUserId);
  
  const chatUsername = document.getElementById("chatUsername");
  const chatUserProfile = document.getElementById("chatUserProfile");
  const chatWindow = document.getElementById("messages");
  const messageInput = document.getElementById("chatInput");
  const sendMessageButton = document.getElementById("send");

  
  chatUserProfile.setAttribute("src", userProfile);
  chatUsername.textContent = username;

  
  const currentUserId = localStorage.getItem("uid");

  
  sendMessageButton.replaceWith(sendMessageButton.cloneNode(true));
  const newSendMessageButton = document.getElementById("send");
  
  // Function to send a message
  newSendMessageButton.addEventListener("click", async () => {
    console.log("Target ID:", targetUserId);

    const message = messageInput.value.trim();
    if (message) {
      const sortUser = [currentUserId, targetUserId].sort().join("_");
      const chatRef = ref(database, `LinkUP/chats/${sortUser}`);
      const encryptedMessage = encryptMessage(message); // Encrypt the message

      await push(chatRef, {
        sender: currentUserId,
        receiver: targetUserId,
        Message : encryptedMessage,
        timestamp: Date.now(),
      });
      messageInput.value = ""; // Clear input
      console.log(`Message sent to: ${targetUserId}`);
    }
  });

  // Function to receive messages
  const sortUser = [currentUserId, targetUserId].sort().join("_");
  const chatRef = ref(database, `LinkUP/chats/${sortUser}`);
  onValue(chatRef, (snapshot) => {
    chatWindow.innerHTML = ""; // Clear existing messages
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const decryptedMessage = decryptMessage(data.Message); 
      const messageBubble = document.createElement("div");
      messageBubble.classList.add("messageBubble");
      if (data.sender === currentUserId) {
        messageBubble.classList.add("sender");
      } else {
        messageBubble.classList.add("receiver");
      }
      messageBubble.innerText = decryptedMessage;

      chatWindow.appendChild(messageBubble);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });
}













