import { User } from "../App";
import { Button } from "./ui/button";
import {
  Menu,
  User as UserIcon,
  Home,
  LogOut,
  Mail,
  Image,
  Search,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal } from "./AuthModal";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const BASE_URL = "https://himsgwtkvewhxvmjapqa.supabase.co";

type HeaderProps = {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
};

type Organization = {
  id: number;
  name: string;
  logo_url: string;
  description: string;
};

export function Header({ currentUser, onLogin, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [org, setOrg] = useState<Organization | null>(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { id: "home" as const, label: "Home", icon: Home },
    { id: "gallery" as const, label: "Gallery", icon: Image },
    { id: "check-booking" as const, label: "Track", icon: Search },
    { id: "contact" as const, label: "Contact", icon: Mail },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Fetch organization data
  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await fetch(`${BASE_URL}/rest/v1/rpc/get_organization`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrg(data[0]);
        }
      } catch (err) {
        console.error("Failed to load org info from API", err);
      }
    };

    fetchOrg();
  }, []);

  return (
    <div className="mx-auto w-full">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#0F5132] sticky top-0 z-50 "
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[2500px]">
          <div className="flex items-center justify-between h-24">
            {/* LOGO */}
            <motion.button
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                {org?.logo_url ? (
                  <motion.img
                    src={org.logo_url}
                    alt={org.name}
                    className="w-12 h-12 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                    whileHover={{ rotate: 5 }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F8FAFC]">
                  {org?.name || "Loading..."}
                </h1>
                <p className="text-[9px] text-[#F8FAFC] font-bold tracking-widest uppercase justify-start hidden md:flex">
                  Book • Play • Win
                </p>
              </div>
            </motion.button>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() =>
                      handleNavigate("/" + (item.id === "home" ? "" : item.id))
                    }
                    className={`
                      relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
                      ${
                        isActive(item.id === "home" ? "/" : "/" + item.id)
                          ? "text-white bg-white/10"
                          : "text-[#F8FAFC] hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    {isActive(item.id === "home" ? "/" : "/" + item.id) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/10 rounded-xl"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <item.icon className="w-4 h-4" strokeWidth={2.5} />
                      {item.label}
                    </span>
                  </button>
                </motion.div>
              ))}

              <div className="h-8 w-px bg-white/20 mx-2" />

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleNavigate("/profile")}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                      ${
                        isActive("/profile")
                          ? "bg-white/20 text-white shadow-lg"
                          : "text-[#F8FAFC] hover:bg-white/10"
                      }
                    `}
                  >
                    <UserIcon className="w-4 h-4" strokeWidth={2.5} />
                    {currentUser.name}
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      onLogout();
                      handleNavigate("/");
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <LogOut className="w-5 h-5" strokeWidth={2.5} />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px -10px rgba(255, 255, 255, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl shadow-md hover:bg-white/30 transition-all"
                >
                  Get Started
                </motion.button>
              )}
            </nav>

            {/* MOBILE MENU BUTTON */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-[#F8FAFC] hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Menu className="w-6 h-6" strokeWidth={2.5} />
                  </motion.button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-80 bg-[#0F5132] border-l border-white/10"
                >
                  <div
                    className="flex flex-col gap-2 mt-12"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {/* Organization info in mobile menu */}
                    {org && (
                      <motion.div
                        className="flex items-center gap-3 px-5 py-3 mb-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="w-10 h-10 rounded-lg object-cover ring-2 ring-white/20"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {org.name}
                          </h3>
                          <p className="text-xs text-white/70">
                            Book • Play • Win
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {navItems.map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          handleNavigate(
                            "/" + (item.id === "home" ? "" : item.id),
                          );
                          setMobileMenuOpen(false);
                        }}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
              flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-left transition-all
              ${
                isActive(item.id === "home" ? "/" : "/" + item.id)
                  ? "bg-white text-[#0F5132] shadow-lg"
                  : "text-white hover:bg-white/10 hover:shadow-md"
              }
            `}
                      >
                        <item.icon className="w-5 h-5" strokeWidth={2.5} />
                        {item.label}
                      </motion.button>
                    ))}

                    <div className="h-px bg-white/10 my-3" />

                    {currentUser ? (
                      <>
                        <motion.button
                          onClick={() => {
                            handleNavigate("/profile");
                            setMobileMenuOpen(false);
                          }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-white hover:bg-white/10 hover:shadow-md transition-all text-left"
                        >
                          <UserIcon className="w-5 h-5" strokeWidth={2.5} />
                          <div>
                            <p className="text-sm">Profile</p>
                            <p className="text-xs text-white/50">
                              {currentUser.name}
                            </p>
                          </div>
                        </motion.button>

                        <motion.button
                          onClick={() => {
                            onLogout();
                            handleNavigate("/");
                            setMobileMenuOpen(false);
                          }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-red-300 hover:bg-red-500/20 hover:text-red-200 hover:shadow-md transition-all"
                        >
                          <LogOut className="w-5 h-5" strokeWidth={2.5} />
                          Logout
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => {
                          setShowAuthModal(true);
                          setMobileMenuOpen(false);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mx-5 py-3.5 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl shadow-md hover:bg-white/30 hover:shadow-xl transition-all"
                      >
                        Get Started
                      </motion.button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={onLogin}
      />
    </div>
  );
}
