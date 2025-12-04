import { motion, AnimatePresence } from "motion/react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import { Tag, Sparkles, PartyPopper } from "lucide-react";

type PersonalInfoFormProps = {
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  players: string;
  setPlayers: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  discountCode: string;
  setDiscountCode: (val: string) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  paymentAmount: "confirmation" | "full";
  setPaymentAmount: (val: "confirmation" | "full") => void;
  confirmationAmount: number;
  totalPrice: number;
  handleShowSummary: (e: React.FormEvent) => void;
  personalInfoRef: React.RefObject<HTMLDivElement | null>;
};

export function PersonalInfoForm({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  players,
  setPlayers,
  notes,
  setNotes,
  discountCode,
  setDiscountCode,
  paymentMethod,
  setPaymentMethod,
  paymentAmount,
  setPaymentAmount,
  confirmationAmount,
  totalPrice,
  handleShowSummary,
  personalInfoRef,
}: PersonalInfoFormProps) {
  // Form validation
  const isFullNameValid = /^[A-Za-z\s]+$/.test(fullName);
  const isPhoneValid = /^01\d{9}$/.test(phone);
  const isEmailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isFullNameValid && isPhoneValid && isEmailValid;

  return (
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
                const val = e.target.value;
                if (/^[A-Za-z\s]*$/.test(val)) setFullName(val);
              }}
              required
              className="border-2 text-black placeholder:text-gray-500 focus:border-indigo-500 focus:caret-black"
            />
            {fullName && !isFullNameValid && (
              <p className="text-red-500 text-sm">Only letters are allowed.</p>
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
              <p className="text-red-500 text-sm">Invalid email format.</p>
            )}
          </div>

          {/* Players */}
          <div className="space-y-2">
            <Label htmlFor="players">Number of Players (Optional)</Label>
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

        {/* Discount Code */}
        <div className="space-y-2">
          <Label htmlFor="discount" className="flex items-center gap-2">
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
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className={
                  discountCode === "FIRST10" || discountCode === "SAVE20"
                    ? "border-2 border-green-500 bg-green-50"
                    : "border-2 caret-black text-black placeholder:text-gray-500"
                }
              />
              <AnimatePresence>
                {(discountCode === "FIRST10" || discountCode === "SAVE20") && (
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
            {(discountCode === "FIRST10" || discountCode === "SAVE20") && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Valid
                </div>
              </motion.div>
            )}
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Try: FIRST10 or SAVE20
          </p>
        </div>

        {/* Payment Section */}
        <div className="space-y-4 pt-4 border-t-2 border-dashed">
          <h3 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Payment Details
          </h3>

          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="grid grid-cols-3 gap-3">
                {["bkash", "nagad", "rocket"].map((method) => (
                  <div
                    key={method}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem
                      value={method}
                      id={method}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={method}
                      className="cursor-pointer w-full text-center"
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Label>
                  </div>
                ))}
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
                  <RadioGroupItem value="full" id="full" className="sr-only" />
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

        {/* Submit */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-6 shadow-lg text-white ${
              isFormValid
                ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                : "bg-gray-400"
            }`}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Review Booking
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
