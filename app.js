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

// 🔑 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "pixieish-shelves.appspot.com",
  messagingSenderId: "458160398514",
  appId: "1:458160398514:web:b8bd9d073d5823575b29ab"
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔐 SIGN UP (WITH LOADING FEEDBACK)
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const status = document.getElementById("authStatus");

  status.innerText = "Creating account...";

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    status.innerText = "Account created!";
  } catch (error) {
    status.innerText = error.message;
  }
};

// 🔐 LOGIN (WITH LOADING FEEDBACK)
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const status = document.getElementById("authStatus");

  status.innerText = "Logging in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    status.innerText = "Success!";
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

  if (!user) {
    alert("Please login first.");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) {
    status.innerText = "Please complete your story.";
    return;
  }

  try {
    await addDoc(collection(db, "books"), {
      title,
      content,
      userId: user.uid,
      createdAt: Date.now()
    });

    status.innerText = "Book published successfully.";

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

    loadBooks();
  } catch (error) {
    status.innerText = "Error publishing book.";
    console.error(error);
  }
};

// 📚 LOAD BOOKS (NO DUPLICATION)
async function loadBooks() {
  const user = auth.currentUser;
  if (!user) return;

  const container = document.getElementById("yourBooks");
  container.innerHTML = "";

  try {
    const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    let hasBooks = false;

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.userId === user.uid) {
        hasBooks = true;

        container.insertAdjacentHTML("beforeend", `
          <div class="book-card">
            <div class="book-cover"></div>
            <div class="book-info">
              <strong>${data.title}</strong>
              <p>Saved in your library</p>
            </div>
          </div>
        `);
      }
    });

    if (!hasBooks) {
      container.innerHTML = "<p>No books yet. Start writing.</p>";
    }

  } catch (error) {
    console.error(error);
  }
}

// 👀 AUTH STATE (AUTO SWITCH SCREEN)
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
