import NextAuth, { AuthOptions, User } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";
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
      async authorize(credentials): Promise<User | null> {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        const userResult = {
          id: user.id.toString(),
          username: user.username,
          role: user.role,
          email: user.email ?? undefined,
          firstName: user.firstName,
          lastName: user.lastName,
          office: user.office ?? undefined,
          telegram: user.telegram ?? undefined,
        } as User;
        return userResult;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: NextAuthJWT; user?: User }) {
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
    async session({ session, token }: { session: any; token: NextAuthJWT }) {
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
