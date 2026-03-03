import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Maximize2 } from "lucide-react";

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-neutral-800 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );

  return (
    <section className="py-12 px-4 md:px-24 max-w-screen-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-green-900">
          Our <span className="text-green-600">Turfs</span>
        </h2>
        <p className="text-gray-600 mt-2">
          Explore our premium facilities and playing grounds.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <motion.div
            key={index}
            layoutId={`img-${img.file_url}`}
            onClick={() => setSelectedImage(img.file_url)}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-xl group bg-neutral-100"
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
