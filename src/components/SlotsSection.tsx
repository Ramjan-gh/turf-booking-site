"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import { Zap, CalendarOff, Clock } from "lucide-react";

interface TimeSlot {
  slot_id: string;
  field_id: string;
  start_time: string;
  end_time: string;
  type: string;
  status: "booked" | "available" | "held";
  price: number;
}

interface BusinessSchedule {
  id: string;
  date: string;
  is_open: boolean;
  notes: string;
  created_at: string;
}

interface SlotsSectionProps {
  selectedSlots: string[];
  setSelectedSlots: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSportData: { field_id: string } | null | undefined;
  selectedDate: Date;
  BASE_URL: string;
  setSlotsData?: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
}

// ─── Skeleton that matches real slot grid dimensions exactly ───────────────────
function SlotSkeleton() {
  return (
    <div className="space-y-4">
      {/* Simulate two shifts */}
      {[1, 2].map((shift) => (
        <div key={shift} className="space-y-2">
          {/* Shift label skeleton */}
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[80px] bg-gray-100 animate-pulse rounded-md"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SlotsSection({
  selectedSlots,
  setSelectedSlots,
  selectedSportData,
  selectedDate,
  BASE_URL,
  setSlotsData,
}: SlotsSectionProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [businessSchedule, setBusinessSchedule] = useState<BusinessSchedule[]>(
    [],
  );

  const holdTimersRef = useRef<Record<string, number>>({});
  const slotSessionIdsRef = useRef<Record<string, string>>({});

  // Reset selection when date changes
  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate, setSelectedSlots]);

  /* ================= FETCH BUSINESS SCHEDULE ================= */
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/rest/v1/rpc/get_business_schedule`,
          {
            method: "GET",
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (res.ok) setBusinessSchedule(await res.json());
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
      }
    };
    fetchSchedule();
  }, [BASE_URL]);

  /* ================= CHECK IF CURRENT DATE IS HOLIDAY ================= */
  const holidayInfo = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return businessSchedule.find(
      (item) => item.date === dateStr && !item.is_open,
    );
  }, [selectedDate, businessSchedule]);

  /* ================= FETCH SLOTS ================= */
  useEffect(() => {
    if (holidayInfo) {
      setAvailableSlots([]);
      setSlotsData?.([]);
      return;
    }
    if (!selectedSportData || !selectedDate || !BASE_URL) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_slots`, {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p_field_id: selectedSportData.field_id,
            p_booking_date: dateStr,
          }),
        });

        if (!res.ok) throw new Error("Failed");
        const apiData = await res.json();

        const mappedSlots: TimeSlot[] = apiData.flatMap(
          (shift: any) =>
            shift.slots?.map((slot: any) => ({
              slot_id: slot.slot_id,
              field_id: selectedSportData!.field_id,
              start_time: slot.start_time,
              end_time: slot.end_time,
              status: slot.status,
              price: Number(slot.price || 0),
              type: shift.shift_name,
            })) || [],
        );

        setAvailableSlots(mappedSlots);
        setSlotsData?.(mappedSlots);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch slots");
        setAvailableSlots([]);
        setSlotsData?.([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedSportData, BASE_URL, holidayInfo, setSlotsData]);

  /* ================= HOLD / RELEASE LOGIC ================= */
  const refreshSlots = async () => {
    if (!selectedSportData || !selectedDate) return;
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_slots`, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_field_id: selectedSportData.field_id,
          p_booking_date: dateStr,
        }),
      });
      const apiData = await res.json();
      const mappedSlots: TimeSlot[] = apiData.flatMap(
        (shift: any) =>
          shift.slots?.map((slot: any) => ({
            slot_id: slot.slot_id,
            field_id: selectedSportData!.field_id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: slot.status,
            price: Number(slot.price || 0),
            type: shift.shift_name,
          })) || [],
      );
      setAvailableSlots(mappedSlots);
      setSlotsData?.(mappedSlots);
    } catch (err) {
      console.error(err);
    }
  };

  const holdSlot = async (slot: TimeSlot) => {
    if (!selectedSportData) return;
    const displayTime = format(
      parse(slot.start_time, "HH:mm:ss", new Date()),
      "hh:mm a",
    );
    const sessionId = `session-${Math.random().toString(36).substr(2, 9)}`;
    slotSessionIdsRef.current[slot.slot_id] = sessionId;

    try {
      const res = await fetch(`${BASE_URL}/rest/v1/rpc/hold_slot`, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_slot_id: slot.slot_id,
          p_booking_date: format(selectedDate, "yyyy-MM-dd"),
          p_session_id: sessionId,
          p_hold_duration_minutes: 10,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Slot ${displayTime} held`);
        refreshSlots();
        holdTimersRef.current[slot.slot_id] = window.setTimeout(
          () => releaseSlot(slot),
          10 * 60 * 1000,
        );
      } else {
        toast.error("Failed to hold slot");
      }
    } catch {
      toast.error("Error holding slot");
    }
  };

  const releaseSlot = async (slot: TimeSlot) => {
    const displayTime = format(
      parse(slot.start_time, "HH:mm:ss", new Date()),
      "hh:mm a",
    );
    try {
      const sessionId = slotSessionIdsRef.current[slot.slot_id];
      if (!sessionId) return;
      await fetch(`${BASE_URL}/rest/v1/rpc/release_a_slot`, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_session_id: sessionId,
          p_slot_id: slot.slot_id,
          p_booking_date: format(selectedDate, "yyyy-MM-dd"),
        }),
      });
      toast.info(`Slot ${displayTime} released`);
      refreshSlots();
      clearTimeout(holdTimersRef.current[slot.slot_id]);
      delete holdTimersRef.current[slot.slot_id];
      delete slotSessionIdsRef.current[slot.slot_id];
      setSelectedSlots((prev) => prev.filter((id) => id !== slot.slot_id));
    } catch {
      toast.error("Error releasing slot");
    }
  };

  const toggleSlot = (slot: TimeSlot) => {
    if (slot.status === "booked") return;
    if (slot.status === "held") {
      releaseSlot(slot);
      return;
    }
    holdSlot(slot);
    setSelectedSlots((prev) =>
      prev.includes(slot.slot_id)
        ? prev.filter((id) => id !== slot.slot_id)
        : [...prev, slot.slot_id],
    );
  };

  useEffect(() => {
    return () => {
      Object.values(holdTimersRef.current).forEach(clearTimeout);
      holdTimersRef.current = {};
      slotSessionIdsRef.current = {};
    };
  }, []);

  /* ================= PRICE CALCULATION ================= */
  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, slotId) => {
      const slot = availableSlots.find((s) => s.slot_id === slotId);
      return sum + (slot?.price || 0);
    }, 0);
  }, [selectedSlots, availableSlots]);

  /* ================= UI LOGIC ================= */
  const sortedSlots = [...availableSlots].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );
  const slotsByShift = sortedSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.type]) acc[slot.type] = [];
      acc[slot.type].push(slot);
      return acc;
    },
    {} as Record<string, TimeSlot[]>,
  );
  const shiftedSlots = Object.entries(slotsByShift).map(
    ([shift_name, slots]) => ({
      shift_name,
      slots,
    }),
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start w-full pl-4 md:pl-12 ">
      {/* ── LEFT: Slots ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 mt-12 lg:mt-0 md:min-w-[459px]"
      >
        {/* Header — fixed height so it never shifts */}
        <h2 className="flex items-center gap-2 text-green-900 font-semibold h-7">
          <Zap className="w-5 h-5 text-green-600 shrink-0" />
          Available Slots
        </h2>

        {/*
          KEY FIX: min-h keeps this block from collapsing to 0 between states.
          Adjust the value to roughly match the height of your real slot grid.
        */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {slotsLoading ? (
              // Skeleton — same grid structure as the real slots
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SlotSkeleton />
              </motion.div>
            ) : holidayInfo ? (
              <motion.div
                key="holiday"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-red-200 bg-red-50 text-center"
              >
                <div className="w-16 h-16 bg-red-100 flex items-center justify-center mb-4">
                  <CalendarOff className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-1">
                  Business Holiday
                </h3>
                <p className="text-red-700 italic">
                  {holidayInfo.notes
                    ? `"${holidayInfo.notes}"`
                    : "We are closed today. Please pick another date!"}
                </p>
              </motion.div>
            ) : shiftedSlots.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] backdrop-blur-sm transition-colors"
              >
                {/* Optional: Subtle visual cue */}
                <div className="mb-3 p-3 rounded-full bg-white/5">
                  <svg
                    className="w-6 h-6 text-gray-500 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h3 className="text-gray-400 font-bold text-sm md:text-base uppercase tracking-widest">
                  No slots available
                </h3>

                <p className="mt-1 text-gray-500 text-xs md:text-sm max-w-[200px] text-center">
                  Check back later or try selecting a different date.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="slots"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {shiftedSlots.map((shift) => (
                  <div key={shift.shift_name} className="space-y-2">
                    <h3 className="text-sm font-semibold text-green-800">
                      {shift.shift_name}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-3">
                      {shift.slots.map((slot) => {
                        const displayTime = format(
                          parse(slot.start_time, "HH:mm:ss", new Date()),
                          "hh:mm a",
                        );
                        const isSelected = selectedSlots.includes(slot.slot_id);
                        const colorClass =
                          slot.status === "booked"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : isSelected
                              ? "bg-blue-500 text-white ring-2 ring-purple-400"
                              : slot.status === "held"
                                ? "bg-yellow-500 text-white"
                                : "bg-gradient-to-br from-green-400 to-emerald-500 text-gray-800";

                        return (
                          <motion.button
                            key={slot.slot_id}
                            onClick={() => toggleSlot(slot)}
                            disabled={slot.status === "booked"}
                            whileHover={
                              slot.status !== "booked" ? { scale: 1.05 } : {}
                            }
                            whileTap={
                              slot.status === "available" ? { scale: 0.95 } : {}
                            }
                            className={`p-3 rounded-md shadow border flex flex-col items-center justify-center min-h-[80px] ${colorClass}`}
                          >
                            <span className="font-bold">{displayTime}</span>
                            <span className="text-xs mt-1">
                              {slot.status === "booked"
                                ? "Booked"
                                : slot.status === "held"
                                  ? "Held"
                                  : `৳${slot.price.toLocaleString()}`}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── RIGHT: Summary panel — always rendered, never mounts/unmounts ── */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {selectedSlots.length > 0 && availableSlots.length > 0 ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-green-900 rounded-md p-6"
            >
              {/* Header */}
              <div className="flex flex-col gap-2 mb-4">
                <div>
                  <p className="text-lg font-bold text-white">Selected Slots</p>
                  <p className="font-semibold text-gray-200">
                    {selectedSlots.length}{" "}
                    {selectedSlots.length === 1 ? "slot" : "slots"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Total Amount</p>
                  <motion.p
                    key={totalPrice} // Re-triggers animation when price changes
                    className="text-4xl font-bold text-gray-200 flex items-center"
                  >
                    {/* Wrap the characters in a motion span for staggering */}
                    <motion.span
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                      }}
                    >
                      {`৳${totalPrice.toLocaleString()}`
                        .split("")
                        .map((char, index) => (
                          <motion.span
                            key={`${char}-${index}`}
                            variants={{
                              hidden: { opacity: 0, display: "none" },
                              visible: { opacity: 1, display: "inline-block" },
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                    </motion.span>

                    {/* The Cursor */}
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block w-1 h-8 bg-yellow-500 ml-2"
                    />
                  </motion.p>
                </div>
              </div>

              {/* Slots List */}
              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                  {selectedSlots.map((slotId) => {
                    const slot = availableSlots.find(
                      (s) => s.slot_id === slotId,
                    );
                    if (!slot) return null;
                    return (
                      <motion.div
                        key={slotId}
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-900 shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-green-900">
                          ৳{slot.price}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center h-full min-h-[240px] md:min-w-[300px] 
             bg-zinc-900/20 backdrop-blur-sm 
             border-2 border-dashed border-white/5 rounded-2xl 
             text-zinc-500 transition-all duration-300 group"
            >
              <div className="relative mb-4">
                {/* Animated Ring Decor */}
                <div className="absolute inset-0 rounded-full bg-white/5 animate-ping opacity-20" />
                <div className="relative p-4 rounded-full bg-white/[0.03] border border-white/5 group-hover:border-white/20 transition-colors">
                  <Clock className="w-8 h-8 opacity-40 group-hover:opacity-100 group-hover:text-white transition-all duration-500" />
                </div>
              </div>

              <div className="space-y-1 text-center">
                <p className="text-white/60 font-semibold tracking-wide text-sm md:text-base">
                  Ready to book?
                </p>
                <p className="text-[11px] md:text-xs text-zinc-500 max-w-[180px] leading-relaxed">
                  Your selected time slots will be neatly listed here.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
