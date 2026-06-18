import type { Types } from 'mongoose';

import {
  DISHES_BY_CUISINE,
  INDIAN_CITIES,
  INDIAN_CUISINES,
  RESTAURANT_PREFIXES,
  RESTAURANT_SUFFIXES,
} from './indiaData.js';
import type { SeedCity, SeedCuisine, SeedDish } from './indiaData.js';
import { restaurantCoverForCuisine, restaurantLogoForCuisine } from './seedImages.js';

const RESTAURANT_COUNT = 55;
const DISHES_PER_RESTAURANT = 3;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

function jitterCoordinate(value: number, spread = 0.035): number {
  const seed = Math.sin(value * 10000) * 10000;
  const normalized = seed - Math.floor(seed);
  return value + (normalized - 0.5) * spread;
}

function randomPin(pinPrefix: string, index: number): string {
  const suffix = String(100 + (index % 900)).padStart(3, '0');
  return `${pinPrefix}${suffix}`;
}

export interface GeneratedRestaurant {
  name: string;
  slug: string;
  cuisines: string[];
  primaryCuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrderAmount: number;
  isOpen: boolean;
  lat: number;
  lng: number;
  address: string;
  coverImage: string;
  logoImage: string;
  city: SeedCity;
}

export interface GeneratedMenu {
  restaurantSlug: string;
  categories: Array<{ name: string; sortOrder: number }>;
  items: Array<
    SeedDish & {
      categoryName: string;
      image: string;
    }
  >;
}

export function generateRestaurants(): GeneratedRestaurant[] {
  const restaurants: GeneratedRestaurant[] = [];
  const usedSlugs = new Set<string>();

  for (let index = 0; index < RESTAURANT_COUNT; index += 1) {
    const cuisine = pick(INDIAN_CUISINES, index) as SeedCuisine;
    const secondary = pick(INDIAN_CUISINES, index + 7);
    const city = pick(INDIAN_CITIES, index < 30 ? index : index + 3);
    const prefix = pick(RESTAURANT_PREFIXES, index);
    const suffix = pick(RESTAURANT_SUFFIXES, index + 2);
    const name = `${prefix} ${cuisine.name} ${suffix}`.replace(/\s+/g, ' ').trim();

    let slug = slugify(`${city.name}-${name}`);
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${index + 1}`;
    }
    usedSlugs.add(slug);

    const lat = jitterCoordinate(city.lat, city.name === 'Mumbai' ? 0.05 : 0.03);
    const lng = jitterCoordinate(city.lng, city.name === 'Mumbai' ? 0.05 : 0.03);
    const pin = randomPin(city.pinPrefix, index);
    const area = pick(
      ['MG Road', 'Linking Road', 'Koramangala', 'Banjara Hills', 'Park Street', 'FC Road'],
      index,
    );

    restaurants.push({
      name,
      slug,
      cuisines: index % 4 === 0 ? [cuisine.name, secondary.name] : [cuisine.name],
      primaryCuisine: cuisine.name,
      rating: Number((3.8 + (index % 12) * 0.1).toFixed(1)),
      reviewCount: 40 + index * 17,
      deliveryTimeMin: 25 + (index % 6) * 5,
      deliveryFee: 19 + (index % 5) * 10,
      minOrderAmount: 149 + (index % 6) * 50,
      isOpen: index % 11 !== 0,
      lat,
      lng,
      address: `${12 + (index % 80)}, ${area}, ${city.name}, ${city.state} ${pin}`,
      coverImage: restaurantCoverForCuisine(cuisine.name, index),
      logoImage: restaurantLogoForCuisine(cuisine.name, index),
      city,
    });
  }

  return restaurants;
}

export function generateMenus(restaurants: GeneratedRestaurant[]): GeneratedMenu[] {
  return restaurants.map((restaurant, restaurantIndex) => {
    const pool = DISHES_BY_CUISINE[restaurant.primaryCuisine] ?? DISHES_BY_CUISINE.Biryani;
    const start = (restaurantIndex * DISHES_PER_RESTAURANT) % pool.length;
    const selected: SeedDish[] = [];

    for (let offset = 0; selected.length < DISHES_PER_RESTAURANT; offset += 1) {
      selected.push(pool[(start + offset) % pool.length]);
    }

    const categoryNames = [...new Set(selected.map((dish) => dish.category))];
    const categories = categoryNames.map((name, sortOrder) => ({ name, sortOrder: sortOrder + 1 }));

    return {
      restaurantSlug: restaurant.slug,
      categories,
      items: selected.map((dish) => ({
        ...dish,
        categoryName: dish.category,
        image: dish.image,
      })),
    };
  });
}

export function buildUserAddress(city: SeedCity, index: number, label = 'Home') {
  const lat = jitterCoordinate(city.lat, 0.02);
  const lng = jitterCoordinate(city.lng, 0.02);
  const pin = randomPin(city.pinPrefix, index + 11);

  return {
    label,
    street: `${45 + index}, ${pick(['Bandra West', 'Connaught Place', 'Indiranagar', 'Gachibowli', 'T Nagar'], index)}`,
    city: city.name,
    state: city.state,
    zipCode: pin,
    lat,
    lng,
    isDefault: label === 'Home',
    deliveryOption: pick(['leave_at_door', 'meet_at_door', 'meet_outside'] as const, index),
    deliveryInstructions: index % 3 === 0 ? 'Call on arrival' : undefined,
  };
}

export function getCuisineSeedData() {
  return INDIAN_CUISINES;
}

export function countGeneratedDishes(menus: GeneratedMenu[]): number {
  return menus.reduce((total, menu) => total + menu.items.length, 0);
}

export type OwnerId = Types.ObjectId;
