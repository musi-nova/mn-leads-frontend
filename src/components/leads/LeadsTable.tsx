import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lead, LeadType } from "@/types/lead";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { Mail, Twitter, Instagram, Linkedin, Facebook } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeadsTableProps {
  leads: Lead[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  const icons = {
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
  };
  const Icon = icons[platform as keyof typeof icons] || Mail;
  return <Icon className="h-4 w-4" />;
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
            <TableHead>Contact</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Contact</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                    aria-label={`Select ${lead.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {lead.type === 'email' ? (
                      <>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{lead.email}</span>
                      </>
                    ) : (
                      <>
                        <PlatformIcon platform={lead.platform} />
                        <span className="text-sm">@{lead.handle}</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">{lead.type}</span>
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.lastContact ? formatDistanceToNow(new Date(lead.lastContact), { addSuffix: true }) : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
