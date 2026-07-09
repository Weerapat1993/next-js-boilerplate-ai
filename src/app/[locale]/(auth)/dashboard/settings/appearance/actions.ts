'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/libs/DB';
import { THEME_MODE_COOKIE } from '@/libs/ThemeMode';
import { userPreferencesSchema } from '@/models/Schema';
import { ThemeModeValidation } from '@/validations/ThemeModeValidation';

const THEME_MODE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type UpdateThemeModeState = {
  status: 'idle' | 'success' | 'error';
};

export const updateThemeMode = async (
  _prevState: UpdateThemeModeState,
  formData: FormData,
): Promise<UpdateThemeModeState> => {
  const parsed = ThemeModeValidation.safeParse({
    themeMode: formData.get('themeMode'),
  });

  if (!parsed.success) {
    return { status: 'error' };
  }

  const { userId } = await auth();

  if (!userId) {
    return { status: 'error' };
  }

  await db
    .insert(userPreferencesSchema)
    .values({ clerkUserId: userId, themeMode: parsed.data.themeMode })
    .onConflictDoUpdate({
      target: userPreferencesSchema.clerkUserId,
      set: { themeMode: parsed.data.themeMode },
    });

  const cookieStore = await cookies();
  cookieStore.set(THEME_MODE_COOKIE, parsed.data.themeMode, {
    path: '/',
    maxAge: THEME_MODE_COOKIE_MAX_AGE_SECONDS,
  });

  revalidatePath('/', 'layout');

  return { status: 'success' };
};
