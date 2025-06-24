import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import GitHub from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import { sendVerificationRequest } from "@/lib/send-verification-request"

if (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET) {
  throw new Error("Missing GitHub OAuth environment variables");
}

if (!process.env.AUTH_RESEND_KEY) {
  throw new Error("Missing Resend API Key environment variable");
}

if (!process.env.EMAIL_FROM) {
    throw new Error("Missing EMAIL_FROM environment variable");
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
    GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
})

export { handler as GET, handler as POST } 