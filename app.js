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
const splash = document.getElementById("splash");
const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");
const errorMsg = document.getElementById("errorMsg");

const yourBooks = document.getElementById("yourBooks");

// SPLASH
window.onload = () => {
  setTimeout(() => {
    splash.style.display = "none";
    authScreen.style.display = "block";
  }, 1500);
};

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
      errorMsg.innerText = e.code + " | " + e.message;
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
    .then(() => {
      alert("Signup successful!");
    })
    .catch((e) => {
      errorMsg.innerText = e.code + " | " + e.message;
    });
}

// LOGOUT
function logout() {
  auth.signOut();
}

// AUTH STATE
auth.onAuthStateChanged((user) => {
  if (user) {
    authScreen.style.display = "none";
    appScreen.style.display = "block";

    loadBooks(user.uid);
  } else {
    authScreen.style.display = "block";
    appScreen.style.display = "none";
  }
});

// ADD BOOK
function addBook() {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in.");
    return;
  }

  const title = document.getElementById("title").value.trim();

  if (!title) {
    alert("Please enter a book title.");
    return;
  }

  db.collection("books").add({
    title: title,
    userId: user.uid,
    createdAt: new Date()
  })
  .then(() => {
    document.getElementById("title").value = "";
    loadBooks(user.uid);
  })
  .catch((e) => {
    alert(e.message);
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
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid #ccc";

        yourBooks.appendChild(div);
      });
    })
    .catch((e) => {
      yourBooks.innerHTML = "Error loading books.";
      console.error(e);
    });
}
