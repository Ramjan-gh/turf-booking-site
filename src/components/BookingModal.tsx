// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { Textarea } from './ui/textarea';
// import { RadioGroup, RadioGroupItem } from './ui/radio-group';
// import { Badge } from './ui/badge';
// import { User, Booking } from '../App';
// import { format } from 'date-fns';
// import { toast } from 'sonner';
// import { Check, Clock, Calendar, Tag, Sparkles, PartyPopper } from 'lucide-react';
// import { motion, AnimatePresence } from 'motion/react';

// type BookingModalProps = {
//   open: boolean;
//   onClose: () => void;
//   selectedDate: Date;
//   selectedSport: string;
//   selectedSlot: string;
//   currentUser: User | null;
//   sportData: {
//     id: string;
//     name: string;
//     icon: string;
//     pricePerHour: number;
//   };
//   onBookingComplete: () => void;
// };

// const TIME_SLOTS = [
//   '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
//   '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
//   '18:00', '19:00', '20:00', '21:00', '22:00'
// ];

// export function BookingModal({
//   open,
//   onClose,
//   selectedDate,
//   selectedSport,
//   selectedSlot,
//   currentUser,
//   sportData,
//   onBookingComplete,
// }: BookingModalProps) {
//   const [fullName, setFullName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [email, setEmail] = useState('');
//   const [selectedSlots, setSelectedSlots] = useState<string[]>([selectedSlot]);
//   const [players, setPlayers] = useState('');
//   const [notes, setNotes] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('bkash');
//   const [paymentAmount, setPaymentAmount] = useState<'confirmation' | 'full'>('confirmation');
//   const [discountCode, setDiscountCode] = useState('');
//   const [bookings, setBookings] = useState<Booking[]>([]);

//   useEffect(() => {
//     // Load existing bookings
//     const stored = localStorage.getItem('bookings');
//     if (stored) {
//       setBookings(JSON.parse(stored));
//     }

//     // Pre-fill if user is logged in
//     if (currentUser) {
//       setFullName(currentUser.name);
//       setPhone(currentUser.phone);
//       setEmail(currentUser.email || '');
//     }
//   }, [currentUser]);

//   const isSlotBooked = (time: string) => {
//     const dateStr = format(selectedDate, 'yyyy-MM-dd');
//     return bookings.some(
//       booking =>
//         booking.date === dateStr &&
//         booking.sport === selectedSport &&
//         booking.slots.includes(time)
//     );
//   };

//   const toggleSlot = (slot: string) => {
//     if (selectedSlots.includes(slot)) {
//       setSelectedSlots(selectedSlots.filter(s => s !== slot));
//     } else {
//       setSelectedSlots([...selectedSlots, slot]);
//     }
//   };

//   const calculateTotal = () => {
//     const basePrice = selectedSlots.length * sportData.pricePerHour;
//     let discount = 0;

//     // Simple discount codes
//     if (discountCode.toUpperCase() === 'FIRST10') {
//       discount = basePrice * 0.1;
//     } else if (discountCode.toUpperCase() === 'SAVE20') {
//       discount = basePrice * 0.2;
//     }

//     return basePrice - discount;
//   };

//   const getConfirmationAmount = () => {
//     return Math.ceil(calculateTotal() * 0.2); // 20% confirmation
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (selectedSlots.length === 0) {
//       toast.error('Please select at least one time slot');
//       return;
//     }

//     const totalPrice = calculateTotal();
//     const amountToPay = paymentAmount === 'confirmation' ? getConfirmationAmount() : totalPrice;

//     const newBooking: Booking = {
//       id: Date.now().toString(),
//       code: Date.now().toString(),
//       userId: currentUser?.id,
//       fullName,
//       phone,
//       email: email || undefined,
//       sport: selectedSport,
//       date: format(selectedDate, 'yyyy-MM-dd'),
//       slots: selectedSlots.sort(),
//       players: players ? parseInt(players) : undefined,
//       notes: notes || undefined,
//       paymentMethod,
//       paymentAmount,
//       discountCode: discountCode || undefined,
//       totalPrice,
//       createdAt: new Date().toISOString(),
//     };

//     const allBookings = [...bookings, newBooking];
//     localStorage.setItem('bookings', JSON.stringify(allBookings));

//     toast.success(
//       <div>
//         <div>Booking confirmed! 🎉</div>
//         <div className="text-xs mt-1">
//           {paymentAmount === 'confirmation' 
//             ? `Confirmation amount: ৳${amountToPay}` 
//             : `Full payment: ৳${amountToPay}`}
//         </div>
//       </div>
//     );

//     onBookingComplete();
//   };

//   const totalPrice = calculateTotal();
//   const confirmationAmount = getConfirmationAmount();

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Sparkles className="w-5 h-5 text-green-600" />
//             Book Your Slot
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Booking Summary */}
//           <motion.div 
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 space-y-3 shadow-lg"
//           >
//             <div className="flex items-center gap-3">
//               <motion.span 
//                 animate={{ rotate: [0, 10, -10, 0] }}
//                 transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
//                 className="text-4xl"
//               >
//                 {sportData.icon}
//               </motion.span>
//               <div>
//                 <span className="text-green-900">{sportData.name}</span>
//                 <Badge className="ml-2 bg-green-600">Popular</Badge>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg p-2">
//                 <Calendar className="w-4 h-4 text-green-600" />
//                 <span>{format(selectedDate, 'MMM d, yyyy')}</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg p-2">
//                 <Clock className="w-4 h-4 text-green-600" />
//                 <span>{selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}</span>
//               </div>
//             </div>
//           </motion.div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Personal Information */}
//             <div className="space-y-4">
//               <h3 className="text-green-900">Personal Information</h3>
              
//               <div className="space-y-2">
//                 <Label htmlFor="fullName">Full Name *</Label>
//                 <Input
//                   id="fullName"
//                   type="text"
//                   placeholder="Enter your full name"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone Number *</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="01XXXXXXXXX"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address (Optional)</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="your.email@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Time Slots Selection */}
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               className="space-y-3"
//             >
//               <Label className="flex items-center gap-2">
//                 <Clock className="w-4 h-4 text-green-600" />
//                 Select Time Slots (1 hour each) *
//               </Label>
//               <div className="grid grid-cols-4 gap-2">
//                 {TIME_SLOTS.map((slot, index) => {
//                   const isSelected = selectedSlots.includes(slot);
//                   const isBooked = isSlotBooked(slot);
                  
//                   return (
//                     <motion.button
//                       key={slot}
//                       type="button"
//                       onClick={() => !isBooked && toggleSlot(slot)}
//                       disabled={isBooked}
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: 0.3 + index * 0.02 }}
//                       whileHover={!isBooked ? { scale: 1.05 } : {}}
//                       whileTap={!isBooked ? { scale: 0.95 } : {}}
//                       className={`p-3 rounded-xl transition-all text-sm relative shadow-sm ${
//                         isBooked
//                           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                           : isSelected
//                           ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
//                           : 'bg-white text-gray-700 hover:bg-green-50 border-2 border-gray-200 hover:border-green-300'
//                       }`}
//                     >
//                       {slot}
//                       <AnimatePresence>
//                         {isSelected && (
//                           <motion.div
//                             initial={{ scale: 0, rotate: -180 }}
//                             animate={{ scale: 1, rotate: 0 }}
//                             exit={{ scale: 0, rotate: 180 }}
//                             className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md"
//                           >
//                             <Check className="w-3 h-3 text-green-600" />
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </motion.button>
//                   );
//                 })}
//               </div>
//             </motion.div>

//             {/* Additional Details */}
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="players">Number of Players (Optional)</Label>
//                 <Input
//                   id="players"
//                   type="number"
//                   min="1"
//                   placeholder="e.g., 10"
//                   value={players}
//                   onChange={(e) => setPlayers(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="notes">Special Notes (Optional)</Label>
//                 <Textarea
//                   id="notes"
//                   placeholder="Any special requirements or notes..."
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   rows={3}
//                 />
//               </div>
//             </div>

//             {/* Discount Code */}
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//               className="space-y-2"
//             >
//               <Label htmlFor="discount" className="flex items-center gap-2">
//                 <Tag className="w-4 h-4 text-green-600" />
//                 Discount Code
//               </Label>
//               <div className="flex gap-2">
//                 <div className="relative flex-1">
//                   <Input
//                     id="discount"
//                     type="text"
//                     placeholder="Enter promo code"
//                     value={discountCode}
//                     onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
//                     className={(discountCode === 'FIRST10' || discountCode === 'SAVE20') ? 'border-green-500 bg-green-50' : ''}
//                   />
//                   <AnimatePresence>
//                     {(discountCode === 'FIRST10' || discountCode === 'SAVE20') && (
//                       <motion.div
//                         initial={{ scale: 0 }}
//                         animate={{ scale: 1 }}
//                         exit={{ scale: 0 }}
//                         className="absolute right-3 top-1/2 -translate-y-1/2"
//                       >
//                         <PartyPopper className="w-5 h-5 text-green-600" />
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//                 {(discountCode === 'FIRST10' || discountCode === 'SAVE20') && (
//                   <motion.div
//                     initial={{ scale: 0, rotate: -180 }}
//                     animate={{ scale: 1, rotate: 0 }}
//                   >
//                     <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2">
//                       <Sparkles className="w-3 h-3 mr-1" />
//                       Valid
//                     </Badge>
//                   </motion.div>
//                 )}
//               </div>
//               <p className="text-xs text-gray-500 flex items-center gap-1">
//                 <Sparkles className="w-3 h-3" />
//                 Try: FIRST10 or SAVE20
//               </p>
//             </motion.div>

//             {/* Payment */}
//             <div className="space-y-4">
//               <h3 className="text-green-900">Payment Details</h3>

//               <div className="space-y-2">
//                 <Label>Payment Method *</Label>
//                 <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="bkash" id="bkash" />
//                     <Label htmlFor="bkash" className="cursor-pointer">
//                       bKash
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="nagad" id="nagad" />
//                     <Label htmlFor="nagad" className="cursor-pointer">
//                       Nagad
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="rocket" id="rocket" />
//                     <Label htmlFor="rocket" className="cursor-pointer">
//                       Rocket
//                     </Label>
//                   </div>
//                 </RadioGroup>
//               </div>

//               <div className="space-y-2">
//                 <Label>Payment Amount *</Label>
//                 <RadioGroup 
//                   value={paymentAmount} 
//                   onValueChange={(val) => setPaymentAmount(val as 'confirmation' | 'full')}
//                 >
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="confirmation" id="confirmation" />
//                     <Label htmlFor="confirmation" className="cursor-pointer">
//                       Confirmation Amount (৳{confirmationAmount})
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="full" id="full" />
//                     <Label htmlFor="full" className="cursor-pointer">
//                       Full Payment (৳{totalPrice})
//                     </Label>
//                   </div>
//                 </RadioGroup>
//               </div>

//               {/* Price Summary */}
//               <motion.div 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.5 }}
//                 className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 space-y-3 border-2 border-gray-200"
//               >
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Base Price ({selectedSlots.length} slots)</span>
//                   <span>৳{selectedSlots.length * sportData.pricePerHour}</span>
//                 </div>
//                 <AnimatePresence>
//                   {(discountCode === 'FIRST10' || discountCode === 'SAVE20') && (
//                     <motion.div 
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       className="flex justify-between text-sm bg-green-100 -mx-5 px-5 py-2"
//                     >
//                       <span className="text-green-700 flex items-center gap-1">
//                         <Sparkles className="w-3 h-3" />
//                         Discount Applied
//                       </span>
//                       <span className="text-green-700">-৳{selectedSlots.length * sportData.pricePerHour - totalPrice}</span>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//                 <div className="border-t-2 border-dashed border-gray-300 pt-3 flex justify-between">
//                   <span>Total</span>
//                   <span>৳{totalPrice}</span>
//                 </div>
//                 <div className="flex justify-between bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-3 -mx-5 -mb-5 mt-3">
//                   <span>Amount to Pay Now</span>
//                   <span className="text-xl">৳{paymentAmount === 'confirmation' ? confirmationAmount : totalPrice}</span>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Submit Button */}
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.6 }}
//               className="flex gap-3 pt-4"
//             >
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={onClose} 
//                 className="flex-1 hover:bg-gray-100"
//               >
//                 Cancel
//               </Button>
//               <motion.div 
//                 className="flex-1"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <Button 
//                   type="submit" 
//                   className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
//                 >
//                   <Sparkles className="w-4 h-4 mr-2" />
//                   Confirm Booking
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </form>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
