// TEMP STORAGE (no firebase yet)
let books = [];

/* 🌸 SPLASH */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const auth = document.getElementById("authScreen");

  setTimeout(() => {
    splash.style.opacity = "0";

    setTimeout(() => {
      splash.style.display = "none";
      auth.style.display = "flex";
    }, 500);

  }, 1500);
});

/* 🔐 FAKE AUTH */
window.login = function () {
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
};

window.signup = function () {
  document.getElementById("authStatus").innerText = "Account created!";
};

window.logout = function () {
  document.getElementById("appScreen").style.display = "none";
  document.getElementById("authScreen").style.display = "flex";
};

/* ☰ MENU */
window.toggleMenu = function () {
  const menu = document.getElementById("dropdown");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
};

/* 📚 ADD BOOK */
window.addBook = function () {
  const title = document.getElementById("title").value || "Untitled";
  const synopsis = document.getElementById("synopsis").value || "No description";
  const genre = document.getElementById("genre").value || "Unknown";
  const cover = document.getElementById("coverURL").value || "";

  const book = { title, synopsis, genre, cover };
  books.push(book);

  renderBooks();

  document.getElementById("status").innerText = "Book saved!";
};

/* 📖 RENDER BOOKS */
function renderBooks() {
  const container = document.getElementById("yourBooks");
  container.innerHTML = "";

  books.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-card";

    div.innerHTML = `
      <img src="${book.cover || 'https://via.placeholder.com/60x85'}" class="book-cover">
      <div>
        <strong>${book.title}</strong>
        <p>${book.genre}</p>
        <small>${book.synopsis}</small>
      </div>
    `;

    container.appendChild(div);
  });
                        }
