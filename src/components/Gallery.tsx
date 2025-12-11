import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { X } from 'lucide-react';
import Footer from './Footer';

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1713815713124-362af0201f3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHR1cmYlMjBmaWVsZHxlbnwxfHx8fDE3NjMxODcxMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Football Turf',
      category: 'Football'
    },
    {
      url: 'https://images.unsplash.com/photo-1512719994953-eabf50895df7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlja2V0JTIwc3RhZGl1bXxlbnwxfHx8fDE3NjMyMjIyMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Cricket Stadium',
      category: 'Cricket'
    },
    {
      url: 'https://images.unsplash.com/photo-1558617320-e695f0d420de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2x8ZW58MXx8fHwxNzYzMjM1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Swimming Pool',
      category: 'Swimming'
    },
    {
      url: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      title: 'Night Game',
      category: 'Football'
    },
    {
      url: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      title: 'Indoor Facility',
      category: 'Football'
    },
    {
      url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      title: 'Team Action',
      category: 'Football'
    },
    {
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      title: 'Premium Turf',
      category: 'Football'
    },
    {
      url: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      title: 'Cricket Match',
      category: 'Cricket'
    },
    {
      url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      title: 'Pool View',
      category: 'Swimming'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl text-center"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            Our Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/90"
          >
            Explore our premium sports facilities and see where the magic happens
          </motion.p>
        </div>
      </motion.div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
            onClick={() => setSelectedImage(index)}
          >
            <ImageWithFallback
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white mb-2">
                  {image.category}
                </div>
                <h3 className="text-white">{image.title}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="max-w-5xl w-full"
          >
            <ImageWithFallback
              src={images[selectedImage].url}
              alt={images[selectedImage].title}
              className="w-full h-auto rounded-2xl"
            />
            <div className="text-center mt-6">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white mb-2">
                {images[selectedImage].category}
              </div>
              <h2 className="text-white">{images[selectedImage].title}</h2>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* footer  */}
      <Footer />
    </div>
  );
}
