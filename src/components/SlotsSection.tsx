import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import { Zap } from "lucide-react";

interface TimeSlot {
  slot_id: string;
  field_id: string;
  start_time: string;
  end_time: string;
  type: string;
  status: "booked" | "available" | "held";
  price: number;
}

interface SlotsSectionProps {
  selectedSlots: string[];
  setSelectedSlots: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSportData: { field_id: string } | null | undefined;
  selectedDate: Date;
  BASE_URL: string;
}

export function SlotsSection({
  selectedSlots,
  setSelectedSlots,
  selectedSportData,
  selectedDate,
  BASE_URL,
}: SlotsSectionProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const holdTimersRef = useRef<Record<string, number>>({});
  const slotSessionIdsRef = useRef<Record<string, string>>({});

  // Clear selected slots when date changes
  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate]);

  // Fetch available slots
  useEffect(() => {
    if (!selectedSportData || !selectedDate || !BASE_URL) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        const res = await fetch(
          `${BASE_URL}/rest/v1/rpc/get_slots?p_field_id=${selectedSportData.field_id}&p_booking_date=${dateStr}`,
          {
            method: "GET",
            headers: {
              apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "",
              Authorization: `Bearer ${
                (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ""
              }`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed");

        const data: TimeSlot[] = await res.json();
        setAvailableSlots(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch time slots");
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedSportData, BASE_URL]);

  // Release all holds on unmount
  useEffect(() => {
    return () => {
      releaseAllHolds();
    };
  }, []);

  const holdSlot = async (slot: TimeSlot) => {
    if (!selectedSportData) return;

    const displayTime = format(
      parse(slot.start_time, "HH:mm:ss", new Date()),
      "hh:mm a"
    );

    const sessionId = `session-${Math.random().toString(36).substr(2, 9)}`;
    slotSessionIdsRef.current[slot.slot_id] = sessionId;

    try {
      const res = await fetch(`${BASE_URL}/rest/v1/rpc/hold_slot`, {
        method: "POST",
        headers: {
          apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ""
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_field_id: slot.field_id,
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

        holdTimersRef.current[slot.slot_id] = window.setTimeout(() => {
          releaseSlot(slot);
        }, 10 * 60 * 1000);
      } else {
        toast.error("Failed to hold slot");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error holding slot");
    }
  };

  const releaseSlot = async (slot: TimeSlot) => {
    const displayTime = format(
      parse(slot.start_time, "HH:mm:ss", new Date()),
      "hh:mm a"
    );

    try {
      const sessionId = slotSessionIdsRef.current[slot.slot_id];
      if (!sessionId) return;

      await fetch(`${BASE_URL}/rest/v1/rpc/release_a_slot`, {
        method: "POST",
        headers: {
          apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ""
          }`,
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

      setSelectedSlots((prev) => prev.filter((t) => t !== slot.slot_id));
    } catch (err) {
      console.error(err);
      toast.error("Error releasing slot");
    }
  };

  const refreshSlots = async () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const res = await fetch(
      `${BASE_URL}/rest/v1/rpc/get_slots?p_field_id=${selectedSportData?.field_id}&p_booking_date=${dateStr}`,
      {
        method: "GET",
        headers: {
          apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ""
          }`,
        },
      }
    );
    const data = await res.json();
    setAvailableSlots(data);
  };

  const releaseAllHolds = () => {
    Object.values(holdTimersRef.current).forEach(clearTimeout);

    holdTimersRef.current = {};
    slotSessionIdsRef.current = {};

    fetch(`${BASE_URL}/rest/v1/rpc/release_session_holds`, {
      method: "POST",
      headers: {
        apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${
          (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ""
        }`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_session_id: "ALL" }),
    }).catch(console.error);
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
        : [...prev, slot.slot_id]
    );
  };

  if (!selectedSportData || !selectedDate || !BASE_URL) {
    return <div className="p-4 text-gray-500">Loading slots...</div>;
  }

  const sortedSlots = availableSlots.sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  const slotsByShift = sortedSlots.reduce((acc, slot) => {
    if (!acc[slot.type]) acc[slot.type] = [];
    acc[slot.type].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-green-900 md:text-xs lg:text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-600" />
          Available Slots
        </h2>
      </div>

      {slotsLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[80px] rounded-xl shimmer"></div>
          ))}
        </div>
      ) : Object.keys(slotsByShift).length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white/50 rounded-xl border border-dashed border-gray-300">
          No slots available for this sport on this date.
        </div>
      ) : (
        Object.entries(slotsByShift)
          .sort(([a], [b]) => a.localeCompare(b)) // <-- Alphabetic sorting
          .map(([shiftName, shiftSlots]) => (
            <div key={shiftName} className="space-y-2">
              <h3 className="text-sm font-semibold text-green-800">
                {shiftName}
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {shiftSlots.map((slot) => {
                  const displayTime = format(
                    parse(slot.start_time, "HH:mm:ss", new Date()),
                    "hh:mm a"
                  );

                  const isSelected = selectedSlots.includes(slot.slot_id);

                  const colorClass =
                    slot.status === "booked"
                      ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-500 text-white shadow-lg ring-2 ring-purple-400 ring-offset-2"
                      : slot.status === "held"
                      ? "bg-yellow-500 text-white shadow-lg ring-1 ring-yellow-300"
                      : "bg-gradient-to-br from-green-400 to-emerald-500 border-green-100 text-gray-700 hover:border-green-300 hover:shadow-md";

                  return (
                    <motion.button
                      key={slot.slot_id}
                      onClick={() => toggleSlot(slot)}
                      disabled={slot.status === "booked"}
                      whileHover={
                        slot.status === "available" || slot.status === "held"
                          ? { scale: 1.05 }
                          : {}
                      }
                      whileTap={
                        slot.status === "available" ? { scale: 0.95 } : {}
                      }
                      className={`relative p-3 rounded-xl shadow-sm border transition-all flex flex-col items-center justify-center min-h-[80px] ${colorClass}`}
                    >
                      <span className="font-bold text-sm md:text-base">
                        {displayTime}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider mt-1">
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
          ))
      )}
    </motion.div>
  );
}
