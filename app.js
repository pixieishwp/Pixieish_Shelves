import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* 🔥 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "pixieish-shelves.appspot.com",
  messagingSenderId: "458160398514",
  appId: "1:458160398514:web:b8bd9d073d5823575b29ab"
};

/* 🚀 INIT */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "pixieishwp@gmail.com";

/* 🔐 AUTH */
window.signup = async () => {
  try {
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
    set("authStatus", "Account created!");
  } catch (e) {
    set("authStatus", e.message);
  }
};

window.login = async () => {
  try {
    await signInWithEmailAndPassword(auth, val("email"), val("password"));
    set("authStatus", "Logged in!");
  } catch (e) {
    set("authStatus", e.message);
  }
};

window.logout = async () => {
  await signOut(auth);
};

/* 📚 ADD BOOK (UPDATED) */
window.addBook = async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return alert("Admin only");

  await addDoc(collection(db, "books"), {
    title: val("title"),
    synopsis: val("synopsis"),
    genre: val("genre"),
    series: val("series"),
    status: document.getElementById("statusSelect").value,
    content: val("content"),
    cover: val("coverURL"), // ✅ NEW
    published: document.getElementById("publishBook").checked, // ✅ NEW
    userId: user.uid,
    createdAt: Date.now()
  });

  set("status", "Book saved!");
  clear(["title","synopsis","genre","series","content","coverURL"]);

  loadBooks();
  loadBookOptions();
};

/* 📖 ADD CHAPTER (UPDATED) */
window.addChapter = async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return;

  const bookId = document.getElementById("bookSelect").value;

  const snap = await getDocs(query(
    collection(db,"chapters"),
    where("bookId","==",bookId)
  ));

  const chapterNumber = snap.size + 1;

  await addDoc(collection(db, "chapters"), {
    bookId,
    title: `Chapter ${chapterNumber}: ${val("chapterTitle")}`,
    content: val("chapterContent"),
    published: document.getElementById("publishChapter").checked,
    createdAt: Date.now()
  });

  set("chapterStatus", "Chapter added!");
  clear(["chapterTitle","chapterContent"]);
};

/* 🗑 DELETE */
window.deleteBook = async (id) => {
  if (!confirm("Delete this book?")) return;
  await deleteDoc(doc(db, "books", id));
  loadBooks();
};

/* 📚 LOAD BOOKS (OPTIMIZED) */
async function loadBooks() {
  const user = auth.currentUser;
  const container = document.getElementById("yourBooks");
  if (!container) return;

  container.innerHTML = "";

  const snap = await getDocs(
    query(collection(db,"books"), orderBy("createdAt","desc"))
  );

  let html = "";

  snap.forEach(docSnap => {
    const data = docSnap.data();

    // ✅ Show published OR own books
    if (data.published || data.userId === user.uid) {
      html += `
        <div class="book-card" onclick="openBook('${docSnap.id}')">
          ${data.cover ? `<img src="${data.cover}" class="book-cover">` : ""}

          <div class="book-info">
            <strong>${data.title}</strong>
            <p>${data.genre || ""} • ${data.status}</p>
            <small>${data.synopsis || ""}</small>

            ${user.email === ADMIN_EMAIL ? `
              <button onclick="event.stopPropagation(); deleteBook('${docSnap.id}')">
                Delete
              </button>
            ` : ""}
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

/* 📖 LOAD CHAPTERS */
async function loadChapters(bookId) {
  const list = document.getElementById("chapterList");
  list.innerHTML = "";

  const snap = await getDocs(query(
    collection(db,"chapters"),
    where("bookId","==",bookId),
    orderBy("createdAt")
  ));

  let html = "";

  snap.forEach(d => {
    const data = d.data();

    // ✅ Hide unpublished from readers
    if (!data.published && auth.currentUser.email !== ADMIN_EMAIL) return;

    html += `
      <div onclick="readChapter('${data.title}', \`${data.content}\`)">
        ${data.title}
      </div>
    `;
  });

  list.innerHTML = html;
}

/* 📖 OPEN BOOK */
window.openBook = async (id) => {
  hide("appScreen");
  show("readerView");

  const snap = await getDocs(collection(db,"books"));

  snap.forEach(d => {
    if (d.id === id) {
      const data = d.data();
      setText("readTitle", data.title);
      setText("readMeta", `${data.genre} • ${data.status}`);
      setText("readSynopsis", data.synopsis);
    }
  });

  loadChapters(id);
};

/* 📖 READ */
window.readChapter = (title, content) => {
  show("chapterReader");
  setText("chapterReadTitle", title);
  setText("chapterReadContent", content);
};

/* 🔙 CLOSE */
window.closeReader = () => {
  show("appScreen");
  hide("readerView");
};

/* 🔽 MENU */
window.toggleMenu = () => {
  const d = document.getElementById("dropdown");
  d.style.display = d.style.display === "block" ? "none" : "block";
};

/* 📘 BOOK OPTIONS */
async function loadBookOptions() {
  const user = auth.currentUser;
  const select = document.getElementById("bookSelect");
  if (!select) return;

  select.innerHTML = "";

  const snap = await getDocs(collection(db,"books"));

  snap.forEach(d => {
    if (d.data().userId === user.uid) {
      select.innerHTML += `<option value="${d.id}">${d.data().title}</option>`;
    }
  });
}

/* 🔐 AUTH STATE */
onAuthStateChanged(auth, user => {
  const splash = document.getElementById("splash");
  const authScreen = document.getElementById("authScreen");
  const appScreen = document.getElementById("appScreen");

  const writer = document.getElementById("writerMode");
  const chapter = document.getElementById("chapterMode");

  if (splash) splash.style.display = "none";

  if (user) {
    authScreen.style.display = "none";
    appScreen.style.display = "block";

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
    authScreen.style.display = "flex";
    appScreen.style.display = "none";
  }
});

/* 🧩 HELPERS */
function val(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function set(id, txt) {
  const el = document.getElementById(id);
  if (el) el.innerText = txt;
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.innerText = txt;
}

function clear(arr) {
  arr.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
    }
