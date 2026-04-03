import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInAnonymously,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "pixieish-shelves.firebasestorage.app",
  messagingSenderId: "458160398514",
  appId: "1:458160398514:web:b8bd9d073d5823575b29ab"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// AUTO LOGIN
signInAnonymously(auth);


// AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) loadBooks();
});


// 🚫 ADD BOOK WITH DUPLICATE CHECK
window.addBook = async function () {
  const title = document.getElementById("bookTitle").value;
  const content = document.getElementById("bookContent").value;

  const user = auth.currentUser;
  if (!user) return;

  if (!title) {
    alert("Title required!");
    return;
  }

  const querySnapshot = await getDocs(collection(db, "books"));

  let exists = false;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.title === title && data.userId === user.uid) {
      exists = true;
    }
  });

  if (exists) {
    alert("Book already exists!");
    return;
  }

  await addDoc(collection(db, "books"), {
    title: title,
    content: content,
    userId: user.uid
  });

  alert("Book published!");

  document.getElementById("bookTitle").value = "";
  document.getElementById("bookContent").value = "";

  loadBooks();
};


// 📚 LOAD BOOKS CLEAN
window.loadBooks = async function () {
  const user = auth.currentUser;
  if (!user) return;

  const container = document.getElementById("library");

  container.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "books"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    if (data.userId === user.uid) {
      container.innerHTML += `
        <div class="card">
          <h4>${data.title}</h4>
          <p>${data.content.substring(0, 80)}...</p>
        </div>
      `;
    }
  });
};
