import { query, queryOne, execute, generateId } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Decimal } from 'decimal.js';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sales = await query<any>(
      "SELECT * FROM `Sale` ORDER BY date DESC"
    );

    const salesWithItems = await Promise.all(
      sales.map(async (sale: any) => {
        const soldItems = await query<any>(
          "SELECT * FROM `SoldItem` WHERE saleId = ?",
          [sale.id]
        );
        return {
          ...sale,
          subtotal: sale.subtotal?.toString() || sale.subtotal,
          tax: sale.tax?.toString() || sale.tax,
          totalAmount: sale.totalAmount?.toString() || sale.totalAmount,
          soldItems: soldItems.map((item: any) => ({
            ...item,
            price: item.price?.toString() || item.price,
          })),
        };
      })
    );

    return NextResponse.json(salesWithItems);
  } catch (error) {
    console.error('Fetch sales error', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { soldItems, subtotal, tax, totalAmount } = body;

    const normalizedItems: Array<any> = [];
    for (const s of soldItems) {
      let productId = s.productId;
      
      if (!productId && s.productCode) {
        const prod = await queryOne<any>(
          "SELECT id FROM `Product` WHERE productCode = ?",
          [s.productCode]
        );
        if (prod) productId = prod.id;
      } else if (productId) {
        const exists = await queryOne<any>(
          "SELECT id FROM `Product` WHERE id = ?",
          [productId]
        );
        if (!exists && s.productCode) {
          const prod = await queryOne<any>(
            "SELECT id FROM `Product` WHERE productCode = ?",
            [s.productCode]
          );
          if (prod) productId = prod.id;
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
        price: s.price,
      });
    }

    const saleId = generateId();
    await execute(
      "INSERT INTO `Sale` (id, date, subtotal, tax, totalAmount, createdAt) VALUES (?, NOW(), ?, ?, ?, NOW())",
      [saleId, subtotal.toString(), tax.toString(), totalAmount.toString()]
    );

    for (const item of normalizedItems) {
      const itemId = generateId();
      await execute(
        "INSERT INTO `SoldItem` (id, saleId, productId, productCode, name, quantity, price, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [itemId, saleId, item.productId, item.productCode, item.name, item.quantity, item.price.toString(), null]
      );

      // Update stock quantity
      try {
        await execute(
          "UPDATE `Product` SET stockQuantity = stockQuantity - ? WHERE id = ?",
          [item.quantity, item.productId]
        );
      } catch (err) {
        console.error('Failed to decrement stock for product', item.productId, err);
      }
    }

    const sale = await queryOne<any>("SELECT * FROM `Sale` WHERE id = ?", [saleId]);
    const fetchedSoldItems = await query<any>("SELECT * FROM `SoldItem` WHERE saleId = ?", [saleId]);

    const serialized = {
      ...sale,
      subtotal: sale.subtotal?.toString() || sale.subtotal,
      tax: sale.tax?.toString() || sale.tax,
      totalAmount: sale.totalAmount?.toString() || sale.totalAmount,
      soldItems: fetchedSoldItems.map((item: any) => ({
        ...item,
        price: item.price?.toString() || item.price,
      })),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Record sale error', error);
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}
