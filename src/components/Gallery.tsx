import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Maximize2 } from "lucide-react";
import { Ticket } from "lucide-react";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

export function Gallery() {
  const [images, setImages] = useState<{ file_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

        console.log("Gallery fetch response:", res);

        const data: { file_url: string; media_type: string }[] =
          await res.json(); // read body once only
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

  if (loading)
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4" >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-neutral-800 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );

  return (
    <section
      className="max-w-3xl mx-auto px-6 py-16 md:py-24"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <motion.div
            key={index}
            layoutId={`img-${img.file_url}`}
            onClick={() => setSelectedImage(img.file_url)}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-sm group bg-neutral-100"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={img.file_url}
              alt="Turf Gallery"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="text-white w-8 h-8" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-8 right-8 text-white hover:text-green-400 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </button>
            <motion.img
              layoutId={`img-${selectedImage}`}
              src={selectedImage}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
