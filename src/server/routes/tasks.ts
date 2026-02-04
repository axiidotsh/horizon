import { addUTCDays } from '@/utils/date-utc';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { Prisma, TaskPriority } from '../db/generated/client';
import { authMiddleware } from '../middleware/auth';

const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z
    .enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH'])
    .default('NO_PRIORITY'),
  tags: z.array(z.string()).max(5).default([]),
});

const bulkCreateTasksSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().min(1).max(500),
    })
  ),
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z
    .enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH'])
    .default('NO_PRIORITY'),
  tags: z.array(z.string()).max(5).default([]),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  projectId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  priority: z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH']).optional(),
  tags: z.array(z.string()).max(5).optional(),
  completed: z.boolean().optional(),
});

const listTasksSchema = z.object({
  projectIds: z.string().optional(),
  completed: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z
    .enum(['dueDate', 'priority', 'title', 'createdAt', 'completed'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  tags: z.string().optional(),
});

const chartQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(7),
});

export const tasksRouter = new Hono()
  .use(authMiddleware)
  .get('/tags', async (c) => {
    const user = c.get('user');

    const tags = await db.tag.findMany({
      where: { userId: user.id },
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return c.json({ tags: tags.map((t) => t.name) });
  })
  .get('/stats', async (c) => {
    const user = c.get('user');

    const now = new Date();

    const [total, completed, overdue] = await Promise.all([
      db.task.count({
        where: {
          userId: user.id,
        },
      }),
      db.task.count({
        where: {
          userId: user.id,
          completed: true,
        },
      }),
      db.task.count({
        where: {
          userId: user.id,
          completed: false,
          dueDate: { lt: now },
        },
      }),
    ]);

    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return c.json({
      stats: {
        total,
        completed,
        pending,
        completionRate,
        overdue,
      },
    });
  })
  .get('/chart', zValidator('query', chartQuerySchema), async (c) => {
    const user = c.get('user');
    const { days } = c.req.valid('query');

    const now = new Date();

    const chartData = await Promise.all(
      Array.from({ length: days }, (_, i) => {
        const date = addUTCDays(now, -(days - 1 - i));
        const nextDate = addUTCDays(date, 1);

        return Promise.all([
          db.task.count({
            where: {
              userId: user.id,
              createdAt: { lt: nextDate },
            },
          }),
          db.task.count({
            where: {
              userId: user.id,
              completed: true,
              updatedAt: { gte: date, lt: nextDate },
            },
          }),
        ]).then(([totalTasks, completedTasks]) => {
          const dateLabel =
            days <= 7
              ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
              : `${date.getMonth() + 1}/${date.getDate()}`;

          return {
            date: dateLabel,
            completionRate:
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0,
          };
        });
      })
    );

    return c.json({ chartData });
  })
  .get('/', zValidator('query', listTasksSchema), async (c) => {
    const user = c.get('user');
    const {
      projectIds,
      completed,
      sortBy,
      sortOrder,
      limit,
      offset,
      search,
      tags,
    } = c.req.valid('query');

    const where: {
      userId: string;
      projectId?: { in: string[] };
      completed?: boolean;
      title?: { contains: string; mode: 'insensitive' };
      tags?: { hasSome: string[] };
    } = { userId: user.id };

    if (projectIds) where.projectId = { in: projectIds.split(',') };
    if (completed !== undefined) where.completed = completed;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (tags) where.tags = { hasSome: tags.split(',') };

    if (sortBy === 'priority') {
      const conditions: Prisma.Sql[] = [Prisma.sql`t."userId" = ${user.id}`];

      if (where.projectId) {
        conditions.push(Prisma.sql`t."projectId" = ANY(${where.projectId.in})`);
      }
      if (where.completed !== undefined) {
        conditions.push(Prisma.sql`t.completed = ${where.completed}`);
      }
      if (where.title) {
        conditions.push(
          Prisma.sql`t.title ILIKE ${`%${where.title.contains}%`}`
        );
      }
      if (where.tags) {
        conditions.push(Prisma.sql`t.tags && ${where.tags.hasSome}`);
      }

      const whereClause = Prisma.join(conditions, ' AND ');
      const orderDirection = Prisma.raw(sortOrder === 'asc' ? 'ASC' : 'DESC');

      const [tasks, countResult] = await Promise.all([
        db.$queryRaw<
          {
            id: string;
            userId: string;
            projectId: string | null;
            title: string;
            completed: boolean;
            dueDate: Date | null;
            priority: TaskPriority;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
            project: { id: string; name: string; color: string | null } | null;
          }[]
        >`
          SELECT
            t.id, t."userId", t."projectId", t.title, t.completed,
            t."dueDate", t.priority, t.tags, t."createdAt", t."updatedAt",
            CASE
              WHEN p.id IS NOT NULL THEN json_build_object('id', p.id, 'name', p.name, 'color', p.color)
              ELSE NULL
            END as project
          FROM tasks t
          LEFT JOIN projects p ON t."projectId" = p.id
          WHERE ${whereClause}
          ORDER BY
            CASE t.priority
              WHEN 'HIGH' THEN 0
              WHEN 'MEDIUM' THEN 1
              WHEN 'LOW' THEN 2
              WHEN 'NO_PRIORITY' THEN 3
            END ${orderDirection},
            t.id ${orderDirection}
          LIMIT ${limit}
          OFFSET ${offset}
        `,
        db.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count
          FROM tasks t
          WHERE ${whereClause}
        `,
      ]);

      const totalCount = Number(countResult[0].count);
      const hasMore = offset + limit < totalCount;
      const nextOffset = hasMore ? offset + limit : null;

      return c.json({ tasks, nextOffset });
    }

    const orderBy: Record<string, 'asc' | 'desc'>[] = sortBy
      ? [{ [sortBy]: sortOrder }, { id: sortOrder }]
      : [{ createdAt: 'desc' }, { id: 'desc' }];

    const [tasks, totalCount] = await Promise.all([
      db.task.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          project: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      db.task.count({ where }),
    ]);

    const hasMore = offset + limit < totalCount;
    const nextOffset = hasMore ? offset + limit : null;

    return c.json({ tasks, nextOffset });
  })
  .post('/', zValidator('json', createTaskSchema), async (c) => {
    const user = c.get('user');
    const { title, projectId, dueDate, priority, tags } = c.req.valid('json');

    const [task] = await Promise.all([
      db.task.create({
        data: {
          userId: user.id,
          title,
          projectId: projectId || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority,
          tags,
        },
        include: {
          project: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      ...tags.map((tag) =>
        db.tag.upsert({
          where: { userId_name: { userId: user.id, name: tag } },
          create: { userId: user.id, name: tag },
          update: {},
        })
      ),
    ]);

    return c.json({ task }, 201);
  })
  .post('/bulk', zValidator('json', bulkCreateTasksSchema), async (c) => {
    const user = c.get('user');
    const { tasks, projectId, dueDate, priority, tags } = c.req.valid('json');

    const createdTasks = await db.task.createManyAndReturn({
      data: tasks.map((task) => ({
        userId: user.id,
        title: task.title,
        projectId: projectId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        tags,
      })),
    });

    const [tasksWithProjects] = await Promise.all([
      db.task.findMany({
        where: {
          id: { in: createdTasks.map((t) => t.id) },
        },
        include: {
          project: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      ...tags.map((tag) =>
        db.tag.upsert({
          where: { userId_name: { userId: user.id, name: tag } },
          create: { userId: user.id, name: tag },
          update: {},
        })
      ),
    ]);

    return c.json({ tasks: tasksWithProjects }, 201);
  })
  .patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const data = c.req.valid('json');

    const existing = await db.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const tagUpserts =
      data.tags && data.tags.length > 0
        ? data.tags.map((tag) =>
            db.tag.upsert({
              where: { userId_name: { userId: user.id, name: tag } },
              create: { userId: user.id, name: tag },
              update: {},
            })
          )
        : [];

    const [task] = await Promise.all([
      db.task.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.projectId !== undefined && { projectId: data.projectId }),
          ...(data.dueDate !== undefined && {
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
          }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.tags !== undefined && { tags: data.tags }),
          ...(data.completed !== undefined && { completed: data.completed }),
        },
        include: {
          project: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      ...tagUpserts,
    ]);

    return c.json({ task });
  })
  .patch('/:id/toggle', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const existing = await db.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const task = await db.task.update({
      where: { id },
      data: { completed: !existing.completed },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return c.json({ task });
  })
  .delete('/:id', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const existing = await db.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }

    await db.task.delete({ where: { id } });

    return c.json({ success: true });
  });

export type AppType = typeof tasksRouter;
