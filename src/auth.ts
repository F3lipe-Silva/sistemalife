import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "next-auth";

// Ensure NEXTAUTH_SECRET is set
if (!process.env.NEXTAUTH_SECRET) {
  console.error("Missing NEXTAUTH_SECRET environment variable");
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
     CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        // This is where you would add your own logic to validate credentials
        // For this demo, we'll just return a mock user if credentials are provided
        if (credentials?.email && credentials?.password) {
            return { id: "1", name: "Demo User", email: credentials.email as string };
        }
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // Add debug logging in development
  debug: process.env.NODE_ENV === "development",
});
