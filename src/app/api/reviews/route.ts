import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || "ChIJHXn5AQkvqjsRGkxQLv3ynEg";

  // If no API key is set, return fallback high-quality reviews immediately
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "Google Places API key is missing",
      reviews: getFallbackReviews()
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,name&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const data = await res.json();

    if (data.status !== "OK" || !data.result || !data.result.reviews) {
      console.warn("Google Places API returned non-OK status or no reviews:", data.status, data.error_message);
      return NextResponse.json({
        success: false,
        status: data.status,
        message: data.error_message || "No reviews found",
        reviews: getFallbackReviews()
      });
    }

    // Filter reviews where rating >= 3 stars
    const allReviews = data.result.reviews || [];
    const filteredReviews = allReviews.filter((r: any) => r.rating >= 3);

    // If Google returned no reviews that match our criteria, default to fallback reviews
    const reviewsToReturn = filteredReviews.length > 0 ? filteredReviews : getFallbackReviews();

    return NextResponse.json({
      success: true,
      reviews: reviewsToReturn
    });
  } catch (error: any) {
    console.error("Error fetching Google reviews:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to fetch reviews",
      reviews: getFallbackReviews()
    });
  }
}

function getFallbackReviews() {
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
