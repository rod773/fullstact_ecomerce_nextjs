import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";

export const config: NextAuthConfig = {
  // signIn and error will be handled by the custom sign-in page with the name sign-in
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  // session strategy is jwt, maxAge is 30 days
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  // adapter is the database adapter, we use prisma
  adapter: PrismaAdapter(prisma),
  // providers is the authentication providers, we use credentials provider
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      // authorize take in credentials from form-inputs and return a user object or null
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists and if the password matches with what the user has entered and what is in the database
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          // if password matches, return the user object
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // if user does not exist or password does not match, return null
        return null;
      },
    }),
  ],
  callbacks: {
    // TODO: fix this any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user, trigger, token }: any) {
      // Set the user ID from the token
      session.user.id = token.sub;

      // if there is an update, set the user name
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
