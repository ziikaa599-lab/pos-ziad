"use client";

import { FormEvent, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { Product, useData } from "@/context/DataContext";

type ProductForm = {
  productCode: string;
  name: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
};

const emptyForm: ProductForm = {
  productCode: "",
  name: "",
  price: "",
  stockQuantity: "",
  imageUrl: "",
};

export default function InventoryPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    dataReady,
  } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stockProductId, setStockProductId] = useState<string>("");
  const [stockMode, setStockMode] = useState<"add" | "deduct">("add");
  const [stockAmount, setStockAmount] = useState<string>("1");

  const totalInventoryValue = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + parseFloat(product.price) * product.stockQuantity,
        0
      ),
    [products]
  );

  if (!dataReady) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading inventory...
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedPrice = Number(form.price);
    const parsedQuantity = Number(form.stockQuantity);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFeedback("Price must be a positive number.");
      return;
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setFeedback("Stock must be a whole number greater than or equal to 0.");
      return;
    }

    const duplicateCode = products.some(
      (product) =>
        product.productCode.trim().toLowerCase() ===
        form.productCode.trim().toLowerCase() &&
        product.id !== editingId
    );
    if (duplicateCode) {
      setFeedback("That product code already exists. Please choose another.");
      return;
    }

    const payload = {
      productCode: form.productCode.trim(),
      name: form.name.trim(),
      price: parsedPrice.toFixed(2), // Convert to string with 2 decimal places
      stockQuantity: parsedQuantity,
      imageUrl: form.imageUrl || undefined,
    };

    if (editingId) {
      updateProduct(editingId, payload);
      setFeedback("Product updated successfully.");
    } else {
      addProduct(payload);
      setFeedback("Product added successfully.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setImagePreview("");
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      productCode: product.productCode,
      name: product.name,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      imageUrl: product.imageUrl || "",
    });
    setImagePreview(product.imageUrl || "");
    setFeedback(`Editing ${product.name}`);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFeedback(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setFeedback(null);

    try {
      // Validate file
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Please use JPG, PNG, or WebP images.');
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      }

      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const { url } = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
      setFeedback("Image uploaded successfully.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to process image."
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFeedback("Image removed.");
  };

  const handleStockSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stockProductId) {
      setFeedback("Please select a product to adjust stock.");
      return;
    }
    const amount = Number(stockAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setFeedback("Adjustment amount must be a whole number greater than 0.");
      return;
    }

    const delta = stockMode === "add" ? amount : -amount;
    adjustStock(stockProductId, delta);
    const productName =
      products.find((product) => product.id === stockProductId)?.name ?? "";
    setFeedback(
      `${stockMode === "add" ? "Added" : "Deducted"} ${amount} units for ${productName}.`
    );
    setStockAmount("1");
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Delete ${name}? This action cannot be undone.`
    );
    if (!confirmed) return;
    deleteProduct(id);
    if (editingId === id) {
      resetForm();
    }
    setFeedback(`${name} deleted.`);
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:border-slate-300/80 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500">Total SKUs</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {products.length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Unique products in inventory</p>
          </div>
          <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-indigo-50 blur-2xl"></div>
        </article>
        <article className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:border-slate-300/80 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500">Items on Hand</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {products.reduce((sum, product) => sum + product.stockQuantity, 0)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total units across all SKUs</p>
          </div>
          <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 blur-2xl"></div>
        </article>
        <article className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:border-slate-300/80 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500">Inventory Value</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              ${totalInventoryValue.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Retail value at current prices</p>
          </div>
          <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-violet-50 blur-2xl"></div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>
              <p className="text-sm text-slate-500">
                Maintain product details and pricing.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 ml-1">
                Product Code / SKU
              </label>
              <input
                value={form.productCode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    productCode: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mt-1"
                placeholder="e.g. ESP-1001"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 ml-1">
                Product Name
              </label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mt-1"
                placeholder="e.g. Cappuccino"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mt-1"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockQuantity}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      stockQuantity: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mt-1"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="text-sm font-medium text-slate-700 ml-1">
                Product Image (Optional)
              </label>
              <div className="mt-2 space-y-3">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      width={120}
                      height={120}
                      className="rounded-lg border-2 border-slate-200 object-cover"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-sm font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isProcessingImage ? "Processing..." : "Upload Image"}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="text-xs text-slate-500">
                  JPG, PNG, or WebP. Max 2MB. Will be resized to 400x400px.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
              {editingId ? "Save Changes" : "Add Product"}
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <h2 className="text-lg font-semibold text-slate-900">
            Adjust Stock
          </h2>
          <p className="text-sm text-slate-500">
            Quickly add intake shipments or deduct spoilage.
          </p>

          <form onSubmit={handleStockSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 ml-1">
                Select Product
              </label>
              <select
                value={stockProductId}
                onChange={(event) => setStockProductId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mt-1"
              >
                <option value="">Choose a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.stockQuantity} on hand)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 ml-1">Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStockMode("add")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${stockMode === "add"
                    ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setStockMode("deduct")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${stockMode === "deduct"
                    ? "bg-rose-100 text-rose-700 ring-2 ring-rose-500/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  Deduct Stock
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 ml-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={stockAmount}
                onChange={(event) => setStockAmount(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mt-1"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98] bg-slate-900 hover:bg-slate-800 shadow-slate-500/20"
            >
              Apply Adjustment
            </button>
          </form>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Product Catalog
            </h2>
            <p className="text-sm text-slate-500">
              Searchable overview of all stocked items.
            </p>
          </div>
          {feedback && (
            <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {feedback}
            </p>
          )}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-base">
            <thead>
              <tr>
                <th className="px-3 py-2.5 text-base font-semibold text-slate-500">
                  Image
                </th>
                <th className="px-3 py-2.5 text-base font-semibold text-slate-500">
                  Product
                </th>
                <th className="px-3 py-2.5 text-base font-semibold text-slate-500">
                  SKU
                </th>
                <th className="px-3 py-2.5 text-base font-semibold text-slate-500">
                  Price
                </th>
                <th className="px-3 py-2.5 text-base font-semibold text-slate-500">
                  Stock
                </th>
                <th className="px-3 py-2.5 text-base font-semibold text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-3 py-2.5">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-lg border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-base font-semibold text-slate-800">
                    {product.name}
                  </td>
                  <td className="px-3 py-2.5 text-base text-slate-500">
                    {product.productCode}
                  </td>
                  <td className="px-3 py-2.5 text-base text-slate-500">
                    ${parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-base font-medium text-slate-700">
                    {product.stockQuantity}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-base font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-base font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>
                    No products yet. Add your first item above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
