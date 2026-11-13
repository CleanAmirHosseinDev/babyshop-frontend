import { useCallback, useState } from 'react';
import { endpoints } from '../config/api-endpoints';
import { http } from '../services/http';
import type { Ticket } from '../types/models';

export interface CreateTicketPayload {
  Subject: string;
  Message: string;
  Category?: string;
  OrderId?: number | null;
  ProductId?: number | null;
}

export const useTickets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** تیکت‌های کاربر جاری */
  const getMyTickets = useCallback(async (): Promise<Ticket[]> => {
    setLoading(true);
    try {
      const data = await http.get<Ticket[]>(endpoints.tickets.base);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /** تمام تیکت‌ها (ادمین) */
  const getAllTicketsAdmin = useCallback(async (): Promise<Ticket[]> => {
    setLoading(true);
    try {
      const data = await http.get<Ticket[]>(endpoints.tickets.adminAll);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /** ثبت تیکت جدید */
  const createTicket = useCallback(
    async (payload: CreateTicketPayload): Promise<{ success: boolean; message?: string }> => {
      setLoading(true);
      setError(null);
      try {
        await http.post(endpoints.tickets.base, payload);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'خطا در ثبت تیکت';
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /** ارسال پاسخ در تیکت */
  const sendReply = useCallback(
    async (ticketId: number, message: string): Promise<{ success: boolean; message?: string }> => {
      try {
        await http.post(endpoints.tickets.reply, { TicketId: ticketId, Message: message });
        return { success: true };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : 'خطا در ارسال پاسخ' };
      }
    },
    [],
  );

  /** جزئیات یک تیکت */
  const getTicketDetails = useCallback(async (id: number): Promise<Ticket | null> => {
    setLoading(true);
    try {
      return await http.get<Ticket>(endpoints.tickets.byId(id));
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getMyTickets,
    getAllTicketsAdmin,
    createTicket,
    sendReply,
    getTicketDetails,
    loading,
    error,
  };
};
