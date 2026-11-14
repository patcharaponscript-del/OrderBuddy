# OrderBuddy AI – Smart Sales Assistant

เว็บแอปผู้ช่วยสำหรับร้านค้าออนไลน์ (React + TypeScript + Vite + Tailwind CSS + Lucide)

1. **ผู้ช่วยตอบแชท** – ร่างคำตอบภาษาไทยจากข้อความลูกค้าและข้อมูลสินค้าที่คุณกรอก
2. **ตรวจสอบออเดอร์ (Order Quality Control)** – เทียบแชทลูกค้ากับออเดอร์ที่บันทึก ทีละช่อง (สินค้า สี ไซซ์ จำนวน ราคาต่อหน่วย ยอดรวม)

> **เวอร์ชันเดโม:** ใช้กฎ (rule-based) ที่ทำงานในเบราว์เซอร์ทั้งหมด **ไม่ได้เชื่อมต่อ AI จริง** ไม่มีฐานข้อมูล ไม่มีระบบล็อกอิน ข้อมูลถูกเก็บใน `localStorage` ของเบราว์เซอร์ ระบบไม่แต่งราคา สต็อก หรือนโยบายร้านขึ้นเอง และไม่อนุมัติหรือแก้ไขออเดอร์อัตโนมัติ

## รันในเครื่อง

ต้องมี [Node.js](https://nodejs.org) 18 ขึ้นไป

```bash
npm install
npm run dev
```

เปิด http://localhost:5173 (เปิดจากมือถือในเครือข่ายเดียวกันได้ด้วย `npm run dev -- --host`)

| คำสั่ง | หน้าที่ |
| --- | --- |
| `npm run dev` | รันโหมดพัฒนา |
| `npm run typecheck` | ตรวจ TypeScript |
| `npm run build` | ตรวจ TypeScript แล้ว build ไปที่ `dist/` |
| `npm run preview` | ดูผล build ในเครื่อง |

## อัปโหลดขึ้น GitHub

1. สร้าง repository ใหม่บน GitHub (ไม่ต้องติ๊กสร้าง README หรือ .gitignore)
2. ในโฟลเดอร์โปรเจกต์:

```bash
git init
git add .
git commit -m "Initial commit: OrderBuddy AI"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

ไม่ใช้คำสั่ง: เปิด repo บน GitHub กด **Add file → Upload files** แล้วลากไฟล์ทั้งหมดในโฟลเดอร์ (ไม่รวม `node_modules` และ `dist`) ไปวาง

## Deploy บน Vercel

1. เข้า [vercel.com](https://vercel.com) แล้วล็อกอินด้วย GitHub
2. กด **Add New → Project** แล้วเลือก repository นี้
3. Vercel ตรวจพบ Vite อัตโนมัติ: Build Command `npm run build`, Output Directory `dist`
4. กด **Deploy** (ไม่ต้องตั้งค่า Environment Variables)

ใช้ Netlify หรือ Cloudflare Pages ได้เหมือนกัน: build command `npm run build`, publish directory `dist`

## โครงสร้างโปรเจกต์

```
src/
  App.tsx              เลย์เอาต์ (sidebar / แถบนำทางมือถือ) และ state + localStorage
  types.ts             ชนิดข้อมูลทั้งหมด
  lib/parse.ts         ดึงสี ไซซ์ จำนวน ราคา จากข้อความไทยด้วย regex
  lib/verify.ts        ตรรกะเปรียบเทียบออเดอร์
  lib/reply.ts         ตรรกะร่างคำตอบ (เดโม ไม่มี AI)
  lib/defaults.ts      ข้อมูลเดโมเริ่มต้น
  components/ui.tsx    คอมโพเนนต์ร่วม
  pages/               Dashboard, ChatAssistant, OrderCheck
```

## ข้อจำกัดของเวอร์ชันเดโม

- การอ่านข้อความไทยใช้ regex จึงรองรับรูปแบบประโยคพื้นฐาน เช่น “ขอเสื้อสีดำไซซ์ M จำนวน 2 ตัว ตัวละ 159 บาท” ประโยคที่ซับซ้อนอาจดึงข้อมูลไม่ครบ ระบบจะแสดงเป็น “ข้อมูลไม่ครบ” แทนการเดา
- สต็อกเป็นค่าเดียวต่อสินค้า ยังไม่แยกตามสี/ไซซ์
- ข้อมูลสินค้าเริ่มต้น (สี ไซซ์ สต็อก) เป็นข้อมูลตัวอย่างสำหรับเดโมเท่านั้น
- หากต้องการต่อ AI จริงในอนาคต ให้แทนที่ `generateReplies` ใน `src/lib/reply.ts` ด้วยการเรียก API ผ่านเซิร์ฟเวอร์ของคุณเอง (อย่าใส่ API key ในโค้ดฝั่งเบราว์เซอร์)
