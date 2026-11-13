import { useCallback, useState } from 'react';
import { endpoints } from '../config/api-endpoints';
import { http } from '../services/http';
import type { InventoryItem } from '../types/models';

const DEFAULT_AGE_RANGE = '0-3';

export const useInventory = () => {
  const [loading, setLoading] = useState(false);

  const getAllInventory = useCallback(async (): Promise<InventoryItem[]> => {
    try {
      const data = await http.get<InventoryItem[]>(endpoints.inventory.base);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, []);

  const updateStock = useCallback(
    async (
      productId: number,
      ageRange: string,
      quantity: number,
      type: 'increase' | 'decrease',
    ): Promise<{ success: boolean; message?: string }> => {
      const safeAgeRange = !ageRange || ageRange === 'default' ? DEFAULT_AGE_RANGE : ageRange;
      const amount = Math.max(1, Math.abs(quantity));

      setLoading(true);
      try {
        await http.put(endpoints.inventory.changeStock(type, productId, safeAgeRange, amount));
        return { success: true };
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'خطا در بروزرسانی موجودی' };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteInventory = useCallback(async (id: number): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      await http.delete(endpoints.inventory.byId(id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'خطا در حذف رکورد انبار' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { getAllInventory, updateStock, deleteInventory, loading };
};
