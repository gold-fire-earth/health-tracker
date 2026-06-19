interface Env {
  // Cloudflare environment bindings (none needed for this function)
}

export async function onRequest(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const query = url.searchParams.get('q') || '';
  const page = url.searchParams.get('page') || '1';

  if (!query.trim()) {
    return Response.json({ results: [], total: 0 });
  }

  // Proxy to OpenFoodFacts — free, no API key required
  const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=20&page=${page}&search_simple=1`;

  try {
    const res = await fetch(offUrl, {
      headers: { 'User-Agent': 'HealthTracker/1.0 (personal use)' },
    });

    if (!res.ok) {
      return Response.json({ results: [], error: 'Food database unavailable' }, { status: 502 });
    }

    const data = await res.json() as {
      products: Array<{
        product_name?: string;
        brand?: string;
        nutriments?: { 'energy-kcal_100g'?: number; proteins_100g?: number; carbohydrates_100g?: number; fat_100g?: number };
        serving_size?: string;
      }>;
      count: number;
    };

    const results = data.products
      .filter((p) => p.product_name && p.nutriments?.['energy-kcal_100g'])
      .slice(0, 20)
      .map((p) => ({
        name: p.product_name!,
        brand: p.brand || '',
        calories: Math.round((p.nutriments?.['energy-kcal_100g'] || 0)),
        protein: +(p.nutriments?.proteins_100g || 0).toFixed(1),
        carbs: +(p.nutriments?.carbohydrates_100g || 0).toFixed(1),
        fat: +(p.nutriments?.fat_100g || 0).toFixed(1),
        servingSize: p.serving_size || '100g',
      }));

    return Response.json({ results, total: data.count });
  } catch {
    return Response.json({ results: [], error: 'Network error' }, { status: 502 });
  }
}
