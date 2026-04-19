import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers,
  session: { strategy: "database" },
  pages: { signIn: "/signin" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true, referralCode: true }
        });
        session.user.username = dbUser?.username ?? null;
        session.user.referralCode = dbUser?.referralCode ?? null;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      // Generate username from email if missing
      if (!user.email) return;
      const base = user.email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase();
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
