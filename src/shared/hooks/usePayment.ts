import { useCallback, useState } from 'react';
import { endpoints } from '../config/api-endpoints';
import { http } from '../services/http';
import type { PaymentResult } from '../types/models';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);

  /** شروع پرداخت و ایجاد تراکنش */
  const startPayment = useCallback(
    async (orderId: number, amount: number): Promise<{ success: boolean; data?: PaymentResult; message?: string }> => {
      setLoading(true);
      try {
        const data = await http.post<PaymentResult>(endpoints.payment.base, {
          OrderId: orderId,
          Amount: amount,
          PaymentMethod: 'Online',
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

  /** تایید نهایی پرداخت */
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
