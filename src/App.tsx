import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { UserProfile } from './components/UserProfile';
import { ContactUs } from './components/ContactUs';
import { Gallery } from './components/Gallery';
import { CheckBooking } from './components/CheckBooking';
import { Toaster } from './components/ui/sonner';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { BookingConfirmation } from './components/BookingConfirmation';
import { supabase } from "./lib/supabase";
// 1. Import your new bKash callback component here
import { BookingSuccess } from './components/BookingSuccess';

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  total_earned_points?: number;
};

export type Booking = {
  id: string;
  code?: string;
  msg?: string;
  fullName: string;
  phone: string;
  email?: string;
  sport: string;
  date: string;
  slots: string[];
  players?: number;
  notes?: string;
  paymentMethod: string;
  paymentAmount: "confirmation" | "full";
  discountCode?: string;
  totalPrice: number;
  createdAt: string;
  paidAmount: number;
  dueAmount: number;
  discountAmount?: number;
  pointRedeemAmount?: number;
  finalAmount?: number;
};

function AppRoutes() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main>
        <Routes>
          <Route path="/" element={<HomePage currentUser={currentUser} />} />
          <Route path="/profile" element={<UserProfile currentUser={currentUser} onLogout={handleLogout} />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/check-booking" element={<CheckBooking />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}