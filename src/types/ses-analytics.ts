export interface SesAnalyticsRaw {
  Timestamp: string;
  DeliveryAttempts: number;
  Bounces: number;
  Complaints: number;
  Rejects: number;
}

export interface SesAnalytics {
  total_deliveries: number;
  total_bounces: number;
  total_complaints: number;
  total_rejects: number;
  raw_data: SesAnalyticsRaw[];
}
