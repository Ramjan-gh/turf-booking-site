import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Zap,
  Check,
  Clock,
  Tag,
  PartyPopper,
  ChevronDown,
} from "lucide-react";






const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";



export function Banner(){
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerError, setBannerError] = useState(false);
  const [banners, setBanners] = useState<{ file_url: string }[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  // fetch banner
  const fetchBanners = async () => {
    setBannerLoading(true);
    setBannerError(false);
    try {
      console.log(import.meta.env.VITE_SUPABASE_URL);
      const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_banners`, {
        method: "GET",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            import.meta.env.VITE_SUPABASE_ANON_KEY || ""
          }`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      setBanners(data);
      setBannerLoading(false);
    } catch (err) {
      console.error(err);
      setBannerError(true);
      setBannerLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBanners();
  }, []);

  // Retry every 1 min
  useEffect(() => {
    const retryInterval = setInterval(() => {
      fetchBanners();
    }, 60_000);

    return () => clearInterval(retryInterval);
  }, []);

  // Auto-slide if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl shadow-2xl"
    >
      <div className="relative w-full h-[250px] rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
        {bannerLoading ? (
          <div className="w-full h-full bg-gray-300 animate-pulse" />
        ) : bannerError || banners.length === 0 ? (
          <div className="w-full h-full bg-red-300" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.img
              key={banners[currentBanner].file_url}
              src={banners[currentBanner].file_url}
              className="absolute inset-0 w-full h-full object-cover object-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onError={() => setBannerError(true)}
            />
          </AnimatePresence>
        )}
      </div>
      {/* <div className="absolute inset-0 z-10 bg-gradient-to-br from-green-600/70 via-green-500/60 to-emerald-600/70"></div> */}

      {/* Glow Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-10"></div>

      {/* 🔥 Content always on top */}
      <div className="absolute top-0 left-0 md:top-8 md:left-10 z-20 p-16 text-white">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-2 font-bold text-4xl"
        >
          Book Your <span className="text-[#fbff00]">T</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="text-green-50 flex items-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Select a sport, date, and time slot to get started
        </motion.p>
      </div>
    </motion.div>
  );
}
