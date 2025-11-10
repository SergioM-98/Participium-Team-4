import NextAuth, { AuthOptions, User } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/db/db";
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

        return {
          id: user.id.toString(),
          name: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          office: user.office ?? undefined,
        } as User;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: NextAuthJWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.username = user.name as string;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: NextAuthJWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
