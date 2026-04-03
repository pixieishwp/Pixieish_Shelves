import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "pixieish-shelves.appspot.com",
  messagingSenderId: "458160398514",
  appId: "1:458160398514:web:b8bd9d073d5823575b29ab"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* AUTH */
window.signup = async () => {
  await createUserWithEmailAndPassword(auth, val("email"), val("password"));
};

window.login = async () => {
  await signInWithEmailAndPassword(auth, val("email"), val("password"));
};

window.logout = async () => {
  await signOut(auth);
  location.reload();
};

/* ADD BOOK */
window.addBook = async () => {
  await addDoc(collection(db,"books"), {
    title: val("title"),
    synopsis: val("synopsis"),
    genre: val("genre"),
    cover: val("coverURL") || "https://via.placeholder.com/150"
  });

  loadBooks();
};

/* LOAD BOOKS */
async function loadBooks() {
  const container = document.getElementById("yourBooks");
  container.innerHTML = "";

  const snap = await getDocs(collection(db,"books"));

  snap.forEach(d => {
    const data = d.data();

    container.innerHTML += `
      <div class="book-card" onclick="openBook('${d.id}')">
        <img src="${data.cover}" class="book-cover">
        <div>
          <strong>${data.title || "Untitled"}</strong>
          <p>${data.genre || "No genre"}</p>
        </div>
      </div>
    `;
  });
}

/* BOOK VIEW */
let currentBookId = null;

window.openBook = async (id) => {
  currentBookId = id;

  document.getElementById("appScreen").style.display = "none";
  document.getElementById("readerView").style.display = "block";

  const snap = await getDocs(collection(db,"books"));

  snap.forEach(d => {
    if (d.id === id) {
      const data = d.data();
      setText("readTitle", data.title);
      setText("readMeta", data.genre);
      setText("readSynopsis", data.synopsis);
      document.getElementById("readCover").src = data.cover;
    }
  });

  loadChapters();
};

/* CHAPTERS */
async function loadChapters() {
  const list = document.getElementById("chapterList");
  list.innerHTML = "";

  const snap = await getDocs(collection(db,"chapters"));

  snap.forEach(d => {
    const data = d.data();
    if (data.bookId === currentBookId) {
      list.innerHTML += `<div>${data.title}</div>`;
    }
  });
}

window.addChapterFromReader = async () => {
  await addDoc(collection(db,"chapters"), {
    bookId: currentBookId,
    title: val("chapterTitle"),
    content: val("chapterContent")
  });

  loadChapters();
};

window.closeReader = () => {
  document.getElementById("readerView").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
};

/* AUTH STATE + SPLASH FIX */
onAuthStateChanged(auth, user => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";

    if (user) {
      document.getElementById("appScreen").style.display = "block";
      document.getElementById("authScreen").style.display = "none";
      loadBooks();
    } else {
      document.getElementById("authScreen").style.display = "flex";
    }
  }, 1200);
});

/* HELPERS */
function val(id){ return document.getElementById(id).value; }
function setText(id,txt){ document.getElementById(id).innerText = txt; }
