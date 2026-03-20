import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user } = await req.json();
    
    if (!user) {
      return new Response(JSON.stringify({ error: "User data is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log(`Searching gas deals for user: ${user.name} (${user.annual_kwh} kWh/year)`);

    // Priority-ordered search queries per SRD:
    // 1. CRU/government/regulator resources
    // 2. Supplier direct pages (tariff/plan details)
    // 3. Reputable comparison sites as fallback
    const searchQueries = [
      `site:cru.ie gas tariff rates Ireland ${new Date().getFullYear()}`,
      `site:seai.ie home energy gas costs Ireland ${new Date().getFullYear()}`,
      `site:bordgaisenergy.ie gas plans tariff rates ${new Date().getFullYear()}`,
      `site:energia.ie gas plans tariff rates ${new Date().getFullYear()}`,
      `site:electricireland.ie gas plans tariff rates ${new Date().getFullYear()}`,
      `site:sseairtricity.com gas plans tariff Ireland ${new Date().getFullYear()}`,
      `site:flogas.ie gas plans tariff rates ${new Date().getFullYear()}`,
      `best gas deals Ireland ${new Date().getFullYear()} comparison cheapest tariff switcher bonkers`,
    ];

    const searchResults: string[] = [];

    for (const query of searchQueries) {
      try {
        const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: 5,
            country: "ie",
            lang: "en",
            scrapeOptions: { formats: ["markdown"] },
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.data) {
            for (const result of searchData.data) {
              const content = result.markdown || result.description || "";
              if (content) {
                searchResults.push(`Source: ${result.url}\nTitle: ${result.title}\n${content.slice(0, 3000)}`);
              }
            }
          }
        }
      } catch (e) {
        console.error(`Search error for query "${query}":`, e);
      }
    }

    console.log(`Collected ${searchResults.length} search results`);

    // Use Lovable AI to analyze, filter for eligibility, and rank deals
    const analysisPrompt = `You are an energy comparison expert for the Republic of Ireland gas market.

USER DETAILS:
- Name: ${user.name}
- Location: ${user.address?.city}, ${user.address?.eircode}
- GPRN: ${user.gas_identifier}
- Current Provider: ${user.current_provider}
- Meter Type: ${user.meter_type}
- Annual Usage: ${user.annual_kwh} kWh
- Current Annual Spend: €${user.annual_spend_eur}
- Concession Card: ${user.concession_card ? "Yes" : "No"}

SEARCH RESULTS FROM IRISH ENERGY SOURCES:
${searchResults.join("\n\n---\n\n")}

ELIGIBILITY FILTERING RULES:
- Filter out plans not available for the user's meter type (${user.meter_type})
- Filter out plans restricted to locations the user's eircode (${user.address?.eircode}) does not match
- If the user has a concession card, note any relevant discounts or restrictions
- Apply any new-customer-only restrictions (user is currently with ${user.current_provider})
- Apply any supplier-specific eligibility rules discovered in the search results

Based on the search results and the user's usage of ${user.annual_kwh} kWh/year, return EXACTLY 5 eligible gas deals ranked from cheapest to most expensive estimated annual cost.

You MUST respond with a valid JSON object in this exact format (no markdown, no code blocks, just raw JSON):
{
  "deals": [
    {
      "rank": 1,
      "supplier": "Supplier Name",
      "plan_name": "Plan Name",
      "estimated_annual_cost": 1234.56,
      "unit_rate_cents": 7.5,
      "standing_charge_annual": 200,
      "contract_length_months": 12,
      "exit_fee": 0,
      "inclusions": ["Cashback offer", "etc"],
      "exclusions": ["No smart meter discount"],
      "sources": ["https://url1.com", "https://url2.com"]
    }
  ],
  "current_provider_estimate": {
    "supplier": "${user.current_provider}",
    "plan_name": null,
    "estimated_annual_cost": ${user.annual_spend_eur},
    "notes": "Based on user's reported spend"
  },
  "search_summary": "Brief summary of the current Irish gas market and eligibility notes"
}

IMPORTANT:
- Each deal MUST include at least 1 supporting URL in the "sources" array
- Use real supplier names from the Irish market
- If exact pricing isn't available, estimate based on the Irish gas market and note it
- The "sources" array should contain the URLs where you found the pricing data`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an Irish energy market analyst. Return only valid JSON, no markdown formatting." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Clean potential markdown code block wrapping
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI returned invalid JSON");
    }

    console.log(`Successfully ranked ${parsed.deals?.length || 0} deals`);

    return new Response(JSON.stringify({
      success: true,
      ...parsed,
      user_summary: {
        name: user.name,
        annual_kwh: user.annual_kwh,
        current_spend: user.annual_spend_eur,
        current_provider: user.current_provider,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gas-compare error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
