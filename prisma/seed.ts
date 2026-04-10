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
}

main().finally(() => prisma.$disconnect());
