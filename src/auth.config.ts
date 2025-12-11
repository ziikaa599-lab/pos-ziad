import type { NextAuthConfig } from "next-auth";

export const authConfig = {
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

            // Redirect unauthenticated users to login
            if ((isOnInventory || isOnPOS) && !isLoggedIn) {
                return false;
            }

            // RBAC Logic
            if (isOnInventory) {
                // Only Admin can access inventory
                if (userRole !== "ADMIN") {
                    return Response.redirect(new URL("/pos", nextUrl)); // Cashiers go to POS
                }
            }

            // Redirect logged-in users away from login page
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
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
