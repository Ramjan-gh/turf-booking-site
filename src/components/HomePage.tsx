import { useState, useEffect, useRef } from "react";
import { User, Booking } from "../App";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useNavigate } from "react-router-dom";



import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Zap,
  Check,
  Clock,
  Tag,
  PartyPopper,
  ChevronDown,
} from "lucide-react";
// import { BookingModal } from "./BookingModal";
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isAfter,
  isBefore,
} from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { BookingConfirmation } from "./BookingConfirmation";
import turfImage from "../assets/photos/turf.jpg";
import ImageWithShimmer from "./ImageWithShimmer";
import SportSelector from "./SportSelector";
import { Sport } from "../data/sports";



const TIME_SLOTS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

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
      const res = await fetch(
        "https://himsgwtkvewhxvmjapqa.supabase.co/rest/v1/rpc/get_fields",
        {
          method: "GET",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_ANON_KEY || ""
            }`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.background_image_url, // mapping
        icon: "⚽", // TEMP if backend doesn’t give
        pricePerHour: 1200, // TEMP ->
        gradient: "from-green-500 to-emerald-600",
      }));

      setSports(formatted);
      // Set default sport (first in the list)
      if (formatted.length > 0) {
        setSelectedSport(formatted[0].id);
      }
    }

    loadSports();
  }, []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  

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

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
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
  };

  const isToday = isSameDay(selectedDate, new Date());
  const isPast = selectedDate < startOfDay(new Date());

  const selectedSportData = sports.find((s) => s.id === selectedSport);
  const totalPrice = calculateTotal();
  const confirmationAmount = getConfirmationAmount();

  const [banners, setBanners] = useState<{ file_url: string }[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerError, setBannerError] = useState(false);

  // 1️⃣ Move fetch function outside useEffect so both initial fetch and retry can use it
  const fetchBanners = async () => {
    setBannerLoading(true);
    setBannerError(false);
    try {
      const res = await fetch(
        "https://himsgwtkvewhxvmjapqa.supabase.co/rest/v1/rpc/get_banners",
        {
          method: "GET",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_ANON_KEY || ""
            }`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      setBanners(data);
      setBannerLoading(false);
    } catch (err) {
      console.error(err);
      setBannerError(true);
      setBannerLoading(false);
    }
  };

  // 2️⃣ Initial fetch
  useEffect(() => {
    fetchBanners();
  }, []);

  // 3️⃣ Retry every 1 min
  useEffect(() => {
    const retryInterval = setInterval(() => {
      fetchBanners();
    }, 60_000);

    return () => clearInterval(retryInterval);
  }, []);

  // 4️⃣ Auto-slide if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);


  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl shadow-2xl"
        >
          <div className="relative w-full h-[250px] rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
            {bannerLoading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse" />
            ) : bannerError || banners.length === 0 ? (
              <div className="w-full h-full bg-red-300" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.img
                  key={banners[currentBanner].file_url}
                  src={banners[currentBanner].file_url}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  onError={() => setBannerError(true)}
                />
              </AnimatePresence>
            )}
          </div>

          {/* 🔥 Overlay should be above the image */}
          {/* <div className="absolute inset-0 z-10 bg-gradient-to-br from-green-600/70 via-green-500/60 to-emerald-600/70"></div> */}

          {/* Glow Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-10"></div>

          {/* 🔥 Content always on top */}
          <div className="absolute top-0 left-0 md:top-8 md:left-10 z-20 p-16 text-white">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-2 font-bold text-4xl"
            >
              Book Your <span className="text-[#fbff00]">T</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-green-50 flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Select a sport, date, and time slot to get started
            </motion.p>
          </div>
        </motion.div>

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

        {/* calendar and slot  */}
        <div className="flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl drop-shadow-lg gap-2  p-4">
          <div className="flex flex-col  md:flex-row w-full md:justify-center gap-8  p-4 rounded-xl drop-shadow-lg ">
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
              {/* calendar import  */}
              <Calendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </motion.div>

            {/* Available Slots */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-green-900 md:text-xs lg:text-base flex items-center gap-2 md:gap-0 lg:gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Available Slots
                </h2>
                <div className="flex gap-2 text-xs">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-1.5 md:gap-0 lg:gap-2 bg-green-50 px-3 py-1.5 rounded-full"
                  >
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500"></div>
                    <span className="text-gray-700">Available</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-1.5 md:gap-0 lg:gap-2 bg-gray-50 px-3 py-1.5 rounded-full"
                  >
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                    <span className="text-gray-700">Booked</span>
                  </motion.div>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {TIME_SLOTS.map((time, index) => {
                  const booked = isSlotBooked(time);
                  return (
                    <motion.button
                      key={time}
                      onClick={() => !booked && toggleSlot(time)}
                      disabled={booked}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.85 + index * 0.02 }}
                      whileHover={
                        booked
                          ? { scale: 1.05, transition: { duration: 0.1 } }
                          : { scale: 1.05, transition: { duration: 0.1 } }
                      }
                      whileTap={!booked ? { scale: 0.95 } : { scale: 1 }}
                      className={`relative p-5 rounded-2xl shadow-md flex items-center justify-center text-white font-semibold transition-all duration-100 ${
                        booked
                          ? // Booked: Gray BG, disabled text, hover to darker gray
                            "bg-gray-400 text-gray-800 hover:bg-gray-500 cursor-not-allowed"
                          : selectedSlots.includes(time)
                          ? // Selected: Blue BG, ring highlights, hover to darker blue
                            "bg-blue-500 shadow-lg ring-2 ring-purple-400 ring-offset-2 hover:bg-blue-600"
                          : // Available: Green BG, hover to darker green
                            "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {!booked && (
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 bg-white/20 rounded-2xl"
                        />
                      )}

                      <div className="relative z-10 flex items-center gap-2">
                        <div>
                          <div className="mb-1">{time}</div>
                          <div
                            className={`text-xs ${
                              booked ? "text-white/80" : "text-green-100"
                            }`}
                          >
                            {booked
                              ? "Booked"
                              : `৳${selectedSportData?.pricePerHour}`}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
          <div>
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
        </div>

        {/* Personal Information Form */}

        <motion.div
          ref={personalInfoRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="scroll-mt-20"
        >
          <form
            onSubmit={handleShowSummary}
            className="bg-white rounded-3xl p-8 shadow-lg border-2 border-indigo-200 space-y-6"
          >
            <h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Personal Information
            </h2>

            {/* VALIDATION */}
            {(() => {
              const isFullNameValid = /^[A-Za-z\s]+$/.test(fullName);
              const isPhoneValid = /^01\d{9}$/.test(phone);
              const isEmailValid =
                email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

              const isFormValid =
                isFullNameValid && isPhoneValid && isEmailValid;

              return (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[A-Za-z\s]*$/.test(value)) setFullName(value);
                        }}
                        required
                        className="border-2 text-black placeholder:text-gray-500 focus:border-indigo-500 focus:caret-black"
                      />

                      {fullName && !isFullNameValid && (
                        <p className="text-red-500 text-sm">
                          Only letters are allowed.
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) setPhone(val);
                        }}
                        required
                        className="border-2 focus:border-indigo-500 caret-black text-black placeholder:text-gray-500"
                      />
                      {phone && !isPhoneValid && (
                        <p className="text-red-500 text-sm">
                          Must start with 01 and be 11 digits.
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address (Optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-2 focus:border-indigo-500 caret-black text-black placeholder:text-gray-500"
                      />
                      {email && !isEmailValid && (
                        <p className="text-red-500 text-sm">
                          Invalid email format.
                        </p>
                      )}
                    </div>

                    {/* Players */}
                    <div className="space-y-2">
                      <Label htmlFor="players">
                        Number of Players (Optional)
                      </Label>
                      <Input
                        id="players"
                        name="players"
                        type="number"
                        min="1"
                        placeholder="e.g., 10"
                        value={players}
                        onChange={(e) => setPlayers(e.target.value)}
                        className="border-2 focus:border-indigo-500 caret-black text-black placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="border-2 focus:border-indigo-500 caret-black text-black placeholder:text-gray-500"
                    />
                  </div>

                  {/* DISCOUNT SECTION — YOUR ORIGINAL CODE */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="discount"
                      className="flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4 text-indigo-600" />
                      Discount Code
                    </Label>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="discount"
                          type="text"
                          placeholder="Enter promo code"
                          value={discountCode}
                          onChange={(e) =>
                            setDiscountCode(e.target.value.toUpperCase())
                          }
                          className={
                            discountCode === "FIRST10" ||
                            discountCode === "SAVE20"
                              ? "border-2 border-green-500 bg-green-50"
                              : "border-2 caret-black text-black placeholder:text-gray-500"
                          }
                        />

                        <AnimatePresence>
                          {(discountCode === "FIRST10" ||
                            discountCode === "SAVE20") && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              <PartyPopper className="w-5 h-5 text-green-600" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {(discountCode === "FIRST10" ||
                        discountCode === "SAVE20") && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                        >
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Valid
                          </Badge>
                        </motion.div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Try: FIRST10 or SAVE20
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t-2 border-dashed">
                    <h3 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Payment Details
                    </h3>

                    <div className="space-y-2">
                      <Label>Payment Method *</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <div className="grid grid-cols-3 gap-3">
                          <div
                            className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentMethod === "bkash"
                                ? "border-pink-500 bg-pink-50"
                                : "border-gray-200"
                            }`}
                          >
                            <RadioGroupItem
                              value="bkash"
                              id="bkash"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="bkash"
                              className="cursor-pointer text-center w-full"
                            >
                              bKash
                            </Label>
                          </div>

                          <div
                            className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentMethod === "nagad"
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                          >
                            <RadioGroupItem
                              value="nagad"
                              id="nagad"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="nagad"
                              className="cursor-pointer text-center w-full"
                            >
                              Nagad
                            </Label>
                          </div>

                          <div
                            className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentMethod === "rocket"
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200"
                            }`}
                          >
                            <RadioGroupItem
                              value="rocket"
                              id="rocket"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="rocket"
                              className="cursor-pointer text-center w-full"
                            >
                              Rocket
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Amount *</Label>
                      <RadioGroup
                        value={paymentAmount}
                        onValueChange={(val: string) =>
                          setPaymentAmount(val as "confirmation" | "full")
                        }
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentAmount === "confirmation"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <RadioGroupItem
                              value="confirmation"
                              id="confirmation"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="confirmation"
                              className="cursor-pointer text-center w-full"
                            >
                              Confirmation (৳{confirmationAmount})
                            </Label>
                          </div>

                          <div
                            className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentAmount === "full"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <RadioGroupItem
                              value="full"
                              id="full"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="full"
                              className="cursor-pointer text-center w-full"
                            >
                              Full Payment (৳{totalPrice})
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={!isFormValid}
                      className={`w-full py-6 shadow-lg text-white
                ${
                  isFormValid
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 "
                    : ""
                }`}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Review Booking
                    </Button>
                  </motion.div>
                </>
              );
            })()}
          </form>
        </motion.div>

        {/* Summary Section */}
        {showSummary && (
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
                    {selectedSportData?.icon} {selectedSportData?.name}
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
                    {selectedSlots.sort().join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="text-gray-900">
                    {selectedSlots.length} hour
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
                  <span className="text-gray-900 uppercase">
                    {paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Type:</span>
                  <span className="text-gray-900">
                    {paymentAmount === "confirmation"
                      ? "Confirmation (20%)"
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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate per hour:</span>
                  <span className="text-gray-900">
                    ৳{selectedSportData?.pricePerHour}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of hours:</span>
                  <span className="text-gray-900">
                    × {selectedSlots.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-dashed pt-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-900">
                    ৳
                    {selectedSlots.length *
                      (selectedSportData?.pricePerHour || 0)}
                  </span>
                </div>

                {(discountCode === "FIRST10" || discountCode === "SAVE20") && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Discount ({discountCode}):
                    </span>
                    <span>
                      -৳
                      {selectedSlots.length *
                        (selectedSportData?.pricePerHour || 0) -
                        totalPrice}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t-2 border-gray-900">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-gray-900">৳{totalPrice}</span>
                </div>

                <div className="flex justify-between bg-gray-100 -mx-8 px-8 py-3 -mb-6">
                  <span className="text-gray-900">Amount to Pay Now:</span>
                  <span className="text-xl text-gray-900">
                    ৳
                    {paymentAmount === "confirmation"
                      ? confirmationAmount
                      : totalPrice}
                  </span>
                </div>
                <div className="flex justify-between bg-gray-900 -mx-8 px-8 py-3 -mb-6">
                  <span className="text-gray-100">
                    Remaining Amount (due at venue):
                  </span>
                  <span className="text-xl text-gray-900">
                    ৳
                    {paymentAmount === "confirmation"
                      ? totalPrice - confirmationAmount
                      : totalPrice}
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
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleConfirmBooking}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600  text-white shadow-lg py-6"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirm & Pay
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Booking Confirmation Modal */}
      {/* {confirmedBooking && (
        <BookingConfirmation
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )} */}
    </div>
  );
}
