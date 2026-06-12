import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth configuration for the admin area.
 * A single admin account is created by `prisma/seed.ts` from the
 * ADMIN_EMAIL / ADMIN_PASSWORD environment variables.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parolă", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!admin) return null;

        const valid = await compare(credentials.password, admin.passwordHash);
        if (!valid) return null;

        return { id: admin.id, email: admin.email, name: admin.name };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 }, // 12 hours
  pages: { signIn: "/admin/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Guard used by every /api/admin/* route handler.
 * Returns the session when an admin is logged in, otherwise null.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return session;
}
