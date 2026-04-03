import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

const ADMIN_EMAIL = "pixieishwp@gmail.com";

// AUTH
window.signup = async () => {
  try {
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
    set("authStatus", "Account created!");
  } catch (e) { set("authStatus", e.message); }
};

window.login = async () => {
  try {
    await signInWithEmailAndPassword(auth, val("email"), val("password"));
    set("authStatus", "Logged in!");
  } catch (e) { set("authStatus", e.message); }
};

window.logout = async () => await signOut(auth);

// ADD BOOK
window.addBook = async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return alert("Admin only");

  await addDoc(collection(db, "books"), {
    title: val("title"),
    synopsis: val("synopsis"),
    genre: val("genre"),
    series: val("series"),
    status: document.getElementById("statusSelect").value,
    content: val("content"),
    userId: user.uid,
    createdAt: Date.now()
  });

  set("status", "Book published!");
  clear(["title","synopsis","genre","series","content"]);
  loadBooks();
  loadBookOptions();
};

// ADD CHAPTER
window.addChapter = async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return;

  await addDoc(collection(db, "chapters"), {
    bookId: document.getElementById("bookSelect").value,
    title: val("chapterTitle"),
    content: val("chapterContent"),
    createdAt: Date.now()
  });

  set("chapterStatus", "Chapter added!");
  clear(["chapterTitle","chapterContent"]);
};

// DELETE BOOK
window.deleteBook = async (id) => {
  if (!confirm("Delete this book?")) return;
  await deleteDoc(doc(db, "books", id));
  loadBooks();
};

// LOAD BOOKS
async function loadBooks() {
  const user = auth.currentUser;
  const container = document.getElementById("yourBooks");
  container.innerHTML = "";

  const snap = await getDocs(query(collection(db,"books"),orderBy("createdAt","desc")));

  snap.forEach(docSnap=>{
    const data = docSnap.data();

    if(data.userId===user.uid){
      container.innerHTML+=`
        <div class="book-card" onclick="openBook('${docSnap.id}')">
          <div class="book-info">
            <strong>${data.title}</strong>
            <p>${data.genre} • ${data.status}</p>
          </div>
          ${user.email===ADMIN_EMAIL?`<button onclick="event.stopPropagation();deleteBook('${docSnap.id}')">Delete</button>`:""}
        </div>`;
    }
  });
}

// OPEN BOOK
window.openBook = async (id)=>{
  hide("appScreen"); show("readerView");

  const snap = await getDocs(collection(db,"books"));
  snap.forEach(d=>{
    if(d.id===id){
      const data=d.data();
      setText("readTitle",data.title);
      setText("readMeta",`${data.genre} • ${data.status}`);
      setText("readSynopsis",data.synopsis);
    }
  });

  loadChapters(id);
};

// LOAD CHAPTERS
async function loadChapters(bookId){
  const list=document.getElementById("chapterList");
  list.innerHTML="";

  const snap=await getDocs(query(
    collection(db,"chapters"),
    where("bookId","==",bookId),
    orderBy("createdAt")
  ));

  snap.forEach(d=>{
    const data=d.data();
    list.innerHTML+=`
      <div onclick="readChapter('${data.title}',\`${data.content}\`)">
        ${data.title}
      </div>`;
  });
}

// READ CHAPTER
window.readChapter=(t,c)=>{
  show("chapterReader");
  setText("chapterReadTitle",t);
  setText("chapterReadContent",c);
};

// CLOSE
window.closeReader=()=>{
  show("appScreen"); hide("readerView");
};

// AUTH STATE
onAuthStateChanged(auth,user=>{
  const writer=document.getElementById("writerMode");
  const chapter=document.getElementById("chapterMode");

  if(user){
    show("appScreen"); hide("authScreen");

    if(user.email===ADMIN_EMAIL){
      writer.style.display="block";
      chapter.style.display="block";
      loadBookOptions();
    }else{
      writer.style.display="none";
      chapter.style.display="none";
    }

    loadBooks();
  }else{
    show("authScreen"); hide("appScreen");
  }
});

// LOAD BOOK OPTIONS
async function loadBookOptions(){
  const user=auth.currentUser;
  const select=document.getElementById("bookSelect");
  select.innerHTML="";

  const snap=await getDocs(collection(db,"books"));

  snap.forEach(d=>{
    if(d.data().userId===user.uid){
      select.innerHTML+=`<option value="${d.id}">${d.data().title}</option>`;
    }
  });
}

// HELPERS
function val(id){return document.getElementById(id)?.value.trim()||"";}
function set(id,txt){document.getElementById(id).innerText=txt;}
function setText(id,txt){document.getElementById(id).innerText=txt;}
function clear(arr){arr.forEach(id=>document.getElementById(id).value="");}
function show(id){document.getElementById(id).style.display="block";}
function hide(id){document.getElementById(id).style.display="none";}
