"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { User as AuthUser } from "../App";
import {
  Tag,
  User,
  Phone,
  Mail,
  Users,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Coins,
  Sparkles,
} from "lucide-react";

export type DiscountResponse = {
  id: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  message: string;
};

type PersonalInfoFormProps = {
  currentUser: AuthUser | null;
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

  // Synchronized States with Parent
  usablePoints?: number;
  pointsExchangeRate?: number;
  usePoints: boolean;
  setUsePoints: (val: boolean) => void;
  onApplyPointsDiscount?: (
    pointsApplied: number,
    cashDiscountValue: number,
  ) => void;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  minTotalForDepositOption?: number;

  // Controlled points properties from parent context
  pointsToRedeem: number;
  pointsDiscountValue: number;
  setPointsToRedeem: React.Dispatch<React.SetStateAction<number>>;
  setPointsDiscountValue: React.Dispatch<React.SetStateAction<number>>;
};

export function PersonalInfoForm({
  currentUser,
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
  usablePoints = 0,
  pointsExchangeRate = 1,
  usePoints,
  setUsePoints,
  onApplyPointsDiscount,
  supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL ||
    "https://himsgwtkvewhxvmjapqa.supabase.co",
  supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "",
  minTotalForDepositOption = 500,
  pointsToRedeem,
  pointsDiscountValue,
  setPointsToRedeem,
  setPointsDiscountValue,
}: PersonalInfoFormProps) {
  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [isDiscountValid, setIsDiscountValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );

  const isLoggedIn = !!currentUser;

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Sync logged in user profile data automatically
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      if (currentUser.email) {
        setEmail(currentUser.email);
      }
    } else {
      setFullName("");
      setPhone("");
      setEmail("");
      setUsePoints(false);
      setPointsToRedeem(0);
    }
  }, [
    currentUser,
    setFullName,
    setPhone,
    setEmail,
    setUsePoints,
    setPointsToRedeem,
  ]);

  // Handle numerical input updates for manual reward balance typing
  const handlePointsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value.replace(/^0+/, ""); // Strip leading zeros
    if (valueStr === "") {
      setPointsToRedeem(0);
      setPointsDiscountValue(0);
      return;
    }

    const parsedPoints = parseInt(valueStr, 10);
    if (isNaN(parsedPoints) || parsedPoints < 0) return;

    // Cap input points at total user balance constraint
    let verifiedPoints = Math.min(parsedPoints, usablePoints);

    // Calculate maximum points needed to make the remaining balance exactly zero
    const maxPointsNeeded = Math.ceil(discountedTotal / pointsExchangeRate);
    if (verifiedPoints > maxPointsNeeded) {
      verifiedPoints = maxPointsNeeded;
    }

    setPointsToRedeem(verifiedPoints);
    setPointsDiscountValue(verifiedPoints * pointsExchangeRate);
  };

  // Turn off points calculations smoothly if master toggle turns off
  const handleToggleChange = (checked: boolean) => {
    setUsePoints(checked);
    if (!checked) {
      setPointsToRedeem(0);
      setPointsDiscountValue(0);
    }
  };

  const finalPayableTotal = useMemo(() => {
    return Math.max(discountedTotal - pointsDiscountValue, 0);
  }, [discountedTotal, pointsDiscountValue]);

  const calculatedPromoDiscountValue = useMemo(() => {
    if (!discountData) return 0;
    return discountData.discount_type === "percentage"
      ? (discountData.discount_value * totalPrice) / 100
      : discountData.discount_value;
  }, [discountData, totalPrice]);

  const onApplyPointsDiscountRef = useRef(onApplyPointsDiscount);
  useEffect(() => {
    onApplyPointsDiscountRef.current = onApplyPointsDiscount;
  }, [onApplyPointsDiscount]);

  useEffect(() => {
    if (onApplyPointsDiscountRef.current) {
      onApplyPointsDiscountRef.current(
        usePoints ? pointsToRedeem : 0,
        usePoints ? pointsDiscountValue : 0,
      );
    }
  }, [usePoints, pointsToRedeem, pointsDiscountValue]);

  // Field Validations
  const isFullNameValid = /^[A-Za-z\s.]{3,}$/.test(fullName);
  const isPhoneValid = /^(?:\+88)?01\d{9}$/.test(phone);
  const isEmailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid =
    isFullNameValid &&
    isPhoneValid &&
    isEmailValid &&
    totalPrice !== 0 &&
    paymentMethod !== "";

  const missingFields = [
    !isFullNameValid && touchedFields.fullName && "Full name (min 3 letters)",
    !isPhoneValid &&
      touchedFields.phone &&
      "Phone number (11 digits or 14 digits starting with +88)",
    paymentMethod === "" &&
      touchedFields.paymentMethod &&
      "Payment method selection required",
    totalPrice === 0 && "A time slot must be selected",
  ].filter(Boolean) as string[];

  const completionPercentage = useMemo(() => {
    const fields = [isFullNameValid, isPhoneValid, paymentMethod !== ""];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [isFullNameValid, isPhoneValid, paymentMethod]);

  // Dynamic Discount Validation via Debounce Loop
  useEffect(() => {
    if (!discountCode) {
      setDiscountData(null);
      setIsDiscountValid(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoadingDiscount(true);
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/rpc/validate_discount_code?p_code=${discountCode}`,
          {
            method: "GET",
            signal: controller.signal,
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
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
        if ((err as Error).name !== "AbortError") {
          setIsDiscountValid(false);
        }
      } finally {
        setLoadingDiscount(false);
      }
    }, 600);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [discountCode, setDiscountData, supabaseUrl, supabaseAnonKey]);

  const plans = useMemo(() => {
    return [
      {
        id: "confirmation",
        title: "Security Deposit",
        amount: confirmationAmount,
        icon: ShieldCheck,
        desc: "Pay minimum to lock down field booking slot",
      },
      {
        id: "full",
        title: "Full Payment",
        amount: finalPayableTotal,
        icon: CreditCard,
        desc: "Clear total statement outstanding now",
      },
    ].filter((plan) => {
      if (plan.id === "confirmation") {
        return finalPayableTotal > minTotalForDepositOption;
      }
      return true;
    });
  }, [confirmationAmount, finalPayableTotal, minTotalForDepositOption]);

  return (
    <motion.div
      ref={personalInfoRef}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="scroll-mt-20 max-w-screen-md mx-auto w-full md:px-4"
    >
      <div className="bg-white rounded-lg drop-shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50/80 p-6 border-b flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              Personal Details
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              {isLoggedIn
                ? "Your information has been synced from your profile."
                : "Almost there! Just a few more bits of info."}
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
                transition={{ duration: 0.6, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-green-900">
              {completionPercentage}%
            </div>
          </div>
        </div>

        <form onSubmit={handleShowSummary} className="p-8 space-y-8">
          {isLoggedIn && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold">
              🎉 Authenticated User: {currentUser?.name}. Details loaded
              automatically.
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
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
                onBlur={() => handleBlur("fullName")}
                placeholder="Ex: John Doe"
                disabled={isLoggedIn}
                className={`rounded-xl border-2 text-black disabled:bg-gray-50 disabled:text-gray-500 focus-visible:ring-green-500 ${
                  touchedFields.fullName && !isFullNameValid
                    ? "border-rose-400 focus-visible:ring-rose-400"
                    : "border-gray-200"
                }`}
              />
            </div>

            {/* Phone Input */}
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
                onBlur={() => handleBlur("phone")}
                placeholder="01XXXXXXXXX"
                disabled={isLoggedIn}
                className={`rounded-xl border-2 text-black disabled:bg-gray-50 disabled:text-gray-500 focus-visible:ring-green-500 ${
                  touchedFields.phone && !isPhoneValid
                    ? "border-rose-400 focus-visible:ring-rose-400"
                    : "border-gray-200"
                }`}
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-600 font-bold">
                <Mail className="w-4 h-4" /> Email (Optional)
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="hello@example.com"
                disabled={isLoggedIn && !!currentUser?.email}
                className={`rounded-xl border-2 text-black disabled:bg-gray-50 disabled:text-gray-500 focus-visible:ring-green-500 ${
                  touchedFields.email && !isEmailValid
                    ? "border-rose-400 focus-visible:ring-rose-400"
                    : "border-gray-200"
                }`}
              />
            </div>

            {/* Players Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-600 font-bold">
                <Users className="w-4 h-4" /> Player Count
              </Label>
              <Input
                value={players}
                onChange={(e) => setPlayers(e.target.value)}
                placeholder="How many people?"
                className="rounded-xl border-2 text-black focus-visible:ring-green-500 border-gray-200"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-600 font-bold">
              <MessageSquare className="w-4 h-4" /> Special Note
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us anything we should know..."
              className="rounded-xl border-2 min-h-[100px] text-black focus-visible:ring-green-500 border-gray-200"
            />
          </div>

          {/* Numerical Input Loyalty Engine Panel */}
          <AnimatePresence>
            {isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50/60 p-5 rounded-2xl border-2 border-emerald-100 flex flex-col space-y-4 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-500 rounded-xl text-white mt-0.5">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-900 flex items-center gap-1.5">
                        Redeem Member Points
                      </h4>
                      <p className="text-xs text-emerald-700/80 mt-0.5 font-medium">
                        Available:{" "}
                        <span className="font-bold text-emerald-800">
                          {usablePoints}
                        </span>{" "}
                        points
                        {usablePoints > 0 &&
                          ` (Worth ৳${usablePoints * pointsExchangeRate})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-emerald-200/60 self-start sm:self-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Apply Points
                    </span>
                    <Switch
                      checked={usePoints}
                      disabled={usablePoints <= 0}
                      onCheckedChange={handleToggleChange}
                      className="bg-gray-200 border border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-700"
                    />
                  </div>
                </div>

                {/* Smooth Expansion of the Numeric Typing Input Field */}
                <AnimatePresence>
                  {usePoints && usablePoints > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="pt-3 border-t border-emerald-200/40 space-y-2 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <Label
                          htmlFor="pointsInput"
                          className="text-xs font-bold text-emerald-900"
                        >
                          Enter points amount to use:
                        </Label>
                        {pointsToRedeem > 0 && (
                          <span className="text-xs text-emerald-700 font-medium">
                            Using {pointsToRedeem} points ={" "}
                            <span className="font-bold">
                              ৳{pointsDiscountValue} Discount
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="relative max-w-xs">
                        <Input
                          id="pointsInput"
                          type="number"
                          min="0"
                          max={usablePoints}
                          value={pointsToRedeem || ""}
                          onChange={handlePointsInputChange}
                          placeholder="e.g. 50"
                          className="rounded-xl border-2 border-emerald-200 bg-white text-black font-semibold focus-visible:ring-emerald-500 pr-16"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 pointer-events-none">
                          / {usablePoints}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Promo Code Code Block */}
          <div className="bg-indigo-50/50 p-6 rounded-2xl border-2 border-dashed border-indigo-200 space-y-4">
            <Label className="flex items-center gap-2 text-gray-700 font-black">
              <Tag className="w-5 h-5" /> Promo Code
            </Label>
            <div className="relative">
              <Input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder={
                  loadingDiscount ? "Verifying..." : "Enter code here..."
                }
                className={`rounded-xl border-2 pr-12 transition-all bg-white text-black text-base tracking-wide ${
                  isDiscountValid
                    ? "ring-2 ring-green-500 border-green-500"
                    : "border-gray-200"
                }`}
              />
            </div>
            <AnimatePresence>
              {isDiscountValid && discountData && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-green-900 text-white p-4 rounded-xl shadow-lg flex justify-between items-center overflow-hidden"
                >
                  <span className="font-bold">Code Applied!</span>
                  <span className="font-bold text-lg">
                    -৳{calculatedPromoDiscountValue}
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

            <div className="space-y-2">
              <Label className="font-bold text-gray-600">
                Payment Method *
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(val) => {
                  setPaymentMethod(val);
                  handleBlur("paymentMethod");
                }}
              >
                <div className="grid grid-cols-1">
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

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-gray-600">Select Plan *</Label>
                {usePoints && pointsDiscountValue > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Points Applied: -৳
                    {pointsDiscountValue}
                  </span>
                )}
              </div>
              <RadioGroup
                value={paymentAmount}
                onValueChange={(val) => setPaymentAmount(val as any)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`relative group cursor-pointer flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 ${
                        paymentAmount === plan.id
                          ? "border-green-600 bg-green-50/50 ring-4 ring-green-50 scale-[1.02]"
                          : "border-gray-100 hover:border-gray-300 bg-white"
                      }`}
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
                        =
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

          {/* Error Message Displayer */}
          {!isFormValid && missingFields.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 space-y-2"
            >
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                To continue, please complete:
              </p>
              {missingFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  {field}
                </div>
              ))}
            </motion.div>
          )}

          {/* Action Trigger Button */}
          <motion.div
            whileHover={isFormValid ? { scale: 1.01 } : {}}
            whileTap={isFormValid ? { scale: 0.99 } : {}}
            className="pt-4"
          >
            <Button
              type="submit"
              disabled={!isFormValid}
              className={`relative overflow-hidden w-full py-8 rounded-2xl text-xl font-black shadow-md transition-all duration-300 ${
                isFormValid
                  ? "bg-green-900 text-white opacity-100 cursor-pointer"
                  : "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
              }`}
            >
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
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                    skewX: "-25deg",
                  }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center gap-3 text-base md:text-2xl tracking-wide font-black">
                {isFormValid ? "REVIEW MY BOOKING" : "PLEASE COMPLETE FORM"}
              </div>
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
