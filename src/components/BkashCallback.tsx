import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const BkashCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent strict mode double execution triggering API errors
    if (initialized.current) return;
    initialized.current = true;

    const finalizeBooking = async () => {
      const status = searchParams.get("status");
      const paymentID = searchParams.get("paymentID");

      if (status !== "success" || !paymentID) {
        toast.error(`Payment failed or cancelled. Status: ${status}`);
        navigate("/"); // bounce back to home or cart
        return;
      }

      const idToken = localStorage.getItem("bkash_id_token");
      const savedPayloadString = localStorage.getItem("pending_bkash_booking");

      if (!idToken || !savedPayloadString) {
        toast.error("Booking session expired. Please try again.");
        navigate("/");
        return;
      }

      const payload = JSON.parse(savedPayloadString);

      try {
        toast.loading("Verifying your payment...");

        // --- Phase 1: Call bKash 3rd API (Execute Payment) ---
        const executeRes = await fetch(
          "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: idToken,
            },
            body: JSON.stringify({ paymentID }),
          }
        );

        const executeData = await executeRes.json();

        if (!executeRes.ok || executeData.statusCode !== "0000") {
          toast.dismiss();
          toast.error(executeData.statusMessage || " bKash capture failed.");
          navigate("/");
          return;
        }

        // --- Phase 2: Create Booking inside Supabase DB ---
        // Setup secure headers for RPC
        let accessToken = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
        const supabaseProjectRef = "himsgwtkvewhxvmjapqa";
        const rawAuthData = localStorage.getItem(`sb-${supabaseProjectRef}-auth-token`);
        if (rawAuthData) {
          try {
            const parsedAuth = JSON.parse(rawAuthData);
            if (parsedAuth?.access_token) accessToken = parsedAuth.access_token;
          } catch {}
        }

        const secureHeaders = {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${accessToken}`,
        };

        // Remove UI helper metadata before pushing to endpoint
        const { meta, ...cleanRpcPayload } = payload;

        const dbRes = await fetch(`${import.meta.env.VITE_BASE_URL}/rest/v1/rpc/create_booking`, {
          method: "POST",
          headers: secureHeaders,
          body: JSON.stringify(cleanRpcPayload),
        });

        const dbData = await dbRes.json();
        toast.dismiss();

        if (!dbRes.ok || !dbData || !dbData[0] || dbData[0].success === false) {
          toast.error(dbData?.[0]?.message || "Booking creation failed after payment. Contact support.");
          return;
        }

        const responseData = dbData[0];
        toast.success(responseData.message || "Booking confirmed successfully!");

        // --- Phase 3: Construct structural UI state match ---
        const fallbackTotalPrice = meta.discountedTotal - (meta.pointsDiscountValue || 0);
        
        const newBooking = {
          id: responseData.booking_id || Date.now().toString(),
          code: responseData.booking_code || Date.now().toString(),
          msg: responseData.message || "Booking successful",
          fullName: meta.fullName,
          phone: meta.phone,
          email: meta.email || undefined,
          sport: meta.selectedSport,
          date: meta.p_booking_date,
          slots: meta.selectedSlots.sort(),
          players: meta.players ? parseInt(meta.players) : undefined,
          notes: meta.notes || undefined,
          paymentMethod: meta.paymentMethod,
          paymentAmount: meta.paymentAmount,
          discountCode: meta.discountCode || undefined,
          totalPrice: responseData.total_amount || fallbackTotalPrice,
          createdAt: new Date().toISOString(),
          paidAmount: cleanRpcPayload.p_paid_amount,
          dueAmount:
            meta.paymentAmount === "confirmation"
              ? (responseData.final_amount ?? fallbackTotalPrice) - meta.confirmationAmount
              : 0,
        };

        // Append historical records back into localStorage state
        const storedLocalBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
        localStorage.setItem("bookings", JSON.stringify([...storedLocalBookings, newBooking]));

        // Clear cache keys
        localStorage.removeItem("pending_bkash_booking");
        localStorage.removeItem("bkash_id_token");

        // Step away cleanly into confirmation UI layout
        navigate("/booking-confirmation", {
          state: {
            booking: {
              ...newBooking,
              slots: meta.slotsData.filter((s: any) => meta.selectedSlots.includes(s.slot_id)),
            },
            sportIcon: meta.selectedSportData?.icon || " ",
            sportName: meta.selectedSportData?.name || " ",
            totalPrice: responseData.total_amount || fallbackTotalPrice,
            discountedTotal: responseData.final_amount,
            discountAmount: responseData.discount_amount,
            loyaltyDeduction: responseData.loyalty_deduction,
            confirmationAmount: meta.confirmationAmount,
            bookingCode: responseData.booking_code,
            pointsRedeemed: responseData.points_redeemed,
            pointsEarned: responseData.points_earned,
            memberTotalPoints: responseData.member_total_points,
          },
        });

      } catch (error) {
        console.error("Callback crash:", error);
        toast.dismiss();
        toast.error("Internal processing error during checkout execution.");
      }
    };

    finalizeBooking();
  }, [searchParams, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <div>
        <h2>Processing your payment</h2>
        <p>Please do not refresh the page or close this window...</p>
      </div>
    </div>
  );
};