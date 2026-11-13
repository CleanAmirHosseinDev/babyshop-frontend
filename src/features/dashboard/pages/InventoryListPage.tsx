import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertCircle, Minus, Package, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useInventory } from '../../../shared/hooks/useInventory';
import { formatNumber } from '../../../shared/utils/format';
import type { InventoryItem } from '../../../shared/types/models';

const AGE_LABELS: Record<string, string> = {
  '0-3': 'نوزاد (۰-۳ ماه)',
  '3-6': '۳ تا ۶ ماه',
  '6-12': '۶ تا ۱۲ ماه',
  '12-24': '۱ تا ۲ سال',
  '24+': 'بالای ۲ سال',
  default: 'سایز استاندارد',
};

const InventoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAllInventory, updateStock, deleteInventory, loading } = useInventory();
  const [items, setItems] = useState<InventoryItem[]>([]);

  const loadData = useCallback(async () => {
    setItems(await getAllInventory());
  }, [getAllInventory]);

  useEffect(() => {
    // داده‌خوانی در زمان mount؛ این rule برای افکت‌های همگام با DOM است
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleStockChange = async (
    item: InventoryItem,
    type: 'increase' | 'decrease',
  ) => {
    const result = await updateStock(item.productId, item.ageRange ?? '', 1, type);

    if (result.success) {
      await loadData();
    } else {
      toast.error(result.message ?? 'بروزرسانی موجودی انجام نشد.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('آیا از حذف این سایز از انبار مطمئن هستید؟')) return;

    const result = await deleteInventory(id);
    if (result.success) {
      toast.success('رکورد انبار حذف شد.');
      await loadData();
    } else {
      toast.error(result.message ?? 'حذف رکورد انبار انجام نشد.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAFB] text-right">
      <div className="container-shop py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
          <h1 className="flex items-center gap-2 text-lg font-black text-ink">
            <Package className="text-lavender-500" size={22} aria-hidden="true" /> مدیریت موجودی انبار
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={loadData} className="btn-ghost px-4 py-2 text-xs">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" /> بروزرسانی
            </button>
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

        <div className="overflow-hidden rounded-[2rem] border border-brand-50 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-brand-50 bg-brand-50/50 text-[11px] font-black text-ink-soft">
                  <th className="p-4">محصول و سایز</th>
                  <th className="p-4 text-center">موجودی</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-50">
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-xs text-ink-light">
                      <AlertCircle className="mx-auto mb-2 text-amber-400" size={24} aria-hidden="true" />
                      رکوردی در انبار پیدا نشد.
                    </td>
                  </tr>
                )}

                {items.map((item) => (
                  <tr key={item.id} className="text-xs transition-colors hover:bg-brand-50/30">
                    <td className="p-4">
                      <p className="font-bold text-ink">{item.productName || `محصول #${item.productId}`}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                          {AGE_LABELS[item.ageRange ?? 'default'] ?? item.ageRange}
                        </span>
                        <span className="font-mono text-[10px] text-ink-light" dir="ltr">
                          ID: {item.productId}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center text-lg font-black text-ink">{formatNumber(item.currentStock)}</td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStockChange(item, 'increase')}
                          aria-label="افزایش موجودی"
                          className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStockChange(item, 'decrease')}
                          disabled={item.currentStock <= 0}
                          aria-label="کاهش موجودی"
                          className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          aria-label="حذف از انبار"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-ink-light">
          برای ویرایش محصول از صفحه‌ی{' '}
          <button type="button" onClick={() => navigate('/products')} className="font-bold text-brand-500 hover:underline">
            لیست محصولات
          </button>{' '}
          استفاده کنید.
        </p>
      </div>
    </div>
  );
};

export default InventoryListPage;
