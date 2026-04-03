// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInAnonymously,
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


// 🔑 AUTO LOGIN (so no signup yet)
signInAnonymously(auth);


// 👤 AUTH CHECK
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadBooks();
  }
});


// ✍️ ADD BOOK
window.addBook = async function () {
  const user = auth.currentUser;

  if (!user) {
    alert("Not logged in");
    return;
  }

  const title = prompt("Enter book title:");

  if (!title) return;

  await addDoc(collection(db, "books"), {
    title: title,
    userId: user.uid
  });

  alert("Book added!");

  loadBooks();
};


// 📚 LOAD BOOKS (NO DUPLICATES)
window.loadBooks = async function () {
  const user = auth.currentUser;
  if (!user) return;

  const container = document.querySelector(".container");

  // CLEAR UI FIRST
  container.innerHTML = `
    <div class="card">
      <h3>My Library</h3>
      <p>Your cozy collection of stories</p>
      <button onclick="addBook()">Add Book</button>
    </div>
  `;

  const querySnapshot = await getDocs(collection(db, "books"));

  let html = "";

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

  container.innerHTML += html;
};
