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

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      // IMPORTANT: This from address MUST be a verified domain on Resend.
      // Using 'onboarding@resend.dev' is for testing only.
      from: "onboarding@resend.dev",
      sendVerificationRequest,
    }),
    GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
})

export { handler as GET, handler as POST } 