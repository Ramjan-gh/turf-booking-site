import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

// Memory cache (so it fetches only once)
let bannerCache: { file_url: string }[] | null = null;

export function Banner() {
  const [banners, setBanners] = useState<{ file_url: string }[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [direction, setDirection] = useState(0); // <-- controls slide direction
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Touch swipe refs
  const startX = useRef<number | null>(null);

  // Fetch banners with in-memory cache
  const fetchBanners = async () => {
    if (bannerCache) {
      setBanners(bannerCache);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_banners`, {
        method: "GET",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            import.meta.env.VITE_SUPABASE_ANON_KEY || ""
          }`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch banners");

      const data = await res.json();
      bannerCache = data;

      setBanners(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      slideNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // Handlers
  const slideNext = () => {
    setDirection(1); // left → right
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const slidePrev = () => {
    setDirection(-1); // right → left
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX.current) return;

    const diff = e.changedTouches[0].clientX - startX.current;

    if (diff > 50) slidePrev(); // swipe right → previous
    if (diff < -50) slideNext(); // swipe left → next

    startX.current = null;
  };

  // Motion variants for left/right swipe animation
  const swipeVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%", // fully slide from right or left
    }),
    center: {
      x: "0%", // perfect center
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%", // fully slide out
    }),
  };



  return (
    <div
      className="relative w-full h-[250px] md:h-[300px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading / error */}
      {loading ? (
        <div className="w-full h-full bg-gray-200" />
      ) : error || banners.length === 0 ? (
        <div className="w-full h-full bg-red-400 text-white flex items-center justify-center font-bold">
          Failed to load banners
        </div>
      ) : (
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={banners[currentBanner].file_url}
              src={banners[currentBanner].file_url}
              className="absolute top-0 left-0 w-full h-full object-cover"
              custom={direction}
              variants={swipeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.35, ease: "easeInOut" },
              }}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Overlay text */}
      <div className="absolute top-6 left-6 z-10 p-6 md:p-12 text-white">
        <h1 className="text-2xl md:text-4xl font-bold">
          Book Your <span className="text-yellow-400">T</span>
        </h1>
        <p className="flex items-center gap-2 text-sm md:text-lg mt-2">
          <Zap className="w-5 h-5" /> Select a sport, date & time slot
        </p>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={slidePrev}
            className="hidden md:block absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white z-20 hover:bg-black/60 transition"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <button
            onClick={slideNext}
            className="hidden md:block absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white z-20 hover:bg-black/60 transition"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Pagination dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  setDirection(i > currentBanner ? 1 : -1);
                  setCurrentBanner(i);
                }}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer ${
                  i === currentBanner ? "bg-white" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
