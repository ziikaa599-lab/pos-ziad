import { queryOne, execute } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Decimal } from 'decimal.js';

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await queryOne<any>("SELECT * FROM Product WHERE id = ?", [id]);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    ...product,
    price: product.price?.toString() || product.price,
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(body.name);
    }
    if (body.productCode !== undefined) {
      updates.push("productCode = ?");
      values.push(body.productCode);
    }
    if (body.price !== undefined) {
      updates.push("price = ?");
      values.push(body.price.toString());
    }
    if (body.stockQuantity !== undefined) {
      updates.push("stockQuantity = ?");
      values.push(Number(body.stockQuantity));
    }
    if (body.imageUrl !== undefined) {
      updates.push("imageUrl = ?");
      values.push(body.imageUrl);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push("updatedAt = NOW()");
    values.push(id);

    await execute(
      `UPDATE \`Product\` SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const product = await queryOne<any>("SELECT * FROM `Product` WHERE id = ?", [id]);
    return NextResponse.json({
      ...product,
      price: product.price?.toString() || product.price,
    });
  } catch (error) {
    console.error('Update product error', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await execute("DELETE FROM `Product` WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete product error', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
