import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { symptoms } = await req.json();

    // Validate input
    if (!symptoms || typeof symptoms !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid symptoms format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (symptoms.length < 10 || symptoms.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Symptoms must be 10-2000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an experienced medical AI assistant trained in symptom analysis and disease identification. Your role is to provide accurate, evidence-based assessments.

When analyzing symptoms, provide a structured response with:

1. **Possible Conditions** (List 2-4 most likely diagnoses based on symptoms, ordered by probability)
   - For each condition, briefly explain why the symptoms match
   - Include both common and serious conditions if applicable

2. **Severity Assessment**
   - Low Risk: Minor conditions that can be managed at home
   - Medium Risk: Conditions requiring medical consultation within 24-48 hours  
   - High Risk: Urgent conditions requiring immediate medical attention

3. **Recommended Actions**
   - Self-care measures if appropriate
   - When to consult a doctor (specific timeframe)
   - Red flags that require immediate ER visit

4. **Additional Observations**
   - Questions to consider (duration, frequency, triggers)
   - Relevant risk factors to be aware of

CRITICAL REMINDERS:
- Base analysis on medical evidence and common presentations
- Consider age-appropriate conditions if age is mentioned
- Flag any emergency symptoms (chest pain, difficulty breathing, severe bleeding, etc.)
- Always include: "⚠️ This is an AI assessment. Please consult a qualified healthcare provider for proper diagnosis and treatment."
- Be empathetic but factual
- Avoid definitive diagnoses; use terms like "possible," "may indicate," "consistent with"

Format your response clearly with headers and bullet points for easy reading.`
          },
          {
            role: "user",
            content: `Patient symptoms: ${symptoms}\n\nPlease analyze these symptoms and provide your assessment.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI API error:", error);
      throw new Error("Failed to analyze symptoms");
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
