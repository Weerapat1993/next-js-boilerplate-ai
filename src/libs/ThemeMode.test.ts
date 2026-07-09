import { describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const selectMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
}));

vi.mock('@/libs/DB', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => selectMock(),
      }),
    }),
  },
}));

describe('getThemeMode', () => {
  it('returns system when auth() throws (route not wrapped by clerkMiddleware)', async () => {
    authMock.mockRejectedValueOnce(new Error('clerkMiddleware() was not run'));
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('system');
  });

  it('returns system when signed out', async () => {
    authMock.mockResolvedValueOnce({ userId: null });
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('system');
  });

  it('returns system when signed in with no stored preference', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    selectMock.mockResolvedValueOnce([]);
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('system');
  });

  it('returns the stored preference when signed in', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    selectMock.mockResolvedValueOnce([{ themeMode: 'dark' }]);
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('dark');
  });
});
