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
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

type HeaderProps = {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
};

export function Header({ currentUser, onLogin, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#0F5132] sticky top-0 z-50"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* LOGO */}
            <motion.button
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-2xl blur-sm opacity-60"
                />
                <span className="text-xl">⚽</span>
              </div>
              <div>
                <h1 className="text-2xl font-sans-bold font-bold tracking-tight bg-[#F8FAFC] bg-clip-text text-transparent">
                  TurfBook
                </h1>
                <p className="text-[9px] text-[#F8FAFC] font-bold tracking-widest uppercase">
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
                      relative px-10 py-7  font-bold text-sm transition-all duration-300
                      ${
                        isActive(item.id === "home" ? "/" : "/" + item.id)
                          ? "text-white"
                          : "text-[#F8FAFC] hover:text-[#D1D5DB]"
                      }
                    `}
                  >
                    {isActive(item.id === "home" ? "/" : "/" + item.id) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0"
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

              <div className="h-8 w-px bg-gray-200 mx-2" />

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
                          ? "bg-[#6D8196] text-white shadow-lg"
                          : "text-gray-600 hover:bg-gray-100"
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
                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" strokeWidth={2.5} />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px -10px rgba(168, 85, 247, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 bg-[#6D8196] text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all"
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
                    className="p-2 text-[#F8FAFC] hover:bg-gray-500 rounded-xl transition-colors"
                  >
                    <Menu className="w-6 h-6" strokeWidth={2.5} />
                  </motion.button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-80 bg-white border-l border-gray-100"
                >
                  <div
                    className="flex flex-col gap-2 mt-12"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {navItems.map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          handleNavigate(
                            "/" + (item.id === "home" ? "" : item.id),
                          );
                          setMobileMenuOpen(false);
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-left transition-all
                          ${
                            isActive(item.id === "home" ? "/" : "/" + item.id)
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100"
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5" strokeWidth={2.5} />
                        {item.label}
                      </motion.button>
                    ))}

                    <div className="h-px bg-gray-200 my-3" />

                    {currentUser ? (
                      <>
                        <motion.button
                          onClick={() => {
                            handleNavigate("/profile");
                            setMobileMenuOpen(false);
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
                        >
                          <UserIcon className="w-5 h-5" strokeWidth={2.5} />
                          Profile
                        </motion.button>

                        <motion.button
                          onClick={() => {
                            onLogout();
                            handleNavigate("/");
                            setMobileMenuOpen(false);
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-red-500 hover:bg-red-50"
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
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg"
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
    </>
  );
}
