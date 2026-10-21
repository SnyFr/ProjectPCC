/**
 * REST API Endpoint Contracts based on Project Specification Section 5
 */
export const API_ROUTES = {
  auth: {
    register: "/v1/auth/register",
    login: "/v1/auth/login",
  },
  channels: {
    list: "/v1/channels",
    create: "/v1/channels",
  },
  contents: {
    list: (params?: { status?: string; channel_id?: string | number }) => {
      const search = new URLSearchParams();
      if (params?.status) search.set("status", params.status);
      if (params?.channel_id) search.set("channel_id", String(params.channel_id));
      const query = search.toString();
      return query ? `/v1/contents?${query}` : "/v1/contents";
    },
    create: "/v1/contents",
    detail: (id: string | number) => `/v1/contents/${id}`,
    update: (id: string | number) => `/v1/contents/${id}`,
    delete: (id: string | number) => `/v1/contents/${id}`,
    checklists: {
      create: (id: string | number) => `/v1/contents/${id}/checklists`,
    },
    metrics: {
      create: (id: string | number) => `/v1/contents/${id}/metrics`,
    },
  },
  checklists: {
    toggle: (id: string | number) => `/v1/checklists/${id}/toggle`,
    delete: (id: string | number) => `/v1/checklists/${id}`,
  },
} as const;
