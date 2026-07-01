# Coding Style

## TypeScript
- ไม่ใช้ `any` ยกเว้นจำเป็นและ isolated
- ใช้ narrowing แทน casting
- ให้ compiler infer return type ยกเว้น annotation เพิ่ม clarity
- Named exports เท่านั้น — ยกเว้น Next.js pages (default export)
- Options object เมื่อ 3+ params หรือ ambiguous args
- Absolute imports ผ่าน `@/` ยกเว้น same directory

## React
- Functional components + hooks เท่านั้น
- ไม่ใช้ `useMemo`/`useCallback` (React compiler จัดการ)
- หลีกเลี่ยง `useEffect`
- Single `props` param พร้อม inline type — access เป็น `props.foo` (ไม่ destructure)
- ใช้ `React.ReactNode` ไม่ใช่ `ReactNode`
- Inline short event handlers; extract เฉพาะเมื่อซับซ้อน
- Component file ตั้งชื่อ PascalCase

## Styling
- Tailwind CSS v4 utility classes
- Reuse shared components
- Responsive design
- ไม่เพิ่ม class ที่ไม่จำเป็น

## Pages (Next.js App Router)
- Default export ชื่อลงท้ายด้วย `Page`
- Props alias ลงท้ายด้วย `PageProps` (ถ้าใช้ซ้ำ)
- Locale pages: `props: { params: Promise<{ locale: string }> }` → `await props.params` → `setRequestLocale(locale)`
- Dashboard pages อยู่หลัง auth — define meta ใน layout ไม่ใช่แต่ละ page
- Escape glob chars ใน shell commands สำหรับ Next.js paths

## Database & Env
- Schema ใน `src/models/Schema.ts`; migrations ใน `migrations/`
- ใช้ Drizzle ORM — ไม่ใช้ raw SQL ถ้าไม่จำเป็น
- Env vars ทุกตัวต้อง validate ใน `Env.ts` — ไม่อ่าน `process.env` โดยตรงที่อื่น

## Validation & Forms
- Zod schemas ใน `src/validations/`
- Forms ใช้ `react-hook-form` + `@hookform/resolvers/zod`
- `import type * as z from 'zod'` (type-only)

## i18n (next-intl)
- ไม่ hardcode user-visible strings
- Server: `getTranslations`; Client: `useTranslations`
- Page namespace ลงท้ายด้วย `Page`
- Context-specific keys (`card_title`, `meta_description`)
- ใช้ `t.rich(...)` สำหรับ markup
- Sentence case สำหรับ translations
- Error messages: สั้น ไม่ต้องมี "try again" variants

## Logging & Errors
- ใช้ `Logger.ts` (LogTape) แทน `console.*`
- Sentry รับ error production

## General
- ตั้งชื่อไฟล์ให้สื่อความหมาย
- ลบ code ที่ไม่ได้ใช้
- หลีกเลี่ยง duplicate logic
- เขียน comment เฉพาะส่วนที่ WHY ไม่ชัด (hidden constraint, subtle invariant, workaround)
- ไม่สร้าง documentation file ถ้าไม่ได้รับคำสั่ง

## Testing (Vitest + Playwright)
- `*.test.ts` unit tests — co-located กับ implementation
- `*.integ.ts` integration tests — ใน `tests/`
- `*.e2e.ts` Playwright — ใน `tests/`
- Top `describe` = subject; nested `describe` grouping scenarios
- `it` titles: short, third-person present, `verb + object + context`
- Sentence case, ไม่มี period, ไม่มี "should/works/handles"
- หลีกเลี่ยง mocking ถ้าไม่จำเป็น
- รัน single file: `bun run test -- src/path/to/file.test.ts`

## Review Code
ใช้ caveman:cavecrew-reviewer เป็น final review gate สำหรับ ticket WORK-XXXX

อ่าน:
- spec ที่อ้างใน ticket
- related files
- tests ที่เกี่ยวข้อง
- acceptance criteria

ให้ตอบเป็น:
- Verdict: PASS / NEEDS FIX / BLOCKED
- Findings เรียงตาม severity
- Missing tests ถ้ามี
- Commands ที่ควรรัน
- ควรย้ายไป done ได้หรือยัง
