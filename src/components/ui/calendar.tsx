"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { motion, AnimatePresence } from "motion/react";
import {
  format,
  isSameDay,
  isBefore,
  startOfDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  addDays,
  subMonths,
  addMonths,
} from "date-fns";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button"; // Make sure Button is exported from ./button
import { Badge } from "./badge"; // Make sure Badge is exported from ./badge

type CalendarProps = {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  className?: string;
  classNames?: any;
  showOutsideDays?: boolean;
};

export default function Calendar({
  selectedDate: externalSelectedDate,
  onDateChange,
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // --- State ---
  const [currentMonth, setCurrentMonth] = React.useState(
    externalSelectedDate || new Date()
  );

  // Use external selectedDate if provided, otherwise use internal state
  const selectedDate = externalSelectedDate || new Date();

  // --- Helper Functions ---
  const goToPreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = [];
    let date = start;
    while (date <= end) {
      days.push(date);
      date = addDays(date, 1);
    }
    return days;
  };

  const isToday = isSameDay(selectedDate, new Date());

  const handleDateSelect = (day: Date) => {
    if (onDateChange) {
      onDateChange(day);
    }
  };

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 p-6",
        className
      )}
    >
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="rounded-full hover:bg-green-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-green-600" />
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={format(currentMonth, "yyyy-MM")}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-center"
          >
            <div className="text-green-900">
              {format(currentMonth, "MMMM yyyy")}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className=" hover:bg-green-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-green-600" />
          </Button>
        </motion.div>
      </div>

      {/* Selected Date Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate.toISOString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl md:text-center"
        >
          <div className="text-sm text-gray-600 mb-1 flex justify-between md:flex-col">
            <div>Selected Date</div>
            {isToday && (
              <Badge
                variant="secondary"
                className="md:hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs"
              >
                Today
              </Badge>
            )}
          </div>
          <div className="text-green-900 flex items-center justify-between md:justify-center gap-2">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
            {isToday && (
              <Badge
                variant="secondary"
                className="hidden md:block bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs"
              >
                Today
              </Badge>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 mb-3 max-w-[350px] w-full mx-auto">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="w-full max-w-[350px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={format(currentMonth, "yyyy-MM")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid grid-cols-7 gap-2 md:min-h-[340px]"
          >
            {getDaysInMonth().map((day, index) => {
              if (!day)
                return <div key={`empty-${index}`} className="aspect-square" />;

              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isSameDay(day, new Date());
              const isPastDay = isBefore(day, startOfDay(new Date()));
              const isCurrentMonthDay = isSameMonth(day, currentMonth);

              return (
                <motion.button
                  key={day.toISOString()}
                  onClick={() => !isPastDay && handleDateSelect(day)}
                  disabled={isPastDay}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0,
                    ease: "easeOut",
                  }}
                  whileHover={!isPastDay ? { scale: 1, y: -2 } : {}}
                  whileTap={!isPastDay ? { scale: 0.95 } : {}}
                  className={`
                    aspect-square p-2 transition-all duration-200 relative
                    ${
                      isPastDay
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white ring-2 ring-green-400 ring-offset-2"
                        : isCurrentDay
                        ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-900 border-2 border-green-400"
                        : isCurrentMonthDay
                        ? "bg-gray-50 text-gray-700 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:text-green-900"
                        : "bg-transparent text-gray-400"
                    }
                  `}
                >
                  <div className="relative z-10 flex items-center justify-center h-full">
                    {format(day, "d")}
                  </div>

                  {/* Today indicator */}
                  {isCurrentDay && !isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-600"
                    />
                  )}

                  {/* Selected animation */}
                  {isSelected && (
                    <motion.div
                      layoutId="selectedDate"
                      className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export { Calendar };
