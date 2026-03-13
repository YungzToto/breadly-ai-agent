import { motion } from "framer-motion";
import type { SwitchResult } from "@/types/gas";
import { CheckCircle2, AlertCircle, ExternalLink, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SwitchPanelProps {
  result: SwitchResult | null;
  isLoading: boolean;
}

export function SwitchPanel({ result, isLoading }: SwitchPanelProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-12 rounded-xl border border-border bg-card"
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="font-display text-lg font-semibold text-foreground">Preparing your switch...</p>
        <p className="text-sm text-muted-foreground mt-1">Finding sign-up page and mapping your details</p>
      </motion.div>
    );
  }

  if (!result) return null;

  const copyFieldsToClipboard = () => {
    const text = Object.entries(result.field_mapping)
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Details copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Status banner */}
      <div className={`p-4 rounded-xl border ${
        result.status === "ready_for_user"
          ? "border-primary/30 bg-primary/5"
          : "border-destructive/30 bg-destructive/5"
      }`}>
        <div className="flex items-start gap-3">
          {result.status === "ready_for_user" ? (
            <CheckCircle2 className="w-6 h-6 text-primary mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-destructive mt-0.5" />
          )}
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {result.status === "ready_for_user" ? "Ready to Switch!" : "Action Required"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
          </div>
        </div>
      </div>

      {/* Steps progress */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h4 className="font-display font-semibold text-foreground mb-4">Switch Progress</h4>
        <div className="space-y-3">
          {result.steps.map((step) => (
            <div key={step.step} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step.status === "completed"
                  ? "bg-primary text-primary-foreground"
                  : step.status === "needs_user_input"
                  ? "bg-muted border-2 border-primary text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step.status === "completed" ? "✓" : step.step}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{step.name}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-filled fields */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-display font-semibold text-foreground">Your Details (Pre-filled)</h4>
          <Button variant="ghost" size="sm" onClick={copyFieldsToClipboard}>
            <Copy className="w-4 h-4 mr-1" /> Copy All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(result.field_mapping).map(([key, value]) => (
            <div key={key} className="p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      {result.sign_up_url && (
        <a href={result.sign_up_url} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full gradient-primary text-primary-foreground text-base py-6">
            <ExternalLink className="w-5 h-5 mr-2" />
            Go to {result.supplier}'s Sign-Up Page
          </Button>
        </a>
      )}
    </motion.div>
  );
}
