const firebaseConfig = {
  apiKey: "AIzaSyDe8yZUNqXyP9O4yx1J8JYetJT6c7i8qdI",
  authDomain: "pixieish-shelves.firebaseapp.com",
  projectId: "pixieish-shelves",
  storageBucket: "pixieish-shelves.appspot.com",
  messagingSenderId: "458160398514",
  appId: "1:458160398514:web:b8bd9d073d5823575b29ab"
};

// 🔥 LOAD FIREBASE (NO MODULE)
import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js").then(firebase => {
  import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js").then(authMod => {
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js").then(dbMod => {

      const app = firebase.initializeApp(firebaseConfig);
      const auth = authMod.getAuth(app);
      const db = dbMod.getFirestore(app);

      // NOW DEFINE LOGIN HERE
      // ✅ LOGIN (ADD THIS)
window.login = async function () {
  const errorBox = document.getElementById("errorMsg");

  try {
    await authMod.signInWithEmailAndPassword(
      auth,
      document.getElementById("email").value.trim(),
      document.getElementById("password").value.trim()
    );

  } catch (e) {
    errorBox.innerText = e.code + " | " + e.message;
  }
};
     // ✅ SIGNUP (YOU ALREADY HAVE THIS)
window.signup = async function () {
  try {
    const cred = await authMod.createUserWithEmailAndPassword(
      auth,
      document.getElementById("email").value.trim(),
      document.getElementById("password").value.trim()
    );

    await dbMod.setDoc(
      dbMod.doc(db, "Users", cred.user.uid),
      { role: "reader" }
    );

    alert("Signup success");
  } catch (e) {
    alert(e.code);
  }
};
