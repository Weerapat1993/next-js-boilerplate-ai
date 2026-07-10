import { describe, expect, it, vi } from 'vitest';

const authMock = vi.fn<() => Promise<{ userId: string | null }>>();
const selectMock = vi.fn<() => Promise<{ themeMode: string }[]>>();
const cookieGetMock = vi.fn<() => { value: string } | undefined>();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
}));

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: () => cookieGetMock() }),
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
  it('returns the cookie value without touching auth', async () => {
    cookieGetMock.mockReturnValueOnce({ value: 'dark' });
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('dark');
    expect(authMock).not.toHaveBeenCalled();
  });

  it('falls back to auth when the cookie is missing or invalid', async () => {
    cookieGetMock.mockReturnValueOnce({ value: 'neon' });
    authMock.mockResolvedValueOnce({ userId: null });
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('light');
  });

  it('returns light when auth() throws (route not wrapped by clerkMiddleware)', async () => {
    authMock.mockRejectedValueOnce(new Error('clerkMiddleware() was not run'));
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('light');
  });

  it('returns light when signed out', async () => {
    authMock.mockResolvedValueOnce({ userId: null });
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('light');
  });

  it('returns light when signed in with no stored preference', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    selectMock.mockResolvedValueOnce([]);
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('light');
  });

  it('returns the stored preference when signed in', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    selectMock.mockResolvedValueOnce([{ themeMode: 'dark' }]);
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('dark');
  });
});
