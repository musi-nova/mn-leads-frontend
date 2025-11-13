import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lead, EmailLead, SocialLead } from "@/types/lead";


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('jwt');
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  // Handle 204 No Content (delete success)
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const useLeadsStats = () => {
  return useQuery({
    queryKey: ["leads-stats"],
    queryFn: async () => {
      return fetchWithAuth(`${API_BASE_URL}/leads/stats`);
    },
  });
};

export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const [emailLeads, socialLeads] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/leads/email`),
        fetchWithAuth(`${API_BASE_URL}/leads/social`),
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
      return fetchWithAuth(`${API_BASE_URL}/leads/email`, {
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
      return fetchWithAuth(`${API_BASE_URL}/leads/social`, {
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
      return fetchWithAuth(`${API_BASE_URL}/leads/email/${id}`, {
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
      return fetchWithAuth(`${API_BASE_URL}/leads/social/${id}`, {
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
      const endpoint = type === "email" ? "leads/email" : "leads/social";
      return fetchWithAuth(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};
