// Legacy better-sqlite3 DB shim removed.
// This file was intentionally replaced to avoid native builds.
// Use `src/lib/prisma.ts` (Prisma client) for database access instead.

export default (function legacyDbShim() {
	throw new Error(
		'Legacy better-sqlite3 db is removed. Use src/lib/prisma.ts (Prisma client) instead.'
	);
})();
