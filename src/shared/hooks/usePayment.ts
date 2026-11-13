import { useCallback, useState } from 'react';
import { endpoints } from '../config/api-endpoints';
import { http } from '../services/http';
import type { Payment } from '../types/models';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);

  /** ایجاد تراکنش برای یک سفارش */
  const startPayment = useCallback(
    async (
      orderId: number,
      amount: number,
      method = 'Online',
    ): Promise<{ success: boolean; data?: Payment; message?: string }> => {
      setLoading(true);
      try {
        const data = await http.post<Payment>(endpoints.payment.base, {
          OrderId: orderId,
          Amount: amount,
          PaymentMethod: method,
        });
        return { success: true, data };
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'خطا در ایجاد تراکنش پرداخت' };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /** تایید نهایی پرداخت (بک‌اند وضعیت سفارش را Paid می‌کند) */
  const verifyPayment = useCallback(
    async (paymentId: number, referenceNumber: string): Promise<{ success: boolean; message?: string }> => {
      setLoading(true);
      try {
        await http.post(endpoints.payment.verify(paymentId, referenceNumber));
        return { success: true };
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'تایید پرداخت با خطا مواجه شد' };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { startPayment, verifyPayment, loading };
};
