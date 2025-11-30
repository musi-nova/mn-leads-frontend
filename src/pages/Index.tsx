import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadsStats } from "@/components/leads/LeadsStats";
import { LeadActions } from "@/components/leads/LeadActions";
import { EmailAnalytics } from "@/components/leads/EmailAnalytics";
import { LeadType } from "@/types/lead";
import { useLeads, useCreateEmailLead, useCreateSocialLead, useDeleteLead, useUpdateEmailLead, useUpdateSocialLead, useAutoDmSocialLeads, useAutoDmEmailLeads } from "@/hooks/useLeads";
import { useMessageLeads } from "@/hooks/useMessageLeads";
import { Mail, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Helper to fetch all unmessaged leads for random selection
async function fetchAllUnmessagedLeads(type: 'all' | 'email' | 'social', token: string | null, apiBaseUrl: string, search: string) {
  const endpoints = [];
  if (type === 'all' || type === 'email') endpoints.push({ endpoint: 'email', leadType: 'email' });
  if (type === 'all' || type === 'social') endpoints.push({ endpoint: 'social', leadType: 'social' });
  const params = new URLSearchParams();
  if (search) params.append('query', search);
  params.append('limit', '5000'); // Arbitrary high limit
  params.append('offset', '0');
  const results = await Promise.all(
    endpoints.map(async ({ endpoint, leadType }) => {
      const res = await fetch(`${apiBaseUrl}/leads/${endpoint}?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (type === 'email') {
        console.log('Fetched email leads for unmessaged:', data);
      }
      return (data.items || []).filter((l: any) => l.date_sent === null || l.date_sent === undefined || l.date_sent === '').map((l: any) => ({ ...l, type: leadType }));
    })
  );
  return results.flat();
}

const Index = () => {
  // PaginationControls component
  type PaginationControlsProps = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (p: number) => void;
  };
  function PaginationControls({ page, pageSize, total, onPageChange }: PaginationControlsProps) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          Previous
        </button>
        <span>Page {page + 1} of {totalPages}</span>
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          Next
        </button>
      </div>
    );
  }
  const [newLeadType, setNewLeadType] = useState<LeadType>('email');
  const [form, setForm] = useState<any>({
    email: '',
    name: '',
    template_used: '',
    notes: '',
    track_title: '',
    genre: '',
    facebook_handle: '',
    instagram_handle: '',
    spotify_handle: '',
  });
  // Pagination, search, sort, and filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [onlyUnmessaged, setOnlyUnmessaged] = useState(true);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 900);
    return () => clearTimeout(handler);
  }, [search]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleLeadTypeChange = (value: LeadType) => {
    setNewLeadType(value);
    setForm({ ...form, email: '', name: '', template_used: '', notes: '', track_title: '', genre: '', facebook_handle: '', instagram_handle: '', spotify_handle: '' });
  };
  const createEmailLead = useCreateEmailLead();
  const createSocialLead = useCreateSocialLead();
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<LeadType | "all" | "analytics">("all");
  // Clear selection when tab changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);
  const [randomLeads, setRandomLeads] = useState<any[] | null>(null);
  const [randomLeadsTab, setRandomLeadsTab] = useState<'email' | 'social' | null>(null);
  const deleteLeadMutation = useDeleteLead();
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      for (const id of selectedIds) {
        const lead = leads.find(l => l.id === id);
        if (lead) {
          await deleteLeadMutation.mutateAsync({ id: lead.id, type: lead.type });
        }
      }
      toast({ title: 'Deleted', description: `Deleted ${selectedIds.size} lead${selectedIds.size === 1 ? '' : 's'}` });
      setSelectedIds(new Set());
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete leads', variant: 'destructive' });
    }
  };
  // (removed duplicate declaration of activeTab)
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedRandomCount, setSelectedRandomCount] = useState(1);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const updateEmailLead = useUpdateEmailLead();
  const updateSocialLead = useUpdateSocialLead();
  const [updateForm, setUpdateForm] = useState<any>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Clear randomLeads if tab changes
  useEffect(() => {
    if (randomLeadsTab && activeTab !== randomLeadsTab) {
      setRandomLeads(null);
      setRandomLeadsTab(null);
    }
  }, [activeTab]);

  // Open update modal and prefill form
  const handleOpenUpdateModal = () => {
    if (selectedIds.size !== 1) return;
    const lead = leads.find(l => l.id === Array.from(selectedIds)[0]);
    if (!lead) return;
    setUpdateForm({ ...lead });
    setOpenUpdateModal(true);
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateForm) return;
    setUpdateLoading(true);
    try {
      if (updateForm.type === 'email') {
        await updateEmailLead.mutateAsync({ id: updateForm.id, data: updateForm });
      } else {
        await updateSocialLead.mutateAsync({ id: updateForm.id, data: updateForm });
      }
      toast({ title: 'Updated', description: 'Lead updated successfully' });
      setOpenUpdateModal(false);
      setSelectedIds(new Set());
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update lead', variant: 'destructive' });
    } finally {
      setUpdateLoading(false);
    }
  };
  const { toast } = useToast();
  const {
    data: paginatedLeads,
    isLoading,
    error
  } = useLeads({
    type: ["all", "email", "social"].includes(activeTab) ? (activeTab as "all" | "email" | "social") : "all",
    query: debouncedSearch,
    limit: pageSize,
    offset: page * pageSize,
    sort,
    only_unmessaged: onlyUnmessaged,
  });
  const leads = paginatedLeads?.items || [];
  const totalLeads = paginatedLeads?.total || 0;
  const autoDmSocialLeadsMutation = useAutoDmSocialLeads();
  const autoDmEmailLeadsMutation = useAutoDmEmailLeads();
  // No longer need filteredLeads, leads is already filtered by API
  console.log('Active', activeTab);
  const handleMessageSelected = async () => {
    if (activeTab === "all") {
      toast({
        title: "Error",
        description: "Please select the Email or Social tab before messaging leads.",
        variant: "destructive",
      });
      return;
    }
    // Use randomLeads if active for this tab, otherwise use paginated leads
    let sourceLeads: any[] = leads;
    if (randomLeads && randomLeadsTab === activeTab) {
      sourceLeads = randomLeads;
    } else {
      sourceLeads = leads.filter(lead => lead.type === activeTab);
    }
    const selectedLeads = sourceLeads.filter(lead => selectedIds.has(lead.id));
    if (selectedLeads.length === 0) {
      console.log('No leads selected to message');
      toast({
        title: "Error",
        description: "No leads selected to message.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Messaging leads...",
      description: `Sending messages to ${selectedLeads.length} lead${selectedLeads.length === 1 ? '' : 's'}`,
    });
    try {
      if (activeTab === 'social') {
        await autoDmSocialLeadsMutation.mutateAsync(selectedLeads.map(lead => lead.id));
      } else if (activeTab === 'email') {
        await autoDmEmailLeadsMutation.mutateAsync(selectedLeads.map(lead => lead.id));
      }
      toast({
        title: "Messages sent!",
        description: `Successfully sent messages to ${selectedLeads.length} lead${selectedLeads.length === 1 ? '' : 's'}`,
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
            <div className="flex items-center gap-4">
              <span className="font-medium text-foreground">{totalLeads}</span> <span className="text-sm text-muted-foreground">total leads</span>
              <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
                <DialogTrigger asChild>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition" onClick={() => setOpenCreateModal(true)}>
                    + Create New Lead
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Lead</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to add a new lead.
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    setFormError(null);
                    setFormLoading(true);
                    try {
                      if (newLeadType === 'email') {
                        await createEmailLead.mutateAsync({
                          email: form.email,
                          name: form.name,
                          template_used: form.template_used,
                          notes: form.notes,
                          track_title: form.track_title,
                          genre: form.genre,
                        });
                      } else {
                        await createSocialLead.mutateAsync({
                          name: form.name,
                          facebook_handle: form.facebook_handle,
                          instagram_handle: form.instagram_handle,
                          spotify_handle: form.spotify_handle,
                          template_used: form.template_used,
                          notes: form.notes,
                        });
                      }
                      setOpenCreateModal(false);
                      setForm({ email: '', name: '', template_used: '', notes: '', track_title: '', genre: '', facebook_handle: '', instagram_handle: '', spotify_handle: '' });
                    } catch (err: any) {
                      setFormError(err?.message || 'Failed to create lead');
                    } finally {
                      setFormLoading(false);
                    }
                  }}>
                    {formError && <div className="text-destructive text-sm">{formError}</div>}
                    <div>
                      <Label htmlFor="lead-type">Lead Type</Label>
                      <Select value={newLeadType} onValueChange={handleLeadTypeChange}>
                        <SelectTrigger id="lead-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newLeadType === 'email' ? (
                      <>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" value={form.email} onChange={handleFormChange} required />
                        </div>
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" name="name" value={form.name} onChange={handleFormChange} />
                        </div>
                        <div>
                          <Label htmlFor="track_title">Track Title</Label>
                          <Input id="track_title" name="track_title" value={form.track_title} onChange={handleFormChange} />
                        </div>
                        <div>
                          <Label htmlFor="genre">Genre</Label>
                          <Input id="genre" name="genre" value={form.genre} onChange={handleFormChange} />
                        </div>
                        <div>
                          <Label htmlFor="template_used">Template Used</Label>
                          <Input id="template_used" name="template_used" value={form.template_used} onChange={handleFormChange} />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Input id="notes" name="notes" value={form.notes} onChange={handleFormChange} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" name="name" value={form.name} onChange={handleFormChange} required />
                        </div>
                        <div>
                          <Label htmlFor="facebook_handle">Facebook Handle</Label>
                          <Input id="facebook_handle" name="facebook_handle" value={form.facebook_handle} onChange={handleFormChange} />
                        </div>
                        <div>
                          <Label htmlFor="instagram_handle">Instagram Handle</Label>
                          <Input id="instagram_handle" name="instagram_handle" value={form.instagram_handle} onChange={handleFormChange} />
                        </div>
                        <div>
                          <Label htmlFor="spotify_handle">Spotify Handle</Label>
                          <Input id="spotify_handle" name="spotify_handle" value={form.spotify_handle} onChange={handleFormChange} />
                        </div>
                        <div>
                          <Label htmlFor="template_used">Template Used</Label>
                          <Input id="template_used" name="template_used" value={form.template_used} onChange={handleFormChange} />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Input id="notes" name="notes" value={form.notes} onChange={handleFormChange} />
                        </div>
                      </>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={formLoading || createEmailLead.status === 'pending' || createSocialLead.status === 'pending'}>
                        {formLoading || createEmailLead.status === 'pending' || createSocialLead.status === 'pending' ? 'Saving...' : 'Save Lead'}
                      </Button>
                    </div>
                  </form>
                  <DialogClose asChild>
                    <button className="mt-4 px-4 py-2 bg-muted rounded hover:bg-muted/80 transition">Cancel</button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="ml-2"
                onClick={() => {
                  localStorage.removeItem('jwt');
                  window.location.reload();
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeadType | "all")} className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-4 mb-6">
            <TabsTrigger value="all" className="gap-2">
              <Mail className="h-4 w-4" /> / <Share2 className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Mail className="h-4 w-4" />
              AWS SES Analytics
            </TabsTrigger>
          </TabsList>
          <LeadsStats />
          {/* Search, Sort, Filter, and Pagination Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-64"
              />
              <select
                value={sort}
                onChange={e => {
                  setSort(e.target.value as 'asc' | 'desc');
                  setPage(0);
                }}
                className="border rounded px-2 py-1"
                style={{ minWidth: 90 }}
              >
                <option value="asc">Sort: Asc</option>
                <option value="desc">Sort: Desc</option>
              </select>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={onlyUnmessaged}
                  onChange={e => {
                    setOnlyUnmessaged(e.target.checked);
                    setPage(0);
                  }}
                  className="accent-primary"
                />
                Only Unmessaged
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="border rounded px-2 py-1"
              >
                {[5, 10, 20, 50].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <LeadActions
            selectedCount={selectedIds.size}
            onMessageSelected={handleMessageSelected}
            onClearSelection={() => setSelectedIds(new Set())}
            onDeleteSelected={handleDeleteSelected}
            deleteLoading={deleteLeadMutation.status === 'pending'}
            onUpdateSelected={handleOpenUpdateModal}
            updateLoading={updateLoading}
          />
          <div className="flex items-center gap-2 mt-4 mb-4">
            <Input
              type="number"
              min={1}
              max={300}
              value={selectedRandomCount}
              onChange={e => setSelectedRandomCount(
                Math.max(1, Math.min(Number(e.target.value), 300))
              )}
              style={{ width: 80 }}
              placeholder="Amount"
            />
            <Button
              variant="outline"
              onClick={async () => {
                if (activeTab === 'all') {
                  toast({
                    title: 'Error',
                    description: 'Please select either the Email or Social tab to use random selection.',
                    variant: 'destructive',
                  });
                  return;
                }
                const token = localStorage.getItem('jwt');
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                const allUnmessaged = await fetchAllUnmessagedLeads([
                  "all",
                  "email",
                  "social"
                ].includes(activeTab) ? (activeTab as "all" | "email" | "social") : "all", token, apiBaseUrl, debouncedSearch);
                let filtered = allUnmessaged;
                if (activeTab === 'social') {
                  filtered = filtered.filter(l => l.instagram_handle && l.spotify_handle);
                }
                else {
                  console.log('No extra filtering for email leads');
                  filtered = filtered;
                }
                console.log('Filtered unmessaged leads:', filtered);
                if (filtered.length === 0) return;
                const count = Math.max(1, Math.min(selectedRandomCount, Math.min(300, filtered.length)));
                const selectedLeads = filtered
                  .sort(() => Math.random() - 0.5)
                  .slice(0, count);
                console.log('Active tab:', activeTab);
                console.log('Selected random leads:', selectedLeads);
                setRandomLeads(selectedLeads);
                setRandomLeadsTab(activeTab === 'email' ? 'email' : 'social');
                setSelectedIds(new Set(selectedLeads.map(l => l.id)) as Set<string>);
              }}
            >
              Select Random Unmessaged
            </Button>
            {randomLeads && (
              <Button
                variant="ghost"
                onClick={() => { setRandomLeads(null); setRandomLeadsTab(null); }}
              >
                Show All
              </Button>
            )}
          </div>
          {/* Update Lead Modal */}
          <Dialog open={openUpdateModal} onOpenChange={setOpenUpdateModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Lead</DialogTitle>
                <DialogDescription>
                  Edit the details below and save to update the lead.
                </DialogDescription>
              </DialogHeader>
              {updateForm && (
                <form className="space-y-4" onSubmit={handleUpdateLead}>
                  {updateForm.type === 'email' ? (
                    <>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" value={updateForm.email} onChange={handleUpdateFormChange} required />
                      </div>
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={updateForm.name || ''} onChange={handleUpdateFormChange} />
                      </div>
                      <div>
                        <Label htmlFor="track_title">Track Title</Label>
                        <Input id="track_title" name="track_title" value={updateForm.track_title || ''} onChange={handleUpdateFormChange} />
                      </div>
                      <div>
                        <Label htmlFor="genre">Genre</Label>
                        <Input id="genre" name="genre" value={updateForm.genre || ''} onChange={handleUpdateFormChange} />
                      </div>
                      <div>
                        <Label htmlFor="template_used">Template Used</Label>
                        <Input id="template_used" name="template_used" value={updateForm.template_used || ''} onChange={handleUpdateFormChange} />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input id="notes" name="notes" value={updateForm.notes || ''} onChange={handleUpdateFormChange} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={updateForm.name || ''} onChange={handleUpdateFormChange} required />
                      </div>
                      <div>
                        <Label htmlFor="facebook_handle">Facebook Handle</Label>
                        <Input id="facebook_handle" name="facebook_handle" value={updateForm.facebook_handle || ''} onChange={handleUpdateFormChange} />
                      </div>
                      <div>
                        <Label htmlFor="instagram_handle">Instagram Handle</Label>
                        <Input id="instagram_handle" name="instagram_handle" value={updateForm.instagram_handle || ''} onChange={handleUpdateFormChange} />
                      </div>
                      <div>
                        <Label htmlFor="spotify_handle">Spotify Handle</Label>
                        <Input id="spotify_handle" name="spotify_handle" value={updateForm.spotify_handle || ''} onChange={handleUpdateFormChange} />
                      </div>
                      <div>
                        <Label htmlFor="template_used">Template Used</Label>
                        <Input id="template_used" name="template_used" value={updateForm.template_used || ''} onChange={handleUpdateFormChange} />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input id="notes" name="notes" value={updateForm.notes || ''} onChange={handleUpdateFormChange} />
                      </div>
                    </>
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={updateLoading}>
                      {updateLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <TabsContent value="all" className="mt-0">
            <LeadsTable
              leads={leads}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={totalLeads}
              onPageChange={setPage}
            />
          </TabsContent>
          <TabsContent value="email" className="mt-0">
            <LeadsTable
              leads={activeTab === 'email' && randomLeadsTab === 'email' && randomLeads ? randomLeads : leads}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
            {(!randomLeads || randomLeadsTab !== 'email') && (
              <PaginationControls
                page={page}
                pageSize={pageSize}
                total={totalLeads}
                onPageChange={setPage}
              />
            )}
          </TabsContent>
          <TabsContent value="social" className="mt-0">
            <LeadsTable
              leads={activeTab === 'social' && randomLeadsTab === 'social' && randomLeads ? randomLeads : leads}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
            {(!randomLeads || randomLeadsTab !== 'social') && (
              <PaginationControls
                page={page}
                pageSize={pageSize}
                total={totalLeads}
                onPageChange={setPage}
              />
            )}
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <EmailAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
