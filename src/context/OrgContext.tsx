import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

export type Organization = {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  emails: string[];
  phone_numbers: string[];
  address_text: string;
  address_google_maps_url: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  whatsapp_url?: string | null;
};

interface OrgContextValue {
  org: Organization | null;
  loading: boolean;
}

const OrgContext = createContext<OrgContextValue>({ org: null, loading: true });

export function OrgProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_organization`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setOrg(data[0]);
      } catch (err) {
        console.error("Failed to load org info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, []); // runs exactly once

  return (
    <OrgContext.Provider value={{ org, loading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}
