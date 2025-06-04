export class Book {
  constructor(
    public id: number,
    public title: string,
    public author: string,
    public borrowedBy: number | null = null,
    public borrowDate: string | null = null,
    public dueDate: string | null = null
  ) {}
}
