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
window.loadBooks = async function () {
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
};

// 👀 AUTH LISTENER
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadBooks();
  } else {
    document.getElementById("yourBooks").innerHTML = "";
  }
});
