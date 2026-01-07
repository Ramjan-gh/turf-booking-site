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
  setSlotsData?: React.Dispatch<React.SetStateAction<TimeSlot[]>>; // <-- NEW
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

  const holdTimersRef = useRef<Record<string, number>>({});
  const slotSessionIdsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate]);

  /* ================= FETCH SLOTS (FIXED) ================= */

  useEffect(() => {
    if (!selectedSportData || !selectedDate || !BASE_URL) return;

    const fetchSlots = async () => {
      if (!selectedSportData) return;
      setSlotsLoading(true);

      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_slots`, {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_ANON_KEY || ""
            }`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p_field_id: selectedSportData.field_id,
            p_booking_date: dateStr,
          }),
        });

        if (!res.ok) throw new Error("Failed");

        const apiData = await res.json();

        // Map slots properly
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
            })) || []
        );

        setAvailableSlots(mappedSlots); // internal state
        setSlotsData?.(mappedSlots); // sync with HomePage
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch slots");
        setAvailableSlots([]);
        setSlotsData?.([]); // fallback for HomePage
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedSportData, BASE_URL]);

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
          p_slot_id: slot.slot_id,
          p_booking_date: format(selectedDate, "yyyy-MM-dd"),
          p_session_id: sessionId,
          p_hold_duration_minutes: 10,
        }),
      });

      const data = await res.json();
      console.log("Hold slot response:", data);

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

  /* ================= REFRESH ================= */
  const refreshSlots = async () => {
    if (!selectedSportData || !selectedDate) return;
    setSlotsLoading(true);

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_slots`, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            import.meta.env.VITE_SUPABASE_ANON_KEY || ""
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_field_id: selectedSportData.field_id,
          p_booking_date: dateStr,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch slots");

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
          })) || []
      );

      setAvailableSlots(mappedSlots); // internal state
      setSlotsData?.(mappedSlots); // sync with HomePage
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh slots");
      setAvailableSlots([]);
      setSlotsData?.([]); // fallback for HomePage
    } finally {
      setSlotsLoading(false);
    }
  };

  const releaseAllHolds = () => {
    Object.values(holdTimersRef.current).forEach(clearTimeout);
    holdTimersRef.current = {};
    slotSessionIdsRef.current = {};
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

  /* ================= UI (UNCHANGED) ================= */
  // Sort slots by start_time
  const sortedSlots = availableSlots.sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  // Group by shift/type
  const slotsByShift = sortedSlots.reduce((acc, slot) => {
    if (!acc[slot.type]) acc[slot.type] = [];
    acc[slot.type].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Convert to array for mapping in JSX
  const shiftedSlots: { shift_name: string; slots: TimeSlot[] }[] =
    Object.entries(slotsByShift).map(([shift_name, slots]) => ({
      shift_name,
      slots,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <h2 className="flex items-center gap-2 text-green-900 font-semibold">
        <Zap className="w-5 h-5 text-green-600" />
        Available Slots
      </h2>

      {slotsLoading ? (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[80px] rounded-xl shimmer" />
          ))}
        </div>
      ) : shiftedSlots.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border rounded-xl">
          No slots available
        </div>
      ) : (
        shiftedSlots.map((shift) => (
          <div key={shift.shift_name} className="space-y-2">
            <h3 className="text-sm font-semibold text-green-800">
              {shift.shift_name}
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {shift.slots.map((slot) => {
                const displayTime = format(
                  parse(slot.start_time, "HH:mm:ss", new Date()),
                  "hh:mm a"
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
                    whileHover={slot.status !== "booked" ? { scale: 1.05 } : {}}
                    whileTap={
                      slot.status === "available" ? { scale: 0.95 } : {}
                    }
                    className={`p-3 rounded-xl shadow border flex flex-col items-center justify-center min-h-[80px] ${colorClass}`}
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
        ))
      )}
    </motion.div>
  );
}
