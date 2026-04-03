// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 🔐 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "pixieish-shelves.firebasestorage.app",
  messagingSenderId: "458160398514",
  appId: "1:458160398514:web:b8bd9d073d5823575b29ab"
};


// 🚀 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// 👤 AUTH CHECK
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadBooks(); // auto load
  } else {
    console.log("Not logged in");
  }
});


// ✍️ ADD BOOK (WRITER MODE)
window.addBook = async function () {
  const user = auth.currentUser;

  if (!user) {
    alert("Login first!");
    return;
  }

  const title = prompt("Enter book title:");

  if (!title) return;

  try {
    await addDoc(collection(db, "books"), {
      title: title,
      userId: user.uid,
      createdAt: new Date()
    });

    alert("Book added!");

    loadBooks(); // refresh library

  } catch (error) {
    console.error("Error:", error);
  }
};


// 📚 LOAD BOOKS (FIXED NO DUPLICATE UI)
window.loadBooks = async function () {
  const user = auth.currentUser;
  if (!user) return;

  const container = document.querySelector(".container");

  // ✅ CLEAR FIRST (IMPORTANT)
  container.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "books"));

  let html = `
    <div class="card">
      <h3>My Library</h3>
  `;

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    if (data.userId === user.uid) {
      html += `
        <div class="book-card">
          <div class="book-cover"></div>
          <div class="book-info">
            <strong>${data.title}</strong>
          </div>
        </div>
      `;
    }
  });

  html += `</div>`;

  // ✅ REPLACE (NOT +=)
  container.innerHTML = html;
};
