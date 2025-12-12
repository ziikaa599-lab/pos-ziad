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
                console.warn(`Unauthorized access attempt to ${nextUrl.pathname}`);
                return false;
            }

            if (isOnInventory && userRole !== "ADMIN") {
                console.warn(`User with role ${userRole} tried to access /inventory`);
                return Response.redirect(new URL("/pos", nextUrl));
            }

            if (isOnLogin && isLoggedIn) {
                console.log(`User already logged in. Redirecting based on role ${userRole}`);
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
                console.log("JWT updated for user:", user.id, "role:", (user as any).role);
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                console.log("Session updated for user:", token.id, "role:", token.role);
            }
            return session;
        },
    },
    providers: [],
    events: {
        signIn: ({ user, account }) => {
            console.log("User signed in:", user.id, "with account:", account?.provider);
        },
        signOut: ({ token }) => {
            console.log("User signed out:", token?.id);
        },
        error: ({ error }) => {
            console.error("NextAuth error:", error);
        },
    },
    logger: {
        error(code, metadata) {
            console.error("NextAuth Logger Error:", code, metadata);
        },
        warn(code) {
            console.warn("NextAuth Logger Warn:", code);
        },
        debug(code, metadata) {
            console.debug("NextAuth Logger Debug:", code, metadata);
        },
    },
} satisfies NextAuthConfig;
