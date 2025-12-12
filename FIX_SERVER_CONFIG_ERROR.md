# حل خطأ "There was a problem with the server configuration"

## المشكلة

```
There was a problem with the server configuration. Check the server logs for more information.
```

هذا الخطأ يحدث عادة لأن:
1. ❌ قاعدة البيانات لم يتم تطبيق Schema عليها
2. ❌ Prisma Client غير موجود أو غير محدث
3. ❌ Environment Variables غير صحيحة

---

## ✅ الحل السريع

### الخطوة 1: تطبيق قاعدة البيانات

في Hostinger hPanel > **Advanced > Terminal**، شغّل:

```bash
# 1. اذهب إلى مجلد المشروع
cd /home/u942940955/domains/olive-turtle-486957.hostingersite.com/public_html

# أو المسار الصحيح حسب إعداداتك

# 2. توليد Prisma Client
npx prisma generate

# 3. تطبيق Schema على قاعدة البيانات (هذا هو الأهم!)
npx prisma db push

# 4. إضافة بيانات أولية (admin user)
npm run prisma:seed
```

---

## 🔍 إذا لم يعمل Terminal

### استخدم Node.js App Manager:

1. **اذهب إلى hPanel > Advanced > Node.js**
2. **افتح Node.js App الخاص بك**
3. **في قسم "Terminal" أو "Console"**، شغّل نفس الأوامر أعلاه

---

## 📋 التحقق من Environment Variables

تأكد من وجود جميع المتغيرات في **Node.js App > Environment Variables**:

```
DATABASE_URL=mysql://u942940955_pos_db:Op%3FG5m56@localhost:3306/u942940955_pos_db
NEXTAUTH_SECRET=bPEy4b2IPlHm+daE3ZUuFSBI5YX284LdYMsqIDtnrzw=
NEXTAUTH_URL=https://olive-turtle-486957.hostingersite.com
AUTH_URL=https://olive-turtle-486957.hostingersite.com
AUTH_TRUST_HOST=1
AUTH_ALLOWED_HOSTS=*.hostingersite.com
NEXTAUTH_URL_INTERNAL=https://olive-turtle-486957.hostingersite.com
ALLOWED_ORIGINS=https://olive-turtle-486957.hostingersite.com,https://www.olive-turtle-486957.hostingersite.com
NODE_ENV=production
```

---

## 🐛 إذا استمرت المشكلة

### 1. تحقق من Logs

في **Node.js App > Logs**، ابحث عن:
- أخطاء Prisma
- أخطاء Database connection
- أخطاء NextAuth

### 2. اختبر الاتصال بقاعدة البيانات

```bash
# في Terminal
npx prisma db push
```

**إذا ظهر خطأ:**
- تحقق من `DATABASE_URL` صحيح
- تأكد من أن قاعدة البيانات موجودة
- تأكد من اسم المستخدم وكلمة المرور

### 3. تحقق من Prisma Client

```bash
# توليد Prisma Client
npx prisma generate

# التحقق من وجوده
ls -la node_modules/.prisma/client
```

---

## ✅ بعد حل المشكلة

بعد تطبيق قاعدة البيانات بنجاح:

1. ✅ `/api/auth/session` سيعمل بدون أخطاء
2. ✅ صفحة Login ستعمل بشكل صحيح
3. ✅ يمكنك تسجيل الدخول باستخدام:
   - **Admin**: `admin` / `admin123`
   - **Cashier**: `cashier1` / `123456`

---

## 📝 ملاحظات

- **أول مرة فقط**: يجب تطبيق قاعدة البيانات يدوياً
- **بعد ذلك**: عند كل deployment جديد، إذا لم تتغير Schema، لا حاجة لتطبيق قاعدة البيانات مرة أخرى
- **إذا تغير Schema**: يجب تطبيق `npx prisma db push` مرة أخرى

---

## 🔄 إعادة تشغيل المشروع

بعد تطبيق قاعدة البيانات:

```bash
# إذا كنت تستخدم PM2
pm2 restart pos-system

# أو أعد تشغيل Node.js App من hPanel
```

