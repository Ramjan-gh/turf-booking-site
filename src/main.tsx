
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";

  fetch(
    "https://himsgwtkvewhxvmjapqa.supabase.co/rest/v1/rpc/get_organization",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    },
  )
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data) && data[0]?.logo_url) {
        const link =
          (document.querySelector("link[rel='icon']") as HTMLLinkElement) ||
          document.createElement("link");
        link.rel = "icon";
        link.href = data[0].logo_url;
        document.head.appendChild(link);

        if (data[0].name) document.title = data[0].name;
      }
    });

  createRoot(document.getElementById("root")!).render(<App />);
  