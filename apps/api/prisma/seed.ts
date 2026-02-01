import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Create a Test User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@spendwise.com' },
    update: {},
    create: {
      email: 'test@spendwise.com',
      first_name: 'Valentyn',
      last_name: 'K',
      passwordHash: hashedPassword,
      level: 1,
      xp: 0,
    },
  });
  console.log('👤 Test user created');

  // 2. Create Global System Categories (userId is null)
  // We use upsert to prevent duplicates if you run the seed multiple times
  const systemCategories = [
    { name: 'Food & Drink', icon: 'Utensils', color: '#f97316' },
    { name: 'Transport', icon: 'Car', color: '#8b5cf6' },
    { name: 'Housing', icon: 'Home', color: '#3b82f6' },
    { name: 'Entertainment', icon: 'Gamepad', color: '#ec4899' },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#eab308' },
    { name: 'Income', icon: 'Wallet', color: '#22c55e' },
  ];

  for (const cat of systemCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null }
    });
    if (!existing) {
        await prisma.category.create({
      data: { ...cat, userId: null },
    });
    }
  
  }
  console.log('🌍 Global categories created');

  // 3. Create Initial Achievements
  const achievements = [
    { name: 'First Steps', description: 'Log your first transaction', icon: 'Zap', xpValue: 50 },
    { name: 'Budget Master', description: 'Complete a month under budget', icon: 'Trophy', xpValue: 200 },
    { name: 'Consistency King', description: 'Log transactions 7 days in a row', icon: 'Flame', xpValue: 150 },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: {},
      create: ach,
    });
  }
  console.log('🏆 Achievements created');

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });