# حل خطأ 500 في /api/auth/session

## المشكلة

```
api/auth/session:1 Failed to load resource: the server responded with a status of 500
There was a problem with the server configuration.
```

**السبب المحتمل**: الجداول غير موجودة في قاعدة البيانات.

---

## ✅ الحل: إنشاء الجداول

### الطريقة 1: استخدام Script (الأسهل)

في Terminal على Hostinger:

```bash
# 1. اذهب إلى مجلد المشروع
cd /path/to/your/project

# 2. تأكد من وجود DATABASE_URL في Environment Variables
# (يجب أن يكون موجوداً في hPanel)

# 3. أنشئ الجداول
node scripts/init-db.js

# 4. أضف بيانات أولية (اختياري)
node scripts/seed.js
```

### الطريقة 2: استخدام phpMyAdmin

1. **ادخل إلى phpMyAdmin**: `https://auth-db1817.hstgr.io`
2. **اختر قاعدة البيانات**: `u942940955_pos_db`
3. **اذهب إلى SQL**
4. **انسخ والصق** محتوى `prisma/migrations/20251204194248_use_decimal_for_prices/migration.sql`
5. **شغّل SQL**

---

## 🔍 التحقق من المشكلة

### في Terminal على Hostinger:

```bash
# اختبار الاتصال
node -e "
const mysql = require('mysql2/promise');
const url = process.env.DATABASE_URL;
const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
const [, user, password, host, port, database] = match;
mysql.createConnection({
  host, port: parseInt(port), user, 
  password: decodeURIComponent(password), database
}).then(conn => {
  console.log('✅ Connected!');
  return conn.query('SHOW TABLES');
}).then(([rows]) => {
  console.log('Tables:', rows);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"
```

---

## 📋 الجداول المطلوبة

يجب أن تكون هذه الجداول موجودة:

1. `User` - للمستخدمين
2. `Product` - للمنتجات
3. `Sale` - للمبيعات
4. `SoldItem` - لعناصر المبيعات

---

## ✅ بعد إنشاء الجداول

1. **أعد تشغيل المشروع** (من Node.js App Manager)
2. **افتح الموقع**: `https://mediumturquoise-wolf-882981.hostingersite.com`
3. **يجب أن يعمل `/api/auth/session` بدون أخطاء**

---

## 🐛 إذا استمرت المشكلة

### 1. تحقق من Logs

في Node.js App > Logs، ابحث عن:
- `ER_NO_SUCH_TABLE` - الجداول غير موجودة
- `Access denied` - مشكلة في الاتصال
- `Can't reach database server` - مشكلة في DATABASE_URL

### 2. تحقق من DATABASE_URL

في Environment Variables:
```
DATABASE_URL=mysql://u942940955_pos_db:Op%3FG5m56@localhost:3306/u942940955_pos_db
```

### 3. اختبر الاتصال

```bash
node scripts/init-db.js
```

إذا نجح، الجداول ستُنشأ تلقائياً.

---

## 📝 ملاحظات

- **أول مرة فقط**: يجب إنشاء الجداول
- **بعد ذلك**: الجداول موجودة ولا حاجة لإعادة إنشائها
- **البيانات محفوظة**: البيانات الموجودة ستبقى كما هي

