import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { GasDeal, UserProfile } from "@/types/gas";

interface PaymentFormProps {
  deal: GasDeal;
  user: UserProfile;
  onSubmit: (iban: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function PaymentForm({ deal, user, onSubmit, onBack, isSubmitting }: PaymentFormProps) {
  const [iban, setIban] = useState("");
  const [confirmDd, setConfirmDd] = useState(false);

  const formatIban = (value: string) => {
    const cleaned = value.replace(/\s/g, "").toUpperCase();
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  const isValidIban = iban.replace(/\s/g, "").length >= 15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      {/* Summary */}
      <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
        <h3 className="font-display text-lg font-bold text-foreground mb-3">Switch Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Switching to</p>
            <p className="font-semibold text-foreground">{deal.supplier}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Plan</p>
            <p className="font-semibold text-foreground">{deal.plan_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. Annual Cost</p>
            <p className="font-semibold text-foreground">€{deal.estimated_annual_cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Account Holder</p>
            <p className="font-semibold text-foreground">{user.name}</p>
          </div>
        </div>
      </div>

      {/* Payment details */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">Payment Details</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your new supplier will set up a Direct Debit for monthly gas payments.
        </p>

        <div>
          <Label htmlFor="iban">IBAN</Label>
          <Input
            id="iban"
            value={formatIban(iban)}
            onChange={(e) => setIban(e.target.value.replace(/\s/g, ""))}
            placeholder="IE29 AIBK 9311 5212 3456 78"
            className="font-mono tracking-wider"
          />
          <p className="text-xs text-muted-foreground mt-1">Found on your bank statement or banking app</p>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="confirm_dd"
            checked={confirmDd}
            onCheckedChange={(v) => setConfirmDd(!!v)}
            className="mt-0.5"
          />
          <Label htmlFor="confirm_dd" className="text-sm">
            I authorise {deal.supplier} to collect payments from this account via SEPA Direct Debit.
            I understand I can cancel this at any time.
          </Label>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <Shield className="w-4 h-4 text-primary flex-shrink-0" />
        <p>Your payment details are encrypted and submitted directly to the supplier. Breadly does not store your IBAN.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isSubmitting}>
          Go Back
        </Button>
        <Button
          className="flex-1 gradient-primary text-primary-foreground glow-green"
          disabled={!isValidIban || !confirmDd || isSubmitting}
          onClick={() => onSubmit(iban)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
            </>
          ) : (
            <>
              Complete Switch <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
