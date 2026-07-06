import { useState, useEffect } from "react";
import { LogIn, X } from "lucide-react";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { User } from "../App";

const AUTH_URL = "https://himsgwtkvewhxvmjapqa.supabase.co/auth/v1";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
};

export function AuthModal({ open, onClose, onLogin }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  // 1. Listen for the token message sent from the popup window or handle it if this IS the popup
  useEffect(() => {
    // SCENARIO A: If this script runs INSIDE the tiny popup window, capture hash and pass it back
    const hash = window.location.hash;
    if (hash && window.opener) {
      window.opener.postMessage({ type: "SUPABASE_AUTH_HASH", hash }, window.location.origin);
      window.close(); // Instantly close the popup window
      return;
    }

    // SCENARIO B: This runs in your MAIN app window. Listen for incoming popup messages.
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "SUPABASE_AUTH_HASH") return;

      const popupHash = event.data.hash;
      const params = new URLSearchParams(popupHash.replace("#", "?"));
      const accessToken = params.get("access_token");
      const errorDescription = params.get("error_description");

      if (errorDescription) {
        toast.error(errorDescription.replace(/\+/g, " "));
        return;
      }

      if (accessToken) {
        setLoading(true);

        // Fetch user data using the access token captured from the popup
        fetch(`${AUTH_URL}/user`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        })
          .then((res) => res.json())
          .then((userData) => {
            if (userData.id) {
              localStorage.setItem("sb-access-token", accessToken);
              localStorage.setItem("sb-user", JSON.stringify(userData));

              const user: User = {
                id: userData.id,
                name: userData.user_metadata?.full_name || userData.email?.split("@")[0] || "User",
                email: userData.email,
                phone: userData.user_metadata?.phone_number || "",
              };

              toast.success(`Welcome, ${user.name}!`);
              onLogin(user);
              onClose();
            }
          })
          .catch((err) => {
            console.error("User fetch error:", err);
            toast.error("Failed to retrieve user data.");
          })
          .finally(() => setLoading(false));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLogin, onClose]);

  // 2. Trigger the small popup centered window
  const handleGoogleLogin = () => {
    setLoading(true);
    
    const redirectTo = encodeURIComponent(window.location.origin);
    const googleAuthUrl = `${AUTH_URL}/authorize?provider=google&redirect_to=${redirectTo}&prompt=select_account`;
    
    // Size and positioning calculations to center the popup on your monitor screen
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      googleAuthUrl,
      "GoogleAuthPopup",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    );

    // Reset loading state if the user manually closes the popup window without completing auth
    if (popup) {
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setLoading(false);
        }
      }, 1000);
    } else {
      setLoading(false);
      toast.error("Popup blocked! Please allow popups for this website.");
    }
  };

  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-[#0F5132]" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <DialogPrimitive.Title className="sr-only">
            Sign In with Google
          </DialogPrimitive.Title>

          <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl bg-white">
            {/* Header strip */}
            <div className="bg-[#0F5132] px-8 pt-8 pb-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Welcome to Turf Booking
                  </h2>
                  <p className="text-white/60 text-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Sign in with Google to manage your bookings instantly
                  </p>
                </div>
              </div>
            </div>

            {/* Main Action Area */}
            <div className="px-8 py-10 flex flex-col items-center justify-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3.5 px-4 rounded-xl font-bold text-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.93 5.93 0 0 1 8 12.597a5.93 5.93 0 0 1 5.99-5.918c1.614 0 3.08.618 4.192 1.623l3.221-3.22A10.83 10.83 0 0 0 13.99 2c-5.955 0-10.784 4.743-10.784 10.597 0 5.854 4.83 10.597 10.785 10.597 6.13 0 10.542-4.223 10.542-10.514 0-.825-.098-1.512-.294-2.385H12.24Z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-6">
                By clicking continue, you agree to secure account profiles generated automatically via Google.
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}