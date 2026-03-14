import { useState } from "react";
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "./ui/dialog";
import { User } from "../App";

const AUTH_URL = "https://himsgwtkvewhxvmjapqa.supabase.co/auth/v1";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
};

type Mode = "login" | "signup";

export function AuthModal({ open, onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const resetForm = () => {
    setLoginEmail("");
    setLoginPassword("");
    setSignupEmail("");
    setSignupPassword("");
    setFullName("");
    setPhoneNumber("");
    setDateOfBirth("");
    setShowPassword(false);
  };

  const switchMode = (newMode: Mode) => {
    resetForm();
    setMode(newMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Login error:", JSON.stringify(data, null, 2));
        toast.error(
          data.error_description ||
            data.message ||
            `Login failed (${res.status})`,
        );
        return;
      }

      localStorage.setItem("sb-access-token", data.access_token);
      localStorage.setItem("sb-user", JSON.stringify(data.user));

      const user: User = {
        id: data.user.id,
        name:
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "User",
        email: data.user.email,
        phone: data.user.user_metadata?.phone_number || "",
      };

      toast.success(`Welcome back, ${user.name}!`);
      onLogin(user);
      onClose();
      resetForm();
    } catch (err) {
      console.error("Login network error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email: signupEmail,
      password: signupPassword,
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
      },
    };

    console.log("Signup payload:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch(`${AUTH_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Log full error so we can diagnose the 500
        console.error("Signup error response:", JSON.stringify(data, null, 2));
        toast.error(
          data.msg ||
            data.error_description ||
            data.message ||
            data.error ||
            `Signup failed (${res.status})`,
        );
        return;
      }

      console.log("Signup success:", JSON.stringify(data, null, 2));

      if (data.access_token) {
        // Auto-login (email confirmation disabled in Supabase)
        localStorage.setItem("sb-access-token", data.access_token);
        localStorage.setItem("sb-user", JSON.stringify(data.user));

        const user: User = {
          id: data.user.id,
          name: fullName || data.user.email?.split("@")[0] || "User",
          email: data.user.email,
          phone: phoneNumber || "",
        };

        toast.success(`Welcome, ${user.name}! Account created.`);
        onLogin(user);
        onClose();
        resetForm();
      } else {
        // Email confirmation required
        toast.success("Account created! Please check your email to confirm.");
        switchMode("login");
      }
    } catch (err) {
      console.error("Signup network error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white">
        {/* Top green header strip */}
        <div className="bg-[#0F5132] px-8 pt-8 pb-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              {mode === "login" ? (
                <LogIn className="w-5 h-5 text-white" />
              ) : (
                <UserPlus className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p
                className="text-white/60 text-xs"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {mode === "login"
                  ? "Sign in to book your turf"
                  : "Join us and start booking"}
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mt-4 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "login"
                  ? "bg-white text-[#0F5132] shadow"
                  : "text-white/70 hover:text-white"
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "signup"
                  ? "bg-white text-[#0F5132] shadow"
                  : "text-white/70 hover:text-white"
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form body */}
        <div
          className="px-8 py-6"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F5132]/30 focus:border-[#0F5132] outline-none transition"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F5132]/30 focus:border-[#0F5132] outline-none transition"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F5132] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0d4429] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F5132]/30 focus:border-[#0F5132] outline-none transition"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F5132]/30 focus:border-[#0F5132] outline-none transition"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F5132]/30 focus:border-[#0F5132] outline-none transition"
                    placeholder="+8801XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Date of Birth
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F5132]/30 focus:border-[#0F5132] outline-none transition"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F5132]/30 focus:border-[#0F5132] outline-none transition"
                    placeholder="Min. 8 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F5132] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0d4429] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
