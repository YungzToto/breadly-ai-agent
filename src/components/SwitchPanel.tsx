import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { SwitchStep } from "@/types/gas";

interface SwitchProgressProps {
  steps: SwitchStep[];
  isProcessing: boolean;
}

export function SwitchProgress({ steps, isProcessing }: SwitchProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-6">
          {isProcessing && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {isProcessing ? "Processing your switch..." : "Switch submitted"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isProcessing ? "Our agent is submitting your switch request" : "All steps complete"}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.step} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step.status === "completed"
                  ? "bg-primary text-primary-foreground"
                  : step.status === "needs_user_input"
                  ? "bg-muted border-2 border-primary text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : step.step}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{step.name}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
