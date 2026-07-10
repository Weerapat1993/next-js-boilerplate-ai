import * as z from 'zod';

export const ThemeModeValidation = z.object({
  themeMode: z.enum(['light', 'dark']),
});
