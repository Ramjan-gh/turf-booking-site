import { motion } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import Footer from "./Footer";
import { useOrg } from "../context/OrgContext";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
    </svg>
  );
}

export function ContactUs() {
  const { org, loading: orgLoading } = useOrg();

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: org?.phone_numbers?.[0] ?? "Loading...",
      accent: "text-blue-500",
      bg: "bg-blue-50",
      href: org?.phone_numbers?.[0] ? `tel:${org.phone_numbers[0]}` : undefined,
    },
    {
      icon: Mail,
      label: "Email",
      value: org?.emails?.[0] ?? "Loading...",
      accent: "text-purple-500",
      bg: "bg-purple-50",
      href: org?.emails?.[0] ? `mailto:${org.emails[0]}` : undefined,
    },
    {
      icon: MapPin,
      label: "Address",
      value: org?.address_text ?? "Loading...",
      accent: "text-rose-500",
      bg: "bg-rose-50",
      href: org?.address_google_maps_url ?? undefined,
      linkLabel: "Open Maps",
    },
    {
      icon: Clock,
      label: "Hours",
      value: "6 AM – 11 PM Daily",
      accent: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  type Channel = {
    label: string;
    sublabel: string;
    href: string;
    icon: React.ReactNode;
    bg: string;
    hover: string;
    shadow: string;
  };

  const messengerChannels: Channel[] = [
    org?.whatsapp_url || org?.phone_numbers?.[0]
      ? {
          label: "WhatsApp",
          sublabel: "Tap to chat instantly",
          href:
            org?.whatsapp_url ??
            `https://wa.me/${(org?.phone_numbers?.[0] ?? "").replace(/\D/g, "")}`,
          icon: <WhatsAppIcon className="w-6 h-6 text-white" />,
          bg: "bg-[#25D366]",
          hover: "hover:bg-[#20b858]",
          shadow: "shadow-[#25D366]/30",
        }
      : null,
    org?.facebook_url
      ? {
          label: "Messenger",
          sublabel: "Message on Facebook",
          href: `http://facebook.com/messages/t/832009026667330`,
          icon: <MessengerIcon className="w-6 h-6 text-white" />,
          bg: "bg-[#0084FF]",
          hover: "hover:bg-[#006fd6]",
          shadow: "shadow-[#0084FF]/30",
        }
      : null,
    org?.instagram_url
      ? {
          label: "Instagram",
          sublabel: "DM on Instagram",
          href: `https://ig.me/m/${org.instagram_url.split("/").filter(Boolean).pop()}`,
          icon: <Instagram className="w-6 h-6 text-white" />,
          bg: "bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]",
          hover: "hover:opacity-90",
          shadow: "shadow-pink-400/30",
        }
      : null,
    org?.tiktok_url
      ? {
          label: "TikTok",
          sublabel: "Message on TikTok",
          href: org.tiktok_url,
          icon: <TikTokIcon className="w-6 h-6 text-white" />,
          bg: "bg-black",
          hover: "hover:bg-neutral-800",
          shadow: "shadow-black/20",
        }
      : null,
    org?.emails?.[0]
      ? {
          label: "Email",
          sublabel: org.emails[0],
          href: `mailto:${org.emails[0]}`,
          icon: <Mail className="w-6 h-6 text-white" />,
          bg: "bg-slate-700",
          hover: "hover:bg-slate-600",
          shadow: "shadow-slate-400/20",
        }
      : null,
  ].filter(Boolean) as Channel[];

  return (
    <div
      className="min-h-screen bg-white text-slate-900"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <header className="space-y-4 mb-12 text-center md:text-left">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3 text-green-700" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Support Portal
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-green-900">
              Get in touch.
            </h1>
            <p className="text-lg text-slate-500 max-w-lg">
              {orgLoading
                ? "Loading..."
                : (org?.description ?? "Have a question? Reach us directly.")}
            </p>
          </header>
        </motion.div>

        {/* Contact Info Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12"
        >
          {contactInfo.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              className={`flex flex-col gap-2 p-4 rounded-2xl border border-slate-100 bg-slate-50 transition-all ${
                item.href
                  ? "cursor-pointer hover:shadow-md hover:border-slate-200"
                  : ""
              }`}
              onClick={() => item.href && window.open(item.href, "_blank")}
            >
              <div
                className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}
              >
                <item.icon className={`w-4 h-4 ${item.accent}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-slate-700 leading-tight line-clamp-2">
                  {orgLoading ? (
                    <span className="inline-block w-24 h-3 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    item.value
                  )}
                </p>
                {item.linkLabel && (
                  <span className="flex items-center gap-1 mt-1 text-[10px] text-blue-500 font-bold">
                    {item.linkLabel} <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Direct Messenger Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            Message us directly
          </p>

          {orgLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[72px] bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : messengerChannels.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No messaging channels configured.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {messengerChannels.map((channel, i) => (
                <motion.a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl ${channel.bg} ${channel.hover} text-white transition-all shadow-lg ${channel.shadow} group`}
                >
                  <div className="flex-shrink-0">{channel.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm leading-tight">
                      {channel.label}
                    </p>
                    <p className="text-xs opacity-70 truncate mt-0.5">
                      {channel.sublabel}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>

        {/* Urgent note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="p-5 rounded-2xl bg-green-50 border border-green-100">
            <p className="text-sm text-slate-500 text-center">
              <span className="font-bold text-slate-700">Urgent booking?</span>{" "}
              Call us directly at{" "}
              <a
                href={`tel:${org?.phone_numbers?.[0] ?? ""}`}
                className="font-bold text-green-700 hover:underline"
              >
                {org?.phone_numbers?.[0] ?? "+880 1234-567890"}
              </a>{" "}
              during business hours.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
