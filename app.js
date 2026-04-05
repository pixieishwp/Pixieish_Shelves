import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore, collection, addDoc, query, where,
  getDocs, doc, deleteDoc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ DOM FIX (THIS WAS YOUR MAIN BUG)
const splash = document.getElementById("splash");
const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");
const bookPage = document.getElementById("bookPage");
const readerMode = document.getElementById("readerMode");

const writerSection = document.getElementById("writerSection");
const writerBookControls = document.getElementById("writerBookControls");

const yourBooks = document.getElementById("yourBooks");
const chapterList = document.getElementById("chapterList");

const bookTitle = document.getElementById("bookTitle");
const readerTitle = document.getElementById("readerTitle");
const readerContent = document.getElementById("readerContent");

const email = document.getElementById("email");
const password = document.getElementById("password");

const title = document.getElementById("title");
const genre = document.getElementById("genre");
const coverURL = document.getElementById("coverURL");
const synopsis = document.getElementById("synopsis");

const chapterTitle = document.getElementById("chapterTitle");
const chapterContent = document.getElementById("chapterContent");

// STATE
let currentUser = null;
let currentBookId = null;
let currentUserRole = "reader";

// SPLASH FIX
setTimeout(() => {
  splash.style.display = "none";
  authScreen.style.display = "block";
}, 1500);

// LOGIN
window.login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    alert(e.message);
  }
};

// SIGNUP
window.signup = async () => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);

    await setDoc(doc(db, "Users", cred.user.uid), {
      role: "reader"
    });

    alert("Signup success");
  } catch (e) {
    alert(e.message);
  }
};

window.logout = () => signOut(auth);

// AUTH STATE
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    const snap = await getDoc(doc(db, "Users", user.uid));
    currentUserRole = snap.exists() ? snap.data().role : "reader";

    console.log("ROLE:", currentUserRole);

    writerSection.style.display =
      currentUserRole === "writer" ? "block" : "none";

    writerBookControls.style.display =
      currentUserRole === "writer" ? "block" : "none";

    authScreen.style.display = "none";
    appScreen.style.display = "block";

    loadBooks();
  } else {
    authScreen.style.display = "block";
    appScreen.style.display = "none";
  }
});

// ADD BOOK
window.addBook = async () => {
  if (currentUserRole !== "writer") return alert("Not allowed");

  await addDoc(collection(db, "books"), {
    title: title.value,
    genre: genre.value,
    coverURL: coverURL.value,
    synopsis: synopsis.value,
    userId: currentUser.uid
  });

  loadBooks();
};

// LOAD BOOKS
async function loadBooks() {
  const q = query(collection(db, "books"), where("userId", "==", currentUser.uid));
  const snap = await getDocs(q);

  yourBooks.innerHTML = "";

  if (snap.empty) {
    yourBooks.innerHTML = "No books yet.";
    return;
  }

  snap.forEach(docSnap => {
    const b = docSnap.data();

    const div = document.createElement("div");
    div.innerText = b.title;

    div.onclick = () => openBook(docSnap.id, b.title);

    yourBooks.appendChild(div);
  });
}

// OPEN BOOK
window.openBook = (id, t) => {
  currentBookId = id;

  appScreen.style.display = "none";
  bookPage.style.display = "block";

  bookTitle.innerText = t;

  loadChapters();
};

window.closeBook = () => {
  bookPage.style.display = "none";
  appScreen.style.display = "block";
};

// ADD CHAPTER
window.addChapter = async () => {
  if (currentUserRole !== "writer") return;

  await addDoc(collection(db, "books", currentBookId, "chapters"), {
    title: chapterTitle.value,
    content: chapterContent.value
  });

  loadChapters();
};

// LOAD CHAPTERS
async function loadChapters() {
  if (!currentBookId) return;

  const snap = await getDocs(collection(db, "books", currentBookId, "chapters"));

  chapterList.innerHTML = "";

  snap.forEach(docSnap => {
    const c = docSnap.data();

    const div = document.createElement("div");
    div.innerText = c.title;

    div.onclick = () => openReader(c);

    chapterList.appendChild(div);
  });
}

// READER
window.openReader = (c) => {
  readerMode.style.display = "block";
  bookPage.style.display = "none";

  readerTitle.innerText = c.title;
  readerContent.innerText = c.content;
};

window.closeReader = () => {
  readerMode.style.display = "none";
  bookPage.style.display = "block";
};

// DELETE
window.deleteBook = async () => {
  if (currentUserRole !== "writer") return;

  await deleteDoc(doc(db, "books", currentBookId));

  closeBook();
  loadBooks();
};
