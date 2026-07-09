'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { userPreferencesSchema } from '@/models/Schema';
import { ThemeModeValidation } from '@/validations/ThemeModeValidation';

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

  revalidatePath('/', 'layout');

  return { status: 'success' };
};
