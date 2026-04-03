import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  deleteDoc, doc, query, orderBy, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged
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

const ADMIN_EMAIL = "pixieishwp@gmail.com";

/* AUTH */
window.signup = async () => {
  await createUserWithEmailAndPassword(auth, val("email"), val("password"));
};

window.login = async () => {
  await signInWithEmailAndPassword(auth, val("email"), val("password"));
};

window.logout = async () => {
  await signOut(auth);
};

/* ADD BOOK */
window.addBook = async () => {
  const user = auth.currentUser;

  await addDoc(collection(db, "books"), {
    title: val("title"),
    synopsis: val("synopsis"),
    genre: val("genre"),
    status: document.getElementById("statusSelect").value,
    cover: val("coverURL"),
    published: document.getElementById("publishBook").checked,
    userId: user.uid,
    createdAt: Date.now()
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
          <strong>${data.title}</strong>
          <p>${data.genre}</p>
        </div>
      </div>
    `;
  });
}

/* 📖 BOOK VIEW */
window.currentBookId = null;

window.openBook = async (id) => {
  currentBookId = id;

  hide("appScreen");
  show("readerView");

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

  loadChapters(id);
};

/* 📖 LOAD CHAPTERS */
async function loadChapters(bookId) {
  const list = document.getElementById("chapterList");
  list.innerHTML = "";

  const snap = await getDocs(query(
    collection(db,"chapters"),
    where("bookId","==",bookId)
  ));

  snap.forEach(d => {
    const div = document.createElement("div");
    div.innerText = d.data().title;
    list.appendChild(div);
  });
}

/* ADD CHAPTER */
window.addChapterFromReader = async () => {
  await addDoc(collection(db,"chapters"), {
    bookId: currentBookId,
    title: val("chapterTitle"),
    content: val("chapterContent"),
    createdAt: Date.now()
  });

  loadChapters(currentBookId);
};

/* HELPERS */
function val(id){ return document.getElementById(id).value; }
function setText(id,txt){ document.getElementById(id).innerText = txt; }
function show(id){ document.getElementById(id).style.display="block"; }
function hide(id){ document.getElementById(id).style.display="none"; }

/* AUTH STATE */
onAuthStateChanged(auth, user => {
  document.getElementById("splash").style.display="none";

  if(user){
    show("appScreen");
    hide("authScreen");
    loadBooks();
  } else {
    show("authScreen");
    hide("appScreen");
  }
});
