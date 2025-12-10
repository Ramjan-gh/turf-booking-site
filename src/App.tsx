import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { UserProfile } from './components/UserProfile';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { Gallery } from './components/Gallery';
import { CheckBooking } from './components/CheckBooking';
import { Toaster } from './components/ui/sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingConfirmation } from './components/BookingConfirmation';
import { supabase } from "./lib/supabase";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
};

export type Booking = {
  id: string;
  code?: string;
  msg?: string;
  userId?: string;
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
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'about' | 'contact' | 'gallery' | 'check-booking'>('home');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('home');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Header
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <main className="pb-20">
          <Routes>
            <Route path="/" element={<HomePage currentUser={currentUser} />} />
            <Route
              path="/profile"
              element={
                <UserProfile
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/check-booking" element={<CheckBooking />} />
            <Route
              path="/booking-confirmation"
              element={<BookingConfirmation />}
            />
          </Routes>
        </main>

        <Toaster />
      </div>
    </BrowserRouter>
  );
}