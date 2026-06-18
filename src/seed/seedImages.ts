/** Verified Unsplash photo IDs (return HTTP 200 as of seed generation) */
const PHOTOS = {
  biryani: 'photo-1585937421612-70a008356fbe',
  curry: 'photo-1565557623262-b51c2513a641',
  streetFood: 'photo-1601050690597-df0568f70950',
  bread: 'photo-1596797038530-2c107229654b',
  spread: 'photo-1504674900247-0877df9cc836',
  restaurant: 'photo-1517248135467-4c7edcad34c4',
  dining: 'photo-1552566626-52f8b828add9',
  bowl: 'photo-1546069901-ba9599a7e63c',
  breakfast: 'photo-1482049016688-2d3e1b311543',
  dosa: 'photo-1626700051175-6818013e1d4f',
  grill: 'photo-1555939594-58d7cb561ad1',
  dessert: 'photo-1567620905732-2d1ec7ab7445',
  drink: 'photo-1505253758473-96b7015fcd40',
  noodles: 'photo-1589302168068-964664d93dc0',
  pizza: 'photo-1574071318508-1cdbab80d002',
  platter: 'photo-1513104890138-7c749659a591',
} as const;

export function unsplashUrl(photoId: string, width = 800): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

export const DEFAULT_RESTAURANT_IMAGE = unsplashUrl(PHOTOS.restaurant, 800);
export const DEFAULT_DISH_IMAGE = unsplashUrl(PHOTOS.spread, 400);

/** Restaurant cover images — all verified */
export const RESTAURANT_COVER_IMAGES = [
  unsplashUrl(PHOTOS.restaurant, 800),
  unsplashUrl(PHOTOS.dining, 800),
  unsplashUrl(PHOTOS.spread, 800),
  unsplashUrl(PHOTOS.biryani, 800),
  unsplashUrl(PHOTOS.curry, 800),
  unsplashUrl(PHOTOS.streetFood, 800),
  unsplashUrl(PHOTOS.bowl, 800),
  unsplashUrl(PHOTOS.grill, 800),
  unsplashUrl(PHOTOS.platter, 800),
  unsplashUrl(PHOTOS.breakfast, 800),
];

/** Logo / avatar-style food shots */
export const RESTAURANT_LOGO_IMAGES = [
  unsplashUrl(PHOTOS.biryani, 200),
  unsplashUrl(PHOTOS.curry, 200),
  unsplashUrl(PHOTOS.dosa, 200),
  unsplashUrl(PHOTOS.bread, 200),
  unsplashUrl(PHOTOS.dessert, 200),
  unsplashUrl(PHOTOS.drink, 200),
  unsplashUrl(PHOTOS.streetFood, 200),
  unsplashUrl(PHOTOS.bowl, 200),
];

/** Map menu category → dish image */
const CATEGORY_IMAGES: Record<string, string> = {
  Biryani: unsplashUrl(PHOTOS.biryani, 400),
  Curries: unsplashUrl(PHOTOS.curry, 400),
  Breads: unsplashUrl(PHOTOS.bread, 400),
  Dosas: unsplashUrl(PHOTOS.dosa, 400),
  Breakfast: unsplashUrl(PHOTOS.breakfast, 400),
  Rice: unsplashUrl(PHOTOS.biryani, 400),
  Snacks: unsplashUrl(PHOTOS.streetFood, 400),
  Rolls: unsplashUrl(PHOTOS.streetFood, 400),
  Mains: unsplashUrl(PHOTOS.curry, 400),
  Starters: unsplashUrl(PHOTOS.grill, 400),
  Tandoor: unsplashUrl(PHOTOS.grill, 400),
  Kebabs: unsplashUrl(PHOTOS.grill, 400),
  Noodles: unsplashUrl(PHOTOS.noodles, 400),
  Chaat: unsplashUrl(PHOTOS.streetFood, 400),
  Sweets: unsplashUrl(PHOTOS.dessert, 400),
  Beverages: unsplashUrl(PHOTOS.drink, 400),
  Thali: unsplashUrl(PHOTOS.bowl, 400),
  Combo: unsplashUrl(PHOTOS.bowl, 400),
  Sides: unsplashUrl(PHOTOS.bread, 400),
};

/** Primary cuisine → default restaurant cover */
export const CUISINE_COVER_IMAGES: Record<string, string> = {
  Biryani: unsplashUrl(PHOTOS.biryani, 800),
  'North Indian': unsplashUrl(PHOTOS.curry, 800),
  'South Indian': unsplashUrl(PHOTOS.dosa, 800),
  'Street Food': unsplashUrl(PHOTOS.streetFood, 800),
  Punjabi: unsplashUrl(PHOTOS.bread, 800),
  Gujarati: unsplashUrl(PHOTOS.bowl, 800),
  Bengali: unsplashUrl(PHOTOS.curry, 800),
  Maharashtrian: unsplashUrl(PHOTOS.streetFood, 800),
  Hyderabadi: unsplashUrl(PHOTOS.biryani, 800),
  Coastal: unsplashUrl(PHOTOS.curry, 800),
  'Indo-Chinese': unsplashUrl(PHOTOS.noodles, 800),
  'Kebab & Tandoor': unsplashUrl(PHOTOS.grill, 800),
  Thali: unsplashUrl(PHOTOS.bowl, 800),
  Chaat: unsplashUrl(PHOTOS.streetFood, 800),
  Sweets: unsplashUrl(PHOTOS.dessert, 800),
  Beverages: unsplashUrl(PHOTOS.drink, 800),
};

export function dishImageForCategory(category: string): string {
  return CATEGORY_IMAGES[category] ?? DEFAULT_DISH_IMAGE;
}

export function restaurantCoverForCuisine(cuisine: string, index: number): string {
  return CUISINE_COVER_IMAGES[cuisine] ?? RESTAURANT_COVER_IMAGES[index % RESTAURANT_COVER_IMAGES.length];
}

export function restaurantLogoForCuisine(_cuisine: string, index: number): string {
  return RESTAURANT_LOGO_IMAGES[index % RESTAURANT_LOGO_IMAGES.length];
}
