import { Card } from "@/components/ui/card";
import { Mail, Share2, CheckCircle2, Send } from "lucide-react";
import React from "react";

interface LeadsStatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}

export const LeadsStatCard = ({ label, value, icon, color }: LeadsStatCardProps) => (
  <Card className="flex flex-col items-center justify-center p-4 gap-2 min-w-[120px]">
    <div className={`mb-2 ${color ?? ''}`}>{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </Card>
);
