import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      couponCode, 
      orderAmount, 
      orderReference, 
      customerInfo 
    } = await req.json();

    console.log('Processing coupon payment:', { couponCode, orderAmount, orderReference });

    // Validate coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select(`
        *,
        affiliate:affiliates!inner(id, name, email, status, commission_rate)
      `)
      .eq('code', couponCode.toUpperCase())
      .eq('status', 'active')
      .single();

    if (couponError || !coupon) {
      console.error('Coupon validation error:', couponError);
      return new Response(
        JSON.stringify({ success: false, error: 'Cupom inválido ou não encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if affiliate is active
    if (coupon.affiliate.status !== 'active') {
      return new Response(
        JSON.stringify({ success: false, error: 'Cupom temporariamente indisponível' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check expiration
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cupom expirado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check usage limit
    if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cupom esgotado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate amounts
    const discountRate = coupon.discount_rate / 100;
    const discountAmount = orderAmount * discountRate;
    
    // The discount amount goes to affiliate as commission
    const commissionAmount = discountAmount;
    const finalAmount = orderAmount - discountAmount;

    console.log('Calculated amounts:', { 
      discountAmount, 
      commissionAmount, 
      finalAmount,
      originalAmount: orderAmount 
    });

    // Start transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('coupon_transactions')
      .insert({
        coupon_id: coupon.id,
        affiliate_id: coupon.affiliate.id,
        order_reference: orderReference,
        original_amount: orderAmount,
        discount_amount: discountAmount,
        commission_amount: commissionAmount,
        final_amount: finalAmount,
        customer_info: {
          ...customerInfo,
          affiliateId: coupon.affiliate.id,
          affiliateName: coupon.affiliate.name
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao processar transação' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update coupon usage count
    const { error: updateCouponError } = await supabase
      .from('coupons')
      .update({ 
        usage_count: coupon.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', coupon.id);

    if (updateCouponError) {
      console.error('Error updating coupon usage:', updateCouponError);
    }

    // Update affiliate balance
    const { error: updateAffiliateError } = await supabase
      .from('affiliates')
      .update({ 
        balance: coupon.affiliate.balance + commissionAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', coupon.affiliate.id);

    if (updateAffiliateError) {
      console.error('Error updating affiliate balance:', updateAffiliateError);
    }

    console.log('Coupon payment processed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction,
        discount: {
          amount: discountAmount,
          percentage: coupon.discount_rate
        },
        commission: {
          amount: commissionAmount,
          affiliateName: coupon.affiliate.name
        },
        finalAmount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-coupon-payment function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});