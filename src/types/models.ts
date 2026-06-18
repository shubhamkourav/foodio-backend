export type UserRole = 'user' | 'driver' | 'admin';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'card' | 'upi' | 'cod';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Address {
  _id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface SavedPaymentMethod {
  stripePaymentMethodId: string;
  last4: string;
  brand: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface OrderItemCustomization {
  groupName: string;
  optionName: string;
  priceModifier: number;
}

export interface OrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  selectedCustomizations: OrderItemCustomization[];
  itemTotal: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
}

export interface MenuCustomizationOption {
  name: string;
  priceModifier: number;
}

export interface MenuCustomizationGroup {
  groupName: string;
  required: boolean;
  multiSelect: boolean;
  options: MenuCustomizationOption[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JwtUser {
  id: string;
  email: string;
  role: UserRole;
}
