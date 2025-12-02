import { motion } from "motion/react";
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { Booking } from "../App";
import { format } from "date-fns";

export function CheckBooking() {
  const [bookingCode, setBookingCode] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Get all bookings from localStorage
    const stored = localStorage.getItem("bookings");
    if (stored) {
      const bookings: Booking[] = JSON.parse(stored);
      const found = bookings.find((b) => b.id === bookingCode);

      if (found) {
        setBooking(found);
        setNotFound(false);
      } else {
        setBooking(null);
        setNotFound(true);
      }
    } else {
      setBooking(null);
      setNotFound(true);
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case "football":
        return "⚽";
      case "cricket":
        return "🏏";
      case "swimming":
        return "🏊";
      default:
        return "🎯";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl text-center"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Track your booking</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            Check Your Booking
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/90"
          >
            Enter your booking code to view your reservation details
          </motion.p>
        </div>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl p-8 shadow-lg"
      >
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bookingCode" className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              Booking Code
            </Label>
            <Input
              id="bookingCode"
              type="text"
              placeholder="Enter your booking code"
              value={bookingCode}
              onChange={(e) => {
                setBookingCode(e.target.value);
                setNotFound(false);
              }}
              required
              className="border-2 focus:border-blue-500"
            />
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Booking
            </Button>
          </motion.div>
        </form>

        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center"
          >
            <p className="text-red-600">
              Booking not found. Please check your booking code and try again.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Booking Details */}
      {booking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-dashed">
            <div>
              <h2 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Booking Confirmed
              </h2>
              <p className="text-gray-500">
                Booking Code:{" "}
                <span className="text-blue-600">{booking.id}</span>
              </p>
            </div>
            <div className="text-5xl">{getSportIcon(booking.sport)}</div>
          </div>

          {/* Booking Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900">{booking.fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900">{booking.phone}</p>
                </div>
              </div>

              {booking.email && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{booking.email}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900">
                    {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Slots</p>
                  <p className="text-gray-900">{booking.slots.join(", ")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sport</p>
                  <p className="text-gray-900">
                    {booking.sport.charAt(0).toUpperCase() +
                      booking.sport.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="pt-6 border-t-2 border-dashed">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3>Payment Information</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="text-gray-900 capitalize">
                  {booking.paymentMethod}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Payment Type</p>
                <p className="text-gray-900">
                  {booking.paymentAmount === "confirmation"
                    ? "Confirmation"
                    : "Full Payment"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                <p className="text-sm text-green-100 mb-1">Total Price</p>
                <p className="text-xl">৳{booking.totalPrice}</p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {booking.notes && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Special Notes</p>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
