// Supabase Edge Function: TossPayments Integration
// Handles payment verification and enrollment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
  courseId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { paymentKey, orderId, amount, courseId }: PaymentRequest = await req.json();

    // Verify payment with TossPayments
    const tossSecretKey = Deno.env.get('TOSS_SECRET_KEY');
    if (!tossSecretKey) {
      return new Response(JSON.stringify({ error: 'Payment not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(tossSecretKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const paymentData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('TossPayments error:', paymentData);
      return new Response(JSON.stringify({
        error: 'Payment verification failed',
        details: paymentData.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        order_id: orderId,
        payment_key: paymentKey,
        amount,
        status: 'completed',
        method: paymentData.method,
        approved_at: new Date().toISOString(),
        receipt_url: paymentData.receipt?.url,
        metadata: paymentData,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      return new Response(JSON.stringify({ error: 'Failed to save payment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabaseClient
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        payment_id: orderId,
      })
      .select()
      .single();

    if (enrollError) {
      console.error('Enrollment error:', enrollError);
      // Payment succeeded but enrollment failed - log for manual resolution
      return new Response(JSON.stringify({
        error: 'Enrollment failed',
        paymentId: payment.id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Increment course enrollment count
    await supabaseClient.rpc('increment_enrolled_count', { course_id: courseId });

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          orderId,
          amount,
          method: paymentData.method,
        },
        enrollment: {
          id: enrollment.id,
          courseId,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
