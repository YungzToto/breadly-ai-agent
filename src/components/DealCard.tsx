import { motion } from "framer-motion";
import type { GasDeal } from "@/types/gas";
import { TrendingDown, Clock, AlertTriangle, Check, X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DealCardProps {
  deal: GasDeal;
  currentSpend: number;
  onSelect: () => void;
  isSelected: boolean;
}

export function DealCard({ deal, currentSpend, onSelect, isSelected }: DealCardProps) {
  const savings = currentSpend - deal.estimated_annual_cost;
  const savingsPercent = ((savings / currentSpend) * 100).toFixed(1);
  const hasSavings = savings > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: deal.rank * 0.1 }}
      className={`relative p-5 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-primary glow-green"
          : deal.rank === 1
          ? "border-primary/50 bg-card"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      {deal.rank === 1 && (
        <div className="absolute -top-3 left-4 px-3 py-0.5 text-xs font-bold rounded-full gradient-primary text-primary-foreground">
          BEST DEAL
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground">#{deal.rank}</span>
            <h3 className="font-display text-lg font-bold text-foreground">{deal.supplier}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{deal.plan_name}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-foreground">
            €{deal.estimated_annual_cost.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">est. annual cost</p>
        </div>
      </div>

      {hasSavings && (
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-primary/10">
          <TrendingDown className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            Save €{savings.toFixed(0)}/year ({savingsPercent}%)
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="p-2.5 rounded-lg bg-secondary">
          <p className="text-xs text-muted-foreground">Unit Rate</p>
          <p className="font-semibold text-foreground">{deal.unit_rate_cents}c/kWh</p>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary">
          <p className="text-xs text-muted-foreground">Standing Charge</p>
          <p className="font-semibold text-foreground">€{deal.standing_charge_annual}/yr</p>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Contract
          </p>
          <p className="font-semibold text-foreground">{deal.contract_length_months}mo</p>
        </div>
      </div>

      {deal.exit_fee > 0 && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-destructive">
          <AlertTriangle className="w-3 h-3" />
          Exit fee: €{deal.exit_fee}
        </div>
      )}

      {deal.inclusions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Includes:</p>
          <div className="flex flex-wrap gap-1.5">
            {deal.inclusions.map((inc, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <Check className="w-3 h-3" /> {inc}
              </span>
            ))}
          </div>
        </div>
      )}

      {deal.exclusions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Excludes:</p>
          <div className="flex flex-wrap gap-1.5">
            {deal.exclusions.map((exc, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                <X className="w-3 h-3" /> {exc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {deal.sources && deal.sources.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Sources:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {deal.sources.map((src, i) => {
              let hostname = src;
              try { hostname = new URL(src).hostname.replace("www.", ""); } catch {}
              return (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                  title={src}
                >
                  {hostname}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <Button
        onClick={onSelect}
        variant={isSelected ? "default" : "outline"}
        className={`w-full ${isSelected ? "gradient-primary text-primary-foreground" : ""}`}
      >
        {isSelected ? "✓ Selected" : "Switch to this plan"}
      </Button>
    </motion.div>
  );
}
