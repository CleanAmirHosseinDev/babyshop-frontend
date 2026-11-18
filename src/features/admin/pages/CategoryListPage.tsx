import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Check, Layers, Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import { useCategories } from '../../../shared/hooks/useCategories';
import { useAuth } from '../../../shared/hooks/useAuth';
import { endpoints } from '../../../shared/config/api-endpoints';
import { http } from '../../../shared/services/http';
import { formatNumber } from '../../../shared/utils/format';
import type { Category } from '../../../shared/types/models';

interface FormState {
  name: string;
  description: string;
  displayOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { name: '', description: '', displayOrder: '0', isActive: true };

const CategoryListPage: React.FC = () => {
  const { categories, loading, refresh } = useCategories();
  const { isAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const modalTitle = useMemo(() => (editing ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'), [editing]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description ?? '',
      displayOrder: String(category.displayOrder ?? 0),
      isActive: category.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    // منطبق با CreateCategoryDto / UpdateCategoryDto بک‌اند (اسلاگ در سرور ساخته می‌شود)
    const payload = editing
      ? {
          id: editing.id,
          name: form.name.trim(),
          description: form.description.trim(),
          imageUrl: editing.imageUrl ?? null,
          displayOrder: Number(form.displayOrder) || 0,
          isActive: form.isActive,
        }
      : {
          name: form.name.trim(),
          description: form.description.trim(),
          parentCategoryId: null,
          imageUrl: null,
          displayOrder: Number(form.displayOrder) || 0,
        };

    try {
      if (editing) {
        await http.put(endpoints.categories.base, payload);
      } else {
        await http.post(endpoints.categories.base, payload);
      }

      toast.success(editing ? 'دسته‌بندی ویرایش شد.' : 'دسته‌بندی جدید ثبت شد.');
      setIsModalOpen(false);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ذخیره‌ی دسته‌بندی انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`«${category.name}» حذف شود؟ ممکن است محصولات این دسته هم تحت تأثیر قرار بگیرند.`)) return;

    try {
      await http.delete(endpoints.categories.byId(category.id));
      toast.success('دسته‌بندی حذف شد.');
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حذف دسته‌بندی انجام نشد.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-right">
      <div className="container-shop py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
          <h1 className="flex items-center gap-2 text-lg font-black text-ink">
            <Layers className="text-lavender-500" size={22} aria-hidden="true" /> مدیریت دسته‌بندی‌ها
          </h1>

          <div className="flex items-center gap-2">
            <button type="button" onClick={openAdd} className="btn-primary px-4 py-2 text-xs">
              <Plus size={14} aria-hidden="true" /> دسته‌بندی جدید
            </button>
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
                  <th className="p-4">نام دسته</th>
                  <th className="p-4">اسلاگ</th>
                  <th className="p-4 text-center">ترتیب</th>
                  <th className="p-4 text-center">محصولات</th>
                  <th className="p-4 text-center">وضعیت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-50">
                {loading && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-xs text-ink-light">
                      در حال بارگذاری…
                    </td>
                  </tr>
                )}

                {!loading && categories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-xs text-ink-light">
                      دسته‌بندی‌ای ثبت نشده است.
                    </td>
                  </tr>
                )}

                {categories.map((category) => (
                  <tr key={category.id} className="text-xs transition-colors hover:bg-brand-50/30">
                    <td className="p-4 font-bold text-ink">{category.name}</td>
                    <td className="p-4 font-mono text-[11px] text-ink-light" dir="ltr">
                      {category.slug || '—'}
                    </td>
                    <td className="p-4 text-center text-ink-soft">{formatNumber(category.displayOrder ?? 0)}</td>
                    <td className="p-4 text-center text-ink-soft">{formatNumber(category.productsCount ?? 0)}</td>
                    <td className="p-4 text-center">
                      {category.isActive !== false ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600">
                          فعال
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-500">
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          aria-label={`ویرایش ${category.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-lavender-50 text-lavender-500 transition-colors hover:bg-lavender-500 hover:text-white"
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => remove(category)}
                            aria-label={`حذف ${category.name}`}
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

        <p className="mt-4 text-[11px] leading-6 text-ink-light">
          اسلاگ دسته‌بندی به‌صورت خودکار در سرور از روی نام ساخته می‌شود. حذف دسته‌بندی فقط با نقش
          مدیر کل (Admin) امکان‌پذیر است.
        </p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl animate-fade-in-up"
          >
            <div className="mb-5 flex items-center justify-between border-b border-brand-50 pb-4">
              <h2 id="category-modal-title" className="flex items-center gap-2 text-sm font-black text-ink">
                <Tag className="text-lavender-500" size={18} aria-hidden="true" /> {modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="بستن"
                className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-ink-soft transition-colors hover:text-red-500"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={save} className="space-y-4">
              <div>
                <label htmlFor="category-name" className="mb-1.5 block text-xs font-bold text-ink-soft">
                  نام دسته‌بندی
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="field"
                  placeholder="مثلاً سیسمونی نوزاد"
                  required
                  maxLength={60}
                />
              </div>

              <div>
                <label htmlFor="category-order" className="mb-1.5 block text-xs font-bold text-ink-soft">
                  ترتیب نمایش
                </label>
                <input
                  id="category-order"
                  type="number"
                  min={0}
                  value={form.displayOrder}
                  onChange={(event) => setForm((prev) => ({ ...prev, displayOrder: event.target.value }))}
                  className="field font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label htmlFor="category-description" className="mb-1.5 block text-xs font-bold text-ink-soft">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  id="category-description"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="field min-h-24 leading-7"
                  maxLength={300}
                />
              </div>

              {editing && (
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-ink-soft">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                    className="h-4 w-4 accent-brand-500"
                  />
                  نمایش در فروشگاه
                </label>
              )}

              <button type="submit" disabled={saving} className="btn-primary w-full py-3.5">
                <Check size={18} aria-hidden="true" /> {saving ? 'در حال ذخیره…' : 'ذخیره'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryListPage;
