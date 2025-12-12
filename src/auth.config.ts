import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    trustHost: true, // ⬅️⬅️⬅️ يحل مشكلة UntrustedHost

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

        signOut: (event) => {
            // نستخدم type assertion لتجنب خطأ TypeScript
            const tokenEvent = event as { token?: { id: string } };
            const sessionEvent = event as { session?: { user?: { id: string } } };

            const userId = tokenEvent.token?.id || sessionEvent.session?.user?.id;
            console.log("User signed out:", userId);
        },
    },

    logger: {
        error(error: Error) {
            console.error("NextAuth Logger Error:", error);
        },
        warn(code: string) {
            console.warn("NextAuth Logger Warn:", code);
        },
        debug(code: string, metadata?: unknown) {
            console.debug("NextAuth Logger Debug:", code, metadata);
        },
    },
} satisfies NextAuthConfig;
