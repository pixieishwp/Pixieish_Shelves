import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
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
window.signup = async function () {
  const email = emailEl().value;
  const password = passwordEl().value;
  const status = authStatus();

  status.innerText = "Creating account...";
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    status.innerText = "Account created!";
  } catch (e) {
    status.innerText = e.message;
  }
};

window.login = async function () {
  const email = emailEl().value;
  const password = passwordEl().value;
  const status = authStatus();

  status.innerText = "Logging in...";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    status.innerText = "Success!";
  } catch (e) {
    status.innerText = e.message;
  }
};

window.logout = async function () {
  await signOut(auth);
};

// ✍️ ADD BOOK (UPDATED)
window.addBook = async function () {
  const user = auth.currentUser;
  const status = document.getElementById("status");

  if (!user) return alert("Login first");

  if (user.email !== ADMIN_EMAIL) {
    alert("Only admin can publish.");
    return;
  }

  // 🆕 NEW FIELDS
  const title = getVal("title");
  const synopsis = getVal("synopsis");
  const genre = getVal("genre");
  const series = getVal("series");
  const statusBook = document.getElementById("statusSelect").value;
  const content = getVal("content");

  if (!title || !content) {
    status.innerText = "Title & story required.";
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

  status.innerText = "Book published.";

  clearFields();

  loadBooks();
};

// 📚 LOAD BOOKS (UPDATED DISPLAY)
async function loadBooks() {
  const user = auth.currentUser;
  if (!user) return;

  const container = document.getElementById("yourBooks");
  container.innerHTML = "";

  const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.userId === user.uid) {
      container.insertAdjacentHTML("beforeend", `
        <div class="book-card">
          <div class="book-cover"></div>
          <div class="book-info">
            <strong>${data.title}</strong>
            <p>${data.genre || "No genre"} • ${data.status}</p>
            <p style="font-size:12px;">${data.synopsis || ""}</p>
          </div>
        </div>
      `);
    }
  });
}

// 👀 AUTH STATE
onAuthStateChanged(auth, (user) => {
  const writer = document.getElementById("writerMode");

  if (user) {
    show("appScreen");
    hide("authScreen");

    writer.style.display =
      user.email === ADMIN_EMAIL ? "block" : "none";

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
function getVal(id) {
  return document.getElementById(id)?.value.trim() || "";
}
function clearFields() {
  ["title","synopsis","genre","series","content"].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}
function emailEl(){ return document.getElementById("email"); }
function passwordEl(){ return document.getElementById("password"); }
function authStatus(){ return document.getElementById("authStatus"); }
function show(id){ document.getElementById(id).style.display = "block"; }
function hide(id){ document.getElementById(id).style.display = "none"; }
