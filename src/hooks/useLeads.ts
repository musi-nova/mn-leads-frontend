import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lead, EmailLead, SocialLead } from "@/types/lead";

const API_BASE_URL = "https://api.musi-nova.com";

// TODO: Replace with your actual API key or auth token
const API_KEY = "your-api-key-here";

const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const [emailLeads, socialLeads] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/email-leads`),
        fetchWithAuth(`${API_BASE_URL}/social-leads`),
      ]);

      const allLeads: Lead[] = [
        ...emailLeads.map((lead: any) => ({ ...lead, type: "email" as const })),
        ...socialLeads.map((lead: any) => ({ ...lead, type: "social" as const })),
      ];

      return allLeads;
    },
  });
};

export const useCreateEmailLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<EmailLead, "id" | "type" | "created_at" | "updated_at">) => {
      return fetchWithAuth(`${API_BASE_URL}/email-leads`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useCreateSocialLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<SocialLead, "id" | "type" | "created_at" | "updated_at">) => {
      return fetchWithAuth(`${API_BASE_URL}/social-leads`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useUpdateEmailLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmailLead> }) => {
      return fetchWithAuth(`${API_BASE_URL}/email-leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useUpdateSocialLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SocialLead> }) => {
      return fetchWithAuth(`${API_BASE_URL}/social-leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "email" | "social" }) => {
      const endpoint = type === "email" ? "email-leads" : "social-leads";
      return fetchWithAuth(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};
