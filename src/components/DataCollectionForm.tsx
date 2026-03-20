import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, User, Home, Zap, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { UserProfile } from "@/types/gas";

interface DataCollectionFormProps {
  onSubmit: (user: UserProfile) => void;
}

const PROVIDERS = [
  "Bord Gáis Energy",
  "Energia",
  "Electric Ireland",
  "SSE Airtricity",
  "Flogas",
  "Panda Power",
  "Pinergy",
  "Other",
];

const STEPS = [
  { icon: User, label: "Personal" },
  { icon: Home, label: "Address" },
  { icon: Zap, label: "Gas Details" },
  { icon: FileCheck, label: "Consent" },
];

export function DataCollectionForm({ onSubmit }: DataCollectionFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    eircode: "",
    gas_identifier: "",
    current_provider: "",
    meter_type: "standard_credit",
    concession_card: false,
    annual_kwh: "",
    annual_spend_eur: "",
    consent_switch: false,
    consent_data: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canNext = () => {
    if (step === 0) return form.name && form.email && form.phone;
    if (step === 1) return form.line1 && form.city && form.eircode;
    if (step === 2) return form.current_provider && form.annual_kwh;
    if (step === 3) return form.consent_switch && form.consent_data;
    return false;
  };

  const handleSubmit = () => {
    const user: UserProfile = {
      user_id: crypto.randomUUID(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: {
        line1: form.line1,
        city: form.city,
        eircode: form.eircode,
        country: "Ireland",
      },
      gas_identifier: form.gas_identifier,
      current_provider: form.current_provider,
      meter_type: form.meter_type,
      concession_card: form.concession_card,
      annual_kwh: parseInt(form.annual_kwh) || 11000,
      annual_spend_eur: parseInt(form.annual_spend_eur) || 1500,
      consent_switch: true,
      consent_data: true,
    };
    onSubmit(user);
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                i <= step
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6 rounded-xl border border-border bg-card"
        >
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold text-foreground">Personal Details</h3>
              <p className="text-sm text-muted-foreground">We need your details to find the best deals and complete the switch.</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Aoife Byrne" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="aoife@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+353 86 000 1001" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold text-foreground">Your Address</h3>
              <p className="text-sm text-muted-foreground">This is needed to match your gas supply point.</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="line1">Address Line 1</Label>
                  <Input id="line1" value={form.line1} onChange={(e) => update("line1", e.target.value)} placeholder="14 Pembroke Street" />
                </div>
                <div>
                  <Label htmlFor="city">City / Town</Label>
                  <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Dublin" />
                </div>
                <div>
                  <Label htmlFor="eircode">Eircode</Label>
                  <Input id="eircode" value={form.eircode} onChange={(e) => update("eircode", e.target.value)} placeholder="D02 XH91" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold text-foreground">Gas Details</h3>
              <p className="text-sm text-muted-foreground">Help us estimate your costs accurately.</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="gprn">GPRN (optional)</Label>
                  <Input id="gprn" value={form.gas_identifier} onChange={(e) => update("gas_identifier", e.target.value)} placeholder="GPRN-1234567" />
                  <p className="text-xs text-muted-foreground mt-1">Found on your gas bill. Helps speed up the switch.</p>
                </div>
                <div>
                  <Label>Current Provider</Label>
                  <Select value={form.current_provider} onValueChange={(v) => update("current_provider", v)}>
                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Meter Type</Label>
                  <Select value={form.meter_type} onValueChange={(v) => update("meter_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select meter type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard_credit">Standard Credit</SelectItem>
                      <SelectItem value="prepay">Prepay (PAYG)</SelectItem>
                      <SelectItem value="budget_controller">Budget Controller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="kwh">Annual Usage (kWh)</Label>
                  <Input id="kwh" type="number" value={form.annual_kwh} onChange={(e) => update("annual_kwh", e.target.value)} placeholder="11000" />
                  <p className="text-xs text-muted-foreground mt-1">Average Irish home uses ~11,000 kWh/year</p>
                </div>
                <div>
                  <Label htmlFor="spend">Annual Spend (€)</Label>
                  <Input id="spend" type="number" value={form.annual_spend_eur} onChange={(e) => update("annual_spend_eur", e.target.value)} placeholder="1500" />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="concession" checked={form.concession_card} onCheckedChange={(v) => update("concession_card", !!v)} />
                  <Label htmlFor="concession" className="text-sm">I have a Household Benefits / Fuel Allowance</Label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold text-foreground">Consent & Review</h3>
              <p className="text-sm text-muted-foreground">Please confirm you're happy for Breadly to act on your behalf.</p>
              <div className="p-4 rounded-lg bg-secondary space-y-2">
                <p className="text-sm"><strong className="text-foreground">Name:</strong> <span className="text-muted-foreground">{form.name}</span></p>
                <p className="text-sm"><strong className="text-foreground">Address:</strong> <span className="text-muted-foreground">{form.line1}, {form.city}, {form.eircode}</span></p>
                <p className="text-sm"><strong className="text-foreground">Provider:</strong> <span className="text-muted-foreground">{form.current_provider}</span></p>
                <p className="text-sm"><strong className="text-foreground">Usage:</strong> <span className="text-muted-foreground">{form.annual_kwh || "~11,000"} kWh/year</span></p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox id="consent_switch" checked={form.consent_switch} onCheckedChange={(v) => update("consent_switch", !!v)} className="mt-0.5" />
                  <Label htmlFor="consent_switch" className="text-sm">I authorise Breadly to submit a gas switching request to the selected supplier on my behalf.</Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="consent_data" checked={form.consent_data} onCheckedChange={(v) => update("consent_data", !!v)} className="mt-0.5" />
                  <Label htmlFor="consent_data" className="text-sm">I consent to Breadly processing my personal data for the purpose of comparing and switching gas suppliers.</Label>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="gradient-primary text-primary-foreground"
          >
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canNext()}
            className="gradient-primary text-primary-foreground glow-green"
          >
            Find Best Deals <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
