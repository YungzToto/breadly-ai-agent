AI-Powered Gas Switching Agent
-> An in-app gas switching tool for Irish consumers. Users compare deals and complete the entire supplier switch without leaving the platform.

Tech Stack:
-> Frontend: React, TypeScript, Vite, Tailwind CSS
-> UI Components: shadcn-ui 
-> Backend: Supabase Edge Functions 
-> AI Used: Lovable
-> Web Scraping: Firecrawl API

How It Works:
1. Data Collection (DataCollectionForm.tsx)
-> The multi-step form collects: name, email, phone, address, Eircode, GPRN, current provider, meter type, annual usage, and consent from the user.

2. Deal Comparison (gas-compare edge function):
-> Scrapes 8 priority-ordered sources via Firecrawl: CRU/SEAI government sites → supplier direct sites (Bord Gáis, Energia, Electric Ireland, SSE Airtricity, Flogas) → comparison sites (Switcher, Bonkers)
-> Sends all scraped content + user profile to Gemini 2.5 Flash with a structured prompt
-> AI returns top 5 eligible deals as JSON, filtered by meter type, location, concession card status, and new-customer restrictions
-> Frontend displays deals in DealCard components with estimated savings vs. current spend

3. Automated Switch (gas-switch edge function):
-> Scrapes the selected supplier's sign-up page via Firecrawl
-> AI analyses the form fields and compares against collected user data

Returns one of 4 statuses:
-> needs_user_input — supplier needs extra fields (e.g., date of birth) → renders MissingFieldsForm
-> success_pre_payment_screen — all non-payment fields filled → renders PaymentForm for IBAN
blocked / failed — switch cannot proceed

4. Payment & Completion:
-> The user enters their IBAN for Direct Debit. The final call to the gas-switch with the IBAN completes the switch and returns a reference number and estimated switch date.

Key Files:
-> src/pages/Index.tsx:	Main page (collect_data → comparing → results → missing_fields → payment → switching → complete)
-> src/lib/gas-api.ts: Client-side API wrapper — calls edge functions via Supabase SDK
-> src/types/gas.ts:	TypeScript interfaces for UserProfile, GasDeal, CompareResult, SwitchResult, MissingField
-> supabase/functions/gas-compare/	Edge function: scrape + AI deal ranking
-> supabase/functions/gas-switch/	Edge function: scrape supplier form + AI field analysis + status resolution

Environment Variables:
-> FIRECRAWL_API_KEY:	Edge function secret	Web scraping via Firecrawl
-> LOVABLE_API_KEY:	Auto-provisioned	AI Gateway authentication
-> VITE_SUPABASE_URL:	.env (auto)	Supabase project URL
-> VITE_SUPABASE_PUBLISHABLE_KEY:	.env (auto)	Supabase anon key

-> How To Run Locally:
npm install
npm run dev
