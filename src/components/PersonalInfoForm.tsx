import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import { Tag, Sparkles, PartyPopper } from "lucide-react";

export type DiscountResponse = {
  id: string;
  discount_type: "percentage" | "numeric";
  discount_value: number;
  message: string;
};

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

  // Props from parent
  discountData: DiscountResponse | null;
  setDiscountData: (val: DiscountResponse | null) => void;
  discountedTotal: number;

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
  discountData,
  setDiscountData,
  discountedTotal,

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
  const isFormValid =
    isFullNameValid && isPhoneValid && isEmailValid && totalPrice !== 0;

  // Discount UI state
  const [isDiscountValid, setIsDiscountValid] = useState(false);
  const [loadingDiscount, setLoadingDiscount] = useState(false);

  // Validate discount via API with debounce
  useEffect(() => {
    if (!discountCode) {
      setDiscountData(null);
      setIsDiscountValid(false);
      return;
    }

    const Base_Url = "https://himsgwtkvewhxvmjapqa.supabase.co";

    const timeout = setTimeout(async () => {
      setLoadingDiscount(true);
      try {
        const res = await fetch(
          `${Base_Url}/rest/v1/rpc/validate_discount_code?p_code=${discountCode}`,
          {
            method: "GET",
            headers: {
              apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "",
              Authorization: `Bearer ${
                (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ""
              }`,
            },
          }
        );

        const data: DiscountResponse[] = await res.json();
        if (data.length > 0 && data[0].message === "VALID") {
          setDiscountData(data[0]);
          setIsDiscountValid(true);
        } else {
          setDiscountData(null);
          setIsDiscountValid(false);
        }
      } catch (err) {
        console.error("Discount validation error:", err);
        setDiscountData(null);
        setIsDiscountValid(false);
      } finally {
        setLoadingDiscount(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [discountCode, setDiscountData]);

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

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        {/* Players */}
        <div className="space-y-2">
          <Label htmlFor="players">Number of Players</Label>
          <Input
            id="players"
            value={players}
            onChange={(e) => setPlayers(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special notes?"
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
                className={`border-2 caret-black text-black placeholder:text-gray-500 ${
                  isDiscountValid ? "border-green-500 bg-green-50" : ""
                }`}
              />
              <AnimatePresence>
                {isDiscountValid && discountData && (
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

            {isDiscountValid && discountData && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Valid (
                  {discountData.discount_value}
                  {discountData.discount_type === "percentage" ? "%" : "৳"})
                </div>
              </motion.div>
            )}
          </div>

          {!isDiscountValid && discountCode && !loadingDiscount && (
            <p className="text-red-500 text-sm">Invalid discount code.</p>
          )}

          {isDiscountValid && discountData && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div className="flex flex-col gap-2">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <Sparkles className="w-3 h-3 inline-block" /> You have got{" "}
                  {discountData.discount_type === "percentage"
                    ? (discountData.discount_value * totalPrice) / 100
                    : discountData.discount_value}
                  ৳ discount.
                </div>
                <div className="bg-gray-900 text-gray-100 px-4 py-2 rounded-lg">
                  <Sparkles className="w-3 h-3 inline-block" /> Total after
                  discount: {Math.max(discountedTotal, 0)} ৳
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Payment Section */}
        <div className="space-y-4 pt-4 border-t-2 border-dashed">
          <h3 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Payment Details
          </h3>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val: string) => setPaymentMethod(val)}
            >
              <div className="grid grid-cols-1 gap-3">
                <div
                  className={`flex items-center justify-center p-4 rounded-xl border-2 ${
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
              </div>
            </RadioGroup>
          </div>

          {/* Payment Amount */}
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
                  className={`flex items-center justify-center p-4 rounded-xl border-2 ${
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
                  className={`flex items-center justify-center p-4 rounded-xl border-2 ${
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
                    Full Payment (৳{Math.max(discountedTotal, 0)})
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Submit Button */}
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
