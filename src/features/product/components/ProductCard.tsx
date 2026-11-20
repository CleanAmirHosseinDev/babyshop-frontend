import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
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

/**
 * کارت محصول با الگوی زارا: تصویر پرتره، بدون قاب و سایه، تیتر و قیمت ریز،
 * برچسب‌های متنی کوچک و اکشن علاقه‌مندی فقط در هاور.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, stock, isFavorite, onToggleFavorite }) => {
  const isOutOfStock = stock !== undefined && stock <= 0;
  const isLowStock = stock !== undefined && stock > 0 && stock < 3;

  return (
    <article className="group relative">
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-product overflow-hidden bg-brand-50"
        aria-label={`مشاهده ${product.name}`}
      >
        <img
          src={getFirstImageUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={600}
          height={800}
          className={`h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-90 ${
            isOutOfStock ? 'opacity-60' : ''
          }`}
          onError={(event) => {
            const image = event.currentTarget;
            if (image.dataset.fallbackApplied === 'true') return;
            image.dataset.fallbackApplied = 'true';
            image.src = PLACEHOLDER_IMAGE;
          }}
        />

        {isOutOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-white/95 py-2 text-center text-[10px] uppercase tracking-label text-ink">
            ناموجود
          </span>
        )}

        {isLowStock && !isOutOfStock && (
          <span className="absolute start-2 top-2 bg-white px-2 py-1 text-[9px] uppercase tracking-label text-ink">
            آخرین موجودی
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={onToggleFavorite}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        className={`absolute end-2 top-2 grid h-8 w-8 place-items-center bg-white/80 text-ink transition-opacity ${
          isFavorite ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100'
        }`}
      >
        <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>

      <div className="pt-3">
        <h3 className="line-clamp-2 text-[13px] font-light leading-6 text-ink">
          <Link to={`/product/${product.id}`} className="hover:text-ink-soft">
            {product.name}
          </Link>
        </h3>

        <p className={`mt-1 text-[13px] ${isOutOfStock ? 'text-ink-light' : 'text-ink-soft'}`}>
          {formatNumber(product.price)}
          <span className="ms-1 text-[10px] text-ink-light">تومان</span>
        </p>
      </div>
    </article>
  );
};

export default ProductCard;
