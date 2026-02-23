"use client";

import { motion } from "framer-motion";
import { format, parse } from "date-fns";
import { Button } from "./ui/button";
import {
  Check,
  User,
  Phone,
  Calendar,
  Clock,
  Users,
  Wallet,
  Receipt,
  ArrowLeft,
  Info,
  ShieldCheck,
  MapPin,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { DiscountResponse } from "./PersonalInfoForm";

interface SummarySectionProps {
  showSummary: boolean;
  setShowSummary: (val: boolean) => void;
  fullName: string;
  phone: string;
  email?: string;
  players?: string;
  notes?: string;
  discountCode?: string;
  discountData: DiscountResponse | null;
  discountedTotal: number;
  selectedSportData?: {
    name: string;
    icon: string;
  };
  selectedDate: Date;
  selectedSlots: string[];
  slotsData: {
    slot_id: string;
    start_time: string;
    end_time: string;
    price: number;
    status: string;
  }[];
  paymentMethod: string;
  paymentAmount: "confirmation" | "full";
  totalPrice: number;
  confirmationAmount: number;
  summaryRef: React.RefObject<HTMLDivElement | null>;
  handleConfirmBooking: () => void;
  scrollToSlots: () => void;
}

export function SummarySection({
  showSummary,
  setShowSummary,
  fullName,
  phone,
  email,
  players,
  notes,
  discountData,
  discountedTotal,
  selectedSportData,
  selectedDate,
  selectedSlots,
  slotsData,
  paymentMethod,
  paymentAmount,
  totalPrice,
  confirmationAmount,
  summaryRef,
  handleConfirmBooking,
  scrollToSlots,
}: SummarySectionProps) {
  if (!showSummary) return null;

  const discountAmount = totalPrice - discountedTotal;

  return (
    <motion.div
      ref={summaryRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="scroll-mt-24 max-w-2xl mx-auto px-4 pb-20 font-sans"
    >
      <div className="relative bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
        {/* Top Branding Section */}
        <div className="bg-gray-900 p-8 text-center relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="text-[10rem] font-black">TURF</span>
          </motion.div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl rotate-12 mb-2">
              <span className="text-3xl -rotate-12">⚽</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight italic">
              TurfBook.
            </h2>
            <div className="flex flex-col items-center gap-1 text-gray-400 text-[10px] font-medium uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green-500" /> 123 Sports Avenue,
                Gulshan-2, Dhaka
              </span>
              <span>Phone: +880 1234-567890</span>
            </div>
          </div>
        </div>

        {/* The "Tear" Effect */}
        <div className="flex justify-between items-center -mt-4 relative z-20 px-0">
          <div className="w-8 h-8 bg-gray-50 rounded-full -ml-4 border-r border-gray-200"></div>
          <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-1"></div>
          <div className="w-8 h-8 bg-gray-50 rounded-full -mr-4 border-l border-gray-200"></div>
        </div>

        <div className="p-8 space-y-8 bg-white">
          {/* Booking Timestamp */}
          <div className="text-center py-2 border-b border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">
              Generated On
            </p>
            <p className="text-sm text-gray-900 font-bold">
              {format(new Date(), "EEEE, MMMM d, yyyy - hh:mm a")}
            </p>
          </div>

          {/* Customer & Sport Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                  Customer Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {fullName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{phone}</p>
                  </div>
                  {email && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-600" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {email}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                  Selected Arena
                </h3>
                <div className="flex items-center gap-4 bg-green-50 p-4 rounded-2xl border border-green-100">
                  <img
                    src={selectedSportData?.icon}
                    alt=""
                    className="w-10 h-10 object-contain bg-white p-1 rounded-xl shadow-sm"
                  />
                  <div>
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                      Sport
                    </p>
                    <p className="text-lg font-black text-gray-900">
                      {selectedSportData?.name}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                  Schedule
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Slots ({selectedSlots.length})
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedSlots.map((slotId) => {
                          const slot = slotsData.find(
                            (s) => s.slot_id === slotId,
                          );
                          return (
                            <span
                              key={slotId}
                              className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md font-bold"
                            >
                              {slot
                                ? format(
                                    parse(
                                      slot.start_time,
                                      "HH:mm:ss",
                                      new Date(),
                                    ),
                                    "hh:mm a",
                                  )
                                : ""}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {players && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {players} Players
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Detailed Price Breakdown */}
          <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100 shadow-inner">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
              Financial Summary
            </h3>

            <div className="space-y-3">
              {/* Itemized Slots */}
              {selectedSlots.map((slotId) => {
                const slot = slotsData.find((s) => s.slot_id === slotId);
                if (!slot) return null;
                return (
                  <div key={slotId} className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">
                      Slot:{" "}
                      {format(
                        parse(slot.start_time, "HH:mm:ss", new Date()),
                        "hh:mm a",
                      )}
                    </span>
                    <span className="text-gray-900 font-bold">
                      ৳{slot.price}
                    </span>
                  </div>
                );
              })}

              {/* Payment Logic Details */}
              <div className="pt-3 border-t border-dashed border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="text-gray-900 font-bold uppercase tracking-tight">
                    {paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Type</span>
                  <span className="text-gray-900 font-bold">
                    {paymentAmount === "confirmation"
                      ? "Partial (Deposit)"
                      : "Full Payment"}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-bold italic">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" /> Discount Applied
                    </span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between items-end pt-1">
                  <span className="text-sm font-black text-gray-900 uppercase">
                    Total Payable
                  </span>
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">
                    ৳{discountedTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Split View */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-sm">
                <p className="text-[9px] font-black text-green-600 uppercase mb-1">
                  Amount to Pay Now
                </p>
                <p className="text-xl font-black text-gray-900 italic">
                  ৳
                  {paymentAmount === "confirmation"
                    ? confirmationAmount
                    : discountedTotal}
                </p>
              </div>
              <div className="bg-gray-900 p-4 rounded-2xl text-center shadow-lg">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                  Due at Venue
                </p>
                <p className="text-xl font-black text-white italic">
                  ৳
                  {paymentAmount === "confirmation"
                    ? discountedTotal - confirmationAmount
                    : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Special Notes Section */}
          {notes && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Special Requests
              </h3>
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-sm text-indigo-900 italic leading-relaxed">
                "{notes}"
              </div>
            </div>
          )}

          {/* T&C Section */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 flex gap-4">
            <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900/80 leading-relaxed">
              <p className="font-black text-amber-900 mb-1 uppercase tracking-tighter">
                Terms & Conditions
              </p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>
                  Please arrive{" "}
                  <span className="font-bold underline">10 minutes</span> before
                  your slot time.
                </li>
                <li>
                  Cancellation must be done{" "}
                  <span className="font-bold">24 hours</span> in advance.
                </li>
                <li>Keep your booking code for reference at the venue.</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowSummary(false);
                setTimeout(() => scrollToSlots(), 50);
              }}
              className="flex-1 py-8 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Edit Details
            </Button>

            <motion.div
              className="flex-[2]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleConfirmBooking}
                className="w-full h-full py-8 bg-green-700 hover:bg-green-900 text-white rounded-2xl text-xl font-black shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3 overflow-hidden relative"
              >
                {/* Your Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                    repeatDelay: 1,
                  }}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    skewX: "-25deg",
                  }}
                />
                <div className="relative z-10 flex items-center">
                  
                  CONFIRM & PAY
                </div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100 space-y-1">
          <p className="text-xs text-gray-600 font-bold italic">
            Thank you for choosing TurfBook!
          </p>
          <p className="text-[10px] font-medium text-gray-400">
            For support:{" "}
            <span className="text-gray-600">support@turfbook.com</span> | +880
            1234-567890
          </p>
        </div>
      </div>
    </motion.div>
  );
}
