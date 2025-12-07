"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import ImageWithShimmer from "./ImageWithShimmer";
import { Sport } from "../data/sports"; // import the type only

type SportSelectorProps = {
  sports: Sport[]; // array of sports passed as prop
  selectedSport: string | null; // current selected sport id
  setSelectedSport: (id: string) => void; // callback to change selection
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              selectedSport === sport.id ? "ring-4 ring-green-400" : ""
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <ImageWithShimmer
                src={sport.image}
                alt={sport.name}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-br ${sport.gradient} opacity-80`}
              ></div>
            </div>

            {/* Content */}
            <div className="relative py-6 text-white flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{ rotate: selectedSport === sport.id ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl mb-3 drop-shadow-lg"
              >
                <img src={sport.icon} alt="" />
              </motion.div>
              <div className="drop-shadow-md">{sport.name}</div>
            </div>

            {/* Selected Indicator */}
            <AnimatePresence>
              {selectedSport === sport.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-green-600" />
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
