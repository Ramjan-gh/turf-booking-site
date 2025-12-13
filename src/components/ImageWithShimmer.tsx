import { useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  radius?: string; // for custom rounded corners
  delay?: number; // optional: simulate slow loading
};

export default function ImageWithShimmer({
  src,
  alt = "image",
  className = "",
  radius = "rounded-lg",
//   for test
  delay = 0, // default 2s delay
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${radius} ${className}`}>
      {/* Skeleton Shimmer Loader */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse overflow-hidden">
          <div className="h-full w-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300" />
        </div>
      )} 

      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        // onLoad={() => setLoaded(true)}
        // for test
        onLoad={() => setTimeout(() => setLoaded(true), delay)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
