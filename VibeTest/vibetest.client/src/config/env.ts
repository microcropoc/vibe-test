export type AppMode = 'guest' | 'full';

export const appMode = (import.meta.env.VITE_APP_MODE ?? 'guest') as AppMode;
export const isGuestMode = appMode === 'guest';
export const isFullMode = appMode === 'full';

/** Base path for router and assets (e.g. `/` or `/vibe-test/` on GitHub Pages). */
export const basePath = import.meta.env.VITE_BASE_PATH ?? '/';

/** API base URL; only used in full mode. */
export const apiUrl = import.meta.env.VITE_API_URL ?? '/api';
