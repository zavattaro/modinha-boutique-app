import { supabase } from '@/integrations/supabase/client';

export interface Coupon {
  id: string;
  code: string;
  affiliate_id: string;
  discount_rate: number;
  status: string;
  usage_count: number;
  max_usage?: number;
  valid_until?: string;
  affiliate?: {
    name: string;
    email: string;
  };
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
  discountAmount?: number;
  commissionAmount?: number;
  finalAmount?: number;
}

export class CouponService {
  static async validateCoupon(code: string, orderAmount: number): Promise<CouponValidationResult> {
    try {
      if (!code || !orderAmount) {
        return { valid: false, error: 'Código do cupom e valor do pedido são obrigatórios' };
      }

      // Fetch coupon with affiliate info
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select(`
          *,
          affiliate:affiliates!inner(name, email, status)
        `)
        .eq('code', code.toUpperCase())
        .eq('status', 'active')
        .single();

      if (error || !coupon) {
        return { valid: false, error: 'Cupom não encontrado ou inválido' };
      }

      // Check if affiliate is active
      if (coupon.affiliate.status !== 'active') {
        return { valid: false, error: 'Cupom temporariamente indisponível' };
      }

      // Check expiration date
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return { valid: false, error: 'Cupom expirado' };
      }

      // Check usage limit
      if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
        return { valid: false, error: 'Cupom esgotado' };
      }

      // Calculate discount and commission
      const discountRate = coupon.discount_rate / 100;
      const commissionRate = 0.10; // 10% commission fixed

      const discountAmount = orderAmount * discountRate;
      const commissionAmount = orderAmount * commissionRate;
      const totalReduction = discountAmount + commissionAmount;
      const finalAmount = orderAmount - totalReduction;

      return {
        valid: true,
        coupon,
        discountAmount,
        commissionAmount,
        finalAmount: Math.max(finalAmount, 0) // Ensure final amount is not negative
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { valid: false, error: 'Erro ao validar cupom. Tente novamente.' };
    }
  }

  static async applyCoupon(
    couponId: string,
    orderData: {
      originalAmount: number;
      discountAmount: number;
      commissionAmount: number;
      finalAmount: number;
      orderReference: string;
      customerInfo: any;
    }
  ) {
    try {
      // Create coupon transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('coupon_transactions')
        .insert({
          coupon_id: couponId,
          affiliate_id: orderData.customerInfo.affiliateId,
          order_reference: orderData.orderReference,
          original_amount: orderData.originalAmount,
          discount_amount: orderData.discountAmount,
          commission_amount: orderData.commissionAmount,
          final_amount: orderData.finalAmount,
          customer_info: orderData.customerInfo
        })
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      // Get current coupon data first
      const { data: currentCoupon, error: getCouponError } = await supabase
        .from('coupons')
        .select('usage_count')
        .eq('id', couponId)
        .single();

      if (getCouponError) {
        throw getCouponError;
      }

      // Update coupon usage count
      const { error: couponError } = await supabase
        .from('coupons')
        .update({ 
          usage_count: (currentCoupon.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', couponId);

      if (couponError) {
        throw couponError;
      }

      // Get current affiliate balance first
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('balance')
        .eq('id', orderData.customerInfo.affiliateId)
        .single();

      if (affiliateError) {
        throw affiliateError;
      }

      // Update affiliate balance
      const { error: updateAffiliateError } = await supabase
        .from('affiliates')
        .update({ 
          balance: (affiliate.balance || 0) + orderData.commissionAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.customerInfo.affiliateId);

      if (updateAffiliateError) {
        throw updateAffiliateError;
      }

      return { success: true, transaction };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, error: 'Erro ao aplicar cupom' };
    }
  }
}