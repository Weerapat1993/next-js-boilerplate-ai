import { describe, expect, it, vi } from 'vitest';

const authMock = vi.fn<() => Promise<{ userId: string | null }>>();
const onConflictDoUpdateMock = vi.fn<() => Promise<void>>().mockResolvedValue();
const valuesMock = vi.fn<
  (values: unknown) => { onConflictDoUpdate: typeof onConflictDoUpdateMock }
>(() => ({ onConflictDoUpdate: onConflictDoUpdateMock }));
const insertMock = vi.fn<() => { values: typeof valuesMock }>(() => ({ values: valuesMock }));
const revalidatePathMock = vi.fn<(path: string, type?: string) => void>();
const cookieSetMock = vi.fn<(name: string, value: string, options: unknown) => void>();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (path: string, type?: string) => revalidatePathMock(path, type),
}));

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ set: cookieSetMock }),
}));

vi.mock('@/libs/DB', () => ({
  db: { insert: () => insertMock() },
}));

describe('updateThemeMode', () => {
  it('rejects an invalid theme mode without touching the database', async () => {
    const { updateThemeMode } = await import('./actions');
    const formData = new FormData();
    formData.set('themeMode', 'neon');

    const result = await updateThemeMode({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects when signed out', async () => {
    authMock.mockResolvedValueOnce({ userId: null });
    const { updateThemeMode } = await import('./actions');
    const formData = new FormData();
    formData.set('themeMode', 'dark');

    const result = await updateThemeMode({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('upserts the preference and revalidates on success', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    const { updateThemeMode } = await import('./actions');
    const formData = new FormData();
    formData.set('themeMode', 'dark');

    const result = await updateThemeMode({ status: 'idle' }, formData);

    expect(result.status).toBe('success');
    expect(valuesMock).toHaveBeenCalledWith({ clerkUserId: 'user_1', themeMode: 'dark' });
    expect(cookieSetMock).toHaveBeenCalledWith('theme_mode', 'dark', expect.any(Object));
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout');
  });
});
