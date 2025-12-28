import { Scalar } from '@scalar/hono-api-reference';
import { Hono } from 'hono';
import { readFile } from 'node:fs/promises';
import { adminMiddleware } from '../middleware/admin';
import { authMiddleware } from '../middleware/auth';

export const docsRouter = new Hono()
  .use(authMiddleware)
  .use(adminMiddleware)
  .get(
    '/',
    Scalar({
      url: '/api/docs/openapi',
      theme: 'alternate',
      layout: 'modern',
    })
  )
  .get('/openapi', async (c) => {
    try {
      const spec = await readFile('./public/openapi.json', 'utf-8');
      return c.json(JSON.parse(spec));
    } catch {
      return c.json(
        { error: 'OpenAPI spec not found. Run `pnpm docs:generate` first.' },
        404
      );
    }
  });
