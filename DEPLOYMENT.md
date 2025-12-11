# Deployment Guide

This project is built with **Next.js**.

> [!CAUTION]
> **Database Warning**: The project is currently configured with **SQLite** (`file:./dev.db`).
> Platforms like **Vercel** and **Netlify** rely on ephemeral file systems. This means any data written to SQLite will be **LOST** when the server sleeps or redeploys.
> **Action Required**: For production, you MUST switch to a persistent Cloud Database (PostgreSQL or MySQL).

## 1. Prerequisites (Cloud Database)

Before deploying, set up a database:
1.  **Create a Database**: Use a provider like [Neon](https://neon.tech/) (Postgres), [Supabase](https://supabase.com/) (Postgres), or [PlanetScale](https://planetscale.com/) (MySQL).
2.  **Get Connection String**: Copy the connection URL (e.g., `postgres://user:pass@host/db`).
3.  **Update Config**:
    - Update `prisma/schema.prisma`:
      ```prisma
      datasource db {
        provider = "postgresql" // or "mysql"
        url      = env("DATABASE_URL")
      }
      ```
    - Run `npx prisma generate` locally.
    - Commit these changes.

## 2. GitHub Setup

1.  Initialize Git (if not done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a Repository on [GitHub](https://github.com/new).
3.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## 3. Deployment (Vercel)

1.  Go to [Vercel](https://vercel.com) and "Add New Project".
2.  Import your GitHub repository.
3.  **Environment Variables**: Add the following in the Vercel dashboard:
    - `DATABASE_URL`: Your cloud database connection string.
    - `NEXTAUTH_SECRET`: Generate one using `openssl rand -base64 32`.
    - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://your-app.vercel.app`).
4.  **Deploy**: Click Deploy.
5.  **Post-Deploy**: The `postinstall` script in `package.json` will automatically run `prisma generate`.

## 4. Deployment (Netlify)

1.  Go to [Netlify](https://netlify.com) and "Import from Git".
2.  Select your repository.
3.  **Build Settings**:
    - Build command: `npm run build`
    - Publish directory: `.next`
4.  **Environment Variables**:
    - Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in Site Settings > Build & deploy > Environment.
5.  **Deploy**.
