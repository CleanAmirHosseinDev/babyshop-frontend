import { useCallback, useState } from 'react';
import { endpoints } from '../../../shared/config/api-endpoints';
import { http } from '../../../shared/services/http';
import type { Delivery, Order, OrderItem } from '../../../shared/types/models';

export interface CreateOrderPayload {
  ShippingAddress: string;
  PhoneNumber: string;
  Email?: string;
  CustomerNote?: string;
  Items: Array<{
    ProductId: number;
    ProductName: string;
    Quantity: number;
    UnitPrice: number;
    AgeRange?: string;
  }>;
}

export interface CreateOrderResult {
  success: boolean;
  data?: Order;
  message?: string;
}

export const useOrders = () => {
  const [loading, setLoading] = useState(false);

  /** ثبت سفارش جدید */
  const createOrder = useCallback(async (payload: CreateOrderPayload): Promise<CreateOrderResult> => {
    setLoading(true);
    try {
      const data = await http.post<Order>(endpoints.orders.base, payload);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'خطا در ثبت سفارش',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /** لیست کل سفارش‌ها (ادمین) */
  const getAllOrdersAdmin = useCallback(async (): Promise<Order[]> => {
    setLoading(true);
    try {
      const data = await http.get<Order[]>(endpoints.orders.base);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /** تغییر وضعیت سفارش */
  const updateStatus = useCallback(
    async (orderId: number, status: string): Promise<{ success: boolean; message?: string }> => {
      setLoading(true);
      try {
        await http.put(endpoints.orders.status, { OrderId: orderId, Status: status });
        return { success: true };
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'خطا در تغییر وضعیت سفارش' };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /** سفارش‌های کاربر جاری */
  const getMyOrders = useCallback(async (): Promise<Order[]> => {
    setLoading(true);
    try {
      const data = await http.get<Order[]>(endpoints.orders.my);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /** جزئیات یک سفارش */
  const getOrderDetails = useCallback(async (orderId: number): Promise<Order | null> => {
    setLoading(true);
    try {
      return await http.get<Order>(endpoints.orders.byId(orderId));
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** اطلاعات ارسال/کد رهگیری */
  const getDeliveryDetails = useCallback(async (orderId: number): Promise<Delivery | null> => {
    try {
      return await http.get<Delivery>(endpoints.delivery.byOrder(orderId));
    } catch {
      return null;
    }
  }, []);

  return {
    createOrder,
    getAllOrdersAdmin,
    updateStatus,
    getMyOrders,
    getOrderDetails,
    getDeliveryDetails,
    loading,
  };
};

export type { OrderItem };
