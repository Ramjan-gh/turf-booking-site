"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Masonry from "react-masonry-css";
import { X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import Footer from "./Footer";

type Media = {
  media_type: string;
  file_url: string;
  category?: string; // optional
  title?: string; // optional
};

export function Gallery() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);

  const baseUrl = "https://himsgwtkvewhxvmjapqa.supabase.co"; // replace with your Supabase REST URL

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch(`${baseUrl}/rest/v1/rpc/get_gallery_medias`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_ANON_KEY || ""
            }`,
          },
          body: JSON.stringify({ p_limit: 50, p_offset: 0 }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Supabase RPC failed:", res.status, text);
          return;
        }

        const data = await res.json();
        console.log("Gallery data:", data);

        // Filter only images
        setMedias(data.filter((m: Media) => m.media_type === "image"));
      } catch (err) {
        console.error("Failed to fetch media:", err);
      }
    }

    fetchMedia();
  }, []);

  // Masonry responsive breakpoints
  const breakpointColumnsObj = {
    default: 4,
    1280: 3,
    768: 2,
    480: 1,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl text-center"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-3xl md:text-5xl font-bold"
          >
            Our Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/90"
          >
            Explore our premium sports facilities and see where the magic
            happens
          </motion.p>
        </div>
      </motion.div>

      {/* Masonry Gallery */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto gap-4"
        columnClassName="bg-clip-padding"
      >
        {medias.map((media, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg group mb-4" // mb-4 fixes row gap
            onClick={() => setSelectedMedia(index)}
          >
            <ImageWithFallback
              src={media.file_url}
              alt={`Gallery image ${index}`}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay with optional category/title */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              {media.category && (
                <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white mb-2">
                  {media.category}
                </span>
              )}
              {media.title && (
                <h3 className="text-white font-semibold">{media.title}</h3>
              )}
            </div>
          </motion.div>
        ))}
      </Masonry>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedMedia !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-5xl w-full"
            >
              <ImageWithFallback
                src={medias[selectedMedia].file_url}
                alt={`Gallery image ${selectedMedia}`}
                className="w-full h-auto rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
