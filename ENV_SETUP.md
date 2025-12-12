# إعداد متغيرات البيئة (Environment Variables)

## الملفات المطلوبة

أنشئ ملف `.env` في المجلد الرئيسي للمشروع (بجانب `package.json`).

## محتوى ملف `.env`

انسخ هذا المحتوى إلى ملف `.env` وعدّل القيم حسب بيئتك:

```env
# Database
# For local development (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# For production on Hostinger (use MySQL or PostgreSQL)
# DATABASE_URL="mysql://user:password@host:port/database"
# or
# DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth Configuration
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Your production URL (replace with your actual domain)
NEXTAUTH_URL="http://localhost:3000"
# For Hostinger: NEXTAUTH_URL="https://yourdomain.com"

# Allowed Origins for Server Actions (comma-separated)
# For Hostinger: ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
ALLOWED_ORIGINS="localhost:3000"

# Node Environment
NODE_ENV="development"
```

## للـ Production على Hostinger

استخدم هذه القيم:

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="https://yourdomain.com"
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
NODE_ENV="production"
```

## توليد NEXTAUTH_SECRET

شغّل هذا الأمر لتوليد secret آمن:

```bash
openssl rand -base64 32
```

انسخ النتيجة وضعها في `NEXTAUTH_SECRET`.

## ملاحظات

- **لا ترفع ملف `.env` إلى Git** - إنه موجود في `.gitignore`
- **استخدم قيم مختلفة** للـ development والـ production
- **احفظ `NEXTAUTH_SECRET` بشكل آمن** - لا تشاركه مع أحد

