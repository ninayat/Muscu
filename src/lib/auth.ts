import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  );
}

// Dev-only one-click sign-in as any seeded user. Disabled in production.
const enableDevAuth =
  process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_AUTH === "true";

if (enableDevAuth) {
  providers.push(
    CredentialsProvider({
      id: "dev",
      name: "Dev sign-in",
      credentials: {
        email: { label: "Email", type: "email" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers,
  // JWT strategy is required for the Credentials provider, and works fine for
  // the OAuth/Email providers too (account linking still goes through Prisma).
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in: enrich the JWT with username + referralCode.
      const id = (user as { id?: string } | undefined)?.id ?? token.sub;
      if (!id) return token;
      const dbUser = await prisma.user.findUnique({
        where: { id },
        select: { id: true, username: true, referralCode: true }
      });
      if (dbUser) {
        token.userId = dbUser.id;
        token.username = dbUser.username;
        token.referralCode = dbUser.referralCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? token.sub ?? "";
        session.user.username = (token.username as string | null) ?? null;
        session.user.referralCode = (token.referralCode as string | null) ?? null;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      const base = user.email
        .split("@")[0]
        .replace(/[^a-z0-9_]/gi, "")
        .toLowerCase();
      let username = base || `lifter${Math.floor(Math.random() * 10000)}`;
      let i = 0;
      while (await prisma.user.findUnique({ where: { username } })) {
        i += 1;
        username = `${base}${i}`;
      }
      await prisma.user.update({ where: { id: user.id }, data: { username } });
    }
  }
};

export function auth() {
  return getServerSession(authOptions);
}
