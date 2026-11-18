import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import ProductCard from '../../product/components/ProductCard';
import { useProducts } from '../../product/hooks/useProducts';
import { useCategories } from '../../../shared/hooks/useCategories';
import { useInventory } from '../../../shared/hooks/useInventory';
import { useWishlist } from '../../../shared/context/WishlistContext';
import { formatNumber } from '../../../shared/utils/format';

const GENDER_CARDS = [
  { id: 0, label: 'همه', image: '/images/categories/all.svg' },
  { id: 1, label: 'پسرانه', image: '/images/categories/boys.svg' },
  { id: 2, label: 'دخترانه', image: '/images/categories/girls.svg' },
] as const;

/** انتخاب تصویر دسته بر اساس نام دسته‌ی ثبت‌شده در سیستم */
const categoryImage = (name: string) => {
  if (name.includes('پسر')) return '/images/categories/boys.svg';
  if (name.includes('دختر')) return '/images/categories/girls.svg';
  if (name.includes('نوزاد')) return '/images/categories/baby.svg';
  return '/images/categories/all.svg';
};

const HomePage: React.FC = () => {
  const { products, loading: productsLoading, error, refresh } = useProducts();
  const { categories } = useCategories({ onlyActive: true });
  const { getAllInventory } = useInventory();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeGender, setActiveGender] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
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
      // در بک‌اند: ۱ پسرانه، ۲ دخترانه، ۳ یونیسکس (هر دو) — محصولات یونیسکس در هر دو فیلتر دیده می‌شوند
      const matchesGender =
        activeGender === 0 || product.genderValue === activeGender || product.genderValue === 3;
      const matchesCategory = activeCategory === null || product.categoryId === activeCategory;

      return matchesSearch && matchesGender && matchesCategory;
    });
  }, [products, searchTerm, activeGender, activeCategory]);

  return (
    <div className="min-h-screen bg-white text-right">
      <StoreHeader />

      {/* بنر اصلی */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-lavender-100 px-4 pb-24 pt-14">
        <div className="container-shop flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
          <div className="z-10 flex-1 text-center md:text-right">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-brand-600 shadow-sm">
              <Sparkles size={14} aria-hidden="true" />
              کالکشن جدید نوزادی و کودک
            </span>

            <h1 className="mt-5 text-balance text-3xl font-black leading-[1.35] text-ink md:text-5xl">
              دنیای لباس‌های
              <span className="text-brand-500"> نرم و باکیفیت</span>
              <br />
              برای فرشته‌های کوچک شما
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-soft md:mx-0 md:text-base">
              پارچه‌های ضدحساسیت، دوخت تمیز و سایزبندی دقیق؛ بهترین انتخاب برای خوش‌پوش‌ترین کوچولوی دنیا ✨
            </p>

            {/* دسته‌بندی‌ها — نوار ورق‌زدنی با تصویر */}
            <div className="no-scrollbar mt-8 flex snap-x gap-2 overflow-x-auto pb-1 md:justify-start">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                aria-pressed={activeCategory === null}
                className={`w-24 shrink-0 snap-start rounded-2xl border-2 p-1.5 transition-all sm:w-28 ${
                  activeCategory === null ? 'border-ink bg-white' : 'border-transparent hover:border-brand-300'
                }`}
              >
                <img src="/images/categories/all.svg" alt="همه قفسه‌ها" className="aspect-[4/3] w-full rounded-xl object-cover" />
                <span className="mt-1.5 block truncate text-center text-[11px] font-bold text-ink-soft">همه قفسه‌ها</span>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  aria-pressed={activeCategory === category.id}
                  className={`w-24 shrink-0 snap-start rounded-2xl border-2 p-1.5 transition-all sm:w-28 ${
                    activeCategory === category.id ? 'border-ink bg-white' : 'border-transparent hover:border-brand-300'
                  }`}
                >
                  <img
                    src={categoryImage(category.name)}
                    alt={category.name}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                  <span className="mt-1.5 block truncate text-center text-[11px] font-bold text-ink-soft">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-1 justify-center">
            <div className="relative grid h-64 w-64 place-items-center rounded-full border-8 border-white/70 bg-white/50 shadow-2xl md:h-80 md:w-80">
              <span className="text-[7rem] md:text-[9rem]" aria-hidden="true">
                🧸
              </span>
              <span className="absolute -top-6 end-2 text-5xl animate-float md:text-6xl" aria-hidden="true">
                🍼
              </span>
              <span className="absolute -bottom-4 start-0 text-5xl animate-bounce-slow md:text-6xl" aria-hidden="true">
                👕
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* جستجو و فیلتر جنسیت */}
      <section className="container-shop relative z-20 -mt-14">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-4 shadow-xl shadow-brand-100/50">
          <label htmlFor="product-search" className="sr-only">
            جستجوی محصول
          </label>
          <div className="relative">
            <Search
              size={20}
              aria-hidden="true"
              className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-ink-light"
            />
            <input
              id="product-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="دنبال چه لباسی می‌گردید؟ 🔍"
              className="field ps-14 text-sm"
              autoComplete="off"
            />
          </div>

          {/* فیلتر جنسیت — نوار ورق‌زدنی با تصویر */}
          <div className="no-scrollbar mt-4 flex snap-x gap-2 overflow-x-auto pb-1">
            {GENDER_CARDS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveGender(filter.id)}
                aria-pressed={activeGender === filter.id}
                className={`w-20 shrink-0 snap-start rounded-2xl border-2 p-1.5 transition-all sm:w-24 ${
                  activeGender === filter.id ? 'border-ink bg-white' : 'border-transparent hover:border-brand-300'
                }`}
              >
                <img src={filter.image} alt={filter.label} className="aspect-[4/3] w-full rounded-xl object-cover" />
                <span className="mt-1.5 block text-center text-[11px] font-bold text-ink-soft">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ویترین محصولات */}
      <main className="container-shop pb-4 pt-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="border-r-4 border-brand-500 pr-3 text-xl font-black text-ink md:text-2xl">
            ویترین محصولات
          </h2>
          {!productsLoading && !error && (
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-ink-light shadow-sm">
              {formatNumber(filteredProducts.length)} محصول
            </span>
          )}
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse overflow-hidden rounded-[2rem] border border-brand-50 bg-white">
                <div className="aspect-square bg-brand-50" />
                <div className="space-y-3 p-5">
                  <div className="h-4 rounded bg-brand-50" />
                  <div className="h-4 w-2/3 rounded bg-brand-50" />
                  <div className="h-9 rounded-2xl bg-brand-50" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border-2 border-dashed border-red-100 bg-white py-16 text-center">
            <p className="text-4xl" aria-hidden="true">
              😴
            </p>
            <h3 className="mt-4 text-lg font-black text-ink">ارتباط با سرور برقرار نشد</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-soft">{error}</p>
            <button type="button" onClick={refresh} className="btn-primary mt-6 text-sm">
              تلاش دوباره
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-brand-100 bg-white py-16 text-center">
            <p className="text-4xl" aria-hidden="true">
              🥺
            </p>
            <h3 className="mt-4 text-lg font-black text-ink">محصولی با این مشخصات پیدا نشد</h3>
            <p className="mt-2 text-sm text-ink-soft">فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
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
      </main>

      <StoreFooter />
    </div>
  );
};

export default HomePage;
