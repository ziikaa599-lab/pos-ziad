# إعداد Deployment على Hostinger من GitHub

## معلومات المشروع

- **Repository**: `basel184/pos-ziad`
- **Domain**: `olive-turtle-486957.hostingersite.com`
- **Database**: MySQL على Hostinger

---

## متغيرات البيئة المطلوبة على Hostinger

في Hostinger hPanel > Node.js App > Environment Variables، أضف:

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

## إعداد Auto-Deployment من GitHub

### في Hostinger hPanel:

1. **اذهب إلى Advanced > Git**
2. **Connect Repository**:
   - Repository URL: `git@github.com:basel184/pos-ziad.git`
   - أو `https://github.com/basel184/pos-ziad.git`
   - Branch: `main`
3. **Auto Deploy**: فعّل Auto Deploy
4. **Build Command**: `npm install && npx prisma generate && npm run build`
5. **Install Command**: `npm install`

---

## إعداد Node.js App

1. **اذهب إلى Advanced > Node.js**
2. **أنشئ App جديد**:
   - **App Name**: `pos-system`
   - **Node.js Version**: 18.x أو 20.x
   - **App Root**: المسار إلى المشروع
   - **Startup File**: `.next/standalone/server.js`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Install Command**: `npm install`

---

## بعد أول Deployment

بعد أول build، يجب تطبيق قاعدة البيانات:

```bash
# في Terminal على السيرفر
npx prisma db push
npm run prisma:seed
```

---

## ملاحظات

- `postinstall` script في `package.json` يقوم تلقائياً بـ `prisma generate`
- تأكد من أن Environment Variables موجودة قبل الـ build
- قاعدة البيانات يجب تطبيقها يدوياً في أول مرة

