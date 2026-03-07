import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Facebook,
  Instagram,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Footer from "./Footer";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

type OrgData = {
  id: number;
  name: string;
  description: string;
  address_text: string;
  address_google_maps_url: string;
  emails: string[];
  phone_numbers: string[];
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  whatsapp_url: string | null;
  logo_url: string;
};

export function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_organization`, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data && data.length > 0) setOrg(data[0]);
      } catch (err) {
        console.error("Failed to fetch org:", err);
      } finally {
        setOrgLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
      setName(""); setEmail(""); setPhone(""); setMessage("");
      setTimeout(() => setSubmitted(false), 4000);
    }, 1200);
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: org?.phone_numbers?.[0] ?? "Loading...",
      accent: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Mail,
      label: "Email",
      value: org?.emails?.[0] ?? "Loading...",
      accent: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: MapPin,
      label: "Address",
      value: org?.address_text ?? "Loading...",
      accent: "text-rose-500",
      bg: "bg-rose-50",
      link: org?.address_google_maps_url,
    },
    {
      icon: Clock,
      label: "Hours",
      value: "6 AM – 11 PM Daily",
      accent: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

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
                : org?.description ?? "Have a question? Send us a message."}
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
                item.link ? "cursor-pointer hover:shadow-md hover:border-slate-200" : ""
              }`}
              onClick={() => item.link && window.open(item.link, "_blank")}
            >
              <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>
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
                {item.link && (
                  <span className="flex items-center gap-1 mt-1 text-[10px] text-blue-500 font-bold">
                    Open Maps <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-slate-100 rounded-[32px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex justify-between items-center">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Message Us
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Usually replies within 1 hour
            </span>
          </div>

          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800">Message Sent!</h2>
                  <p className="text-slate-500 max-w-sm">
                    Thanks for reaching out. Our team will get back to you shortly.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Full Name *
                      </Label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="rounded-xl border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Email Address *
                    </Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Message *
                    </Label>
                    <Textarea
                      placeholder="How can we help you?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      className="rounded-xl border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all resize-none"
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-green-900 hover:bg-green-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-bold"
                    >
                      {loading ? (
                        <span className="animate-pulse">Sending...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Social Links + Urgent Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 space-y-3"
        >
          {/* Social Links */}
          {(org?.facebook_url || org?.instagram_url) && (
            <div className="flex items-center justify-center gap-3">
              {org.facebook_url && (
                
                 <a href={org.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-all"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
              )}
              {org.instagram_url && (
                
                 <a href={org.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-600 hover:bg-pink-50 hover:border-pink-100 hover:text-pink-600 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>
          )}

          {/* Urgent note */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-sm text-slate-500 text-center">
              <span className="font-bold text-slate-700">Urgent booking?</span>{" "}
              Call us directly at{" "}
              <span className="font-bold text-green-700">
                {org?.phone_numbers?.[0] ?? "+880 1234-567890"}
              </span>{" "}
              during business hours.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}