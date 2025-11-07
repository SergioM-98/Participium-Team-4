import nextAuth from "next-auth";
import Github from "next-auth/providers/github"


export const { handlers, auth, signIn, signOut } = nextAuth({
  providers: [
    Github({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
    }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
    async jwt({ token, user }) {
      // Quando l'utente si logga la prima volta:
      if (user) {
        // Leggi il ruolo dal DB
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { id: true, username: true, role: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});