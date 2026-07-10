# NEX-1003: Galleries table with Supabase S3 image upload and CRUD

Ticket: `obsidian/kanban/tasks/NEX-1003.md`
Source spec: `obsidian/kanban/specs/backlog/2026-07-10-080836-db-galleries-upload-supabase-s3-26.md`

## Summary

Add a `galleries` table and a Clerk-protected dashboard page where a user uploads,
views, edits, and deletes gallery entries, each backed by an image stored in
Supabase Storage (S3-compatible).

## Decisions

- **Storage auth**: Supabase JS client (`@supabase/supabase-js`) with a
  server-side service-role key. Uploads/deletes happen only through server
  actions — the service-role key is never exposed to the client.
- **Route placement**: dedicated dashboard page, Clerk-protected, under the
  existing `(auth)` route group. Not a public/marketing page.
- **Image constraints**: max 5MB, MIME types `image/jpeg`, `image/png`,
  `image/webp`. No server-side resize/compress — stored as uploaded.
- **Ownership**: gallery rows are scoped per `clerkUserId`, matching the
  existing `userPreferencesSchema` pattern — each user manages their own
  galleries.

## Data model

`src/models/Schema.ts`:

```ts
export const gallerySchema = pgTable('gallery', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull(),
  title: text('title').notNull(),
  imagePath: text('image_path').notNull(), // storage object key, e.g. "galleries/{uuid}.jpg"
  imageUrl: text('image_url').notNull(),   // public URL, derived from imagePath
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

Migration generated via `bun run db:generate`, applied via `bun run db:migrate`.

## Env vars

Added to `src/libs/Env.ts` server schema (validated via Zod, never read via
`process.env` elsewhere):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

## Storage lib

`src/libs/SupabaseStorage.ts` — thin wrapper around the Supabase JS client,
instantiated once server-side with the service-role key:

- `uploadGalleryImage(file: File, key: string): Promise<void>`
- `deleteGalleryImage(key: string): Promise<void>`
- `getPublicUrl(key: string): string`

## Validation

`src/validations/GalleryValidation.ts`:

- `title`: string, 1–120 chars
- `image`: `File`, max 5MB, MIME in `image/jpeg | image/png | image/webp`

Forms use `react-hook-form` + `@hookform/resolvers/zod`.

## Server actions

Co-located with the dashboard gallery page (no separate `/api` route needed):

- `list()` — galleries for the current `clerkUserId`
- `create(title, file)` — upload to storage, insert row
- `update(id, title?, file?)` — optionally replace image (upload new, delete
  old, update row), update title
- `remove(id)` — delete storage object first via `imagePath`; only delete the
  DB row if the storage delete succeeds, to avoid orphaned rows

## UI

New page: `src/app/[locale]/(auth)/dashboard/gallery/page.tsx`.

- Grid of gallery cards (image, title, edit/delete actions)
- Upload form: title + file input, client-side validated against
  `GalleryValidation` before submit
- i18n: new `GalleryPage` namespace in `src/locales/{en,fr}.json`

## Error handling

- Upload/delete failures surface as form errors (short, no "try again"
  copy per project convention)
- `remove()` aborts before the DB delete if the storage delete fails,
  preventing an orphaned DB row pointing at a missing object

## Testing

- Unit test for `GalleryValidation` (file size/type boundaries)
- Unit test for `SupabaseStorage` wrapper behavior (mocked Supabase client)
  only if a meaningful branch exists to test (e.g. delete failure handling)

## Out of scope

- Image resizing/compression
- Public-facing gallery display
- Multi-image-per-entry galleries (one image per gallery row)
