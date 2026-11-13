import { useCallback, useEffect, useRef, useState } from 'react';
import { endpoints } from '../../../shared/config/api-endpoints';
import { http } from '../../../shared/services/http';
import type { Product } from '../../../shared/types/models';

export type { Product };

interface UseProductsOptions {
  /** بارگذاری خودکار لیست در زمان mount (برای صفحاتی که فقط جزئیات می‌خواهند، خاموش شود) */
  autoLoad?: boolean;
}

export const useProducts = ({ autoLoad = true }: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await http.get<Product[]>(endpoints.products.base);
      if (!mounted.current) return;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!mounted.current) return;
      setProducts([]);
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست محصولات');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id: number): Promise<Product | null> => {
    try {
      const product = await http.get<Product>(endpoints.products.byId(id));
      return product && Number.isFinite(Number(product.id)) ? product : null;
    } catch {
      return null;
    }
  }, []);

  const deleteProduct = useCallback(async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      await http.delete(endpoints.products.byId(id));
      setProducts((prev) => prev.filter((product) => product.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'خطا در حذف محصول' };
    }
  }, []);

  useEffect(() => {
    if (autoLoad) refresh();
  }, [autoLoad, refresh]);

  return { products, loading, error, getProductById, deleteProduct, refresh };
};
