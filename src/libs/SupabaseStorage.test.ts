import { describe, expect, it, vi } from 'vitest';

const uploadMock = vi.fn<(path: string, body: unknown, options: unknown) => Promise<{ error: { message: string } | null }>>();
const removeMock = vi.fn<(paths: string[]) => Promise<{ error: { message: string } | null }>>();
const getPublicUrlMock = vi.fn<(path: string) => { data: { publicUrl: string } }>();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: uploadMock,
        remove: removeMock,
        getPublicUrl: getPublicUrlMock,
      }),
    },
  }),
}));

vi.mock('@/libs/Env', () => ({
  Env: {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    SUPABASE_STORAGE_BUCKET: 'galleries',
  },
}));

describe('uploadGalleryImage', () => {
  it('uploads the file to the configured bucket path', async () => {
    uploadMock.mockResolvedValueOnce({ error: null });
    const { uploadGalleryImage } = await import('./SupabaseStorage');
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    await uploadGalleryImage(file, 'galleries/abc.jpg');

    expect(uploadMock).toHaveBeenCalledWith('galleries/abc.jpg', file, { upsert: false });
  });

  it('throws when the upload fails', async () => {
    uploadMock.mockResolvedValueOnce({ error: { message: 'boom' } });
    const { uploadGalleryImage } = await import('./SupabaseStorage');
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    await expect(uploadGalleryImage(file, 'galleries/abc.jpg')).rejects.toThrow('boom');
  });
});

describe('deleteGalleryImage', () => {
  it('removes the object at the given path', async () => {
    removeMock.mockResolvedValueOnce({ error: null });
    const { deleteGalleryImage } = await import('./SupabaseStorage');

    await deleteGalleryImage('galleries/abc.jpg');

    expect(removeMock).toHaveBeenCalledWith(['galleries/abc.jpg']);
  });

  it('throws when the delete fails', async () => {
    removeMock.mockResolvedValueOnce({ error: { message: 'boom' } });
    const { deleteGalleryImage } = await import('./SupabaseStorage');

    await expect(deleteGalleryImage('galleries/abc.jpg')).rejects.toThrow('boom');
  });
});

describe('getPublicUrl', () => {
  it('returns the public URL for the given path', async () => {
    getPublicUrlMock.mockReturnValueOnce({ data: { publicUrl: 'https://cdn.example.com/galleries/abc.jpg' } });
    const { getPublicUrl } = await import('./SupabaseStorage');

    expect(getPublicUrl('galleries/abc.jpg')).toBe('https://cdn.example.com/galleries/abc.jpg');
  });
});
