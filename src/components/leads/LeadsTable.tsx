import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lead } from "@/types/lead";
import { Mail, Facebook, Instagram, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeadsTableProps {
  leads: Lead[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const SocialHandles = ({ lead }: { lead: Extract<Lead, { type: 'social' }> }) => {
  const handles = [];
  if (lead.facebook_handle) handles.push({ icon: Facebook, handle: lead.facebook_handle, platform: 'Facebook' });
  if (lead.instagram_handle) handles.push({ icon: Instagram, handle: lead.instagram_handle, platform: 'Instagram' });
  if (lead.spotify_handle) handles.push({ icon: Music, handle: lead.spotify_handle, platform: 'Spotify' });
  
  if (handles.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
  
  return (
    <div className="flex flex-col gap-1">
      {handles.map(({ icon: Icon, handle, platform }) => (
        <div key={platform} className="flex items-center gap-2">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">@{handle}</span>
        </div>
      ))}
    </div>
  );
};

export const LeadsTable = ({ leads, selectedIds, onSelectionChange }: LeadsTableProps) => {
  const allSelected = leads.length > 0 && leads.every(lead => selectedIds.has(lead.id));
  const someSelected = leads.some(lead => selectedIds.has(lead.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(leads.map(lead => lead.id)));
    }
  };

  const toggleLead = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all"
                className={someSelected ? "opacity-70" : ""}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date Sent</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Template Used</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow 
                key={lead.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => toggleLead(lead.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(lead.id)}
                    onCheckedChange={() => toggleLead(lead.id)}
                    aria-label={`Select ${lead.type === 'email' ? (lead.name || lead.email) : lead.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {lead.type === 'email' ? (lead.name || '—') : lead.name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.date_sent ? formatDistanceToNow(new Date(lead.date_sent), { addSuffix: true }) : '—'}
                </TableCell>
                <TableCell>
                  {lead.type === 'email' ? (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.email}</span>
                    </div>
                  ) : (
                    <SocialHandles lead={lead} />
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.template_used || '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {lead.notes || '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.updated_at ? formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true }) : '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
