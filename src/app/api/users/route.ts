import { query, execute, generateId } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await query<any>(
    "SELECT id, username, name, role, createdAt FROM `User`"
  );
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { username, password, name, role } = body;
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const id = generateId();

    await execute(
      "INSERT INTO `User` (id, username, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
      [id, username, hashed, name || null, role || 'CASHIER']
    );

    return NextResponse.json({ id, username, name, role }, { status: 201 });
  } catch (error: any) {
    console.error('Create user error', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, username, newPassword } = body;
    if (!id && !username) {
      return NextResponse.json({ error: 'Missing user identifier' }, { status: 400 });
    }

    if (!newPassword) {
      return NextResponse.json({ error: 'Missing newPassword' }, { status: 400 });
    }

    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);

    const where = id ? "id = ?" : "username = ?";
    const value = id || username;

    await execute(
      `UPDATE \`User\` SET password = ?, updatedAt = NOW() WHERE ${where}`,
      [hashed, value]
    );

    const updated = await queryOne<any>(`SELECT id FROM \`User\` WHERE ${where}`, [value]);
    return NextResponse.json({ ok: true, id: updated?.id });
  } catch (error) {
    console.error('Reset user password error', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
