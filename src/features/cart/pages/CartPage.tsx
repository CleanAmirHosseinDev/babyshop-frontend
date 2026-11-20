import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import { useCart } from '../../../shared/context/CartContext';
import { formatNumber } from '../../../shared/utils/format';
import { PLACEHOLDER_IMAGE, getImageUrl } from '../../../shared/utils/imageUrl';

const CartPage: React.FC = () => {
  const { cartItems, totalItems, totalPrice, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } =
    useCart();
  const navigate = useNavigate();

  const handleIncrease = (lineId: string) => {
    const result = increaseQuantity(lineId);
    if (!result.success) toast.warning(result.message ?? 'امکان افزایش تعداد نیست.');
  };

  return (
    <div className="min-h-screen bg-[#FFFAFB] text-right">
      <StoreHeader backTo="/" backLabel="ادامه خرید" />

      <main className="container-shop py-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-xl font-black text-ink md:text-2xl">
            سبد خرید {totalItems > 0 && <span className="text-sm font-bold text-ink-light">({formatNumber(totalItems)} کالا)</span>}
          </h1>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearCart();
                toast.info('سبد خرید خالی شد.');
              }}
              className="text-xs font-bold text-ink-light transition-colors hover:text-red-500"
            >
              خالی کردن سبد
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-none border-2 border-dashed border-brand-100 bg-white py-20 text-center">
            <p className="text-5xl" aria-hidden="true">
              🎈
            </p>
            <h2 className="mt-4 text-lg font-black text-ink">سبد خرید شما خالی است</h2>
            <p className="mt-2 text-sm text-ink-soft">از ویترین فروشگاه، لباس دلخواه کوچولوی‌تان را انتخاب کنید.</p>
            <Link to="/" className="btn-primary mt-6 text-sm">
              <ShoppingBag size={18} aria-hidden="true" /> رفتن به فروشگاه
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <ul className="space-y-4 lg:col-span-2">
              {cartItems.map((item) => (
                <li
                  key={item.lineId}
                  className="flex flex-col gap-4 rounded-none border border-brand-50 bg-white p-4 shadow-none sm:flex-row sm:items-center"
                >
                  <Link to={`/product/${item.id}`} className="shrink-0">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      width={96}
                      height={96}
                      loading="lazy"
                      decoding="async"
                      className="h-24 w-24 rounded-none object-cover"
                      onError={(event) => {
                        const image = event.currentTarget;
                        if (image.dataset.fallbackApplied === 'true') return;
                        image.dataset.fallbackApplied = 'true';
                        image.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </Link>

                  <div className="flex-1">
                    <Link to={`/product/${item.id}`} className="text-sm font-bold text-ink hover:text-brand-600">
                      {item.name}
                    </Link>

                    {item.sizeName && (
                      <p className="mt-1 inline-block rounded-none bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-600">
                        سایز: {item.sizeName}
                      </p>
                    )}

                    <p className="mt-2 text-sm font-black text-brand-600">
                      {formatNumber(item.price)}{' '}
                      <span className="text-[10px] font-medium text-ink-light">تومان</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-1 rounded-none bg-brand-50 p-1">
                      <button
                        type="button"
                        onClick={() => handleIncrease(item.lineId)}
                        aria-label="افزایش تعداد"
                        className="grid h-8 w-8 place-items-center rounded-none bg-white text-emerald-600 shadow-none transition-transform active:scale-90"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>

                      <span className="min-w-8 text-center text-sm font-black text-ink">
                        {formatNumber(item.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.lineId)}
                        aria-label="کاهش تعداد"
                        className="grid h-8 w-8 place-items-center rounded-none bg-white text-brand-600 shadow-none transition-transform active:scale-90"
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.lineId)}
                      aria-label={`حذف ${item.name} از سبد`}
                      className="grid h-8 w-8 place-items-center rounded-none text-ink-light transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* خلاصه سفارش */}
            <aside className="h-fit rounded-none border border-brand-100 bg-white p-6 shadow-none lg:sticky lg:top-24">
              <h2 className="text-sm font-black text-ink">خلاصه سفارش</h2>

              <dl className="mt-5 space-y-3 text-xs">
                <div className="flex items-center justify-between text-ink-soft">
                  <dt>مبلغ کالاها</dt>
                  <dd className="font-bold text-ink">{formatNumber(totalPrice)} تومان</dd>
                </div>
                <div className="flex items-center justify-between text-ink-soft">
                  <dt>هزینه ارسال</dt>
                  <dd className="text-ink-light">در مرحله پرداخت محاسبه می‌شود</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center justify-between border-t border-brand-50 pt-4">
                <span className="text-sm font-black text-ink">جمع کل</span>
                <span className="text-lg font-black text-brand-600">
                  {formatNumber(totalPrice)} <span className="text-[10px] font-medium text-ink-light">تومان</span>
                </span>
              </div>

              <button type="button" onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full py-4">
                ادامه و تکمیل سفارش
              </button>
            </aside>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
};

export default CartPage;
