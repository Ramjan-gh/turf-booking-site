"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

/**
 * Landing page for bKash's post-payment redirect.
 * The backend executes the payment and creates the booking itself, then
 * sends the browser here with booking_id / booking_code in the query
 * string. This page looks up the full booking via get_booking_details,
 * shapes it the way BookingConfirmation.tsx expects, and hands off via
 * router state — BookingConfirmation itself needs no changes.
 */
export function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bookingId = searchParams.get("booking_id");
    const bookingCode = searchParams.get("booking_code");

    if (!bookingId && !bookingCode) {
      setError("Missing booking reference.");
      return;
    }

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

    const loadBooking = async () => {
      try {
        // NOTE: assuming the param is p_booking_code (matches the primary
        // identifier your response is keyed around). If your RPC actually
        // expects p_booking_id instead, swap the body below.
        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_booking_details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ p_booking_code: bookingCode }),
        });

        if (!res.ok) throw new Error("Failed to fetch booking");
        const data = await res.json();

        // Response shape confirmed as: { field, slots, booking, discount_code }
        const record = data?.booking;
        const slots = data?.slots ?? [];
        const field = data?.field;
        const discountCodeStr = data?.discount_code;

        if (!record) {
          setError("Booking not found.");
          return;
        }

        // point_redeem_amount is a currency amount, but the app uses a
        // 1:1 point exchange rate elsewhere (pointExchangeRate={1} in
        // PersonalInfoForm), so the points count equals the same number.
        const loyaltyDeduction = record.point_redeem_amount || 0;
        const pointsRedeemed = loyaltyDeduction; // 1:1 rate

        // Slot dates live on each slot, not on the booking row itself.
        const bookingDate = slots[0]?.booking_date;

        // payment_status has a known typo in the data ("pertially_paid").
        // Treat anything other than "fully_paid" as a partial/confirmation payment.
        const isFullyPaid = record.payment_status === "fully_paid";

        const booking = {
          id: record.id,
          code: record.booking_code,
          fullName: record.full_name,
          phone: record.phone_number,
          email: record.email,
          date: bookingDate,
          slots: slots.map((s: any) => ({
            slot_id: s.slot_id,
            start_time: s.start_time,
            end_time: s.end_time,
            price: s.slot_price,
          })),
          players: record.number_of_players,
          notes: record.special_notes,
          paymentMethod: record.payment_method,
          paymentAmount: isFullyPaid ? "full" : "confirmation",
          discountCode: discountCodeStr || undefined,
          totalPrice: record.total_amount,
          createdAt: record.created_at,
          paidAmount: record.paid_amount,
          dueAmount: Math.max(record.final_amount - record.paid_amount, 0),
        };

        navigate("/booking-confirmation", {
          replace: true,
          state: {
            booking,
            sportIcon: field?.icon_url ?? "",
            sportName: field?.field_name ?? "",
            totalPrice: record.total_amount,
            discountedTotal: record.final_amount,
            discountAmount: record.discount_amount ?? 0,
            loyaltyDeduction,
            // Use the real amount actually paid, not a hardcoded constant.
            confirmationAmount: record.paid_amount,
            bookingCode: record.booking_code,
            pointsRedeemed,
            // pointsEarned isn't returned by this endpoint — BookingConfirmation
            // falls back to Math.floor(discountedTotal / 100) when omitted.
            pointsEarned: undefined,
            memberTotalPoints: undefined,
          },
        });
      } catch (err) {
        console.error("Failed to load booking:", err);
        setError("Could not load your booking. Please contact support with your booking code.");
      }
    };

    loadBooking();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">{error}</h2>
          <p className="text-gray-500">
            Booking code: {searchParams.get("booking_code") || "N/A"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <div>
        <h2>Loading your booking...</h2>
      </div>
    </div>
  );
}