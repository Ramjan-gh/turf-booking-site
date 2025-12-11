import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import Footer from './Footer';

export function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate sending message
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    
    // Clear form
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '+880 1234-567890',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'info@turfbook.com',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: 'Dhaka, Bangladesh',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: 'Mon - Sun: 6 AM - 11 PM',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl text-center"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">We're here to help</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/90"
          >
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>
      </motion.div>

      {/* Contact Info Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactInfo.map((info, index) => (
          <motion.div
            key={info.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-4 shadow-lg mx-auto`}>
              <info.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="mb-2">{info.title}</h3>
            <p className="text-gray-600 text-sm">{info.details}</p>
          </motion.div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-8 shadow-lg"
        >
          <h2 className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Send us a Message
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-2 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-2 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="How can we help you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="border-2 focus:border-purple-500"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Map/Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-lg flex flex-col justify-center"
        >
          <h2 className="mb-6">Visit Our Office</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="mb-1">Location</h3>
                <p className="text-white/80">123 Sports Avenue, Gulshan-2, Dhaka-1212, Bangladesh</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="mb-1">Business Hours</h3>
                <p className="text-white/80">Monday - Sunday<br/>6:00 AM - 11:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="mb-1">Call Us</h3>
                <p className="text-white/80">+880 1234-567890<br/>+880 1234-567891</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
            <p className="text-sm text-white/90">
              <strong>Note:</strong> For urgent booking inquiries, please call us directly. Our support team is available during business hours to assist you.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
