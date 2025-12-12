# دليل إزالة Prisma والاتصال المباشر بقاعدة البيانات

## ✅ ما تم إنجازه

تم استبدال Prisma بالاتصال المباشر بقاعدة البيانات MySQL باستخدام `mysql2`.

---

## 📋 التغييرات التي تمت

### 1. تحديث package.json
- ✅ إزالة `@prisma/client` و `prisma`
- ✅ إضافة `mysql2` و `@types/mysql2`
- ✅ تحديث scripts (إزالة prisma scripts)

### 2. إنشاء اتصال قاعدة بيانات جديد
- ✅ `src/lib/db.ts` - اتصال MySQL مباشر مع connection pool

### 3. تحديث جميع API Routes
- ✅ `src/auth.ts` - استخدام SQL مباشر
- ✅ `src/app/api/products/route.ts` - استخدام SQL مباشر
- ✅ `src/app/api/products/[id]/route.ts` - استخدام SQL مباشر
- ✅ `src/app/api/users/route.ts` - استخدام SQL مباشر
- ✅ `src/app/api/sales/route.ts` - استخدام SQL مباشر
- ✅ `src/app/invoice/[id]/page.tsx` - استخدام SQL مباشر

### 4. إنشاء Scripts جديدة
- ✅ `scripts/init-db.js` - إنشاء الجداول مباشرة
- ✅ `scripts/seed.js` - إضافة بيانات أولية

---

## 🚀 الخطوات التالية

### 1. تثبيت Dependencies الجديدة

```bash
npm install
```

### 2. إنشاء الجداول في قاعدة البيانات

```bash
# في Terminal على Hostinger
node scripts/init-db.js
```

أو في MySQL مباشرة:
```sql
-- انسخ محتوى prisma/migrations/20251204194248_use_decimal_for_prices/migration.sql
-- وشغّله في phpMyAdmin أو MySQL
```

### 3. إضافة بيانات أولية (اختياري)

```bash
node scripts/seed.js
```

---

## 📝 ملاحظات مهمة

### 1. DATABASE_URL
- يجب أن يكون موجوداً في Environment Variables
- يجب أن يكون مع encoding للـ password: `Op%3FG5m56`

### 2. Build Command في Hostinger
- **Build Command**: `npm run build` (بدون prisma)
- **Install Command**: `npm install`

### 3. لا حاجة لـ Prisma بعد الآن
- ✅ لا حاجة لـ `prisma generate`
- ✅ لا حاجة لـ `prisma db push`
- ✅ الاتصال مباشر بقاعدة البيانات

---

## 🔧 Functions المتاحة

من `src/lib/db.ts`:

```typescript
// Query multiple rows
const products = await query("SELECT * FROM Product");

// Query single row
const user = await queryOne("SELECT * FROM User WHERE id = ?", [id]);

// Execute (insert/update/delete)
await execute("INSERT INTO Product ...", [values]);

// Generate ID
const id = generateId();
```

---

## ✅ المزايا

1. **أسرع** - لا حاجة لـ Prisma Client generation
2. **أبسط** - SQL مباشر
3. **أقل dependencies** - mysql2 فقط
4. **أسهل في الـ deployment** - لا حاجة لـ prisma generate

---

## ⚠️ ملاحظات

- **الجداول موجودة**: إذا كانت الجداول موجودة من Prisma، لا حاجة لإنشائها مرة أخرى
- **البيانات محفوظة**: البيانات الموجودة ستبقى كما هي
- **SQL مباشر**: يجب كتابة SQL queries يدوياً

---

## 🐛 إذا واجهت مشاكل

1. **تأكد من وجود الجداول**: شغّل `scripts/init-db.js`
2. **تأكد من DATABASE_URL**: يجب أن يكون صحيح في Environment Variables
3. **راجع Logs**: في Node.js App > Logs

