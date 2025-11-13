
export interface EmailLead {
  id: string;
  type: 'email';
  email: string;
  name?: string;
  template_used?: string;
  notes?: string;
  track_title?: string;
  genre?: string;
  date_sent?: string;
  created_at: string;
  updated_at?: string;
}

export interface SocialLead {
  id: string;
  type: 'social';
  name: string;
  facebook_handle?: string;
  instagram_handle?: string;
  spotify_handle?: string;
  template_used?: string;
  notes?: string;
  date_sent?: string;
  created_at: string;
  updated_at?: string;
}

export type Lead = EmailLead | SocialLead;
