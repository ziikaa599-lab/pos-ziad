# دليل سريع للنشر على Hostinger

## ✅ ما تم إعداده

1. ✅ تم تحديث `prisma/schema.prisma` لاستخدام MySQL
2. ✅ تم توليد `NEXTAUTH_SECRET` آمن
3. ✅ تم إعداد جميع الملفات المطلوبة

---

## 📋 معلومات قاعدة البيانات

- **Database**: `u942940955_pos_db`
- **Username**: `u942940955_pos_db`
- **Password**: `Op?G5m56`
- **Host**: `localhost`
- **Port**: `3306`
- **Domain**: `olive-turtle-486957.hostingersite.com`

---

## 🚀 الخطوات السريعة

### 1. رفع الكود إلى Hostinger

ارفع جميع الملفات إلى السيرفر (باستثناء `node_modules` و `.next`).

### 2. إنشاء ملف `.env` على السيرفر

أنشئ ملف `.env` في المجلد الرئيسي وانسخ هذا:

```env
DATABASE_URL="mysql://u942940955_pos_db:Op?G5m56@localhost:3306/u942940955_pos_db"
NEXTAUTH_SECRET="bPEy4b2IPlHm+daE3ZUuFSBI5YX284LdYMsqIDtnrzw="
NEXTAUTH_URL="https://olive-turtle-486957.hostingersite.com"
ALLOWED_ORIGINS="https://olive-turtle-486957.hostingersite.com,https://www.olive-turtle-486957.hostingersite.com"
NODE_ENV="production"
```

**⚠️ إذا كان هناك مشكلة في الاتصال، استخدم:**
```env
DATABASE_URL="mysql://u942940955_pos_db:Op%3FG5m56@localhost:3306/u942940955_pos_db"
```

### 3. تثبيت Dependencies

```bash
npm install
```

### 4. توليد Prisma Client

```bash
npx prisma generate
```

### 5. تطبيق Schema على قاعدة البيانات

```bash
npx prisma db push
```

### 6. إضافة بيانات أولية (اختياري)

```bash
npm run prisma:seed
```

### 7. بناء المشروع

```bash
npm run build
```

### 8. تشغيل المشروع

**خيار 1: استخدام Node.js App في hPanel**
- اذهب إلى **Advanced** > **Node.js**
- أنشئ App جديد:
  - **Startup File**: `.next/standalone/server.js`
  - **App URL**: اختر دومين أو subdomain
- أضف Environment Variables من الخطوة 2

**خيار 2: استخدام PM2**
```bash
npm install -g pm2
pm2 start npm --name "pos-system" -- start
pm2 save
```

---

## 🔍 اختبار

1. افتح الموقع: `https://olive-turtle-486957.hostingersite.com`
2. يجب أن تظهر صفحة Login
3. جرب تسجيل الدخول

---

## ❌ إذا واجهت مشاكل

راجع ملف `HOSTINGER_TROUBLESHOOTING.md` للحلول الشائعة.

---

## 📚 ملفات التوثيق

- `HOSTINGER_DEPLOYMENT.md` - دليل مفصل
- `HOSTINGER_ENV_SETUP.md` - إعداد متغيرات البيئة
- `HOSTINGER_TROUBLESHOOTING.md` - حل المشاكل

