"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

const ImageSlider = ({ media = [] }) => {
  const [current, setCurrent] = useState(0);

  // Auto Slide
  useEffect(() => {
    if (media.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % media.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [media.length]);

  // Empty State
  if (!Array.isArray(media) || media.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400">
        <ImageIcon className="w-14 h-14 mb-3" />
        <p className="text-lg font-medium">
          No media available
        </p>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-black shadow-2xl group">

      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {media.map((url, index) => (
          <div
            key={index}
            className="min-w-full relative flex items-center justify-center bg-black"
          >
            {url.endsWith(".mp4") ? (
              <video
                src={url}
                controls
                className="w-full h-[250px] sm:h-[350px] md:h-[550px] object-contain bg-black"
              />
            ) : (
              <Image
                src={url}
                alt={`slide-${index}`}
                width={1400}
                height={700}
                priority
                className="w-full h-[250px] sm:h-[350px] md:h-[550px] object-contain bg-black"
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Left Button */}
      {media.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                current === index
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;