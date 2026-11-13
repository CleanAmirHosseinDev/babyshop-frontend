import { useCallback, useEffect, useState } from 'react';
import { endpoints } from '../config/api-endpoints';
import { http } from '../services/http';
import type { Category } from '../types/models';

/** نرمال‌سازی کلیدها؛ بک‌اند بعضی جاها PascalCase برمی‌گرداند */
function normalizeCategory(raw: Record<string, unknown>): Category | null {
  const id = Number(raw.id ?? raw.Id);
  const name = String(raw.name ?? raw.Name ?? '').trim();

  if (!Number.isFinite(id) || !name) return null;

  return {
    id,
    name,
    slug: (raw.slug ?? raw.Slug) as string | undefined,
    description: (raw.description ?? raw.Description) as string | undefined,
    isActive: (raw.isActive ?? raw.IsActive) as boolean | undefined,
  };
}

export const useCategories = (options: { onlyActive?: boolean } = {}) => {
  const { onlyActive = false } = options;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await http.get<unknown>(endpoints.categories.base);
      const list = Array.isArray(data) ? data : [];
      const normalized = list
        .map((item) => normalizeCategory(item as Record<string, unknown>))
        .filter((item): item is Category => item !== null);

      setCategories(onlyActive ? normalized.filter((item) => item.isActive !== false) : normalized);
    } catch (err) {
      setCategories([]);
      setError(err instanceof Error ? err.message : 'خطا در دریافت دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  }, [onlyActive]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refresh: fetchCategories };
};
