import { useState, useEffect, useRef } from "react";
import { User, Booking } from "../App";
import { Calendar } from "./ui/calendar";
import { useNavigate } from "react-router-dom";

import { Calendar as CalendarIcon } from "lucide-react";
// import { BookingModal } from "./BookingModal";
import { format, startOfDay, isSameDay } from "date-fns";
import { motion } from "motion/react";
import { toast } from "sonner";
import SportSelector from "./SportSelector";
import { Sport } from "../data/sports";
import { Banner } from "./Banner";
import { SlotsSection } from "./SlotsSection";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { SummarySection } from "./SummarySection";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

type HomePageProps = {
  currentUser: User | null;
};

export function HomePage({ currentUser }: HomePageProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("football");

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

        pricePerHour: item.price_per_hour || 1200, // TEMP ->
        gradient: "from-green-500 to-emerald-600",
      }));

      setSports(formatted);
      // Set default sport (first in the list)
      if (formatted.length > 0) {
        setSelectedSport((prev) =>
          // if current selected is still default string 'football', change to first id
          prev === "football" ? formatted[0].id : prev
        );
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
    "confirmation"
  );
  const [discountCode, setDiscountCode] = useState("");

  // View states
  const [showSummary, setShowSummary] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null
  );

  // Refs for scrolling
  const personalInfoRef = useRef<HTMLDivElement>(null);
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
        booking.slots.includes(time)
    );
  };

  const calculateTotal = () => {
    const selectedSportData = sports.find((s) => s.id === selectedSport);
    if (!selectedSportData) return 0;

    const basePrice = selectedSlots.length * selectedSportData.pricePerHour;
    let discount = 0;

    if (discountCode.toUpperCase() === "FIRST10") {
      discount = basePrice * 0.1;
    } else if (discountCode.toUpperCase() === "SAVE20") {
      discount = basePrice * 0.2;
    }

    return basePrice - discount;
  };

  const getConfirmationAmount = () => {
    return Math.ceil(calculateTotal() * 0.2);
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

  const handleConfirmBooking = () => {
    const totalPrice = calculateTotal();
    const amountToPay =
      paymentAmount === "confirmation" ? getConfirmationAmount() : totalPrice;

    const newBooking: Booking = {
      id: Date.now().toString(),
      userId: currentUser?.id,
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

    // Navigate to confirmation page with booking data
    navigate("/booking-confirmation", {
      state: {
        booking: newBooking,
        ratePerHour: selectedSportData?.pricePerHour || 0,
        sportIcon: selectedSportData?.icon || " ",
        sportName: selectedSportData?.name || " ",
      },
    });

    // Reset form
    setSelectedSlots([]);
    setFullName(currentUser?.name || "");
    setPhone(currentUser?.phone || "");
    setEmail(currentUser?.email || "");
    setPlayers("");
    setNotes("");
    setDiscountCode("");
    setShowSummary(false);

    loadBookings();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const selectedSportData = sports.find((s) => s.id === selectedSport);
  const totalPrice = calculateTotal();
  const confirmationAmount = getConfirmationAmount();

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Banner  */}
        <Banner />

        {/* Sport Selector */}
        {sports.length === 0 ? (
          <p>Loading sports...</p>
        ) : (
          <SportSelector
            sports={sports}
            selectedSport={selectedSport}
            setSelectedSport={setSelectedSport}
          />
        )}

        {/* calendar and slot   */}
        <div className="flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl drop-shadow-lg gap-2 p-4">
          <div className="flex flex-col md:flex-row w-full md:justify-center gap-8 p-4 rounded-xl drop-shadow-lg">
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
            <SlotsSection
              selectedSlots={selectedSlots}
              setSelectedSlots={setSelectedSlots}
              selectedSportData={
                selectedSportData
                  ? {
                      field_id: selectedSportData.id,
                      pricePerHour: selectedSportData.pricePerHour,
                    }
                  : null
              }
              selectedDate={selectedDate}
              BASE_URL={BASE_URL}
            />
          </div>

          {/* Selected Slots Box */}

          {selectedSlots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/50 border-2 border-purple-200 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selected Slots:</p>
                  <p className="text-purple-900">
                    {selectedSlots.sort().join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total:</p>
                  <p className="text-xl text-purple-900">
                    ৳
                    {selectedSlots.length *
                      (selectedSportData?.pricePerHour || 0)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
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
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          confirmationAmount={confirmationAmount}
          totalPrice={totalPrice}
          handleShowSummary={handleShowSummary}
          personalInfoRef={personalInfoRef}
        />

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
          selectedSportData={{
            ...selectedSportData!,
            icon: selectedSportData?.icon || "",
          }}
          selectedDate={selectedDate}
          selectedSlots={selectedSlots}
          paymentMethod={paymentMethod}
          paymentAmount={paymentAmount}
          totalPrice={totalPrice}
          confirmationAmount={confirmationAmount}
          summaryRef={summaryRef}
          handleConfirmBooking={handleConfirmBooking}
        />
      </div>
    </div>
  );
}
