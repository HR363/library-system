"use strict";
(() => {
  // src/models/Member.ts
  var Member = class {
    constructor(id, name, email) {
      this.id = id;
      this.name = name;
      this.email = email;
    }
  };

  // src/services/MemberService.ts
  var MemberService = class {
    constructor() {
      this.members = [];
      this.idCounter = 1;
    }
    add(name, email) {
      const member = new Member(this.idCounter++, name, email);
      this.members.push(member);
      return member;
    }
    getAll() {
      return this.members;
    }
    get(id) {
      return this.members.find((m) => m.id === id);
    }
    remove(id, hasBorrowedBooks) {
      if (hasBorrowedBooks) return false;
      this.members = this.members.filter((m) => m.id !== id);
      return true;
    }
  };

  // src/models/Book.ts
  var Book = class {
    constructor(id, title, author, borrowedBy = null, borrowDate = null, dueDate = null) {
      this.id = id;
      this.title = title;
      this.author = author;
      this.borrowedBy = borrowedBy;
      this.borrowDate = borrowDate;
      this.dueDate = dueDate;
    }
  };

  // src/services/BookService.ts
  var BookService = class {
    constructor() {
      this.books = [];
      this.idCounter = 1;
    }
    add(title, author) {
      const book = new Book(this.idCounter++, title, author);
      this.books.push(book);
      return book;
    }
    getAll() {
      return this.books;
    }
    get(id) {
      return this.books.find((b) => b.id === id);
    }
    borrow(bookId, memberId) {
      const book = this.get(bookId);
      if (book && book.borrowedBy === null) {
        const now = /* @__PURE__ */ new Date();
        const due = new Date(now);
        due.setDate(now.getDate() + 14);
        book.borrowedBy = memberId;
        book.borrowDate = now.toISOString().split("T")[0];
        book.dueDate = due.toISOString().split("T")[0];
        return true;
      }
      return false;
    }
    return(bookId) {
      const book = this.get(bookId);
      if (book && book.borrowedBy !== null) {
        book.borrowedBy = null;
        book.borrowDate = null;
        book.dueDate = null;
        return true;
      }
      return false;
    }
    remove(bookId) {
      this.books = this.books.filter((b) => b.id !== bookId);
    }
    getAvailableBooks() {
      return this.books.filter((b) => b.borrowedBy === null);
    }
    getBorrowedBooks() {
      return this.books.filter((b) => b.borrowedBy !== null);
    }
    isBorrowedByMember(memberId) {
      return this.books.some((b) => b.borrowedBy === memberId);
    }
  };

  // src/Frontend.ts
  var memberService = new MemberService();
  var bookService = new BookService();
  var memberForm = document.getElementById("memberForm");
  var bookForm = document.getElementById("bookForm");
  var borrowForm = document.getElementById("borrowForm");
  var memberList = document.getElementById("memberList");
  var bookList = document.getElementById("bookList");
  var borrowMemberSelect = document.getElementById("borrowMember");
  var borrowBookSelect = document.getElementById("borrowBook");
  var borrowedList = document.getElementById("borrowedList");
  memberForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("memberName").value.trim();
    const email = document.getElementById("memberEmail").value.trim();
    if (name && email) {
      memberService.add(name, email);
      memberForm.reset();
      renderAll();
    }
  });
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    if (title && author) {
      bookService.add(title, author);
      bookForm.reset();
      renderAll();
    }
  });
  borrowForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const memberId = parseInt(borrowMemberSelect.value);
    const bookId = parseInt(borrowBookSelect.value);
    if (!isNaN(memberId) && !isNaN(bookId)) {
      bookService.borrow(bookId, memberId);
      renderAll();
    }
  });
  window.returnBook = (id) => {
    bookService.return(id);
    renderAll();
  };
  window.deleteMember = (id) => {
    const hasBorrowed = bookService.isBorrowedByMember(id);
    const success = memberService.remove(id, hasBorrowed);
    if (!success) {
      alert("Cannot delete member with borrowed books.");
    }
    renderAll();
  };
  window.deleteBook = (id) => {
    bookService.remove(id);
    renderAll();
  };
  function renderMembers() {
    const members = memberService.getAll();
    memberList.innerHTML = "";
    borrowMemberSelect.innerHTML = `<option value="">Select Member</option>`;
    members.forEach((member) => {
      const div = document.createElement("div");
      div.className = "member-item";
      div.innerHTML = `
      <div class="member-info">
        <strong>${member.name}</strong><br />
        <small>${member.email}</small>
      </div>
      <div class="item-actions">
        <button class="delete-btn" onclick="deleteMember(${member.id})"><i class="fas fa-trash"></i></button>
      </div>
    `;
      memberList.appendChild(div);
      const opt = document.createElement("option");
      opt.value = member.id.toString();
      opt.textContent = member.name;
      borrowMemberSelect.appendChild(opt);
    });
  }
  function renderBooks() {
    const books = bookService.getAll();
    const members = memberService.getAll();
    bookList.innerHTML = "";
    borrowBookSelect.innerHTML = `<option value="">Select Book</option>`;
    books.forEach((book) => {
      const borrowedBy = members.find((m) => m.id === book.borrowedBy);
      const div = document.createElement("div");
      div.className = "book-item";
      div.innerHTML = `
      <div class="book-info">
        <strong>${book.title}</strong> by ${book.author}
        <div style="font-size: 0.9em; color: #777;">
          ${borrowedBy ? `<i class="fas fa-user"></i> Borrowed by ${borrowedBy.name}<br />
                 \u{1F4C5} Borrowed: ${book.borrowDate} | Due: ${book.dueDate}` : `<i class="fas fa-check-circle"></i> Available`}
        </div>
      </div>
      <div class="item-actions">
        <button class="delete-btn" onclick="deleteBook(${book.id})"><i class="fas fa-trash"></i></button>
      </div>
    `;
      bookList.appendChild(div);
    });
    bookService.getAvailableBooks().forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.id.toString();
      opt.textContent = b.title;
      borrowBookSelect.appendChild(opt);
    });
  }
  function renderBorrowedBooks() {
    const books = bookService.getBorrowedBooks();
    const members = memberService.getAll();
    borrowedList.innerHTML = "";
    if (books.length === 0) {
      borrowedList.innerHTML = `<div class="no-tasks">No books are currently borrowed.</div>`;
      return;
    }
    books.forEach((book) => {
      const member = members.find((m) => m.id === book.borrowedBy);
      const div = document.createElement("div");
      div.className = "borrow-item";
      div.innerHTML = `
      <div class="borrow-info">
        <strong>${book.title}</strong><br />
        Borrowed by <em>${member?.name}</em><br />
        \u{1F4C5} Borrowed: ${book.borrowDate}<br />
        \u23F3 Due: ${book.dueDate}
      </div>
      <button class="return-btn" onclick="returnBook(${book.id})"><i class="fas fa-undo"></i> Return</button>
    `;
      borrowedList.appendChild(div);
    });
  }
  function renderAll() {
    renderMembers();
    renderBooks();
    renderBorrowedBooks();
  }
  renderAll();
})();
