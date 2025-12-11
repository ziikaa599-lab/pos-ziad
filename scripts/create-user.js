const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.log('Usage: node scripts/create-user.js <username> <password> [name]');
    process.exit(1);
  }

  const [username, password, name = 'Cashier'] = argv;

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashed,
      name,
      role: 'CASHIER',
    },
    select: { id: true, username: true, name: true, role: true },
  });

  // Log summary only; do not print passwords
  console.log('Created user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
