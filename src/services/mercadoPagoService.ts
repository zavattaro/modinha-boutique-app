import { supabase } from '@/integrations/supabase/client';

export interface PaymentData {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  external_reference: string;
}

export interface PaymentResponse {
  success: boolean;
  payment?: {
    id: string;
    status: string;
    status_detail: string;
    transaction_amount: number;
    external_reference: string;
    point_of_interaction?: any;
    date_created: string;
  };
  error?: string;
}

export class MercadoPagoService {
  static async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago-payment', {
        body: paymentData
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      return data;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  static getPaymentMethods() {
    return [
      { id: 'pix', name: 'PIX', type: 'account_money' },
      { id: 'visa', name: 'Cartão Visa', type: 'credit_card' },
      { id: 'master', name: 'Cartão Mastercard', type: 'credit_card' },
      { id: 'elo', name: 'Cartão Elo', type: 'credit_card' },
      { id: 'hipercard', name: 'Cartão Hipercard', type: 'credit_card' }
    ];
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }
}