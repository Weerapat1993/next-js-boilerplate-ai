import { describe, expect, it } from 'vitest';
import { GalleryValidation } from './GalleryValidation';

const makeFile = (sizeBytes: number, type: string) =>
  new File([new Uint8Array(sizeBytes)], 'photo', { type });

describe('GalleryValidation', () => {
  it('accepts a valid title and image', () => {
    const result = GalleryValidation.safeParse({
      title: 'Beach day',
      image: makeFile(1024, 'image/jpeg'),
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = GalleryValidation.safeParse({
      title: '',
      image: makeFile(1024, 'image/jpeg'),
    });

    expect(result.success).toBe(false);
  });

  it('rejects a title over 120 characters', () => {
    const result = GalleryValidation.safeParse({
      title: 'a'.repeat(121),
      image: makeFile(1024, 'image/jpeg'),
    });

    expect(result.success).toBe(false);
  });

  it('rejects an image over 5MB', () => {
    const result = GalleryValidation.safeParse({
      title: 'Beach day',
      image: makeFile(5 * 1024 * 1024 + 1, 'image/jpeg'),
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unsupported MIME type', () => {
    const result = GalleryValidation.safeParse({
      title: 'Beach day',
      image: makeFile(1024, 'image/gif'),
    });

    expect(result.success).toBe(false);
  });

  it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', (mimeType) => {
    const result = GalleryValidation.safeParse({
      title: 'Beach day',
      image: makeFile(1024, mimeType),
    });

    expect(result.success).toBe(true);
  });
});
