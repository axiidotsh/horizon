import { addUTCDays } from '@/utils/date-utc';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
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
  sortBy: z.enum(['dueDate', 'priority', 'title', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  tags: z.string().optional(),
});

const chartQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(7),
});

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2, NO_PRIORITY: 3 };

export const tasksRouter = new Hono()
  .use(authMiddleware)
  .get('/stats', async (c) => {
    const user = c.get('user');

    const now = new Date();
    const startOfWeek = addUTCDays(now, -now.getUTCDay());

    const [total, completed] = await Promise.all([
      db.task.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfWeek },
        },
      }),
      db.task.count({
        where: {
          userId: user.id,
          completed: true,
          createdAt: { gte: startOfWeek },
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
      },
    });
  })
  .get('/chart', zValidator('query', chartQuerySchema), async (c) => {
    const user = c.get('user');
    const { days } = c.req.valid('query');

    const now = new Date();
    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = addUTCDays(now, -i);
      const nextDate = addUTCDays(date, 1);

      const [totalTasks, completedTasks] = await Promise.all([
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
      ]);

      const dateLabel =
        days <= 7
          ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
          : `${date.getMonth() + 1}/${date.getDate()}`;

      chartData.push({
        date: dateLabel,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      });
    }

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
      const allTasks = await db.task.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          project: {
            select: { id: true, name: true, color: true },
          },
        },
      });

      const sortedTasks = allTasks.sort((a, b) => {
        const priorityDiff =
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) {
          return sortOrder === 'asc' ? priorityDiff : -priorityDiff;
        }
        return sortOrder === 'asc'
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      });

      const items = sortedTasks.slice(offset, offset + limit);
      const hasMore = sortedTasks.length > offset + limit;
      const nextOffset = hasMore ? offset + limit : null;

      return c.json({ tasks: items, nextOffset });
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

    const task = await db.task.create({
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
    });

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

    const tasksWithProjects = await db.task.findMany({
      where: {
        id: { in: createdTasks.map((t) => t.id) },
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    });

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

    const task = await db.task.update({
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
    });

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
