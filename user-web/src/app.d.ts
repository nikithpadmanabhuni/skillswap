declare global {
  namespace App {
    interface Locals {
      user?: import('$shared/types').User | null;
      decodedIdToken?: import('firebase-admin/auth').DecodedIdToken | null;
    }
    interface PageData {
      user?: import('$shared/types').User | null;
    }
  }
}

export {};
