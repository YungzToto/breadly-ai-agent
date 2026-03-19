import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Copy, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SwitchResult } from "@/types/gas";

interface SwitchConfirmationProps {
  result: SwitchResult;
  onStartOver: () => void;
}

export function SwitchConfirmation({ result, onStartOver }: SwitchConfirmationProps) {
  const copyRef = () => {
    navigator.clipboard.writeText(result.reference_number);
    toast.success("Reference copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto space-y-6"
    >
      {/* Success header */}
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center"
        >
          <PartyPopper className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground">Switch Complete!</h2>
        <p className="text-muted-foreground mt-2">{result.message}</p>
      </div>

      {/* Reference */}
      <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Reference Number</p>
            <p className="font-display text-lg font-bold text-foreground font-mono">{result.reference_number}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={copyRef}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <p className="font-display font-semibold text-foreground">Switch Details</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">New Supplier</p>
            <p className="font-medium text-foreground">{result.supplier}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Plan</p>
            <p className="font-medium text-foreground">{result.plan}</p>
          </div>
        </div>
        {result.estimated_switch_date && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-sm text-foreground">
              Estimated switch date: <strong>{result.estimated_switch_date}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h4 className="font-display font-semibold text-foreground mb-3">What happens next</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>1. {result.supplier} will process your application (1-2 business days)</p>
          <p>2. Your current provider will be notified of the switch</p>
          <p>3. The switch typically completes within 5-10 business days</p>
          <p>4. You'll receive confirmation from {result.supplier} by email</p>
        </div>
      </div>

      <Button onClick={onStartOver} variant="outline" className="w-full">
        Switch Another Account
      </Button>
    </motion.div>
  );
}
