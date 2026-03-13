import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, selectedDeal } = await req.json();

    if (!user || !selectedDeal) {
      return new Response(JSON.stringify({ error: "User data and selected deal are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    console.log(`Starting switch process for ${user.name} to ${selectedDeal.supplier} - ${selectedDeal.plan_name}`);

    // Step 1: Find the supplier's sign-up page using Firecrawl
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${selectedDeal.supplier} Ireland gas sign up switch online ${selectedDeal.plan_name}`,
        limit: 3,
        country: "ie",
        lang: "en",
      }),
    });

    let signUpUrl = "";
    let signUpPageContent = "";

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.data?.length > 0) {
        signUpUrl = searchData.data[0].url || "";
        
        // Scrape the sign-up page to understand form fields
        if (signUpUrl) {
          try {
            const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: signUpUrl,
                formats: ["markdown"],
                onlyMainContent: true,
              }),
            });

            if (scrapeResponse.ok) {
              const scrapeData = await scrapeResponse.json();
              signUpPageContent = scrapeData.data?.markdown || scrapeData.markdown || "";
            }
          } catch (e) {
            console.error("Scrape error:", e);
          }
        }
      }
    }

    // Step 2: Map user fields to the supplier's form
    const fieldMapping = {
      full_name: user.name,
      email: user.email,
      phone: user.phone,
      address_line_1: user.address?.line1,
      city: user.address?.city,
      eircode: user.address?.eircode,
      gprn: user.gas_identifier,
      current_supplier: user.current_provider,
      meter_type: user.meter_type === "standard_credit" ? "Standard Credit" : user.meter_type,
    };

    // Step 3: Determine switch status
    const steps = [
      { step: 1, name: "Find supplier sign-up page", status: signUpUrl ? "completed" : "blocked", detail: signUpUrl || "Could not find sign-up URL" },
      { step: 2, name: "Analyse form requirements", status: signUpPageContent ? "completed" : "partial", detail: signUpPageContent ? "Form structure identified" : "Limited form analysis" },
      { step: 3, name: "Pre-fill user details", status: "completed", detail: "All user fields mapped and ready" },
      { step: 4, name: "Navigate to final confirmation", status: "needs_user_input", detail: "Requires user to complete payment details on supplier website" },
    ];

    const overallStatus = signUpUrl ? "ready_for_user" : "blocked";

    return new Response(JSON.stringify({
      success: true,
      status: overallStatus,
      supplier: selectedDeal.supplier,
      plan: selectedDeal.plan_name,
      sign_up_url: signUpUrl,
      field_mapping: fieldMapping,
      steps,
      message: overallStatus === "ready_for_user"
        ? `All details prepared for ${selectedDeal.supplier}. The user needs to visit the supplier's website to complete payment details and final confirmation.`
        : `Could not locate the sign-up page for ${selectedDeal.supplier}. The user may need to visit the supplier's website directly.`,
      sign_up_page_summary: signUpPageContent ? signUpPageContent.slice(0, 500) : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gas-switch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
