import { useState, useEffect, useRef } from "react";
import { User, Booking } from "../App";
import { Calendar } from "./ui/calendar";
import { useNavigate } from "react-router-dom";

import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  ChevronDown,
} from "lucide-react";
// import { BookingModal } from "./BookingModal";
import { format, parse, startOfDay, isSameDay } from "date-fns";
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

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

type HomePageProps = {
  currentUser: User | null;
};

export function HomePage({ currentUser }: HomePageProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("");

  useEffect(() => {
    async function loadSports() {
      const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_fields`, {
        method: "GET",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            import.meta.env.VITE_SUPABASE_ANON_KEY || ""
          }`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch fields");
      const data = await res.json();

      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.background_image_url, // mapping
        icon: item.icon_url || "⚽",
        size: item.size || "N/A",
        player_capacity: item.player_capacity || 0,
        
      }));

      setSports(formatted);
      // Set default sport (first in the list)
      if (formatted.length > 0) {
        setSelectedSport((prev) => (prev === "" ? formatted[0].id : prev));
      }
    }

    loadSports();
  }, []);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Form states
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

  // View states
  const [showSummary, setShowSummary] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );

  // state to store slot data
  const [slotsData, setSlotsData] = useState<
    {
      slot_id: string;
      start_time: string;
      end_time: string;
      price: number;
      status: string;
    }[]
  >([]);

  // fetch slot
  useEffect(() => {
    if (!selectedSport) return;

    async function loadSlots() {
      try {
        const res = await fetch(
          `${BASE_URL}/rest/v1/rpc/get_slots?p_field_id=${selectedSport}&p_booking_date=${format(
            selectedDate,
            "yyyy-MM-dd",
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

        if (!res.ok) throw new Error("Failed to fetch slots");

        const data = await res.json();
        console.log("API response:", data);

        // Flatten slots from shifts
        const formattedSlots = data.flatMap((shift: any) =>
          shift.slots.map((slot: any) => ({
            slot_id: slot.slot_id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            price: Number(slot.price),
            status: slot.status,
            shift_name: shift.shift_name,
            duration_minutes: slot.duration_minutes,
          })),
        );

        console.log("Formatted slots:", formattedSlots);
        setSlotsData(formattedSlots);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load slots");
      }
    }

    loadSlots();
  }, [selectedSport, selectedDate]);

  // When slots change or discount changes, compute
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

    setDiscountedTotal(Math.max(basePrice, 0)); // prevent negative
  }, [selectedSlots, discountData]);

  // Refs for scrolling
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    // Pre-fill if user is logged in
    if (currentUser) {
      setFullName(currentUser.name);
      setPhone(currentUser.phone);
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);

  const loadBookings = () => {
    const stored = localStorage.getItem("bookings");
    if (stored) {
      setBookings(JSON.parse(stored));
    }
  };

  const isSlotBooked = (time: string) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return bookings.some(
      (booking) =>
        booking.date === dateStr &&
        booking.sport === selectedSport &&
        booking.slots.includes(time),
    );
  };

  const calculateTotal = () => {
    if (selectedSlots.length === 0) return 0;

    // Get the price of each selected slot
    const total = selectedSlots.reduce((sum, slotId) => {
      const slot = slotsData.find((s) => s.slot_id === slotId);
      return sum + (slot?.price || 0);
    }, 0);

    return total;
  };

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

  const handleConfirmBooking = async () => {
    try {
      if (selectedSlots.length === 0) {
        toast.error("No slots selected!");
        return;
      }

      // Generate a unique session ID
      const sessionId = `session-${Date.now()}`;

      // Map discount code to ID if exists
      const discountId = discountData?.id || null;

      // Prepare payload for Supabase RPC
      const payload = {
        p_field_id: selectedSport,
        p_slot_ids: selectedSlots,
        p_booking_date: format(selectedDate, "yyyy-MM-dd"),
        p_full_name: fullName,
        p_phone_number: phone,
        p_email: email || "",
        p_number_of_players: players ? parseInt(players) : null,
        p_special_notes: notes || "",
        p_payment_method: paymentMethod,
        p_payment_status:
          paymentAmount === "confirmation" ? "partially_paid" : "fully_paid",
        p_paid_amount:
          paymentAmount === "confirmation"
            ? confirmationAmount
            : discountedTotal,
        p_session_id: sessionId,
        p_discount_code_id: discountId,
      };

      // Call Supabase RPC
      const res = await fetch(`${BASE_URL}/rest/v1/rpc/create_booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            import.meta.env.VITE_SUPABASE_ANON_KEY || ""
          }`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Booking API response:", data);
      console.log("discountData:", discountData);

      // Check response: adapt according to your RPC output
      if (!res.ok || !data[0] || !data[0].booking_code) {
        toast.error(data[0]?.message || "Booking failed. Please try again.");
        return;
      }

      toast.success(data[0].message);

      // Save booking locally (optional)
      const newBooking: Booking = {
        id: data[0].booking_id || Date.now().toString(),
        code: data[0].booking_code || Date.now().toString(),
        msg: data[0].message || "Booking successful",
        fullName,
        phone,
        email: email || undefined,
        sport: selectedSport,
        date: format(selectedDate, "yyyy-MM-dd"),
        slots: selectedSlots.sort(),
        players: players ? parseInt(players) : undefined,
        notes: notes || undefined,
        paymentMethod,
        paymentAmount,
        discountCode: discountCode || undefined,
        totalPrice,
        createdAt: new Date().toISOString(),
      };

      const allBookings = [...bookings, newBooking];
      localStorage.setItem("bookings", JSON.stringify(allBookings));
      setConfirmedBooking(newBooking);

      // Reset form
      setSelectedSlots([]);
      setFullName(currentUser?.name || "");
      setPhone(currentUser?.phone || "");
      setEmail(currentUser?.email || "");
      setPlayers("");
      setNotes("");
      setDiscountCode("");
      setShowSummary(false);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Navigate to confirmation page
      navigate("/booking-confirmation", {
        state: {
          booking: {
            ...newBooking,
            slots: slotsData.filter((s) => selectedSlots.includes(s.slot_id)),
          },
          sportIcon: selectedSportData?.icon || " ",
          sportName: selectedSportData?.name || " ",
          totalPrice,
          discountedTotal,
          confirmationAmount,
          bookingCode: data[0].booking_code,
        },
      });
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Something went wrong while booking.");
    }
  };

  const selectedSportData = sports.find((s) => s.id === selectedSport);
  const totalPrice = calculateTotal();

  //  scroll to personalinfoform
  const scrollToSlots = () => {
    slotsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  return (
    <div className="" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="mx-auto space-y-6">
        {/* Banner  */}
        <Banner />
        {/* Sport Selector */}
        <div className="px-4 md:px-24 max-w-screen-2xl mx-auto">
          <SportSelector
            sports={sports}
            selectedSport={selectedSport}
            setSelectedSport={setSelectedSport}
          />
        </div>
        <div className="max-w-screen-2xl mx-auto w-full pt-24 flex items-center gap-4 md:gap-8 my-12 px-4 md:px-24">
          {/* Shimmer Circle - Representing "Step 2" */}
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
            className="relative"
          >
            <p
              className="text-gray-900 text-xl md:text-4xl lg:text-5xl font-extrabold leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Select date and time slots for your{" "}
              <span className="text-green-600">
                {selectedSportData?.name || "sport"}
              </span>
            </p>
          </motion.div>
        </div>

        <div>
          {/* calendar and slot   */}
          <div className="max-w-screen-2xl mx-auto flex flex-col flex-wrap rounded-xl gap-2 p-4">
            <div className="flex flex-col lg:flex-row w-full justify-between px-4 md:px-24 rounded-xl">
              {/* Date Selector - Calendar View */}
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

                {/* calendar import */}
                <Calendar
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </motion.div>

              {/* Available Slots */}
              <div ref={slotsRef}>
                <SlotsSection
                  selectedSlots={selectedSlots}
                  setSelectedSlots={setSelectedSlots}
                  selectedSportData={
                    selectedSportData
                      ? { field_id: selectedSportData.id }
                      : null
                  }
                  selectedDate={selectedDate}
                  BASE_URL={BASE_URL}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pb-12">
          <div className="max-w-screen-2xl mx-auto w-full pt-12 flex items-center gap-4 md:gap-8 my-12 px-4 md:px-24">
            {/* Shimmer Circle - Representing "Step 3" */}
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
              className="relative"
            >
              <p
                className="text-gray-900 text-xl md:text-4xl lg:text-5xl font-extrabold leading-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Enter your details and confirm booking
              </p>
            </motion.div>
          </div>
          {/* Personal Information Form */}
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
          />
        </div>
        {/* Summary Section */}
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
          slotsData={slotsData.filter((s) => selectedSlots.includes(s.slot_id))}
          paymentMethod={paymentMethod}
          paymentAmount={paymentAmount}
          totalPrice={totalPrice}
          confirmationAmount={confirmationAmount}
          summaryRef={summaryRef}
          handleConfirmBooking={handleConfirmBooking}
          scrollToSlots={scrollToSlots}
        />
        {/* footer  */}
        <Footer />
      </div>
    </div>
  );
}
