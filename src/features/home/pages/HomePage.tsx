import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import ProductCard from '../../product/components/ProductCard';
import { useProducts } from '../../product/hooks/useProducts';
import { useCategories } from '../../../shared/hooks/useCategories';
import { useInventory } from '../../../shared/hooks/useInventory';
import { useWishlist } from '../../../shared/context/WishlistContext';
import { formatNumber } from '../../../shared/utils/format';

const GENDER_FILTERS = [
  { value: 0, label: 'همه' },
  { value: 1, label: 'پسرانه' },
  { value: 2, label: 'دخترانه' },
];

const TILES = [
  { src: '/images/tile-newborn.jpg', title: 'نوزاد', caption: '۰ تا ۲۴ ماه', gender: 3 },
  { src: '/images/tile-girl.jpg', title: 'دخترانه', caption: 'کالکشن پاییز', gender: 2 },
  { src: '/images/tile-boy.jpg', title: 'پسرانه', caption: 'کالکشن پاییز', gender: 1 },
];

/** تصویر کوچک هر قفسه بر اساس نام دسته (فایل‌های SVG موجود در public/images/categories) */
const categoryArt = (name: string) => {
  if (name.includes('پسر')) return '/images/categories/boys.svg';
  if (name.includes('دختر')) return '/images/categories/girls.svg';
  if (name.includes('نوزاد') || name.includes('سیسمونی')) return '/images/categories/baby.svg';
  return '/images/categories/all.svg';
};

const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const { products, loading: productsLoading, error, refresh } = useProducts();
  const { categories } = useCategories({ onlyActive: true });
  const { getAllInventory } = useInventory();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [activeGender, setActiveGender] = useState<number>(() => Number(searchParams.get('gender') ?? 0) || 0);
  const [activeCategory, setActiveCategory] = useState<number | null>(() => {
    const value = Number(searchParams.get('category'));
    return Number.isFinite(value) && value > 0 ? value : null;
  });
  const [inventoryMap, setInventoryMap] = useState<Record<number, number>>({});

  // موجودی هر محصول = مجموع موجودی همه‌ی سایزها (تنها یک‌بار پس از mount)
  useEffect(() => {
    let isMounted = true;

    const syncInventory = async () => {
      const inventory = await getAllInventory();
      if (!isMounted) return;

      const map: Record<number, number> = {};
      for (const item of inventory) {
        map[item.productId] = (map[item.productId] ?? 0) + (Number(item.currentStock) || 0);
      }
      setInventoryMap(map);
    };

    syncInventory();

    return () => {
      isMounted = false;
    };
  }, [getAllInventory]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      // محصولات غیرفعال در ویترین نمایش داده نمی‌شوند
      if (product.isActive === false) return false;

      const matchesSearch = !term || product.name?.toLowerCase().includes(term);
      // در بک‌اند: ۱ پسرانه، ۲ دخترانه، ۳ یونیسکس (هر دو)
      const matchesGender =
        activeGender === 0 || product.genderValue === activeGender || product.genderValue === 3;
      const matchesCategory = activeCategory === null || product.categoryId === activeCategory;

      return matchesSearch && matchesGender && matchesCategory;
    });
  }, [products, searchTerm, activeGender, activeCategory]);

  return (
    <div className="min-h-screen bg-white text-right">
      <StoreHeader />

      {/* هیرو */}
      <section className="relative">
        <img
          src="/images/hero-kids.jpg"
          alt="کالکشن نوزادی و کودک زیزی"
          className="h-[62vh] min-h-[380px] w-full object-cover"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 pb-10 md:pb-14">
          <div className="container-shop">
            <p className="text-[10px] uppercase tracking-editorial text-white/85">کالکشن جدید</p>
            <h1 className="mt-3 text-2xl font-light text-white md:text-[40px] md:leading-tight">
              نوزادی و کودک
            </h1>
            <a
              href="#products"
              className="mt-5 inline-block border-b border-white/80 pb-1 text-[11px] uppercase tracking-label text-white transition-opacity hover:opacity-70"
            >
              مشاهده کالکشن
            </a>
          </div>
        </div>
      </section>

      {/* سه تایل دسته‌بندی */}
      <section className="container-shop mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <button
            key={tile.title}
            type="button"
            onClick={() => {
              setActiveGender(tile.gender);
              document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative block overflow-hidden bg-brand-50 text-right"
          >
            <img
              src={tile.src}
              alt={tile.title}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-opacity duration-500 group-hover:opacity-90 sm:aspect-[3/4]"
              width={600}
              height={800}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4">
              <span className="block text-sm font-light text-white">{tile.title}</span>
              <span className="mt-1 block text-[10px] uppercase tracking-label text-white/80">{tile.caption}</span>
            </span>
          </button>
        ))}
      </section>

      {/* محصولات */}
      <section id="products" className="container-shop mt-14 scroll-mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="text-[11px] uppercase tracking-label text-ink">
            ویترین محصولات
            <span className="ms-2 text-ink-light">({formatNumber(filteredProducts.length)})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            {GENDER_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveGender(filter.value)}
                aria-pressed={activeGender === filter.value}
                className={`text-[11px] uppercase tracking-label transition-colors ${
                  activeGender === filter.value ? 'text-ink underline underline-offset-4' : 'text-ink-light hover:text-ink'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              aria-pressed={activeCategory === null}
              className={`flex items-center gap-2 text-[11px] transition-colors ${
                activeCategory === null ? 'text-ink underline underline-offset-4' : 'text-ink-light hover:text-ink'
              }`}
            >
              <img src="/images/categories/all.svg" alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
              همه قفسه‌ها
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={activeCategory === category.id}
                className={`flex items-center gap-2 text-[11px] transition-colors ${
                  activeCategory === category.id ? 'text-ink underline underline-offset-4' : 'text-ink-light hover:text-ink'
                }`}
              >
                <img src={categoryArt(category.name)} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
                {category.name}
              </button>
            ))}
          </div>

          <label className="flex w-full items-center gap-2 border-b border-line pb-1 sm:w-64">
            <Search size={14} className="text-ink-light" aria-hidden="true" />
            <span className="sr-only">جستجوی محصول</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="جستجو"
              className="w-full border-0 bg-transparent py-1 text-[12px] text-ink outline-none placeholder:text-ink-light"
            />
          </label>
        </div>

        {error && (
          <div className="mt-8 flex flex-col items-center gap-3 border border-line p-10 text-center">
            <p className="text-sm text-ink-soft">{error}</p>
            <button type="button" onClick={refresh} className="btn-ghost">
              تلاش دوباره
            </button>
          </div>
        )}

        {!error && productsLoading && (
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-product w-full bg-brand-50" />
                <div className="mt-3 h-3 w-2/3 bg-brand-50" />
                <div className="mt-2 h-3 w-1/3 bg-brand-50" />
              </div>
            ))}
          </div>
        )}

        {!error && !productsLoading && filteredProducts.length === 0 && (
          <p className="py-16 text-center text-sm text-ink-soft">محصولی با این مشخصات پیدا نشد.</p>
        )}

        {!error && !productsLoading && filteredProducts.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                stock={inventoryMap[product.id]}
                isFavorite={isInWishlist(product.id)}
                onToggleFavorite={() => toggleWishlist(product)}
              />
            ))}
          </div>
        )}
      </section>

      {/* بلوک تحریریه */}
      <section className="mt-20 grid md:grid-cols-2">
        <img
          src="/images/editorial.jpg"
          alt="پارچه‌های نرم پنبه‌ای برای پوست کودک"
          loading="lazy"
          className="h-[420px] w-full object-cover md:h-[520px]"
          width={1200}
          height={1040}
        />

        <div className="flex flex-col justify-center bg-brand-50 px-8 py-14 md:px-14">
          <p className="text-[10px] uppercase tracking-editorial text-ink-soft">کیفیت پارچه</p>
          <h2 className="mt-4 text-2xl font-light leading-relaxed text-ink md:text-3xl">
            نرمی‌ای که پوست کودک حس می‌کند
          </h2>
          <p className="mt-4 max-w-md text-[13px] font-light leading-7 text-ink-soft">
            پارچه‌های پنبه‌ای ضدحساسیت، دوخت تمیز و سایزبندی دقیق؛ هر قطعه پیش از ارسال بررسی می‌شود تا
            کوچک‌ترین عضو خانواده راحت‌ترین روزهایش را بگذراند.
          </p>
          <Link
            to="/looks"
            className="mt-8 inline-block w-fit border-b border-ink pb-1 text-[11px] uppercase tracking-label text-ink transition-opacity hover:opacity-60"
          >
            مشاهده استایل‌ها
          </Link>
        </div>
      </section>

      {/* نوار مزیت‌ها */}
      <section className="border-y border-line">
        <div className="container-shop grid grid-cols-2 gap-6 py-8 text-center md:grid-cols-4">
          {[
            { title: 'ارسال سریع', text: 'پست پیشتاز به سراسر کشور' },
            { title: 'پرداخت امن', text: 'از طریق درگاه‌های بانکی' },
            { title: '۷ روز بازگشت', text: 'در صورت عدم رضایت' },
            { title: 'تضمین کیفیت', text: 'پارچه‌های مناسب پوست کودک' },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-[11px] uppercase tracking-label text-ink">{item.title}</p>
              <p className="mt-1.5 text-[11px] font-light text-ink-light">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <StoreFooter />
    </div>
  );
};

export default HomePage;
