import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner"; // or react-hot-toast

import { Zap } from "lucide-react";

interface TimeSlot {
  slot_id: string;
  field_id: string;
  start_time: string;
  end_time: string;
  type: string;
  status: "booked" | "available";
}

interface SlotsSectionProps {
  selectedSlots: string[];
  setSelectedSlots: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSportData:
    | { field_id: string; pricePerHour: number }
    | null
    | undefined; // allow undefined
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

  // Fetch slots whenever the date or sport changes
  useEffect(() => {
    if (!selectedSportData || !selectedDate || !BASE_URL) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(
          `${BASE_URL}/rest/v1/rpc/get_slots?p_booking_date=${dateStr}`,
          {
            method: "GET",
            headers: {
              apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "",
              Authorization: `Bearer ${
                (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ""
              }`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch slots");
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

  // Toggle selected slot
  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  if (!selectedSportData || !selectedDate || !BASE_URL) {
    return <div className="p-4 text-gray-500">Loading slots...</div>;
  }

  // Filter and sort slots
  const sortedSlots = availableSlots
    .filter((s) => s.field_id === selectedSportData.field_id)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-green-900 md:text-xs lg:text-base flex items-center gap-2 md:gap-0 lg:gap-2">
          <Zap className="w-5 h-5 text-green-600" />
          Available Slots
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {slotsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[80px] rounded-xl shimmer"></div>
          ))
        ) : sortedSlots.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white/50 rounded-xl border border-dashed border-gray-300 col-span-full">
            No slots available for this sport on this date.
          </div>
        ) : (
          sortedSlots.map((slot) => {
            const isBooked = slot.status === "booked";
            const displayTime = slot.start_time.slice(0, 5);
            const isSelected = selectedSlots.includes(displayTime);

            return (
              <motion.button
                key={slot.slot_id}
                onClick={() => !isBooked && toggleSlot(displayTime)}
                disabled={isBooked}
                whileHover={!isBooked ? { scale: 1.05 } : {}}
                whileTap={!isBooked ? { scale: 0.95 } : {}}
                className={`relative p-3 rounded-xl shadow-sm border transition-all
                  flex flex-col items-center justify-center min-h-[80px]
                  ${
                    isBooked
                      ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-500 shadow-lg ring-2 ring-purple-400 ring-offset-2 hover:bg-blue-600"
                      : "bg-gradient-to-br from-green-400 to-emerald-500 border-green-100 text-gray-700 hover:border-green-300 hover:shadow-md"
                  }`}
              >
                <span className="font-bold text-sm md:text-base">
                  {displayTime}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wider mt-1 ${
                    isSelected ? "text-blue-100" : "opacity-70"
                  }`}
                >
                  {isBooked ? "Booked" : `৳${selectedSportData.pricePerHour}`}
                </span>
              </motion.button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
