import { motion, AnimatePresence } from "motion/react";
import Footer from "./Footer";
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  ChevronRight,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { Booking } from "../App";
import { format } from "date-fns";

export function CheckBooking() {
  const [bookingCode, setBookingCode] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/rest/v1/rpc/get_booking_details?p_booking_code=${encodeURIComponent(
          bookingCode,
        )}`,
        {
          method: "GET",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_ANON_KEY || ""
            }`,
            "Content-Type": "application/json",
          },
        },
      );
      

      if (!response.ok) {
        setBooking(null);
        setNotFound(true);
        return;
      }

      const data = await response.json();
      console.log("Booking fetch response:", data);
      if (data.booking) {
        const totalPrice = data.booking.total_amount || 0;
        const paidAmount =
          data.booking.paid_amount !== undefined
            ? data.booking.paid_amount
            : data.booking.payment_status?.toLowerCase().trim() ===
                "partially_paid"
              ? Math.round(totalPrice * 0.5)
              : totalPrice;
        const dueAmount = Math.max(0, totalPrice - paidAmount);

        const mappedBooking: Booking = {
          id: data.booking.booking_code,
          fullName: data.booking.full_name,
          phone: data.booking.phone_number,
          email: data.booking.email,
          sport: data.field.field_name,
          date: data.slots[0]?.booking_date || "",
          // FIXED LOGIC: Removes (undefined) and cleans up time strings
          slots: data.slots.map((s: any) => {
            const start = s.start_time?.slice(0, 5) || "00:00";
            const end = s.end_time?.slice(0, 5) || "00:00";
            const typeLabel = s.type ? ` (${s.type})` : "";
            return `${start} - ${end}${typeLabel}`;
          }),
          players: data.booking.number_of_players,
          notes: data.booking.special_notes,
          paymentMethod: data.booking.payment_method,
          paymentAmount:
            data.booking.payment_status?.toLowerCase().trim() ===
            "partially_paid"
              ? "confirmation"
              : "full",
          discountCode: data.discount_code || undefined,
          totalPrice: totalPrice,
          paidAmount: paidAmount,
          dueAmount: dueAmount,
          createdAt: data.booking.created_at,
        };

        setBooking(mappedBooking);
        setNotFound(false);
      } else {
        setBooking(null);
        setNotFound(true);
      }
    } catch (error) {
      console.error("Booking fetch error:", error);
      setBooking(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <header className="space-y-4 mb-12 text-center md:text-left">
            <div className="flex items-center gap-2">
              <Ticket className="w-3 h-3 text-green-700" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Reservation Portal
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-green-900">
              Find your booking.
            </h1>
            <p className="text-lg text-slate-500 max-w-lg">
              Enter your unique 8-character booking code to view your session
              details and payment summary.
            </p>
          </header>
        </motion.div>

        {/* Search Bar */}
        <div className="relative mb-16">
          <form onSubmit={handleSearch} className="group relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className={`w-5 h-5 ${loading ? "text-blue-500 animate-pulse" : "text-slate-400"}`}
              />
            </div>
            <Input
              id="bookingCode"
              type="text"
              placeholder="e.g. BOK-123456"
              value={bookingCode}
              onChange={(e) => {
                setBookingCode(e.target.value);
                setNotFound(false);
              }}
              className="w-full px-12 py-7 text-lg border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 transition-all placeholder:text-slate-300"
              required
            />
            <div className="absolute inset-y-2 right-2">
              <Button
                disabled={loading}
                className="h-full px-6 bg-green-900 hover:bg-green-700 text-white rounded-xl transition-all flex items-center gap-2"
              >
                {loading ? "Searching..." : "Track"}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </form>

          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-12 left-0 right-0 flex items-center gap-2 text-red-500 text-sm font-medium px-2"
            >
              <AlertCircle className="w-4 h-4" />
              We couldn't find a booking with that code.
            </motion.div>
          )}
        </div>

        {/* Booking Card */}
        <AnimatePresence mode="wait">
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-slate-100 rounded-[32px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Confirmed Booking
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ID: {booking.id}
                </span>
              </div>

              <div className="p-8 md:p-10">
                <div className="grid md:grid-cols-2 gap-12">
                  <section className="space-y-8">
                    <DetailItem
                      icon={<User className="text-blue-500" />}
                      label="Lead Participant"
                      value={booking.fullName}
                    />
                    <DetailItem
                      icon={<Calendar className="text-indigo-500" />}
                      label="Scheduled Date"
                      value={format(
                        new Date(booking.date),
                        "EEEE, MMM do, yyyy",
                      )}
                    />
                    <DetailItem
                      icon={<Clock className="text-orange-500" />}
                      label="Slots Booked"
                      value={booking.slots.join(", ")}
                    />
                  </section>

                  <section className="space-y-8">
                    <DetailItem
                      icon={<MapPin className="text-rose-500" />}
                      label="Activity & Venue"
                      value={booking.sport}
                    />
                    <DetailItem
                      icon={<Phone className="text-emerald-500" />}
                      label="Contact Details"
                      value={booking.phone}
                      subValue={booking.email}
                    />
                    <DetailItem
                      icon={<CreditCard className="text-slate-700" />}
                      label="Payment Status"
                      value={
                        booking.paymentAmount === "confirmation"
                          ? "Deposit Paid"
                          : "Fully Paid"
                      }
                      badge
                    />
                  </section>
                </div>

                {/* Pricing Summary */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <p className="text-sm text-slate-400 font-medium mb-4">
                    Payment Summary
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">
                        Total Bill
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        ৳{booking.totalPrice}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                      <p className="text-[10px] uppercase font-bold text-green-600 tracking-widest mb-2">
                        Paid Bill
                      </p>
                      <p className="text-2xl font-black text-green-700">
                        ৳{booking.paidAmount}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border text-center ${booking.dueAmount > 0 ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"}`}
                    >
                      <p
                        className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${booking.dueAmount > 0 ? "text-amber-600" : "text-slate-400"}`}
                      >
                        Due Amount
                      </p>
                      <p
                        className={`text-2xl font-black ${booking.dueAmount > 0 ? "text-amber-700" : "text-slate-500"}`}
                      >
                        ৳{booking.dueAmount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  subValue,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  badge?: boolean;
}) {
  return (
    <div className="flex gap-4 group">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-md border border-transparent group-hover:border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-lg font-semibold text-slate-800 leading-tight">
          {value}
        </p>
        {subValue && <p className="text-sm text-slate-500 mt-1">{subValue}</p>}
        {badge && (
          <span className="inline-block mt-2 px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold uppercase">
            Verified
          </span>
        )}
      </div>
    </div>
  );
}
