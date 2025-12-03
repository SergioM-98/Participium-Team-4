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

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        if(!user.isVerified && user.role == "CITIZEN"){
          // NextAuth will redirect with error query
          throw new Error("The user is not verified");
        }

        const userResult = {
          id: user.id.toString(),
          username: user.username,
          role: user.role,
          email: user.email ?? undefined
        } as User;
        return userResult;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // pagina custom per il form di login
    error: "/login",  // anche gli error lanciati vanno alla stessa pagina (riceverai ?error=...)
  },
  callbacks: {
    async jwt({ token, user }: { token: NextAuthJWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: NextAuthJWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
