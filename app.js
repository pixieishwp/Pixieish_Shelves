alert("JS is running");

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

// MODE + ROLE
let currentMode = "writer";
let userRole = "reader"; // default safe

// INIT APP
window.addEventListener("DOMContentLoaded", () => {
  splash = document.getElementById("splash");
  authScreen = document.getElementById("authScreen");
  appScreen = document.getElementById("appScreen");
  errorMsg = document.getElementById("errorMsg");
  yourBooks = document.getElementById("yourBooks");

  authScreen.style.display = "none";
  appScreen.style.display = "none";
});

// 🔐 AUTH STATE (SAFE + ROLE LOAD)
auth.onAuthStateChanged((user) => {
  setTimeout(async () => {
    if (splash) splash.style.display = "none";

    if (user) {
      authScreen.style.display = "none";
      appScreen.style.display = "block";

      try {
        const doc = await db.collection("Users").doc(user.uid).get();
        userRole = doc.exists ? doc.data().role : "reader";
      } catch (e) {
        userRole = "reader";
      }

      applyRoleUI();
      loadBooks(user.uid);

    } else {
      authScreen.style.display = "block";
      appScreen.style.display = "none";
    }
  }, 1500);
});

// 🎭 APPLY ROLE UI
function applyRoleUI() {
  const writerSection = document.getElementById("writerSection");

  if (userRole === "reader") {
    currentMode = "reader";
    if (writerSection) writerSection.style.display = "none";
  } else {
    if (writerSection) writerSection.style.display = "block";
  }
}

// 🔁 MODE SWITCH (LOCKED)
function setMode(mode) {
  if (userRole === "reader" && mode === "writer") {
    alert("Reader accounts cannot access Writer mode.");
    return;
  }

  currentMode = mode;

  const user = auth.currentUser;
  if (user) loadBooks(user.uid);
}

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

// ✅ UPDATED SIGNUP (AUTO ROLE)
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

      // 🔐 AUTO ROLE ASSIGN
      let role = "reader";

      if (email === "pixieishwp@gmail.com") {
        role = "writer";
      }

      return db.collection("Users").doc(cred.user.uid).set({
        role: role
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
  const genre = document.getElementById("genre").value.trim();
  const coverURL = document.getElementById("coverURL").value.trim();
  const synopsis = document.getElementById("synopsis").value.trim();

  if (!title) {
    alert("Enter title");
    return;
  }

  db.collection("books").add({
    title,
    genre,
    coverURL,
    synopsis,
    userId: user.uid,
    status: "draft",
    chapterCount: 0,
    wordCount: 0,
    createdAt: new Date()
  })
  .then(() => {
    document.getElementById("title").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("coverURL").value = "";
    document.getElementById("synopsis").value = "";

    loadBooks(user.uid);
  })
  .catch((e) => {
    alert(e.message);
  });
}

// LOAD BOOKS
function loadBooks(uid) {
  if (!yourBooks) return;

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
        const data = doc.data();

        const status = data.status || "draft";
        const chapterCount = data.chapterCount || 0;
        const wordCount = data.wordCount || 0;

        if (currentMode === "reader" && status !== "published") {
          return;
        }

        const div = document.createElement("div");

        if (currentMode === "writer") {
          div.className = "writer-card";

          div.innerHTML = `
            <div class="card-cover"></div>
            <h4>${data.title}</h4>
            <p>${data.genre || ""}</p>
            <small>${chapterCount} ch · ${wordCount} words</small>
            <div class="status ${status}">${status}</div>
          `;
        } else {
          div.className = "reader-card";

          div.innerHTML = `
            <div class="card-cover"></div>
            <h4>${data.title}</h4>
            <p>${data.genre || ""}</p>
          `;
        }

        div.onclick = () => openBook(doc.id, data);
        yourBooks.appendChild(div);
      });
    })
    .catch((e) => {
      yourBooks.innerHTML = "Error loading books";
      console.error(e);
    });
}

// OPEN BOOK
function openBook(bookId, data) {
  document.getElementById("appScreen").style.display = "none";
  document.getElementById("bookPage").style.display = "block";

  document.getElementById("bookTitle").innerText = data.title;

  window.currentBookId = bookId;

  loadChapters(bookId);
}

// CLOSE BOOK
function closeBook() {
  document.getElementById("bookPage").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
}

// ADD CHAPTER
function addChapter() {
  const title = document.getElementById("chapterTitle").value.trim();
  const content = document.getElementById("chapterContent").value.trim();

  if (!title || !content) {
    alert("Fill chapter title and content");
    return;
  }

  db.collection("books")
    .doc(window.currentBookId)
    .collection("chapters")
    .add({
      title,
      content,
      createdAt: new Date()
    })
    .then(() => {
      document.getElementById("chapterTitle").value = "";
      document.getElementById("chapterContent").value = "";

      loadChapters(window.currentBookId);
    })
    .catch((e) => {
      alert(e.message);
    });
}

// LOAD CHAPTERS
function loadChapters(bookId) {
  const chapterList = document.getElementById("chapterList");
  chapterList.innerHTML = "Loading...";

  db.collection("books")
    .doc(bookId)
    .collection("chapters")
    .get()
    .then((snap) => {
      chapterList.innerHTML = "";

      if (snap.empty) {
        chapterList.innerHTML = "No chapters yet.";
        return;
      }

      snap.forEach((doc, index) => {
        const data = doc.data();

        const div = document.createElement("div");
        div.className = "chapter-card";

        div.innerHTML = `
          <strong>${index + 1}. ${data.title}</strong>
        `;

        chapterList.appendChild(div);
      });
    })
    .catch((e) => {
      chapterList.innerHTML = "Error loading chapters";
      console.error(e);
    });
}
