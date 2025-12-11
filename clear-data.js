const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all data...');
  
  // Delete all sales and sold items (cascade should handle soldItems if configured, but let's be safe)
  // Note: Prisma cascade delete depends on schema. If not set, we delete children first.
  // Checking schema... SoldItem has relation to Sale.
  
  try {
    // Delete SoldItems first (if not cascading)
    await prisma.soldItem.deleteMany({});
    console.log('Deleted SoldItems');

    // Delete Sales
    await prisma.sale.deleteMany({});
    console.log('Deleted Sales');

    // Delete Products
    await prisma.product.deleteMany({});
    console.log('Deleted Products');

    console.log('SUCCESS: All demo data cleared.');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
