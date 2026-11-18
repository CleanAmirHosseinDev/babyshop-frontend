import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlignRight, Camera, Check, Layers, Users, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../../../shared/hooks/useCategories';
import { endpoints } from '../../../shared/config/api-endpoints';
import { http } from '../../../shared/services/http';
import { formatNumber } from '../../../shared/utils/format';
import { PLACEHOLDER_IMAGE, getImageUrl } from '../../../shared/utils/imageUrl';
import { GENDERS } from '../../../shared/types/models';

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById } = useProducts({ autoLoad: false });
  const { categories } = useCategories();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState(3);
  const [categoryId, setCategoryId] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const previewsRef = useRef<string[]>([]);
  previewsRef.current = previews;

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      const productId = Number(id);
      if (!Number.isFinite(productId)) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const product = await getProductById(productId);
      if (!active) return;

      if (!product) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setName(product.name ?? '');
      setPrice(String(product.price ?? ''));
      setDescription(product.description ?? '');
      setGender(Number(product.genderValue ?? 3) || 3);
      setCategoryId(String(product.categoryId ?? ''));
      setExistingImages((product.imageUrl ?? '').split('|').filter(Boolean));
      setLoading(false);
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [getProductById, id]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const accepted: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`«${file.name}» تصویر نیست.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`حجم «${file.name}» بیش از ۳ مگابایت است.`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    setNewImages((prev) => [...prev, ...accepted]);
    setPreviews((prev) => [...prev, ...accepted.map((file) => URL.createObjectURL(file))]);
  };

  const removeNewImage = (index: number) => {
    const url = previews[index];
    if (url) URL.revokeObjectURL(url);

    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!price || Number(price) <= 0) {
      toast.error('قیمت محصول را صحیح وارد کنید.');
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append('Id', String(id));
    formData.append('Name', name.trim());
    formData.append('Price', String(Number(price)));
    formData.append('Description', description.trim());
    formData.append('Gender', String(gender));
    formData.append('CategoryId', categoryId);
    newImages.forEach((file) => formData.append('NewImages', file));

    try {
      await http.putForm(endpoints.products.base, formData);
      toast.success('تغییرات محصول ذخیره شد.');
      navigate('/products', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ذخیره‌ی تغییرات انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="grid min-h-screen place-items-center bg-white p-4 text-center">
        <div>
          <p className="text-4xl" aria-hidden="true">
            🎈
          </p>
          <h1 className="mt-4 text-lg font-black text-ink">محصول پیدا نشد</h1>
          <Link to="/products" className="btn-primary mt-6 text-sm">
            بازگشت به لیست محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-right">
      <div className="container-shop py-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-4xl space-y-6 rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card sm:p-8"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-50 pb-5">
            <h1 className="text-lg font-black text-ink">ویرایش محصول</h1>
            <Link to="/products" className="text-xs font-bold text-brand-500 hover:underline">
              بازگشت به لیست
            </Link>
          </header>

          <div>
            <label htmlFor="edit-name" className="mb-1.5 block text-xs font-bold text-ink-soft">
              نام محصول
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="field"
              required
              maxLength={80}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-price" className="mb-1.5 block text-xs font-bold text-ink-soft">
                قیمت (تومان)
              </label>
              <input
                id="edit-price"
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
              {price && <p className="mt-1.5 text-[11px] text-ink-light">{formatNumber(Number(price))} تومان</p>}
            </div>

            <div>
              <label htmlFor="edit-category" className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink-soft">
                <Layers size={13} aria-hidden="true" /> دسته‌بندی
              </label>
              <select
                id="edit-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="field appearance-none"
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

          <div className="rounded-[1.5rem] bg-brand-50/40 p-5">
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
            <label htmlFor="edit-description" className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink-soft">
              <AlignRight size={13} aria-hidden="true" /> توضیحات
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="field min-h-28 leading-7"
              maxLength={1000}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-ink-soft">📸 تصاویر محصول</p>
            <div className="grid grid-cols-3 gap-3 rounded-[1.5rem] border-2 border-dashed border-brand-100 p-4 sm:grid-cols-6">
              {existingImages.map((src, index) => (
                <div key={`existing-${index}`} className="relative aspect-square overflow-hidden rounded-2xl">
                  <img
                    src={getImageUrl(src)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-80"
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.dataset.fallbackApplied === 'true') return;
                      image.dataset.fallbackApplied = 'true';
                      image.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <span className="absolute bottom-1 end-1 rounded-full bg-ink/60 px-2 py-0.5 text-[9px] text-white">
                    فعلی
                  </span>
                </div>
              ))}

              {previews.map((src, index) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-2xl border-2 border-brand-300">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    aria-label="حذف تصویر"
                    className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}

              <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-brand-200 bg-white text-brand-400 transition-colors hover:border-brand-400 hover:bg-brand-50">
                <span className="text-center">
                  <Camera className="mx-auto" size={24} aria-hidden="true" />
                  <span className="mt-1 block text-[10px] font-black">افزودن</span>
                </span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-sm">
            {saving ? (
              'در حال ذخیره…'
            ) : (
              <>
                <Check size={18} aria-hidden="true" /> ذخیره تغییرات
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductEditPage;
