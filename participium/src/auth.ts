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

        const username = credentials.username;
        const password = credentials.password;
        if (!username || !password) return null;

        const user = await prisma.user.findUnique({
          where: { username },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // Return user with isVerified flag so we can check it in signIn callback
        return {
          id: user.id.toString(),
          username: user.username,
          role: user.role,
          isVerified: user.isVerified,
          email: user.email ?? undefined,
          firstName: user.firstName,
          lastName: user.lastName,
          office: user.office ?? undefined,
          companyId: user.companyId ?? undefined,
          telegram: user.telegram ?? undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Check if CITIZEN user is verified
      if (user?.role === "CITIZEN" && user?.isVerified === false) {
        return "/login?error=Verification";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.office = user.office;
        token.companyId = user.companyId;
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
        session.user.companyId = token.companyId as string | undefined;
        session.user.telegram = token.telegram as string | undefined;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
