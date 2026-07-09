import { describe, expect, it } from 'vitest';
import { ThemeModeValidation } from './ThemeModeValidation';

describe('ThemeModeValidation', () => {
  it('accepts light, dark, and system', () => {
    expect(ThemeModeValidation.safeParse({ themeMode: 'light' }).success).toBe(true);
    expect(ThemeModeValidation.safeParse({ themeMode: 'dark' }).success).toBe(true);
    expect(ThemeModeValidation.safeParse({ themeMode: 'system' }).success).toBe(true);
  });

  it('rejects an unsupported value', () => {
    expect(ThemeModeValidation.safeParse({ themeMode: 'neon' }).success).toBe(false);
  });
});
