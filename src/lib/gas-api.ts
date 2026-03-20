import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, CompareResult, SwitchResult, GasDeal } from "@/types/gas";

export async function compareGasDeals(user: UserProfile): Promise<CompareResult> {
  const { data, error } = await supabase.functions.invoke("gas-compare", {
    body: { user },
  });

  if (error) {
    throw new Error(error.message || "Failed to compare gas deals");
  }

  return data as CompareResult;
}

export async function executeSwitch(
  user: UserProfile,
  selectedDeal: GasDeal,
  iban: string,
  extraFields?: Record<string, string>
): Promise<SwitchResult> {
  const { data, error } = await supabase.functions.invoke("gas-switch", {
    body: { user, selectedDeal, iban, extraFields },
  });

  if (error) {
    throw new Error(error.message || "Failed to execute switch");
  }

  return data as SwitchResult;
}
