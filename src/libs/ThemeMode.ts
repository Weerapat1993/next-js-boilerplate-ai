import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from '@/libs/DB';
import { userPreferencesSchema } from '@/models/Schema';

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_MODE_COOKIE = 'theme_mode';

const isThemeMode = (value: string | undefined): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

/**
 * Resolves the current request's theme preference.
 * Reads the `theme_mode` cookie first — set by `updateThemeMode` on save — so the
 * preference applies on every route, including ones `clerkMiddleware` never wraps
 * (see src/proxy.ts matcher), where `auth()` throws and can't identify the user.
 * Falls back to a DB lookup via `auth()` for the first render before any cookie is set.
 * @returns the resolved theme mode for the current request.
 */
export const getThemeMode = async (): Promise<ThemeMode> => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(THEME_MODE_COOKIE)?.value;

  if (isThemeMode(cookieValue)) {
    return cookieValue;
  }

  let userId: string | null = null;

  try {
    ({ userId } = await auth());
  } catch {
    userId = null;
  }

  if (!userId) {
    return 'system';
  }

  const rows = await db
    .select({ themeMode: userPreferencesSchema.themeMode })
    .from(userPreferencesSchema)
    .where(eq(userPreferencesSchema.clerkUserId, userId));

  return rows[0]?.themeMode ?? 'system';
};
