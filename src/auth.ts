import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/prisma/db";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  providers: [
    
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Controllo se i dati sono presenti
        const username = credentials.username;
        const password = credentials.password;
        if (!username || !password) return null;

        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          username: user.username,
          role: user.role,
          email: user.email ?? undefined,
          firstName: user.firstName,
          lastName: user.lastName,
          office: user.office ?? undefined,
          telegram: user.telegram ?? undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.office = user.office;
        token.telegram = user.telegram;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.office = token.office as string | undefined;
        session.user.telegram = token.telegram as string | undefined;
      }
      return session;
    },
  },
  
};

export default NextAuth(authOptions);
