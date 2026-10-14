import type { Book, CitationStyle } from '../types';

export class CitationService {
  static formatCitation(book: Book, style: CitationStyle): string {
    const author = book.author;
    const title = book.title;
    const year = book.publishYear;
    const isbn = book.isbn;
    const pages = book.pages;
    const publisher = 'Apex Academic Press';

    switch (style) {
      case 'ieee':
        return `${author}, "${title}," ${publisher}, ${year}, pp. 1-${pages}, ISBN: ${isbn}.`;

      case 'apa':
        return `${author} (${year}). ${title}. ${publisher}. https://doi.org/10.1145/apex.${book.id}`;

      case 'bibtex': {
        const firstAuthorWord = author.split(' ')[0]?.toLowerCase() || 'ref';
        const firstTitleWord = title.split(' ')[0]?.toLowerCase() || 'book';
        const citeKey = `${firstAuthorWord}${year}${firstTitleWord}`;
        return `@book{${citeKey},
  author    = {${author}},
  title     = {${title}},
  publisher = {${publisher}},
  year      = {${year}},
  isbn      = {${isbn}},
  pages     = {${pages}}
}`;
      }

      case 'acm':
        return `${author}. ${year}. ${title}. ${publisher}. ISBN:${isbn}.`;

      case 'mla':
        return `${author}. ${title}. ${publisher}, ${year}.`;

      case 'chicago':
        return `${author}. ${year}. ${title}. Cambridge: ${publisher}.`;
    }
  }

  static getStyleName(style: CitationStyle): string {
    switch (style) {
      case 'ieee':
        return 'IEEE';
      case 'apa':
        return 'APA 7th';
      case 'bibtex':
        return 'BibTeX';
      case 'acm':
        return 'ACM';
      case 'mla':
        return 'MLA 9th';
      case 'chicago':
        return 'Chicago';
    }
  }
}
