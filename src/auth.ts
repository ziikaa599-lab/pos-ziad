import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const username = credentials.username as string;
                const password = credentials.password as string;

                try {
                    const user = await prisma.user.findUnique({ where: { username } });

                    if (!user) return null;

                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.username,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
});
