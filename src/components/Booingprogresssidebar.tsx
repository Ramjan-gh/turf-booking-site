import { motion, AnimatePresence } from "motion/react";
import { Check, Circle } from "lucide-react";

interface Step {
  id: number;
  label: string;
  sublabel: string;
  done: boolean;
  active: boolean;
}

interface BookingProgressSidebarProps {
  selectedSport: string;
  selectedDate: Date | null;
  selectedSlots: string[];
  fullName: string;
  phone: string;
  showSummary: boolean;
}

export function BookingProgressSidebar({
  selectedSport,
  selectedDate,
  selectedSlots,
  fullName,
  phone,
  showSummary,
}: BookingProgressSidebarProps) {
  const steps: Step[] = [
    {
      id: 1,
      label: "Select Sport",
      sublabel: selectedSport ? "Sport chosen ✓" : "Pick a turf",
      done: !!selectedSport,
      active: !selectedSport,
    },
    {
      id: 2,
      label: "Choose Date",
      sublabel: selectedDate
        ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Pick a date",
      done: !!selectedDate && !!selectedSport,
      active: !!selectedSport && !selectedDate,
    },
    {
      id: 3,
      label: "Select Slots",
      sublabel:
        selectedSlots.length > 0
          ? `${selectedSlots.length} slot${selectedSlots.length > 1 ? "s" : ""} picked`
          : "Choose time",
      done: selectedSlots.length > 0,
      active: !!selectedDate && selectedSlots.length === 0,
    },
    {
      id: 4,
      label: "Your Details",
      sublabel: fullName ? fullName.split(" ")[0] : "Name & phone",
      done: !!(fullName && phone),
      active: selectedSlots.length > 0 && !(fullName && phone),
    },
    {
      id: 5,
      label: "Confirm & Pay",
      sublabel: showSummary ? "Review booking" : "Final step",
      done: showSummary,
      active: !!(fullName && phone) && !showSummary,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div
      className="hidden xl:flex flex-col gap-0 sticky top-28 self-start"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
          Booking Progress
        </p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black text-green-900">
            {completedCount}
          </span>
          <span className="text-sm font-semibold text-slate-400 mb-1">
            / {steps.length} done
          </span>
        </div>

        {/* thin progress bar */}
        <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="relative flex flex-col gap-0">
        {/* Vertical line behind steps */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-100" />

        {/* Animated fill line */}
        <motion.div
          className="absolute left-[15px] top-4 w-px bg-green-500 origin-top"
          style={{ height: `calc(100% - 32px)` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: progressPercent / 100 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {steps.map((step, idx) => (
          <div key={step.id} className="relative flex items-start gap-3 py-3">
            {/* Dot */}
            <div className="relative z-10 flex-shrink-0 mt-0.5">
              <AnimatePresence mode="wait">
                {step.done ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-[30px] h-[30px] rounded-full bg-green-600 flex items-center justify-center shadow-md shadow-green-200"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                ) : step.active ? (
                  <motion.div
                    key="active"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-[30px] h-[30px] rounded-full bg-white border-2 border-green-500 flex items-center justify-center shadow-sm"
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    className="w-[30px] h-[30px] rounded-full bg-white border-2 border-slate-200 flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold text-slate-300">
                      {step.id}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Label */}
            <div className="pt-0.5">
              <p
                className={`text-sm font-bold leading-tight transition-colors duration-300 ${
                  step.done
                    ? "text-green-700"
                    : step.active
                      ? "text-slate-800"
                      : "text-slate-300"
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-xs mt-0.5 transition-colors duration-300 ${
                  step.done
                    ? "text-green-500"
                    : step.active
                      ? "text-slate-400"
                      : "text-slate-200"
                }`}
              >
                {step.sublabel}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Completion badge */}
      <AnimatePresence>
        {completedCount === steps.length && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl text-center"
          >
            <p className="text-xs font-bold text-green-700">🎉 Ready to confirm!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
