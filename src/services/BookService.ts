import { Book } from "../models/Book";

export class BookService {
  private books: Book[] = [];
  private idCounter = 1;

  add(title: string, author: string): Book {
    const book = new Book(this.idCounter++, title, author);
    this.books.push(book);
    return book;
  }

  getAll(): Book[] {
    return this.books;
  }

  get(id: number): Book | undefined {
    return this.books.find(b => b.id === id);
  }

  borrow(bookId: number, memberId: number): boolean {
    const book = this.get(bookId);
    if (book && book.borrowedBy === null) {
      const now = new Date();
      const due = new Date(now);
      due.setDate(now.getDate() + 14); // 2 weeks later

      book.borrowedBy = memberId;
      book.borrowDate = now.toISOString().split("T")[0];
      book.dueDate = due.toISOString().split("T")[0];
      return true;
    }
    return false;
  }

  return(bookId: number): boolean {
    const book = this.get(bookId);
    if (book && book.borrowedBy !== null) {
      book.borrowedBy = null;
      book.borrowDate = null;
      book.dueDate = null;
      return true;
    }
    return false;
  }

  remove(bookId: number): void {
    this.books = this.books.filter(b => b.id !== bookId);
  }

  getAvailableBooks(): Book[] {
    return this.books.filter(b => b.borrowedBy === null);
  }

  getBorrowedBooks(): Book[] {
    return this.books.filter(b => b.borrowedBy !== null);
  }

  isBorrowedByMember(memberId: number): boolean {
    return this.books.some(b => b.borrowedBy === memberId);
  }
}
