import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Flame, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCard } from "@/components/UserCard";
import { DealCard } from "@/components/DealCard";
import { SwitchPanel } from "@/components/SwitchPanel";
import { LoadingState } from "@/components/LoadingState";
import { compareGasDeals, executeSwitch } from "@/lib/gas-api";
import type { UserProfile, GasDeal, CompareResult, SwitchResult } from "@/types/gas";
import sampleUsers from "@/data/sample-users.json";

type Step = "select_user" | "comparing" | "results" | "confirm_switch" | "switching" | "switch_result";

const Index = () => {
  const [step, setStep] = useState<Step>("select_user");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<GasDeal | null>(null);
  const [switchResult, setSwitchResult] = useState<SwitchResult | null>(null);

  const users = sampleUsers as UserProfile[];

  const handleCompare = async () => {
    if (!selectedUser) return;
    setStep("comparing");
    try {
      const result = await compareGasDeals(selectedUser);
      if (result.error) throw new Error(result.error);
      setCompareResult(result);
      setStep("results");
    } catch (e: any) {
      toast.error(e.message || "Failed to compare deals");
      setStep("select_user");
    }
  };

  const handleSwitchConfirm = () => {
    if (!selectedDeal) return;
    setStep("confirm_switch");
  };

  const handleExecuteSwitch = async () => {
    if (!selectedUser || !selectedDeal) return;
    setStep("switching");
    try {
      const result = await executeSwitch(selectedUser, selectedDeal);
      if (result.error) throw new Error(result.error);
      setSwitchResult(result);
      setStep("switch_result");
    } catch (e: any) {
      toast.error(e.message || "Failed to execute switch");
      setStep("results");
    }
  };

  const reset = () => {
    setStep("select_user");
    setSelectedUser(null);
    setCompareResult(null);
    setSelectedDeal(null);
    setSwitchResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          {step !== "select_user" && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Start Over
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Select User */}
          {step === "select_user" && (
            <motion.div
              key="select"
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
                  <Zap className="w-4 h-4" /> AI-Powered Gas Comparison
                </motion.div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Find the <span className="text-gradient">best gas deal</span> in Ireland
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Select a user profile below. Our AI agent will search live energy comparison sites
                  and rank the top deals based on their usage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {users.map((user) => (
                  <UserCard
                    key={user.user_id}
                    user={user}
                    selected={selectedUser?.user_id === user.user_id}
                    onSelect={() => setSelectedUser(user)}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleCompare}
                  disabled={!selectedUser}
                  size="lg"
                  className="gradient-primary text-primary-foreground px-8 py-6 text-base glow-green"
                >
                  Find Best Deals <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Live web search
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" /> AI-powered ranking
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-primary" /> 5 top deals
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

              {/* Current provider banner */}
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
                    onSelect={() => setSelectedDeal(deal)}
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
                    onClick={handleSwitchConfirm}
                    size="lg"
                    className="gradient-primary text-primary-foreground px-8 py-6 text-base glow-green"
                  >
                    Switch to {selectedDeal.supplier} <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 4: Confirm Switch */}
          {step === "confirm_switch" && selectedDeal && selectedUser && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto"
            >
              <div className="p-6 rounded-xl border border-border bg-card text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                  <Flame className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Confirm Switch</h2>
                <p className="text-muted-foreground mb-6">
                  You're about to switch <strong className="text-foreground">{selectedUser.name}</strong> to{" "}
                  <strong className="text-primary">{selectedDeal.supplier} — {selectedDeal.plan_name}</strong> at an estimated{" "}
                  <strong className="text-foreground">€{selectedDeal.estimated_annual_cost.toLocaleString()}/year</strong>.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("results")}>
                    Go Back
                  </Button>
                  <Button
                    className="flex-1 gradient-primary text-primary-foreground"
                    onClick={handleExecuteSwitch}
                  >
                    Confirm & Switch
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Our agent will locate the supplier's sign-up page and pre-fill your details.
                  You'll complete payment on the supplier's site.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 5 & 6: Switching / Result */}
          {(step === "switching" || step === "switch_result") && (
            <motion.div
              key="switch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Switch Execution
                </h2>
                <p className="text-muted-foreground">
                  {step === "switching"
                    ? "Our agent is preparing your switch..."
                    : `Switching to ${selectedDeal?.supplier}`}
                </p>
              </div>
              <SwitchPanel result={switchResult} isLoading={step === "switching"} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
