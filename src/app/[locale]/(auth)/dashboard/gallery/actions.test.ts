import { afterEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn<() => Promise<{ userId: string | null }>>();
const uploadGalleryImageMock = vi.fn<(file: File, key: string) => Promise<void>>();
const deleteGalleryImageMock = vi.fn<(key: string) => Promise<void>>();
const getPublicUrlMock = vi.fn<(key: string) => string>();
const revalidatePathMock = vi.fn<(path: string) => void>();

const valuesMock = vi.fn<(values: unknown) => Promise<void>>().mockResolvedValue();
const insertMock = vi.fn<() => { values: typeof valuesMock }>(() => ({ values: valuesMock }));

const setMock = vi.fn<(values: unknown) => { where: (cond: unknown) => Promise<void> }>();
const updateMock = vi.fn<() => { set: typeof setMock }>();

const deleteWhereMock = vi.fn<(cond: unknown) => Promise<void>>().mockResolvedValue();
const deleteMock = vi.fn<() => { where: typeof deleteWhereMock }>(() => ({ where: deleteWhereMock }));

const selectRow = { id: 'gallery_1', clerkUserId: 'user_1', title: 'Old title', imagePath: 'galleries/old.jpg', imageUrl: 'https://cdn/galleries/old.jpg' };
const whereMock = vi.fn<(cond: unknown) => Promise<Array<typeof selectRow>>>().mockResolvedValue([selectRow]);
const fromMock = vi.fn<() => { where: typeof whereMock }>(() => ({ where: whereMock }));
const selectMock = vi.fn<() => { from: typeof fromMock }>(() => ({ from: fromMock }));

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

vi.mock('@/libs/SupabaseStorage', () => ({
  uploadGalleryImage: (file: File, key: string) => uploadGalleryImageMock(file, key),
  deleteGalleryImage: (key: string) => deleteGalleryImageMock(key),
  getPublicUrl: (key: string) => getPublicUrlMock(key),
}));

vi.mock('@/libs/DB', () => ({
  db: {
    insert: () => insertMock(),
    update: () => updateMock(),
    delete: () => deleteMock(),
    select: () => selectMock(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('createGallery', () => {
  it('rejects when signed out', async () => {
    authMock.mockResolvedValueOnce({ userId: null });
    const { createGallery } = await import('./actions');
    const formData = new FormData();
    formData.set('title', 'Beach day');
    formData.set('image', new File(['data'], 'photo.jpg', { type: 'image/jpeg' }));

    const result = await createGallery({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(uploadGalleryImageMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid payload without uploading', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    const { createGallery } = await import('./actions');
    const formData = new FormData();
    formData.set('title', '');
    formData.set('image', new File(['data'], 'photo.jpg', { type: 'image/jpeg' }));

    const result = await createGallery({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(uploadGalleryImageMock).not.toHaveBeenCalled();
  });

  it('uploads the image and inserts a row on success', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    uploadGalleryImageMock.mockResolvedValueOnce();
    getPublicUrlMock.mockReturnValueOnce('https://cdn/galleries/abc.jpg');
    const { createGallery } = await import('./actions');
    const formData = new FormData();
    formData.set('title', 'Beach day');
    formData.set('image', new File(['data'], 'photo.jpg', { type: 'image/jpeg' }));

    const result = await createGallery({ status: 'idle' }, formData);

    expect(result.status).toBe('success');
    expect(uploadGalleryImageMock).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ clerkUserId: 'user_1', title: 'Beach day', imageUrl: 'https://cdn/galleries/abc.jpg' }),
    );
    expect(revalidatePathMock).toHaveBeenCalled();
  });

  it('returns an error state when the image upload throws', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    uploadGalleryImageMock.mockRejectedValueOnce(new Error('upload failed'));
    const { createGallery } = await import('./actions');
    const formData = new FormData();
    formData.set('title', 'Beach day');
    formData.set('image', new File(['data'], 'photo.jpg', { type: 'image/jpeg' }));

    const result = await createGallery({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it('returns an error state when the DB insert throws', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    uploadGalleryImageMock.mockResolvedValueOnce();
    getPublicUrlMock.mockReturnValueOnce('https://cdn/galleries/abc.jpg');
    valuesMock.mockRejectedValueOnce(new Error('db down'));
    const { createGallery } = await import('./actions');
    const formData = new FormData();
    formData.set('title', 'Beach day');
    formData.set('image', new File(['data'], 'photo.jpg', { type: 'image/jpeg' }));

    const result = await createGallery({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

describe('updateGallery', () => {
  it('returns an error state when the DB update throws during image replacement', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    uploadGalleryImageMock.mockResolvedValueOnce();
    getPublicUrlMock.mockReturnValueOnce('https://cdn/galleries/new.jpg');
    deleteGalleryImageMock.mockResolvedValueOnce();
    const updateWhereMock = vi.fn<(cond: unknown) => Promise<void>>().mockRejectedValueOnce(new Error('db down'));
    setMock.mockReturnValueOnce({ where: updateWhereMock });
    updateMock.mockReturnValueOnce({ set: setMock });

    const { updateGallery } = await import('./actions');
    const formData = new FormData();
    formData.set('id', 'gallery_1');
    formData.set('title', 'New title');
    formData.set('image', new File(['data'], 'new-photo.jpg', { type: 'image/jpeg' }));

    const result = await updateGallery({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(uploadGalleryImageMock).toHaveBeenCalled();
    expect(updateWhereMock).toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

describe('deleteGallery', () => {
  it('deletes the storage object before the DB row', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    deleteGalleryImageMock.mockResolvedValueOnce();
    const { deleteGallery } = await import('./actions');

    const result = await deleteGallery('gallery_1');

    expect(result.status).toBe('success');
    expect(deleteGalleryImageMock).toHaveBeenCalledWith('galleries/old.jpg');
    expect(deleteMock).toHaveBeenCalled();
  });

  it('aborts and does not delete the DB row when storage delete fails', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    deleteGalleryImageMock.mockRejectedValueOnce(new Error('storage down'));
    const { deleteGallery } = await import('./actions');

    const result = await deleteGallery('gallery_1');

    expect(result.status).toBe('error');
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
