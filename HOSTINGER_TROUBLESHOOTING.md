# حل المشاكل الشائعة على Hostinger

## المشاكل الشائعة وحلولها

### ❌ المشكلة 1: "UntrustedHost" Error

**الأعراض:**
```
Error: [next-auth][error][UntrustedHost]
```

**الحل:**
✅ تم إصلاحها - `trustHost: true` موجود في `src/auth.config.ts`

**تأكد من:**
- `NEXTAUTH_URL` مضبوط بشكل صحيح في `.env`
- `NEXTAUTH_URL` يجب أن يكون بنفس دومين الموقع (مثلاً: `https://yourdomain.com`)

---

### ❌ المشكلة 2: قاعدة البيانات لا تعمل

**الأعراض:**
- خطأ في الاتصال بقاعدة البيانات
- "Can't reach database server"

**الحل:**
1. تأكد من `DATABASE_URL` في `.env`:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/database_name"
   ```

2. تأكد من:
   - اسم المستخدم صحيح
   - كلمة المرور صحيحة
   - اسم قاعدة البيانات موجود
   - Host صحيح (عادة `localhost` في Hostinger)

3. اختبر الاتصال:
   ```bash
   npx prisma db push
   ```

---

### ❌ المشكلة 3: "Module not found" أو "Cannot find module"

**الأعراض:**
```
Error: Cannot find module '@prisma/client'
```

**الحل:**
```bash
# احذف node_modules و package-lock.json
rm -rf node_modules package-lock.json

# أعد التثبيت
npm install

# توليد Prisma Client
npx prisma generate
```

---

### ❌ المشكلة 4: المشروع لا يبدأ أو يتوقف فوراً

**الأعراض:**
- المشروع لا يبدأ
- يتوقف بعد ثواني

**الحل:**
1. تأكد من `NODE_ENV=production` في `.env`
2. تأكد من أن `npm run build` تم بنجاح
3. راجع logs:
   ```bash
   pm2 logs pos-system
   ```
   أو في Hostinger hPanel > Node.js App > Logs

4. تأكد من Startup File في Node.js App:
   ```
   .next/standalone/server.js
   ```

---

### ❌ المشكلة 5: الصور والملفات لا تظهر

**الأعراض:**
- الصور لا تظهر
- 404 للصور

**الحل:**
1. تأكد من وجود مجلد `public/uploads`:
   ```bash
   mkdir -p public/uploads
   ```

2. تأكد من صلاحيات الملفات:
   ```bash
   chmod -R 755 public
   ```

3. في Next.js، الملفات في `public/` متاحة مباشرة على `/filename`

---

### ❌ المشكلة 6: "Server Actions" لا تعمل

**الأعراض:**
- الأزرار لا تعمل
- خطأ في Server Actions

**الحل:**
1. تأكد من `ALLOWED_ORIGINS` في `.env`:
   ```env
   ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
   ```

2. أعد بناء المشروع:
   ```bash
   npm run build
   ```

---

### ❌ المشكلة 7: تسجيل الدخول لا يعمل

**الأعراض:**
- لا يمكن تسجيل الدخول
- خطأ في Authentication

**الحل:**
1. تأكد من `NEXTAUTH_SECRET` موجود في `.env`
2. تأكد من `NEXTAUTH_URL` صحيح
3. راجع logs في console للمزيد من التفاصيل

---

### ❌ المشكلة 8: "Port already in use"

**الأعراض:**
```
Error: Port 3000 is already in use
```

**الحل:**
1. في Hostinger Node.js App، تأكد من Port مضبوط بشكل صحيح
2. أو استخدم متغير بيئة:
   ```env
   PORT=3000
   ```

---

### ❌ المشكلة 9: المشروع بطيء جداً

**الأعراض:**
- الصفحات تأخذ وقت طويل للتحميل

**الحل:**
1. تأكد من استخدام `production` build:
   ```bash
   npm run build
   npm start
   ```

2. استخدم PM2 بدلاً من node مباشرة:
   ```bash
   pm2 start npm --name "pos-system" -- start
   ```

3. راجع قاعدة البيانات - قد تحتاج فهارس (indexes)

---

### ❌ المشكلة 10: التغييرات لا تظهر بعد الرفع

**الأعراض:**
- التغييرات في الكود لا تظهر

**الحل:**
1. أعد بناء المشروع:
   ```bash
   npm run build
   ```

2. أعد تشغيل المشروع:
   ```bash
   pm2 restart pos-system
   ```

3. امسح cache المتصفح (Ctrl+Shift+R)

---

## نصائح عامة

1. **راجع Logs دائماً**: في Hostinger hPanel > Node.js App > Logs
2. **تأكد من Environment Variables**: جميع المتغيرات موجودة وصحيحة
3. **اختبر محلياً أولاً**: تأكد من أن المشروع يعمل محلياً قبل الرفع
4. **استخدم PM2**: لإدارة أفضل للمشروع
5. **Backup قاعدة البيانات**: قبل أي تغييرات كبيرة

---

## الدعم

إذا لم تحل المشكلة:
1. راجع `HOSTINGER_DEPLOYMENT.md` للخطوات الكاملة
2. راجع logs في Hostinger
3. تأكد من جميع الخطوات في دليل النشر

