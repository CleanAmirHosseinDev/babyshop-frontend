/* eslint-disable react-refresh/only-export-components -- Provider و هوک مصرف‌کننده به‌صورت سنتی همراه هم قرار می‌گیرند */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '../types/models';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: number | string) => boolean;
}

const STORAGE_KEY = 'ziizii_wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function readWishlistFromStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => ({ ...(item as unknown as Product), id: Number(item.id) }))
      .filter((item) => Number.isFinite(item.id));
  } catch {
    return [];
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(readWishlistFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // در صورت پر بودن حافظه، فقط برای همین نشست نگه داشته می‌شود
    }
  }, [wishlist]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => Number(item.id) === Number(product.id));
      if (exists) return prev.filter((item) => Number(item.id) !== Number(product.id));
      return [...prev, { ...product, id: Number(product.id) }];
    });
  }, []);

  const isInWishlist = useCallback(
    (id: number | string) => wishlist.some((item) => Number(item.id) === Number(id)),
    [wishlist],
  );

  const value = useMemo(
    () => ({ wishlist, toggleWishlist, isInWishlist }),
    [wishlist, toggleWishlist, isInWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist باید داخل WishlistProvider استفاده شود.');
  return context;
};
