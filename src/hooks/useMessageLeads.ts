import { useMutation } from "@tanstack/react-query";

const API_BASE_URL = "https://api.musi-nova.com";

// TODO: Replace with your actual API key or auth token
const API_KEY = "your-api-key-here";

interface MessageLeadsPayload {
  lead_ids: string[];
  message?: string;
}

export const useMessageLeads = () => {
  return useMutation({
    mutationFn: async (payload: MessageLeadsPayload) => {
      const response = await fetch(`${API_BASE_URL}/message-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to send messages: ${response.statusText}`);
      }

      return response.json();
    },
  });
};
