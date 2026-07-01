# Kanban Ticket Flow

ใช้ไฟล์นี้เป็น workflow กลางเมื่อสั่ง AI ให้ทำ ticket ใน `obsidian/kanban/tasks/`

## Product PRD

ใช้ `prd.md` เป็น product-level source of truth สำหรับ scope, goals, target users, non-goals, success metrics, SEO/AI requirements และ future direction ของ Infinite CyberWhite

ต้องอ่าน `prd.md` เมื่อ ticket หรือคำสั่งเกี่ยวข้องกับ:

- feature ใหม่หรือการแตก requirement เป็น ticket
- public-facing website behavior
- admin behavior ที่ส่งผลต่อ content หรือข้อมูลบนเว็บไซต์
- product, ingredient, FAQ, gallery, blog, SEO metadata, structured data, internal links หรือ content quality
- review งานที่เกี่ยวกับ product scope, full-stack flow, content หรือ SEO

ถ้า ticket หรือคำสั่งขัดกับ PRD ให้เพิ่มหรืออัปเดต `### Open Questions` และถามผู้ใช้ว่าจะอัปเดต PRD หรือให้ถือเป็น exception เฉพาะงานนั้น ห้ามเดาเองว่า PRD หรือคำสั่งใหม่ถูกกว่า

## Board File

Board อยู่ในไฟล์เดียวที่ `obsidian/kanban/work-kanban-board.md` มี frontmatter `kanban-plugin: board` สำหรับให้ Obsidian render เป็น visual board และมี `## COLUMN` sections:

- `## BACKLOG` — ticket ที่ยังไม่เริ่ม
- `## PLAN` — ticket ที่กำลัง planning
- `## TODO` — ticket ที่ plan แล้วและพร้อมเริ่ม
- `## INPROGRESS` — ticket ที่กำลังทำอยู่
- `## REVIEW` — ticket ที่รอ review
- `## DONE` — ticket ที่เสร็จแล้ว
- `## CLOSED` — ticket ที่ยกเลิกหรือไม่ทำต่อ

Ticket รายใบต้องอยู่ใน:

- `obsidian/kanban/tasks/WORK-XXXX.md`

## Board Entry Format

ใน board file ให้ใช้รูปแบบ list item แบบนี้ภายใต้ `## COLUMN` section ที่ถูกต้อง:

```md
- [WORK-XXXX](tasks/WORK-XXXX.md): Ticket title
```

ห้ามเก็บรายละเอียด ticket เต็มใน board file ให้เก็บเฉพาะ link เท่านั้น

## Ticket File Format

Ticket file ต้องเป็น source of truth ของงานนั้นเสมอ:

```md
## WORK-XXXX: Ticket title

Status: Backlog
Priority: High
Spec: `obsidian/kanban/specs/example.md`

### Summary
...

### Acceptance Criteria
...

### Validation
...
```

กติกาสำคัญ:

- หนึ่ง ticket ต่อหนึ่งไฟล์เท่านั้น
- ชื่อไฟล์ต้องตรงกับ ticket id เช่น `obsidian/kanban/tasks/WORK-1001.md`
- `Status:` ใน ticket file ต้องตรงกับ board ที่มี link ไปหา ticket นั้น
- ห้าม duplicate link ของ ticket เดียวกันไว้หลาย board พร้อมกัน
- ห้ามย้ายหรือ rename ticket file เมื่อเปลี่ยนสถานะ ให้ย้ายเฉพาะ link ระหว่าง board files

## Optional Lark Ticket Command Sync

Lark Ticket Command sync เป็น optional layer เท่านั้น; `obsidian/kanban/tasks` Markdown ticket files และ `obsidian/kanban/work-kanban-board.md` ยังเป็น source of truth เสมอ

ใช้ `obsidian/kanban/tasks/lark-sync.json` เป็น local preference file:

```json
{
  "enabled": false
}
```

ถ้าไฟล์ไม่มีอยู่ ให้ถือว่า sync ปิดอยู่

รองรับคำสั่ง workflow เหล่านี้:

```txt
/kanban lark status
/kanban lark enable
/kanban lark disable
/kanban lark sync WORK-XXXX
```

กติกา:

- `/kanban lark enable` เขียน `"enabled": true` ลง `obsidian/kanban/tasks/lark-sync.json` และนับเป็นการยืนยันว่าเปิด sync
- `/kanban lark disable` เขียน `"enabled": false`
- `/kanban lark status` รายงาน preference, `lark-cli`, และ config ที่ตรวจได้
- `/kanban lark sync WORK-XXXX` ใช้ backfill ticket ที่มีอยู่ local แล้วแต่ยังไม่ขึ้น Lark board
- ถ้า sync ปิดอยู่หรือไฟล์หาย ให้ skip Lark แล้วทำ local flow ต่อ
- ถ้า sync เปิดอยู่ ไม่ต้องเช็ก `command -v lark-cli` ซ้ำทุก `/kanban` command ให้ยึดผลจาก `status` / `enable`
- ใช้ Artisan command เดิมสำหรับ Lark operation นั้น
- ถ้า command แจ้งว่าไม่มี `lark-cli`, auth หรือ config ให้แนะนำ setup และถามว่าจะ disable sync หรือ skip คำสั่งนี้
- Lark sync failure ห้ามเปลี่ยนหรือ revert local board state แบบเงียบ ๆ

Setup guidance:

```sh
lark-cli auth login --scope "task:task:write task:tasklist:read task:section:read task:section:write"
php artisan ticket:help
```

Laravel config ที่ต้องมีอย่างน้อยคือ `LARK_TASKLIST_GUID` และ optional `LARK_TASK_ASSIGNEE_OPEN_ID`

Status mapping:

```txt
Backlog -> backlog
Todo -> todo
In Progress -> inprogress
Review -> review
Done -> done
Closed -> closed
```

ห้ามรัน `/kanban lark sync WORK-XXXX` อัตโนมัติจาก `/kanban lark enable`; ใช้เฉพาะ manual backfill สำหรับ ticket เก่าที่ local มีอยู่แล้วแต่ยังไม่ขึ้น Lark board

## Manual Lark Sync

เมื่อผู้ใช้สั่ง `/kanban lark sync WORK-XXXX`:

1. เช็ก `obsidian/kanban/tasks/lark-sync.json`
2. ถ้า sync ปิดอยู่หรือไฟล์ไม่มี ให้บอกให้ผู้ใช้รัน `/kanban lark enable` ก่อน
3. อ่าน ticket file แล้วรายงาน `Status:` กับ board ปัจจุบัน
4. สร้างหรืออัปเดต marketing ticket ผ่าน flow เทียบเท่า `/kanban talk WORK-XXXX`
5. ถ้าพร้อมแล้วให้รัน `php artisan ticket:create-lark WORK-XXXX`
6. ห้ามย้าย local board link หรือเปลี่ยน `Status:` ใน local ticket file
7. ถ้า marketing ticket หรือ Lark create fail ให้ report ชัดเจนโดยไม่เปลี่ยน local Kanban state

## Flow

### 1. Create Ticket

เมื่อสร้าง ticket ใหม่:

1. ใช้ `using-superpowers` เพื่อเลือก skill ที่เหมาะกับ ticket นี้
2. อ่าน `prd.md` ถ้างานแตะ product, content, admin, user-facing behavior หรือ SEO; ข้ามได้ถ้าเป็น internal tooling ล้วน
3. ใช้ `brainstorming` ถ้า requirement ยังไม่ชัด, มีหลายแนวทาง, ต้องแตก scope, หรือชน PRD
4. สร้าง `obsidian/kanban/tasks/WORK-XXXX.md` พร้อม title, `Status: Backlog`, priority, spec/context, summary, acceptance criteria, และ validation
5. เพิ่ม link ของ ticket ใน `obsidian/kanban/work-kanban-board.md (## BACKLOG)`
6. ถ้า Lark sync เปิดอยู่ ให้สร้างหรืออัปเดต marketing ticket แล้วรัน `php artisan ticket:create-lark WORK-XXXX`
7. ถ้า marketing ticket หรือ Lark create fail ให้ report ชัดเจนและคง local ticket ไว้ใน Backlog

ห้ามสร้าง ticket เป็น block ยาวใน `obsidian/kanban/work-kanban-board.md (## BACKLOG)`

### 2. Start Ticket

เมื่อผู้ใช้สั่งให้เริ่มทำ ticket:

1. หา link ของ ticket จาก board file ปัจจุบัน โดยปกติคือ `obsidian/kanban/work-kanban-board.md (## PLAN)`, `obsidian/kanban/work-kanban-board.md (## BACKLOG)` หรือ `obsidian/kanban/work-kanban-board.md (## TODO)`
2. อ่าน ticket file จาก `obsidian/kanban/tasks/WORK-XXXX.md`
3. อ่าน `prd.md` เมื่อ ticket เข้าเงื่อนไข Product PRD ด้านบน
4. อ่าน spec, context, related files และ acceptance criteria ที่ ticket อ้างถึง
5. ถ้า ticket ขัดกับ PRD และผู้ใช้ยังไม่ approve exception ให้เพิ่มหรืออัปเดต `### Open Questions` และหยุดก่อนย้ายเข้า `In Progress`
6. ถ้า ticket มี `### Implementation Plan` และ `Status: Plan` แล้ว ให้เริ่มต่อได้ทันทีโดยไม่เรียก `writing-plans` ซ้ำ
7. ถ้า ticket อยู่ `Status: Backlog` สามารถข้าม `Plan` และย้ายเข้า `In Progress` ได้ทันทีเมื่อครบทุกเงื่อนไขนี้:
   - acceptance criteria ชัดเจน
   - spec/context ที่จำเป็นมีครบ หรือไม่จำเป็นต่อการตัดสินใจ
   - ไม่มี `### Open Questions` หรือ blocking notes ที่ยังไม่ resolved
   - งานเล็ก ความเสี่ยงต่ำ และไม่เข้าเกณฑ์ที่ควรใช้ `writing-plans` ตาม Plan Ticket flow
8. ถ้า backlog ticket ไม่ครบทุกเงื่อนไขสำหรับการข้าม `Plan` ให้ทำ Plan Ticket flow ก่อน และหยุดถ้า plan ทำให้เกิด `Open Questions`
9. ใช้ skill `using-superpowers` เพื่อเลือก skill ที่เหมาะกับงานก่อนเริ่ม implement
10. ย้ายเฉพาะ link ของ ticket ไป `obsidian/kanban/work-kanban-board.md (## INPROGRESS)`
11. เปลี่ยน `Status:` ใน ticket file เป็น `In Progress`
12. ถ้า optional Lark sync เปิดอยู่ ให้รัน `php artisan ticket:move-lark WORK-XXXX inprogress` ทันทีหลัง local board/status อัปเดตแล้ว และก่อนเริ่ม implement พร้อม report failure โดยไม่ revert local move แบบเงียบ ๆ
13. ทำงานตาม scope และ acceptance criteria
14. หลัง implement และ validation ให้ report ผลงานและบอกว่า ticket พร้อม review หรือยัง
15. ห้ามย้าย ticket ไป `Review` อัตโนมัติระหว่างคำสั่ง `start` แม้ implementation และ validation จะผ่านแล้ว
16. ห้ามรัน `php artisan ticket:move-lark WORK-XXXX review` ระหว่างคำสั่ง `start`
17. ต้องรอคำสั่ง `/kanban move-review WORK-XXXX` แบบ explicit ก่อน จึงค่อยเพิ่ม `Review Notes`, ย้าย board link ไป `obsidian/kanban/work-kanban-board.md (## REVIEW)`, เปลี่ยน `Status:` เป็น `Review`, และ sync Lark เป็น `review`

ห้ามเริ่ม implement หาก ticket ไม่มี acceptance criteria หรือ spec/context ที่จำเป็นต่อการตัดสินใจ

### 2A. Plan Ticket

เมื่อผู้ใช้สั่งให้ plan ticket ก่อนเริ่มงาน:

1. หา ticket file จาก `obsidian/kanban/tasks/WORK-XXXX.md` และอ่าน spec/context/AC/validation ที่จำเป็น
2. อ่าน `prd.md` เมื่อ ticket เข้าเงื่อนไข Product PRD ด้านบน
3. ใช้ skill `using-superpowers` เพื่อเลือก skill ที่เหมาะกับการวางแผน
4. แสดง pre-plan assessment สั้น ๆ: status/board ปัจจุบัน, เป็น UI Design ticket ที่ควรใช้ `impeccable` + `html-design-prototypes` หรือไม่, ควรใช้ `brainstorming` หรือไม่, ควรใช้ `writing-plans` หรือไม่, PRD alignment, และไฟล์/สถานะที่จะเปลี่ยน
5. ถามผู้ใช้ด้วย `Yes` / `No` ว่าจะ plan ต่อหรือไม่; ถ้า `No` ให้หยุด
6. ถ้า context ยังไม่พอ หรือ ticket ขัดกับ PRD และยังไม่ได้รับ approval ให้เพิ่ม `### Open Questions` แล้วหยุด
7. ถ้าเป็น UI Design ticket ให้ทำ UI Design pre-plan gate ก่อนเขียน `### Implementation Plan`:
   - ใช้ `/impeccable shape WORK-XXXX` เพื่อ shape UX/UI direction ของ ticket
   - ส่ง direction ที่ได้ให้ `html-design-prototypes` เพื่อสร้าง HTML mockup prototype แบบ self-contained
   - บันทึก prototype ไว้ที่ `.claude/html/<ticket-id>-prototype.html`
   - เพิ่ม artifact ใน `ARTIFACTS` array ของ `.claude/html/index.html` โดยใช้ `kind: 'playground'` หรือ `kind: 'other'` ตามลักษณะ artifact
   - เพิ่มหรืออัปเดต reference ใน ticket เช่น `Design Prototype: .claude/html/<ticket-id>-prototype.html`
   - ถือว่า prototype เป็น planning artifact เท่านั้น ห้ามแก้ production UI code ระหว่าง `/kanban plan`
8. ถ้า `brainstorming` ถูกแนะนำ ให้ใช้เพื่อ clear scope / approach / decision ที่สำคัญ; ถ้าทำให้ยังตอบไม่ได้ ให้หยุดและบันทึก `Open Questions`
9. ถ้า `writing-plans` ถูกแนะนำ ให้ใช้หลัง UI Design gate และ `brainstorming` resolved แล้ว; ถ้าไม่ถูกแนะนำ ให้เขียน plan แบบ concise ได้เลย
10. เพิ่มหรืออัปเดต `### Implementation Plan` โดยใส่ context, planned changes, files likely to change, validation commands, และ risks / decisions
11. ย้ายเฉพาะ link ของ ticket ไป `obsidian/kanban/work-kanban-board.md (## PLAN)` และเปลี่ยน `Status:` เป็น `Plan`
12. ห้าม implement code changes ระหว่างคำสั่ง plan

แนะนำ UI Design pre-plan gate เมื่อ ticket สร้าง ออกแบบใหม่ ขัดเกลา ปรับโครงสร้าง หรือเปลี่ยนแปลงอย่างมีนัยสำคัญกับ screen, layout, app shell, public page, component, form, interaction, animation, responsive behavior, visual hierarchy, copy presentation, หรือ design system surface

แนะนำ `brainstorming` เมื่อ requirement ยังไม่ชัด, มีหลาย approach, มี `Open Questions`, ต้องแตก scope, มี tension กับ PRD, หรือมี decision สำคัญที่ไม่ควรเดาระหว่าง implementation

แนะนำ `writing-plans` เมื่อ ticket แตะหลายไฟล์ หลาย layer, database, public SEO content, security/auth/validation, external integrations, migrations, imports/exports, หรือมี regression risk ชัดเจน; งาน copy-only, board-only, documentation-only, หรือ single-file low-risk ใช้ plan แบบ concise ได้

เมื่อผู้ใช้สั่ง `start`:

1. ถ้ามี `### Implementation Plan` และ `Status: Plan` แล้ว ให้ดำเนิน Start Ticket ต่อ
2. ถ้าอยู่ `Backlog` และครบเงื่อนไขข้าม `Plan` ให้ย้ายเข้า `In Progress` ได้เลย
3. ถ้ายังไม่มี plan หรือ plan ยังมี `Open Questions` ให้กลับมาทำ Plan Ticket ก่อน
4. หลังย้ายเข้า `In Progress` แล้ว ถ้าเป็น UI Design หรือ frontend implementation ticket ให้ใช้ `/impeccable craft <Ticket-ID>` เป็น implementation driver
   - ใช้เฉพาะ ticket ที่สร้าง ออกแบบใหม่ ขัดเกลา ปรับโครงสร้าง หรือเปลี่ยนแปลงอย่างมีนัยสำคัญกับ screen, layout, app shell, public page, component, form, interaction, animation, responsive behavior, visual hierarchy, copy presentation, หรือ design system surface
   - ถ้า ticket มี `Design Prototype:` ให้ถือเป็นสัญญาณแรงว่าควรใช้ `impeccable craft`
   - ใช้ ticket, `### Implementation Plan`, และ `Design Prototype:` เป็น approved direction; ห้ามเริ่ม design exploration ใหม่ ยกเว้น reference ยังไม่พอ
   - ต้องเคารพ user gates ของ `impeccable craft`; ห้าม bypass shape, direction, palette, mock, หรือ approval pause เมื่อ gate นั้น apply
   - ถ้าเป็น full-stack ticket ให้ใช้ `impeccable craft` เฉพาะส่วน frontend/UI หลัง backend contract ชัดแล้ว
5. ถ้าเป็น backend-only, database, API, auth, validation, integration, queue, command, migration, seeder, infrastructure, หรือ business logic ที่ไม่มีผลต่อ UI จริง ให้ใช้ `/kanban start` flow ปกติและห้าม invoke `/impeccable craft <Ticket-ID>`

### 3. Superpowers Gate

ใช้ skill จาก `obra/superpowers` เป็น workflow helper ระหว่างทำ ticket โดยไม่แทนที่ Laravel Boost, project instructions, tests, หรือ review gates ของ repo นี้

Skill map:

- `using-superpowers`: ขั้นแรกของทุก ticket
- `impeccable`: `/kanban plan` สำหรับ UI Design ticket ให้ใช้ `/impeccable shape WORK-XXXX` ก่อนสร้าง HTML prototype; `/kanban start` สำหรับ UI/frontend implementation ticket ให้ใช้ `/impeccable craft <Ticket-ID>` เป็น implementation driver
- `html-design-prototypes`: `/kanban plan` สำหรับ UI Design ticket หลัง `impeccable shape` เพื่อสร้าง mockup HTML prototype และใช้เป็น reference ใน ticket
- `brainstorming`: requirement ยังคลุมเครือ, ต้องเลือก approach, หรือแตกงานจาก spec ใหญ่เกินไป
- `writing-plans`: `/kanban plan` เมื่อ pre-plan assessment แนะนำ
- `debug-mantra`: bug/debug gate สำหรับ repro, trace, falsify, breadcrumb
- `systematic-debugging`: เมื่อ test fail, bug ยังไม่ชัด, behavior ไม่ตรง AC, หรือเจอ runtime/build error
- `scrutinize`: outsider review gate สำหรับ plan/diff/code change ที่มี regression risk หรือ cross-layer impact
- `post-mortem`: bugfix ที่ validate แล้วและต้องเก็บ root cause ก่อน Done/Close

เกณฑ์ขั้นต่ำ:

- Ticket เล็กและชัดเจน: ใช้ `using-superpowers` อย่างน้อยหนึ่งครั้งก่อนเริ่ม
- Ticket ที่ไม่ชัด: ใช้ `brainstorming` ก่อน finalize scope, AC หรือ `### Implementation Plan`
- Ticket เสี่ยงหรือ context ไม่พอ: ผ่าน `/kanban plan` ก่อน `/kanban start`
- Bug report / regression: ใช้ `debug-mantra` ก่อนเสนอ fix
- Test fail / runtime fail / behavior เพี้ยน: ใช้ `systematic-debugging`
- Plan/diff/code change เสี่ยงหรือหลาย layer: ใช้ `scrutinize`
- Bugfix ที่มี repro/root cause/fix/validation ครบ: ใช้ `post-mortem` ก่อน Done

ถ้าใช้ skill เหล่านี้ระหว่าง ticket ให้บันทึกสั้น ๆ ใน `Review Notes` หรือ `Done Notes` ว่าใช้ skill ใดและช่วยตัดสินใจเรื่องอะไร

### 4. Implementation Gate

ระหว่างทำ ticket ต้องปฏิบัติตาม:

- `prd.md` เมื่อเข้าเงื่อนไข Product PRD
- `obsidian/kanban/context/requirements.md`
- `obsidian/kanban/context/architecture.md`
- `obsidian/kanban/context/design.md`
- `obsidian/kanban/context/coding-style.md`
- Laravel Boost / project instructions
- Existing project conventions

ทุก code change ต้องมีการทดสอบที่เกี่ยวข้อง และต้องรันคำสั่งตรวจสอบเท่าที่จำเป็น เช่น:

- `php artisan test ...`
- `npm run build`
- `vendor/bin/pint --dirty`

หาก test/build/format fail และสาเหตุยังไม่ชัด ให้ใช้ skill `systematic-debugging` เพื่อแยก root cause ก่อนแก้ไข

หากเป็น bug report, regression, หรือ behavior ที่ผู้ใช้แจ้งว่า "เสีย", "ไม่ทำงาน", "แสดงผลผิด", "เล็ก/ใหญ่ผิด", "error", "throwing", "failing" ให้ใช้ skill `debug-mantra` ตั้งแต่เริ่ม debug เว้นแต่ผู้ใช้บอกให้ข้าม mantra โดยตรง แต่ยังต้องทำตามขั้นตอน repro -> trace -> falsify -> breadcrumb ภายในงานนั้น

### 5. SEO Content Gate

เมื่อ implementation เสร็จ ให้ใช้ skill `seo-content-auditor` ตรวจ SEO content ก่อนย้ายเข้า review

ตรวจอย่างน้อย:

- SEO title และ meta description
- Heading structure
- Content depth และ factual clarity
- E-E-A-T / trust signals
- Internal links หรือ discoverable paths
- Schema / structured data ที่สอดคล้องกับ visible content
- AI readability

เกณฑ์ผ่าน:

- Content quality score ต้องไม่น้อยกว่า `8/10`
- ไม่มี issue ระดับ blocking
- Recommendation สำคัญต้องถูกแก้ก่อน

ถ้าไม่ผ่าน:

1. แก้ content / metadata / structured data ตาม recommendation
2. รัน test หรือ build ที่เกี่ยวข้องอีกครั้ง
3. audit ซ้ำจนผ่าน

### 6. Move To Review

เมื่อ implementation และ SEO Content Gate ผ่าน:

1. เพิ่ม `Review Notes` แบบสั้นใน ticket file
2. ย้าย link จาก `obsidian/kanban/work-kanban-board.md (## INPROGRESS)` ไป `obsidian/kanban/work-kanban-board.md (## REVIEW)`
3. เปลี่ยน `Status:` เป็น `Review`
4. ถ้า Lark sync เปิดอยู่ ให้รัน `php artisan ticket:move-lark WORK-XXXX review` หลัง local update แล้ว

ตัวอย่าง `Review Notes`:

```md
### Review Notes
- Files: `resources/js/Pages/Homepage.tsx`, `routes/web.php`
- Commands: `php artisan test tests/Feature/HomepageTest.php`, `npm run build`, `vendor/bin/pint --dirty`
- Skills: `using-superpowers`, `writing-plans`
```

### 7. Review Gate

หลัง ticket อยู่ใน `obsidian/kanban/work-kanban-board.md (## REVIEW)`:

- ใช้ `scrutinize` ถ้างานมี plan, หลายไฟล์/หลาย layer, regression risk, หรือผู้ใช้ขอ review โดยตรง
- ใช้ `fullstack-guardian` เมื่อแตะ frontend/backend, auth, validation, data write, route behavior, request/response contract, SEO/structured data, หรือมี security/regression risk สูง
- งานเล็กและ low-risk ใช้ lightweight review โดยเช็ก AC, scope, test/build/format, SEO gate เมื่อเกี่ยวกับ public content, และไม่มี obvious runtime/accessibility/responsive/content regression

ให้ผลลัพธ์เป็น:

```md
Review type: Lightweight / Fullstack Guardian
Verdict: PASS / NEEDS FIX / BLOCKED

Findings:
- ...

Missing tests:
- ...

Commands run:
- ...

Move to done: Yes / No
```

ถ้าใช้ `fullstack-guardian` ให้ review เพิ่ม backend, frontend, security, SEO/structured data, tests, และ build/runtime risks; ถ้าเป็น lightweight review ให้ระบุเหตุผลสั้น ๆ ว่าทำไมไม่ต้องใช้ `fullstack-guardian`

```md
Review type: Lightweight
Fullstack Guardian skipped: copy-only public page update with no backend, auth, form, or data exposure changes
Verdict: PASS / NEEDS FIX / BLOCKED

Findings:
- ...

Missing tests:
- ...

Commands run:
- ...

Move to done: Yes / No
```

ถ้า `NEEDS FIX`:

1. แก้ issue ทันที
2. รัน test/build/format ที่เกี่ยวข้องอีกครั้ง
3. ใช้ `systematic-debugging` หรือ `debug-mantra` เมื่อ root cause ยังไม่ชัด
4. ใช้ `scrutinize` ซ้ำเมื่อ fix เปลี่ยน approach หรือแตะหลาย layer
5. Review ซ้ำด้วย gate เดิม หรืออัปเกรดเป็น `fullstack-guardian` หาก fix ทำให้งานมี full-stack/security impact
6. ห้ามย้ายไป done จนกว่า verdict เป็น `PASS`

ถ้า `BLOCKED`:

1. เก็บ link ของ ticket ไว้ใน `obsidian/kanban/work-kanban-board.md (## REVIEW)`
2. เพิ่ม `Blocked Notes` ใน ticket file
3. ระบุสิ่งที่ต้องการจากผู้ใช้หรือ dependency ที่ขาด

### 8. Move To Done

เมื่อ Review Gate ให้ verdict `PASS`:

1. เพิ่ม `Done Notes` แบบสั้นใน ticket file
2. ถ้าเป็น bugfix ที่คุ้มเก็บ root cause ให้ใช้ `post-mortem` ก่อนย้ายไป Done
3. ย้าย link จาก `obsidian/kanban/work-kanban-board.md (## REVIEW)` ไป `obsidian/kanban/work-kanban-board.md (## DONE)`
4. เปลี่ยน `Status:` เป็น `done`
5. รัน `php artisan obsidian:sync-apb-progress` หลัง local board/status อัปเดตแล้ว เพื่อ sync Advanced Progress Bars ใน dashboard; ถ้า command fail ให้ report failure แต่ห้าม revert ticket ที่ย้ายไป Done แล้ว
6. ถ้า Lark sync เปิดอยู่ ให้รัน `php artisan ticket:move-lark WORK-XXXX done` หลัง local update แล้ว

ตัวอย่าง `Done Notes`:

```md
### Done Notes
- Review Gate: PASS
- Gates passed: lightweight review, tests, build
- Validation: `php artisan test ...`, `npm run build`, `vendor/bin/pint --dirty`
- Post-mortem: not required
```

### 9. Close Or Archive Ticket

ใช้ `obsidian/kanban/work-kanban-board.md (## CLOSED)` เฉพาะ ticket ที่ยกเลิกหรือไม่ต้องทำต่อ

เมื่อ close ticket:

1. เพิ่ม `Closed Notes` ใน ticket file
2. ถ้าเป็น bugfix ที่แก้เสร็จแล้วแต่ต้องปิดด้วยเหตุผล workflow เช่น replaced by another ticket หรือ merged elsewhere และมี repro, root cause, fix, validation ครบ ให้ใช้ `post-mortem` ก่อน close เมื่อ root cause ยังควรถูกเก็บไว้
3. ย้ายเฉพาะ link ของ ticket จาก board ปัจจุบันไป `obsidian/kanban/work-kanban-board.md (## CLOSED)`
4. เปลี่ยน `Status:` ใน ticket file เป็น `closed`
5. ระบุเหตุผลที่ปิด เช่น duplicate, obsolete, out of scope, หรือ replaced by ticket อื่น
6. ถ้า optional Lark sync เปิดอยู่ ให้รัน `php artisan ticket:move-lark WORK-XXXX closed` หลัง local board/status อัปเดตแล้ว และ report failure โดยไม่ revert local move แบบเงียบ ๆ

### 10. Close Splint

เมื่อผู้ใช้สั่ง `/kanban sprint close` หรือ `/kanban sprint close --name=splint-X`:

1. อ่าน `obsidian/kanban/work-kanban-board.md` และรวบรวม entries ทั้งหมดใน `## DONE` และ `## CLOSED`
2. ถ้าทั้งสอง section ว่างเปล่า ให้ report ว่าไม่มีอะไร archive และหยุด
3. กำหนดชื่อ splint file ใหม่:
   - ถ้ามี `--name=` ให้ใช้ค่านั้น (เช่น `splint-3`)
   - ถ้าไม่มี ให้ scan ไฟล์ `obsidian/kanban/splint-*.md` ที่มีอยู่ หาเลขสูงสุด แล้ว +1
4. สร้าง `obsidian/kanban/splint-N-kanban-board.md` ด้วย format ที่มีเฉพาะ `## DONE` และ `## CLOSED` sections พร้อม links จากข้อ 1
5. ลบ entries ของ tickets ที่ archive แล้วออกจาก `## DONE` และ `## CLOSED` ใน `work-kanban-board.md`
6. ห้ามแตะ sections อื่น (`## BACKLOG`, `## PLAN`, `## TODO`, `## INPROGRESS`, `## REVIEW`) — tickets ที่ยังค้างค้างอยู่ที่เดิมโดยอัตโนมัติ
7. ห้ามย้ายหรือ rename ticket files ใน `obsidian/kanban/tasks/`
8. ห้ามเปลี่ยน `Status:` ใน ticket files ใดๆ ทั้งสิ้น
9. รัน `php artisan obsidian:sync-apb-progress` หลังอัปเดตเสร็จ; ถ้า fail ให้ report แต่ห้าม revert สิ่งที่ทำไปแล้ว
10. แสดงผลสรุป: ชื่อไฟล์ splint archive ที่สร้าง, tickets ที่ถูก archive, tickets ที่ยังคงอยู่บน active board

Format ของ splint archive file:

```md
---

kanban-plugin: board

---

## DONE

- [WORK-XXXX](tasks/WORK-XXXX.md): Ticket title


## CLOSED

- [WORK-XXXX](tasks/WORK-XXXX.md): Ticket title

%% kanban:settings
{"kanban-plugin":"board","list-collapse":[false,false]}
%%
```

## Operating Rules

- Board files เก็บเฉพาะ heading และ list item link เท่านั้น
- Ticket file เป็น source of truth ของรายละเอียดทั้งหมด
- ย้ายสถานะด้วยการย้าย link ระหว่าง board files และอัปเดต `Status:` ใน ticket file
- ห้าม duplicate ticket link ไว้หลาย board พร้อมกัน
- ห้ามเปลี่ยน path ของ ticket file ระหว่าง flow ปกติ
- ห้ามย้าย ticket ไป done หาก review verdict ไม่ใช่ `PASS` หรือยังขาด test/build/format ที่จำเป็น
- ใช้ `fullstack-guardian` เฉพาะ ticket ที่มี full-stack/security impact หรือ regression risk สูง; งานเสี่ยงต่ำใช้ lightweight review
- ใช้ `post-mortem` เฉพาะ bugfix ที่มี repro, root cause, fix, validation และ root cause ยังมีคุณค่าต่อ future debugging
- หากมีการแก้ไขหลังเข้า review ให้ปรับ `Review Notes` และรัน verification ใหม่
- ต้องใช้ `using-superpowers` ก่อนเริ่ม ticket และใช้ Superpowers skill อื่นตามความเหมาะสมของ scope
- หาก ticket มี ambiguity หรือ plan risk ให้ย้อนกลับไป `/kanban plan`; หากมี bug report หรือ regression ให้ใช้ `debug-mantra`; หากมี test/build/runtime failure ที่ root cause ยังไม่ชัด ให้ใช้ `systematic-debugging`
- ถ้ามีไฟล์เปลี่ยนแปลงที่ไม่ได้เกี่ยวกับ ticket ห้าม revert เอง ให้ทำงานเฉพาะ scope ของ ticket
