# Gang System — คู่มือติดตั้ง

## ขั้นตอนที่ 1: ตั้งค่า Supabase

1. เปิด [supabase.com](https://supabase.com) → สร้าง project ใหม่
2. ไปที่ **SQL Editor** → วาง SQL จาก `supabase-schema.sql` แล้วกด Run
3. ไปที่ **Settings → API** → Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## ขั้นตอนที่ 2: แก้ไข .env.local

```env
DISCORD_CLIENT_ID=1543934229472215171
DISCORD_CLIENT_SECRET=pQo_EaoFjzPO1Qbb6o4Ee6LuusIlNygl
NEXTAUTH_URL=https://gang-system.vercel.app
NEXTAUTH_SECRET=random-secret-string-here
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> ⚠️ **NEXTAUTH_SECRET** — สร้าง random string ได้ที่: https://generate-secret.vercel.app/32

## ขั้นตอนที่ 3: Deploy บน Vercel

1. Upload โค้ดขึ้น GitHub
2. เปิด [vercel.com](https://vercel.com) → Import GitHub repo
3. ตั้งค่า **Environment Variables** ใน Vercel (ใส่ค่าเดียวกับ .env.local)
4. กด **Deploy**

## ขั้นตอนที่ 4: ตั้งค่า Admin คนแรก

หลัง Deploy และ Login ครั้งแรกแล้ว:
1. ไปที่ Supabase → **Table Editor → users**
2. หาแถวของตัวเอง → แก้ `role` เป็น `admin` และ `is_approved` เป็น `true`

หรือรัน SQL:
```sql
UPDATE users SET role = 'admin', is_approved = true WHERE discord_id = 'YOUR_DISCORD_ID';
```

## ขั้นตอนที่ 5: อัปเดต Discord Redirect URL

หลังได้ Vercel URL จริงแล้ว ไปที่ Discord Developer Portal → OAuth2 → แก้ Redirect เป็น URL จริง
