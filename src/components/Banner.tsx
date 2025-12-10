import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

export function Banner() {
  const [banners, setBanners] = useState<{ file_url: string }[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch banners from API
  const fetchBanners = async () => {
    setLoading(true);
    setError(false);
    try {
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
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-slide every 5s if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full h-[250px] md:h-[300px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl">
      {/* Loading or error fallback */}
      {loading ? (
        <div className="w-full h-full bg-gray-200" /> // solid gray instead of shimmer
      ) : error || banners.length === 0 ? (
        <div className="w-full h-full bg-red-300 flex items-center justify-center text-white font-bold">
          Failed to load banners
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.img
            key={banners[currentBanner].file_url}
            src={banners[currentBanner].file_url}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            onError={() => setError(true)}
          />
        </AnimatePresence>
      )}

      {/* Overlay content */}
      <div className="absolute top-0 left-0 z-10 p-6 md:p-12 text-white">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-4xl font-bold mb-2"
        >
          Book Your <span className="text-yellow-400">T</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-sm md:text-lg"
        >
          <Zap className="w-5 h-5" />
          Select a sport, date, and time slot to get started
        </motion.p>
      </div>

      {/* Left/Right Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/30 p-2 rounded-full text-white z-20 hover:bg-black/50 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/30 p-2 rounded-full text-white z-20 hover:bg-black/50 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                className={`w-2 h-2 rounded-full cursor-pointer ${
                  idx === currentBanner ? "bg-white" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
