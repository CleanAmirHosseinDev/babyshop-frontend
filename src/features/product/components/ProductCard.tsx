import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import type { Product } from '../../../shared/types/models';
import { PLACEHOLDER_IMAGE, getFirstImageUrl } from '../../../shared/utils/imageUrl';
import { formatNumber } from '../../../shared/utils/format';

interface ProductCardProps {
  product: Product;
  /** موجودی کل محصول؛ اگر نامشخص باشد undefined می‌ماند */
  stock?: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, stock, isFavorite, onToggleFavorite }) => {
  const isOutOfStock = stock !== undefined && stock <= 0;
  const isLowStock = stock !== undefined && stock > 0 && stock < 3;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-brand-50 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-warmer">
      <div className="relative">
        <Link
          to={`/product/${product.id}`}
          className="block aspect-square overflow-hidden bg-brand-50"
          aria-label={`مشاهده ${product.name}`}
        >
          <img
            src={getFirstImageUrl(product.imageUrl)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-50 grayscale' : ''
            }`}
            onError={(event) => {
              const image = event.currentTarget;
              if (image.dataset.fallbackApplied === 'true') return;
              image.dataset.fallbackApplied = 'true';
              image.src = PLACEHOLDER_IMAGE;
            }}
          />
        </Link>

        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          className={`absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-md transition-all hover:scale-110 ${
            isFavorite ? 'text-brand-500' : 'text-ink-light'
          }`}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>

        {isOutOfStock && (
          <span className="absolute start-3 top-3 rounded-xl bg-ink/80 px-3 py-1 text-[11px] font-bold text-white">
            ناموجود
          </span>
        )}

        {isLowStock && (
          <span className="absolute start-3 top-3 rounded-xl bg-orange-500 px-3 py-1 text-[11px] font-bold text-white">
            فقط {formatNumber(stock)} عدد
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 text-center">
        <h3 className="line-clamp-2 text-base font-bold leading-7 text-ink">
          <Link to={`/product/${product.id}`} className="transition-colors hover:text-brand-600">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto">
          <p className={`text-lg font-black ${isOutOfStock ? 'text-ink-light' : 'text-brand-600'}`}>
            {formatNumber(product.price)} <span className="text-[11px] font-medium text-ink-light">تومان</span>
          </p>

          <Link
            to={`/product/${product.id}`}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all ${
              isOutOfStock
                ? 'cursor-not-allowed bg-gray-100 text-ink-light'
                : 'bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white'
            }`}
            aria-disabled={isOutOfStock}
            tabIndex={isOutOfStock ? -1 : undefined}
          >
            <Eye size={18} aria-hidden="true" />
            {isOutOfStock ? 'ناموجود' : 'انتخاب سایز'}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
