"use client";

import { CheckCircle, Download, Printer, Award, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import confetti from "canvas-confetti";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

type Organization = {
  id: number;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  emails?: string[] | null;
  phone_numbers?: string[] | null;
  address_text?: string | null;
  address_google_maps_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  whatsapp_url?: string | null;
  points_exchange_rate?: number;
  booking_security_amount?: number;
};

export function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;
  const discountedTotal =
    location.state?.discountedTotal ?? booking?.totalPrice ?? 0;
  const totalPrice = location.state?.totalPrice;
  const confirmationAmount: number = location.state?.confirmationAmount;
  const sportIcon = location.state?.sportIcon ?? " ";
  const sportName = location.state?.sportName ?? " ";

  const loyaltyDeduction = location.state?.loyaltyDeduction ?? 0;
  const pointsRedeemed = location.state?.pointsRedeemed ?? 0;

  // Get points earned from state or fallback to default logic
  const pointsEarned = location.state?.pointsEarned ?? Math.floor(discountedTotal / 100);

  // Organization info is fetched from the API only — no hardcoded/concrete data.
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState(false);

  useEffect(() => {
    if (booking) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#3b82f6", "#a855f7"],
      });
    }
  }, [booking]);

  useEffect(() => {
    const fetchOrg = async () => {
      setOrgLoading(true);
      setOrgError(false);
      try {
        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_organization`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        const data = await res.json();
        const record = Array.isArray(data) ? data[0] : data;

        if (record && typeof record === "object") {
          setOrg(record as Organization);
        } else {
          setOrgError(true);
        }
      } catch (err) {
        console.error("Failed to load organization info from API:", err);
        setOrgError(true);
      } finally {
        setOrgLoading(false);
      }
    };

    fetchOrg();
  }, []);

  if (!booking) return <p className="p-10 text-center">No booking found.</p>;

  const handlePrint = () => window.print();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 20, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", stiffness: 200, damping: 12 },
    },
  };

  const titleText = "Booking Successful";

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="z-50 flex justify-center p-4 flex-col items-center"
    >
      {/* Animated Title Text */}
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl md:text-7xl font-extrabold m-2 p-10 bg-green-700 bg-clip-text text-transparent text-center print:hidden"
      >
        {titleText.split(" ").map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block mr-3">
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={`${wordIndex}-${charIndex}`}
                variants={letterVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.h1>

      {/* ─── SHOW IT AFTER TITLETEXT ─── */}
      {pointsEarned > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.4 }}
          className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-3 px-8 text-center shadow-md flex items-center gap-3 print:hidden border border-amber-400"
        >
          <div className="bg-white/20 p-2 rounded-full">
            <Award className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              Loyalty Reward Earned!
            </p>
            <p className="text-xl font-black leading-tight">
              +{pointsEarned} Points Added
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Ticket Receipt Container */}
      <div className="bg-white shadow-sm md:w-[700px] rounded-sm no-scrollbar print-area print:shadow-none border border-gray-100">
        <div className="p-8 print:p-12">
          {/* Success Header */}
          <div className="text-center mb-6 print:mb-0 print:hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold text-xl">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Your turf has been successfully booked
            </p>
          </div>

          {/* Receipt Header */}
          <div className="text-center pb-3 print:pb-0">
            {orgLoading ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <p className="text-xs text-gray-400">Loading organization details...</p>
              </div>
            ) : (
              <>
                {org?.logo_url ? (
                  <img
                    src={org.logo_url}
                    alt={org.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-md border"
                  />
                ) : (
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 text-white rounded-full mb-3 print:bg-black">
                    <span className="text-2xl">🏟️</span>
                  </div>
                )}

                {org?.name && <h2 className="text-gray-900 mb-1">{org.name}</h2>}
                <p className="text-sm text-gray-600 uppercase tracking-wide">
                  Booking Confirmation Receipt
                </p>
                {org?.address_text && (
                  <p className="text-xs text-gray-500 mt-2">{org.address_text}</p>
                )}
                {(org?.phone_numbers?.[0] || org?.emails?.[0]) && (
                  <p className="text-xs text-gray-500">
                    {org?.phone_numbers?.[0] && <>Phone: {org.phone_numbers[0]}</>}
                    {org?.phone_numbers?.[0] && org?.emails?.[0] && " | "}
                    {org?.emails?.[0] && <>Email: {org.emails[0]}</>}
                  </p>
                )}
                {orgError && (
                  <p className="text-xs text-red-400 mt-2">
                    Couldn't load organization details.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Booking Code */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2 text-center border-2 print:scale-75 w-64 justify-self-center mx-auto mb-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              Booking Code
            </p>
            <p className="md:text-3xl text-blue-600 tracking-wider print:text-gray-900 font-bold">
              {booking.code}
            </p>
            <p className="text-xs text-gray-500">
              Keep this code for tracking and verification
            </p>
          </div>

          {/* Booking Date */}
          <div className="text-center py-2 print:py-0 mb-4">
            <p className="text-xs text-gray-500 mb-1">Booking Created On</p>
            <p className="text-sm text-gray-900 font-semibold">
              {format(
                booking.createdAt ? new Date(booking.createdAt) : new Date(),
                "EEEE, MMMM d, yyyy - hh:mm a"
              )}
            </p>
          </div>

          {/* Customer Information */}
          <div className="mb-3">
            <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 mb-3">
              Customer Information
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex gap-1 text-xs">
                <span className="text-gray-600">Name:</span>
                <span className="text-gray-900 font-medium">
                  {booking.fullName}
                </span>
              </div>
              <div className="flex gap-1 text-xs">
                <span className="text-gray-600">Phone:</span>
                <span className="text-gray-900 font-medium">
                  {booking.phone}
                </span>
              </div>
              {booking.email && (
                <div className="flex gap-1 text-xs">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900 font-medium">
                    {booking.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-3">
            <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 mb-3">
              Booking Details
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Sport:</span>
                <span className="text-gray-900 flex items-center gap-2 font-medium">
                  {sportIcon && sportIcon.trim() !== "" && (
                    <img src={sportIcon} alt="" className="w-[16px]" />
                  )}
                  {sportName}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900 font-medium">
                  {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              {booking.players && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Number of Players:</span>
                  <span className="text-gray-900 font-medium">
                    {booking.players}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-3 print:mb-0">
            <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 mb-3">
              Price Breakdown
            </p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 border-b border-dashed">Slots</span>
              <span className="text-gray-900 border-b border-dashed">Price</span>
            </div>
            <div className="space-y-1">
              {booking.slots?.map((slot: any) => {
                const start = new Date(`1970-01-01T${slot.start_time}`);
                const end = new Date(`1970-01-01T${slot.end_time}`);
                return (
                  <div key={slot.slot_id} className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {format(start, "hh:mm a")} - {format(end, "hh:mm a")}
                    </span>
                    <span className="text-gray-900">৳{Number(slot.price.toFixed(1))}</span>
                  </div>
                );
              })}

              <div className="flex justify-between text-sm border-t border-dashed pt-2 mt-2">
                <span className="text-gray-700 font-medium">Subtotal:</span>
                <span className="text-gray-900 font-bold">৳{Number(totalPrice.toFixed(1))}</span>
              </div>

              {/* Promo Code Discount */}
              {booking.discountCode && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount ({booking.discountCode}):</span>
                  <span>-৳{Number((totalPrice - (booking.discountedTotal ?? discountedTotal + loyaltyDeduction)).toFixed(1))}</span>
                </div>
              )}

              {/* Loyalty Points Redeemed Row */}
              {pointsRedeemed > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-medium bg-emerald-50/50 p-1.5 rounded border border-emerald-100/50 my-1">
                  <span className="flex items-center gap-1">
                    ✨ Points Redeemed ({pointsRedeemed} pts):
                  </span>
                  <span>-৳{Number(loyaltyDeduction.toFixed(1))}</span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-2 border-t-2 border-gray-900 mt-1">
                <span className="text-gray-900 font-bold uppercase text-xs">
                  Total Amount:
                </span>
                <span className="text-gray-900 font-bold">
                  ৳{Number(discountedTotal.toFixed(1))}
                </span>
              </div>

              <div className="flex justify-between bg-gray-900 text-xs text-gray-100 p-2 rounded-lg my-3 items-center">
                <span>Amount Paid:</span>
                <span className="text-xl font-bold">
                  ৳
                  {booking.paymentAmount === "confirmation"
                    ? Number(confirmationAmount.toFixed(1))
                    : Number(discountedTotal.toFixed(1))}
                </span>
              </div>

              {booking.paymentAmount === "confirmation" && (
                <div className="flex justify-between text-xs text-gray-900 bg-gray-100 p-2 rounded-lg items-center">
                  <span>Remaining Amount (due at venue):</span>
                  <span className="text-xl font-bold">
                    ৳{Math.max(Number((discountedTotal - confirmationAmount).toFixed(1)), 0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-4 text-xs text-gray-600">
            <p className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Important Instructions:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Please arrive at least 10 minutes before your scheduled time</li>
              <li>Cancellations must be made 24 hours in advance for a refund</li>
              <li>Keep your booking code for reference</li>
            </ul>
          </div>

          {/* Footer */}
          {!orgLoading && org && (
            <div className="text-center text-xs text-gray-500 pt-4 border-t-2 border-dashed border-gray-300">
              {org.name && (
                <p className="mb-2 font-medium">
                  Thank you for choosing {org.name}!
                </p>
              )}
              {(org.emails?.[0] || org.phone_numbers?.[0]) && (
                <p>
                  {org.emails?.[0] && <>Email: {org.emails[0]}</>}
                  {org.emails?.[0] && org.phone_numbers?.[0] && " | "}
                  {org.phone_numbers?.[0] && <>Phone: {org.phone_numbers[0]}</>}
                </p>
              )}
              {org.facebook_url && (
                <p className="mt-2 text-blue-600 font-medium">
                  Facebook: {org.facebook_url}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 print:hidden">
            <Button
              onClick={handlePrint}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" /> Save PDF
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-2 font-bold"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}