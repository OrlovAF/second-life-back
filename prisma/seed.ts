import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.role.createMany({
    data: [{ name: 'USER' }],
    skipDuplicates: true,
  });

  await prisma.category.createMany({
    data: [
      { name: 'Clothes', slug: 'clothes' },
      { name: 'Books', slug: 'books' },
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Toys', slug: 'toys' },
      { name: 'Sports', slug: 'sports' },
      { name: 'Home decor', slug: 'home-decor' },
      { name: 'Transport', slug: 'transport' },
      { name: 'Other', slug: 'other' },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
