import { createClient } from '@supabase/supabase-js';
import { Env } from '@/libs/Env';

const supabase = createClient(Env.SUPABASE_URL, Env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Uploads a gallery image file to the configured Supabase storage bucket.
 * @param file The image file to upload.
 * @param key The destination path within the bucket.
 * @throws When the upload fails.
 */
export const uploadGalleryImage = async (file: File, key: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(Env.SUPABASE_STORAGE_BUCKET)
    .upload(key, file, { upsert: false });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Deletes a gallery image from the configured Supabase storage bucket.
 * @param key The path of the object to delete within the bucket.
 * @throws When the delete fails.
 */
export const deleteGalleryImage = async (key: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(Env.SUPABASE_STORAGE_BUCKET)
    .remove([key]);

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Returns the public URL for a gallery image in the configured storage bucket.
 * @param key The path of the object within the bucket.
 * @returns The public URL string.
 */
export const getPublicUrl = (key: string): string => {
  const { data } = supabase.storage.from(Env.SUPABASE_STORAGE_BUCKET).getPublicUrl(key);
  return data.publicUrl;
};
