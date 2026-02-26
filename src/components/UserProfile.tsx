import { useState, useEffect } from 'react';
import { User, Booking } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, User as UserIcon, Phone, Mail, History, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

type UserProfileProps = {
  currentUser: User | null;
  onLogout: () => void;
};

const SPORTS: { [key: string]: { name: string; icon: string } } = {
  football: { name: 'Football', icon: '⚽' },
  cricket: { name: 'Cricket', icon: '🏏' },
  swimming: { name: 'Swimming', icon: '🏊' },
};

export function UserProfile({ currentUser, onLogout }: UserProfileProps) {
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadUserBookings();
    }
  }, [currentUser]);

  const loadUserBookings = () => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const filtered = allBookings.filter(
      (booking: Booking) => 
        booking.phone === currentUser?.phone
    );
    // Sort by date, newest first
    filtered.sort((a: Booking, b: Booking) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setUserBookings(filtered);
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p>{currentUser.name}</p>
              <p className="text-sm text-gray-500">Member</p>
            </div>
          </div>
          
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{currentUser.phone}</span>
            </div>
            {currentUser.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{currentUser.email}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={onLogout} className="w-full">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl text-green-600 mb-1">{userBookings.length}</div>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl text-green-600 mb-1">
                ৳{userBookings.reduce((sum, b) => sum + b.totalPrice, 0)}
              </div>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No bookings yet</p>
              <p className="text-sm mt-1">Start booking to see your history here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userBookings.map((booking) => {
                const sport = SPORTS[booking.sport] || { name: booking.sport, icon: '⚽' };
                const bookingDate = new Date(booking.date);
                const isPast = bookingDate < new Date();
                
                return (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 space-y-3 hover:border-green-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{sport.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{sport.name}</span>
                            <Badge variant={isPast ? 'secondary' : 'default'}>
                              {isPast ? 'Completed' : 'Upcoming'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Booking ID: {booking.id.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600">৳{booking.totalPrice}</p>
                        <p className="text-xs text-gray-500">
                          {booking.paymentAmount === 'confirmation' ? 'Partial' : 'Full'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(bookingDate, 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{booking.slots.length} slot(s): {booking.slots.join(', ')}</span>
                      </div>
                    </div>

                    {booking.players && (
                      <div className="text-sm text-gray-600">
                        Players: {booking.players}
                      </div>
                    )}

                    {booking.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="text-gray-500">Notes: </span>
                        {booking.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
                      <span>Payment: {booking.paymentMethod.toUpperCase()}</span>
                      <span>Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
