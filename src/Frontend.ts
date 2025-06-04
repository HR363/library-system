import { MemberService } from "./services/MemberService";
import { BookService } from "./services/BookService";
import { Member } from "./models/Member";
import { Book } from "./models/Book";

const memberService = new MemberService();
const bookService = new BookService();

const memberForm = document.getElementById("memberForm") as HTMLFormElement;
const bookForm = document.getElementById("bookForm") as HTMLFormElement;
const borrowForm = document.getElementById("borrowForm") as HTMLFormElement;

const memberList = document.getElementById("memberList")!;
const bookList = document.getElementById("bookList")!;
const borrowMemberSelect = document.getElementById("borrowMember") as HTMLSelectElement;
const borrowBookSelect = document.getElementById("borrowBook") as HTMLSelectElement;
const borrowedList = document.getElementById("borrowedList")!;

// Add Member
memberForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = (document.getElementById("memberName") as HTMLInputElement).value.trim();
  const email = (document.getElementById("memberEmail") as HTMLInputElement).value.trim();
  if (name && email) {
    memberService.add(name, email);
    memberForm.reset();
    renderAll();
  }
});

// Add Book
bookForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = (document.getElementById("bookTitle") as HTMLInputElement).value.trim();
  const author = (document.getElementById("bookAuthor") as HTMLInputElement).value.trim();
  if (title && author) {
    bookService.add(title, author);
    bookForm.reset();
    renderAll();
  }
});

// Borrow Book
borrowForm.addEventListener("submit", e => {
  e.preventDefault();
  const memberId = parseInt(borrowMemberSelect.value);
  const bookId = parseInt(borrowBookSelect.value);
  if (!isNaN(memberId) && !isNaN(bookId)) {
    bookService.borrow(bookId, memberId);
    renderAll();
  }
});

// Return Book
(window as any).returnBook = (id: number) => {
  bookService.return(id);
  renderAll();
};

// Delete Member
(window as any).deleteMember = (id: number) => {
  const hasBorrowed = bookService.isBorrowedByMember(id);
  const success = memberService.remove(id, hasBorrowed);
  if (!success) {
    alert("Cannot delete member with borrowed books.");
  }
  renderAll();
};

// Delete Book
(window as any).deleteBook = (id: number) => {
  bookService.remove(id);
  renderAll();
};

// Render Members
function renderMembers() {
  const members = memberService.getAll();
  memberList.innerHTML = "";
  borrowMemberSelect.innerHTML = `<option value="">Select Member</option>`;

  members.forEach(member => {
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

// Render Books
function renderBooks() {
  const books = bookService.getAll();
  const members = memberService.getAll();
  bookList.innerHTML = "";
  borrowBookSelect.innerHTML = `<option value="">Select Book</option>`;

  books.forEach(book => {
    const borrowedBy = members.find(m => m.id === book.borrowedBy);
    const div = document.createElement("div");
    div.className = "book-item";
    div.innerHTML = `
      <div class="book-info">
        <strong>${book.title}</strong> by ${book.author}
        <div style="font-size: 0.9em; color: #777;">
          ${
            borrowedBy
              ? `<i class="fas fa-user"></i> Borrowed by ${borrowedBy.name}<br />
                 📅 Borrowed: ${book.borrowDate} | Due: ${book.dueDate}`
              : `<i class="fas fa-check-circle"></i> Available`
          }
        </div>
      </div>
      <div class="item-actions">
        <button class="delete-btn" onclick="deleteBook(${book.id})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    bookList.appendChild(div);
  });

  bookService.getAvailableBooks().forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id.toString();
    opt.textContent = b.title;
    borrowBookSelect.appendChild(opt);
  });
}

// Render Borrowed Books Section
function renderBorrowedBooks() {
  const books = bookService.getBorrowedBooks();
  const members = memberService.getAll();
  borrowedList.innerHTML = "";

  if (books.length === 0) {
    borrowedList.innerHTML = `<div class="no-tasks">No books are currently borrowed.</div>`;
    return;
  }

  books.forEach(book => {
    const member = members.find(m => m.id === book.borrowedBy);
    const div = document.createElement("div");
    div.className = "borrow-item";
    div.innerHTML = `
      <div class="borrow-info">
        <strong>${book.title}</strong><br />
        Borrowed by <em>${member?.name}</em><br />
        📅 Borrowed: ${book.borrowDate}<br />
        ⏳ Due: ${book.dueDate}
      </div>
      <button class="return-btn" onclick="returnBook(${book.id})"><i class="fas fa-undo"></i> Return</button>
    `;
    borrowedList.appendChild(div);
  });
}

// Master Render
function renderAll() {
  renderMembers();
  renderBooks();
  renderBorrowedBooks();
}

renderAll();
