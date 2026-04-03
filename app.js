// 🔥 IMPORT FIREBASE
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

// 🔐 SIGN UP
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const status = document.getElementById("authStatus");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    status.innerText = "Account created!";
  } catch (error) {
    status.innerText = error.message;
  }
};

// 🔐 LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const status = document.getElementById("authStatus");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    status.innerText = "Logged in!";
  } catch (error) {
    status.innerText = error.message;
  }
};

// 🔐 LOGOUT
window.logout = async function () {
  await signOut(auth);
};

// ✍️ ADD BOOK
window.addBook = async function () {
  const user = auth.currentUser;
  const status = document.getElementById("status");

  if (!user) return alert("Login first");

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) {
    status.innerText = "Complete your story";
    return;
  }

  await addDoc(collection(db, "books"), {
    title,
    content,
    userId: user.uid,
    createdAt: Date.now()
  });

  status.innerText = "Book published";

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";

  loadBooks();
};

// 📚 LOAD BOOKS
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
      container.innerHTML += `
        <div class="book-card">
          <div class="book-cover"></div>
          <div class="book-info">
            <strong>${data.title}</strong>
            <p>Saved in your library</p>
          </div>
        </div>
      `;
    }
  });
}

// 👀 AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("authScreen").style.display = "none";
    document.getElementById("appScreen").style.display = "block";
    loadBooks();
  } else {
    document.getElementById("authScreen").style.display = "block";
    document.getElementById("appScreen").style.display = "none";
  }
});
