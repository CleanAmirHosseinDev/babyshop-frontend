/* eslint-disable react-refresh/only-export-components -- Provider و هوک مصرف‌کننده به‌صورت سنتی همراه هم قرار می‌گیرند */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface CartItem {
  /** شناسه‌ی یکتای سطر سبد (محصول + سایز) */
  lineId: string;
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  sizeCode?: string;
  sizeName?: string;
  maxStock?: number;
}

export interface AddToCartInput {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  sizeCode?: string;
  sizeName?: string;
  maxStock?: number;
  quantity?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (input: AddToCartInput) => { success: boolean; message?: string };
  increaseQuantity: (lineId: string) => { success: boolean; message?: string };
  decreaseQuantity: (lineId: string) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'ziizii_cart';
const LEGACY_STORAGE_KEY = 'cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

function buildLineId(productId: number, sizeCode?: string): string {
  return `${productId}:${sizeCode || 'default'}`;
}

/** خواندن سبد از حافظه با اعتبارسنجی کامل (داده‌ی خراب نباید صفحه را سفید کند) */
function readCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const items: CartItem[] = [];

    for (const entry of parsed) {
      if (typeof entry !== 'object' || entry === null) continue;

      const item = entry as Record<string, unknown>;
      const id = Number(item.id);
      const price = Number(item.price);
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const sizeCode = typeof item.sizeCode === 'string' ? item.sizeCode : undefined;

      if (!Number.isFinite(id) || !Number.isFinite(price)) continue;

      items.push({
        lineId: buildLineId(id, sizeCode),
        id,
        name: String(item.name ?? 'محصول'),
        price,
        quantity,
        imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : undefined,
        sizeCode,
        sizeName: typeof item.sizeName === 'string' ? item.sizeName : undefined,
        maxStock: Number.isFinite(Number(item.maxStock)) ? Number(item.maxStock) : undefined,
      });
    }

    return items;
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(readCartFromStorage);

  // آینه‌ی همگام از سبد؛ برای تصمیم‌گیری‌های بلافاصله (مثل کنترل موجودی) لازم است
  const cartRef = useRef(cartItems);

  /** به‌روزرسانی هم‌زمان state و ref */
  const applyCart = useCallback((next: CartItem[]) => {
    cartRef.current = next;
    setCartItems(next);
  }, []);

  useEffect(() => {
    cartRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // سهمیه‌ی حافظه پر است؛ سبد در همین نشست کار می‌کند
    }
  }, [cartItems]);

  const addToCart = useCallback(
    (input: AddToCartInput): { success: boolean; message?: string } => {
      const quantityToAdd = Math.max(1, Math.floor(input.quantity ?? 1));
      const lineId = buildLineId(input.id, input.sizeCode);
      const current = cartRef.current;
      const existing = current.find((item) => item.lineId === lineId);
      const maxStock = input.maxStock ?? existing?.maxStock;
      const nextQuantity = (existing?.quantity ?? 0) + quantityToAdd;

      if (maxStock !== undefined && nextQuantity > maxStock) {
        return { success: false, message: `تنها ${maxStock} عدد از این سایز موجود است.` };
      }

      if (existing) {
        applyCart(
          current.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: nextQuantity, maxStock: maxStock ?? item.maxStock }
              : item,
          ),
        );
      } else {
        applyCart([
          ...current,
          {
            lineId,
            id: input.id,
            name: input.name,
            price: input.price,
            quantity: quantityToAdd,
            imageUrl: input.imageUrl,
            sizeCode: input.sizeCode,
            sizeName: input.sizeName,
            maxStock: input.maxStock,
          },
        ]);
      }

      return { success: true };
    },
    [applyCart],
  );

  const increaseQuantity = useCallback(
    (lineId: string): { success: boolean; message?: string } => {
      const current = cartRef.current;
      const item = current.find((entry) => entry.lineId === lineId);
      if (!item) return { success: false, message: 'این محصول در سبد نیست.' };

      const nextQuantity = item.quantity + 1;
      if (item.maxStock !== undefined && nextQuantity > item.maxStock) {
        return { success: false, message: `تنها ${item.maxStock} عدد از این سایز موجود است.` };
      }

      applyCart(
        current.map((entry) =>
          entry.lineId === lineId ? { ...entry, quantity: nextQuantity } : entry,
        ),
      );
      return { success: true };
    },
    [applyCart],
  );

  const decreaseQuantity = useCallback(
    (lineId: string) => {
      applyCart(
        cartRef.current.flatMap((item) => {
          if (item.lineId !== lineId) return [item];
          if (item.quantity <= 1) return [];
          return [{ ...item, quantity: item.quantity - 1 }];
        }),
      );
    },
    [applyCart],
  );

  const removeFromCart = useCallback(
    (lineId: string) => {
      applyCart(cartRef.current.filter((item) => item.lineId !== lineId));
    },
    [applyCart],
  );

  const clearCart = useCallback(() => applyCart([]), [applyCart]);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      cartItems,
      totalItems,
      totalPrice,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    }),
    [cartItems, totalItems, totalPrice, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart باید داخل CartProvider استفاده شود.');
  return context;
};
