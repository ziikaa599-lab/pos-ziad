# دليل رفع المشروع على GitHub و Deployment على Hostinger

## ✅ ما تم إعداده

1. ✅ المشروع جاهز للرفع على GitHub
2. ✅ `.gitignore` محدث (يستثني ملفات قاعدة البيانات)
3. ✅ `package.json` يحتوي على `postinstall` script (يقوم بـ `prisma generate` تلقائياً)
4. ✅ Prisma Schema محدث لاستخدام MySQL

---

## 📤 رفع المشروع على GitHub

### 1. التحقق من الحالة الحالية

```bash
git status
```

### 2. إضافة جميع الملفات

```bash
git add .
```

### 3. Commit

```bash
git commit -m "Prepare for Hostinger deployment with MySQL"
```

### 4. Push إلى GitHub

```bash
git push -u origin main
```

---

## 🔧 إعداد Auto-Deployment على Hostinger

### الطريقة 1: استخدام Git في hPanel

1. **ادخل إلى hPanel**
2. **اذهب إلى Advanced > Git**
3. **Connect Repository**:
   - Repository: `basel184/pos-ziad`
   - Branch: `main`
   - Auto Deploy: ✅ فعّل
4. **Build Settings**:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Install Command: `npm install`

### الطريقة 2: استخدام Node.js App Manager

1. **ادخل إلى hPanel**
2. **اذهب إلى Advanced > Node.js**
3. **أنشئ Node.js App**:
   - **App Name**: `pos-system`
   - **Node.js Version**: 18.x أو 20.x
   - **App Root**: المسار إلى المشروع
   - **Startup File**: `.next/standalone/server.js`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Install Command**: `npm install`
   - **Git Repository**: `basel184/pos-ziad`
   - **Branch**: `main`
   - **Auto Deploy**: ✅ فعّل

---

## 🔐 متغيرات البيئة على Hostinger

في Node.js App > Environment Variables، أضف:

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

## 🗄️ إعداد قاعدة البيانات (أول مرة فقط)

بعد أول deployment، يجب تطبيق Schema على قاعدة البيانات:

### في Terminal على السيرفر:

```bash
# 1. اذهب إلى مجلد المشروع
cd /path/to/your/project

# 2. توليد Prisma Client (يتم تلقائياً في postinstall، لكن للتأكد)
npx prisma generate

# 3. تطبيق Schema على قاعدة البيانات
npx prisma db push

# 4. إضافة بيانات أولية (اختياري)
npm run prisma:seed
```

---

## 🔄 عملية Auto-Deployment

عندما ترفع تغييرات على GitHub:

1. **GitHub** → Push إلى `main` branch
2. **Hostinger** → يكتشف التغييرات تلقائياً
3. **Hostinger** → يقوم بـ:
   - `git pull`
   - `npm install`
   - `npx prisma generate` (تلقائياً من postinstall)
   - `npm run build`
   - إعادة تشغيل المشروع

---

## ⚠️ ملاحظات مهمة

1. **قاعدة البيانات**: يجب تطبيق Schema يدوياً في أول مرة فقط
2. **Environment Variables**: يجب إضافتها في hPanel قبل أول deployment
3. **Prisma Client**: يتم توليده تلقائياً من `postinstall` script
4. **Build**: يتم تلقائياً عند كل push إلى GitHub

---

## 🐛 حل المشاكل

### إذا فشل Build:

1. **راجع Logs** في hPanel > Node.js App > Logs
2. **تأكد من Environment Variables**
3. **تأكد من أن قاعدة البيانات متصلة**

### إذا ظهر خطأ 500:

راجع ملف `FIX_500_ERROR.md`

### إذا ظهر "npx: command not found":

راجع ملف `FIX_NPX_NOT_FOUND.md`

---

## ✅ التحقق من النجاح

بعد deployment:

1. افتح الموقع: `https://olive-turtle-486957.hostingersite.com`
2. يجب أن تظهر صفحة Login
3. لا يجب أن يكون هناك أخطاء 500 في Console

---

## 📚 ملفات المساعدة

- `HOSTINGER_DEPLOYMENT.md` - دليل مفصل
- `FIX_500_ERROR.md` - حل خطأ 500
- `FIX_NPX_NOT_FOUND.md` - حل مشكلة npm/npx
- `HOSTINGER_TROUBLESHOOTING.md` - حل المشاكل الشائعة

