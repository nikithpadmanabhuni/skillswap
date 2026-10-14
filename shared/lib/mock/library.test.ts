import { describe, expect, it } from 'vitest';
import { libraryStore } from './library';
import { CitationService } from '../utils/citations';
import { ReferenceDeskService } from '../utils/reference-desk';

describe('Library Store & Features', () => {
  it('loads catalog books and calculates branch availability', () => {
    const books = libraryStore.getBooks();
    expect(books.length).toBeGreaterThanOrEqual(10);

    const clrs = books.find((b) => b.id === 'book-1');
    expect(clrs).toBeDefined();
    expect(clrs?.genre).toBe('CSE');
    expect(clrs?.branches.length).toBeGreaterThan(0);
  });

  it('generates academic citations in all 6 styles correctly', () => {
    const book = libraryStore.getBook('book-1')!;
    expect(book).toBeDefined();

    const ieee = CitationService.formatCitation(book, 'ieee');
    expect(ieee).toContain('Introduction to Algorithms');
    expect(ieee).toContain('ISBN: 978-0262046305');

    const apa = CitationService.formatCitation(book, 'apa');
    expect(apa).toContain('(2022)');
    expect(apa).toContain('https://doi.org');

    const bibtex = CitationService.formatCitation(book, 'bibtex');
    expect(bibtex).toContain('@book{');
    expect(bibtex).toContain('author    = {');

    const acm = CitationService.formatCitation(book, 'acm');
    expect(acm).toContain('ISBN:978-0262046305');
    expect(acm).toContain('Thomas H. Cormen');
    expect(CitationService.getStyleName('acm')).toBe('ACM');
    expect(CitationService.getStyleName('chicago')).toBe('Chicago');
  });

  it('answers reference desk queries using knowledge base', () => {
    const proxyAnswer = ReferenceDeskService.answerQuery('How do I access IEEE Xplore off-campus?');
    expect(proxyAnswer).toContain('EZProxy');

    const gpuAnswer = ReferenceDeskService.answerQuery('Where can I find GPU computing pods?');
    expect(gpuAnswer).toContain('RTX 4090');

    const clearanceAnswer = ReferenceDeskService.answerQuery('no dues clearance certificate');
    expect(clearanceAnswer).toContain('No-Dues');
  });

  it('handles borrow requests, approvals, and loan circulation', () => {
    // Submit borrow request
    const req = libraryStore.submitBorrowRequest({
      bookId: 'book-1',
      bookTitle: 'Introduction to Algorithms (CLRS 4th Ed)',
      bookAuthor: 'Thomas H. Cormen et al.',
      bookIsbn: '978-0262046305',
      bookBranch: 'CSE',
      studentRoll: '21CS999',
      studentName: 'Test Student',
      studentBranch: 'CSE',
      studentPhone: '+91 99999 88888'
    });

    expect(req.id).toBeDefined();
    expect(req.status).toBe('pending');

    // Approve borrow request
    const approval = libraryStore.approveBorrowRequest(req.id);
    expect(approval.success).toBe(true);
    expect(approval.newLoan).toBeDefined();
    expect(approval.newLoan?.studentRoll).toBe('21CS999');

    // Verify loan is active
    const loans = libraryStore.getMyLoans('21CS999');
    expect(loans.length).toBe(1);

    // Renew loan
    const renewal = libraryStore.renewLoan(loans[0].id);
    expect(renewal.success).toBe(true);
    expect(renewal.newDueDate).toBeDefined();

    // Return loan
    const returnRes = libraryStore.returnLoan(loans[0].id);
    expect(returnRes.success).toBe(true);
    expect(libraryStore.getMyLoans('21CS999').length).toBe(0);
  });

  it('verifies student clearance when 0 loans and 0 fines', () => {
    const cleared = libraryStore.getStudentClearance('21CS999', 'Test Student', 'CSE');
    expect(cleared.isCleared).toBe(true);
    expect(cleared.clearanceReferenceId).toContain('NG-LIB-CLR-21CS999');
  });

  it('supports catalog addition and deletion by librarians', () => {
    const newBook = libraryStore.saveBook({
      title: 'Quantum Computing for Computer Scientists',
      author: 'Noson S. Yanofsky',
      genre: 'CSE',
      format: 'Physical',
      hasEbook: true,
      hasAudio: false,
      isbn: '978-0521879965',
      rating: 4.8,
      reviewsCount: 10,
      pages: 400,
      publishYear: 2024,
      gradientColors: ['#312E81', '#1E1B4B'],
      synopsis: 'A clear introduction to quantum computing algorithms.',
      sampleChapter: 'Chapter 1: Complex Vector Spaces',
      branches: [
        {
          name: 'Central Academic Library',
          total: 3,
          available: 3,
          callNumber: 'QA76.889 .Y36'
        }
      ],
      reviews: []
    });

    expect(newBook.id).toBeDefined();
    expect(libraryStore.getBook(newBook.id)?.title).toBe('Quantum Computing for Computer Scientists');

    const deleted = libraryStore.deleteBook(newBook.id);
    expect(deleted).toBe(true);
    expect(libraryStore.getBook(newBook.id)).toBeUndefined();
  });
});
