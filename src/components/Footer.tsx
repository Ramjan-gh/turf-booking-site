import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

// Updated type definition to match your new API response
type Organization = {
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

const Footer: React.FC = () => {
  const [org, setOrg] = useState<Organization | null>(null);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          body: JSON.stringify({}), // Body is now empty as requested
        });

        const data = await res.json();
        // The API returns an array, we take the first object
        if (data && data.length > 0) {
          setOrg(data[0]);
        }
      } catch (err) {
        console.error("Failed to load org info", err);
      }
    };

    fetchOrg();
  }, []);

  const footerStyle = {
    backgroundImage: `url("https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3")`,
  };

  const quickLinks = [
    { label: "Services", path: "/services" },
    { label: "Gallery", path: "/gallery" },
    { label: "Blog", path: "/blog" },
  ];

  return (
    <footer className="relative" aria-label="Site Footer">
      <div className="bg-cover bg-center bg-no-repeat" style={footerStyle}>
        <div className="absolute inset-0 bg-gray-900/90"></div>

        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* ORG INFO */}
              <div>
                <div className="flex items-center">
                  {org?.logo_url && (
                    <img
                      src={org.logo_url}
                      className="w-12 h-12 rounded-full object-cover"
                      alt={org.name}
                    />
                  )}
                  <h2 className="ml-3 text-2xl font-bold text-white">
                    {org?.name || "Loading..."}
                  </h2>
                </div>
                <p className="mt-4 max-w-xs text-gray-300">
                  {org?.description}
                </p>
              </div>

              {/* QUICK LINKS */}
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Quick Links
                  </h3>
                  <nav className="mt-4">
                    <ul className="space-y-2 text-sm">
                      {quickLinks.map((link) => (
                        <li key={link.label}>
                          <button
                            onClick={() => handleNavigate(link.path)}
                            className="text-gray-300 hover:text-white hover:underline"
                          >
                            {link.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* CONTACT INFO */}
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Contact Info
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    {org?.phone_numbers?.[0] && (
                      <li
                        className="flex items-center text-gray-300 cursor-pointer hover:text-white"
                        onClick={() =>
                          window.open(`tel:${org.phone_numbers[0]}`)
                        }
                      >
                        <FaPhone className="mr-3" />
                        <span>{org.phone_numbers[0]}</span>
                      </li>
                    )}

                    {org?.emails?.[0] && (
                      <li
                        className="flex items-center text-gray-300 cursor-pointer hover:text-white"
                        onClick={() => window.open(`mailto:${org.emails[0]}`)}
                      >
                        <FaEnvelope className="mr-3" />
                        <span>{org.emails[0]}</span>
                      </li>
                    )}

                    {org?.address_text && (
                      <li
                        className="flex items-start text-gray-300 cursor-pointer hover:text-white"
                        onClick={() =>
                          window.open(org.address_google_maps_url, "_blank")
                        }
                      >
                        <FaMapMarkerAlt className="mr-3 mt-1" />
                        <span>{org.address_text}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* SOCIAL LINKS */}
              <div>
                <h3 className="text-lg font-medium text-white">Follow Us</h3>
                <div className="mt-4 flex space-x-4">
                  {org?.facebook_url && (
                    <button
                      onClick={() => window.open(org.facebook_url!, "_blank")}
                      className="text-gray-300 hover:text-white p-2"
                    >
                      <FaFacebook className="h-6 w-6" />
                    </button>
                  )}

                  {org?.instagram_url && (
                    <button
                      onClick={() => window.open(org.instagram_url!, "_blank")}
                      className="text-gray-300 hover:text-white p-2"
                    >
                      <FaInstagram className="h-6 w-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              © {new Date().getFullYear()} {org?.name}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
