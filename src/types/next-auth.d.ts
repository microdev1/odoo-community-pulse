import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
      isVerifiedOrganizer: boolean;
    };
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isVerifiedOrganizer: boolean;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extending the built-in JWT type
   */
  interface JWT {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isVerifiedOrganizer: boolean;
  }
}
