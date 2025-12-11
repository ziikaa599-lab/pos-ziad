import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Admin-only
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await prisma.user.findMany({ select: { id: true, username: true, name: true, role: true, createdAt: true } });
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
    // password should be already hashed client-side? we recommend hashing in server
    // here we expect a plain password and hash it
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashed, name, role } });
    return NextResponse.json({ id: user.id, username: user.username, name: user.name, role: user.role }, { status: 201 });
  } catch (error) {
    console.error('Create user error', error);
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

    const where = id ? { id } : { username };
    const updated = await prisma.user.update({ where, data: { password: hashed } });
    return NextResponse.json({ ok: true, id: updated.id });
  } catch (error) {
    console.error('Reset user password error', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
