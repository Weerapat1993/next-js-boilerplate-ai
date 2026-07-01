# ออกแบบหน้า Landing Page ใหม่

## รายละเอียด Feature
- ออกแบบหน้า Landing Page ใหม่ ทำ UI ให้ดูเรียบหรูเหมือนกับ Application ใน Apple Store หรือ ดู UI จาก Component `UserProfile` ใน `@clark/nextjs` เป็นตัวอย่าง
- หน้าที่ต้องออกแบบใหม่มีดังนี้
  1. Home
  2. About
  3. Counter
  4. Portfolio
  5. Dashboard

---

## ผลการ Grill (Requirements เพิ่มเติม)

### บริบทแอป
- เป็น **Boilerplate showcase** — โชว์ stack และ features ของ boilerplate อย่างสวยงาม

### Design System
- **Theme**: รองรับทั้ง light/dark ตาม OS `prefers-color-scheme` (Tailwind v4 dark mode)
- **Style direction**: เรียบหรู minimal เหมือน Apple developer docs
- **Layout**: Sidebar navigation (left sidebar) เหมือน Apple Developer Documentation
- ไม่ใช้ top nav bar — ใช้ sidebar persistent แทน

### หน้าที่ต้องออกแบบ

#### 1. Home
- **Hero section** บนสุด: headline + subtext + CTA button
- ตามด้วย feature grid แสดง stack ของ boilerplate
- แทนที่ content ปัจจุบัน (feature list แบบ plain text + Sponsors)

#### 2. About
- ออกแบบ layout ให้สอดคล้องกับ Apple developer docs style
- Content ยังคงใช้ i18n key `About.about_paragraph`

#### 3. Counter
- คง functionality เดิม (`CounterForm` + `CurrentCount`)
- ออกแบบ layout + styling ให้ดูดีขึ้น

#### 4. Portfolio
- **Card grid layout** — redesign เป็น card สวยงาม
- ยังใช้ mock data เหมือนเดิม (6 items hardcoded)
- ไม่ต้องเชื่อม DB

#### 5. Dashboard (auth-protected)
- **Stats overview** — cards แสดง metrics:
  - Counter value (ปัจจุบัน)
  - Portfolio count (จำนวน items)
  - User info (จาก Clerk)
- ไม่มี hero/welcome section — เริ่ม stats ทันที

### สิ่งที่ยังต้องตัดสินใจ (Open Questions)
- Font family: ใช้ system font stack (`-apple-system, BlinkMacSystemFont`) หรือ import custom font (เช่น Inter)?
- Sidebar มี mobile responsive อย่างไร? (hamburger menu หรือ bottom nav?)
- Color palette: neutral gray scale เหมือน Apple docs หรือมี accent color?
- `@clark/nextjs` ไม่มีใน `package.json` — ตัดออกจาก reference หรือต้อง install?
