import { motion } from "framer-motion";
import type { UserProfile } from "@/types/gas";
import { Zap, MapPin, Gauge, CreditCard } from "lucide-react";

interface UserCardProps {
  user: UserProfile;
  selected: boolean;
  onSelect: () => void;
}

export function UserCard({ user, selected, onSelect }: UserCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-5 rounded-xl border-2 transition-colors ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.user_id}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-primary bg-primary" : "border-muted-foreground"
        }`}>
          {selected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>{user.address.city}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span>{user.current_provider}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Gauge className="w-3.5 h-3.5 text-primary" />
          <span>{user.annual_kwh.toLocaleString()} kWh/yr</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard className="w-3.5 h-3.5 text-primary" />
          <span>€{user.annual_spend_eur.toLocaleString()}/yr</span>
        </div>
      </div>
    </motion.button>
  );
}
