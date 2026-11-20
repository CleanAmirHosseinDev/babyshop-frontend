import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import { useProducts } from '../../product/hooks/useProducts';
import { useInventory } from '../../../shared/hooks/useInventory';
import { PLACEHOLDER_IMAGE, getFirstImageUrl } from '../../../shared/utils/imageUrl';
import { formatNumber } from '../../../shared/utils/format';
import type { Product } from '../../../shared/types/models';

/** تعداد اقلام هر «استایل» (هر استایل = چند محصول هم‌ست) */
const ITEMS_PER_LOOK = 3;

interface Look {
  id: string;
  cover: Product;
  items: Product[];
}

/** ساخت استایل‌ها از ویترین محصولات (بدون نیاز به endpoint جدید) */
function buildLooks(products: Product[]): Look[] {
  const looks: Look[] = [];

  for (let index = 0; index < products.length; index += ITEMS_PER_LOOK) {
    const items = products.slice(index, index + ITEMS_PER_LOOK);
    if (items.length === 0) break;

    looks.push({ id: `look-${items[0].id}`, cover: items[0], items });
  }

  return looks;
}

const GENDER_TABS = [
  { value: 0, label: 'همه استایل‌ها' },
  { value: 1, label: 'پسرانه' },
  { value: 2, label: 'دخترانه' },
];

/**
 * صفحه‌ی «استایل‌ها» با ساختار لندینگ زارا:
 * breadcrumb → تیتر صفحه → تب‌های متنی → گرید استایل‌ها (تصویر ادیتوریال + لیست اقلام)
 */
const LooksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, loading, error, refresh } = useProducts();
  const { getAllInventory } = useInventory();

  const [activeGender, setActiveGender] = useState<number>(() => Number(searchParams.get('gender') ?? 0) || 0);
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [openedLook, setOpenedLook] = useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    getAllInventory().then((rows) => {
      if (!active) return;

      const map: Record<number, number> = {};
      for (const row of rows) {
        map[row.productId] = (map[row.productId] ?? 0) + (Number(row.currentStock) || 0);
      }
      setInventory(map);
    });

    return () => {
      active = false;
    };
  }, [getAllInventory]);

  const looks = useMemo(() => {
    const visible = products.filter((product) => {
      if (product.isActive === false) return false;
      return activeGender === 0 || product.genderValue === activeGender || product.genderValue === 3;
    });

    return buildLooks(visible);
  }, [products, activeGender]);

  return (
    <div className="min-h-screen bg-white text-right">
      <StoreHeader />

      {/* نوار مسیر (breadcrumb) */}
      <nav aria-label="مسیر صفحه" className="border-b border-line">
        <ol className="container-shop flex flex-wrap items-center gap-2 py-3 text-[10px] uppercase tracking-label text-ink-light">
          <li>
            <Link to="/" className="hover:text-ink">
              خانه
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/?gender=0" className="hover:text-ink">
              زیزی کیدز
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/looks" className="hover:text-ink">
              کالکشن
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">استایل‌ها</li>
        </ol>
      </nav>

      <header className="container-shop pt-10 pb-6">
        <h1 className="text-xl font-light tracking-tight text-ink md:text-3xl">همه استایل‌ها</h1>
        <p className="mt-3 max-w-xl text-[12px] font-light leading-7 text-ink-soft">
          هر استایل ترکیبی آماده از چند قطعه‌ی هماهنگ است؛ روی تصویر بزنید تا اقلام آن را ببینید و
          تک‌تک را به سبد اضافه کنید.
        </p>
      </header>

      {/* تب‌های متنی */}
      <div className="border-y border-line">
        <div className="container-shop flex items-center gap-6 py-3">
          {GENDER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveGender(tab.value)}
              aria-pressed={activeGender === tab.value}
              className={`text-[11px] transition-colors ${
                activeGender === tab.value ? 'text-ink underline underline-offset-4' : 'text-ink-light hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <span className="ms-auto text-[10px] uppercase tracking-label text-ink-light">
            {formatNumber(looks.length)} استایل
          </span>
        </div>
      </div>

      <main className="container-shop py-8">
        {error && (
          <div className="flex flex-col items-center gap-3 border border-line py-14 text-center">
            <p className="text-sm text-ink-soft">{error}</p>
            <button type="button" onClick={refresh} className="btn-ghost">
              تلاش دوباره
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-product w-full bg-brand-50" />
                <div className="mt-3 h-3 w-1/2 bg-brand-50" />
              </div>
            ))}
          </div>
        )}

        {!error && !loading && looks.length === 0 && (
          <p className="py-20 text-center text-sm text-ink-soft">استایلی برای نمایش وجود ندارد.</p>
        )}

        {!error && !loading && looks.length > 0 && (
          <div className="grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {looks.map((look) => {
              const isOpen = openedLook === look.id;
              const coverStock = inventory[look.cover.id];
              const isOutOfStock = coverStock !== undefined && coverStock <= 0;

              return (
                <article key={look.id} className="group">
                  <div className="relative overflow-hidden bg-brand-50">
                    <Link to={`/product/${look.cover.id}`} aria-label={`استایل ${look.cover.name}`}>
                      <img
                        src={getFirstImageUrl(look.cover.imageUrl)}
                        alt={look.cover.name}
                        loading="lazy"
                        className="aspect-product w-full object-cover transition-opacity duration-500 group-hover:opacity-95"
                        onError={(event) => {
                          const image = event.currentTarget;
                          if (image.dataset.fallbackApplied === 'true') return;
                          image.dataset.fallbackApplied = 'true';
                          image.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </Link>

                    {look.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setOpenedLook(isOpen ? null : look.id)}
                        aria-expanded={isOpen}
                        className="absolute inset-x-0 bottom-0 bg-white/95 py-3 text-[10px] uppercase tracking-label text-ink transition-colors hover:bg-ink hover:text-white"
                      >
                        {isOpen ? 'بستن اقلام استایل' : `دیدن ${formatNumber(look.items.length)} قلم این استایل`}
                      </button>
                    )}

                    {isOutOfStock && (
                      <span className="absolute start-2 top-2 bg-white px-2 py-1 text-[9px] uppercase tracking-label text-ink">
                        ناموجود
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-[13px] font-light text-ink">استایل {formatNumber(Number(look.id.split('-')[1]))}</h2>

                  <ul className={`mt-2 space-y-1.5 ${isOpen ? '' : 'hidden'}`}>
                    {look.items.map((item) => (
                      <li key={item.id} className="flex items-baseline justify-between gap-3 border-b border-line/70 pb-1.5">
                        <Link to={`/product/${item.id}`} className="text-[12px] font-light text-ink hover:text-ink-soft">
                          {item.name}
                        </Link>
                        <span className="shrink-0 text-[11px] text-ink-soft">{formatNumber(item.price)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* در حالت بسته، فقط اولین قلم به‌عنوان نمونه نمایش داده می‌شود */}
                  {!isOpen && (
                    <div className="mt-2 flex items-baseline justify-between gap-3 border-b border-line/70 pb-1.5">
                      <Link to={`/product/${look.cover.id}`} className="text-[12px] font-light text-ink hover:text-ink-soft">
                        {look.cover.name}
                      </Link>
                      <span className="shrink-0 text-[11px] text-ink-soft">{formatNumber(look.cover.price)}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
};

export default LooksPage;
