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
  secret: 'temp-seed-secret',
  emailAndPassword: {
    enabled: true,
  },
});

async function clearDatabase() {
  console.log('🗑️  Clearing database...');

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

async function main() {
  if (serverEnv.NODE_ENV === 'production') {
    console.error('❌ Seeding is disabled in production!');
    process.exit(1);
  }

  console.log('🌱 Starting database seed...\n');

  try {
    await clearDatabase();
    await createUsers();
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
