import { basePath } from '@/config/env';

/** basename for React Router (GitHub Pages aware). */
export function routerBasename(): string | undefined {
  return basePath === '/' ? undefined : basePath.replace(/\/$/, '');
}
