import { Member } from "../models/Member";

export class MemberService {
  private members: Member[] = [];
  private idCounter = 1;

  add(name: string, email: string): Member {
    const member = new Member(this.idCounter++, name, email);
    this.members.push(member);
    return member;
  }

  getAll(): Member[] {
    return this.members;
  }

  get(id: number): Member | undefined {
    return this.members.find(m => m.id === id);
  }

  remove(id: number, hasBorrowedBooks: boolean): boolean {
    if (hasBorrowedBooks) return false;
    this.members = this.members.filter(m => m.id !== id);
    return true;
  }
}
