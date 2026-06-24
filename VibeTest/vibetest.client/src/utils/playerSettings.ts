export interface PlayerExplanationSettings {
  showOnCorrect: boolean;
  showOnIncorrect: boolean;
}

const STORAGE_KEY = 'vibetest_player_explanation_settings';

export const DEFAULT_PLAYER_EXPLANATION_SETTINGS: PlayerExplanationSettings = {
  showOnCorrect: true,
  showOnIncorrect: true,
};

export function getPlayerExplanationSettings(): PlayerExplanationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLAYER_EXPLANATION_SETTINGS };

    const parsed = JSON.parse(raw) as Partial<PlayerExplanationSettings>;
    return {
      showOnCorrect:
        typeof parsed.showOnCorrect === 'boolean'
          ? parsed.showOnCorrect
          : DEFAULT_PLAYER_EXPLANATION_SETTINGS.showOnCorrect,
      showOnIncorrect:
        typeof parsed.showOnIncorrect === 'boolean'
          ? parsed.showOnIncorrect
          : DEFAULT_PLAYER_EXPLANATION_SETTINGS.showOnIncorrect,
    };
  } catch {
    return { ...DEFAULT_PLAYER_EXPLANATION_SETTINGS };
  }
}

export function savePlayerExplanationSettings(settings: PlayerExplanationSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function shouldShowExplanation(
  settings: PlayerExplanationSettings,
  isCorrect: boolean,
  explanation?: string,
): boolean {
  if (!explanation?.trim()) return false;
  return isCorrect ? settings.showOnCorrect : settings.showOnIncorrect;
}
