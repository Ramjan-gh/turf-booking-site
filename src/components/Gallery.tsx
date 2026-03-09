import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { X, Maximize2, ChevronLeft, ChevronRight, Fullscreen } from "lucide-react";
import { Ticket } from "lucide-react";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

function ImageSkeleton() {
  return (
    <div className="relative aspect-square rounded-md overflow-hidden bg-neutral-200">
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-shimmer bg-[length:200%_100%]" />
    </div>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export function Gallery() {
  const [images, setImages] = useState<{ file_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_gallery_medias`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
          },
          body: JSON.stringify({ p_limit: 100, p_offset: 0 }),
        });
        const data: { file_url: string; media_type: string }[] =
          await res.json();
        if (!res.ok) throw new Error("Failed to load gallery");
        if (isMounted) {
          setImages(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching gallery:", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    setDirection(1);
    setSelectedIndex((prev) => (prev! + 1) % images.length);
  }, [selectedIndex, images.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setDirection(-1);
    setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length);
  }, [selectedIndex, images.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, goNext, goPrev]);

  const selectedImage =
    selectedIndex !== null ? images[selectedIndex]?.file_url : null;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer { animation: shimmer 1.6s ease-in-out infinite; }
      `}</style>

      <section
        className="mx-auto px-32 py-16 md:py-24"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-8 text-center md:text-left">
            <div className="flex items-center gap-2 pb-4">
              <Ticket className="w-3 h-3 text-green-700" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Reservation Portal
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-green-900">
              Our Turfs
            </h2>
            <p className="text-lg text-slate-500 max-w-lg pt-4">
              Explore our premium facilities and playing grounds.
            </p>
          </div>
        </motion.div>

        {/* Uniform 3-column square grid */}
        <div className="flex flex-wrap gap-3">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <ImageSkeleton key={i} />)
            : images.map((img, index) => (
                <motion.div
                  key={index}
                  onClick={() => {
                    setDirection(1);
                    setSelectedIndex(index);
                  }}
                  className="relative w-72 cursor-pointer overflow-hidden rounded-md group bg-neutral-100"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={img.file_url}
                    alt="Turf Gallery"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white w-6 h-6" />
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
              onClick={() => setSelectedIndex(null)}
            >
              <button
                className="absolute top-8 right-8 text-white hover:text-green-400 transition-colors z-20"
                onClick={() => setSelectedIndex(null)}
              >
                <X size={36} />
              </button>

              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-widest z-20">
                {selectedIndex + 1} / {images.length}
              </div>

              <button
                className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors z-20 p-2 rounded-full hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
              >
                <ChevronLeft size={48} />
              </button>

              <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden px-20 md:px-28"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.img
                    key={selectedIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    src={selectedImage}
                    alt="Gallery image"
                    className="absolute max-w-full object-contain shadow-2xl"
                    style={{ maxHeight: "calc(100vh - 120px)" }}
                  />
                </AnimatePresence>
              </div>

              <button
                className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors z-20 p-2 rounded-full hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
              >
                <ChevronRight size={48} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
