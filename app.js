// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔑 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// 🎬 SPLASH
setTimeout(() => {
  document.getElementById("splash").style.opacity = "0";
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("authScreen").style.display = "flex";
  }, 800);
}, 1500);

// 🔐 AUTH
window.login = async function () {
  const email = emailInput();
  const password = passwordInput();

  await signInWithEmailAndPassword(auth, email, password);
};

window.signup = async function () {
  const email = emailInput();
  const password = passwordInput();

  await createUserWithEmailAndPassword(auth, email, password);
};

window.logout = function () {
  signOut(auth);
};

function emailInput() {
  return document.getElementById("email").value;
}

function passwordInput() {
  return document.getElementById("password").value;
}

// 👀 AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;

    document.getElementById("authScreen").style.display = "none";
    document.getElementById("appScreen").style.display = "block";

    loadBooks();
  } else {
    document.getElementById("authScreen").style.display = "flex";
    document.getElementById("appScreen").style.display = "none";
  }
});

// 📚 ADD BOOK
window.addBook = async function () {
  const title = document.getElementById("title").value;
  const genre = document.getElementById("genre").value;
  const coverURL = document.getElementById("coverURL").value;
  const synopsis = document.getElementById("synopsis").value;

  if (!title) {
    alert("Title required!");
    return;
  }

  await addDoc(collection(db, "books"), {
    title,
    genre,
    coverURL,
    synopsis,
    userId: currentUser.uid,
    createdAt: Date.now()
  });

  document.getElementById("status").innerText = "Book created!";

  clearInputs();
  loadBooks();
};

function clearInputs() {
  document.getElementById("title").value = "";
  document.getElementById("genre").value = "";
  document.getElementById("coverURL").value = "";
  document.getElementById("synopsis").value = "";
}

// 📖 LOAD BOOKS
async function loadBooks() {
  const q = query(
    collection(db, "books"),
    where("userId", "==", currentUser.uid)
  );

  const snapshot = await getDocs(q);

  const container = document.getElementById("yourBooks");
  container.innerHTML = "";

  snapshot.forEach((doc) => {
    const book = doc.data();

    container.innerHTML += `
      <div class="book-card">
        <img src="${book.coverURL || ''}" class="book-cover">
        <div>
          <b>${book.title}</b><br>
          <small>${book.genre || ''}</small><br>
          <small>${book.synopsis || ''}</small>
        </div>
      </div>
    `;
  });
}

// ☰ MENU
window.toggleMenu = function () {
  const d = document.getElementById("dropdown");
  d.style.display = d.style.display === "block" ? "none" : "block";
};
