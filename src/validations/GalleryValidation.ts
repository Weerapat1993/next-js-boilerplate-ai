import * as z from 'zod';

export const GALLERY_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const GALLERY_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const GalleryValidation = z.object({
  title: z.string().min(1).max(120),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= GALLERY_MAX_IMAGE_BYTES, 'File too large')
    .refine(
      (file) => GALLERY_ALLOWED_MIME_TYPES.includes(file.type as (typeof GALLERY_ALLOWED_MIME_TYPES)[number]),
      'Unsupported file type',
    ),
});

export type GalleryValidationType = z.infer<typeof GalleryValidation>;
