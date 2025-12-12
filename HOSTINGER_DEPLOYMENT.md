# دليل نشر المشروع على Hostinger

هذا الدليل يوضح كيفية نشر مشروع POS على سيرفر Hostinger.

## المتطلبات الأساسية

1. حساب Hostinger مع Node.js hosting
2. قاعدة بيانات MySQL أو PostgreSQL (متوفرة في Hostinger)
3. Git (لرفع الكود)

---

## الخطوة 1: إعداد قاعدة البيانات

### أ. إنشاء قاعدة بيانات في Hostinger

1. ادخل إلى **hPanel** في Hostinger
2. اذهب إلى **Databases** > **MySQL Databases**
3. أنشئ قاعدة بيانات جديدة:
   - **Database Name**: اختر اسماً (مثلاً: `pos_db`)
   - **Username**: اختر اسم مستخدم
   - **Password**: اختر كلمة مرور قوية
4. احفظ معلومات الاتصال:
   - Host: عادة `localhost` أو `127.0.0.1`
   - Port: `3306` لـ MySQL أو `5432` لـ PostgreSQL
   - Database Name
   - Username
   - Password

### ب. تحديث Prisma Schema

1. افتح `prisma/schema.prisma`
2. غيّر `provider` من `sqlite` إلى `mysql` أو `postgresql`:

```prisma
datasource db {
  provider = "mysql"  // أو "postgresql"
  url      = env("DATABASE_URL")
}
```

3. أنشئ connection string:
   - **MySQL**: `mysql://username:password@host:port/database_name`
   - **PostgreSQL**: `postgresql://username:password@host:port/database_name`

مثال:
```
DATABASE_URL="mysql://user123:MyPass123@localhost:3306/pos_db"
```

---

## الخطوة 2: إعداد متغيرات البيئة

### أ. إنشاء ملف `.env` على السيرفر

بعد رفع الكود إلى Hostinger، أنشئ ملف `.env` في المجلد الرئيسي:

```bash
# Database
DATABASE_URL="mysql://username:password@localhost:3306/pos_db"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# Allowed Origins
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Node Environment
NODE_ENV="production"
```

### ب. توليد NEXTAUTH_SECRET

على جهازك المحلي، شغّل:

```bash
openssl rand -base64 32
```

انسخ النتيجة وضعها في `NEXTAUTH_SECRET`.

---

## الخطوة 3: رفع الكود إلى Hostinger

### أ. رفع الملفات عبر Git

1. **في Hostinger hPanel**:
   - اذهب إلى **Advanced** > **Git**
   - أنشئ Git repository جديد أو استخدم repository موجود

2. **على جهازك المحلي**:
   ```bash
   git add .
   git commit -m "Prepare for Hostinger deployment"
   git push origin main
   ```

3. **في Hostinger**:
   - Pull من Git repository
   - أو استخدم File Manager لرفع الملفات يدوياً

### ب. رفع الملفات يدوياً (بدون Git)

1. **Zip المشروع** (تأكد من استثناء `node_modules` و `.next`)
2. **ارفع الملف** عبر File Manager في hPanel
3. **استخرج الملف** في المجلد الرئيسي

---

## الخطوة 4: تثبيت Dependencies

### عبر SSH (إن كان متاحاً):

```bash
cd /path/to/your/project
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### عبر Terminal في hPanel:

1. اذهب إلى **Advanced** > **Terminal**
2. شغّل نفس الأوامر أعلاه

---

## الخطوة 5: بناء المشروع

```bash
npm run build
```

هذا سينشئ مجلد `.next` مع ملفات الإنتاج.

---

## الخطوة 6: تشغيل المشروع

### أ. استخدام PM2 (موصى به)

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل المشروع
pm2 start npm --name "pos-system" -- start

# حفظ الإعدادات
pm2 save
pm2 startup
```

### ب. استخدام Node.js مباشرة

```bash
node .next/standalone/server.js
```

### ج. استخدام Node.js App في hPanel

1. اذهب إلى **Advanced** > **Node.js**
2. أنشئ Node.js App جديد:
   - **App Name**: `pos-system`
   - **Node.js Version**: اختر أحدث إصدار (18+)
   - **App Root**: المسار إلى مجلد المشروع
   - **App URL**: اختر دومين أو subdomain
   - **Startup File**: `.next/standalone/server.js`
3. أضف Environment Variables من الخطوة 2
4. اضغط **Create**

---

## الخطوة 7: إعداد قاعدة البيانات

بعد رفع الكود وتثبيت Dependencies:

```bash
# توليد Prisma Client
npx prisma generate

# تطبيق Schema على قاعدة البيانات
npx prisma db push

# إضافة بيانات أولية (اختياري)
npm run prisma:seed
```

---

## الخطوة 8: التحقق من العمل

1. افتح الموقع في المتصفح
2. تأكد من:
   - صفحة Login تظهر
   - يمكنك تسجيل الدخول
   - قاعدة البيانات تعمل
   - الصور والملفات الثابتة تعمل

---

## حل المشاكل الشائعة

### المشكلة 1: "UntrustedHost" Error

**الحل**: تأكد من:
- `trustHost: true` موجود في `src/auth.config.ts` ✅ (موجود)
- `NEXTAUTH_URL` مضبوط بشكل صحيح في `.env`

### المشكلة 2: قاعدة البيانات لا تعمل

**الحل**:
- تأكد من `DATABASE_URL` صحيح
- تأكد من أن قاعدة البيانات موجودة في Hostinger
- تأكد من أن المستخدم لديه صلاحيات كافية

### المشكلة 3: الصور لا تظهر

**الحل**:
- تأكد من أن مجلد `public/uploads` موجود
- تأكد من صلاحيات الملفات (chmod 755)

### المشكلة 4: "Module not found" Errors

**الحل**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
npx prisma generate
```

### المشكلة 5: المشروع لا يبدأ

**الحل**:
- تأكد من `NODE_ENV=production`
- تأكد من أن `npm run build` تم بنجاح
- راجع logs في PM2 أو Node.js App

---

## نصائح إضافية

1. **استخدم HTTPS**: تأكد من تفعيل SSL في Hostinger
2. **Backup**: قم بعمل backup دوري لقاعدة البيانات
3. **Monitoring**: استخدم PM2 monitoring أو Hostinger logs
4. **Performance**: استخدم CDN للملفات الثابتة إن أمكن

---

## الدعم

إذا واجهت مشاكل:
1. راجع logs في Hostinger hPanel
2. تأكد من جميع Environment Variables
3. تأكد من أن جميع الخطوات تمت بشكل صحيح

