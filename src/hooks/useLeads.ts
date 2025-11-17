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

  if (response.status === 401) {
    // Remove token and redirect to login
    localStorage.removeItem('jwt');
    window.location.href = '/login';
    // Return a never-resolving promise to prevent further code execution
    return new Promise(() => {});
  }

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

export type PaginatedLeadsResult = {
  items: Lead[];
  total: number;
  limit: number;
  offset: number;
};

export const useLeads = ({
  type = "all",
  query = "",
  limit = 10,
  offset = 0,
}: {
  type?: "all" | "email" | "social";
  query?: string;
  limit?: number;
  offset?: number;
} = {}) => {
  return useQuery({
    queryKey: ["leads", type, query, limit, offset],
    queryFn: async () => {
      // Helper to fetch and normalize
      const fetchLeads = async (endpoint: string, leadType: "email" | "social") => {
        const params = new URLSearchParams();
        if (query) params.append("query", query);
        params.append("limit", String(limit));
        params.append("offset", String(offset));
        const res = await fetchWithAuth(`${API_BASE_URL}/leads/${endpoint}?${params.toString()}`);
        return {
          ...res,
          items: res.items.map((lead: any) => ({ ...lead, type: leadType })),
        };
      };

      if (type === "email") {
        return fetchLeads("email", "email");
      } else if (type === "social") {
        return fetchLeads("social", "social");
      } else {
        // Fetch both and merge
        const [email, social] = await Promise.all([
          fetchLeads("email", "email"),
          fetchLeads("social", "social"),
        ]);
        return {
          items: [...email.items, ...social.items],
          total: email.total + social.total,
          limit,
          offset,
        };
      }
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


export const useAutoDmSocialLeads = () => {
  return useMutation({
    mutationFn: async (leadIds: string[]) => {
      return fetchWithAuth(`${API_BASE_URL}/leads/social/auto-dm`, {
        method: "POST",
        body: JSON.stringify(leadIds),
      });
    },
  });
};

export const useAutoDmEmailLeads = () => {
  return useMutation({
    mutationFn: async (leadIds: string[]) => {
      return fetchWithAuth(`${API_BASE_URL}/leads/email/auto-dm`, {
        method: "POST",
        body: JSON.stringify(leadIds),
      });
    },
  });
};