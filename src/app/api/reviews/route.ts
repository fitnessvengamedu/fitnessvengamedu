import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || process.env.GOOGLE_PLACE_ID || "ChIJHXn5AQkvqjsRGkxQLv3ynEg";

  // If no API key is set, return fallback high-quality reviews immediately
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      placeId: placeId,
      name: "S FITNESS",
      rating: 5.0,
      error: "Google Places API key is missing",
      reviews: getFallbackReviews()
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,name&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 minutes
    const data = await res.json();

    if (data.status !== "OK" || !data.result || !data.result.reviews) {
      console.warn("Google Places API returned non-OK status or no reviews:", data.status, data.error_message);
      return NextResponse.json({
        success: false,
        placeId: placeId,
        name: "S FITNESS",
        rating: 5.0,
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
      placeId: placeId,
      name: data.result.name || "S FITNESS",
      rating: data.result.rating || 5.0,
      reviews: reviewsToReturn
    });
  } catch (error: any) {
    console.error("Error fetching Google reviews:", error);
    return NextResponse.json({
      success: false,
      placeId: placeId,
      name: "S FITNESS",
      rating: 5.0,
      error: error.message || "Failed to fetch reviews",
      reviews: getFallbackReviews()
    });
  }
}

function getFallbackReviews() {
  return [
    {
      author_name: "M.K. Bharathi",
      rating: 5,
      text: "Mr. Shanmugham is an excellent fitness trainer. The environment at the gym is very nice. He is friendly, patient and encouraging. I am sure that you can lead a healthy life.",
      relative_time_description: "2 years ago",
      profile_photo_url: ""
    },
    {
      author_name: "Khalaivani R",
      rating: 5,
      text: "Good and safe place to work out. Mr. Shanmugam and Mrs. Vaghavi is so humble and supportive throughout. I strongly believe this is the best gym in karur.",
      relative_time_description: "2 years ago",
      profile_photo_url: ""
    },
    {
      author_name: "KN TV",
      rating: 5,
      text: "Good and help for fitness, coach is very nice and are very kindly helps us to our health, please visit and make your body fit...",
      relative_time_description: "2 years ago",
      profile_photo_url: ""
    },
    {
      author_name: "Arvind Ponner",
      rating: 5,
      text: "Good gym my brother becomes sub inspector due to this gym well knowledge trainer",
      relative_time_description: "2 years ago",
      profile_photo_url: ""
    },
    {
      author_name: "Virat Harish",
      rating: 5,
      text: "Best place to do every workout with all equipments available.",
      relative_time_description: "a year ago",
      profile_photo_url: ""
    }
  ];
}
