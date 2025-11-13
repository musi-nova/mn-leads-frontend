import { Card } from "@/components/ui/card";
import { useLeadsStats } from "@/hooks/useLeads";
import { Mail, Share2 } from "lucide-react";

export const LeadsStats = () => {
  const { data: stats, isLoading, error } = useLeadsStats();

  return (
    <div className="my-4 w-full flex flex-col">
      {isLoading ? (
        <span className="text-muted-foreground">Loading stats...</span>
      ) : error ? (
        <span className="text-destructive">{error instanceof Error ? error.message : String(error)}</span>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col items-center justify-center p-4 gap-2 min-w-[120px]">
            <Mail className="h-6 w-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.email_leads.sent} <span className="text-base font-normal">/ {stats.email_leads.total}</span></div>
            <div className="text-sm text-muted-foreground">Email Leads Sent</div>
          </Card>
          <Card className="flex flex-col items-center justify-center p-4 gap-2 min-w-[120px]">
            <Share2 className="h-6 w-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.social_leads.sent} <span className="text-base font-normal">/ {stats.social_leads.total}</span></div>
            <div className="text-sm text-muted-foreground">Social Leads Sent</div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
