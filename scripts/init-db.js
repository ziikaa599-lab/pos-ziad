const mysql = require('mysql2/promise');

// Parse DATABASE_URL
function parseDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  const [, user, password, host, port, database] = match;
  
  return {
    host,
    port: parseInt(port, 10),
    user,
    password: decodeURIComponent(password),
    database,
  };
}

async function initDatabase() {
  const config = parseDatabaseUrl();
  const connection = await mysql.createConnection(config);

  try {
    console.log('Creating tables...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`User\` (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'CASHIER',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Product\` (
        id VARCHAR(255) PRIMARY KEY,
        productCode VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stockQuantity INT NOT NULL,
        imageUrl TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Sale\` (
        id VARCHAR(255) PRIMARY KEY,
        date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) NOT NULL,
        totalAmount DECIMAL(10, 2) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`SoldItem\` (
        id VARCHAR(255) PRIMARY KEY,
        saleId VARCHAR(255) NOT NULL,
        productId VARCHAR(255) NOT NULL,
        productCode VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        imageUrl TEXT,
        FOREIGN KEY (saleId) REFERENCES \`Sale\`(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (productId) REFERENCES \`Product\`(id) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    console.log('✅ Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initDatabase().catch(console.error);

