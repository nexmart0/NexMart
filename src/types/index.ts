export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  images: string[];
  description: string;
  specifications: ProductSpecification[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  link: string;
  badge?: string;
  isActive: boolean;
  order: number;
}

export interface HomepageSection {
  id: string;
  key: 'categories' | 'newarrivals' | string;
  title: string;
  subtitle: string;
  isVisible: boolean;
  order: number;
}

export type AllowedCity = 'Dewas' | 'Indore' | 'Hatpipliya' | 'Bagli';
export const ALLOWED_CITIES: AllowedCity[] = ['Dewas', 'Indore', 'Hatpipliya', 'Bagli'];
export const FIXED_STATE = 'Madhya Pradesh';

export interface CustomerInfo {
  fullName: string;
  mobileNumber: string;
  pincode: string;
  city: AllowedCity;
  state: 'Madhya Pradesh';
  houseNo: string;
  roadName: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  codFee: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid';
  orderStatus: OrderStatus;
  trackingNumber?: string;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
}

export interface WebsiteSettings {
  storeName: string;
  tagline: string;
  logoText: string;
  logoBadge: string;
  themeColor: string; // e.g. 'indigo' | 'emerald' | 'amber' | 'blue'
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    workingHours: string;
  };
  policies: {
    aboutUs: string;
    privacyPolicy: string;
    termsAndConditions: string;
    returnPolicy: string;
    shippingPolicy: string;
  };
  socialLinks: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    twitter: string;
  };
  payment: {
    codEnabled: boolean;
    onlineEnabled: boolean;
    freeDeliveryThreshold: number;
    deliveryCharge: number;
  };
}

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockCount: number;
}

export interface CustomerSummary {
  name: string;
  mobile: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
