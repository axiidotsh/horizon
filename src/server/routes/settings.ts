import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { TaskPriority } from '../db/generated/client';
import { authMiddleware } from '../middleware/auth';

const updateSettingsSchema = z.object({
  commandMenuPosition: z.enum(['top', 'center']).optional(),
  defaultFocusDuration: z.number().int().min(1).max(480).optional(),
  defaultTaskPriority: z.nativeEnum(TaskPriority).optional(),
  showFocusTimerInTab: z.boolean().optional(),
});

export const settingsRouter = new Hono()
  .use(authMiddleware)
  .get('/', async (c) => {
    const user = c.get('user');

    const settings = await db.user.findUnique({
      where: { id: user.id },
      select: {
        commandMenuPosition: true,
        defaultFocusDuration: true,
        defaultTaskPriority: true,
        showFocusTimerInTab: true,
      },
    });

    return c.json({
      commandMenuPosition: settings?.commandMenuPosition,
      defaultFocusDuration: settings?.defaultFocusDuration,
      defaultTaskPriority: settings?.defaultTaskPriority,
      showFocusTimerInTab: settings?.showFocusTimerInTab,
    });
  })
  .patch('/', zValidator('json', updateSettingsSchema), async (c) => {
    const user = c.get('user');
    const updates = c.req.valid('json');

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updates,
      select: {
        commandMenuPosition: true,
        defaultFocusDuration: true,
        defaultTaskPriority: true,
        showFocusTimerInTab: true,
      },
    });

    return c.json({
      commandMenuPosition: updatedUser.commandMenuPosition,
      defaultFocusDuration: updatedUser.defaultFocusDuration,
      defaultTaskPriority: updatedUser.defaultTaskPriority,
      showFocusTimerInTab: updatedUser.showFocusTimerInTab,
    });
  });

export type AppType = typeof settingsRouter;
