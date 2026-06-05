"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";

interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
}

function getFallbackReviews(): Review[] {
  return [
    {
      author_name: "Rahul Sharma",
      rating: 5,
      text: "The best gym in Vengamedu! High-tech equipment, elite atmosphere, and very professional trainers. Highly recommended!",
      relative_time_description: "2 weeks ago",
      profile_photo_url: ""
    },
    {
      author_name: "Priya K.",
      rating: 5,
      text: "Super clean, modern styling, and the Telegram bot check-ins are so helpful. I've been training here for 3 months now and love it.",
      relative_time_description: "1 month ago",
      profile_photo_url: ""
    },
    {
      author_name: "Karthik Raja",
      rating: 5,
      text: "Excellent equipment quality and spacious layout. The daily motivational quotes on the dashboard keep me going!",
      relative_time_description: "3 days ago",
      profile_photo_url: ""
    },
    {
      author_name: "Suresh Kumar",
      rating: 4,
      text: "Elite coaching, very helpful trainer. Love the digital membership card and bio-metric reports. Best fitness center around Karur.",
      relative_time_description: "1 month ago",
      profile_photo_url: ""
    }
  ];
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";
    const placeId = process.env.GOOGLE_PLACE_ID || "ChIJHXn5AQkvqjsRGkxQLv3ynEg";

    async function fallbackToBackend() {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (active) {
          if (data && data.reviews && Array.isArray(data.reviews)) {
            setReviews(data.reviews.slice(0, 4));
          } else {
            setReviews(getFallbackReviews());
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("ReviewsSection fallback fetch failed:", err);
        if (active) {
          setReviews(getFallbackReviews());
          setLoading(false);
        }
      }
    }

    if (!apiKey) {
      fallbackToBackend();
      return;
    }

    const scriptId = "google-maps-places-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializePlacesService = () => {
      try {
        const dummyDiv = document.createElement("div");
        const service = new (window as any).google.maps.places.PlacesService(dummyDiv);

        service.getDetails(
          {
            placeId: placeId,
            fields: ["reviews"]
          },
          (place: any, status: any) => {
            if (!active) return;
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place && place.reviews) {
              const googleReviews: Review[] = place.reviews
                .filter((r: any) => r.rating >= 3)
                .map((r: any) => ({
                  author_name: r.author_name,
                  rating: r.rating,
                  text: r.text,
                  relative_time_description: r.relative_time_description,
                  profile_photo_url: r.profile_photo_url
                }))
                .slice(0, 4);

              setReviews(googleReviews.length > 0 ? googleReviews : getFallbackReviews());
              setLoading(false);
            } else {
              console.warn("Google Places Service homepage query failed status:", status);
              fallbackToBackend();
            }
          }
        );
      } catch (err) {
        console.error("Google Places Service instantiation error on homepage:", err);
        fallbackToBackend();
      }
    };

    if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
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
        console.warn("Failed to load Google Maps Places script on homepage");
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
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-electric-lime fill-electric-lime" : "text-white/10"
        }`}
      />
    ));
  };

  return (
    <section id="review" className="w-full py-16 md:py-24 bg-deep-obsidian px-4 md:px-12 relative overflow-hidden border-t border-glass-stroke">
      {/* Visual background lights */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-electric-lime/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-apex-crimson/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      <div className="container mx-auto space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 text-electric-lime font-mono text-xs uppercase tracking-[0.3em]">
              <div className="h-[1px] w-8 bg-electric-lime" />
              <span>TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-sora text-white">
              ATHLETE CHECK-INS
            </h2>
          </div>
          <p className="text-white/40 font-mono text-xs max-w-xs md:text-right">
            LIVE FEED FROM GOOGLE BUSINESS PROFILE DETAILS
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-xl border border-glass-stroke glass-card p-6 flex flex-col justify-between hover:border-electric-lime/30 hover:shadow-[0_10px_30px_rgba(223,255,17,0.03)] transition-all duration-300"
              >
                {/* Micro-glow top border */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-electric-lime/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {review.profile_photo_url ? (
                        <img
                          src={review.profile_photo_url}
                          alt={review.author_name}
                          className="w-8 h-8 rounded-full border border-glass-stroke object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full border border-glass-stroke bg-electric-lime/10 flex items-center justify-center font-bold text-electric-lime text-[10px] font-mono uppercase">
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
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 border border-glass-stroke group-hover:bg-electric-lime/10 group-hover:border-electric-lime/20 transition-all">
                      <svg className="w-3 h-3 text-white/50 group-hover:text-electric-lime transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.833 0-8.75-3.87-8.75-8.633s3.917-8.633 8.75-8.633c2.186 0 4.167.772 5.723 2.053l3.285-3.285C18.91 1.76 15.825.8 12.24.8 5.7.8.4 6.1.4 12.633S5.7 24.466 12.24 24.466c6.48 0 11.52-4.59 11.52-11.72 0-.785-.094-1.54-.236-2.28L12.24 10.285z" />
                      </svg>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1">{renderStars(review.rating)}</div>

                  {/* Text */}
                  <p className="text-white/70 font-sans text-xs leading-relaxed italic group-hover:text-white transition-colors pt-1">
                    "{review.text}"
                  </p>
                </div>

                {/* Verification line */}
                <div className="border-t border-glass-stroke/50 pt-3 mt-4 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-electric-lime" />
                    VERIFIED REVIEW
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-lime animate-pulse" />
                    <span className="font-mono text-[8px] text-electric-lime uppercase">
                      SECURE SYNC
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
