import { useCallback, useEffect, useState } from 'react';
import { endpoints } from '../config/api-endpoints';
import { http } from '../services/http';
import type { Category } from '../types/models';

export const useCategories = (options: { onlyActive?: boolean } = {}) => {
  const { onlyActive = false } = options;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await http.get<Category[]>(endpoints.categories.base);
      const list = Array.isArray(data) ? data : [];
      setCategories(onlyActive ? list.filter((category) => category.isActive) : list);
    } catch (err) {
      setCategories([]);
      setError(err instanceof Error ? err.message : 'خطا در دریافت دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  }, [onlyActive]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, error, refresh };
};
