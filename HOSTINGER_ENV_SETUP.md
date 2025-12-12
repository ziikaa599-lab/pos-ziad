# إعداد متغيرات البيئة لـ Hostinger

## معلومات قاعدة البيانات

- **Database Name**: `u942940955_pos_db`
- **Username**: `u942940955_pos_db`
- **Password**: `Op?G5m56`
- **Host**: `localhost` (أو `127.0.0.1`)
- **Port**: `3306`
- **Domain**: `olive-turtle-486957.hostingersite.com`

---

## ملف `.env` على السيرفر

أنشئ ملف `.env` في المجلد الرئيسي للمشروع على Hostinger وانسخ هذا المحتوى:

```env
# Database - MySQL on Hostinger
DATABASE_URL="mysql://u942940955_pos_db:Op?G5m56@localhost:3306/u942940955_pos_db"

# NextAuth Configuration
# ⚠️ مهم: استخدم الـ secret المولّد أدناه
NEXTAUTH_SECRET="bPEy4b2IPlHm+daE3ZUuFSBI5YX284LdYMsqIDtnrzw="

# Your production URL
NEXTAUTH_URL="https://olive-turtle-486957.hostingersite.com"

# Allowed Origins for Server Actions
ALLOWED_ORIGINS="https://olive-turtle-486957.hostingersite.com,https://www.olive-turtle-486957.hostingersite.com"

# Node Environment
NODE_ENV="production"
```

---

## ملاحظات مهمة

1. **DATABASE_URL**: 
   - تأكد من أن كلمة المرور `Op?G5m56` تحتوي على `?` - قد تحتاج إلى encoding في بعض الحالات
   - إذا كان هناك مشكلة في الاتصال، جرب encoding الـ password:
     - `Op?G5m56` → `Op%3FG5m56` (حيث `?` = `%3F`)

2. **NEXTAUTH_SECRET**: 
   - تم توليد secret آمن لك: `bPEy4b2IPlHm+daE3ZUuFSBI5YX284LdYMsqIDtnrzw=`
   - **لا تشارك هذا الـ secret مع أحد**

3. **NEXTAUTH_URL**: 
   - يجب أن يكون بنفس دومين الموقع
   - تأكد من استخدام `https://` وليس `http://`

---

## إذا كان هناك مشكلة في الاتصال بقاعدة البيانات

إذا كان الـ password يحتوي على أحرف خاصة مثل `?`، قد تحتاج إلى encoding:

```env
# إذا كان Password يحتوي على ?، استخدم:
DATABASE_URL="mysql://u942940955_pos_db:Op%3FG5m56@localhost:3306/u942940955_pos_db"
```

أو جرب بدون encoding أولاً، وإذا لم يعمل، استخدم encoding.

---

## الخطوات التالية

بعد إنشاء ملف `.env` على السيرفر:

1. **توليد Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **تطبيق Schema على قاعدة البيانات**:
   ```bash
   npx prisma db push
   ```

3. **إضافة بيانات أولية (اختياري)**:
   ```bash
   npm run prisma:seed
   ```

4. **بناء المشروع**:
   ```bash
   npm run build
   ```

5. **تشغيل المشروع**:
   ```bash
   npm start
   ```

---

## اختبار الاتصال

للتأكد من أن الاتصال بقاعدة البيانات يعمل:

```bash
npx prisma db push
```

إذا نجح الأمر، ستظهر رسالة "Your database is now in sync with your schema."

