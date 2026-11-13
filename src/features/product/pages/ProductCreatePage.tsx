import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlignRight, Baby, Camera, Check, Layers, Link2, Tag, Users, X } from 'lucide-react';
import { useCategories } from '../../../shared/hooks/useCategories';
import { endpoints } from '../../../shared/config/api-endpoints';
import { http } from '../../../shared/services/http';
import { formatNumber } from '../../../shared/utils/format';
import { AGE_RANGES, GENDERS } from '../../../shared/types/models';

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // ۳ مگابایت

function buildSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `product-${Date.now().toString(36)}`;
}

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [ageStocks, setAgeStocks] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const previewsRef = useRef<string[]>([]);
  previewsRef.current = previews;

  // آزادسازی Object URL ها هنگام خروج از صفحه (جلوگیری از نشتی حافظه)
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!categoryId && categories.length > 0) setCategoryId(String(categories[0].id));
  }, [categories, categoryId]);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(buildSlug(value));
  };

  const toggleAge = (code: string) => {
    setSelectedAges((prev) => {
      if (prev.includes(code)) {
        const nextStocks = { ...ageStocks };
        delete nextStocks[code];
        setAgeStocks(nextStocks);
        return prev.filter((item) => item !== code);
      }

      setAgeStocks((prevStocks) => ({ ...prevStocks, [code]: '0' }));
      return [...prev, code];
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const validFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`«${file.name}» تصویر نیست.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`حجم «${file.name}» بیش از ۳ مگابایت است.`);
        continue;
      }
      validFiles.push(file);
    }

    const room = MAX_IMAGES - images.length;
    if (validFiles.length > room) {
      toast.warning(`حداکثر ${MAX_IMAGES} تصویر مجاز است.`);
    }

    const accepted = validFiles.slice(0, Math.max(0, room));
    if (accepted.length === 0) return;

    setImages((prev) => [...prev, ...accepted]);
    setPreviews((prev) => [...prev, ...accepted.map((file) => URL.createObjectURL(file))]);
  };

  const removeImage = (index: number) => {
    const url = previews[index];
    if (url) URL.revokeObjectURL(url);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (selectedAges.length === 0) {
      toast.error('حداقل یک رده سنی انتخاب کنید.');
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error('قیمت محصول را صحیح وارد کنید.');
      return;
    }

    if (!categoryId) {
      toast.error('دسته‌بندی محصول را انتخاب کنید.');
      return;
    }

    setSaving(true);

    const inventoryDetails = selectedAges.map((code) => ({
      AgeRange: code,
      Stock: Number.parseInt(ageStocks[code] ?? '0', 10) || 0,
    }));

    const formData = new FormData();
    formData.append('Name', name.trim());
    formData.append('Slug', slug || buildSlug(name));
    formData.append('Price', String(Number(price)));
    formData.append('Description', description.trim());
    formData.append('Gender', String(gender));
    formData.append('CategoryId', categoryId);
    formData.append('AgeRange', selectedAges[0]);
    formData.append('InventoryDetails', JSON.stringify(inventoryDetails));
    formData.append(
      'InitialStock',
      String(inventoryDetails.reduce((sum, item) => sum + item.Stock, 0)),
    );
    images.forEach((file) => formData.append('Images', file));

    try {
      await http.postForm(endpoints.products.base, formData);
      toast.success('محصول جدید ثبت شد.');
      navigate('/products', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ثبت محصول انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAFB] text-right">
      <div className="container-shop py-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-4xl space-y-6 rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card sm:p-8"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-50 pb-5">
            <h1 className="text-lg font-black text-ink">✨ تعریف محصول جدید</h1>
            <Link to="/products" className="text-xs font-bold text-brand-500 hover:underline">
              بازگشت به لیست
            </Link>
          </header>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="product-name" className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink-soft">
                <Tag size={13} aria-hidden="true" /> نام محصول
              </label>
              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                className="field"
                required
                maxLength={80}
              />
            </div>

            <div>
              <label htmlFor="product-slug" className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink-soft">
                <Link2 size={13} aria-hidden="true" /> اسلاگ (اختیاری)
              </label>
              <input
                id="product-slug"
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className="field font-mono text-xs"
                dir="ltr"
                maxLength={80}
                placeholder="اگر خالی بماند خودکار ساخته می‌شود"
              />
            </div>

            <div>
              <label htmlFor="product-price" className="mb-1.5 block text-xs font-bold text-ink-soft">
                قیمت (تومان)
              </label>
              <input
                id="product-price"
                type="number"
                inputMode="numeric"
                min={1000}
                step={1000}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="field font-mono"
                dir="ltr"
                required
              />
              {price && (
                <p className="mt-1.5 text-[11px] text-ink-light">{formatNumber(Number(price))} تومان</p>
              )}
            </div>

            <div>
              <label htmlFor="product-category" className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink-soft">
                <Layers size={13} aria-hidden="true" /> دسته‌بندی
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="field appearance-none"
                required
              >
                <option value="">انتخاب کنید…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 rounded-[1.5rem] bg-brand-50/40 p-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-black text-ink-soft">
                <Users size={14} aria-hidden="true" /> این محصول برای چه کسی است؟
              </p>
              <div className="flex gap-2">
                {GENDERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGender(option.value)}
                    aria-pressed={gender === option.value}
                    className={`flex-1 rounded-2xl py-2.5 text-[11px] font-bold transition-all ${
                      gender === option.value
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'border border-brand-100 bg-white text-ink-soft hover:border-brand-300'
                    }`}
                  >
                    {option.emoji} {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-black text-ink-soft">
                <Baby size={14} aria-hidden="true" /> رده‌های سنی
              </p>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map((age) => (
                  <button
                    key={age.code}
                    type="button"
                    onClick={() => toggleAge(age.code)}
                    aria-pressed={selectedAges.includes(age.code)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-black transition-all ${
                      selectedAges.includes(age.code)
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'border border-brand-100 bg-white text-ink-soft hover:border-brand-300'
                    }`}
                  >
                    {age.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedAges.length > 0 && (
            <div className="space-y-3 rounded-[1.5rem] border border-lavender-100 bg-lavender-50/40 p-5">
              <p className="text-xs font-black text-lavender-500">موجودی اولیه هر سایز</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedAges.map((code) => (
                  <div key={code} className="rounded-2xl border border-lavender-100 bg-white p-3">
                    <label htmlFor={`stock-${code}`} className="mb-1.5 block text-[11px] font-bold text-ink-soft">
                      {AGE_RANGES.find((option) => option.code === code)?.label}
                    </label>
                    <input
                      id={`stock-${code}`}
                      type="number"
                      min={0}
                      value={ageStocks[code] ?? ''}
                      onChange={(event) =>
                        setAgeStocks((prev) => ({ ...prev, [code]: event.target.value }))
                      }
                      className="field py-2 text-center font-mono"
                      dir="ltr"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="product-description" className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink-soft">
              <AlignRight size={13} aria-hidden="true" /> توضیحات محصول
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="field min-h-28 leading-7"
              maxLength={1000}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-ink-soft">📸 تصاویر محصول (حداکثر {MAX_IMAGES} تصویر)</p>
            <div className="grid grid-cols-3 gap-3 rounded-[1.5rem] border-2 border-dashed border-brand-100 p-4 sm:grid-cols-6">
              {previews.map((src, index) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-2xl border border-brand-50">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="حذف تصویر"
                    className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-brand-200 bg-white text-brand-400 transition-colors hover:border-brand-400 hover:bg-brand-50">
                  <span className="text-center">
                    <Camera className="mx-auto" size={24} aria-hidden="true" />
                    <span className="mt-1 block text-[10px] font-black">افزودن</span>
                  </span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-sm">
            {saving ? (
              'در حال ثبت…'
            ) : (
              <>
                <Check size={18} aria-hidden="true" /> ثبت محصول
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductCreatePage;
