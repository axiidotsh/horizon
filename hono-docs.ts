import { defineConfig } from '@rcmade/hono-docs';

export default defineConfig({
  tsConfigPath: './tsconfig.json',
  openApi: {
    openapi: '3.0.0',
    info: {
      title: 'Horizon API',
      version: '1.0.0',
      description: 'API documentation for Horizon productivity application',
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
  },
  outputs: {
    openApiJson: './public/openapi.json',
  },
  apis: [
    {
      name: 'Tasks',
      apiPrefix: '/tasks',
      appTypePath: 'src/server/routes/tasks.ts',
    },
    {
      name: 'Projects',
      apiPrefix: '/projects',
      appTypePath: 'src/server/routes/projects.ts',
    },
    {
      name: 'Focus Sessions',
      apiPrefix: '/focus',
      appTypePath: 'src/server/routes/focus.ts',
    },
    {
      name: 'Habits',
      apiPrefix: '/habits',
      appTypePath: 'src/server/routes/habits.ts',
    },
    {
      name: 'Dashboard',
      apiPrefix: '/dashboard',
      appTypePath: 'src/server/routes/dashboard.ts',
    },
    {
      name: 'User',
      apiPrefix: '/user',
      appTypePath: 'src/server/routes/user.ts',
    },
    {
      name: 'Settings',
      apiPrefix: '/settings',
      appTypePath: 'src/server/routes/settings.ts',
    },
  ],
});
