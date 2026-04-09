// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "pixieish-shelves.appspot.com",
  messagingSenderId: "458160398514",
  appId: "1:458160398514:web:b8bd9d073d5823575b29ab"
};

// INIT
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM
let splash, authScreen, appScreen, errorMsg, yourBooks;

// INIT APP
window.addEventListener("DOMContentLoaded", () => {
  splash = document.getElementById("splash");
  authScreen = document.getElementById("authScreen");
  appScreen = document.getElementById("appScreen");
  errorMsg = document.getElementById("errorMsg");
  yourBooks = document.getElementById("yourBooks");

  // Hide everything first
  authScreen.style.display = "none";
  appScreen.style.display = "none";
});

// 🔐 AUTH STATE (ONLY UI CONTROLLER)
auth.onAuthStateChanged((user) => {

  // wait for splash animation first
  setTimeout(() => {
    if (splash) splash.style.display = "none";

    if (user) {
      authScreen.style.display = "none";
      appScreen.style.display = "block";
      loadBooks(user.uid);
    } else {
      authScreen.style.display = "block";
      appScreen.style.display = "none";
    }

  }, 1500);
});

// LOGIN
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  errorMsg.innerText = "";

  if (!email || !password) {
    errorMsg.innerText = "Please fill in email and password.";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .catch((e) => {
      errorMsg.innerText = e.message;
    });
}

// SIGNUP
function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  errorMsg.innerText = "";

  if (!email || !password) {
    errorMsg.innerText = "Please fill in email and password.";
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.collection("Users").doc(cred.user.uid).set({
        role: "reader"
      });
    })
    .catch((e) => {
      errorMsg.innerText = e.message;
    });
}

// LOGOUT
function logout() {
  auth.signOut();
}

// ADD BOOK
function addBook() {
  const user = auth.currentUser;

  if (!user) return;

  const title = document.getElementById("title").value.trim();

  if (!title) {
    alert("Enter title");
    return;
  }

  db.collection("books").add({
    title,
    userId: user.uid
  }).then(() => {
    loadBooks(user.uid);
  });
}

// LOAD BOOKS
function loadBooks(uid) {
  yourBooks.innerHTML = "Loading...";

  db.collection("books")
    .where("userId", "==", uid)
    .get()
    .then((snap) => {
      yourBooks.innerHTML = "";

      if (snap.empty) {
        yourBooks.innerHTML = "No books yet.";
        return;
      }

      snap.forEach(doc => {
        const div = document.createElement("div");
        div.innerText = doc.data().title;
        yourBooks.appendChild(div);
      });
    });
}
