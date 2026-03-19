import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flame, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DataCollectionForm } from "@/components/DataCollectionForm";
import { DealCard } from "@/components/DealCard";
import { PaymentForm } from "@/components/PaymentForm";
import { SwitchConfirmation } from "@/components/SwitchConfirmation";
import { SwitchProgress } from "@/components/SwitchPanel";
import { LoadingState } from "@/components/LoadingState";
import { compareGasDeals, executeSwitch } from "@/lib/gas-api";
import type { UserProfile, GasDeal, CompareResult, SwitchResult } from "@/types/gas";

type Step = "collect_data" | "comparing" | "results" | "payment" | "switching" | "complete";

const Index = () => {
  const [step, setStep] = useState<Step>("collect_data");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<GasDeal | null>(null);
  const [switchResult, setSwitchResult] = useState<SwitchResult | null>(null);

  const handleUserSubmit = async (userData: UserProfile) => {
    setUser(userData);
    setStep("comparing");
    try {
      const result = await compareGasDeals(userData);
      if (result.error) throw new Error(result.error);
      setCompareResult(result);
      setStep("results");
    } catch (e: any) {
      toast.error(e.message || "Failed to compare deals");
      setStep("collect_data");
    }
  };

  const handleSelectDeal = (deal: GasDeal) => {
    setSelectedDeal(deal);
  };

  const handleProceedToPayment = () => {
    if (selectedDeal) setStep("payment");
  };

  const handleExecuteSwitch = async (iban: string) => {
    if (!user || !selectedDeal) return;
    setStep("switching");
    try {
      const result = await executeSwitch(user, selectedDeal, iban);
      if (result.error) throw new Error(result.error);
      setSwitchResult(result);
      setStep("complete");
    } catch (e: any) {
      toast.error(e.message || "Failed to process switch");
      setStep("payment");
    }
  };

  const reset = () => {
    setStep("collect_data");
    setUser(null);
    setCompareResult(null);
    setSelectedDeal(null);
    setSwitchResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Breadly</h1>
              <p className="text-xs text-muted-foreground">Gas Switching Agent</p>
            </div>
          </div>
          {step !== "collect_data" && step !== "complete" && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Start Over
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Data Collection */}
          {step === "collect_data" && (
            <motion.div
              key="collect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                >
                  <Zap className="w-4 h-4" /> AI-Powered Gas Switching
                </motion.div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Switch gas & <span className="text-gradient">save money</span> — all in one place
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Tell us about your gas supply. Our AI agent will find the best deals, submit the switch,
                  and handle everything — you never leave the app.
                </p>
              </div>

              <DataCollectionForm onSubmit={handleUserSubmit} />

              <div className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" /> End-to-end switching
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" /> AI-powered deals
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-primary" /> No external sites
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Loading */}
          {step === "comparing" && (
            <motion.div key="loading" exit={{ opacity: 0 }}>
              <LoadingState />
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === "results" && compareResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Top Gas Deals for {compareResult.user_summary.name}
                </h2>
                <p className="text-muted-foreground">
                  Based on {compareResult.user_summary.annual_kwh.toLocaleString()} kWh/year usage.
                  Currently paying €{compareResult.user_summary.current_spend.toLocaleString()}/year
                  with {compareResult.user_summary.current_provider}.
                </p>
                {compareResult.search_summary && (
                  <p className="text-sm text-muted-foreground mt-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    {compareResult.search_summary}
                  </p>
                )}
              </div>

              {compareResult.current_provider_estimate && (
                <div className="p-4 rounded-xl border border-border bg-secondary/30 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Your current plan</p>
                      <p className="font-display font-semibold text-foreground">
                        {compareResult.current_provider_estimate.supplier}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold text-foreground">
                        €{compareResult.current_provider_estimate.estimated_annual_cost.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">est. annual</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {compareResult.deals.map((deal) => (
                  <DealCard
                    key={deal.rank}
                    deal={deal}
                    currentSpend={compareResult.user_summary.current_spend}
                    isSelected={selectedDeal?.rank === deal.rank}
                    onSelect={() => handleSelectDeal(deal)}
                  />
                ))}
              </div>

              {selectedDeal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={handleProceedToPayment}
                    size="lg"
                    className="gradient-primary text-primary-foreground px-8 py-6 text-base glow-green"
                  >
                    Switch to {selectedDeal.supplier} — Complete In-App
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === "payment" && selectedDeal && user && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PaymentForm
                deal={selectedDeal}
                user={user}
                onSubmit={handleExecuteSwitch}
                onBack={() => setStep("results")}
                isSubmitting={false}
              />
            </motion.div>
          )}

          {/* Step 5: Processing */}
          {step === "switching" && (
            <motion.div
              key="switching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <SwitchProgress
                isProcessing={true}
                steps={[
                  { step: 1, name: "Verifying your details", status: "completed", detail: "All information validated" },
                  { step: 2, name: "Contacting supplier", status: "completed", detail: `Connecting to ${selectedDeal?.supplier}` },
                  { step: 3, name: "Submitting switch request", status: "needs_user_input", detail: "Processing..." },
                  { step: 4, name: "Setting up Direct Debit", status: "blocked", detail: "Pending" },
                ]}
              />
            </motion.div>
          )}

          {/* Step 6: Complete */}
          {step === "complete" && switchResult && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SwitchConfirmation result={switchResult} onStartOver={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
