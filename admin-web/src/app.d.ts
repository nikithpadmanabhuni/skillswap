declare global {
  namespace App {
    interface PageData {
      user?: import('$shared/types').User | null;
    }
  }
}

export {};
