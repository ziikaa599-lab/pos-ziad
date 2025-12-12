import mysql from 'mysql2/promise';

// Parse DATABASE_URL
function parseDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  // Parse mysql://user:password@host:port/database
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  const [, user, password, host, port, database] = match;
  
  return {
    host,
    port: parseInt(port, 10),
    user,
    password: decodeURIComponent(password), // Decode URL encoding
    database,
  };
}

// Create connection pool
const config = parseDatabaseUrl();

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Helper function to execute queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function for single row queries
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Helper function for insert/update/delete
export async function execute(sql: string, params?: any[]): Promise<any> {
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

// Generate CUID-like ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export { pool };
export default pool;
