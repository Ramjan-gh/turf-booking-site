"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, TrendingUp } from "lucide-react";
import ImageWithShimmer from "./ImageWithShimmer";
import { Sport } from "../data/sports";

type SportSelectorProps = {
  sports: Sport[];
  selectedSport: string | null;
  setSelectedSport: (id: string) => void;
};

const SportSelector: React.FC<SportSelectorProps> = ({
  sports,
  selectedSport,
  setSelectedSport,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-green-900">Select Sport</h2>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {sports.map((sport, index) => (
          <motion.button
            key={sport.id}
            onClick={() => setSelectedSport(sport.id)}
            whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1, scale: { duration: 0.08 } }}
            className={`relative overflow-hidden rounded-2xl transition-all shadow-lg ${
              selectedSport === sport.id
                ? "ring-4 ring-green-400 scale-[1.03]"
                : ""
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <ImageWithShimmer
                src={sport.image}
                alt={sport.name}
                className="w-full h-full object-cover"
              />

              {/* Adaptive overlay */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "rgba(0,0,0,0.4)", // semi-transparent black overlay
                  mixBlendMode: "overlay",
                }}
              />
            </div>

            {/* Selected Overlay */}
            <AnimatePresence>
              {selectedSport === sport.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.85 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#F54927]/80 backdrop-blur-[1px] rounded-2xl"
                />
              )}
            </AnimatePresence>

            {/* Selected Pulse Glow */}
            {selectedSport === sport.id && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl ring-4 ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.9)]"
              />
            )}

            {/* Content */}
            <div className="relative md:py-6 text-white flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{ rotate: selectedSport === sport.id ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl mb-3 drop-shadow-lg"
              >
                <img src={sport.icon} alt="" className="w-16 h-16"/>
              </motion.div>
              <div className="drop-shadow-md md:text-2xl text-xs">{sport.name}</div>
            </div>

            {/* Selected Tick Badge */}
            <AnimatePresence>
              {selectedSport === sport.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-xl"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default SportSelector;
