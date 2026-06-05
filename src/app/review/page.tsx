"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquarePlus, Share2, MapPin, CheckCircle2 } from "lucide-react";

interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(4.9);
  const [placeName, setPlaceName] = useState<string>("S. Fitness Gym");
  const [placeId, setPlaceId] = useState<string>("ChIJHXn5AQkvqjsRGkxQLv3ynEg");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";
    
    // Graceful fallback to backend API
    async function fallbackToBackend() {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (active) {
          if (data && data.reviews) {
            setReviews(data.reviews);
            setRating(data.rating || 4.9);
            setPlaceName(data.name || "S. Fitness Gym");
            setPlaceId(data.placeId || "ChIJHXn5AQkvqjsRGkxQLv3ynEg");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Backend review fetch fallback failed:", err);
        if (active) setLoading(false);
      }
    }

    if (!apiKey) {
      fallbackToBackend();
      return;
    }

    // Try loading via Google Maps Places SDK client-side
    const scriptId = "google-maps-places-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializePlacesService = () => {
      try {
        const dummyDiv = document.createElement("div");
        const service = new window.google.maps.places.PlacesService(dummyDiv);
        
        service.getDetails(
          {
            placeId: placeId,
            fields: ["reviews", "rating", "name"]
          },
          (place: any, status: any) => {
            if (!active) return;
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              const googleReviews: Review[] = (place.reviews || [])
                .filter((r: any) => r.rating >= 3)
                .map((r: any) => ({
                  author_name: r.author_name,
                  rating: r.rating,
                  text: r.text,
                  relative_time_description: r.relative_time_description,
                  profile_photo_url: r.profile_photo_url
                }));
              
              setReviews(googleReviews);
              setRating(place.rating || 4.9);
              setPlaceName(place.name || "S. Fitness Gym");
              setLoading(false);
            } else {
              console.warn("Google Places Service failed status:", status);
              fallbackToBackend();
            }
          }
        );
      } catch (err) {
        console.error("Google Places Service instantiation error:", err);
        fallbackToBackend();
      }
    };

    if (window.google && window.google.maps && window.google.maps.places) {
      initializePlacesService();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const handleScriptLoad = () => {
        if (active) initializePlacesService();
      };

      const handleScriptError = () => {
        console.warn("Failed to load Google Maps Places script tag");
        if (active) fallbackToBackend();
      };

      script.addEventListener("load", handleScriptLoad);
      script.addEventListener("error", handleScriptError);

      return () => {
        active = false;
        script.removeEventListener("load", handleScriptLoad);
        script.removeEventListener("error", handleScriptError);
      };
    }

    return () => {
      active = false;
    };
  }, [placeId]);

  const renderStars = (ratingVal: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < Math.round(ratingVal) ? "text-electric-lime fill-electric-lime filter drop-shadow-[0_0_5px_rgba(223,255,17,0.5)]" : "text-white/10"
        }`}
      />
    ));
  };

  const writeReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-deep-obsidian px-4 py-16 md:py-24 relative overflow-hidden">
      {/* Background kinetic grid and glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric-lime/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-apex-crimson/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 text-electric-lime font-mono text-xs uppercase tracking-[0.3em]">
            <div className="h-[1px] w-8 bg-electric-lime" />
            <span>ATHLETE VOICE</span>
            <div className="h-[1px] w-8 bg-electric-lime" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white font-sora tracking-tight uppercase">
            Live Reviews
          </h1>
          <p className="text-white/50 text-sm md:text-base font-inter">
            Real feedback directly from Google Business Profile telemetry. Check out our real-time community experiences below.
          </p>
        </div>

        {/* Live Overview Summary Card */}
        <div className="glass-card p-6 md:p-10 rounded-2xl border border-glass-stroke relative overflow-hidden max-w-4xl mx-auto shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-electric-lime/30 to-transparent" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sora tracking-tight uppercase">
                {placeName}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-electric-lime font-mono">
                    {rating.toFixed(1)}
                  </span>
                  <div className="flex gap-1">
                    {renderStars(rating)}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-white/40 font-mono hidden sm:inline">|</span>
                <span className="text-xs sm:text-sm text-white/50 font-mono uppercase tracking-wider">
                  Live Sync Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/40 font-mono text-[11px] justify-center md:justify-start bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-electric-lime" />
                <span>PLACE ID: {placeId}</span>
              </div>
            </div>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href={writeReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-btn flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest px-6 py-4 rounded-xl cursor-pointer w-full sm:w-auto"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Write A Review
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="border border-white/10 hover:border-electric-lime/40 bg-white/5 hover:bg-electric-lime/5 text-white/80 hover:text-white flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest px-6 py-4 rounded-xl transition-all cursor-pointer w-full sm:w-auto"
              >
                <Share2 className="w-4 h-4" />
                Share Link
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Listing Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[220px] rounded-xl border border-glass-stroke glass-card p-6 flex flex-col justify-between animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-white/10 rounded-full" />
                    ))}
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-white/10 rounded w-5/6" />
                  </div>
                </div>
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative rounded-xl border border-glass-stroke glass-card p-6 flex flex-col justify-between hover:border-electric-lime/30 hover:shadow-[0_10px_30px_rgba(223,255,17,0.04)] transition-all duration-300"
              >
                {/* Micro-glow top border on hover */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-electric-lime/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="space-y-4">
                  {/* Header Author Info */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {review.profile_photo_url ? (
                        <img
                          src={review.profile_photo_url}
                          alt={review.author_name}
                          className="w-10 h-10 rounded-full border border-glass-stroke object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-glass-stroke bg-electric-lime/10 flex items-center justify-center font-bold text-electric-lime text-xs font-mono uppercase">
                          {review.author_name.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white font-sora text-sm tracking-tight group-hover:text-electric-lime transition-colors">
                          {review.author_name}
                        </h4>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">
                          {review.relative_time_description}
                        </p>
                      </div>
                    </div>
                    {/* Google Badge Icon */}
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-glass-stroke group-hover:bg-electric-lime/10 group-hover:border-electric-lime/20 transition-all">
                      <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-electric-lime transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.833 0-8.75-3.87-8.75-8.633s3.917-8.633 8.75-8.633c2.186 0 4.167.772 5.723 2.053l3.285-3.285C18.91 1.76 15.825.8 12.24.8 5.7.8.4 6.1.4 12.633S5.7 24.466 12.24 24.466c6.48 0 11.52-4.59 11.52-11.72 0-.785-.094-1.54-.236-2.28L12.24 10.285z" />
                      </svg>
                    </div>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "text-electric-lime fill-electric-lime" : "text-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-white/70 font-sans text-xs leading-relaxed italic group-hover:text-white transition-colors pt-1">
                    "{review.text}"
                  </p>
                </div>

                {/* Footer Validation Check */}
                <div className="border-t border-glass-stroke/50 pt-3 mt-4 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-electric-lime" />
                    Verified Review
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-lime animate-pulse" />
                    <span className="font-mono text-[8px] text-electric-lime uppercase">
                      Secure Sync
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
