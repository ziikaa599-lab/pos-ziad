import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Decimal } from 'decimal.js';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({ include: { soldItems: true }, orderBy: { date: 'desc' } });
    // Serialize Decimal fields to strings
    const serialized = sales.map((sale: { id: string; date: Date; subtotal: any; tax: any; totalAmount: any; createdAt: Date; soldItems: any[] }) => ({
      ...sale,
      subtotal: sale.subtotal.toString(),
      tax: sale.tax.toString(),
      totalAmount: sale.totalAmount.toString(),
      soldItems: sale.soldItems.map((item: { id: string; saleId: string; productId: string; productCode: string; name: string; quantity: number; price: any; imageUrl: string | null }) => ({
        ...item,
        price: item.price.toString(),
      })),
    }));
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Fetch sales error', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { soldItems, subtotal, tax, totalAmount } = body;
    // Normalize and validate sold items: ensure each references an existing product id
    const normalizedItems: Array<any> = [];
    for (const s of soldItems) {
      let productId = s.productId;
      // If productId is missing or not found, try to resolve by productCode
      if (!productId) {
        if (s.productCode) {
          const prod = await prisma.product.findUnique({ where: { productCode: s.productCode } });
          if (prod) productId = prod.id;
        }
      } else {
        const exists = await prisma.product.findUnique({ where: { id: productId } });
        if (!exists) {
          // try by code
          if (s.productCode) {
            const prod = await prisma.product.findUnique({ where: { productCode: s.productCode } });
            if (prod) productId = prod.id;
          }
        }
      }

      if (!productId) {
        console.error('Product referenced in sale not found', s);
        return NextResponse.json({ error: 'Product not found', item: s }, { status: 400 });
      }

      normalizedItems.push({
        productId,
        productCode: s.productCode,
        name: s.name,
        quantity: Number(s.quantity),
        price: new Decimal(s.price),
      });
    }

    const sale = await prisma.sale.create({
      data: {
        subtotal: new Decimal(subtotal),
        tax: new Decimal(tax),
        totalAmount: new Decimal(totalAmount),
        soldItems: {
          create: normalizedItems.map((s: { productId: string; productCode: string; name: string; quantity: number; price: any }) => ({
            productId: s.productId,
            productCode: s.productCode,
            name: s.name,
            quantity: s.quantity,
            price: s.price,
          })),
        },
      },
      include: { soldItems: true },
    });

    // Adjust stock quantities for each product using the validated normalized items
    for (const item of normalizedItems) {
      try {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: Number(item.quantity) } as any },
        });
      } catch (err) {
        // Log and continue if product was removed concurrently
        console.error('Failed to decrement stock for product', item.productId, err);
      }
    }

    // Serialize Decimal fields to strings
    const serialized = {
      ...sale,
      subtotal: sale.subtotal.toString(),
      tax: sale.tax.toString(),
      totalAmount: sale.totalAmount.toString(),
      soldItems: sale.soldItems.map((item: { id: string; saleId: string; productId: string; productCode: string; name: string; quantity: number; price: any; imageUrl: string | null }) => ({
        ...item,
        price: item.price.toString(),
      })),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Record sale error', error);
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}
