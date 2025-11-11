import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadActions } from "@/components/leads/LeadActions";
import { LeadType } from "@/types/lead";
import { useLeads } from "@/hooks/useLeads";
import { useMessageLeads } from "@/hooks/useMessageLeads";
import { Mail, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<LeadType | "all">("all");
  const { toast } = useToast();
  
  const { data: leads = [], isLoading, error } = useLeads();
  const messageLeadsMutation = useMessageLeads();

  const filteredLeads = leads.filter(lead => 
    activeTab === "all" ? true : lead.type === activeTab
  );

  const handleMessageSelected = async () => {
    toast({
      title: "Messaging leads...",
      description: `Sending messages to ${selectedIds.size} lead${selectedIds.size === 1 ? '' : 's'}`,
    });

    try {
      await messageLeadsMutation.mutateAsync({
        lead_ids: Array.from(selectedIds),
      });
      
      toast({
        title: "Messages sent!",
        description: `Successfully sent messages to ${selectedIds.size} lead${selectedIds.size === 1 ? '' : 's'}`,
      });
      
      setSelectedIds(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send messages. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading leads...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load leads</p>
          <p className="text-sm text-muted-foreground">Please check your API configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage and message your email and social media leads
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{leads.length}</span> total leads
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeadType | "all")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="all" className="gap-2">
              All Leads
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
          </TabsList>

          <LeadActions
            selectedCount={selectedIds.size}
            onMessageSelected={handleMessageSelected}
            onClearSelection={() => setSelectedIds(new Set())}
          />

          <TabsContent value="all" className="mt-0">
            <LeadsTable
              leads={filteredLeads}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </TabsContent>
          <TabsContent value="email" className="mt-0">
            <LeadsTable
              leads={filteredLeads}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </TabsContent>
          <TabsContent value="social" className="mt-0">
            <LeadsTable
              leads={filteredLeads}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
