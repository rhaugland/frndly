import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      tenantId: "common",
      authorization: {
        params: {
          scope: "openid email profile Calendars.Read offline_access",
        },
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After sign-in, always go to dashboard
      if (url.includes("/login") || url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!account) return;

      const provider =
        account.provider === "google" ? "google" : "microsoft";

      if (account.access_token && account.refresh_token) {
        await prisma.calendarConnection.upsert({
          where: { userId: user.id! },
          create: {
            userId: user.id!,
            provider,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpiresAt: account.expires_at
              ? new Date(account.expires_at * 1000)
              : new Date(Date.now() + 3600000),
          },
          update: {
            provider,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpiresAt: account.expires_at
              ? new Date(account.expires_at * 1000)
              : new Date(Date.now() + 3600000),
          },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
};
