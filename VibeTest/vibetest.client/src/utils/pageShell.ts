import { isFullMode } from '@/config/env';

export function pageClassName(): string {
  return isFullMode ? 'full-page' : 'guest-page';
}

export function mutedClassName(): string | undefined {
  return isFullMode ? 'full-muted' : undefined;
}

export function errorClassName(): string {
  return isFullMode ? 'full-error' : 'guest-error';
}

export function successClassName(): string {
  return isFullMode ? 'full-muted' : 'guest-success';
}

export function buttonClassName(variant?: 'ghost' | 'danger'): string {
  const prefix = isFullMode ? 'full-button' : 'guest-button';
  if (!variant) return prefix;
  return `${prefix} ${prefix}--${variant}`;
}

export function textareaClassName(): string {
  return 'guest-textarea';
}
