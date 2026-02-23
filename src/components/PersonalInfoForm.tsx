"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import {
  Tag,
  Sparkles,
  PartyPopper,
  User,
  Phone,
  Mail,
  Users,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export type DiscountResponse = {
  id: string;
  discount_type: "percentage" | "fixed";
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
  // 1. Interactive Validations
  const isFullNameValid = /^[A-Za-z\s]{3,}$/.test(fullName);
  const isPhoneValid = /^01\d{9}$/.test(phone);
  const isEmailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid =
    isFullNameValid &&
    isPhoneValid &&
    isEmailValid &&
    totalPrice !== 0 &&
    paymentMethod !== "";

  // 2. Progress Percentage Calculation
  const completionPercentage = useMemo(() => {
    const fields = [isFullNameValid, isPhoneValid, paymentMethod !== ""];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [isFullNameValid, isPhoneValid, paymentMethod]);

  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [isDiscountValid, setIsDiscountValid] = useState(false);

  // 3. Discount Debounce Logic
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
          },
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
        setIsDiscountValid(false);
      } finally {
        setLoadingDiscount(false);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [discountCode, setDiscountData]);

  return (
    <motion.div
      ref={personalInfoRef}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="scroll-mt-20 max-w-screen-md mx-auto w-full px-4"
    >
      <div className="bg-white rounded-lg drop-shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with Progress Ring */}
        <div className="bg-gray-50/80 p-6 border-b flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              Personal Details
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Almost there! Just a few more bits of info.
            </p>
          </div>

          <div className="relative h-16 w-16">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-gray-200"
                strokeWidth="4"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-green-600"
                strokeWidth="4"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - completionPercentage }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-green-900">
              {completionPercentage}%
            </div>
          </div>
        </div>

        <form onSubmit={handleShowSummary} className="p-8 space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2 text-gray-600 font-bold">
                  <User className="w-4 h-4" /> Full Name *
                </Label>
                {isFullNameValid && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </motion.div>
                )}
              </div>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: John Doe"
                className="rounded-xl border-2 focus:ring-4 focus:ring-indigo-50 transition-all text-black"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2 text-gray-600 font-bold">
                  <Phone className="w-4 h-4" /> Phone Number *
                </Label>
                {isPhoneValid && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </motion.div>
                )}
              </div>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="rounded-xl border-2 transition-all text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-600 font-bold">
                <Mail className="w-4 h-4" /> Email (Optional)
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="rounded-xl border-2 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-600 font-bold">
                <Users className="w-4 h-4" /> Player Count
              </Label>
              <Input
                value={players}
                onChange={(e) => setPlayers(e.target.value)}
                placeholder="How many people?"
                className="rounded-xl border-2 text-black"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-600 font-bold">
              <MessageSquare className="w-4 h-4" /> Special Note
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us anything we should know..."
              className="rounded-xl border-2 min-h-[100px] text-black"
            />
          </div>

          {/* Discount Section */}
          <div className="bg-indigo-50/50 p-6 rounded-2xl border-2 border-dashed border-indigo-200 space-y-4">
            <Label className="flex items-center gap-2 text-gray-700 font-black">
              <Tag className="w-5 h-5" /> Promo Code
            </Label>
            <div className="relative">
              <Input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter code here..."
                className={`rounded-xl border-2 pr-12 transition-all bg-white text-black ${
                  isDiscountValid ? "ring-4 ring-green-500" : ""
                }`}
              />
            </div>

            <AnimatePresence>
              {isDiscountValid && discountData && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-green-900 text-white p-4 rounded-xl shadow-lg flex justify-between items-center"
                >
                  <div className="flex items-center font-bold">
                    <span>Code Applied!</span>
                  </div>
                  <span className="font-bold text-lg">
                    -৳
                    {discountData.discount_type === "percentage"
                      ? (discountData.discount_value * totalPrice) / 100
                      : discountData.discount_value}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Section */}
          <div className="space-y-6 pt-4 border-t-2 border-dashed">
            <h3 className="text-xl font-black text-gray-800">
              Payment Details
            </h3>

            {/* Payment Method - From your previous code */}
            <div className="space-y-2">
              <Label className="font-bold text-gray-600">
                Payment Method *
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(val: string) => setPaymentMethod(val)}
              >
                <div className="grid grid-cols-1 gap-3">
                  <div
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "bkash"
                        ? "border-pink-500 bg-pink-50 ring-4 ring-pink-50"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <RadioGroupItem
                      value="bkash"
                      id="bkash"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="bkash"
                      className="cursor-pointer text-center w-full font-black text-lg text-pink-600"
                    >
                      bKash
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Amount Plan */}
            <div className="space-y-3">
              <Label className="font-bold text-gray-600">Select Plan *</Label>
              <RadioGroup
                value={paymentAmount}
                onValueChange={(val) => setPaymentAmount(val as any)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: "confirmation",
                      title: "Security Deposit",
                      amount: confirmationAmount,
                      icon: ShieldCheck,
                      desc: "Pay minimum to book",
                    },
                    {
                      id: "full",
                      title: "Full Payment",
                      amount: Math.max(discountedTotal, 0),
                      icon: CreditCard,
                      desc: "Pay everything now",
                    },
                  ].map((plan) => (
                    <label
                      key={plan.id}
                      className={`
                        relative group cursor-pointer flex flex-col p-5 rounded-2xl border-2 transition-all duration-300
                        ${
                          paymentAmount === plan.id
                            ? "border-green-600 bg-green-50/50 ring-4 ring-green-50 scale-[1.02]"
                            : "border-gray-100 hover:border-gray-300 bg-white"
                        }
                      `}
                    >
                      <RadioGroupItem value={plan.id} className="sr-only" />
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`p-2 rounded-lg ${
                            paymentAmount === plan.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <plan.icon className="w-5 h-5" />
                        </div>
                        {paymentAmount === plan.id && (
                          <motion.div
                            layoutId="payment-active"
                            className="bg-green-600 h-2 w-2 rounded-full"
                          />
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          paymentAmount === plan.id
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {plan.title}
                      </span>
                      <span className="text-2xl font-black text-gray-900 mt-1">
                        ৳{plan.amount}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2 font-medium">
                        {plan.desc}
                      </p>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Submit Button with Shimmer Effect */}
          <motion.div
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
            className="pt-4"
          >
            <Button
              type="submit"
              disabled={!isFormValid}
              className={`
                relative overflow-hidden w-full py-8 rounded-2xl text-xl font-black shadow-md transition-all duration-500
                ${
                  isFormValid
                    ? "bg-green-900 text-white opacity-100"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                }
              `}
            >
              {/* The Shimmer Effect Layer */}
              {isFormValid && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                    repeatDelay: 1,
                  }}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    skewX: "-25deg",
                  }}
                />
              )}

              {/* Content Layer (z-10 ensures text stays above shimmer) */}
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isFormValid ? "REVIEW MY BOOKING" : "PLEASE COMPLETE FORM"}
              </div>
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
