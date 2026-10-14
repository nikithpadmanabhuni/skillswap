import type { ReferenceArticle } from '../types';

export class ReferenceDeskService {
  static readonly articles: ReferenceArticle[] = [
    {
      title: 'IEEE Xplore & ScienceDirect Off-Campus Access',
      category: 'Databases & Proxies',
      answer:
        'All registered students and faculty can access IEEE Xplore, JSTOR, ScienceDirect, and ACM Digital Library via the university EZProxy gateway. Use your university credentials or click "Launch Database Gateway" on the Campus Dashboard.',
      keywords: [
        'ieee',
        'jstor',
        'sciencedirect',
        'acm',
        'database',
        'proxy',
        'journal',
        'paper',
        'off-campus'
      ]
    },
    {
      title: 'Course Reserves & Syllabus Textbooks (Fall 2026)',
      category: 'Course Reserves',
      answer:
        'Course reserve materials are organized by department (CSE, AI-DS, ECE, IT, MECH, CIVIL) and semester. Print reserves have a 2-hour in-library checkout limit to ensure access for all students. Digital chapters are readable 24/7 in the app.',
      keywords: ['reserve', 'syllabus', 'cse', 'ece', 'textbook', 'reading', 'professor', 'course']
    },
    {
      title: 'GPU Computing Pods & Silent Carrel Booking',
      category: 'Study Spaces',
      answer:
        'Students and faculty can reserve 4x NVIDIA RTX 4090 GPU deep learning pods (Alan Turing Block) and silent individual study carrels (Central Oval 3rd Floor) with zero fees directly in the Account tab.',
      keywords: ['gpu', 'carrel', 'pod', 'study', 'room', 'booking', 'turing', 'quiet', 'silent']
    },
    {
      title: 'Library Clearance & No-Dues Certificate Generation',
      category: 'Clearance & Graduation',
      answer:
        'Digital No-Dues certificates are generated automatically when all borrowed items are returned and outstanding fines are $0.00. The certificate includes a cryptographically verifiable seal for exam registration and degree issuance.',
      keywords: ['clearance', 'no dues', 'certificate', 'graduation', 'convocation', 'fines', 'seal']
    },
    {
      title: 'Wireless Cloud Printing Quota & Kiosk Release',
      category: 'Printing & Services',
      answer:
        'Each student receives a complimentary $15.00 semester print quota (150 black & white pages). Upload your PDF in the Print Queue modal to receive a 6-digit release code for any high-speed campus library printer kiosk.',
      keywords: ['print', 'kiosk', 'cloud', 'quota', 'pages', 'wireless', 'b&w', 'color']
    },
    {
      title: 'Inter-Library Loan (ILL) & Global Document Delivery',
      category: 'Inter-Library Loan',
      answer:
        'If a book, conference proceeding, or journal is not in our local catalog, submit an ILL request. Our consortium delivers digital PDFs within 24-48 hours from partner repositories (MIT, Stanford, Cambridge, IITs).',
      keywords: ['ill', 'loan', 'partner', 'mit', 'stanford', 'external', 'request', 'article']
    },
    {
      title: 'Plagiarism Checking & Turnitin Similarity Reports',
      category: 'Research Integrity',
      answer:
        'Students submitting research manuscripts, B.Tech capstone theses, or term papers can request an institutional Turnitin similarity report with a 4-hour turnaround at the Digital Reference counter.',
      keywords: ['turnitin', 'plagiarism', 'similarity', 'thesis', 'capstone', 'paper', 'report']
    },
    {
      title: 'LaTeX & Overleaf Campus Institutional License',
      category: 'Software & Tools',
      answer:
        'The University provides premium Overleaf Pro accounts to all enrolled students. Sign in at overleaf.northgate.edu using your single sign-on campus email to unlock real-time Git sync, unlimited collaborators, and official Northgate IEEE/ACM conference templates.',
      keywords: ['overleaf', 'latex', 'license', 'template', 'writing', 'typesetting', 'math']
    }
  ];

  private static readonly stopWords = new Set([
    'the', 'and', 'for', 'are', 'what', 'where', 'how', 'can', 'you', 'with', 'about', 'from', 'this', 'that'
  ]);

  static search(query: string): ReferenceArticle[] {
    if (!query.trim()) return this.articles;
    const q = query.toLowerCase().trim();
    const tokens = q
      .split(/\s+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ''))
      .filter((t) => t.length > 2 && !this.stopWords.has(t));

    if (tokens.length === 0) return this.articles;

    // Score articles by number of token matches in keywords, title, and answer
    const scored = this.articles
      .map((art) => {
        let score = 0;
        const titleLower = art.title.toLowerCase();
        const answerLower = art.answer.toLowerCase();

        for (const tok of tokens) {
          if (art.keywords.some((k) => k.toLowerCase() === tok)) {
            score += 5; // Direct keyword match
          } else if (art.keywords.some((k) => k.toLowerCase().includes(tok))) {
            score += 3;
          }
          if (titleLower.includes(tok)) {
            score += 4;
          }
          if (answerLower.includes(tok)) {
            score += 1;
          }
        }
        return { art, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.length > 0 ? scored.map((s) => s.art) : this.articles;
  }


  static answerQuery(query: string): string {
    const matches = this.search(query);
    if (matches.length > 0) {
      return matches[0].answer;
    }
    return 'Our Reference Librarians are on duty 24/7 at the Central Circulation Desk and Turing Computing Wing. You can search the University Catalog, check Course Reserves, or submit an Inter-Library Loan request for items not held locally.';
  }
}
