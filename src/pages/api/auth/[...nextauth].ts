import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import { JWT } from "next-auth/jwt";

interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    token?: string | JWT;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.A0_CLIENT_ID!,
      clientSecret: process.env.A0_CLIENT_SECRET!,
      issuer: process.env.A0_ISSUER_BASE_URL!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // When the user first logs in, attach any user info to the token
        token = {
          ...token,
          sub: user.id, // Attach the user ID from the Auth0 profile
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Attach the token to the user object in session
      const customSession: CustomSession = {
        ...session,
        user: {
          ...session.user,
          token, // Attach the token
        },
      };
      return customSession;
    },
  },
};

export default NextAuth(authOptions);
