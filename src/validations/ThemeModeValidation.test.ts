import { describe, expect, it } from 'vitest';
import { ThemeModeValidation } from './ThemeModeValidation';

describe('theme mode validation', () => {
  it('accepts light and dark', () => {
    expect(ThemeModeValidation.safeParse({ themeMode: 'light' }).success).toBeTruthy();
    expect(ThemeModeValidation.safeParse({ themeMode: 'dark' }).success).toBeTruthy();
  });

  it('rejects an unsupported value', () => {
    expect(ThemeModeValidation.safeParse({ themeMode: 'neon' }).success).toBeFalsy();
  });
});
