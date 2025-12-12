# إعداد Auto-Deployment مع تطبيق قاعدة البيانات تلقائياً

## المشكلة الحالية

- ✅ الـ build يتم تلقائياً عند الـ push
- ❌ قاعدة البيانات لم يتم تطبيق Schema عليها تلقائياً

---

## ✅ الحل: إضافة تطبيق قاعدة البيانات في Build Command

### في Hostinger hPanel:

1. **اذهب إلى Advanced > Deployments** (أو **Node.js**)
2. **افتح إعدادات Deployment**
3. **عدّل Build Command** إلى:

```bash
npm install && npx prisma generate && npx prisma db push && npm run build
```

أو إذا كان Build Command منفصل عن Install Command:

**Install Command:**
```bash
npm install
```

**Build Command:**
```bash
npx prisma generate && npx prisma db push && npm run build
```

---

## 🔧 طريقة أخرى: إضافة Script في package.json

يمكن إضافة script يقوم بكل شيء:

### تحديث package.json:

```json
{
  "scripts": {
    "build": "next build",
    "build:deploy": "prisma generate && prisma db push && next build",
    "postinstall": "prisma generate"
  }
}
```

ثم في Hostinger، استخدم:
**Build Command:**
```bash
npm run build:deploy
```

---

## 📋 الخطوات التفصيلية في Hostinger

### 1. في hPanel > Advanced > Deployments:

1. **افتح Deployment Settings**
2. **Build Settings**:
   - **Install Command**: `npm install`
   - **Build Command**: `npx prisma generate && npx prisma db push && npm run build`
   - **Startup File**: `.next/standalone/server.js`

### 2. أو في Node.js App Manager:

1. **اذهب إلى Advanced > Node.js**
2. **افتح Node.js App**
3. **في قسم Build Settings**:
   - **Build Command**: `npx prisma generate && npx prisma db push && npm run build`
   - **Install Command**: `npm install`

---

## ⚠️ ملاحظات مهمة

1. **أول مرة فقط**: قد تحتاج إلى تطبيق قاعدة البيانات يدوياً إذا فشل
2. **Environment Variables**: تأكد من وجود `DATABASE_URL` في Environment Variables
3. **Seed Data**: إذا أردت إضافة بيانات أولية تلقائياً، أضف:
   ```bash
   npx prisma generate && npx prisma db push && npm run prisma:seed && npm run build
   ```

---

## 🔄 بعد التحديث

بعد تحديث Build Command:

1. **احفظ الإعدادات**
2. **أعد Deploy** (Redeploy) من hPanel
3. **راقب Logs** للتأكد من نجاح العملية

---

## ✅ التحقق من النجاح

بعد الـ deployment:

1. افتح الموقع: `https://olive-turtle-486957.hostingersite.com`
2. يجب أن يعمل بدون أخطاء
3. جرب تسجيل الدخول:
   - Admin: `admin` / `admin123`
   - Cashier: `cashier1` / `123456`

---

## 🐛 إذا فشل Auto-Deployment

إذا فشل `prisma db push` في Build Command:

1. **راجع Logs** في Deployment
2. **تأكد من Environment Variables** (خاصة `DATABASE_URL`)
3. **جرب تطبيق قاعدة البيانات يدوياً** مرة واحدة:
   ```bash
   npx prisma db push
   ```
4. **بعد ذلك**، Auto-Deployment يجب أن يعمل

