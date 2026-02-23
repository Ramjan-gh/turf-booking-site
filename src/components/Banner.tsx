import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

// Memory cache (so it fetches only once)
let bannerCache: { file_url: string }[] | null = null;

export function Banner() {
  const [banners, setBanners] = useState<{ file_url: string }[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [direction, setDirection] = useState(0);
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
    setDirection(1);
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const slidePrev = () => {
    setDirection(-1);
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX.current) return;

    const diff = e.changedTouches[0].clientX - startX.current;

    if (diff > 50) slidePrev();
    if (diff < -50) slideNext();

    startX.current = null;
  };

  // Motion variants for left/right swipe animation
  const swipeVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
    }),
    center: {
      x: "0%",
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
    }),
  };

  return (
    <div
      className="relative w-full h-[250px] md:h-[500px] lg:h-[500px] overflow-hidden"
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
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/40 z-[1]" />

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

      {/* Centered overlay text using flexbox */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <motion.h1
          className="text-4xl md:text-7xl lg:text-9xl font-black leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {["Welcome", "to"].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.2,
                  ease: [0.6, 0.05, 0.01, 0.9],
                }}
                className="text-white inline-block"
                
              >
                {word}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.6, 0.05, 0.01, 0.9],
            }}
            className="text-yellow-400 mt-2"
            
          >
            TurfBook
          </motion.div>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex items-center gap-2 text-sm md:text-lg lg:text-xl mt-6 text-white font-semibold"
        >
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
          </motion.div>
          Select a sport, date & time slot
        </motion.p>
      </div>

      {/* Navigation Arrows - Centered vertically with flexbox */}
      {banners.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-4 md:left-6 z-20 flex items-center">
            <button
              onClick={slidePrev}
              className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-all shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
            </button>
          </div>

          <div className="absolute inset-y-0 right-4 md:right-6 z-20 flex items-center">
            <button
              onClick={slideNext}
              className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-all shadow-lg"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
            </button>
          </div>

          {/* Pagination dots - Centered horizontally with flexbox */}
          <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center">
            <div className="flex gap-2.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentBanner ? 1 : -1);
                    setCurrentBanner(i);
                  }}
                  className={`transition-all ${
                    i === currentBanner
                      ? "w-8 h-3 bg-white rounded-full"
                      : "w-3 h-3 bg-white/50 rounded-full hover:bg-white/70"
                  }`}
                  aria-label={`Go to banner ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
