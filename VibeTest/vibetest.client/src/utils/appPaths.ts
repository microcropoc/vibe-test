import { isFullMode } from '@/config/env';
import { routerBasename } from '@/utils/router';

export type MyTestsTab = 'local' | 'cloud';

export type ApplicationsTab = 'my' | 'incoming';

export function applicationsPath(tab?: ApplicationsTab): string {
  return tab === 'incoming' ? '/applications?tab=incoming' : '/applications';
}

export function parseApplicationsTab(search: string): ApplicationsTab {
  return new URLSearchParams(search).get('tab') === 'incoming' ? 'incoming' : 'my';
}

/** Guest: `/tests`. Full: `/my/tests` with optional tab. */
export function localTestsListPath(tab: MyTestsTab = 'local'): string {
  return isFullMode ? `/my/tests?tab=${tab}` : '/tests';
}

export function myTestsPath(tab?: MyTestsTab): string {
  return tab ? `/my/tests?tab=${tab}` : '/my/tests';
}

/** New local test editor. Full cloud create: `/editor?storage=cloud`. */
export function editorPath(options?: { id?: string; cloud?: boolean }): string {
  if (options?.id) return `/editor/${options.id}`;
  if (isFullMode && options?.cloud) return '/editor?storage=cloud';
  return '/editor';
}

export function parseMyTestsTab(search: string): MyTestsTab {
  return new URLSearchParams(search).get('tab') === 'cloud' ? 'cloud' : 'local';
}

export function applicationPlayPath(token: string): string {
  return `/application/${token}`;
}

export function applicationPlayUrl(token: string): string {
  const base = routerBasename();
  const relativePath = applicationPlayPath(token);
  const path = base ? `${base}${relativePath}` : relativePath;
  return `${window.location.origin}${path}`;
}

export function isApiTestId(id: string | undefined): boolean {
  return id !== undefined && /^\d+$/.test(id);
}
