import { motion } from 'motion/react';
import { Award, Users, Clock, Star, Target, Heart } from 'lucide-react';
import Footer from './Footer';

export function AboutUs() {
  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Top-tier turfs maintained to international standards',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Building a vibrant sports community across the city',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Clock,
      title: 'Flexible Hours',
      description: 'Open from 6 AM to 11 PM, 7 days a week',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Star,
      title: 'Easy Booking',
      description: 'Book your slot in less than 10 seconds',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Target,
      title: 'Best Rates',
      description: 'Competitive pricing with special discounts',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our top priority',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-3xl p-12 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            About TurfBook
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/90"
          >
            Your premier destination for booking sports turfs with ease. We're passionate about making sports accessible to everyone.
          </motion.p>
        </div>
      </motion.div>

      {/* Our Story */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl p-8 shadow-lg"
      >
        <h2 className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Our Story</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            TurfBook was founded with a simple vision: to make sports facilities accessible to everyone. We understand the struggle of finding and booking quality turfs for your favorite sports.
          </p>
          <p>
            Our platform connects sports enthusiasts with premium turf facilities across the city. Whether you're planning a friendly football match, a cricket game, or a swimming session, we've got you covered.
          </p>
          <p>
            With instant booking confirmations, flexible time slots, and competitive pricing, we're revolutionizing the way people book sports facilities. Join thousands of happy customers who trust TurfBook for their sporting needs.
          </p>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="space-y-6">
        <h2 className="text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Why Choose Us
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
              
              {/* Decorative gradient */}
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl`}></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl"
      >
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="text-5xl mb-2"
            >
              5000+
            </motion.div>
            <div className="text-white/80">Happy Customers</div>
          </div>
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: "spring" }}
              className="text-5xl mb-2"
            >
              15+
            </motion.div>
            <div className="text-white/80">Premium Turfs</div>
          </div>
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="text-5xl mb-2"
            >
              24/7
            </motion.div>
            <div className="text-white/80">Support Available</div>
          </div>
        </div>
      </motion.div>
      {/* footer  */}
      <Footer/>
    </div>
  );
}
