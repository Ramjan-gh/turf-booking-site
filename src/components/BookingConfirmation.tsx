import { CheckCircle, Download, Printer } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";

export function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;
  const discountedTotal =
    location.state?.discountedTotal ?? booking?.totalPrice ?? 0;
  const totalPrice = location.state?.totalPrice;
  const confirmationAmount:number = location.state?.confirmationAmount;
  const sportIcon = location.state?.sportIcon ?? " ";
  const sportName = location.state?.sportName ?? " ";

  if (!booking) return <p>No booking found.</p>;

  // Calculate total duration once
  const totalHours = booking.slots
    .map((slot: any) => {
      const start = new Date(`1970-01-01T${slot.start_time}`);
      const end = new Date(`1970-01-01T${slot.end_time}`);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    })
    .reduce((acc: number, cur: number) => acc + cur, 0);

  const handlePrint = () => window.print();
  const handleDownload = () => window.print(); // Save as PDF via print dialog

  return (
    <div className="z-50 flex justify-center p-4 flex-col items-center">
      <h1 className="text-6xl font-bold m-10 p-10 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent text-center print:hidden">
        Booking Successful
      </h1>

      <div className="bg-white shadow-2xl shadow-purple-500/30 rounded-lg w-full md:w-auto no-scrollbar print-area">
        <div className="p-8 print:p-12">
          {/* Success Header */}
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 print:p-2 text-center border-2 mb-6 print:scale-75">
            <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">
              Booking Code
            </p>
            <p className="md:text-3xl text-blue-600 tracking-wider mb-2 print:text-gray-900">
              {booking.code}
            </p>
            <p className="text-xs text-gray-500">
              Keep this code for tracking and verification
            </p>
          </div>

          {/* Booking Date */}
          <div className="text-center py-3 border-b-2 border-dashed border-gray-300 mb-6">
            <p className="text-xs text-gray-500 mb-1">Booking Created On</p>
            <p className="text-sm text-gray-900">
              {format(
                new Date(booking.createdAt),
                "EEEE, MMMM d, yyyy - hh:mm a"
              )}
            </p>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
              Customer Information
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex gap-1">
                <span className="text-gray-600">Name:</span>
                <span className="text-gray-900">{booking.fullName}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-gray-600">Phone:</span>
                <span className="text-gray-900">{booking.phone}</span>
              </div>
              {booking.email && (
                <div className="flex gap-1">
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
                <span className="text-gray-900 flex items-center gap-2">
                  <img src={sportIcon} alt="" className="w-[16px]" />
                  {sportName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900">
                  {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>

              {/* time slots */}

              {/* <div className="flex justify-between">
                <span className="text-gray-600">Time Slots:</span>
                <span className="text-gray-900">
                  {booking.slots
                    .map((slot: any) => {
                      const start = new Date(`1970-01-01T${slot.start_time}`);
                      const end = new Date(`1970-01-01T${slot.end_time}`);
                      return `${format(start, "hh:mm a")} - ${format(
                        end,
                        "hh:mm a"
                      )}`;
                    })
                    .join(", ")}
                </span>
              </div> */}

              {/* duration  */}

              {/* <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="text-gray-900">
                  {booking.slots.length} slot
                  {booking.slots.length > 1 ? "s" : ""} ({totalHours.toFixed(2)}{" "}
                  hrs total)
                </span>
              </div> */}
              {booking.players && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Players:</span>
                  <span className="text-gray-900">{booking.players}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Price Breakdown */}
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wide text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
              Price Breakdown
            </p>
            <div className="flex justify-between text-sm ">
              <span className="text-gray-600 border-b border-dashed">
                Slots
              </span>
              <span className="text-gray-900 border-b border-dashed">
                Price
              </span>
            </div>
            <div className="">
              {booking.slots.map((slot: any) => {
                const start = new Date(`1970-01-01T${slot.start_time}`);
                const end = new Date(`1970-01-01T${slot.end_time}`);
                return (
                  <div
                    key={slot.slot_id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {format(start, "hh:mm a")} - {format(end, "hh:mm a")}
                    </span>
                    <span className="text-gray-900">৳{slot.price}</span>
                  </div>
                );
              })}

              <div className="flex justify-between text-sm border-t border-dashed pt-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900">৳{totalPrice}</span>
              </div>

              {booking.discountCode && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({booking.discountCode}):</span>
                  <span>৳{discountedTotal}</span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-2 border-t-2 border-gray-900">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-gray-900">৳{discountedTotal}</span>
              </div>

              <div className="flex justify-between bg-gray-900 text-white p-3 rounded-lg print:bg-gray-800 my-2">
                <span className="text-white">Amount Paid:</span>
                <span className="text-xl">
                  ৳
                  {booking.paymentAmount === "confirmation"
                    ? "500"
                    : discountedTotal}
                </span>
              </div>

              {booking.paymentAmount === "confirmation" && (
                <div className="flex justify-between text-xs bg-yellow-50 p-3 rounded-lg border border-yellow-200 print:bg-gray-100">
                  <span className="text-gray-700">
                    Remaining Amount (due at venue):
                  </span>
                  <span className="text-gray-900">
                    ৳
                    {booking.paymentAmount === "confirmation"
                      ? discountedTotal - confirmationAmount
                      : 0}
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
              <li>
                Cancellations must be made 24 hours in advance for a refund
              </li>
              <li>Keep your booking code for reference</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t-2 border-dashed border-gray-300">
            <p className="mb-2">Thank you for choosing TurfBook!</p>
            <p className="mb-1">For any queries or support:</p>
            <p>Email: support@turfbook.com | Phone: +880 1234-567890</p>
            <p className="mt-2 text-gray-400">Visit us: www.turfbook.com</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 print:hidden">
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105"
            >
              <Download className="w-4 h-4 md:mr-2" />
              Save as PDF
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-2"
            >
              <Printer className="w-4 h-4 md:mr-2" />
              Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
