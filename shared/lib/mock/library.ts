import type {
  Book,
  BorrowRequest,
  CourseReserve,
  LibraryBranch,
  Loan,
  PastExamPaper,
  StudentClearance
} from '../types';

export const BRANCH_COLORS: Record<string, string> = {
  CSE: '#2563EB',
  ECE: '#7C3AED',
  EEE: '#F59E0B',
  MECH: '#EF4444',
  CIVIL: '#10B981',
  IT: '#06B6D4',
  'AI&DS': '#EC4899'
};

export const BRANCH_NAMES: Record<string, string> = {
  CSE: 'Computer Science & Engineering',
  ECE: 'Electronics & Communication',
  EEE: 'Electrical & Electronics',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil & Infrastructure',
  IT: 'Information Technology',
  'AI&DS': 'Artificial Intelligence & Data Science'
};

const initialBooks: Book[] = [
  {
    id: 'book-1',
    title: 'Introduction to Algorithms (CLRS 4th Ed)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    genre: 'CSE',
    format: 'Physical',
    hasEbook: true,
    hasAudio: true,
    isbn: '978-0262046305',
    rating: 4.9,
    reviewsCount: 148,
    pages: 1312,
    publishYear: 2022,
    gradientColors: ['#1E3A8A', '#0F172A'],
    audioDurationMinutes: 720,
    synopsis:
      'The leading textbook in algorithms worldwide. Comprehensive coverage of modern algorithms including graph algorithms, dynamic programming, randomized algorithms, multithreaded algorithms, and distributed algorithms.',
    sampleChapter: `# Chapter 1: The Role of Algorithms in Computing

## 1.1 Algorithms
What are algorithms? Informally, an algorithm is any well-defined computational procedure that takes some value, or set of values, as input and produces some value, or set of values, as output. An algorithm is thus a sequence of computational steps that transform the input into the output.

We can also view an algorithm as a tool for solving a well-specified computational problem. For example, the statement of the problem might specify the desired input/output relationship. The algorithm describes a specific computational procedure for achieving that input/output relationship.

### Sorting Problem
- **Input:** A sequence of n numbers (a1, a2, ..., an).
- **Output:** A permutation (reordering) (a'1, a'2, ..., a'n) of the input sequence such that a'1 <= a'2 <= ... <= a'n.

## 1.2 Algorithms as a Technology
Suppose computers were infinitely fast and computer memory was free. Would you have any reason to study algorithms? The answer is yes, if only because you would still want to demonstrate that your solution method terminates and does so with the correct answer.

In practice, algorithms are a vital technology. Having efficient algorithms can mean the difference between a system responding in milliseconds versus hours.`,
    branches: [
      { name: 'Central Academic Library', total: 6, available: 4, callNumber: 'QA76.6 .C662 2022' },
      { name: 'Turing Tech Wing', total: 4, available: 2, callNumber: 'CS-ALGO-001' }
    ],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Aarav Mehta',
        rating: 5,
        comment: 'Essential reading for CS301. The dynamic programming explanations are gold.',
        date: '2026-08-20'
      },
      {
        id: 'rev-2',
        userName: 'Mei-Ling Chen',
        rating: 5,
        comment: 'Masterpiece reference for interview prep and theoretical foundations.',
        date: '2026-08-28'
      }
    ]
  },
  {
    id: 'book-2',
    title: 'Operating System Concepts (10th Ed)',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    genre: 'CSE',
    format: 'Physical',
    hasEbook: true,
    hasAudio: false,
    isbn: '978-1119456339',
    rating: 4.8,
    reviewsCount: 92,
    pages: 1040,
    publishYear: 2021,
    gradientColors: ['#047857', '#064E3B'],
    synopsis:
      'The classic "Dinosaur book" on operating systems. Delivers foundational understanding of processes, threads, CPU scheduling, synchronization primitives, memory management, virtual memory, file systems, and distributed kernel security.',
    sampleChapter: `# Chapter 1: Introduction

An operating system is software that acts as an intermediary between a user of a computer and the computer hardware. The purpose of an operating system is to provide an environment in which a user can execute programs in a convenient and efficient manner.

## What Operating Systems Do
An OS manages hardware resources: processors, memory, storage devices, and communication networks. It allocates resources fairly and prevents conflicting user demands from deadlocking or corrupting the system state.

### Kernel Mode vs User Mode
To ensure proper execution of the operating system, we must be able to distinguish between the execution of operating system code and user-defined code. Dual-mode operation provides basic protection from errant users or rogue processes.`,
    branches: [
      { name: 'Central Academic Library', total: 5, available: 3, callNumber: 'QA76.76.O63 S558' },
      { name: 'Turing Tech Wing', total: 3, available: 1, callNumber: 'CS-OS-004' }
    ],
    reviews: [
      {
        id: 'rev-3',
        userName: 'Daniel Okonjo',
        rating: 5,
        comment: 'Clear explanations of semaphores and virtual memory page replacement.',
        date: '2026-08-14'
      }
    ]
  },
  {
    id: 'book-3',
    title: 'Deep Learning (Adaptive Computation & ML)',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    genre: 'AI&DS',
    format: 'E-Book',
    hasEbook: true,
    hasAudio: true,
    isbn: '978-0262035613',
    rating: 4.9,
    reviewsCount: 210,
    pages: 800,
    publishYear: 2023,
    gradientColors: ['#831843', '#4C0519'],
    audioDurationMinutes: 640,
    synopsis:
      'Written by three experts in deep learning, the only comprehensive textbook on the subject. Covers applied math, machine learning basics, deep networks, convolutional nets, recurrent networks, autoencoders, and generative models.',
    sampleChapter: `# Chapter 6: Deep Feedforward Networks

Deep feedforward networks, also often called feedforward neural networks, or multilayer perceptrons (MLPs), are the quintessential deep learning models. The goal of a feedforward network is to approximate some function f*.

For example, for a classifier, y = f*(x) maps an input x to a category y. A feedforward network defines a mapping y = f(x; θ) and learns the value of the parameters θ that result in the best function approximation.

These models are called feedforward because information flows through the function being evaluated from x, through the intermediate computations used to define f, and finally to the output y. There are no feedback connections in which outputs of the model are fed back into itself.`,
    branches: [
      { name: 'Turing Tech Wing', total: 8, available: 5, callNumber: 'QA76.87 .G66 2023' },
      { name: 'Central Academic Library', total: 4, available: 2, callNumber: 'AI-DL-002' }
    ],
    reviews: [
      {
        id: 'rev-4',
        userName: 'Sofia Almeida',
        rating: 5,
        comment: 'The definitive textbook for neural networks and optimization loss landscapes.',
        date: '2026-09-01'
      }
    ]
  },
  {
    id: 'book-4',
    title: 'Clean Architecture: A Craftsman’s Guide',
    author: 'Robert C. Martin',
    genre: 'CSE',
    format: 'Audiobook',
    hasEbook: true,
    hasAudio: true,
    isbn: '978-0134494166',
    rating: 4.7,
    reviewsCount: 88,
    pages: 432,
    publishYear: 2020,
    gradientColors: ['#312E81', '#1E1B4B'],
    audioDurationMinutes: 380,
    synopsis:
      'Universal rules of software architecture from Uncle Bob. Learn how to separate concerns, enforce dependency inversion, build testable systems, and shield business logic from database, web, and framework volatility.',
    sampleChapter: `# Chapter 1: What Is Design and Architecture?

There has been much confusion over the years between the terms 'design' and 'architecture.' Are they different?
The answer is simple: There is no difference between them. None at all.

The word 'architecture' is often used in the context of something at a high level that is divorced from the lower-level details, whereas 'design' more often seems to imply structures and decisions at a lower level. But when you look at what a real architect does, the separation dissolves.

The goal of software architecture is to minimize the human resources required to build and maintain the required system.`,
    branches: [
      { name: 'Central Academic Library', total: 4, available: 2, callNumber: 'QA76.758 .M37' },
      { name: 'Turing Tech Wing', total: 3, available: 2, callNumber: 'CS-SE-008' }
    ],
    reviews: [
      {
        id: 'rev-5',
        userName: 'Aarav Mehta',
        rating: 4,
        comment: 'Transformed how I structure modular codebases and decoupling boundaries.',
        date: '2026-07-19'
      }
    ]
  },
  {
    id: 'book-5',
    title: 'Digital Signal Processing: Principles, Algorithms & Applications',
    author: 'John G. Proakis, Dimitris G. Manolakis',
    genre: 'ECE',
    format: 'Physical',
    hasEbook: true,
    hasAudio: false,
    isbn: '978-0131873742',
    rating: 4.6,
    reviewsCount: 64,
    pages: 1088,
    publishYear: 2021,
    gradientColors: ['#581C87', '#3B0764'],
    synopsis:
      'A comprehensive, trade-standard exploration of signals and systems, discrete-time transforms (DFT, FFT, Z-transform), digital filter design (FIR/IIR), adaptive filtering, and real-time DSP microprocessor architectures.',
    sampleChapter: `# Chapter 2: Discrete-Time Signals and Systems

A discrete-time signal x(n) is a function of an independent variable that is an integer. It is statistically important to note that x(n) is not defined for non-integer values of n.

## Elementary Discrete-Time Signals
- **Unit Sample Sequence (Impulse):** δ(n) = 1 for n = 0, 0 otherwise.
- **Unit Step Signal:** u(n) = 1 for n >= 0, 0 otherwise.
- **Unit Ramp Signal:** ur(n) = n for n >= 0, 0 otherwise.`,
    branches: [
      { name: 'Central Academic Library', total: 5, available: 3, callNumber: 'TK5102.9 .P76' },
      { name: 'Engineering Wing', total: 4, available: 4, callNumber: 'ECE-DSP-012' }
    ],
    reviews: []
  },
  {
    id: 'book-6',
    title: 'Electric Machinery Fundamentals (5th Ed)',
    author: 'Stephen J. Chapman',
    genre: 'EEE',
    format: 'Physical',
    hasEbook: true,
    hasAudio: false,
    isbn: '978-0073529547',
    rating: 4.7,
    reviewsCount: 53,
    pages: 720,
    publishYear: 2022,
    gradientColors: ['#78350F', '#451A03'],
    synopsis:
      'The premier textbook for electrical machinery. Emphasizes basic principles of AC and DC motors, transformers, synchronous generators, induction machines, power electronics controllers, and field efficiency.',
    sampleChapter: `# Chapter 1: Introduction to Machinery Principles

Electric machines are devices that can convert mechanical energy to electrical energy or electrical energy to mechanical energy. When such a device is used to convert mechanical energy to electrical energy, it is called a generator. When it converts electrical energy to mechanical energy, it is called a motor.

## Magnetic Fields and Induction
The four basic principles that describe how magnetic fields are used in electric machines are:
1. A current-carrying wire produces a magnetic field in the area around it (Ampere's law).
2. A magnetic field that varies with time induces a voltage in a coil of wire (Faraday's law).
3. A current-carrying wire in the presence of a magnetic field has a force induced upon it.
4. A moving wire in the presence of a magnetic field has a voltage induced upon it.`,
    branches: [
      { name: 'Engineering Wing', total: 6, available: 4, callNumber: 'TK2000 .C47 2022' },
      { name: 'Central Academic Library', total: 3, available: 1, callNumber: 'EEE-EM-005' }
    ],
    reviews: []
  },
  {
    id: 'book-7',
    title: "Shigley's Mechanical Engineering Design",
    author: 'Richard G. Budynas, J. Keith Nisbett',
    genre: 'MECH',
    format: 'Physical',
    hasEbook: true,
    hasAudio: false,
    isbn: '978-0073398204',
    rating: 4.9,
    reviewsCount: 114,
    pages: 1120,
    publishYear: 2023,
    gradientColors: ['#991B1B', '#450A0A'],
    synopsis:
      'The standard in machine design for over 50 years. Blends fundamental concepts with practical design decisions covering stress, strain, failure theories, fatigue, shafts, gears, bearings, fasteners, and finite element modeling.',
    sampleChapter: `# Chapter 5: Failures Resulting from Static Loading

How do machine parts fail? Under static loading, ductile materials fail primarily by yielding, whereas brittle materials fail by fracture.

## Yield Failure Theories
1. **Maximum-Shear-Stress (MSS) Theory (Tresca):** Yielding begins whenever the maximum shear stress in any element exceeds the shear stress in a tension test specimen of the same material when it begins to yield.
2. **Distortion-Energy (DE) Theory (von Mises):** Yielding occurs when the distortion strain energy per unit volume equals that associated with yield in simple tension.`,
    branches: [
      { name: 'Engineering Wing', total: 7, available: 5, callNumber: 'TJ230 .S5 2023' },
      { name: 'Central Academic Library', total: 3, available: 0, callNumber: 'MECH-MD-009' }
    ],
    reviews: []
  },
  {
    id: 'book-8',
    title: 'Design of Reinforced Concrete Structures',
    author: 'Jack C. McCormac, Russell H. Brown',
    genre: 'CIVIL',
    format: 'Physical',
    hasEbook: true,
    hasAudio: false,
    isbn: '978-1118879108',
    rating: 4.8,
    reviewsCount: 47,
    pages: 768,
    publishYear: 2021,
    gradientColors: ['#065F46', '#022C22'],
    synopsis:
      'Essential reference for structural design engineers adhering to ACI 318 building code specifications. Provides rigorous step-by-step methodologies for flexural beams, columns, slab systems, retaining walls, and earthquake resilience.',
    sampleChapter: `# Chapter 1: Introduction to Reinforced Concrete

Concrete is a stone-like material obtained by permitting a carefully proportioned mixture of cement, sand, gravel or other aggregate, and water to harden in forms of the shape and dimensions of the desired structure.

## Strength in Tension vs Compression
Concrete has very high compressive strength, but its tensile strength is only about 10 to 15 percent of its compressive strength. Steel reinforcement rods are placed in tensile zones to resist flexural stresses and control thermal cracking.`,
    branches: [
      { name: 'Engineering Wing', total: 5, available: 3, callNumber: 'TA683.2 .M38' },
      { name: 'Central Academic Library', total: 2, available: 2, callNumber: 'CIVIL-RC-003' }
    ],
    reviews: []
  },
  {
    id: 'book-9',
    title: 'Computer Networking: A Top-Down Approach (8th Ed)',
    author: 'James F. Kurose, Keith W. Ross',
    genre: 'IT',
    format: 'E-Book',
    hasEbook: true,
    hasAudio: true,
    isbn: '978-0136681557',
    rating: 4.9,
    reviewsCount: 165,
    pages: 800,
    publishYear: 2022,
    gradientColors: ['#155E75', '#083344'],
    audioDurationMinutes: 480,
    synopsis:
      'The world-renowned internet architecture textbook starting from the application layer (HTTP/3, DNS, CDN) down to physical links. Explores TCP congestion control, BGP routing, SDN controllers, wireless 5G, and network security.',
    sampleChapter: `# Chapter 1: Computer Networks and the Internet

What is the Internet? We can answer this from two perspectives: the nuts-and-bolts components that make up the Internet, and the network services provided to distributed applications.

## Nuts and Bolts Description
The Internet is a computer network that interconnects billions of computing devices throughout the world: end systems (hosts), communication links (fiber, copper, radio, satellite), and packet switches (routers and link-layer switches).

Packet transmission delay:
d_trans = L / R
where L is packet size in bits and R is transmission rate in bits/sec.`,
    branches: [
      { name: 'Turing Tech Wing', total: 6, available: 4, callNumber: 'TK5105.875.I57 K87' },
      { name: 'Central Academic Library', total: 4, available: 3, callNumber: 'IT-NET-002' }
    ],
    reviews: []
  },
  {
    id: 'book-10',
    title: 'Artificial Intelligence: A Modern Approach (4th Ed)',
    author: 'Stuart Russell, Peter Norvig',
    genre: 'AI&DS',
    format: 'Physical',
    hasEbook: true,
    hasAudio: true,
    isbn: '978-0134610993',
    rating: 5.0,
    reviewsCount: 230,
    pages: 1152,
    publishYear: 2022,
    gradientColors: ['#86198F', '#4A044E'],
    audioDurationMinutes: 840,
    synopsis:
      'The authoritative bible of AI. Covers rational agents, uninformed and informed heuristic search, game playing, constraint satisfaction, probabilistic reasoning, reinforcement learning, NLP, computer vision, and AI safety ethics.',
    sampleChapter: `# Chapter 1: Introduction to Artificial Intelligence

We govern our lives by our intelligence. What is AI?
For thousands of years, we have tried to understand how we think: how a mere handful of matter can perceive, understand, predict, and manipulate a world far larger and more complicated than itself.

The field of artificial intelligence, or AI, goes further still: it attempts not just to understand but also to build intelligent entities.

## Rational Agents
An agent is just something that acts. But computer agents are expected to do more: operate autonomously, perceive their environment, persist over a prolonged time period, adapt to change, and create and pursue goals. A rational agent is one that acts so as to achieve the best outcome or, when there is uncertainty, the best expected outcome.`,
    branches: [
      { name: 'Turing Tech Wing', total: 8, available: 6, callNumber: 'Q335 .R86 2022' },
      { name: 'Central Academic Library', total: 5, available: 3, callNumber: 'AI-AIMA-001' }
    ],
    reviews: []
  }
];

const initialLoans: Loan[] = [
  {
    id: 'loan-1',
    bookId: 'book-1',
    title: 'Introduction to Algorithms (CLRS 4th Ed)',
    author: 'Thomas H. Cormen et al.',
    format: 'Physical',
    borrowDate: '2026-09-28T10:00:00.000Z',
    dueDate: '2026-10-26T17:00:00.000Z',
    renewalsLeft: 2,
    studentRoll: '21CS042',
    studentName: 'Aarav Mehta'
  },
  {
    id: 'loan-2',
    bookId: 'book-4',
    title: 'Clean Architecture: A Craftsman’s Guide',
    author: 'Robert C. Martin',
    format: 'Audiobook',
    borrowDate: '2026-10-02T14:30:00.000Z',
    dueDate: '2026-10-30T17:00:00.000Z',
    renewalsLeft: 1,
    studentRoll: '21CS042',
    studentName: 'Aarav Mehta'
  },
  {
    id: 'loan-3',
    bookId: 'book-2',
    title: 'Operating System Concepts (10th Ed)',
    author: 'Abraham Silberschatz et al.',
    format: 'Physical',
    borrowDate: '2026-09-15T09:00:00.000Z',
    dueDate: '2026-10-13T17:00:00.000Z', // Overdue by 1 day
    renewalsLeft: 0,
    studentRoll: '21CS019',
    studentName: 'Daniel Okonjo'
  }
];

const initialBorrowRequests: BorrowRequest[] = [
  {
    id: 'req-1',
    bookId: 'book-3',
    bookTitle: 'Deep Learning (Adaptive Computation & ML)',
    bookAuthor: 'Ian Goodfellow et al.',
    bookIsbn: '978-0262035613',
    bookBranch: 'AI&DS',
    studentRoll: '21CS042',
    studentName: 'Aarav Mehta',
    studentBranch: 'CSE',
    studentPhone: '+91 98765 43210',
    requestDate: '2026-10-12T08:30:00.000Z',
    status: 'pending'
  },
  {
    id: 'req-2',
    bookId: 'book-9',
    bookTitle: 'Computer Networking: A Top-Down Approach (8th Ed)',
    bookAuthor: 'James F. Kurose & Keith W. Ross',
    bookIsbn: '978-0136681557',
    bookBranch: 'IT',
    studentRoll: '21IT008',
    studentName: 'Priya Raghunathan',
    studentBranch: 'IT',
    studentPhone: '+91 98765 43211',
    requestDate: '2026-10-11T11:20:00.000Z',
    status: 'approved',
    actionDate: '2026-10-12T09:15:00.000Z'
  },
  {
    id: 'req-3',
    bookId: 'book-7',
    bookTitle: "Shigley's Mechanical Engineering Design",
    bookAuthor: 'Richard G. Budynas',
    bookIsbn: '978-0073398204',
    bookBranch: 'MECH',
    studentRoll: '22ME014',
    studentName: 'Ben Carter',
    studentBranch: 'MECH',
    studentPhone: '+91 98765 43214',
    requestDate: '2026-10-09T16:00:00.000Z',
    status: 'rejected',
    actionDate: '2026-10-10T10:00:00.000Z',
    rejectionReason: 'Book currently reserved for ME305 Course Reserves on-shelf.'
  }
];

const initialCourseReserves: CourseReserve[] = [
  {
    courseCode: 'CS301',
    courseTitle: 'Algorithms & Data Structures',
    department: 'CSE',
    instructor: 'Prof. A. Vance',
    semester: 'Semester 3 (Fall 2026)',
    requiredBookId: 'book-1',
    requiredBookTitle: 'Introduction to Algorithms (CLRS 4th Ed)',
    syllabusNotes: 'Chapters 1-16 mandatory for Midterm Exam. Focus on Dynamic Programming & Amortized Analysis.',
    reserveCopiesOnShelf: 6
  },
  {
    courseCode: 'CS304',
    courseTitle: 'Operating Systems Principles',
    department: 'CSE',
    instructor: 'Dr. Sarah Jenkins',
    semester: 'Semester 3 (Fall 2026)',
    requiredBookId: 'book-2',
    requiredBookTitle: 'Operating System Concepts (10th Ed)',
    syllabusNotes: 'Focus on Process Synchronization, Bankers Algorithm for Deadlock, and Paging Architecture.',
    reserveCopiesOnShelf: 4
  },
  {
    courseCode: 'AI402',
    courseTitle: 'Deep Learning & Neural Networks',
    department: 'AI&DS',
    instructor: 'Prof. K. Subramanian',
    semester: 'Semester 5 (Fall 2026)',
    requiredBookId: 'book-3',
    requiredBookTitle: 'Deep Learning (Adaptive Computation & ML)',
    syllabusNotes: 'Primary reference for Convolutional and Transformer models. Lab project in Week 9.',
    reserveCopiesOnShelf: 5
  },
  {
    courseCode: 'EC204',
    courseTitle: 'Signals and Digital Processing',
    department: 'ECE',
    instructor: 'Dr. Michael Chang',
    semester: 'Semester 4 (Fall 2026)',
    requiredBookId: 'book-5',
    requiredBookTitle: 'Digital Signal Processing',
    syllabusNotes: 'Z-transforms and FFT computation labs require Proakis Chapter 3 & 7.',
    reserveCopiesOnShelf: 4
  },
  {
    courseCode: 'ME305',
    courseTitle: 'Machine Design & Failure Analysis',
    department: 'MECH',
    instructor: 'Prof. Rajesh Kulkarni',
    semester: 'Semester 5 (Fall 2026)',
    requiredBookId: 'book-7',
    requiredBookTitle: "Shigley's Mechanical Engineering Design",
    syllabusNotes: 'Non-checkout reference. Desk reserve only for CAD/FEA design project.',
    reserveCopiesOnShelf: 5
  }
];

const initialPastPapers: PastExamPaper[] = [
  {
    id: 'qp-cs301-2025',
    courseCode: 'CS301',
    courseTitle: 'Algorithms & Data Structures',
    department: 'CSE',
    year: 2025,
    term: 'End-Semester',
    instructor: 'Prof. A. Vance',
    downloadUrl: '#',
    hasSolutionKey: true
  },
  {
    id: 'qp-cs301-2024',
    courseCode: 'CS301',
    courseTitle: 'Algorithms & Data Structures',
    department: 'CSE',
    year: 2024,
    term: 'End-Semester',
    instructor: 'Prof. A. Vance',
    downloadUrl: '#',
    hasSolutionKey: true
  },
  {
    id: 'qp-ai402-2025',
    courseCode: 'AI402',
    courseTitle: 'Deep Learning & Neural Networks',
    department: 'AI&DS',
    year: 2025,
    term: 'Mid-Term',
    instructor: 'Prof. K. Subramanian',
    downloadUrl: '#',
    hasSolutionKey: true
  },
  {
    id: 'qp-ec204-2024',
    courseCode: 'EC204',
    courseTitle: 'Signals and Digital Processing',
    department: 'ECE',
    year: 2024,
    term: 'End-Semester',
    instructor: 'Dr. Michael Chang',
    downloadUrl: '#',
    hasSolutionKey: false
  },
  {
    id: 'qp-me305-2025',
    courseCode: 'ME305',
    courseTitle: 'Machine Design & Failure Analysis',
    department: 'MECH',
    year: 2025,
    term: 'End-Semester',
    instructor: 'Prof. Rajesh Kulkarni',
    downloadUrl: '#',
    hasSolutionKey: true
  }
];

// In-memory state store
class LibraryStore {
  private books: Book[] = [...initialBooks];
  private loans: Loan[] = [...initialLoans];
  private borrowRequests: BorrowRequest[] = [...initialBorrowRequests];
  private courseReserves: CourseReserve[] = [...initialCourseReserves];
  private pastPapers: PastExamPaper[] = [...initialPastPapers];

  // Books
  getBooks(): Book[] {
    return [...this.books];
  }

  getBook(id: string): Book | undefined {
    return this.books.find((b) => b.id === id);
  }

  saveBook(bookData: Omit<Book, 'id'> & { id?: string }): Book {
    if (bookData.id) {
      const idx = this.books.findIndex((b) => b.id === bookData.id);
      if (idx !== -1) {
        this.books[idx] = { ...this.books[idx], ...bookData } as Book;
        return this.books[idx];
      }
    }
    const newBook: Book = {
      ...bookData,
      id: bookData.id || `book-${Date.now()}`,
      reviews: bookData.reviews || []
    };
    this.books.unshift(newBook);
    return newBook;
  }

  deleteBook(id: string): boolean {
    const prevLen = this.books.length;
    this.books = this.books.filter((b) => b.id !== id);
    return this.books.length < prevLen;
  }

  // Loans
  getAllLoans(): Loan[] {
    return [...this.loans];
  }

  getMyLoans(roll: string): Loan[] {
    return this.loans.filter((l) => l.studentRoll.toLowerCase() === roll.toLowerCase());
  }

  renewLoan(loanId: string): { success: boolean; message: string; newDueDate?: string } {
    const loan = this.loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, message: 'Loan not found.' };
    if (loan.renewalsLeft <= 0) {
      return { success: false, message: 'Maximum renewals reached (2/2) for this item.' };
    }
    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + 14);
    loan.dueDate = currentDue.toISOString();
    loan.renewalsLeft -= 1;
    return {
      success: true,
      message: 'Item renewed successfully for +14 days.',
      newDueDate: loan.dueDate
    };
  }

  returnLoan(loanId: string): { success: boolean; message: string } {
    const idx = this.loans.findIndex((l) => l.id === loanId);
    if (idx === -1) return { success: false, message: 'Loan record not found.' };
    const loan = this.loans[idx];
    // Return copy to available pool
    const book = this.books.find((b) => b.id === loan.bookId);
    if (book && book.branches.length > 0) {
      book.branches[0].available = Math.min(book.branches[0].total, book.branches[0].available + 1);
    }
    this.loans.splice(idx, 1);
    return { success: true, message: `"${loan.title}" has been checked in.` };
  }

  // Borrow Requests
  getBorrowRequests(): BorrowRequest[] {
    return [...this.borrowRequests];
  }

  getMyBorrowRequests(roll: string): BorrowRequest[] {
    return this.borrowRequests.filter((r) => r.studentRoll.toLowerCase() === roll.toLowerCase());
  }

  submitBorrowRequest(
    data: Omit<BorrowRequest, 'id' | 'requestDate' | 'status'>
  ): BorrowRequest {
    const newReq: BorrowRequest = {
      ...data,
      id: `req-${Date.now()}`,
      requestDate: new Date().toISOString(),
      status: 'pending'
    };
    this.borrowRequests.unshift(newReq);
    return newReq;
  }

  approveBorrowRequest(
    reqId: string
  ): { success: boolean; message: string; newLoan?: Loan } {
    const req = this.borrowRequests.find((r) => r.id === reqId);
    if (!req) return { success: false, message: 'Borrow request not found.' };
    if (req.status !== 'pending') {
      return { success: false, message: `Request is already ${req.status}.` };
    }

    const book = this.books.find((b) => b.id === req.bookId);
    if (!book) return { success: false, message: 'Associated book not found in catalog.' };

    // Check availability
    const availableBranch = book.branches.find((b) => b.available > 0);
    if (!availableBranch) {
      return {
        success: false,
        message: 'No physical copies currently available on shelf to issue.'
      };
    }

    availableBranch.available -= 1;
    req.status = 'approved';
    req.actionDate = new Date().toISOString();

    const due = new Date();
    due.setDate(due.getDate() + 21);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      format: book.format,
      borrowDate: new Date().toISOString(),
      dueDate: due.toISOString(),
      renewalsLeft: 2,
      studentRoll: req.studentRoll,
      studentName: req.studentName
    };
    this.loans.unshift(newLoan);

    return {
      success: true,
      message: `Borrow request approved! Issued to ${req.studentName} (${req.studentRoll}).`,
      newLoan
    };
  }

  rejectBorrowRequest(reqId: string, reason = 'Not eligible or item on reserve'): {
    success: boolean;
    message: string;
  } {
    const req = this.borrowRequests.find((r) => r.id === reqId);
    if (!req) return { success: false, message: 'Request not found.' };
    req.status = 'rejected';
    req.actionDate = new Date().toISOString();
    req.rejectionReason = reason;
    return { success: true, message: 'Borrow request marked as rejected.' };
  }

  issueBookDirect(
    bookId: string,
    studentRoll: string,
    studentName: string
  ): { success: boolean; message: string; newLoan?: Loan } {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Book not found.' };
    const branchCopy = book.branches.find((b) => b.available > 0);
    if (!branchCopy) {
      return { success: false, message: 'No available copies for this title on shelf.' };
    }
    branchCopy.available -= 1;

    const due = new Date();
    due.setDate(due.getDate() + 21);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      format: book.format,
      borrowDate: new Date().toISOString(),
      dueDate: due.toISOString(),
      renewalsLeft: 2,
      studentRoll,
      studentName
    };
    this.loans.unshift(newLoan);

    return {
      success: true,
      message: `Issued "${book.title}" to ${studentName} (${studentRoll}).`,
      newLoan
    };
  }

  // Course Reserves & Past Papers
  getCourseReserves(): CourseReserve[] {
    return [...this.courseReserves];
  }

  getPastPapers(): PastExamPaper[] {
    return [...this.pastPapers];
  }

  // Clearance status
  getStudentClearance(roll: string, name: string, dept: string): StudentClearance {
    const myLoans = this.getMyLoans(roll);
    const now = new Date();
    let overdueCount = 0;
    for (const l of myLoans) {
      if (new Date(l.dueDate) < now) overdueCount += 1;
    }
    const fines = overdueCount * 5; // $5 per overdue book fine

    const isCleared = myLoans.length === 0 && fines === 0;

    return {
      studentRoll: roll,
      studentName: name,
      department: dept,
      activeLoansCount: myLoans.length,
      outstandingFines: fines,
      isCleared,
      clearanceReferenceId: `NG-LIB-CLR-${roll.toUpperCase()}-${new Date().getFullYear()}`,
      issuedAt: new Date().toISOString(),
      verifiedBy: 'Dr. Evelyn Reed (Chief University Librarian)'
    };
  }

  // Stats
  getLibraryStats() {
    const totalTitles = this.books.length;
    let totalCopies = 0;
    let availableCopies = 0;
    const branchCounts: Record<string, number> = {};

    for (const b of this.books) {
      branchCounts[b.genre] = (branchCounts[b.genre] || 0) + 1;
      for (const br of b.branches) {
        totalCopies += br.total;
        availableCopies += br.available;
      }
    }

    const activeLoans = this.loans.length;
    const pendingRequests = this.borrowRequests.filter((r) => r.status === 'pending').length;
    const now = new Date();
    const overdueLoans = this.loans.filter((l) => new Date(l.dueDate) < now).length;

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      activeLoans,
      overdueLoans,
      pendingRequests,
      branchCounts
    };
  }
}

export const libraryStore = new LibraryStore();
