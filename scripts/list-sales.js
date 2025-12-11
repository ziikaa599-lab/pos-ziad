const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const s = await p.sale.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
    console.log(JSON.stringify(s, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
})();
