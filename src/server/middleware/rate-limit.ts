import type { Context } from 'hono';
import type { HonoConfigProps } from 'hono-rate-limiter';
import { rateLimiter } from 'hono-rate-limiter';
import type { AuthVariables } from './auth';

function getIpAddress(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  );
}

function getClientIdentifier(c: Context): string {
  const user = c.get('user' as keyof AuthVariables);

  if (user?.id) {
    return `user:${user.id}`;
  }

  const ip = getIpAddress(c);
  return `ip:${ip}`;
}

function createUserBasedLimit(userLimit: number, ipLimit: number) {
  return (c: Context) => {
    const identifier = getClientIdentifier(c);
    return identifier.startsWith('user:') ? userLimit : ipLimit;
  };
}

const WINDOW_MS = 60 * 1000; // 1 minute
const STANDARD_HEADERS = 'draft-6' as const;

const RATE_LIMIT_CONFIG = {
  auth: {
    windowMs: WINDOW_MS,
    limit: createUserBasedLimit(30, 10),
    standardHeaders: STANDARD_HEADERS,
    keyGenerator: getClientIdentifier,
    message: {
      error: 'Too many authentication attempts, please try again later',
    },
  },
  api: {
    windowMs: WINDOW_MS,
    limit: createUserBasedLimit(600, 300),
    standardHeaders: STANDARD_HEADERS,
    keyGenerator: getClientIdentifier,
    message: { error: 'Too many requests, please try again later' },
  },
  strictApi: {
    windowMs: WINDOW_MS,
    limit: createUserBasedLimit(60, 30),
    standardHeaders: STANDARD_HEADERS,
    keyGenerator: (c: Context) => getIpAddress(c),
    message: { error: 'Too many requests, please try again later' },
  },
} satisfies Record<string, HonoConfigProps>;

export const authRateLimiter = rateLimiter(RATE_LIMIT_CONFIG.auth);
export const apiRateLimiter = rateLimiter(RATE_LIMIT_CONFIG.api);
export const strictApiRateLimiter = rateLimiter(RATE_LIMIT_CONFIG.strictApi);
