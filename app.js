// 🔥 IMPORT FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔑 YOUR FIREBASE CONFIG (PASTE YOURS HERE)
const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✍️ ADD BOOK
window.addBook = async function() {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const status = document.getElementById("status");

  if (!title || !content) {
    status.innerText = "⚠️ Please complete your story!";
    return;
  }

  await addDoc(collection(db, "books"), {
    title,
    content,
    userId: user.uid,
    createdAt: Date.now()
  });

  status.innerText = "✅ Book published!";

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";

  loadBooks();
};

// 📚 LOAD BOOKS (NO DUPLICATION FIXED)
window.loadBooks = async function() {
  const user = auth.currentUser;
  if (!user) return;

  const snapshot = await getDocs(collection(db, "books"));
  const container = document.getElementById("yourBooks");

  container.innerHTML = ""; // 💥 important

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.userId === user.uid) {
      container.innerHTML += `
        <div class="book-card">
          <div class="book-cover"></div>
          <div class="book-info">
            <strong>${data.title}</strong>
            <p style="font-size:12px;">Saved in your library</p>
          </div>
        </div>
      `;
    }
  });
};

// 👀 AUTO LOAD
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadBooks();
  }
});
