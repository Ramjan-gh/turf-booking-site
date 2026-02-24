"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Zap } from "lucide-react";
import ImageWithShimmer from "./ImageWithShimmer";
import { Sport } from "../data/sports";

type SportSelectorProps = {
  sports: Sport[];
  selectedSport: string | null;
  setSelectedSport: (id: string) => void;
};

// 1. Define Animation Variants
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

const SportSelector: React.FC<SportSelectorProps> = ({
  sports,
  selectedSport,
  setSelectedSport,
}) => {
  const text = "Want to book a sport?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-12"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Step Indicator & Typing Text Section */}
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Typing Heading */}
        <motion.h2
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-gray-500 w-full text-center text-2xl md:text-6xl font-bold tracking-tight my-12"
        >
          {text.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariants}>
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1 h-8 md:h-14 bg-yellow-500 ml-2 align-middle"
          />
        </motion.h2>
        <div className="w-full flex items-center gap-4 md:gap-8">
          {/* Shimmer Circle - Representing "Step 1" */}
          <div className="relative overflow-hidden bg-green-900 h-20 w-20 md:h-32 md:w-32 rounded-full flex justify-center items-center shadow-2xl border-4 border-green-700 flex-shrink-0">
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear",
                repeatDelay: 0.5,
              }}
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                width: "50%",
              }}
            />
            <p className="relative z-10 text-white text-3xl md:text-6xl font-black">
              1
            </p>
          </div>

          <motion.p
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-gray-900 text-xl md:text-4xl lg:text-5xl font-extrabold leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Select a sport
          </motion.p>
        </div>
      </div>

      {/* Sports Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10">
        {sports.map((sport, index) => (
          <div key={sport.id} className="relative">
            {" "}
            {/* 1. New Relative Wrapper */}
            <motion.button
              onClick={() => setSelectedSport(sport.id)}
              whileHover={{ scale: 1.02 }} // Slight scale up looks better with an external badge
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`group relative overflow-hidden w-full rounded-sm aspect-square transition-all shadow-xl ${
                selectedSport === sport.id
                  ? "ring-[12px] md:ring-[16px] rounded-xl"
                  : ""
              }`}
            >
              {/* Image & Overlay */}
              <div className="absolute inset-0 w-full h-full">
                <ImageWithShimmer
                  src={sport.image}
                  alt={sport.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Selection State Styles */}
              <AnimatePresence>
                {selectedSport === sport.id && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-green-900 mix-blend-overlay"
                    />
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 ring-inset ring-4 ring-green-900 shadow-[0_0_40px_rgba(34,197,94,0.6)]"
                    />
                  </>
                )}
              </AnimatePresence>

              <div className="absolute inset-0 flex flex-col justify-between border border-white/10 overflow-hidden">
                {/* TOP SECTION: Icon and Name */}
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-4 ">
                  <div className="relative flex-shrink-0">
                    <motion.img
                      src={sport.icon}
                      alt={sport.name}
                      animate={{ rotate: selectedSport === sport.id ? 360 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="w-10 h-10 object-contain drop-shadow-md rounded-lg bg-white/10 p-1.5"
                    />
                  </div>
                  <span className="text-white text-sm md:text-lg font-black uppercase italic tracking-tighter leading-none">
                    {sport.name}
                  </span>
                </div>

                {/* BOTTOM SECTION: Size and Capacity centered */}
                <div className="flex flex-col items-center justify-center text-center p-4 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.2em]">
                      {sport.size}
                    </span>
                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent self-center my-1" />
                    <span className="text-[9px] md:text-[10px] font-medium text-white/60 uppercase tracking-widest">
                      Capacity: {sport.player_capacity} Players
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
            {/* 2. Tick Badge moved OUTSIDE the overflow-hidden button */}
            {/* <AnimatePresence>
              {selectedSport === sport.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  // z-50 ensures it stays above the button and its ring
                  // -top-2 -right-2 makes it "pop" out of the corner
                  className="absolute -top-2 right-4 z-50 bg-yellow-500 p-1.5 rounded-full shadow-2xl border-2 border-green-900"
                >
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-900" />
                </motion.div>
              )}
            </AnimatePresence> */}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SportSelector;
