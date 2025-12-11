import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { auth } from "@/auth";
import { SignOutButton } from "./sign-out-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ziad POS System | Modern Retail Point of Sale",
  description:
    "Inventory management, POS, and instant invoices for retail operations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  Ziad POS System
                </p>
                <h1 className="text-2xl font-bold text-slate-900">
                  Retail Command Center
                </h1>
                <p className="text-sm text-slate-600">
                  Manage inventory, process sales, and print invoices faster.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <nav className="flex flex-wrap gap-2 text-sm font-medium">
                  {userRole === "ADMIN" && (
                    <Link
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      href="/"
                    >
                      Overview
                    </Link>
                  )}
                  {userRole === "ADMIN" && (
                    <Link
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      href="/inventory"
                    >
                      Inventory
                    </Link>
                  )}
                  {(userRole === "ADMIN" || userRole === "CASHIER") && (
                    <Link
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      href="/pos"
                    >
                      POS
                    </Link>
                  )}
                  {userRole === "ADMIN" && (
                    <Link
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      href="/users"
                    >
                      Users
                    </Link>
                  )}
                </nav>
                {session && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600">
                      Welcome, <strong>{session.user?.name || session.user?.email}</strong> ({userRole})
                    </span>
                    <SignOutButton />
                  </div>
                )}
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
              © 2025 Copyright Mohamed Magdy
            </footer>
          </div>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeNextjsWatermark() {
                  // Strategy 0: Remove nextjs-portal element immediately
                  document.querySelectorAll('nextjs-portal').forEach(el => el.remove());
                  
                  // Strategy 1: Remove ALL links to nextjs.org or vercel.com
                  document.querySelectorAll('a[href*="nextjs.org"], a[href*="vercel.com"]').forEach(el => el.remove());
                  
                  // Strategy 2: Check ALL body children for fixed position at bottom-left
                  const allElements = Array.from(document.querySelectorAll('body > *'));
                  allElements.forEach(el => {
                    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
                    
                    const style = window.getComputedStyle(el);
                    const inlineStyle = (el.getAttribute('style') || '').toLowerCase();
                    const rect = el.getBoundingClientRect();
                    
                    // Check if element is fixed and at bottom-left
                    const isFixed = style.position === 'fixed' || inlineStyle.includes('position:fixed');
                    const isAtBottom = style.bottom === '0px' || 
                                      style.bottom.includes('0') || 
                                      inlineStyle.includes('bottom:0') ||
                                      inlineStyle.includes('bottom: 0') ||
                                      (rect.bottom > window.innerHeight - 100 && rect.bottom < window.innerHeight + 10);
                    const isAtLeft = style.left === '0px' || 
                                    style.left.includes('0') || 
                                    inlineStyle.includes('left:0') ||
                                    inlineStyle.includes('left: 0') ||
                                    (rect.left >= 0 && rect.left < 100);
                    
                    // If it's a small fixed element at bottom-left, remove it
                    if (isFixed && (isAtBottom || isAtLeft)) {
                      const width = parseInt(style.width) || rect.width;
                      const height = parseInt(style.height) || rect.height;
                      
                      // Remove if it's small (likely the icon) or has border-radius (circular icon)
                      if (width < 150 && height < 150 || inlineStyle.includes('border-radius') || inlineStyle.includes('border-radius')) {
                        el.remove();
                        return;
                      }
                    }
                    
                    // Also check for any element containing "N" text that's fixed at bottom-left
                    if (isFixed && isAtBottom && isAtLeft) {
                      const text = el.textContent || el.innerText || '';
                      if (text.trim() === 'N' || (text.length < 5 && text.includes('N'))) {
                        el.remove();
                      }
                    }
                  });
                  
                  // Strategy 3: Force hide via inline styles
                  document.querySelectorAll('*').forEach(el => {
                    const style = window.getComputedStyle(el);
                    const inlineStyle = (el.getAttribute('style') || '').toLowerCase();
                    if (style.position === 'fixed') {
                      const rect = el.getBoundingClientRect();
                      if (rect.bottom > window.innerHeight - 150 && rect.left < 150) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.opacity = '0';
                        el.style.pointerEvents = 'none';
                      }
                    }
                  });
                }
                
                // Run immediately (before DOM ready)
                if (document.body) {
                  removeNextjsWatermark();
                }
                
                // Run when DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeNextjsWatermark);
                } else {
                  removeNextjsWatermark();
                }
                
                // Run multiple times to catch late injections
                const intervals = [50, 100, 200, 500, 1000, 2000];
                intervals.forEach(delay => {
                  setTimeout(removeNextjsWatermark, delay);
                });
                
                // Aggressive MutationObserver
                const observer = new MutationObserver(function(mutations) {
                  removeNextjsWatermark();
                });
                
                if (document.body) {
                  observer.observe(document.body, { 
                    childList: true, 
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style']
                  });
                }
                
                // Also observe document
                observer.observe(document.documentElement, {
                  childList: true,
                  subtree: true
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
