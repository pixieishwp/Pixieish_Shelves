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
  getDocs,
  doc,
  deleteDoc
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
let currentBookId = null;


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
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, password);
};

window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await createUserWithEmailAndPassword(auth, email, password);
};

window.logout = function () {
  signOut(auth);
};


// 👀 AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;

    document.getElementById("authScreen").style.display = "none";
    document.getElementById("appScreen").style.display = "block";
    document.getElementById("bookPage").style.display = "none";
    document.getElementById("readerMode").style.display = "none";

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


// 🧹 CLEAR INPUTS
function clearInputs() {
  document.getElementById("title").value = "";
  document.getElementById("genre").value = "";
  document.getElementById("coverURL").value = "";
  document.getElementById("synopsis").value = "";
}


// 📚 LOAD BOOKS
async function loadBooks() {
  const q = query(
    collection(db, "books"),
    where("userId", "==", currentUser.uid)
  );

  const snapshot = await getDocs(q);

  const container = document.getElementById("yourBooks");
  container.innerHTML = "Loading...";

  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const book = docSnap.data();

    const div = document.createElement("div");
    div.className = "book-card";

    div.innerHTML = `
      <img src="${book.coverURL || 'https://via.placeholder.com/60x85'}" class="book-cover">
      <div>
        <b>${book.title}</b><br>
        <small>${book.genre || ''}</small>
      </div>
    `;

    div.onclick = () => openBook(docSnap.id, book.title);

    container.appendChild(div);
  });
}


// 📖 OPEN BOOK
window.openBook = function (id, title) {
  currentBookId = id;

  document.getElementById("appScreen").style.display = "none";
  document.getElementById("readerMode").style.display = "none";
  document.getElementById("bookPage").style.display = "block";

  document.getElementById("bookTitle").innerText = title;

  loadChapters();
};


// ❌ CLOSE BOOK
window.closeBook = function () {
  document.getElementById("bookPage").style.display = "none";
  document.getElementById("readerMode").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
};


// ✍️ ADD CHAPTER
window.addChapter = async function () {
  if (!currentBookId) return;

  const title = document.getElementById("chapterTitle").value;
  const content = document.getElementById("chapterContent").value;

  await addDoc(collection(db, "books", currentBookId, "chapters"), {
    title,
    content,
    createdAt: Date.now()
  });

  document.getElementById("chapterTitle").value = "";
  document.getElementById("chapterContent").value = "";

  loadChapters();
};


// 📑 LOAD CHAPTERS (FIXED)
async function loadChapters() {
  const container = document.getElementById("chapterList");
  container.innerHTML = "Loading...";

  try {
    const snapshot = await getDocs(
      collection(db, "books", currentBookId, "chapters")
    );

    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "No chapters yet.";
      return;
    }

    snapshot.forEach((docSnap) => {
      const chapter = docSnap.data();

      const div = document.createElement("div");
      div.className = "book-card";

      div.innerHTML = `<strong>${chapter.title}</strong>`;

      div.onclick = () => openReader(chapter);

      container.appendChild(div);
    });

  } catch (error) {
    console.error("ERROR loading chapters:", error);
    container.innerHTML = "Failed to load chapters.";
  }
}


// 📖 READER MODE (FIXED)
window.openReader = function (chapter) {
  document.getElementById("appScreen").style.display = "none";
  document.getElementById("bookPage").style.display = "none";
  document.getElementById("readerMode").style.display = "block";

  document.getElementById("readerTitle").innerText = chapter.title;
  document.getElementById("readerContent").innerText = chapter.content;
};

window.closeReader = function () {
  document.getElementById("readerMode").style.display = "none";
  document.getElementById("bookPage").style.display = "block";
};


// 🗑 DELETE BOOK
window.deleteBook = async function () {
  if (!currentBookId) return;

  const confirmDelete = confirm("Delete this book?");
  if (!confirmDelete) return;

  await deleteDoc(doc(db, "books", currentBookId));

  closeBook();
  loadBooks();
};


// ☰ MENU
window.toggleMenu = function () {
  const d = document.getElementById("dropdown");
  d.style.display = d.style.display === "block" ? "none" : "block";
};
