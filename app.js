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

// ✅ WRITER WHITELIST
const WRITER_EMAILS = [
  "pixieishwp@gmail.com"
];

// DOM
let splash, authScreen, appScreen, errorMsg, yourBooks;

// MODE + ROLE
let currentMode = "writer";
let userRole = "reader";

// TRACK CURRENT EDIT
window.currentChapterId = null;
window.currentBookId = null;

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

// 🔐 AUTH STATE
auth.onAuthStateChanged((user) => {
  setTimeout(async () => {
    if (splash) splash.style.display = "none";

    if (user) {
      authScreen.style.display = "none";
      appScreen.style.display = "block";

      try {
        if (WRITER_EMAILS.includes(user.email)) {
          userRole = "writer";
          await db.collection("Users").doc(user.uid).set({ role: "writer" }, { merge: true });
        } else {
          userRole = "reader";
          await db.collection("Users").doc(user.uid).set({ role: "reader" }, { merge: true });
        }
      } catch {
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
  const writerBtn = document.getElementById("writerBtn");
  const writerControls = document.getElementById("writerBookControls");

  if (userRole === "reader") {
    currentMode = "reader";

    if (writerSection) writerSection.style.display = "none";
    if (writerBtn) writerBtn.style.display = "none";
    if (writerControls) writerControls.style.display = "none";

  } else {
    if (writerSection) writerSection.style.display = "block";
    if (writerBtn) writerBtn.style.display = "inline-block";
    if (writerControls) writerControls.style.display = "block";
  }
}

// 🔁 MODE SWITCH
function setMode(mode) {
  if (userRole === "reader") {
    currentMode = "reader";
  } else {
    currentMode = mode;
  }

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
      const role = WRITER_EMAILS.includes(email) ? "writer" : "reader";
      return db.collection("Users").doc(cred.user.uid).set({ role });
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
  if (userRole === "reader") return;

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
    createdAt: new Date()
  })
  .then(() => {
    document.getElementById("title").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("coverURL").value = "";
    document.getElementById("synopsis").value = "";

    loadBooks(user.uid);
  });
}

// LOAD BOOKS
function loadBooks(uid) {
  if (!yourBooks) return;

  yourBooks.innerHTML = "Loading...";

  let query;

  if (userRole === "writer") {
    query = db.collection("books").where("userId", "==", uid);
  } else {
    query = db.collection("books").where("status", "==", "published");
  }

  query.get().then((snap) => {
    yourBooks.innerHTML = "";

    if (snap.empty) {
      yourBooks.innerHTML = "No books available.";
      return;
    }

    snap.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");

      div.className = userRole === "writer" ? "writer-card" : "reader-card";

      div.innerHTML = `
        <h4>${data.title}</h4>
        <p>${data.genre || ""}</p>
      `;

      div.onclick = () => openBook(doc.id, data);
      yourBooks.appendChild(div);
    });
  });
}

// OPEN BOOK
function openBook(bookId, data) {
  document.getElementById("appScreen").style.display = "none";
  document.getElementById("bookPage").style.display = "block";

  document.getElementById("bookTitle").innerText = data.title;
  window.currentBookId = bookId;
  window.currentChapterId = null;

  const writerControls = document.getElementById("writerBookControls");

  if (userRole === "reader") {
    writerControls.style.display = "none";
  } else {
    writerControls.style.display = "block";
  }

  loadChapters(bookId);
}

// CLOSE BOOK
function closeBook() {
  document.getElementById("bookPage").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
}

// ADD / EDIT CHAPTER
function addChapter() {
  if (userRole === "reader") return;

  const title = document.getElementById("chapterTitle").value.trim();
  const content = document.getElementById("chapterContent").value.trim();

  if (!title || !content) {
    alert("Fill chapter title and content");
    return;
  }

  const ref = db.collection("books").doc(window.currentBookId).collection("chapters");

  if (window.currentChapterId) {
    // ✏️ UPDATE
    ref.doc(window.currentChapterId).update({
      title,
      content
    }).then(() => {
      resetChapterInputs();
    });

  } else {
    // ➕ CREATE
    ref.add({
      title,
      content,
      createdAt: new Date()
    }).then(() => {
      resetChapterInputs();
    });
  }
}

// RESET INPUTS
function resetChapterInputs() {
  document.getElementById("chapterTitle").value = "";
  document.getElementById("chapterContent").value = "";
  window.currentChapterId = null;

  loadChapters(window.currentBookId);
}

// LOAD CHAPTERS (CLICKABLE NOW)
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

        div.innerHTML = `<strong>${index + 1}. ${data.title}</strong>`;

        // 🔥 CLICK TO EDIT
        div.onclick = () => {
          if (userRole === "writer") {
            document.getElementById("chapterTitle").value = data.title;
            document.getElementById("chapterContent").value = data.content;
            window.currentChapterId = doc.id;
          }
        };

        chapterList.appendChild(div);
      });
    });
}
