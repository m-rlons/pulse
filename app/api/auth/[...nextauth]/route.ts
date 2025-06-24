import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import GitHub from "next-auth/providers/github"

if (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET) {
  throw new Error("Missing GitHub OAuth environment variables");
}

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
}) 