export type LibraryBranch = 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'IT' | 'AI&DS';

export interface BranchCopy {
  name: string;
  total: number;
  available: number;
  callNumber: string;
}

export interface BookReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: LibraryBranch | string;
  format: 'Physical' | 'E-Book' | 'Audiobook';
  hasEbook: boolean;
  hasAudio: boolean;
  isbn: string;
  rating: number;
  reviewsCount: number;
  pages: number;
  publishYear: number;
  gradientColors: [string, string];
  synopsis: string;
  sampleChapter: string;
  audioDurationMinutes?: number;
  branches: BranchCopy[];
  reviews: BookReview[];
}

export interface Loan {
  id: string;
  bookId: string;
  title: string;
  author: string;
  format: 'Physical' | 'E-Book' | 'Audiobook';
  borrowDate: string;
  dueDate: string;
  renewalsLeft: number;
  studentRoll: string;
  studentName: string;
}

export interface BorrowRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  bookBranch: string;
  studentRoll: string;
  studentName: string;
  studentBranch: string;
  studentPhone: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  actionDate?: string;
  rejectionReason?: string;
}

export interface CourseReserve {
  courseCode: string;
  courseTitle: string;
  department: LibraryBranch | string;
  instructor: string;
  semester: string;
  requiredBookId: string;
  requiredBookTitle: string;
  syllabusNotes: string;
  reserveCopiesOnShelf: number;
}

export interface PastExamPaper {
  id: string;
  courseCode: string;
  courseTitle: string;
  department: LibraryBranch | string;
  year: number;
  term: 'Fall' | 'Spring' | 'Mid-Term' | 'End-Semester';
  instructor: string;
  downloadUrl: string;
  hasSolutionKey: boolean;
}

export type CitationStyle = 'ieee' | 'apa' | 'bibtex' | 'acm' | 'mla' | 'chicago';

export interface ReferenceArticle {
  title: string;
  category: string;
  answer: string;
  keywords: string[];
}

export interface StudentClearance {
  studentRoll: string;
  studentName: string;
  department: string;
  activeLoansCount: number;
  outstandingFines: number;
  isCleared: boolean;
  clearanceReferenceId: string;
  issuedAt: string;
  verifiedBy: string;
}
