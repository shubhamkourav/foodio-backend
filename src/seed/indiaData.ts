import { dishImageForCategory } from './seedImages.js';

export interface SeedCuisine {
  name: string;
  slug: string;
  emoji: string;
  sortOrder: number;
  matchers: string[];
}

export interface SeedCity {
  name: string;
  state: string;
  lat: number;
  lng: number;
  pinPrefix: string;
}

export interface SeedDish {
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isPopular?: boolean;
  category: string;
  tags?: string[];
  image: string;
}

/** Indian cities for restaurant and user addresses */
export const INDIAN_CITIES: SeedCity[] = [
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, pinPrefix: '400' },
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209, pinPrefix: '110' },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, pinPrefix: '560' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867, pinPrefix: '500' },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, pinPrefix: '600' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, pinPrefix: '700' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, pinPrefix: '411' },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, pinPrefix: '380' },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, pinPrefix: '302' },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, pinPrefix: '226' },
];

/** Dynamic cuisine catalog — drives home carousel and restaurant tags */
export const INDIAN_CUISINES: SeedCuisine[] = [
  { name: 'Biryani', slug: 'biryani', emoji: '🍛', sortOrder: 1, matchers: ['biryani', 'mughlai', 'hyderabadi'] },
  { name: 'North Indian', slug: 'north-indian', emoji: '🫓', sortOrder: 2, matchers: ['north indian', 'punjabi', 'tandoori', 'mughlai'] },
  { name: 'South Indian', slug: 'south-indian', emoji: '🥘', sortOrder: 3, matchers: ['south indian', 'dosa', 'idli', 'tamil', 'kerala'] },
  { name: 'Street Food', slug: 'street-food', emoji: '🌮', sortOrder: 4, matchers: ['street food', 'chaat', 'vada pav', 'pav bhaji'] },
  { name: 'Punjabi', slug: 'punjabi', emoji: '🧈', sortOrder: 5, matchers: ['punjabi', 'paratha', 'lassi'] },
  { name: 'Gujarati', slug: 'gujarati', emoji: '🥗', sortOrder: 6, matchers: ['gujarati', 'dhokla', 'thepla'] },
  { name: 'Bengali', slug: 'bengali', emoji: '🐟', sortOrder: 7, matchers: ['bengali', 'fish', 'rosogolla'] },
  { name: 'Maharashtrian', slug: 'maharashtrian', emoji: '🍲', sortOrder: 8, matchers: ['maharashtrian', 'misal', 'vada pav'] },
  { name: 'Hyderabadi', slug: 'hyderabadi', emoji: '🌶️', sortOrder: 9, matchers: ['hyderabadi', 'haleem', 'kebab'] },
  { name: 'Coastal', slug: 'coastal', emoji: '🦐', sortOrder: 10, matchers: ['coastal', 'goan', 'konkan', 'seafood'] },
  { name: 'Indo-Chinese', slug: 'indo-chinese', emoji: '🥡', sortOrder: 11, matchers: ['indo-chinese', 'chinese', 'manchurian', 'hakka'] },
  { name: 'Kebab & Tandoor', slug: 'kebab-tandoor', emoji: '🍢', sortOrder: 12, matchers: ['kebab', 'tandoor', 'tikka'] },
  { name: 'Thali', slug: 'thali', emoji: '🍱', sortOrder: 13, matchers: ['thali', 'meal', 'rajasthani thali'] },
  { name: 'Chaat', slug: 'chaat', emoji: '🥙', sortOrder: 14, matchers: ['chaat', 'pani puri', 'bhel'] },
  { name: 'Sweets', slug: 'sweets', emoji: '🍮', sortOrder: 15, matchers: ['sweet', 'mithai', 'dessert'] },
  { name: 'Beverages', slug: 'beverages', emoji: '🥤', sortOrder: 16, matchers: ['beverage', 'lassi', 'chai', 'juice', 'shake'] },
];

const dish = (
  name: string,
  description: string,
  price: number,
  isVeg: boolean,
  category: string,
  extra?: Partial<SeedDish>,
): SeedDish => ({
  name,
  description,
  price,
  isVeg,
  category,
  image: dishImageForCategory(category),
  ...extra,
});

/** Dishes grouped by primary cuisine name */
export const DISHES_BY_CUISINE: Record<string, SeedDish[]> = {
  Biryani: [
    dish('Chicken Dum Biryani', 'Aromatic basmati rice with tender chicken', 299, false, 'Biryani', { isPopular: true }),
    dish('Mutton Biryani', 'Slow-cooked mutton layered with saffron rice', 349, false, 'Biryani', { isPopular: true }),
    dish('Hyderabadi Dum Biryani', 'Classic dum style with fried onions and raita', 329, false, 'Biryani'),
    dish('Veg Dum Biryani', 'Seasonal vegetables with fragrant spices', 249, true, 'Biryani'),
    dish('Paneer Biryani', 'Cottage cheese cubes in spiced rice', 269, true, 'Biryani'),
    dish('Egg Biryani', 'Boiled eggs tossed in masala rice', 229, true, 'Biryani'),
    dish('Fish Biryani', 'Coastal-style fish biryani with curry leaves', 319, false, 'Biryani'),
    dish('Keema Biryani', 'Minced meat biryani with mint', 289, false, 'Biryani'),
  ],
  'North Indian': [
    dish('Butter Chicken', 'Creamy tomato gravy with tandoori chicken', 329, false, 'Curries', { isPopular: true }),
    dish('Paneer Butter Masala', 'Rich cottage cheese curry', 279, true, 'Curries', { isPopular: true }),
    dish('Dal Makhani', 'Slow-cooked black lentils with cream', 219, true, 'Curries'),
    dish('Chicken Tikka Masala', 'Char-grilled chicken in spiced gravy', 309, false, 'Curries'),
    dish('Malai Kofta', 'Fried paneer-potato balls in creamy sauce', 259, true, 'Curries'),
    dish('Tandoori Roti', 'Whole wheat flatbread from the tandoor', 25, true, 'Breads'),
    dish('Butter Naan', 'Soft leavened bread with butter', 45, true, 'Breads', { isPopular: true }),
    dish('Garlic Naan', 'Naan topped with garlic and coriander', 55, true, 'Breads'),
  ],
  'South Indian': [
    dish('Masala Dosa', 'Crispy rice crepe with potato filling', 149, true, 'Dosas', { isPopular: true }),
    dish('Plain Dosa', 'Classic fermented rice and lentil crepe', 99, true, 'Dosas'),
    dish('Rava Dosa', 'Crispy semolina dosa served with chutney', 129, true, 'Dosas'),
    dish('Mysore Masala Dosa', 'Spicy red chutney smeared dosa', 169, true, 'Dosas'),
    dish('Idli Sambar (2 pcs)', 'Steamed rice cakes with lentil stew', 89, true, 'Breakfast'),
    dish('Medu Vada (2 pcs)', 'Crispy lentil donuts with sambar', 99, true, 'Breakfast'),
    dish('Filter Coffee', 'South Indian chicory coffee', 49, true, 'Beverages', { isPopular: true }),
    dish('Lemon Rice', 'Tempered rice with peanuts and lemon', 159, true, 'Rice'),
  ],
  'Street Food': [
    dish('Vada Pav', 'Mumbai-style potato fritter in pav', 49, true, 'Snacks', { isPopular: true }),
    dish('Pav Bhaji', 'Spiced mashed vegetables with buttered pav', 129, true, 'Snacks', { isPopular: true }),
    dish('Misal Pav', 'Sprouted curry topped with farsan', 139, true, 'Snacks'),
    dish('Bombay Sandwich', 'Grilled chutney sandwich with veggies', 99, true, 'Snacks'),
    dish('Kathi Roll', 'Paratha wrap with spiced filling', 149, false, 'Rolls'),
    dish('Samosa (2 pcs)', 'Crispy pastry with spiced potato', 59, true, 'Snacks'),
  ],
  Punjabi: [
    dish('Amritsari Kulcha', 'Stuffed kulcha with chole', 179, true, 'Mains', { isPopular: true }),
    dish('Chole Bhature', 'Punjabi chickpea curry with fried bread', 169, true, 'Mains'),
    dish('Sarson da Saag', 'Mustard greens with makki di roti', 199, true, 'Mains'),
    dish('Paneer Tikka', 'Grilled cottage cheese with spices', 249, true, 'Starters'),
    dish('Lassi (Sweet)', 'Thick Punjabi yogurt drink', 79, true, 'Beverages'),
    dish('Rajma Chawal', 'Kidney beans curry with steamed rice', 189, true, 'Mains'),
  ],
  Gujarati: [
    dish('Dhokla', 'Steamed fermented gram flour cake', 99, true, 'Snacks', { isPopular: true }),
    dish('Thepla', 'Spiced flatbread with pickle', 89, true, 'Snacks'),
    dish('Undhiyu', 'Mixed winter vegetables Gujarati specialty', 219, true, 'Mains'),
    dish('Khandvi', 'Rolled gram flour snack with tempering', 109, true, 'Snacks'),
    dish('Fafda Jalebi', 'Crispy snack with sweet jalebi', 129, true, 'Combo'),
    dish('Gujarati Thali', 'Complete meal with roti, dal, sabzi, sweet', 299, true, 'Thali', { isPopular: true }),
  ],
  Bengali: [
    dish('Fish Curry', 'Rohu fish in mustard gravy', 289, false, 'Curries', { isPopular: true }),
    dish('Kolkata Biryani', 'Light biryani with potato and egg', 279, false, 'Biryani'),
    dish('Shukto', 'Mixed vegetable bitter-sweet curry', 199, true, 'Mains'),
    dish('Rosogolla (2 pcs)', 'Soft cottage cheese dumplings in syrup', 69, true, 'Sweets'),
    dish('Kathi Roll (Chicken)', 'Kolkata-style chicken roll', 159, false, 'Rolls'),
    dish('Chingri Malai Curry', 'Prawns in coconut milk', 349, false, 'Curries'),
  ],
  Maharashtrian: [
    dish('Puran Poli', 'Sweet flatbread with lentil stuffing', 119, true, 'Sweets'),
    dish('Sabudana Khichdi', 'Tapioca pearls with peanuts', 129, true, 'Breakfast'),
    dish('Bharli Vangi', 'Stuffed brinjal Maharashtrian style', 209, true, 'Mains'),
    dish('Kolhapuri Chicken', 'Fiery red Kolhapuri masala chicken', 319, false, 'Curries', { isPopular: true }),
    dish('Sol Kadhi', 'Kokum and coconut digestive drink', 59, true, 'Beverages'),
  ],
  Hyderabadi: [
    dish('Hyderabadi Chicken Biryani', 'Layered dum biryani with raita', 329, false, 'Biryani', { isPopular: true }),
    dish('Haleem', 'Slow-cooked meat and lentil stew', 249, false, 'Mains'),
    dish('Galouti Kebab', 'Melt-in-mouth minced meat kebabs', 279, false, 'Kebabs'),
    dish('Mirchi ka Salan', 'Chilli curry accompaniment', 129, true, 'Sides'),
    dish('Double ka Meetha', 'Hyderabadi bread pudding dessert', 99, true, 'Sweets'),
  ],
  Coastal: [
    dish('Goan Fish Curry', 'Tangy coconut fish curry', 309, false, 'Curries', { isPopular: true }),
    dish('Prawn Ghee Roast', 'Mangalorean spicy prawn roast', 389, false, 'Curries'),
    dish('Chicken Gassi', 'Coastal chicken curry with roasted spices', 299, false, 'Curries'),
    dish('Neer Dosa', 'Thin rice crepes from the coast', 119, true, 'Dosas'),
    dish('Kori Rotti', 'Crispy rotti with chicken curry', 279, false, 'Mains'),
  ],
  'Indo-Chinese': [
    dish('Veg Manchurian', 'Crispy vegetable balls in tangy sauce', 199, true, 'Starters', { isPopular: true }),
    dish('Chicken Fried Rice', 'Wok-tossed rice with chicken', 229, false, 'Rice'),
    dish('Hakka Noodles', 'Stir-fried noodles with vegetables', 209, true, 'Noodles'),
    dish('Chilli Chicken', 'Indo-Chinese classic dry chilli chicken', 269, false, 'Starters', { isPopular: true }),
    dish('Schezwan Fried Rice', 'Spicy schezwan rice', 219, true, 'Rice'),
    dish('Gobi Manchurian', 'Cauliflower in manchurian sauce', 189, true, 'Starters'),
  ],
  'Kebab & Tandoor': [
    dish('Chicken Seekh Kebab', 'Minced chicken skewers from tandoor', 279, false, 'Kebabs', { isPopular: true }),
    dish('Paneer Tikka', 'Char-grilled cottage cheese cubes', 249, true, 'Kebabs'),
    dish('Tandoori Chicken (Half)', 'Classic red tandoori chicken', 349, false, 'Tandoor'),
    dish('Mutton Seekh Kebab', 'Juicy minced mutton kebabs', 329, false, 'Kebabs'),
    dish('Hara Bhara Kebab', 'Spinach and pea kebabs', 219, true, 'Kebabs'),
    dish('Roomali Roti', 'Thin handkerchief bread', 35, true, 'Breads'),
  ],
  Thali: [
    dish('North Indian Thali', 'Dal, sabzi, roti, rice, sweet', 299, true, 'Thali', { isPopular: true }),
    dish('South Indian Meals', 'Rice, sambar, rasam, poriyal, curd', 249, true, 'Thali'),
    dish('Rajasthani Thali', 'Dal baati, churma, gatte ki sabzi', 329, true, 'Thali'),
    dish('Mini Thali', 'Compact thali for one', 199, true, 'Thali'),
    dish('Executive Veg Thali', 'Premium vegetarian platter', 349, true, 'Thali'),
  ],
  Chaat: [
    dish('Pani Puri (6 pcs)', 'Crisp puris with spiced water', 79, true, 'Chaat', { isPopular: true }),
    dish('Bhel Puri', 'Puffed rice chaat with chutneys', 99, true, 'Chaat'),
    dish('Dahi Puri', 'Yogurt-topped crispy puris', 109, true, 'Chaat'),
    dish('Aloo Tikki Chaat', 'Spiced potato patties with chutneys', 89, true, 'Chaat'),
    dish('Raj Kachori', 'Large kachori loaded with toppings', 129, true, 'Chaat'),
  ],
  Sweets: [
    dish('Gulab Jamun (2 pcs)', 'Milk-solid dumplings in sugar syrup', 69, true, 'Sweets', { isPopular: true }),
    dish('Rasmalai (2 pcs)', 'Cottage cheese discs in saffron milk', 99, true, 'Sweets'),
    dish('Kaju Katli', 'Cashew fudge pieces', 149, true, 'Sweets'),
    dish('Jalebi (250g)', 'Crispy spirals soaked in syrup', 89, true, 'Sweets'),
    dish('Rabri', 'Thickened sweetened milk dessert', 119, true, 'Sweets'),
  ],
  Beverages: [
    dish('Masala Chai', 'Indian spiced tea', 39, true, 'Beverages', { isPopular: true }),
    dish('Mango Lassi', 'Sweet yogurt mango drink', 89, true, 'Beverages'),
    dish('Fresh Lime Soda', 'Sweet or salted lime soda', 59, true, 'Beverages'),
    dish('Cold Coffee', 'Blended coffee with ice cream', 129, true, 'Beverages'),
    dish('Jaljeera', 'Tangy cumin-mint cooler', 49, true, 'Beverages'),
  ],
};

export const RESTAURANT_PREFIXES = [
  'Bawarchi',
  'Desi',
  'Royal',
  'Spice',
  'Golden',
  'Mumbai',
  'Delhi',
  'Karim',
  'Annapurna',
  'Swaad',
  'Dhaba',
  'Kitchen',
  'Flavours of',
  'The',
  'Grand',
  'Urban',
  'Classic',
  'Heritage',
  'Taste of',
  'Masala',
];

export const RESTAURANT_SUFFIXES = [
  'House',
  'Kitchen',
  'Corner',
  'Express',
  'Hub',
  'Bhavan',
  'Dhaba',
  'Cafe',
  'Eatery',
  'Delights',
  'Bistro',
  'Point',
  'Palace',
  'Garden',
  'Stop',
];

export const SEED_USERS = [
  { name: 'Admin User', email: 'admin@foodio.in', phone: '+919000000001', role: 'admin' as const },
  { name: 'Rahul Sharma', email: 'rahul@foodio.in', phone: '+919000000002', role: 'user' as const },
  { name: 'Priya Patel', email: 'priya@foodio.in', phone: '+919000000003', role: 'user' as const },
  { name: 'Amit Kumar', email: 'amit@foodio.in', phone: '+919000000004', role: 'user' as const },
  { name: 'Sneha Reddy', email: 'sneha@foodio.in', phone: '+919000000005', role: 'user' as const },
  { name: 'Vikram Singh', email: 'vikram@foodio.in', phone: '+919000000006', role: 'user' as const },
  { name: 'Ananya Iyer', email: 'ananya@foodio.in', phone: '+919000000007', role: 'user' as const },
  { name: 'Karan Mehta', email: 'karan@foodio.in', phone: '+919000000008', role: 'user' as const },
  { name: 'Fatima Khan', email: 'fatima@foodio.in', phone: '+919000000009', role: 'user' as const },
  { name: 'Arjun Das', email: 'arjun@foodio.in', phone: '+919000000010', role: 'user' as const },
];

export const SEED_PROMOS = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    discountType: 'percent' as const,
    discountValue: 10,
    minOrderAmount: 199,
    maxDiscount: 80,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
    usageLimit: 5000,
  },
  {
    code: 'FOODIO20',
    description: '20% off orders over ₹499',
    discountType: 'percent' as const,
    discountValue: 20,
    minOrderAmount: 499,
    maxDiscount: 150,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
    usageLimit: 2000,
  },
  {
    code: 'SAVE50',
    description: '₹50 off when you spend ₹399+',
    discountType: 'fixed' as const,
    discountValue: 50,
    minOrderAmount: 399,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'BIRYANI25',
    description: '25% off biryani orders',
    discountType: 'percent' as const,
    discountValue: 25,
    minOrderAmount: 299,
    maxDiscount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'FREEDEL',
    description: '₹40 off delivery fee',
    discountType: 'fixed' as const,
    discountValue: 40,
    minOrderAmount: 249,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'LUNCH15',
    description: '15% off lunch orders',
    discountType: 'percent' as const,
    discountValue: 15,
    minOrderAmount: 199,
    maxDiscount: 75,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'WEEKEND12',
    description: '12% off weekend orders',
    discountType: 'percent' as const,
    discountValue: 12,
    minOrderAmount: 299,
    maxDiscount: 90,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'THALI99',
    description: '₹99 off thali combos',
    discountType: 'fixed' as const,
    discountValue: 99,
    minOrderAmount: 499,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];
