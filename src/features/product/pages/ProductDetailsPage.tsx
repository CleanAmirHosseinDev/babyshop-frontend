import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, RefreshCw, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import { useCart } from '../../../shared/context/CartContext';
import { useWishlist } from '../../../shared/context/WishlistContext';
import { useInventory } from '../../../shared/hooks/useInventory';
import { endpoints } from '../../../shared/config/api-endpoints';
import { http } from '../../../shared/services/http';
import { formatNumber } from '../../../shared/utils/format';
import { PLACEHOLDER_IMAGE, getImageList, getImageUrl } from '../../../shared/utils/imageUrl';
import type { Product } from '../../../shared/types/models';

interface AgeRangeStock {
  code: string;
  name: string;
  stock: number;
}

const AGE_LABELS: Record<string, string> = {
  '0-3': 'نوزاد (۰-۳ ماه)',
  '3-6': '۳ تا ۶ ماه',
  '6-12': '۶ تا ۱۲ ماه',
  '12-24': '۱ تا ۲ سال',
  '24+': 'بالای ۲ سال',
  default: 'سایز استاندارد',
};

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getAllInventory } = useInventory();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<AgeRangeStock[]>([]);
  const [selectedSize, setSelectedSize] = useState<AgeRangeStock | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = Number(id);

  const loadProduct = React.useCallback(async () => {
    if (!Number.isFinite(productId)) {
      setError('شناسه‌ی محصول معتبر نیست.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [productData, inventory] = await Promise.all([
        http.get<Product>(endpoints.products.byId(productId)),
        getAllInventory(),
      ]);

      if (!productData || !Number.isFinite(Number(productData.id))) {
        setError('این محصول پیدا نشد یا از فروشگاه حذف شده است.');
        setProduct(null);
        return;
      }

      setProduct(productData);

      const gallery = getImageList(productData.imageUrl);
      setMainImage(gallery[0] ?? '');

      const productInventory = inventory.filter((item) => Number(item.productId) === productId);
      const sizesList: AgeRangeStock[] =
        productInventory.length > 0
          ? productInventory.map((item) => {
              const code = item.ageRange || 'default';
              return {
                code,
                name: AGE_LABELS[code] ?? code,
                stock: Number(item.currentStock) || 0,
              };
            })
          : [{ code: 'default', name: AGE_LABELS.default, stock: 0 }];

      setSizes(sizesList);
      setSelectedSize(sizesList.find((size) => size.stock > 0) ?? sizesList[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات محصول');
    } finally {
      setLoading(false);
    }
  }, [getAllInventory, productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const gallery = useMemo(() => getImageList(product?.imageUrl), [product?.imageUrl]);

  const isOutOfStock = !selectedSize || selectedSize.stock <= 0;
  const isCompletelyOutOfStock = sizes.every((size) => size.stock <= 0);
  const isFavorite = product ? isInWishlist(product.id) : false;

  const handleAddToCart = () => {
    if (!product || !selectedSize || isOutOfStock) return;

    const result = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: getImageUrl(gallery[0]),
      sizeCode: selectedSize.code,
      sizeName: selectedSize.name,
      maxStock: selectedSize.stock,
    });

    if (!result.success) {
      toast.warning(result.message ?? 'افزودن به سبد انجام نشد.');
      return;
    }

    toast.success('به سبد خرید اضافه شد 🧸');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <StoreHeader backTo="/" backLabel="فروشگاه" />
        <div className="container-shop grid animate-pulse gap-8 py-12 md:grid-cols-2">
          <div className="aspect-square rounded-[2.5rem] bg-white" />
          <div className="space-y-4 rounded-[2.5rem] bg-white p-8">
            <div className="h-6 w-2/3 rounded bg-brand-50" />
            <div className="h-4 rounded bg-brand-50" />
            <div className="h-4 w-5/6 rounded bg-brand-50" />
            <div className="h-24 rounded-2xl bg-brand-50" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <StoreHeader backTo="/" backLabel="فروشگاه" />
        <div className="container-shop flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="text-4xl" aria-hidden="true">
            ☹️
          </p>
          <h1 className="mt-4 text-lg font-black text-ink">{error ?? 'محصول پیدا نشد'}</h1>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={loadProduct} className="btn-ghost text-sm">
              <RefreshCw size={16} aria-hidden="true" /> تلاش دوباره
            </button>
            <button type="button" onClick={() => navigate('/')} className="btn-primary text-sm">
              بازگشت به فروشگاه
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-right">
      <StoreHeader backTo="/" backLabel="فروشگاه" />

      <main className="container-shop py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* گالری */}
          <div className="rounded-[2.5rem] border border-brand-50 bg-white p-5 shadow-card">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-brand-50">
              <img
                src={getImageUrl(mainImage)}
                alt={product.name}
                width={800}
                height={800}
                decoding="async"
                className="h-full w-full object-cover"
                onError={(event) => {
                  const image = event.currentTarget;
                  if (image.dataset.fallbackApplied === 'true') return;
                  image.dataset.fallbackApplied = 'true';
                  image.src = PLACEHOLDER_IMAGE;
                }}
              />

              {isCompletelyOutOfStock && (
                <div className="absolute inset-0 grid place-items-center bg-ink/40 backdrop-blur-[2px]">
                  <span className="rounded-full bg-red-500 px-6 py-2 text-sm font-black text-white shadow-xl">
                    فعلاً ناموجود
                  </span>
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setMainImage(image)}
                    aria-label={`تصویر ${index + 1}`}
                    aria-pressed={mainImage === image}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                      mainImage === image ? 'border-brand-500' : 'border-transparent hover:border-brand-200'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* مشخصات */}
          <div className="rounded-[2.5rem] border border-brand-50 bg-white p-6 shadow-card md:p-8">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-black text-brand-600">
                محصول ویژه زیزی 🧸
              </span>
              <div className="flex items-center gap-0.5 text-amber-400" aria-label="امتیاز ۵ از ۵">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" aria-hidden="true" />
                ))}
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-black leading-9 text-ink md:text-3xl">{product.name}</h1>

            <p className="mt-3 text-sm leading-7 text-ink-soft">
              {product.description || 'این محصول هنوز توضیحاتی ندارد؛ اما مثل همه‌ی محصولات زیزی کیدز باکیفیت و خوش‌دوخت است.'}
            </p>

            {sizes.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 text-xs font-bold text-ink-soft">انتخاب سایز / رده سنی</h2>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const unavailable = size.stock <= 0;
                    const selected = selectedSize?.code === size.code;

                    return (
                      <button
                        key={size.code}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selected}
                        className={`rounded-2xl border-2 px-4 py-2.5 text-xs font-bold transition-all ${
                          selected
                            ? 'border-brand-500 bg-brand-50 text-brand-600'
                            : 'border-brand-50 text-ink-soft hover:border-brand-200'
                        } ${unavailable && !selected ? 'opacity-50' : ''}`}
                      >
                        {size.name}
                        {unavailable && <span className="mt-1 block text-[10px] font-black text-red-400">ناموجود</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-3xl border border-brand-50 bg-brand-50/40 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-soft">قیمت</span>
                <p className="text-2xl font-black text-brand-600">
                  {formatNumber(product.price)}{' '}
                  <span className="text-xs font-medium text-ink-light">تومان</span>
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-brand-100 pt-3 text-xs">
                <span className="text-ink-soft">وضعیت</span>
                <span className={`font-black ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
                  {isOutOfStock
                    ? 'ناموجود'
                    : selectedSize && selectedSize.stock < 3
                      ? `فقط ${formatNumber(selectedSize.stock)} عدد باقی مانده`
                      : 'موجود در انبار'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn-primary flex-1 py-4 text-base"
              >
                <ShoppingCart size={20} aria-hidden="true" />
                {isOutOfStock ? 'سایز انتخابی ناموجود است' : 'افزودن به سبد خرید'}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                className={`grid w-14 shrink-0 place-items-center rounded-2xl border-2 transition-all ${
                  isFavorite
                    ? 'border-brand-200 bg-brand-50 text-brand-500'
                    : 'border-brand-100 text-ink-light hover:border-brand-300 hover:text-brand-500'
                }`}
              >
                <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-brand-50 pt-5 text-[11px] font-bold text-ink-soft">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-brand-400" aria-hidden="true" /> ارسال سریع به سراسر کشور
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" aria-hidden="true" /> ضمانت اصالت و کیفیت
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default ProductDetailsPage;
