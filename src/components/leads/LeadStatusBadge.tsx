import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@/types/lead";

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const variants: Record<LeadStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    new: { variant: "default", className: "bg-primary text-primary-foreground" },
    contacted: { variant: "secondary", className: "bg-accent text-accent-foreground" },
    qualified: { variant: "default", className: "bg-success text-success-foreground" },
    converted: { variant: "default", className: "bg-success text-success-foreground" },
    unresponsive: { variant: "secondary", className: "bg-muted text-muted-foreground" },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
