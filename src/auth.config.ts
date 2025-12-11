import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    trustHost: true, // ⬅️⬅️⬅️ السطر اللي بيحل مشكلة UntrustedHost

    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role;

            const isOnInventory = nextUrl.pathname.startsWith("/inventory");
            const isOnPOS = nextUrl.pathname.startsWith("/pos");
            const isOnLogin = nextUrl.pathname.startsWith("/login");

            if ((isOnInventory || isOnPOS) && !isLoggedIn) {
                return false;
            }

            if (isOnInventory) {
                if (userRole !== "ADMIN") {
                    return Response.redirect(new URL("/pos", nextUrl));
                }
            }

            if (isOnLogin && isLoggedIn) {
                if (userRole === "ADMIN") {
                    return Response.redirect(new URL("/inventory", nextUrl));
                } else {
                    return Response.redirect(new URL("/pos", nextUrl));
                }
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
