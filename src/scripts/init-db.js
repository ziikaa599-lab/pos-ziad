const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(process.cwd(), 'pos.db');
const db = new Database(DB_PATH);

console.log('Initializing database at:', DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'CASHIER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY,
    productCode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stockQuantity INTEGER NOT NULL,
    imageUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Sale (
    id TEXT PRIMARY KEY,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    totalAmount REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS SoldItem (
    id TEXT PRIMARY KEY,
    saleId TEXT NOT NULL,
    productId TEXT NOT NULL,
    productCode TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    imageUrl TEXT,
    FOREIGN KEY (saleId) REFERENCES Sale(id),
    FOREIGN KEY (productId) REFERENCES Product(id)
  );
`);

console.log('Tables created successfully.');

// Seed Admin User
const seedAdmin = async () => {
  const adminUsername = 'admin';
  const adminPassword = 'password123'; // Default password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO User (id, username, password, name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = insertUser.run(
    'admin-user-id',
    adminUsername,
    hashedPassword,
    'System Admin',
    'ADMIN'
  );

  if (result.changes > 0) {
    console.log('Admin user created:');
    console.log('Username:', adminUsername);
    console.log('Password:', adminPassword);
  } else {
    console.log('Admin user already exists.');
  }
};

seedAdmin().catch(console.error);
