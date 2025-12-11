"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useData } from "@/context/DataContext";

const dashboardTiles = [
  {
    title: "Manage Products",
    description: "Add, edit, or adjust inventory levels in seconds.",
    href: "/inventory",
    accent: "text-indigo-600 bg-indigo-50 border-indigo-100",
  },
  {
    title: "Launch POS",
    description: "Scan product codes, build carts, and complete sales.",
    href: "/pos",
    accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
];

export default function Home() {
  const { products, sales, dataReady } = useData();

  const totals = useMemo(() => {
    const inventoryValue = products.reduce(
      (sum, product) => sum + parseFloat(product.price) * product.stockQuantity,
      0
    );
    const today = new Date().toISOString().slice(0, 10);
    const todaysSales = sales.filter((sale) => sale.date.startsWith(today));
    return {
      totalProducts: products.length,
      inventoryValue,
      todaysRevenue: todaysSales.reduce(
        (sum, sale) => sum + parseFloat(sale.totalAmount),
        0
      ),
    };
  }, [products, sales]);

  if (!dataReady) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading POS data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card-surface">
          <p className="text-sm font-medium text-slate-500">Products</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totals.totalProducts}
          </p>
          <p className="text-xs text-slate-500">
            Active SKUs ready for sale today.
          </p>
        </article>
        <article className="card-surface">
          <p className="text-sm font-medium text-slate-500">Inventory Value</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            ${totals.inventoryValue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">
            Based on current stock and pricing.
          </p>
        </article>
        <article className="card-surface">
          <p className="text-sm font-medium text-slate-500">Today&apos;s Sales</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            ${totals.todaysRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">Revenue collected so far.</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {dashboardTiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`card-surface border-dashed ${tile.accent}`}
          >
            <p className="pill border-current">{tile.title}</p>
            <p className="mt-3 text-base text-slate-700">{tile.description}</p>
            <p className="mt-6 text-sm font-semibold">Go to {tile.title} →</p>
          </Link>
        ))}
      </section>

      <section className="card-surface">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Sales
            </h2>
            <p className="text-sm text-slate-500">
              The latest completed transactions with totals.
            </p>
          </div>
          <Link
            href="/pos"
            className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Start Sale
          </Link>
        </div>
        <div className="mt-6 divide-y divide-slate-100">
          {sales.length === 0 && (
            <p className="py-4 text-sm text-slate-500">
              No sales yet. Run your first transaction from the POS tab.
            </p>
          )}
          {sales.slice(0, 5).map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  Invoice #{sale.id.slice(-6).toUpperCase()}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(sale.date).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/invoice/${sale.id}`}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                ${parseFloat(sale.totalAmount).toFixed(2)}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
