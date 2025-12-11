const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedCashier = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedAdmin },
    create: {
      username: 'admin',
      password: hashedAdmin,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { username: 'cashier1' },
    update: { password: hashedCashier },
    create: {
      username: 'cashier1',
      password: hashedCashier,
      name: 'Cashier One',
      role: 'CASHIER',
    },
  });

  // Products are no longer seeded for production
  console.log('Skipping product seed for production');

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
