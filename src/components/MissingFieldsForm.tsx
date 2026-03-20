import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MissingField } from "@/types/gas";

interface MissingFieldsFormProps {
  fields: MissingField[];
  supplierName: string;
  onSubmit: (values: Record<string, string>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function MissingFieldsForm({ fields, supplierName, onSubmit, onBack, isSubmitting }: MissingFieldsFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const update = (field: string, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const allRequiredFilled = fields
    .filter((f) => f.required)
    .every((f) => values[f.field_name]?.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Additional Information Needed</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {supplierName} requires a few more details to process your switch. These are non-payment fields needed to complete their sign-up form.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        {fields.map((field) => (
          <div key={field.field_name}>
            <Label htmlFor={field.field_name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
              value={values[field.field_name] || ""}
              onChange={(e) => update(field.field_name, e.target.value)}
              placeholder={field.type === "date" ? "" : `Enter your ${field.label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isSubmitting}>
          Go Back
        </Button>
        <Button
          className="flex-1 gradient-primary text-primary-foreground glow-green"
          disabled={!allRequiredFilled || isSubmitting}
          onClick={() => onSubmit(values)}
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
          ) : (
            <>Continue Switch <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
