'use server';

import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { deleteGalleryImage, getPublicUrl, uploadGalleryImage } from '@/libs/SupabaseStorage';
import { gallerySchema } from '@/models/Schema';
import { GalleryValidation } from '@/validations/GalleryValidation';

export type GalleryActionState = {
  status: 'idle' | 'success' | 'error';
  errorMessage?: string;
};

const GALLERY_PATH = '/dashboard/gallery';

const buildImageKey = (clerkUserId: string, fileName: string): string => {
  const extension = fileName.split('.').pop() ?? 'jpg';
  return `galleries/${clerkUserId}/${crypto.randomUUID()}.${extension}`;
};

/**
 * Lists the galleries owned by a Clerk user.
 * @param clerkUserId The Clerk user id to filter by.
 * @returns The user's galleries with id, title, and image URL.
 */
export const listGalleries = async (clerkUserId: string) => {
  const rows = await db
    .select()
    .from(gallerySchema)
    .where(eq(gallerySchema.clerkUserId, clerkUserId));

  return rows.map((row) => ({ id: row.id, title: row.title, imageUrl: row.imageUrl }));
};

/**
 * Creates a gallery entry for the signed-in user, uploading the image first.
 * @param _prevState The previous form action state (unused).
 * @param formData Form data containing `title` and `image`.
 * @returns The resulting action state.
 */
export const createGallery = async (
  _prevState: GalleryActionState,
  formData: FormData,
): Promise<GalleryActionState> => {
  const { userId } = await auth();

  if (!userId) {
    return { status: 'error', errorMessage: 'Not signed in' };
  }

  const parsed = GalleryValidation.safeParse({
    title: formData.get('title'),
    image: formData.get('image'),
  });

  if (!parsed.success) {
    return { status: 'error', errorMessage: 'Invalid gallery data' };
  }

  const imagePath = buildImageKey(userId, parsed.data.image.name);

  try {
    await uploadGalleryImage(parsed.data.image, imagePath);
    const imageUrl = getPublicUrl(imagePath);

    await db.insert(gallerySchema).values({
      clerkUserId: userId,
      title: parsed.data.title,
      imagePath,
      imageUrl,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create gallery';
    return { status: 'error', errorMessage };
  }

  revalidatePath(GALLERY_PATH);

  return { status: 'success' };
};

/**
 * Updates a gallery's title and, optionally, its image.
 * @param _prevState The previous form action state (unused).
 * @param formData Form data containing `id`, `title`, and an optional `image`.
 * @returns The resulting action state.
 */
export const updateGallery = async (
  _prevState: GalleryActionState,
  formData: FormData,
): Promise<GalleryActionState> => {
  const { userId } = await auth();

  if (!userId) {
    return { status: 'error', errorMessage: 'Not signed in' };
  }

  const id = formData.get('id');

  if (typeof id !== 'string') {
    return { status: 'error', errorMessage: 'Invalid gallery id' };
  }

  const titleParsed = GalleryValidation.pick({ title: true }).safeParse({
    title: formData.get('title'),
  });

  if (!titleParsed.success) {
    return { status: 'error', errorMessage: 'Invalid gallery data' };
  }

  const [existing] = await db.select().from(gallerySchema).where(eq(gallerySchema.id, id));

  if (!existing || existing.clerkUserId !== userId) {
    return { status: 'error', errorMessage: 'Gallery not found' };
  }

  let { imagePath, imageUrl } = existing;
  const previousImagePath = existing.imagePath;

  const image = formData.get('image');
  if (image instanceof File && image.size > 0) {
    const imageParsed = GalleryValidation.pick({ image: true }).safeParse({ image });
    if (!imageParsed.success) {
      return { status: 'error', errorMessage: 'Invalid gallery data' };
    }
    imagePath = buildImageKey(userId, image.name);

    try {
      await uploadGalleryImage(image, imagePath);
      imageUrl = getPublicUrl(imagePath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update gallery';
      return { status: 'error', errorMessage };
    }
  }

  try {
    await db
      .update(gallerySchema)
      .set({ title: titleParsed.data.title, imagePath, imageUrl })
      .where(eq(gallerySchema.id, id));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update gallery';
    return { status: 'error', errorMessage };
  }

  if (imagePath !== previousImagePath) {
    await deleteGalleryImage(previousImagePath);
  }

  revalidatePath(GALLERY_PATH);

  return { status: 'success' };
};

/**
 * Deletes a gallery and its stored image, aborting if the storage delete fails.
 * @param id The gallery id to delete.
 * @returns The resulting action state.
 */
export const deleteGallery = async (id: string): Promise<GalleryActionState> => {
  const { userId } = await auth();

  if (!userId) {
    return { status: 'error', errorMessage: 'Not signed in' };
  }

  const [existing] = await db.select().from(gallerySchema).where(eq(gallerySchema.id, id));

  if (!existing || existing.clerkUserId !== userId) {
    return { status: 'error', errorMessage: 'Gallery not found' };
  }

  try {
    await deleteGalleryImage(existing.imagePath);
  } catch {
    return { status: 'error', errorMessage: 'Failed to delete image' };
  }

  await db.delete(gallerySchema).where(eq(gallerySchema.id, id));

  revalidatePath(GALLERY_PATH);

  return { status: 'success' };
};
