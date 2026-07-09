import { describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const onConflictDoUpdateMock = vi.fn().mockResolvedValue(undefined);
const valuesMock = vi.fn(() => ({ onConflictDoUpdate: onConflictDoUpdateMock }));
const insertMock = vi.fn(() => ({ values: valuesMock }));
const revalidatePathMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

vi.mock('@/libs/DB', () => ({
  db: { insert: (...args: unknown[]) => insertMock(...args) },
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
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout');
  });
});
