import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const steps = [
  "Searching Irish energy comparison sites...",
  "Analysing gas tariffs from major suppliers...",
  "Calculating estimated costs for your usage...",
  "Ranking deals by annual cost...",
];

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-secondary" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-spin-slow" />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground mb-2">Finding the best gas deals</h2>
      <p className="text-sm text-muted-foreground mb-6">This may take 15-30 seconds</p>
      <div className="space-y-2 text-center">
        {steps.map((step, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 2, duration: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            {step}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
