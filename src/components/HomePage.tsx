import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { User, Booking } from "../App";
import { Calendar } from "./ui/calendar";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { toast } from "sonner";
import SportSelector from "./SportSelector";
import { Sport } from "../data/sports";
import { Banner } from "./Banner";
import { SlotsSection } from "./SlotsSection";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { SummarySection } from "./SummarySection";
import { DiscountResponse } from "./PersonalInfoForm";
import Footer from "./Footer";
import { BookingProgressSidebar } from "./Booingprogresssidebar";
import { supabase } from "../lib/supabase";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

// Message type used for popup -> main-window communication once
// BookingSuccess.tsx finishes loading the booking inside the popup.
const BKASH_POPUP_MESSAGE_TYPE = "BKASH_BOOKING_COMPLETE";

type TierDetails = {
  id: string;
  name: string;
  min_points: number;
  badge_color: string;
  description: string;
  reward_interval: number | null;
  points_multiplier: number;
  discount_percentage: number;
};

type LoyaltyData = {
  all_tiers: TierDetails[];
  current_tier: TierDetails | null;
  next_tier: TierDetails | null;
  points_to_next_tier: number;
  total_earned_points: number;
};

type HomePageProps = {
  currentUser: User | null;
};

type SlotData = {
  slot_id: string;
  field_id: string;
  start_time: string;
  end_time: string;
  type: string;
  status: "booked" | "available" | "held" | "maintenance";
  price: number;
};

export function HomePage({ currentUser }: HomePageProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("");

  // Reference to the bKash popup window and a poll interval that
  // watches whether the user closed it manually without finishing.
  const paymentPopupRef = useRef<Window | null>(null);
  const popupPollRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadSports() {
      try {
        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_fields`, {
          method: "GET",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch fields");
        const data = await res.json();
        const formatted = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          image: item.background_image_url,
          icon: item.icon_url || "⚽",
          size: item.size || "N/A",
          player_capacity: item.player_capacity || 0,
        }));
        setSports(formatted);
        if (formatted.length > 0) {
          setSelectedSport((prev) => (prev === "" ? formatted[0].id : prev));
        }
      } catch (err) {
        console.error("Error loading fields:", err);
      }
    }
    loadSports();
  }, []);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [slotsData, setSlotsData] = useState<SlotData[]>([]);

  // Shared session id for the current booking attempt.
  const [bookingSessionId, setBookingSessionId] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [players, setPlayers] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [paymentAmount, setPaymentAmount] = useState<"confirmation" | "full">(
    "confirmation",
  );
  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState<DiscountResponse | null>(
    null,
  );
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );
  const [usablePoints, setUsablePoints] = useState(0);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);

  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscountValue, setPointsDiscountValue] = useState(0);

  const handleSetSlotsData = useCallback((slots: SlotData[]) => {
    setSlotsData(slots);
  }, []);

  useEffect(() => {
    let basePrice = selectedSlots
      .map((id) => slotsData.find((s) => s.slot_id === id)?.price || 0)
      .reduce((a, b) => a + b, 0);
    if (discountData) {
      if (discountData.discount_type === "percentage") {
        basePrice = basePrice - (basePrice * discountData.discount_value) / 100;
      } else {
        basePrice = basePrice - discountData.discount_value;
      }
    }
    setDiscountedTotal(Math.max(basePrice, 0));
  }, [selectedSlots, discountData, slotsData]);

  const personalInfoRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name);
      setPhone(currentUser.phone);
      setEmail(currentUser.email || "");

      async function fetchUserLoyaltyData() {
        try {
          const userId = currentUser?.id;
          if (!userId) return;

          const { data: memberData } = await supabase.rpc(
            "get_member_by_auth_user_id",
            { p_auth_user_id: userId },
          );

          if (memberData && memberData.id) {
            const { data: pointsData } = await supabase.rpc(
              "get_usable_points",
              { p_member_id: memberData.id },
            );

            const points = pointsData?.[0]?.total_useable_points || 0;
            setUsablePoints(points);

            const { data: tierList } = await supabase
              .from("membership_tiers")
              .select("*");

            const totalEarnedPoints = memberData.total_earned_points || 0;
            const sortedTiers = (tierList || []).sort(
              (a, b) => a.min_points - b.min_points,
            );

            let currentTier: TierDetails | null = null;
            let nextTier: TierDetails | null = null;

            for (let i = 0; i < sortedTiers.length; i++) {
              if (totalEarnedPoints >= sortedTiers[i].min_points) {
                currentTier = sortedTiers[i];
                nextTier = sortedTiers[i + 1] || null;
              }
            }

            setLoyalty({
              all_tiers: sortedTiers,
              current_tier: currentTier,
              next_tier: nextTier,
              points_to_next_tier: nextTier
                ? nextTier.min_points - totalEarnedPoints
                : 0,
              total_earned_points: totalEarnedPoints,
            });
          }
        } catch (err) {
          console.error("Error fetching user loyalty data:", err);
          setUsablePoints(0);
          setLoyalty(null);
        }
      }

      fetchUserLoyaltyData();
    }
  }, [currentUser]);

  const loadBookings = () => {
    const stored = localStorage.getItem("bookings");
    if (stored) setBookings(JSON.parse(stored));
  };

  const calculateTotal = () =>
    selectedSlots.reduce((sum, slotId) => {
      const slot = slotsData.find((s) => s.slot_id === slotId);
      return sum + (slot?.price || 0);
    }, 0);

  const handleShowSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlots.length === 0) {
      toast.error("Please select at least one time slot");
      return;
    }
    setShowSummary(true);
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  const confirmationAmount = 500;

  // Cleans up the popup-closed poller if it's running.
  const clearPopupPoll = useCallback(() => {
    if (popupPollRef.current) {
      window.clearInterval(popupPollRef.current);
      popupPollRef.current = null;
    }
  }, []);

  // Listens for the postMessage that BookingSuccess.tsx sends from
  // inside the popup once it has fetched the completed booking.
  // This is what lets us show the confirmation on the MAIN page
  // without ever navigating the main tab away to bKash.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only trust messages from our own origin (the popup navigates
      // back to our own /booking/success page after bKash redirects it,
      // so this will match once it's back on our domain).
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== BKASH_POPUP_MESSAGE_TYPE) return;

      clearPopupPoll();
      paymentPopupRef.current = null;
      toast.dismiss();

      if (event.data.error) {
        toast.error(event.data.error);
        return;
      }

      navigate("/booking-confirmation", {
        state: event.data.payload,
      });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, clearPopupPoll]);

  // Watches whether the user manually closed the popup before finishing.
  const watchPopupClosed = useCallback((popup: Window) => {
    clearPopupPoll();
    popupPollRef.current = window.setInterval(() => {
      if (popup.closed) {
        clearPopupPoll();
        paymentPopupRef.current = null;
        toast.dismiss();
        toast.info("Payment window closed.");
      }
    }, 500);
  }, [clearPopupPoll]);

  const handleConfirmBooking = async () => {
    // Center the popup on the user's screen.
    const popupWidth = 480;
    const popupHeight = 720;
    // screen.availWidth/Height account for taskbars etc; window.screenX/Y
    // (or screenLeft/Top as a fallback) account for multi-monitor setups
    // where the browser itself isn't on the primary monitor.
    const screenLeft = window.screenLeft ?? window.screenX ?? 0;
    const screenTop = window.screenTop ?? window.screenY ?? 0;
    const screenWidth = window.screen.availWidth ?? window.screen.width;
    const screenHeight = window.screen.availHeight ?? window.screen.height;
    const left = screenLeft + Math.max((screenWidth - popupWidth) / 2, 0);
    const top = screenTop + Math.max((screenHeight - popupHeight) / 2, 0);

    // Open a blank popup SYNCHRONOUSLY, before any await, so browsers
    // don't treat it as a blocked auto-popup. We fill in its URL once
    // the payment-creation call resolves below.
    const popup = window.open(
      "",
      "bkashPayment",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`,
    );
    paymentPopupRef.current = popup;

    if (popup) {
      // Simple placeholder while we wait for the real bKash URL.
      popup.document.write(
        "<html><body style='font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#555;'>Preparing payment…</body></html>",
      );
    }

    try {
      if (selectedSlots.length === 0) {
        popup?.close();
        toast.error("No slots selected!");
        return;
      }

      if (!bookingSessionId) {
        popup?.close();
        toast.error("Your session has expired. Please reselect your slots.");
        return;
      }
      const sessionId = bookingSessionId;

      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

      toast.loading("Setting up your payment...");

      let memberId = null;
      const authUser = localStorage.getItem("sb-user");
      if (authUser) {
        const authUserId = JSON.parse(authUser)?.id;
        if (authUserId) {
          const memberRes = await fetch(
            `${BASE_URL}/rest/v1/rpc/get_member_by_auth_user_id?p_auth_user_id=${authUserId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
              },
            },
          );
          if (memberRes.ok) {
            const memberData = await memberRes.json();
            memberId = Array.isArray(memberData)
              ? memberData[0]?.id
              : memberData?.id;
          }
        }
      }

      const requestBody = {
        field_id: selectedSport,
        slot_ids: selectedSlots,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        member_id: memberId,
        full_name: fullName,
        phone_number: phone,
        payment_status:
          paymentAmount === "confirmation" ? "partially_paid" : "fully_paid",
        email: email || "",
        number_of_players: players ? parseInt(players) : null,
        special_notes: notes || "",
        session_id: sessionId,
        discount_code_id: discountData?.id || null,
        loyalty_points_used: usePoints ? pointsToRedeem : 0,
      };

      const paymentRes = await fetch(
        "https://himsgwtkvewhxvmjapqa.supabase.co/functions/v1/bkash-create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const paymentData = await paymentRes.json();
      toast.dismiss();

      if (!paymentRes.ok || !paymentData?.bkashURL) {
        popup?.close();
        toast.error(paymentData?.message || "Failed to start payment.");
        return;
      }

      if (popup && !popup.closed) {
        // Fill in the real bKash checkout URL now that we have it.
        popup.location.href = paymentData.bkashURL;
        watchPopupClosed(popup);
      } else {
        // Popup was blocked or the user closed the placeholder already —
        // fall back to a normal full-page redirect so the flow still works.
        window.location.href = paymentData.bkashURL;
      }
    } catch (err) {
      console.error("Booking initialization error:", err);
      toast.dismiss();
      toast.error("Something went wrong while setting up payment.");
      popup?.close();
    }
  };

  const selectedSportData = sports.find((s) => s.id === selectedSport);
  const totalPrice = calculateTotal();
  const scrollToSlots = () =>
    slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const slotsSectionSportData = useMemo(
    () => (selectedSportData ? { field_id: selectedSportData.id } : null),
    [selectedSportData?.id],
  );

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="mx-auto space-y-6">
        <Banner />

        <div className="max-w-screen-2xl mx-auto px-4 md:px-24 flex gap-10 items-start">
          <BookingProgressSidebar
            selectedSport={selectedSport}
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            fullName={fullName}
            phone={phone}
            showSummary={showSummary}
          />

          <div className="flex-1 min-w-0 space-y-6">
            <div className="max-w-screen-2xl mx-auto">
              <SportSelector
                sports={sports}
                selectedSport={selectedSport}
                setSelectedSport={setSelectedSport}
              />
            </div>

            <div className="w-full pt-12 md:pt-24 flex items-center gap-4 md:gap-8 my-12">
              <div className="relative overflow-hidden bg-green-900 h-20 w-20 md:h-32 md:w-32 rounded-full flex justify-center items-center shadow-2xl border-4 border-green-700 flex-shrink-0">
                <motion.div
                  className="absolute inset-0 w-full h-full"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                    repeatDelay: 0.5,
                  }}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                    width: "50%",
                  }}
                />
                <p className="relative z-10 text-white text-3xl md:text-6xl font-black">
                  2
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <p className="text-gray-900 text-xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                  Select date and time slots for your{" "}
                  <span className="text-green-600">
                    {selectedSportData?.name || "sport"}
                  </span>
                </p>
              </motion.div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-col lg:flex-row w-full justify-between rounded-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-3"
                >
                  <h2 className="text-green-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                    Select Date
                  </h2>
                  <Calendar
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                </motion.div>

                <div ref={slotsRef}>
                  <SlotsSection
                    selectedSlots={selectedSlots}
                    setSelectedSlots={setSelectedSlots}
                    selectedSportData={slotsSectionSportData}
                    selectedDate={selectedDate}
                    BASE_URL={BASE_URL}
                    setSlotsData={handleSetSlotsData}
                    onSessionIdChange={setBookingSessionId}
                  />
                </div>
              </div>
            </div>

            <div className="pb-12">
              <div className="w-full md:pt-12 flex items-center gap-4 md:gap-8 my-12">
                <div className="relative overflow-hidden bg-green-900 h-20 w-20 md:h-32 md:w-32 rounded-full flex justify-center items-center shadow-2xl border-4 border-green-700 flex-shrink-0">
                  <motion.div
                    className="absolute inset-0 w-full h-full"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                      repeatDelay: 0.5,
                    }}
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                      width: "50%",
                    }}
                  />
                  <p className="relative z-10 text-white text-3xl md:text-6xl font-black">
                    3
                  </p>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <p className="text-gray-900 text-xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                    Enter your details and confirm booking
                  </p>
                </motion.div>
              </div>

              <PersonalInfoForm
                fullName={fullName}
                setFullName={setFullName}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                players={players}
                setPlayers={setPlayers}
                notes={notes}
                setNotes={setNotes}
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                discountData={discountData}
                setDiscountData={setDiscountData}
                discountedTotal={discountedTotal}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                paymentAmount={paymentAmount}
                setPaymentAmount={setPaymentAmount}
                confirmationAmount={confirmationAmount}
                totalPrice={totalPrice}
                handleShowSummary={handleShowSummary}
                personalInfoRef={personalInfoRef}
                currentUser={currentUser}
                usablePoints={usablePoints}
                pointExchangeRate={1}
                usePoints={usePoints}
                setUsePoints={setUsePoints}
                pointsToRedeem={pointsToRedeem}
                setPointsToRedeem={setPointsToRedeem}
                pointsDiscountValue={pointsDiscountValue}
                setPointsDiscountValue={setPointsDiscountValue}
              />
            </div>

            <SummarySection
              showSummary={showSummary}
              setShowSummary={setShowSummary}
              fullName={fullName}
              phone={phone}
              email={email}
              players={players}
              notes={notes}
              discountCode={discountCode}
              discountData={discountData}
              discountedTotal={discountedTotal}
              selectedSportData={{
                name: selectedSportData?.name || "",
                icon: selectedSportData?.icon || "",
              }}
              selectedDate={selectedDate}
              selectedSlots={selectedSlots}
              slotsData={slotsData.filter((s) =>
                selectedSlots.includes(s.slot_id),
              )}
              paymentMethod={paymentMethod}
              paymentAmount={paymentAmount}
              totalPrice={totalPrice}
              confirmationAmount={confirmationAmount}
              usePoints={usePoints}
              pointsToRedeem={pointsToRedeem}
              pointsDiscountValue={pointsDiscountValue}
              summaryRef={summaryRef}
              handleConfirmBooking={handleConfirmBooking}
              scrollToSlots={scrollToSlots}
            />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}