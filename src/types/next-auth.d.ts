import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      office?: string;
      firstName: string;
      lastName: string;
      telegram?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: string;
    office?: string;
    firstName: string;
    lastName: string;
    telegram?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    office?: string;
    firstName: string;
    lastName: string;
    telegram?: string;
  }
}
