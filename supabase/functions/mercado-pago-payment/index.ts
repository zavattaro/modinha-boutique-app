import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    const { 
      transaction_amount, 
      description, 
      payment_method_id, 
      payer, 
      items,
      external_reference 
    } = await req.json();

    console.log('Creating Mercado Pago payment:', {
      transaction_amount,
      description,
      payment_method_id,
      external_reference
    });

    // Create payment with Mercado Pago
    const paymentData = {
      transaction_amount,
      description,
      payment_method_id,
      payer: {
        email: payer.email,
        first_name: payer.first_name,
        last_name: payer.last_name,
        identification: payer.identification || {
          type: "CPF",
          number: "00000000000"
        }
      },
      external_reference,
      notification_url: `https://cvtpomxznchyuimijtyf.supabase.co/functions/v1/mercado-pago-webhook`,
      metadata: {
        items: JSON.stringify(items)
      }
    };

    // Add installments for credit card
    if (payment_method_id === 'visa' || payment_method_id === 'master' || payment_method_id === 'elo') {
      paymentData.installments = 1;
    }

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    
    console.log('Mercado Pago response status:', response.status);
    console.log('Mercado Pago response:', result);

    if (!response.ok) {
      console.error('Mercado Pago error:', result);
      throw new Error(result.message || 'Payment processing failed');
    }

    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: result.id,
        status: result.status,
        status_detail: result.status_detail,
        transaction_amount: result.transaction_amount,
        external_reference: result.external_reference,
        point_of_interaction: result.point_of_interaction,
        date_created: result.date_created
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in mercado-pago-payment function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});