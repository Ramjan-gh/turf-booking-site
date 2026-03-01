import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

let bannerCache: { file_url: string }[] | null = null;
let isFetchingGlobal = false;

export function Banner() {
  const [banners, setBanners] = useState<{ file_url: string }[]>(
    bannerCache || [],
  );
  const [currentBanner, setCurrentBanner] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(!bannerCache);
  const [error, setError] = useState(false);
  const [orgName, setOrgName] = useState<string>("");

  const startX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isMounted.current) return;
      setDirection(1);
      setCurrentBanner((prev) => (prev + 1) % (bannerCache?.length || 1));
    }, 5000);
  }, []);

  useEffect(() => {
    isMounted.current = true;

    if (bannerCache) {
      setBanners(bannerCache);
      setLoading(false);
      startAutoSlide();
      return;
    }

    if (isFetchingGlobal) {
      const poll = setInterval(() => {
        if (bannerCache) {
          clearInterval(poll);
          if (!isMounted.current) return;
          setBanners(bannerCache);
          setLoading(false);
          startAutoSlide();
        }
      }, 100);
      return () => clearInterval(poll);
    }

    isFetchingGlobal = true;
    fetch(`${BASE_URL}/rest/v1/rpc/get_banners`, {
      method: "GET",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch banners");
        return res.json();
      })
      .then((data) => {
        bannerCache = data;
        // Preload all images once
        data.forEach((b: { file_url: string }) => {
          const img = new Image();
          img.src = b.file_url;
        });
        if (!isMounted.current) return;
        setBanners(data);
        setLoading(false);
        startAutoSlide();
      })
      .catch((err) => {
        console.error("Banner Fetch Error:", err);
        if (!isMounted.current) return;
        setError(true);
        setLoading(false);
      })
      .finally(() => {
        isFetchingGlobal = false;
      });

    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Add fetch in useEffect alongside banners
useEffect(() => {
  isMounted.current = true;

  // Fetch org name
  fetch(`${BASE_URL}/rest/v1/rpc/get_organization`, {
    method: "GET",
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data) && data[0]?.name) {
        setOrgName(data[0].name);
      }
    })
    .catch(console.error);
  });

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentBanner((prev) => (prev + 1) % (bannerCache?.length || 1));
    startAutoSlide();
  }, [startAutoSlide]);

  const slidePrev = useCallback(() => {
    setDirection(-1);
    setCurrentBanner(
      (prev) =>
        (prev - 1 + (bannerCache?.length || 1)) % (bannerCache?.length || 1),
    );
    startAutoSlide();
  }, [startAutoSlide]);

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

  const swipeVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: "0%", opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div
      className="relative w-full h-[250px] md:h-[500px] lg:h-[500px] overflow-hidden bg-gray-100"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {loading ? (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      ) : error && banners.length === 0 ? (
        <div className="w-full h-full bg-red-400 text-white flex items-center justify-center font-bold">
          Failed to load banners
        </div>
      ) : (
        <div className="relative w-full h-full overflow-hidden">
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.8) 100%)",
            }}
          />

          {/* Render ALL banners always — only animate visibility */}
          {banners.map((banner, i) => (
            <div
              key={banner.file_url}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: `url(${banner.file_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0,
                zIndex: 0,
              }}
            />
          ))}

          {/* Animated active banner on top */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentBanner}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: `url(${banners[currentBanner]?.file_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: 1,
              }}
              custom={direction}
              variants={swipeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.4, ease: "easeInOut" },
              }}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Overlay Text */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <motion.h1 className="text-4xl md:text-7xl lg:text-9xl font-black leading-tight">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {["Welcome", "to"].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="text-white inline-block"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-yellow-400 mt-2"
          >
            {orgName || "TurfBook"}
          </motion.div>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex items-center gap-2 text-sm md:text-lg lg:text-xl mt-6 text-white font-semibold"
        >
          <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
          Select a sport, date & time slot
        </motion.p>
      </div>

      {/* Navigation UI */}
      {banners.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-4 md:left-6 z-20 flex items-center">
            <button
              onClick={slidePrev}
              className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-all shadow-lg pointer-events-auto"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
            </button>
          </div>

          <div className="absolute inset-y-0 right-4 md:right-6 z-20 flex items-center">
            <button
              onClick={slideNext}
              className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-all shadow-lg pointer-events-auto"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center">
            <div className="flex gap-2.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentBanner ? 1 : -1);
                    setCurrentBanner(i);
                    startAutoSlide();
                  }}
                  className={`transition-all pointer-events-auto ${
                    i === currentBanner
                      ? "w-8 h-3 bg-white rounded-full"
                      : "w-3 h-3 bg-white/50 rounded-full"
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
