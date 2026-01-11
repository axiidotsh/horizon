import { env as clientEnv } from '@/lib/config/env/client';
import { env as serverEnv } from '@/lib/config/env/server';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { Role } from './generated/client';
import { db } from './index';

const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  plugins: [
    admin({
      defaultRole: Role.USER,
      adminRoles: [Role.ADMIN, Role.SUPER_ADMIN],
    }),
  ],
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  secret: 'temp-seed-secret-1234567890abcde',
  emailAndPassword: {
    enabled: true,
  },
});

async function clearDatabase() {
  console.log('🗑️  Clearing database...');

  await db.habitCompletion.deleteMany({});
  await db.habitStats.deleteMany({});
  await db.habit.deleteMany({});
  await db.focusSession.deleteMany({});
  await db.focusStats.deleteMany({});
  await db.task.deleteMany({});
  await db.project.deleteMany({});
  await db.verification.deleteMany({});
  await db.session.deleteMany({});
  await db.account.deleteMany({});
  await db.user.deleteMany({});

  console.log('✅ Database cleared');
}

async function createUsers() {
  console.log('👤 Creating seed users...');

  const usersData = [
    {
      email: 'superadmin@example.com',
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      emailVerified: true,
    },
    {
      email: 'admin@example.com',
      name: 'Admin',
      role: Role.ADMIN,
      emailVerified: true,
    },
    {
      email: 'charlie.davis@example.com',
      name: 'Charlie Davis',
      role: Role.USER,
      emailVerified: true,
    },
    {
      email: 'diana.martinez@example.com',
      name: 'Diana Martinez',
      role: Role.USER,
      emailVerified: true,
    },
    {
      email: 'eve.wilson@example.com',
      name: 'Eve Wilson',
      role: Role.USER,
      banned: true,
      banReason: 'Terms of service violation',
      emailVerified: true,
    },
    {
      email: 'frank.thompson@example.com',
      name: 'Frank Thompson',
      role: Role.USER,
      emailVerified: false,
    },
  ];

  for (const userData of usersData) {
    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email: userData.email,
        password: 'password123',
        name: userData.name,
      },
    });
    await db.user.update({
      where: { id: signUpResponse.user.id },
      data: {
        emailVerified: userData.emailVerified,
        role: userData.role,
        banned: userData.banned ?? false,
        banReason: userData.banReason,
      },
    });
  }

  console.log('✅ Created users:');
  for (const userData of usersData) {
    const status = userData.banned ? `, BANNED` : '';
    console.log(`   - ${userData.email} (${userData.role}${status})`);
  }
  console.log('   Password for all users: password123');
}

async function createTasksAndHabits() {
  console.log('📝 Creating tasks and habits...');

  const users = await db.user.findMany({
    where: {
      role: Role.USER,
      banned: false,
    },
  });

  const priorities = ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH'] as const;

  for (const user of users) {
    const projects = await db.project.createManyAndReturn({
      data: [
        { userId: user.id, name: 'Work', color: '#3b82f6' },
        { userId: user.id, name: 'Personal', color: '#10b981' },
        { userId: user.id, name: 'Health', color: '#f59e0b' },
      ],
    });

    const tasks = [];
    for (let i = 1; i <= 75; i++) {
      tasks.push({
        userId: user.id,
        title: `Task ${i}`,
        projectId: projects[i % 3].id,
        priority: priorities[i % 4],
        completed: i % 5 === 0,
        tags: i % 3 === 0 ? ['important'] : [],
        dueDate:
          i % 4 === 0
            ? new Date(Date.now() + (i % 2 === 0 ? 1 : -1) * i * 86400000)
            : null,
      });
    }

    await db.task.createMany({ data: tasks });

    const habits = [];
    for (let i = 1; i <= 75; i++) {
      habits.push({
        userId: user.id,
        title: `Habit ${i}`,
        description: i % 2 === 0 ? `Description for habit ${i}` : null,
        category: i % 3 === 0 ? 'Health' : i % 3 === 1 ? 'Productivity' : null,
      });
    }

    await db.habit.createMany({ data: habits });

    console.log(
      `   ✅ Created 75 tasks and 75 habits for ${user.name || user.email}`
    );
  }

  console.log('✅ Tasks and habits created');
}

async function main() {
  if (serverEnv.NODE_ENV === 'production') {
    console.error('❌ Seeding is disabled in production!');
    process.exit(1);
  }

  console.log('🌱 Starting database seed...\n');

  try {
    await clearDatabase();
    await createUsers();
    await createTasksAndHabits();
    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
