# Ziad POS System

A comprehensive Point of Sale (POS) system for retail operations with inventory management, sales processing, and invoice generation.

## Features

- **Inventory Management**: Add, edit, and manage products with real-time stock tracking
- **Point of Sale**: Quick product scanning, cart management, and transaction processing
- **Invoice Generation**: Professional, printable invoices with company branding
- **Stock Adjustments**: Add or deduct inventory quantities as needed
- **Sales History**: Track all completed transactions with detailed records

## Getting Started

First, install the dependencies:

```bash
npm install
```

### Prepare local database (Prisma + SQLite)

After dependencies are installed, initialize Prisma client and seed the database:

```bash
# Generate Prisma client and apply schema to SQLite file
npm run prisma:db:push

# Seed initial admin user and sample products
npm run prisma:seed
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/inventory` - Product management and stock adjustment interface
- `/pos` - Point of Sale transaction screen
- `/invoice/[id]` - Individual invoice/receipt view

## Data Storage

The application uses browser localStorage for data persistence. All products and sales are stored locally in your browser.

## Build for Production

### Web Application

```bash
npm run build
npm start
```

### Desktop Application (Electron)

The application can be packaged as a standalone desktop application for Windows, macOS, and Linux.

#### Development Mode (with Electron)

Run the Next.js dev server and Electron together:

```bash
npm run electron:dev
```

#### Build Desktop Application

**For Windows (.exe):**
```bash
npm run electron:build:win
```

**For macOS (.dmg):**
```bash
npm run electron:build:mac
```

**For Linux (AppImage):**
```bash
npm run electron:build:linux
```

**For all platforms:**
```bash
npm run electron:build
```

The built executable will be in the `dist` folder. You can double-click it to launch the Ziad POS System as a standalone desktop application.

#### First Time Setup

After installing dependencies, run:

```bash
npm run postinstall
```

This installs Electron's native dependencies.

## Technologies

- React 19
- Next.js 16
- TypeScript
- Tailwind CSS 4
- Electron (for desktop app)
