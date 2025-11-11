export type LeadType = 'email' | 'social';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'unresponsive';

export interface EmailLead {
  id: string;
  type: 'email';
  email: string;
  name: string;
  company?: string;
  status: LeadStatus;
  lastContact?: string;
  createdAt: string;
}

export interface SocialLead {
  id: string;
  type: 'social';
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook';
  handle: string;
  name: string;
  followers?: number;
  status: LeadStatus;
  lastContact?: string;
  createdAt: string;
}

export type Lead = EmailLead | SocialLead;
