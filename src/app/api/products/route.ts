import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Decimal } from 'decimal.js';

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  // Serialize Decimal fields to strings for JSON
  const serialized = products.map((p: { id: string; productCode: string; name: string; price: any; stockQuantity: number; imageUrl: string | null; createdAt: Date; updatedAt: Date }) => ({
    ...p,
    price: p.price.toString(),
  }));
  return NextResponse.json(serialized);
}

export async function POST(req: Request) {
  // Admin-only: Only admins can create products
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { productCode, name, price, stockQuantity, imageUrl } = body;
    const product = await prisma.product.create({
      data: {
        productCode,
        name,
        price: new Decimal(price),
        stockQuantity: Number(stockQuantity),
        imageUrl
      }
    });
    // Serialize Decimal to string
    return NextResponse.json({
      ...product,
      price: product.price.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
