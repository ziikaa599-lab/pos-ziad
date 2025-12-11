const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting admin password...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  try {
    const user = await prisma.user.upsert({
      where: { username: 'admin' },
      update: { password: hashedPassword },
      create: {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
      },
    });
    console.log('SUCCESS: Admin user updated.');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('ERROR: Failed to reset password.', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
