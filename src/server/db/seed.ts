import { env as clientEnv } from '@/lib/config/env/client';
import { env as serverEnv } from '@/lib/config/env/server';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { FocusSessionStatus, Role } from './generated/client';
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
  await db.habit.deleteMany({});
  await db.focusSession.deleteMany({});
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

async function createTasks() {
  console.log('📝 Creating tasks...');

  const users = await db.user.findMany({
    where: {
      role: Role.USER,
      banned: false,
    },
  });

  const priorities = ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH'] as const;
  const allTags = [
    'important',
    'urgent',
    'bug',
    'feature',
    'review',
    'blocked',
    'quick-win',
    'research',
  ];

  for (const user of users) {
    const projects = await db.project.createManyAndReturn({
      data: [
        { userId: user.id, name: 'Work', color: '#3b82f6' },
        { userId: user.id, name: 'Personal', color: '#10b981' },
        { userId: user.id, name: 'Health', color: '#f59e0b' },
      ],
    });

    await db.tag.createMany({
      data: allTags.map((tag) => ({
        userId: user.id,
        name: tag,
      })),
    });

    const tasks = [];
    for (let i = 1; i <= 75; i++) {
      const numTags = i % 4;
      const taskTags: string[] = [];
      if (numTags > 0) {
        const shuffled = [...allTags].sort(() => Math.random() - 0.5);
        taskTags.push(...shuffled.slice(0, numTags));
      }

      tasks.push({
        userId: user.id,
        title: `Task ${i}`,
        projectId: projects[i % 3].id,
        priority: priorities[i % 4],
        completed: i % 5 === 0,
        tags: taskTags,
        dueDate:
          i % 4 === 0
            ? new Date(Date.now() + (i % 2 === 0 ? 1 : -1) * i * 86400000)
            : null,
      });
    }

    await db.task.createMany({ data: tasks });

    console.log(`   ✅ Created 75 tasks for ${user.name || user.email}`);
  }

  console.log('✅ Tasks created');
}

async function createHabits() {
  console.log('📝 Creating habits...');

  const users = await db.user.findMany({
    where: {
      role: Role.USER,
      banned: false,
    },
  });

  for (const user of users) {
    const habits = [];
    for (let i = 1; i <= 75; i++) {
      habits.push({
        userId: user.id,
        title: `Habit ${i}`,
        description: i % 2 === 0 ? `Description for habit ${i}` : null,
        category: i % 3 === 0 ? 'Health' : i % 3 === 1 ? 'Productivity' : null,
      });
    }

    const createdHabits = await db.habit.createManyAndReturn({ data: habits });

    const completions = [];
    for (const habit of createdHabits) {
      const habitIndex = createdHabits.indexOf(habit);
      const daysBack = 30;

      for (let day = 0; day < daysBack; day++) {
        if (day % ((habitIndex % 3) + 2) === 0) {
          const now = new Date();
          const date = new Date(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate() - day
            )
          );

          completions.push({
            habitId: habit.id,
            userId: user.id,
            date,
          });
        }
      }
    }

    await db.habitCompletion.createMany({ data: completions });

    console.log(
      `   ✅ Created 75 habits and ${completions.length} completions for ${user.name || user.email}`
    );
  }

  console.log('✅ Habits created');
}

async function createFocusSessions() {
  console.log('🎯 Creating focus sessions...');

  const users = await db.user.findMany({
    where: {
      role: Role.USER,
      banned: false,
    },
  });

  for (const user of users) {
    const sessions = [];
    for (let i = 1; i <= 75; i++) {
      const durationMinutes = [25, 45, 60, 90][i % 4];
      const daysAgo = Math.floor(i / 2);
      const startedAt = new Date(Date.now() - daysAgo * 86400000);
      const completedAt = new Date(
        startedAt.getTime() + durationMinutes * 60000
      );

      sessions.push({
        userId: user.id,
        durationMinutes,
        task: `Focus Session ${i}`,
        startedAt,
        completedAt,
        status: FocusSessionStatus.COMPLETED,
        totalPausedSeconds: i % 5 === 0 ? 120 : 0,
      });
    }

    await db.focusSession.createMany({ data: sessions });

    console.log(
      `   ✅ Created 75 focus sessions for ${user.name || user.email}`
    );
  }

  console.log('✅ Focus sessions created');
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
    await createTasks();
    await createHabits();
    await createFocusSessions();
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
