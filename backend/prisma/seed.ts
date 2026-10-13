import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const email = (process.env.ADMIN_EMAIL ?? 'analista@agile.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? 'Analista@123';

await prisma.user.upsert({
  where: { email },
  update: { role: 'ANALISTA' },
  create: { email, name: 'Analista', password: await bcrypt.hash(password, 10), role: 'ANALISTA' },
});
await prisma.$disconnect();