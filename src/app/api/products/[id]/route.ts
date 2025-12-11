import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Decimal } from 'decimal.js';

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Serialize Decimal to string
  return NextResponse.json({
    ...product,
    price: product.price.toString(),
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Admin-only: Only admins can update products
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.productCode !== undefined) updates.productCode = body.productCode;
    if (body.price !== undefined) updates.price = new Decimal(body.price);
    if (body.stockQuantity !== undefined) updates.stockQuantity = Number(body.stockQuantity);
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;

    const product = await prisma.product.update({ where: { id }, data: updates });
    // Serialize Decimal to string
    return NextResponse.json({
      ...product,
      price: product.price.toString(),
    });
  } catch (error) {
    console.error('Update product error', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Admin-only: Only admins can delete products
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete product error', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
