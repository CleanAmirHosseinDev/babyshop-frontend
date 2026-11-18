import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertCircle, Pencil, Plus, Search, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../../../shared/hooks/useAuth';
import { formatNumber } from '../../../shared/utils/format';
import { PLACEHOLDER_IMAGE, getFirstImageUrl } from '../../../shared/utils/imageUrl';

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, deleteProduct, loading, error, refresh } = useProducts();
  // حذف محصول در بک‌اند فقط برای Admin مجاز است (سیاست AdminOnly)
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;

    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(term) || product.slug?.toLowerCase().includes(term),
    );
  }, [products, searchTerm]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`محصول «${name}» حذف شود؟`)) return;

    const result = await deleteProduct(id);
    if (result.success) {
      toast.success('محصول حذف شد.');
    } else {
      toast.error(result.message ?? 'حذف محصول انجام نشد.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-right">
      <div className="container-shop py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
          <h1 className="flex items-center gap-2 text-lg font-black text-ink">
            <ShoppingBag className="text-lavender-500" size={22} aria-hidden="true" /> لیست محصولات
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/products/create" className="btn-primary px-4 py-2 text-xs">
              <Plus size={14} aria-hidden="true" /> محصول جدید
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl px-3 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-brand-50"
            >
              ← حساب کاربری
            </Link>
          </div>
        </header>

        <div className="relative mb-5">
          <label htmlFor="admin-product-search" className="sr-only">
            جستجوی محصول
          </label>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-ink-light"
          />
          <input
            id="admin-product-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="جستجوی نام یا اسلاگ محصول…"
            className="field ps-14 text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-brand-50 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-brand-50 bg-brand-50/50 text-[11px] font-black text-ink-soft">
                  <th className="p-4 text-center">تصویر</th>
                  <th className="p-4">نام محصول</th>
                  <th className="p-4">دسته‌بندی</th>
                  <th className="p-4 text-center">قیمت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-50">
                {loading && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-xs text-ink-light">
                      در حال بارگذاری…
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-xs text-red-500">
                      {error}
                      <button type="button" onClick={refresh} className="ms-2 font-bold underline">
                        تلاش دوباره
                      </button>
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-xs text-ink-light">
                      <AlertCircle className="mx-auto mb-2 text-amber-400" size={24} aria-hidden="true" />
                      محصولی یافت نشد.
                    </td>
                  </tr>
                )}

                {filteredProducts.map((product) => (
                  <tr key={product.id} className="text-xs transition-colors hover:bg-brand-50/30">
                    <td className="p-3">
                      <img
                        src={getFirstImageUrl(product.imageUrl)}
                        alt={product.name}
                        width={56}
                        height={56}
                        loading="lazy"
                        decoding="async"
                        className="mx-auto h-14 w-14 rounded-xl border border-brand-50 object-cover"
                        onError={(event) => {
                          const image = event.currentTarget;
                          if (image.dataset.fallbackApplied === 'true') return;
                          image.dataset.fallbackApplied = 'true';
                          image.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-ink">
                        {product.name}
                        {product.isActive === false && (
                          <span className="ms-2 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-black text-gray-500">
                            غیرفعال
                          </span>
                        )}
                      </p>
                      {product.slug && (
                        <p className="mt-1 w-max rounded bg-brand-50 px-2 py-0.5 font-mono text-[10px] text-ink-light" dir="ltr">
                          {product.slug}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold text-brand-600">
                        <Tag size={12} aria-hidden="true" /> {product.categoryName || 'بدون دسته'}
                      </span>
                    </td>

                    <td className="p-4 text-center font-black text-brand-600">{formatNumber(product.price)}</td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          aria-label={`ویرایش ${product.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-lavender-50 text-lavender-500 transition-colors hover:bg-lavender-500 hover:text-white"
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id, product.name)}
                            aria-label={`حذف ${product.name}`}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
