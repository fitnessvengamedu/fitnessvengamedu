import { NextResponse, NextRequest } from 'next/server';

interface LocalFood {
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  image: string | null;
}

const LOCAL_FITNESS_FOODS: LocalFood[] = [
  { name: 'Oats / Oatmeal', calories: 389, protein: 16.9, carbohydrates: 66.3, fat: 6.9, image: null },
  { name: 'Chicken Breast (Boneless)', calories: 165, protein: 31.0, carbohydrates: 0.0, fat: 3.6, image: null },
  { name: 'Egg (Whole, Large)', calories: 155, protein: 13.0, carbohydrates: 1.1, fat: 11.0, image: null },
  { name: 'Egg White', calories: 52, protein: 11.0, carbohydrates: 0.7, fat: 0.2, image: null },
  { name: 'Whey Protein Powder', calories: 400, protein: 80.0, carbohydrates: 6.0, fat: 6.0, image: null },
  { name: 'Brown Rice (Cooked)', calories: 111, protein: 2.6, carbohydrates: 23.0, fat: 0.9, image: null },
  { name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbohydrates: 28.0, fat: 0.3, image: null },
  { name: 'Peanut Butter (Creamy)', calories: 588, protein: 25.0, carbohydrates: 20.0, fat: 50.0, image: null },
  { name: 'Banana', calories: 89, protein: 1.1, carbohydrates: 23.0, fat: 0.3, image: null },
  { name: 'Broccoli (Steamed)', calories: 34, protein: 2.8, carbohydrates: 7.0, fat: 0.4, image: null },
  { name: 'Salmon Fillet', calories: 208, protein: 20.0, carbohydrates: 0.0, fat: 13.0, image: null },
  { name: 'Tofu (Firm)', calories: 76, protein: 8.0, carbohydrates: 1.9, fat: 4.8, image: null },
  { name: 'Paneer (Cottage Cheese)', calories: 265, protein: 18.3, carbohydrates: 1.2, fat: 20.8, image: null },
  { name: 'Almonds', calories: 579, protein: 21.2, carbohydrates: 21.6, fat: 49.9, image: null },
  { name: 'Greek Yogurt (Plain 0%)', calories: 59, protein: 10.0, carbohydrates: 3.6, fat: 0.4, image: null },
  { name: 'Spinach (Raw)', calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, image: null },
  { name: 'Avocado', calories: 160, protein: 2.0, carbohydrates: 9.0, fat: 15.0, image: null },
  { name: 'Sweet Potato (Baked)', calories: 86, protein: 1.6, carbohydrates: 20.0, fat: 0.1, image: null },
  { name: 'Milk (Whole 3.25%)', calories: 61, protein: 3.2, carbohydrates: 4.8, fat: 3.3, image: null },
  { name: 'Milk (Skimmed)', calories: 35, protein: 3.4, carbohydrates: 5.0, fat: 0.1, image: null },
  { name: 'Apple', calories: 52, protein: 0.3, carbohydrates: 14.0, fat: 0.2, image: null },
  { name: 'Tuna (Canned in Water)', calories: 116, protein: 26.0, carbohydrates: 0.0, fat: 1.0, image: null },
  { name: 'Beef (Lean Steak 90%)', calories: 250, protein: 26.0, carbohydrates: 0.0, fat: 15.0, image: null },
  { name: 'Quinoa (Cooked)', calories: 120, protein: 4.4, carbohydrates: 21.3, fat: 1.9, image: null },
  { name: 'Chia Seeds', calories: 486, protein: 16.5, carbohydrates: 42.1, fat: 30.7, image: null },
  { name: 'Lentils (Cooked)', calories: 116, protein: 9.0, carbohydrates: 20.0, fat: 0.4, image: null },
  { name: 'Chickpeas / Garbanzo', calories: 164, protein: 8.9, carbohydrates: 27.4, fat: 2.6, image: null },
  { name: 'Potato (Boiled)', calories: 87, protein: 1.9, carbohydrates: 20.1, fat: 0.1, image: null },
  { name: 'Olive Oil', calories: 884, protein: 0.0, carbohydrates: 0.0, fat: 100.0, image: null },
  { name: 'Cottage Cheese', calories: 98, protein: 11.0, carbohydrates: 3.4, fat: 4.3, image: null },
  { name: 'Blueberries', calories: 57, protein: 0.7, carbohydrates: 14.0, fat: 0.3, image: null },
  { name: 'Strawberries', calories: 32, protein: 0.7, carbohydrates: 7.7, fat: 0.3, image: null },
  { name: 'Orange', calories: 47, protein: 0.9, carbohydrates: 11.8, fat: 0.1, image: null }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const cleanQuery = query.trim().toLowerCase();

  // 1. Search in local high-quality fitness food database first
  let localMatches: LocalFood[] = [];
  if (cleanQuery) {
    localMatches = LOCAL_FITNESS_FOODS.filter(food => 
      food.name.toLowerCase().includes(cleanQuery)
    );
  }

  // If we have robust local matches, we can optionally return them immediately,
  // or use them as a fallback if the upstream API fails.
  // To avoid hitting Open Food Facts rate limits (10 req/min) unnecessarily,
  // if the query exactly matches one of our local keys, we return it immediately.
  const exactLocalMatch = LOCAL_FITNESS_FOODS.find(food => 
    food.name.toLowerCase() === cleanQuery
  );

  if (exactLocalMatch) {
    return NextResponse.json({ products: [exactLocalMatch], isLocal: true });
  }

  try {
    if (!cleanQuery) {
      return NextResponse.json({ products: LOCAL_FITNESS_FOODS.slice(0, 6), isLocal: true });
    }

    // Try cgi/search.pl (full-text search) which is better than tag-based search for general terms
    const cgiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=6`;
    
    console.log(`[Diet API] Fetching Open Food Facts for query "${query}"...`);
    
    const response = await fetch(cgiUrl, {
      headers: {
        'User-Agent': 'SFitnessApp - Web - Version 1.0 - https://sfitness.qzz.io'
      },
      next: { revalidate: 3600 } // Cache results for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Upstream returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      // Try fallback category-based search
      const v2Url = `https://world.openfoodfacts.org/api/v2/search?categories_tags_en=${encodeURIComponent(query)}&fields=product_name,nutriments,image_front_small_url&page_size=6`;
      const fallbackResponse = await fetch(v2Url, {
        headers: {
          'User-Agent': 'SFitnessApp - Web - Version 1.0 - https://sfitness.qzz.io'
        },
        next: { revalidate: 3600 }
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.products && fallbackData.products.length > 0) {
          const formatted = formatProducts(fallbackData.products);
          return NextResponse.json({ products: formatted, isLocal: false });
        }
      }
    } else {
      const formatted = formatProducts(data.products);
      return NextResponse.json({ products: formatted, isLocal: false });
    }

    // If API succeeds but returns no products, return local matches
    return NextResponse.json({ 
      products: localMatches.length > 0 ? localMatches : LOCAL_FITNESS_FOODS.slice(0, 6), 
      isLocal: true 
    });

  } catch (error: any) {
    console.warn('[Diet API] Open Food Facts API failed or rate-limited. Falling back to local database.', error.message);
    
    // Graceful fallback to local matches or generic recommendations (status 200)
    return NextResponse.json({
      products: localMatches.length > 0 ? localMatches : LOCAL_FITNESS_FOODS.slice(0, 6),
      isLocal: true,
      isFallback: true
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60' // shorter cache for fallback results
      }
    });
  }
}

function formatProducts(products: any[]) {
  return products.map((prod: any) => {
    const nutriments = prod.nutriments || {};
    return {
      name: prod.product_name || 'Unknown Item',
      image: prod.image_front_small_url || null,
      calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
      protein: parseFloat((nutriments.proteins_100g || nutriments.proteins || 0).toFixed(1)),
      carbohydrates: parseFloat((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0).toFixed(1)),
      fat: parseFloat((nutriments.fat_100g || nutriments.fat || 0).toFixed(1))
    };
  });
}
