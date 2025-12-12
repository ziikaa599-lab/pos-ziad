const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function seedDatabase() {
  const config = parseDatabaseUrl();
  const connection = await mysql.createConnection(config);

  try {
    console.log('Seeding database...');

    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedCashier = await bcrypt.hash('123456', 10);

    // Insert admin user
    await connection.execute(
      `INSERT INTO \`User\` (id, username, password, name, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      [generateId(), 'admin', hashedAdmin, 'Administrator', 'ADMIN']
    );

    // Insert cashier user
    await connection.execute(
      `INSERT INTO \`User\` (id, username, password, name, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      [generateId(), 'cashier1', hashedCashier, 'Cashier One', 'CASHIER']
    );

    console.log('✅ Seeding completed!');
    console.log('Default users:');
    console.log('  Admin: admin / admin123');
    console.log('  Cashier: cashier1 / 123456');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDatabase().catch(console.error);

