import { v4 as uuidv4 } from 'uuid';

const OPTIMISTIC_PREFIX = 'optimistic_';

export function generateOptimisticId(): string {
  return `${OPTIMISTIC_PREFIX}${uuidv4()}`;
}

export function isOptimisticId(id: string): boolean {
  return id.startsWith(OPTIMISTIC_PREFIX);
}
