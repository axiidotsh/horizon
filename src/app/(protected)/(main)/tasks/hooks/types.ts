import type { api } from '@/lib/rpc';
import type { InferResponseType } from 'hono/client';

type TasksResponse = InferResponseType<typeof api.tasks.$get>;
export type Task = TasksResponse['tasks'][number];

type ProjectsResponse = InferResponseType<typeof api.projects.$get>;
export type Project = ProjectsResponse['projects'][number];

type StatsResponse = InferResponseType<typeof api.tasks.stats.$get>;
export type TaskStats = StatsResponse['stats'];

type ChartResponse = InferResponseType<typeof api.tasks.chart.$get>;
export type ChartData = ChartResponse['chartData'];

export type TaskPriority = 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH';
