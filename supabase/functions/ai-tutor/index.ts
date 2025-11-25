// Supabase Edge Function: AI Tutor
// Handles OpenAI API calls securely

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: {
    section?: string;
    topic?: string;
    difficulty?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, sessionId, context }: ChatRequest = await req.json();

    // Build system prompt
    const systemPrompt = `You are an expert TEPS (Test of English Proficiency developed by Seoul National University) tutor.
You help Korean students prepare for the TEPS exam.

Your capabilities:
- Explain grammar rules clearly with Korean translations when helpful
- Help with vocabulary building strategies
- Provide listening comprehension tips
- Guide reading comprehension techniques
- Give personalized study advice

${context?.section ? `Current focus: ${context.section}` : ''}
${context?.topic ? `Topic: ${context.topic}` : ''}
${context?.difficulty ? `Student level: ${context.difficulty}` : ''}

Respond in Korean when the student writes in Korean, and in English when they write in English.
Be encouraging and supportive while maintaining high standards.`;

    // Call OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI error:', error);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await openaiResponse.json();
    const aiMessage = aiData.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Store in AI tutor sessions if sessionId provided
    if (sessionId) {
      const { data: session } = await supabaseClient
        .from('ai_tutor_sessions')
        .select('messages')
        .eq('id', sessionId)
        .single();

      const messages = (session?.messages as any[]) || [];
      messages.push(
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiMessage, timestamp: new Date().toISOString() }
      );

      await supabaseClient
        .from('ai_tutor_sessions')
        .update({ messages })
        .eq('id', sessionId);
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        sessionId,
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
