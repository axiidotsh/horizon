# Habits Backend & Integration Plan

## Context

### Current State

- Frontend UI complete with mock data in [src/app/(protected)/(main)/habits/page.tsx](<src/app/(protected)/(main)/habits/page.tsx>)
- No backend routes or Prisma schema for habits
- No data fetching hooks or mutations
- Uses Jotai atoms for UI state (search, sort, filter)

### Tech Stack

- **Backend**: Hono + Next.js Edge Runtime
- **Auth**: better-auth (middleware extracts user)
- **DB**: PostgreSQL + Prisma v7
- **State**: Jotai + React Query
- **API Client**: Hono RPC client (`@/lib/rpc`)
- **Hooks**: `useApiQuery` + `useApiMutation`

### Existing Patterns (from Focus feature)

**Backend Route Pattern**:

```typescript
// src/server/routes/focus.ts
export const focusRouter = new Hono()
  .use(authMiddleware)
  .get('/endpoint', zValidator('query', schema), async (c) => {
    const user = c.get('user');
    // Filter by userId for data isolation
  });
```

**Frontend Hook Pattern**:

```typescript
// Query hook
export function useHabits() {
  return useApiQuery(api.habits.$get, {
    queryKey: HABITS_QUERY_KEYS.list,
    select: (data) => data.habits || [],
    errorMessage: 'Failed to fetch habits',
  });
}

// Mutation hook
export function useCreateHabit() {
  return useApiMutation(api.habits.$post, {
    invalidateKeys: [HABITS_QUERY_KEYS.list, HABITS_QUERY_KEYS.stats],
  });
}
```

**Type Inference Pattern**:

```typescript
// src/app/(protected)/(main)/habits/hooks/types.ts
import type { api } from '@/lib/rpc';
import type { InferResponseType } from 'hono/client';

type HabitsResponse = InferResponseType<typeof api.habits.$get>;
export type Habit = HabitsResponse['habits'][number];
```

---

## Database Schema Requirements

Based on frontend UI requirements, habits need:

**Habit Model**:

- `id` (String, CUID)
- `userId` (String, FK to User)
- `title` (String, required)
- `description` (String?, optional)
- `category` (String?, optional - wellness, health, learning, mindfulness)
- `archived` (Boolean, default false - for soft delete)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**HabitCompletion Model** (many-to-many with dates):

- `id` (String, CUID)
- `habitId` (String, FK to Habit)
- `userId` (String, FK to User)
- `date` (DateTime, normalized to UTC midnight)
- `createdAt` (DateTime)

**HabitStats Model** (denormalized for performance):

- `id` (String, CUID)
- `userId` (String, unique FK to User)
- `totalHabits` (Int, default 0)
- `longestStreak` (Int, default 0)
- `updatedAt` (DateTime)

**Indexes**:

- `Habit`: `@@index([userId])`
- `HabitCompletion`: `@@unique([habitId, date])`, `@@index([userId, date])`

**Relations**:

- `User.habits` ← `Habit.userId` (cascade delete)
- `User.habitCompletions` ← `HabitCompletion.userId` (cascade delete)
- `User.habitStats?` ← `HabitStats.userId` (cascade delete)
- `Habit.completions` ← `HabitCompletion.habitId` (cascade delete)

---

## API Endpoints (Backend Phase)

### Base Path: `/api/habits`

#### 1. `GET /` - List habits with completions

**Query Params**:

```typescript
{
  days?: number; // default 7 (for completion history)
}
```

**Response**:

```typescript
{
  habits: Array<{
    id: string;
    title: string;
    description?: string;
    category?: string;
    createdAt: Date;
    completions: Array<{ date: Date }>; // last N days
  }>;
}
```

**Logic**:

- Fetch user's non-archived habits
- Include completions for last `days` (default 7)
- Calculate `currentStreak`, `bestStreak`, `totalCompletions` on frontend

---

#### 2. `POST /` - Create habit

**Body**:

```typescript
{
  title: string; // min 1, max 100 chars
  description?: string; // max 500 chars
  category?: string; // max 50 chars
}
```

**Validation**:

- Title required, trimmed, non-empty

**Response**:

```typescript
{
  habit: Habit;
}
```

**Status**: 201

---

#### 3. `PATCH /:id` - Update habit

**Body**:

```typescript
{
  title?: string;
  description?: string;
  category?: string;
}
```

**Logic**:

- Verify ownership (userId match)
- Selective update (spread operator pattern)

**Response**:

```typescript
{
  habit: Habit;
}
```

**Errors**:

- 404 if not found or not owned by user

---

#### 4. `DELETE /:id` - Soft delete habit

**Logic**:

- Set `archived: true` instead of deleting
- Keeps completion history for stats

**Response**:

```typescript
{
  success: true;
}
```

---

#### 5. `POST /:id/toggle` - Toggle completion for today

**Logic**:

- Get today's date normalized to UTC midnight
- Check if completion exists for (habitId, date)
- If exists: delete (mark incomplete)
- If not exists: create (mark complete)

**Response**:

```typescript
{
  completed: boolean; // new state
  completion?: HabitCompletion;
}
```

**Errors**:

- 404 if habit not found or not owned

---

#### 6. `POST /:id/toggle-date` - Toggle completion for specific date

**Body**:

```typescript
{
  date: string; // ISO 8601 date string
}
```

**Logic**:

- Normalize date to UTC midnight
- Same toggle logic as `/toggle` but for specified date

**Response**:

```typescript
{
  completed: boolean;
  completion?: HabitCompletion;
}
```

---

#### 7. `GET /stats` - Get user habit statistics

**Response**:

```typescript
{
  stats: {
    totalHabits: number;
    completedToday: number;
    longestStreak: number;
    completionRate: number; // 0-100
  }
}
```

**Logic**:

- Count non-archived habits
- Count today's completions (join with habits)
- Calculate max streak across all habits (scan completions)
- Completion rate: (completedToday / totalHabits) \* 100

---

## Frontend Structure (Integration Phase)

### Directory Structure

```
src/app/(protected)/(main)/habits/
├── atoms/
│   └── habit-atoms.ts              # Existing: sortByAtom, searchQueryAtom, statusFilterAtom
│   └── dialog-atoms.ts             # NEW: createDialogAtom, editDialogAtom, deleteDialogAtom
├── components/
│   ├── dialogs/
│   │   ├── create-habit-dialog.tsx # NEW: Create habit form
│   │   ├── edit-habit-dialog.tsx   # NEW: Edit habit form
│   │   └── delete-habit-dialog.tsx # NEW: Confirm delete
│   ├── habit-list-actions.tsx      # EXISTS: Add create button handler
│   └── habits-list.tsx             # EXISTS: Add edit/delete handlers
├── hooks/
│   ├── habit-query-keys.ts         # NEW: Query key factory
│   ├── types.ts                    # NEW: Type definitions from API
│   ├── queries/
│   │   ├── use-habits.ts           # NEW: Fetch habits with completions
│   │   └── use-habit-stats.ts      # NEW: Fetch stats
│   └── mutations/
│       ├── use-create-habit.ts     # NEW: Create habit
│       ├── use-update-habit.ts     # NEW: Update habit
│       ├── use-delete-habit.ts     # NEW: Delete (archive) habit
│       └── use-toggle-habit.ts     # NEW: Toggle completion for date
├── utils/
│   └── habit-calculations.ts       # NEW: Streak calculation, filtering, sorting
└── page.tsx                        # EXISTS: Replace mock data with hooks
```

---

## Phase 1: Backend

### Step 1.1: Update Prisma Schema

**File**: `src/server/db/schema.prisma`

Add models:

```prisma
model Habit {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  category    String?
  archived    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions HabitCompletion[]

  @@index([userId])
  @@map("habits")
}

model HabitCompletion {
  id        String   @id @default(cuid())
  habitId   String
  userId    String
  date      DateTime
  createdAt DateTime @default(now())

  habit Habit @relation(fields: [habitId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
  @@index([userId, date])
  @@map("habit_completions")
}

model HabitStats {
  id            String   @id @default(cuid())
  userId        String   @unique
  totalHabits   Int      @default(0)
  longestStreak Int      @default(0)
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("habit_stats")
}
```

Update `User` model:

```prisma
model User {
  // ... existing fields
  habits           Habit[]
  habitCompletions HabitCompletion[]
  habitStats       HabitStats?
}
```

**Commands**:

```bash
pnpm db:generate
pnpm db:migrate
```

---

### Step 1.2: Create Habits Router

**File**: `src/server/routes/habits.ts`

```typescript
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const createHabitSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

const updateHabitSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

const toggleDateSchema = z.object({
  date: z.string().datetime(),
});

export const habitsRouter = new Hono()
  .use(authMiddleware)

  // GET / - List habits with completions
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        days: z.coerce.number().min(1).max(365).default(7),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const { days } = c.req.valid('query');

      const now = new Date();
      const cutoffDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - days,
          0,
          0,
          0,
          0
        )
      );

      const habits = await db.habit.findMany({
        where: {
          userId: user.id,
          archived: false,
        },
        include: {
          completions: {
            where: {
              date: { gte: cutoffDate },
            },
            select: {
              date: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return c.json({ habits });
    }
  )

  // POST / - Create habit
  .post('/', zValidator('json', createHabitSchema), async (c) => {
    const user = c.get('user');
    const { title, description, category } = c.req.valid('json');

    const habit = await db.habit.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        category: category || null,
      },
    });

    return c.json({ habit }, 201);
  })

  // PATCH /:id - Update habit
  .patch('/:id', zValidator('json', updateHabitSchema), async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const { title, description, category } = c.req.valid('json');

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    const updated = await db.habit.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(category !== undefined && { category: category || null }),
      },
    });

    return c.json({ habit: updated });
  })

  // DELETE /:id - Archive habit
  .delete('/:id', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    await db.habit.update({
      where: { id },
      data: { archived: true },
    });

    return c.json({ success: true });
  })

  // POST /:id/toggle - Toggle today's completion
  .post('/:id/toggle', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
        archived: false,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    const today = new Date();
    const dateKey = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const existing = await db.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: dateKey,
        },
      },
    });

    if (existing) {
      await db.habitCompletion.delete({
        where: { id: existing.id },
      });
      return c.json({ completed: false });
    }

    const completion = await db.habitCompletion.create({
      data: {
        habitId: id,
        userId: user.id,
        date: dateKey,
      },
    });

    return c.json({ completed: true, completion });
  })

  // POST /:id/toggle-date - Toggle specific date completion
  .post('/:id/toggle-date', zValidator('json', toggleDateSchema), async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const { date: dateString } = c.req.valid('json');

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
        archived: false,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    const inputDate = new Date(dateString);
    const dateKey = new Date(
      Date.UTC(
        inputDate.getUTCFullYear(),
        inputDate.getUTCMonth(),
        inputDate.getUTCDate()
      )
    );

    const existing = await db.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: dateKey,
        },
      },
    });

    if (existing) {
      await db.habitCompletion.delete({
        where: { id: existing.id },
      });
      return c.json({ completed: false });
    }

    const completion = await db.habitCompletion.create({
      data: {
        habitId: id,
        userId: user.id,
        date: dateKey,
      },
    });

    return c.json({ completed: true, completion });
  })

  // GET /stats - Get habit statistics
  .get('/stats', async (c) => {
    const user = c.get('user');

    const totalHabits = await db.habit.count({
      where: {
        userId: user.id,
        archived: false,
      },
    });

    const today = new Date();
    const todayKey = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const completedToday = await db.habitCompletion.count({
      where: {
        userId: user.id,
        date: todayKey,
        habit: { archived: false },
      },
    });

    // Calculate longest streak across all habits
    const habits = await db.habit.findMany({
      where: {
        userId: user.id,
        archived: false,
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          select: { date: true },
        },
      },
    });

    let longestStreak = 0;
    for (const habit of habits) {
      const streak = calculateCurrentStreak(habit.completions);
      if (streak > longestStreak) {
        longestStreak = streak;
      }
    }

    const completionRate =
      totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return c.json({
      stats: {
        totalHabits,
        completedToday,
        longestStreak,
        completionRate,
      },
    });
  });

// Helper function to calculate current streak
function calculateCurrentStreak(completions: { date: Date }[]): number {
  if (completions.length === 0) return 0;

  const today = new Date();
  const todayKey = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  let streak = 0;
  let checkDate = new Date(todayKey);

  for (const completion of completions) {
    const compDate = new Date(completion.date);
    const compKey = new Date(
      Date.UTC(
        compDate.getUTCFullYear(),
        compDate.getUTCMonth(),
        compDate.getUTCDate()
      )
    );

    if (compKey.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else if (compKey.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
}
```

---

### Step 1.3: Register Habits Router

**File**: `src/server/index.ts`

```typescript
import { habitsRouter } from './routes/habits';

const router = app
  .on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw))
  .route('/focus', focusRouter)
  .route('/tasks', tasksRouter)
  .route('/projects', projectsRouter)
  .route('/habits', habitsRouter); // ADD THIS
```

---

### Step 1.4: Test Backend Routes

**Manual Testing Checklist**:

1. Start dev server: `pnpm dev`
2. Test endpoints with curl/Postman:
   - `GET /api/habits` (empty array initially)
   - `POST /api/habits` (create habit)
   - `POST /api/habits/:id/toggle` (toggle today)
   - `GET /api/habits` (verify completions)
   - `GET /api/habits/stats` (verify stats)
   - `PATCH /api/habits/:id` (update)
   - `DELETE /api/habits/:id` (archive)

---

## Phase 2: Integration

### Step 2.1: Query Keys & Types

**File**: `src/app/(protected)/(main)/habits/hooks/habit-query-keys.ts`

```typescript
export const HABITS_QUERY_KEYS = {
  list: ['habits', 'list'] as const,
  stats: ['habits', 'stats'] as const,
};
```

**File**: `src/app/(protected)/(main)/habits/hooks/types.ts`

```typescript
import type { api } from '@/lib/rpc';
import type { InferResponseType } from 'hono/client';

type HabitsResponse = InferResponseType<typeof api.habits.$get>;
export type Habit = HabitsResponse['habits'][number];

type StatsResponse = InferResponseType<typeof api.habits.stats.$get>;
export type HabitStats = StatsResponse['stats'];

export interface CompletionRecord {
  date: Date;
  completed: boolean;
}

export interface HabitWithMetrics extends Habit {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completed: boolean; // today's status
  completionHistory: CompletionRecord[];
}
```

---

### Step 2.2: Query Hooks

**File**: `src/app/(protected)/(main)/habits/hooks/queries/use-habits.ts`

```typescript
import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

export function useHabits(days = 7) {
  return useApiQuery(api.habits.$get, {
    queryKey: [...HABITS_QUERY_KEYS.list, days],
    input: {
      query: { days: days.toString() },
    },
    select: (data) => data.habits || [],
    errorMessage: 'Failed to fetch habits',
  });
}
```

**File**: `src/app/(protected)/(main)/habits/hooks/queries/use-habit-stats.ts`

```typescript
import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

export function useHabitStats() {
  return useApiQuery(api.habits.stats.$get, {
    queryKey: HABITS_QUERY_KEYS.stats,
    select: (data) => data.stats,
    errorMessage: 'Failed to fetch habit stats',
  });
}
```

---

### Step 2.3: Mutation Hooks

**File**: `src/app/(protected)/(main)/habits/hooks/mutations/use-create-habit.ts`

```typescript
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

export function useCreateHabit() {
  return useApiMutation(api.habits.$post, {
    invalidateKeys: [HABITS_QUERY_KEYS.list, HABITS_QUERY_KEYS.stats],
  });
}
```

**File**: `src/app/(protected)/(main)/habits/hooks/mutations/use-update-habit.ts`

```typescript
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

export function useUpdateHabit() {
  return useApiMutation(api.habits[':id'].$patch, {
    invalidateKeys: [HABITS_QUERY_KEYS.list],
  });
}
```

**File**: `src/app/(protected)/(main)/habits/hooks/mutations/use-delete-habit.ts`

```typescript
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

export function useDeleteHabit() {
  return useApiMutation(api.habits[':id'].$delete, {
    invalidateKeys: [HABITS_QUERY_KEYS.list, HABITS_QUERY_KEYS.stats],
  });
}
```

**File**: `src/app/(protected)/(main)/habits/hooks/mutations/use-toggle-habit.ts`

```typescript
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

export function useToggleHabit() {
  const toggleToday = useApiMutation(api.habits[':id'].toggle.$post, {
    invalidateKeys: [HABITS_QUERY_KEYS.list, HABITS_QUERY_KEYS.stats],
  });

  const toggleDate = useApiMutation(api.habits[':id']['toggle-date'].$post, {
    invalidateKeys: [HABITS_QUERY_KEYS.list, HABITS_QUERY_KEYS.stats],
  });

  return {
    toggleToday,
    toggleDate,
  };
}
```

---

### Step 2.4: Utility Functions

**File**: `src/app/(protected)/(main)/habits/utils/habit-calculations.ts`

```typescript
import type { Habit, HabitWithMetrics, CompletionRecord } from '../hooks/types';

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return getDateKey(d1) === getDateKey(d2);
}

export function calculateCurrentStreak(completions: { date: Date }[]): number {
  if (completions.length === 0) return 0;

  const sorted = [...completions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  for (const completion of sorted) {
    const compDate = new Date(completion.date);
    compDate.setHours(0, 0, 0, 0);

    if (compDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (compDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
}

export function calculateBestStreak(completions: { date: Date }[]): number {
  if (completions.length === 0) return 0;

  const sorted = [...completions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let maxStreak = 0;
  let currentStreak = 0;
  let previousDate: Date | null = null;

  for (const completion of sorted) {
    const currentDate = new Date(completion.date);
    currentDate.setHours(0, 0, 0, 0);

    if (previousDate === null) {
      currentStreak = 1;
    } else {
      const expectedDate = new Date(previousDate);
      expectedDate.setDate(expectedDate.getDate() + 1);

      if (currentDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    previousDate = currentDate;
  }

  return maxStreak;
}

export function enrichHabitsWithMetrics(habits: Habit[]): HabitWithMetrics[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return habits.map((habit) => {
    const completions = habit.completions || [];
    const currentStreak = calculateCurrentStreak(completions);
    const bestStreak = calculateBestStreak(completions);
    const totalCompletions = completions.length;

    const completedToday = completions.some((c) =>
      isSameDay(new Date(c.date), today)
    );

    const completionHistory: CompletionRecord[] = completions.map((c) => ({
      date: new Date(c.date),
      completed: true,
    }));

    return {
      ...habit,
      currentStreak,
      bestStreak,
      totalCompletions,
      completed: completedToday,
      completionHistory,
    };
  });
}

export function filterHabits(
  habits: HabitWithMetrics[],
  searchQuery: string,
  statusFilter: 'all' | 'completed' | 'pending'
): HabitWithMetrics[] {
  let filtered = habits;

  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter((habit) =>
      habit.title.toLowerCase().includes(lowerQuery)
    );
  }

  if (statusFilter === 'completed') {
    filtered = filtered.filter((habit) => habit.completed);
  } else if (statusFilter === 'pending') {
    filtered = filtered.filter((habit) => !habit.completed);
  }

  return filtered;
}

export function sortHabits(
  habits: HabitWithMetrics[],
  sortBy: 'streak' | 'title'
): HabitWithMetrics[] {
  return [...habits].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'streak') {
      comparison = b.currentStreak - a.currentStreak;
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    }

    if (comparison === 0) {
      return a.id.localeCompare(b.id);
    }

    return comparison;
  });
}
```

---

### Step 2.5: Dialog Atoms

**File**: `src/app/(protected)/(main)/habits/atoms/dialog-atoms.ts`

```typescript
import { atom } from 'jotai';

export const createDialogOpenAtom = atom(false);
export const editDialogOpenAtom = atom(false);
export const deleteDialogOpenAtom = atom(false);

export const editingHabitIdAtom = atom<string | null>(null);
export const deletingHabitIdAtom = atom<string | null>(null);
```

---

### Step 2.6: Create Habit Dialog

**File**: `src/app/(protected)/(main)/habits/components/dialogs/create-habit-dialog.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useCreateHabit } from '../../hooks/mutations/use-create-habit';

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHabitDialog({
  open,
  onOpenChange,
}: CreateHabitDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const createHabit = useCreateHabit();

  const handleCreate = () => {
    if (!title.trim()) return;

    createHabit.mutate(
      {
        json: {
          title: title.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setCategory('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Add a new habit to track daily.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning meditation"
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 10 minutes of mindfulness"
              maxLength={500}
            />
          </div>
          <div>
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., wellness, health, learning"
              maxLength={50}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createHabit.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createHabit.isPending}
          >
            Create Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Step 2.7: Edit Habit Dialog

**File**: `src/app/(protected)/(main)/habits/components/dialogs/edit-habit-dialog.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import type { HabitWithMetrics } from '../../hooks/types';
import { useUpdateHabit } from '../../hooks/mutations/use-update-habit';

interface EditHabitDialogProps {
  habit: HabitWithMetrics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditHabitDialog({
  habit,
  open,
  onOpenChange,
}: EditHabitDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const updateHabit = useUpdateHabit();

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setCategory(habit.category || '');
    }
  }, [habit]);

  const handleSave = () => {
    if (!habit || !title.trim()) return;

    updateHabit.mutate(
      {
        param: { id: habit.id },
        json: {
          title: title.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Update your habit details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>
          <div>
            <Label htmlFor="edit-category">Category (optional)</Label>
            <Input
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={50}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateHabit.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || updateHabit.isPending}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Step 2.8: Delete Habit Dialog

**File**: `src/app/(protected)/(main)/habits/components/dialogs/delete-habit-dialog.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { HabitWithMetrics } from '../../hooks/types';
import { useDeleteHabit } from '../../hooks/mutations/use-delete-habit';

interface DeleteHabitDialogProps {
  habit: HabitWithMetrics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteHabitDialog({
  habit,
  open,
  onOpenChange,
}: DeleteHabitDialogProps) {
  const deleteHabit = useDeleteHabit();

  const handleDelete = () => {
    if (!habit) return;

    deleteHabit.mutate(
      { param: { id: habit.id } },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Habit</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{habit?.title}"? This will archive
            the habit but keep your completion history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteHabit.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteHabit.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Step 2.9: Update Habit List Actions

**File**: `src/app/(protected)/(main)/habits/components/habit-list-actions.tsx`

Update to add create button handler:

```typescript
import { useSetAtom } from 'jotai';
import { createDialogOpenAtom } from '../atoms/dialog-atoms';

// In component:
const setCreateDialogOpen = useSetAtom(createDialogOpenAtom);

// Update PlusIcon button:
<Button
  size="icon-sm"
  variant="outline"
  tooltip="Add new habit"
  onClick={() => setCreateDialogOpen(true)}
>
  <PlusIcon />
</Button>
```

---

### Step 2.10: Update Habits List

**File**: `src/app/(protected)/(main)/habits/components/habits-list.tsx`

Update dropdown menu handlers:

```typescript
import { useSetAtom } from 'jotai';
import { editingHabitIdAtom, deletingHabitIdAtom } from '../atoms/dialog-atoms';

// In component:
const setEditingHabitId = useSetAtom(editingHabitIdAtom);
const setDeletingHabitId = useSetAtom(deletingHabitIdAtom);

// Update dropdown items:
<DropdownMenuItem onClick={() => setEditingHabitId(habit.id)}>
  <PencilIcon />
  Edit
</DropdownMenuItem>
<DropdownMenuItem
  variant="destructive"
  onClick={() => setDeletingHabitId(habit.id)}
>
  <Trash2Icon />
  Delete
</DropdownMenuItem>
```

---

### Step 2.11: Update Page Component

**File**: `src/app/(protected)/(main)/habits/page.tsx`

Replace mock data logic with real hooks:

```typescript
'use client';

import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { ChartConfig } from '@/components/ui/chart';
import { useAtom, useAtomValue } from 'jotai';
import { Settings2Icon, /* other icons */ } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ContentCard } from '../components/content-card';
import { GenericAreaChart } from '../components/generic-area-chart';
import { MetricCard } from '../components/metric-card';
import { ErrorState } from '../components/error-state';
import {
  createDialogOpenAtom,
  deletingHabitIdAtom,
  editingHabitIdAtom,
} from './atoms/dialog-atoms';
import {
  searchQueryAtom,
  sortByAtom,
  statusFilterAtom,
} from './components/habit-atoms';
import { HabitListActions } from './components/habit-list-actions';
import { HabitsList } from './components/habits-list';
import { CreateHabitDialog } from './components/dialogs/create-habit-dialog';
import { EditHabitDialog } from './components/dialogs/edit-habit-dialog';
import { DeleteHabitDialog } from './components/dialogs/delete-habit-dialog';
import { useHabits } from './hooks/queries/use-habits';
import { useHabitStats } from './hooks/queries/use-habit-stats';
import { useToggleHabit } from './hooks/mutations/use-toggle-habit';
import {
  enrichHabitsWithMetrics,
  filterHabits,
  sortHabits,
} from './utils/habit-calculations';

export default function HabitsPage() {
  const { data: rawHabits = [], isLoading, isError, refetch } = useHabits(7);
  const { data: statsData } = useHabitStats();
  const { toggleDate } = useToggleHabit();

  const [createDialogOpen, setCreateDialogOpen] = useAtom(createDialogOpenAtom);
  const [editingHabitId, setEditingHabitId] = useAtom(editingHabitIdAtom);
  const [deletingHabitId, setDeletingHabitId] = useAtom(deletingHabitIdAtom);

  const sortBy = useAtomValue(sortByAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const statusFilter = useAtomValue(statusFilterAtom);

  const habits = useMemo(
    () => enrichHabitsWithMetrics(rawHabits),
    [rawHabits]
  );

  const filteredHabits = useMemo(
    () => filterHabits(habits, searchQuery, statusFilter),
    [habits, searchQuery, statusFilter]
  );

  const sortedHabits = useMemo(
    () => sortHabits(filteredHabits, sortBy),
    [filteredHabits, sortBy]
  );

  const editingHabit = habits.find((h) => h.id === editingHabitId) || null;
  const deletingHabit = habits.find((h) => h.id === deletingHabitId) || null;

  const handleToggleDay = (habitId: string, date: Date) => {
    toggleDate.mutate({
      param: { id: habitId },
      json: { date: date.toISOString() },
    });
  };

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  const stats = statsData || {
    totalHabits: 0,
    completedToday: 0,
    longestStreak: 0,
    completionRate: 0,
  };

  // Generate chart data...
  const generateCompletionChartData = () => {
    // Same logic as before using `habits`
  };

  const chartData = generateCompletionChartData();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PageHeading>Habits</PageHeading>
        <Button
          size="icon-sm"
          variant="ghost"
          tooltip="Configure dashboard cards"
        >
          <Settings2Icon />
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Habits"
            icon={GoalIcon}
            content={stats.totalHabits.toString()}
            footer="Active habits"
          />
          <MetricCard
            title="Completed Today"
            icon={CheckCircle2Icon}
            content={`${stats.completedToday}/${stats.totalHabits}`}
            footer={`${stats.completionRate}%`}
          />
          <MetricCard
            title="Current Streak"
            icon={FlameIcon}
            content={`${stats.longestStreak} days`}
            footer={`Personal best`}
          />
          <MetricCard
            title="Completion Rate"
            icon={TrendingUpIcon}
            content={`${stats.completionRate}%`}
            footer="Today"
          />
        </div>
        <ContentCard
          title="Habit Tracker"
          action={<HabitListActions habits={habits} />}
        >
          <HabitsList
            habits={habits}
            sortedHabits={sortedHabits}
            onToggleDay={handleToggleDay}
          />
        </ContentCard>
        <GenericAreaChart
          title="Habit Completion Trend"
          data={chartData}
          xAxisKey="date"
          yAxisKey="completionRate"
          chartConfig={chartConfig}
          color="#10b981"
          gradientId="habitCompletionGradient"
          yAxisFormatter={(value) => `${value}%`}
          tooltipFormatter={(value) => `${value}%`}
          yAxisDomain={[0, 100]}
        />
      </div>

      <CreateHabitDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <EditHabitDialog
        habit={editingHabit}
        open={!!editingHabitId}
        onOpenChange={(open) => !open && setEditingHabitId(null)}
      />
      <DeleteHabitDialog
        habit={deletingHabit}
        open={!!deletingHabitId}
        onOpenChange={(open) => !open && setDeletingHabitId(null)}
      />
    </div>
  );
}
```

---

## Testing Checklist

### Backend Phase

- [ ] Schema migration runs without errors
- [ ] All endpoints return expected responses
- [ ] Authentication works (401 for unauthenticated)
- [ ] Data isolation per user (can't access other user's habits)
- [ ] Toggle completion works correctly
- [ ] Streak calculation accurate
- [ ] Stats endpoint returns correct counts

### Integration Phase

- [ ] Habits list loads from API
- [ ] Create habit dialog works
- [ ] Edit habit dialog works
- [ ] Delete habit confirms and archives
- [ ] Toggle today's completion updates UI
- [ ] Toggle past day completion updates streak
- [ ] Search filters habits correctly
- [ ] Sort options work
- [ ] Status filter (all/completed/pending) works
- [ ] Stats cards show real data
- [ ] Chart displays completion trend
- [ ] Loading states show skeletons
- [ ] Error states show retry option
- [ ] Optimistic updates feel instant

---

## Key Implementation Notes

1. **Date Normalization**: All dates stored as UTC midnight to avoid timezone issues
2. **Soft Delete**: Archive flag instead of deleting to preserve history
3. **Streak Calculation**: Done on frontend for flexibility (backend returns raw completions)
4. **Query Invalidation**: Mutations invalidate both list and stats
5. **Type Safety**: Full end-to-end types from API to components
6. **Error Handling**: Toast notifications via `useApiMutation`
7. **Loading States**: Handled at page level, not per component
8. **Optimistic Updates**: Not implemented initially (can add later if needed)

---

## File Checklist

### Backend Phase (6 files)

- [ ] `src/server/db/schema.prisma` (update)
- [ ] `src/server/routes/habits.ts` (create)
- [ ] `src/server/index.ts` (update)
- [ ] Run `pnpm db:generate`
- [ ] Run `pnpm db:migrate`
- [ ] Test endpoints manually

### Integration Phase (18 files)

- [ ] `src/app/(protected)/(main)/habits/hooks/habit-query-keys.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/hooks/types.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/hooks/queries/use-habits.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/hooks/queries/use-habit-stats.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/hooks/mutations/use-create-habit.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/hooks/mutations/use-update-habit.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/hooks/mutations/use-delete-habit.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/hooks/mutations/use-toggle-habit.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/utils/habit-calculations.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/atoms/dialog-atoms.ts` (create)
- [ ] `src/app/(protected)/(main)/habits/components/dialogs/create-habit-dialog.tsx` (create)
- [ ] `src/app/(protected)/(main)/habits/components/dialogs/edit-habit-dialog.tsx` (create)
- [ ] `src/app/(protected)/(main)/habits/components/dialogs/delete-habit-dialog.tsx` (create)
- [ ] `src/app/(protected)/(main)/habits/components/habit-list-actions.tsx` (update)
- [ ] `src/app/(protected)/(main)/habits/components/habits-list.tsx` (update)
- [ ] `src/app/(protected)/(main)/habits/page.tsx` (update - replace mock data)
- [ ] Test all features end-to-end
- [ ] Verify no console errors
