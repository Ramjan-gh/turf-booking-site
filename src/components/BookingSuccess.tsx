"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";
const BKASH_POPUP_MESSAGE_TYPE = "BKASH_BOOKING_COMPLETE";

/**
 * Landing page for bKash's post-payment redirect.
 *
 * This page can be reached two different ways now:
 *  1. Inside the bKash popup window opened by HomePage.tsx — in this case
 *     `window.opener` is set, and we should postMessage the result back
 *     to the main tab and close ourselves, WITHOUT navigating anywhere
 *     inside the popup (there's nothing to show the user in it).
 *  2. As a normal full-page load (fallback path, e.g. if the popup was
 *     blocked and HomePage.tsx fell back to window.location.href) — in
 *     this case there's no opener, so we navigate to /booking-confirmation
 *     normally, same as before.
 */
export function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const isPopup = typeof window !== "undefined" && !!window.opener;

  useEffect(() => {
    const bookingId = searchParams.get("booking_id");
    const bookingCode = searchParams.get("booking_code");

    const sendResultAndClose = (payload: any, errorMessage?: string) => {
      if (isPopup && window.opener) {
        window.opener.postMessage(
          {
            type: BKASH_POPUP_MESSAGE_TYPE,
            payload,
            error: errorMessage,
          },
          window.location.origin,
        );
        window.close();
      } else if (errorMessage) {
        setError(errorMessage);
      } else {
        navigate("/booking-confirmation", { replace: true, state: payload });
      }
    };

    if (!bookingId && !bookingCode) {
      sendResultAndClose(null, "Missing booking reference.");
      return;
    }

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

    const loadBooking = async () => {
      try {
        // NOTE: assuming the param is p_booking_code. Confirm against
        // your actual RPC signature and adjust if it differs.
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

        const record = data?.booking;
        const slots = data?.slots ?? [];
        const field = data?.field;
        const discountCodeStr = data?.discount_code;

        if (!record) {
          sendResultAndClose(null, "Booking not found.");
          return;
        }

        const loyaltyDeduction = record.point_redeem_amount || 0;
        const pointsRedeemed = loyaltyDeduction; // 1:1 exchange rate
        const bookingDate = slots[0]?.booking_date;
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

        const payload = {
          booking,
          sportIcon: field?.icon_url ?? "",
          sportName: field?.field_name ?? "",
          totalPrice: record.total_amount,
          discountedTotal: record.final_amount,
          discountAmount: record.discount_amount ?? 0,
          loyaltyDeduction,
          confirmationAmount: record.paid_amount,
          bookingCode: record.booking_code,
          pointsRedeemed,
          pointsEarned: undefined,
          memberTotalPoints: undefined,
        };

        sendResultAndClose(payload);
      } catch (err) {
        console.error("Failed to load booking:", err);
        sendResultAndClose(
          null,
          "Could not load your booking. Please contact support with your booking code.",
        );
      }
    };

    loadBooking();
    // isPopup is derived from window.opener at mount time and won't change
    // during this component's life, so it's intentionally left out of deps.
  }, [searchParams, navigate]);

  // Inside the popup, there is nothing meaningful to render — it closes
  // itself almost immediately. This is just a brief fallback in case
  // closing is delayed or blocked by the browser.
  if (isPopup) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#666" }}>Finishing up…</p>
      </div>
    );
  }

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