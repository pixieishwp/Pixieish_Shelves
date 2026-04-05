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
  deleteDoc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentBookId = null;
let currentUserRole = "reader";


// 🔐 LOGIN
window.login = async function () {
  try {
    await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
  } catch (e) {
    alert(e.message);
  }
};

// 🔐 SIGNUP
window.signup = async function () {
  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    await setDoc(doc(db, "Users", cred.user.uid), {
      role: "reader"
    });

    alert("Signup success!");
  } catch (e) {
    alert(e.message);
  }
};

window.logout = () => signOut(auth);


// 👀 AUTH STATE
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    // GET ROLE
    const snap = await getDoc(doc(db, "Users", user.uid));

    currentUserRole = snap.exists()
      ? snap.data().role
      : "reader";

    console.log("ROLE:", currentUserRole);

    // UI CONTROL
    document.getElementById("writerSection").style.display =
      currentUserRole === "writer" ? "block" : "none";

    document.getElementById("writerBookControls").style.display =
      currentUserRole === "writer" ? "block" : "none";

    authScreen.style.display = "none";
    appScreen.style.display = "block";

    loadBooks();

  } else {
    authScreen.style.display = "flex";
    appScreen.style.display = "none";
  }
});


// 📚 ADD BOOK
window.addBook = async function () {
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


// 📚 LOAD BOOKS
async function loadBooks() {
  const q = query(
    collection(db, "books"),
    where("userId", "==", currentUser.uid)
  );

  const snap = await getDocs(q);

  yourBooks.innerHTML = "";

  if (snap.empty) {
    yourBooks.innerHTML = "No books yet.";
    return;
  }

  snap.forEach(docSnap => {
    const b = docSnap.data();

    const div = document.createElement("div");
    div.className = "book-card";
    div.innerHTML = `<b>${b.title}</b>`;

    div.onclick = () => openBook(docSnap.id, b.title);

    yourBooks.appendChild(div);
  });
}


// 📖 OPEN BOOK
window.openBook = (id, title) => {
  currentBookId = id;

  appScreen.style.display = "none";
  bookPage.style.display = "block";

  bookTitle.innerText = title;

  loadChapters();
};

window.closeBook = () => {
  bookPage.style.display = "none";
  appScreen.style.display = "block";
};


// ✍️ ADD CHAPTER
window.addChapter = async function () {
  if (currentUserRole !== "writer") return;

  await addDoc(
    collection(db, "books", currentBookId, "chapters"),
    {
      title: chapterTitle.value,
      content: chapterContent.value
    }
  );

  loadChapters();
};


// 📑 LOAD CHAPTERS
async function loadChapters() {
  if (!currentBookId) return;

  const snap = await getDocs(
    collection(db, "books", currentBookId, "chapters")
  );

  chapterList.innerHTML = "";

  if (snap.empty) {
    chapterList.innerHTML = "No chapters.";
    return;
  }

  snap.forEach(docSnap => {
    const c = docSnap.data();

    const div = document.createElement("div");
    div.innerHTML = c.title;

    div.onclick = () => openReader(c);

    chapterList.appendChild(div);
  });
}


// 📖 READER
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


// 🗑 DELETE
window.deleteBook = async function () {
  if (currentUserRole !== "writer") return;

  await deleteDoc(doc(db, "books", currentBookId));

  closeBook();
  loadBooks();
};


// ☰ MENU
window.toggleMenu = function () {
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
};
