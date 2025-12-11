const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

function generatePassword() {
  // 12 byte -> 16 char base64url-ish string
  return crypto.randomBytes(12).toString('base64url');
}

async function main() {
  const usernames = ['admin', 'cashier1'];
  const results = [];

  for (const username of usernames) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.warn(`User not found: ${username}`);
      continue;
    }
    const newPassword = generatePassword();
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { username }, data: { password: hashed } });
    results.push({ username, password: newPassword });
  }

  if (results.length) {
    // In production, do not print passwords to the console
    if (process.env.NODE_ENV === 'production') {
      console.log('Passwords updated for users: ' + results.map(r => r.username).join(', '));
    } else {
      console.log('Passwords updated:');
      for (const r of results) {
        console.log(`${r.username}: ${r.password}`);
      }
    }
  } else {
    console.log('No passwords updated.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
