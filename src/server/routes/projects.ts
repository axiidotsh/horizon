import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().length(7).startsWith('#').optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().length(7).startsWith('#').nullable().optional(),
});

export const projectsRouter = new Hono()
  .use(authMiddleware)
  .get('/', async (c) => {
    const user = c.get('user');

    const projects = await db.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return c.json({ projects });
  })
  .post('/', zValidator('json', createProjectSchema), async (c) => {
    const user = c.get('user');
    const { name, color } = c.req.valid('json');

    const project = await db.project.create({
      data: {
        userId: user.id,
        name,
        color: color || null,
      },
    });

    return c.json({ project }, 201);
  })
  .patch('/:id', zValidator('json', updateProjectSchema), async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const data = c.req.valid('json');

    const existing = await db.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const project = await db.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
      },
    });

    return c.json({ project });
  })
  .delete('/:id', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const existing = await db.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: 'Project not found' }, 404);
    }

    await db.project.delete({ where: { id } });

    return c.json({ success: true });
  });

export type AppType = typeof projectsRouter;
