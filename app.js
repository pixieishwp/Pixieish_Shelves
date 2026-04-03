import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔑 CONFIG
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

// 🔐 AUTH
window.signup = async () => {
  try {
    await createUserWithEmailAndPassword(
      auth,
      val("email"),
      val("password")
    );
    set("authStatus", "Account created!");
  } catch (e) {
    set("authStatus", e.message);
  }
};

window.login = async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      val("email"),
      val("password")
    );
    set("authStatus", "Logged in!");
  } catch (e) {
    set("authStatus", e.message);
  }
};

window.logout = async () => await signOut(auth);

// ✍️ ADD BOOK
window.addBook = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first");

  if (user.email !== ADMIN_EMAIL) {
    alert("Only admin can publish.");
    return;
  }

  const title = val("title");
  const synopsis = val("synopsis");
  const genre = val("genre");
  const series = val("series");
  const statusBook = document.getElementById("statusSelect").value;
  const content = val("content");

  if (!title || !content) {
    set("status", "Title & content required.");
    return;
  }

  await addDoc(collection(db, "books"), {
    title,
    synopsis,
    genre,
    series,
    status: statusBook,
    content,
    userId: user.uid,
    createdAt: Date.now()
  });

  set("status", "Book published!");
  clear(["title","synopsis","genre","series","content"]);

  loadBooks();
  loadBookOptions();
};

// 📖 ADD CHAPTER
window.addChapter = async () => {
  const user = auth.currentUser;
  if (!user) return;

  if (user.email !== ADMIN_EMAIL) {
    alert("Only admin can add chapters.");
    return;
  }

  const bookId = document.getElementById("bookSelect").value;
  const title = val("chapterTitle");
  const content = val("chapterContent");

  if (!bookId || !title || !content) {
    set("chapterStatus", "Complete all fields.");
    return;
  }

  await addDoc(collection(db, "chapters"), {
    bookId,
    title,
    content,
    createdAt: Date.now()
  });

  set("chapterStatus", "Chapter added!");
  clear(["chapterTitle","chapterContent"]);
};

// 🗑 DELETE BOOK
window.deleteBook = async (id) => {
  const user = auth.currentUser;

  if (user.email !== ADMIN_EMAIL) return;

  if (!confirm("Delete this book?")) return;

  await deleteDoc(doc(db, "books", id));
  loadBooks();
};

// 📚 LOAD BOOKS
async function loadBooks() {
  const user = auth.currentUser;
  if (!user) return;

  const container = document.getElementById("yourBooks");
  container.innerHTML = "";

  const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  snap.forEach(docSnap => {
    const data = docSnap.data();

    if (data.userId === user.uid) {
      container.insertAdjacentHTML("beforeend", `
        <div class="book-card">
          <div class="book-cover"></div>
          <div class="book-info">
            <strong>${data.title}</strong>
            <p>${data.genre || "No genre"} • ${data.status}</p>
            <p style="font-size:12px;">${data.synopsis || ""}</p>
          </div>

          ${user.email === ADMIN_EMAIL ? `
            <button onclick="deleteBook('${docSnap.id}')">Delete</button>
          ` : ""}
        </div>
      `);
    }
  });
}

// 📚 LOAD BOOK OPTIONS
async function loadBookOptions() {
  const user = auth.currentUser;
  if (!user) return;

  const select = document.getElementById("bookSelect");
  select.innerHTML = "";

  const snap = await getDocs(collection(db, "books"));

  snap.forEach(docSnap => {
    const data = docSnap.data();

    if (data.userId === user.uid) {
      select.innerHTML += `
        <option value="${docSnap.id}">
          ${data.title}
        </option>
      `;
    }
  });
}

// 👀 AUTH STATE
onAuthStateChanged(auth, (user) => {
  const writer = document.getElementById("writerMode");
  const chapter = document.getElementById("chapterMode");

  if (user) {
    show("appScreen");
    hide("authScreen");

    if (user.email === ADMIN_EMAIL) {
      writer.style.display = "block";
      chapter.style.display = "block";
      loadBookOptions();
    } else {
      writer.style.display = "none";
      chapter.style.display = "none";
    }

    loadBooks();
  } else {
    show("authScreen");
    hide("appScreen");
  }
});

// 🌸 SPLASH
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    splash.style.opacity = "0";
    setTimeout(() => splash.style.display = "none", 800);
  }, 1800);
});

// 🧰 HELPERS
function val(id){ return document.getElementById(id)?.value.trim() || ""; }
function set(id, txt){ document.getElementById(id).innerText = txt; }
function clear(arr){ arr.forEach(id => document.getElementById(id).value=""); }
function show(id){ document.getElementById(id).style.display="block"; }
function hide(id){ document.getElementById(id).style.display="none"; }
