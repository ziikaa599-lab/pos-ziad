import { query, queryOne, execute, generateId } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Decimal } from 'decimal.js';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await query<any>(
      "SELECT * FROM `Product` ORDER BY createdAt DESC"
    );
    const serialized = products.map((p: any) => ({
      ...p,
      price: p.price?.toString() || p.price,
    }));
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Fetch products error', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { productCode, name, price, stockQuantity, imageUrl } = body;
    const id = generateId();
    
    await execute(
      "INSERT INTO `Product` (id, productCode, name, price, stockQuantity, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [id, productCode, name, price.toString(), Number(stockQuantity), imageUrl || null]
    );

    const product = await queryOne<any>("SELECT * FROM `Product` WHERE id = ?", [id]);
    return NextResponse.json({
      ...product,
      price: product.price?.toString() || product.price,
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
