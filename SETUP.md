# Ziad POS System - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3001` (or next available port if 3001 is busy).

---

## Default Login Credentials (Development Only)

After running the seed command, use these credentials to log in:

**Admin User:**
- **Username:** `admin`
- **Password:** `123`
- **Role:** Administrator (full access)

**Cashier User:**
- **Username:** `cashier1`
- **Password:** `123456`
- **Role:** Cashier (POS access)

### Create Additional Users

To create more users (e.g., cashier), run:

```bash
node scripts/create-user.js <username> <password> <name> <role>
```

Example:
```bash
node scripts/create-user.js cashier1 cashier123 "Cashier One" CASHIER
```

Available roles: `ADMIN`, `CASHIER`

### Reset User Passwords

To reset passwords for users:

```bash
node scripts/reset-passwords.js
```

This will generate new random passwords for all users (output in development mode only).

---

## Troubleshooting

### "Invoice not found" error
- **This is expected** when you navigate to an invoice before any sales have been recorded
- **Fix:** 
  1. Go to POS section (click "POS" in the header)
  2. Select a product and add it to cart (e.g., search for "ESP" or "CAP")
  3. Click "Complete Sale"
  4. The invoice will automatically display and you can print it
  5. Or find the invoice ID in the URL and navigate back to it

### Login shows "Invalid credentials"
- Make sure you're using the exact credentials from above
- Check that passwords match exactly (case-sensitive)
- Try refreshing the page and logging in again

---

## Project Structure

- `src/app/` - Next.js pages and API routes
- `src/context/DataContext.tsx` - Global state management (Prisma + API integration)
- `prisma/schema.prisma` - Database schema
- `src/auth.ts` - NextAuth configuration
- `electron/` - Desktop app entry point (optional)

---

## Development Commands

```bash
npm run dev                 # Start dev server
npm run build              # Production build
npm run lint               # Run ESLint
npm run prisma:generate    # Generate Prisma Client
npm run prisma:push        # Sync schema with DB
npm run prisma:seed        # Seed database
npm run electron:dev       # Start Electron dev (desktop)
```

---

## Security Notes

⚠️ **For Production:**
- Change `NEXTAUTH_SECRET` in `.env.local` to a secure random value
- Rotate default credentials immediately
- Use environment variables for all secrets
- Enable HTTPS
- Set up proper database backups

