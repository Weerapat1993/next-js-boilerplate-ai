import { describe, expect, it } from 'vitest';
import { ThemeModeValidation } from './ThemeModeValidation';

describe('theme mode validation', () => {
  it('accepts light, dark, and system', () => {
    expect(ThemeModeValidation.safeParse({ themeMode: 'light' }).success).toBeTruthy();
    expect(ThemeModeValidation.safeParse({ themeMode: 'dark' }).success).toBeTruthy();
    expect(ThemeModeValidation.safeParse({ themeMode: 'system' }).success).toBeTruthy();
  });

  it('rejects an unsupported value', () => {
    expect(ThemeModeValidation.safeParse({ themeMode: 'neon' }).success).toBeFalsy();
  });
});
