# SETUP — ติดตั้ง IV Load Alert

ใช้เวลาประมาณ 30–45 นาที ทั้งหมดฟรีและไม่ต้องผูกบัตร

**ลองก่อนได้ทันที:** เปิด `index.html` ผ่าน GitHub Pages โดยยังไม่ต้องตั้งค่าอะไร แอปจะอยู่ในโหมดทดลอง ใช้ได้บนเครื่องเดียว ทดสอบโดยเปิด 2 แท็บ แท็บหนึ่งตั้งเป็น "Tablet กลาง" อีกแท็บเป็น "มือถือพยาบาล" แล้วกด ⚙ → "ใส่ข้อมูลตัวอย่าง"

---

## 1. สร้าง Firebase project
1. ไปที่ https://console.firebase.google.com → **Add project** ตั้งชื่อ เช่น `iv-load-alert` (ปิด Google Analytics ได้)
2. เมนู **Build → Firestore Database → Create database**
   - Location: `asia-southeast1 (Singapore)`
   - เลือก Production mode
3. แท็บ **Rules** → ลบของเดิม วางเนื้อหา `firestore.rules` → **Publish**
4. เมนู **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**

## 2. สร้าง Web app และเอา config
1. **Project settings (⚙) → General → Your apps → ไอคอน `</>`** ตั้งชื่อแอป (ไม่ต้องติ๊ก Hosting)
2. คัดลอกก้อน `firebaseConfig = { ... }`
3. เปิด `index.html` แก้บรรทัด
   ```js
   const FIREBASE_CONFIG = null;
   ```
   เป็น
   ```js
   const FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
   ```

## 3. เอา VAPID key (สำหรับ push)
1. **Project settings → Cloud Messaging → Web configuration → Web Push certificates → Generate key pair**
2. คัดลอก key แล้วใส่ใน `index.html`
   ```js
   const VAPID_KEY = 'BXXXX...';
   ```

## 4. เอาขึ้น GitHub Pages
1. สร้าง repo ใหม่ เช่น `iv-load-alert`
2. อัปโหลดทุกไฟล์ **ยกเว้นโฟลเดอร์ `apps-script/`** ซึ่งไม่จำเป็นต้องขึ้นเว็บ (ถ้าขึ้นไปด้วยก็ไม่เป็นปัญหา เพราะในไฟล์ไม่มีความลับ)
3. **Settings → Pages → Branch: main / root → Save**
4. URL จะเป็น `https://<username>.github.io/iv-load-alert/`
5. กลับไปที่ Firebase: **Authentication → Settings → Authorized domains → Add domain** → ใส่ `<username>.github.io`

## 5. ตั้ง Google Apps Script (ตัวส่ง push)
1. **Firebase → Project settings → Service accounts → Generate new private key** จะได้ไฟล์ .json มา (**เก็บเป็นความลับ ห้ามขึ้น GitHub**)
2. ไปที่ https://script.google.com → **New project** ตั้งชื่อ `IV Load Push`
3. ลบโค้ดเดิม วางเนื้อหา `apps-script/Code.gs`
4. **Project Settings (⚙)**
   - ติ๊ก **Show "appsscript.json" manifest file in editor** แล้วกลับไปที่ Editor เปิด `appsscript.json` วางเนื้อหาจากไฟล์ของเรา
   - **Script properties → Add script property**
     - Property: `SERVICE_ACCOUNT_JSON`
     - Value: เปิดไฟล์ .json จากข้อ 1 คัดลอก **ทั้งก้อน** มาวาง
5. กลับไปที่ Editor เลือกฟังก์ชัน `testConnection` → **Run** → Authorize (กด Advanced → Go to … (unsafe) เพราะเป็นสคริปต์ของเราเอง)
   - ดู Execution log ว่าขึ้น `project: ...` และ `รายการ active: 0`
6. เลือก `setupTrigger` → **Run** (ทำครั้งเดียว) → ตรวจที่เมนู **Triggers (⏰)** ว่ามี `tick` ทุก 1 นาที

## 6. ตั้งค่าเครื่อง
**Tablet กลาง**
1. เปิด URL ใน Chrome → เลือก **Tablet กลาง**
2. แตะหน้าจอ 1 ครั้งเพื่อเปิดเสียง (ต้องทำใหม่ทุกครั้งที่รีเฟรช)
3. ตั้ง Tablet ไม่ให้จอดับ / ไม่ล็อกจอ และเปิดเสียงสุด
4. แนะนำให้เปิด push สำรอง: กด ⚙ → **เปิด/รีเฟรชแจ้งเตือน (สำรอง)** → อนุญาต ถ้าเผลอปิดเบราว์เซอร์ Tablet จะยังเด้งเตือน

**Android**
1. เปิด URL ใน **Chrome** → เมนู ⋮ → **Add to Home screen / ติดตั้งแอป**
2. เปิดแอป → **มือถือพยาบาล** → ใส่ชื่อ → **เปิดแจ้งเตือน** → อนุญาต
3. แนะนำ: Settings → Apps → Chrome → Battery → **Unrestricted**

**iPhone (iOS 16.4 ขึ้นไป)**
1. เปิด URL ใน **Safari** → ปุ่มแชร์ → **Add to Home Screen**
2. เปิดแอปจากไอคอนบนหน้าจอโฮม (ห้ามเปิดจาก Safari) → **มือถือพยาบาล** → ใส่ชื่อ → **เปิดแจ้งเตือน** → Allow
3. ตรวจ Settings → Notifications → IV Load → เปิดเสียงและ Banner

## 7. ทดสอบ
1. ใน Apps Script รัน `testConnection` ต้องเห็นเครื่องที่ลงทะเบียน เช่น `nurse:พลอย`
2. รัน `testPushAll` มือถือต้องเด้ง "ทดสอบ IV Load Alert"
3. ลงรายการจริงโดยตั้งเวลา "อื่นๆ = 1 นาที" แล้วล็อกจอมือถือ
   - Tablet ต้องดังตรงเวลา
   - มือถือต้องเด้งภายในประมาณ 1–2 นาที และเด้งซ้ำทุกนาที
   - กด Check (จากเครื่องไหนก็ได้) แล้วทุกเครื่องต้องหยุด
4. Tablet ต้องขึ้น "ระบบแจ้งมือถือ ✓" ภายใน 5 นาทีหลังตั้ง trigger

## แก้ปัญหา
| อาการ | ตรวจ |
|---|---|
| ขึ้น "เชื่อมต่อผิดพลาด" | Authorized domains (ข้อ 4.5), เปิด Anonymous Auth แล้วหรือยัง, Rules publish แล้วหรือยัง |
| มือถือไม่เด้ง | `testConnection` เห็นชื่อเครื่องไหม → ถ้าไม่เห็น ให้กด ⚙ → เปิด/รีเฟรชแจ้งเตือน; iPhone ต้องเปิดจากไอคอนหน้าจอโฮม |
| Tablet ขึ้น "⚠ ระบบแจ้งมือถือไม่ทำงาน" | Apps Script → Executions ดู error, Triggers ยังอยู่ไหม |
| `token error` ใน log | วาง SERVICE_ACCOUNT_JSON ไม่ครบก้อน |
| Tablet ไม่มีเสียง | แตะหน้าจอ 1 ครั้ง, เสียงเครื่อง, ⚙ → ทดสอบเสียง |
