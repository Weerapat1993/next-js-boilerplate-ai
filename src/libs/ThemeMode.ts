import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { userPreferencesSchema } from '@/models/Schema';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Resolves the current request's theme preference.
 * `auth()` throws on routes clerkMiddleware never wraps (see src/proxy.ts matcher),
 * so those routes — and signed-out visitors — resolve to 'system'.
 */
export const getThemeMode = async (): Promise<ThemeMode> => {
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
