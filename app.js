/* 🔥 FIREBASE IMPORTS */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 YOUR FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "pixieish-shelves.firebasestorage.app",
  messagingSenderId: "458160398514",
  appId: "1:458160398514:web:b8bd9d073d5823575b29ab"
};

/* 🔥 INIT */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* 👑 OWNER EMAIL (ONLY THIS CAN WRITE) */
const OWNER_EMAIL = "pixieishwp@gmail.com";

/* 🌸 SPLASH */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");

  setTimeout(() => {
    splash.style.opacity = "0";
    setTimeout(() => splash.style.display = "none", 500);
  }, 1500);
});

/* 🔐 AUTH */
window.login = async function () {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (e) {
    document.getElementById("authStatus").innerText = e.message;
  }
};

window.signup = async function () {
  try {
    await createUserWithEmailAndPassword(
      auth,
      document.getElementById("email").value,
      document.getElementById("password").value
    );
    document.getElementById("authStatus").innerText = "Account created!";
  } catch (e) {
    document.getElementById("authStatus").innerText = e.message;
  }
};

window.logout = function () {
  signOut(auth);
};

/* 🔄 AUTH STATE */
onAuthStateChanged(auth, (user) => {
  const authScreen = document.getElementById("authScreen");
  const appScreen = document.getElementById("appScreen");
  const writerCard = document.getElementById("writerCard");

  if (user) {
    authScreen.style.display = "none";
    appScreen.style.display = "block";

    /* 🔐 LOCK WRITER MODE */
    if (user.email === OWNER_EMAIL) {
      writerCard.style.display = "block";
    } else {
      writerCard.style.display = "none";
    }

    loadBooks();
  } else {
    appScreen.style.display = "none";
    authScreen.style.display = "flex";
  }
});

/* ☰ MENU */
window.toggleMenu = function () {
  const menu = document.getElementById("dropdown");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
};

/* 📚 ADD BOOK (OWNER ONLY) */
window.addBook = async function () {
  const user = auth.currentUser;

  if (!user || user.email !== OWNER_EMAIL) {
    alert("You are not allowed to write.");
    return;
  }

  await addDoc(collection(db, "books"), {
    title: document.getElementById("title").value,
    synopsis: document.getElementById("synopsis").value,
    genre: document.getElementById("genre").value,
    cover: document.getElementById("coverURL").value,
    content: document.getElementById("content").value,
    userId: user.uid
  });

  document.getElementById("status").innerText = "Book saved!";
  loadBooks();
};

/* 📖 LOAD BOOKS (PER USER) */
async function loadBooks() {
  const user = auth.currentUser;
  const container = document.getElementById("yourBooks");

  container.innerHTML = "";

  const q = query(collection(db, "books"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const book = doc.data();

    const div = document.createElement("div");
    div.className = "book-card";

    div.innerHTML = `
      <img src="${book.cover || 'https://via.placeholder.com/60x85'}" class="book-cover">
      <div>
        <strong>${book.title}</strong>
        <p>${book.genre}</p>
        <small>${book.synopsis}</small>
      </div>
    `;

    div.onclick = () => openReader(book);

    container.appendChild(div);
  });
}

/* 📖 READER */
window.openReader = function (book) {
  document.getElementById("readerMode").style.display = "block";
  document.getElementById("mainContainer").style.display = "none";

  document.getElementById("readerTitle").innerText = book.title;
  document.getElementById("readerContent").innerText = book.content;
};

window.closeReader = function () {
  document.getElementById("readerMode").style.display = "none";
  document.getElementById("mainContainer").style.display = "block";
};
