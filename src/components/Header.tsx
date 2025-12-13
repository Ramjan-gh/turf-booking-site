import { User } from '../App';
import { Button } from './ui/button';
import {
  Menu,
  User as UserIcon,
  Home,
  LogOut,
  Info,
  Mail,
  Image,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from './AuthModal';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

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

  // 🔹 ONE helper for all navigation + scroll
  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'about' as const, label: 'About', icon: Info },
    { id: 'gallery' as const, label: 'Gallery', icon: Image },
    { id: 'check-booking' as const, label: 'Track Booking', icon: Search },
    { id: 'contact' as const, label: 'Contact', icon: Mail },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/90 backdrop-blur-xl border-b-2 border-purple-200 sticky top-0 z-50 shadow-lg"
      >
        <div className="px-4 py-3 flex items-center justify-between max-w-7xl mx-auto">
          {/* LOGO */}
          <motion.button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-xl">⚽</span>
            </motion.div>
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              TurfBook
            </span>
          </motion.button>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.div key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  onClick={() =>
                    handleNavigate('/' + (item.id === 'home' ? '' : item.id))
                  }
                  className={`${
                    location.pathname ===
                    (item.id === 'home' ? '/' : '/' + item.id)
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                      : 'hover:bg-purple-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </motion.div>
            ))}

            {currentUser ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate('/profile')}
                  className={
                    location.pathname === '/profile'
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                      : 'hover:bg-purple-50'
                  }
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Profile
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    onLogout();
                    handleNavigate('/');
                  }}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white"
              >
                Login / Register
              </Button>
            )}
          </div>

          {/* MOBILE NAV */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      onClick={() => {
                        handleNavigate('/' + (item.id === 'home' ? '' : item.id));
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}

                  {currentUser ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleNavigate('/profile');
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Profile
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          onLogout();
                          handleNavigate('/');
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Login / Register
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
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
