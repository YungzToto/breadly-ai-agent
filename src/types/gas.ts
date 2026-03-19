export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    eircode: string;
    country: string;
  };
  gas_identifier: string;
  current_provider: string;
  meter_type: string;
  concession_card: boolean;
  annual_kwh: number;
  annual_spend_eur: number;
  iban?: string;
  consent_switch?: boolean;
  consent_data?: boolean;
}

export interface GasDeal {
  rank: number;
  supplier: string;
  plan_name: string;
  estimated_annual_cost: number;
  unit_rate_cents: number;
  standing_charge_annual: number;
  contract_length_months: number;
  exit_fee: number;
  inclusions: string[];
  exclusions: string[];
  source_url?: string;
}

export interface CompareResult {
  success: boolean;
  deals: GasDeal[];
  current_provider_estimate: {
    supplier: string;
    estimated_annual_cost: number;
    notes: string;
  };
  search_summary: string;
  user_summary: {
    name: string;
    annual_kwh: number;
    current_spend: number;
    current_provider: string;
  };
  error?: string;
}

export interface SwitchStep {
  step: number;
  name: string;
  status: "completed" | "partial" | "needs_user_input" | "blocked";
  detail: string;
}

export interface SwitchResult {
  success: boolean;
  status: "submitted" | "processing" | "completed" | "failed";
  supplier: string;
  plan: string;
  reference_number: string;
  field_mapping: Record<string, string>;
  steps: SwitchStep[];
  message: string;
  estimated_switch_date?: string;
  error?: string;
}
