import { motion } from "motion/react";
import { CheckCircle, Download, Printer, X } from "lucide-react";
import { Button } from "./ui/button";
import { Booking } from "../App";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";


export function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;
  const ratePerHour = location.state?.ratePerHour ?? 0;
  const sportIcon = location.state?.sportIcon ?? " ";
  const sportName = location.state?.sportName ?? " ";

  if (!booking) return <p>No booking found.</p>;

  // const onClose = () => {}; // not needed anymore

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Trigger browser print dialog which allows saving as PDF
    window.print();
  };

  


  return (
    <div className="z-50 bg-gray-200 flex justify-center p-4  flex-col items-center">
      <h1 className="text-6xl font-bold m-10 p-10 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent text-center print:hidden">
        Booking Successful
      </h1>
      <div className="bg-white overflow-y-auto no-scrollbar print-area">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-3xl w-full print:rounded-none print:shadow-none print:max-w-full"
        >
          {/* Booking Slip Content - Receipt Style */}
          <div className="p-8 print:p-12">
            {/* Success Header - Only show on screen */}
            <div className="text-center mb-6 print:mb-0 print:hidden">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <h1 className="mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600">
                Your turf has been successfully booked
              </p>
            </div>

            {/* Receipt Header */}
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 print:h-4 print:w-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full mb-3 print:bg-gray-900">
                <span className="text-3xl">⚽</span>
              </div>
              <h2 className="text-gray-900 mb-1">TurfBook</h2>
              <p className="text-sm text-gray-600 uppercase tracking-wide">
                Booking Confirmation Receipt
              </p>
              <p className="text-xs text-gray-500 mt-2">
                123 Sports Avenue, Gulshan-2, Dhaka-1212
              </p>
              <p className="text-xs text-gray-500">
                Phone: +880 1234-567890 | Email: info@turfbook.com
              </p>
            </div>

            {/* Booking Code */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 print:p-2 text-center border-2 border-blue-200 mb-6 print:mb-0 print:bg-white print:scale-75 ">
              <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">
                Booking Code
              </p>
              <p className="text-3xl text-blue-600 tracking-wider mb-2 print:text-gray-900">
                #{booking.id}
              </p>
              <p className="text-xs text-gray-500">
                Keep this code for tracking and verification
              </p>
            </div>

            {/* Booking Date & Time */}
            <div className="text-center py-3 border-b-2 border-dashed border-gray-300 mb-6">
              <p className="text-xs text-gray-500 mb-1">Booking Created On</p>
              <p className="text-sm text-gray-900">
                {format(
                  new Date(booking.createdAt),
                  "EEEE, MMMM d, yyyy - hh:mm a"
                )}
              </p>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
                Customer Information
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="text-gray-900">{booking.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900">{booking.phone}</span>
                </div>
                {booking.email && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{booking.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="mb-6">
              <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
                Booking Details
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sport:</span>
                  <span className="text-gray-900 flex items-center gap-20">
                    {sportIcon}
                    {sportName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">
                    {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Slots:</span>
                  <span className="text-gray-900">
                    {booking.slots.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900">
                    {booking.slots.length} hour
                    {booking.slots.length > 1 ? "s" : ""}
                  </span>
                </div>
                {booking.players && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Players:</span>
                    <span className="text-gray-900">{booking.players}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-6">
              <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
                Payment Information
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="text-gray-900 uppercase">
                    {booking.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="text-gray-900">
                    {booking.paymentAmount === "confirmation"
                      ? "Confirmation Amount (20%)"
                      : "Full Payment (100%)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="text-green-600">Confirmed</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-6">
              <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
                Price Breakdown
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate per hour:</span>
                  <span className="text-gray-900">৳{ratePerHour}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of hours:</span>
                  <span className="text-gray-900">
                    × {booking.slots.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-dashed pt-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-900">
                    ৳{booking.slots.length * ratePerHour}
                  </span>
                </div>

                {booking.discountCode && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({booking.discountCode}):</span>
                    <span>
                      -৳
                      {booking.slots.length * ratePerHour - booking.totalPrice}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm pt-2 border-t-2 border-gray-900">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-gray-900">৳{booking.totalPrice}</span>
                </div>

                <div className="flex justify-between bg-gray-900 text-white p-3 rounded-lg print:bg-gray-800">
                  <span className="text-white">Amount Paid:</span>
                  <span className="text-xl">
                    ৳
                    {booking.paymentAmount === "confirmation"
                      ? Math.ceil(booking.totalPrice * 0.2)
                      : booking.totalPrice}
                  </span>
                </div>

                {booking.paymentAmount === "confirmation" && (
                  <div className="flex justify-between text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200 print:bg-gray-100">
                    <span className="text-gray-700">
                      Remaining Amount (due at venue):
                    </span>
                    <span className="text-gray-900">
                      ৳
                      {booking.totalPrice - Math.ceil(booking.totalPrice * 0.2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Special Notes */}
            {booking.notes && (
              <div className="mb-6">
                <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
                  Special Notes
                </p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg print:bg-gray-100">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="mb-6 text-xs text-gray-600">
              <p className="font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Important Instructions:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Please arrive at least 10 minutes before your scheduled time
                </li>
                <li>Bring a valid ID for verification at the venue</li>
                <li>
                  Cancellations must be made 24 hours in advance for a refund
                </li>
                <li>Show this booking code at the reception</li>
                <li>
                  For confirmation amount payments, remaining balance must be
                  paid at the venue
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t-2 border-dashed border-gray-300">
              <p className="mb-2">Thank you for choosing TurfBook!</p>
              <p className="mb-1">For any queries or support:</p>
              <p>Email: support@turfbook.com | Phone: +880 1234-567890</p>
              <p className="mt-2 text-gray-400">Visit us: www.turfbook.com</p>
            </div>

            {/* Action Buttons - Only show on screen */}
            <div className="grid grid-cols-2 gap-3 mt-6 print:hidden">
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Save as PDF
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-2"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
