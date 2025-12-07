import { motion } from "framer-motion";
import { format, parse } from "date-fns";
import { Button } from "./ui/button";
import { Check, Sparkles } from "lucide-react";
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
}

export function SummarySection({
  showSummary,
  setShowSummary,
  fullName,
  phone,
  email,
  players,
  notes,
  discountCode,
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
}: SummarySectionProps) {
  if (!showSummary) return null; // early return if not showing

  return (
    <motion.div
      ref={summaryRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-300 space-y-6 scroll-mt-20 max-w-3xl mx-auto"
    >
      {/* Receipt Header */}
      <div className="text-center border-b-2 border-dashed border-gray-300 pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-3">
          <span className="text-3xl">⚽</span>
        </div>
        <h2 className="text-gray-900 mb-1">TurfBook</h2>
        <p className="text-sm text-gray-500">Booking Receipt</p>
        <p className="text-xs text-gray-400 mt-1">
          123 Sports Avenue, Gulshan-2, Dhaka
        </p>
        <p className="text-xs text-gray-400">Phone: +880 1234-567890</p>
      </div>

      <div className="text-center py-3 border-b-2 border-dashed border-gray-300">
        <p className="text-xs text-gray-500 mb-1">Booking Date & Time</p>
        <p className="text-sm text-gray-900">
          {format(new Date(), "EEEE, MMMM d, yyyy - hh:mm a")}
        </p>
      </div>

      {/* Customer Information */}
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-gray-500 border-b pb-2">
          Customer Information
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name:</span>
            <span className="text-gray-900">{fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone:</span>
            <span className="text-gray-900">{phone}</span>
          </div>
          {email && (
            <div className="flex justify-between col-span-2">
              <span className="text-gray-500">Email:</span>
              <span className="text-gray-900">{email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-gray-500 border-b pb-2">
          Booking Details
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Sport:</span>
            <span className="text-gray-900 flex items-center gap-2">
              <img src={selectedSportData?.icon} alt="" className="w-[16px]" />{" "}
              {selectedSportData?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span className="text-gray-900">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Time Slots:</span>
            <span className="text-gray-900">
              {selectedSlots
                .map((slotId) => {
                  const slot = slotsData.find((s) => s.slot_id === slotId);
                  if (!slot) return "";
                  return format(
                    parse(slot.start_time, "HH:mm:ss", new Date()),
                    "hh:mm a"
                  );
                })
                .sort((a, b) => {
                  // Optional: sort by time
                  const dateA = parse(a, "hh:mm a", new Date());
                  const dateB = parse(b, "hh:mm a", new Date());
                  return dateA.getTime() - dateB.getTime();
                })
                .join(", ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Number of slots:</span>
            <span className="text-gray-900">
              {selectedSlots.length} slot
              {selectedSlots.length > 1 ? "s" : ""}
            </span>
          </div>
          {players && (
            <div className="flex justify-between">
              <span className="text-gray-500">Players:</span>
              <span className="text-gray-900">{players}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-gray-500 border-b pb-2">
          Payment Details
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method:</span>
            <span className="text-gray-900 uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Type:</span>
            <span className="text-gray-900">
              {paymentAmount === "confirmation"
                ? "Confirmation (৳500)"
                : "Full Payment"}
            </span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 pt-3">
        <p className="text-sm uppercase tracking-wide text-gray-500 border-b pb-2">
          Price Breakdown
        </p>
        <div className="space-y-2">
          {/* Each selected slot */}
          {selectedSlots.map((slotId) => {
            const slot = slotsData.find((s) => s.slot_id === slotId);
            if (!slot) return null;

            const startTime = format(
              parse(slot.start_time, "HH:mm:ss", new Date()),
              "hh:mm a"
            );
            const endTime = format(
              parse(slot.end_time, "HH:mm:ss", new Date()),
              "hh:mm a"
            );

            return (
              <div key={slotId} className="flex justify-between text-sm">
                <span>
                  {startTime} - {endTime}
                </span>
                <span>৳{slot.price}</span>
              </div>
            );
          })}

          {/* discount */}
          <div className="flex justify-between text-sm font-medium border-t border-dashed pt-2">
            <span>Discount:</span>
            <span>৳{totalPrice - discountedTotal}</span>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-sm font-medium border-t border-dashed pt-2">
            <span>Subtotal:</span>
            <span>৳{discountedTotal}</span>
          </div>

          {/* Amount to pay now */}
          <div className="flex justify-between bg-gray-100 px-8 py-3 -mb-6">
            <span>Amount to Pay Now:</span>
            <span>
              ৳
              {paymentAmount === "confirmation"
                ? confirmationAmount
                : discountedTotal}
            </span>
          </div>

          {/* Remaining Amount */}
          <div className="flex justify-between bg-gray-900 px-8 py-3 -mb-6">
            <span className="text-white">Remaining Amount (due at venue):</span>
            <span className="text-white">
              ৳
              {paymentAmount === "confirmation"
                ? discountedTotal - confirmationAmount
                : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Special Notes */}
      {notes && (
        <div className="space-y-2 pt-6 border-t-2 border-dashed">
          <p className="text-sm uppercase tracking-wide text-gray-500">
            Special Notes
          </p>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
            {notes}
          </p>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="text-xs text-gray-500 space-y-1 pt-4 border-t-2 border-dashed">
        <p className="font-medium text-gray-700">Terms & Conditions:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Please arrive 10 minutes before your slot time</li>
          <li>Cancellation must be done 24 hours in advance</li>
          <li>Valid ID required at the venue</li>
          <li>Keep your booking code for reference</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t">
        <p className="mb-1">Thank you for choosing TurfBook!</p>
        <p>For support: support@turfbook.com | +880 1234-567890</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => setShowSummary(false)}
          className="border-2 py-6"
        >
          Edit Details
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleConfirmBooking}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600  text-white shadow-lg py-6"
          >
            <Check className="w-5 h-5 md:mr-2 hidden md:block" />
            Confirm & Pay
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}