import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  Product,
  Category,
  Banner,
  HomepageSection,
  Order,
  WebsiteSettings,
  OrderStatus,
  ALLOWED_CITIES,
  FIXED_STATE,
  DashboardStats,
  CustomerSummary,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nexmart_db.json');

interface AdminRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: string;
  token?: string;
  tokenExpiresAt?: number;
  tokens?: { token: string; expiresAt: number }[];
  passwordInitializedWithNiShAlDaMoR?: boolean;
}

export interface DatabaseSchema {
  admin: AdminRecord;
  settings: WebsiteSettings;
  categories: Category[];
  banners: Banner[];
  sections: HomepageSection[];
  products: Product[];
  orders: Order[];
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics & Audio',
    slug: 'electronics-audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp audio gear, wireless wearables and smart accessories.',
  },
  {
    id: 'cat-2',
    name: 'Smart Gadgets',
    slug: 'smart-gadgets',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    description: 'Modern lifestyle wearables, fitness trackers and power solutions.',
  },
  {
    id: 'cat-3',
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    description: 'Premium casual wear and handcrafted modern essentials.',
  },
  {
    id: 'cat-4',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'Elevate your daily living with functional home and drinkware.',
  },
  {
    id: 'cat-5',
    name: 'Personal Care',
    slug: 'personal-care',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'Grooming and wellness designed for your daily routine.',
  },
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'Supercharge Your Audio Experience',
    subtitle: 'Active Noise Cancelling Wireless Headphones starting at ₹2,499. Exclusive Madhya Pradesh fast delivery.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=85',
    buttonText: 'Shop Electronics',
    link: '#category-electronics-audio',
    badge: 'Limited Time Deal • 40% OFF',
    isActive: true,
    order: 1,
  },
  {
    id: 'ban-2',
    title: 'Smart Tech For Everyday Peak Living',
    subtitle: 'From AMOLED smartwatches to ultra-compact fast powerbanks. Guaranteed warranty and COD.',
    image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1600&q=85',
    buttonText: 'Explore Smart Gadgets',
    link: '#category-smart-gadgets',
    badge: 'Trending Now',
    isActive: true,
    order: 2,
  },
  {
    id: 'ban-3',
    title: 'Minimal Home & Lifestyle Essentials',
    subtitle: 'Handpicked insulated steel thermoware and modern artisan kitchenware at unmissable prices.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85',
    buttonText: 'View Home Collection',
    link: '#category-home-kitchen',
    badge: 'New In Store',
    isActive: true,
    order: 3,
  },
];

const INITIAL_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-newarrivals',
    key: 'newarrivals',
    title: 'Best Seller',
    subtitle: 'Fresh drops just added to the NexMart catalog this week',
    isVisible: true,
    order: 1,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-101',
    name: 'NexPulse Pro Wireless ANC Headphones',
    slug: 'nexpulse-pro-wireless-anc-headphones',
    category: 'Electronics & Audio',
    price: 2499,
    originalPrice: 4999,
    discountPercent: 50,
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Immerse yourself in rich, deep acoustics with Active Noise Cancellation (up to 32dB). Featuring 40mm titanium dynamic drivers, 45-hour battery playtime on a single charge, dual microphone clear calling, and plush memory foam earcups for all-day listening.',
    specifications: [
      { key: 'Driver Size', value: '40mm Neodymium Titanium' },
      { key: 'Playtime', value: '45 Hours (ANC Off) / 35 Hours (ANC On)' },
      { key: 'Charging', value: 'Type-C Fast Charge (10 min = 5 hours)' },
      { key: 'Bluetooth', value: 'v5.3 with Multipoint Dual Pairing' },
      { key: 'Warranty', value: '1 Year Brand Replacement Warranty' },
    ],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'prod-102',
    name: 'ApexFit Horizon AMOLED Smartwatch',
    slug: 'apexfit-horizon-amoled-smartwatch',
    category: 'Smart Gadgets',
    price: 1899,
    originalPrice: 3499,
    discountPercent: 46,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Sleek zinc-alloy curved casing with a brilliant 1.96" Super AMOLED display (1000 nits peak brightness). Features full-time Bluetooth calling, SpO2 blood oxygen tracking, 24/7 heart rate monitor, 120+ athletic sports modes, and IP68 waterproof rating.',
    specifications: [
      { key: 'Display', value: '1.96-inch AMOLED 410x502 resolution' },
      { key: 'Battery Life', value: 'Up to 7 days typical / 15 days standby' },
      { key: 'Sensors', value: 'Optical HR, SpO2, Accelerometer, Sleep tracker' },
      { key: 'Water Resistance', value: 'IP68 Swim & Shower Proof' },
      { key: 'Compatibility', value: 'Android 6.0+ & iOS 11.0+' },
    ],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-10-02T11:00:00.000Z',
    updatedAt: '2026-10-02T11:00:00.000Z',
  },
  {
    id: 'prod-103',
    name: 'VoltCharge 20000mAh 65W PD Power Bank',
    slug: 'voltcharge-20000mah-65w-pd-power-bank',
    category: 'Smart Gadgets',
    price: 1599,
    originalPrice: 2799,
    discountPercent: 43,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'High-density airline-safe 20,000mAh lithium-polymer power bank supporting 65W Power Delivery 3.0 and Quick Charge 4.0. Capable of charging laptops, tablets, and smartphones simultaneously via triple output ports with digital LED % display.',
    specifications: [
      { key: 'Capacity', value: '20,000 mAh / 74Wh' },
      { key: 'Max Output', value: '65W Fast Charge via USB-C' },
      { key: 'Ports', value: '2x USB Type-C (PD 65W), 1x USB-A (QC 22.5W)' },
      { key: 'Safety', value: '9-Layer Smart IC Circuit Protection' },
      { key: 'Weight', value: '385 grams' },
    ],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-10-03T09:00:00.000Z',
    updatedAt: '2026-10-03T09:00:00.000Z',
  },
  {
    id: 'prod-104',
    name: 'ThermalGuard Double Wall Flask 1000ml',
    slug: 'thermalguard-double-wall-flask-1000ml',
    category: 'Home & Kitchen',
    price: 699,
    originalPrice: 1299,
    discountPercent: 46,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Constructed from food-grade 18/8 304 Stainless Steel with vacuum copper insulation. Keeps liquids steaming hot for 24 hours or icy cold for 36 hours without condensation or temperature transfer. Includes leak-proof silicone seal lid.',
    specifications: [
      { key: 'Capacity', value: '1000 ml (1 Litre)' },
      { key: 'Material', value: 'Food-Grade 304 Stainless Steel (BPA Free)' },
      { key: 'Thermal Retention', value: 'Hot: 24 hrs / Cold: 36 hrs' },
      { key: 'Finish', value: 'Matte Powder Coating Anti-Scratch' },
    ],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-10-04T14:00:00.000Z',
    updatedAt: '2026-10-04T14:00:00.000Z',
  },
  {
    id: 'prod-105',
    name: 'Artisan Matte Ceramic Coffee Mug Set of 4',
    slug: 'artisan-matte-ceramic-coffee-mug-set-of-4',
    category: 'Home & Kitchen',
    price: 849,
    originalPrice: 1499,
    discountPercent: 43,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Hand-glazed stoneware ceramic coffee cups featuring an organic earthy silhouette and comfortable oversized grip. Microwave safe, dishwasher safe, and lead-free.',
    specifications: [
      { key: 'Quantity', value: 'Set of 4 Mugs (320ml each)' },
      { key: 'Material', value: 'High-fire Stoneware Clay' },
      { key: 'Care', value: 'Microwave & Dishwasher Safe' },
      { key: 'Colorway', value: 'Nordic Sand & Slate Grey' },
    ],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-10-05T12:00:00.000Z',
    updatedAt: '2026-10-05T12:00:00.000Z',
  },
  {
    id: 'prod-106',
    name: 'PureCotton Oxford Button-Down Casual Shirt',
    slug: 'purecotton-oxford-button-down-casual-shirt',
    category: 'Fashion & Apparel',
    price: 999,
    originalPrice: 1899,
    discountPercent: 47,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Tailored from 100% breathable combed long-staple cotton yarn. Features a button-down collar, structured cuffs, and curved hem that looks sharp whether tucked or untucked.',
    specifications: [
      { key: 'Fabric', value: '100% Premium Combed Cotton' },
      { key: 'Fit', value: 'Contemporary Regular Fit' },
      { key: 'Pattern', value: 'Solid Textured Oxford Weave' },
      { key: 'Care', value: 'Machine wash warm, tumble dry gentle' },
    ],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-10-06T10:00:00.000Z',
    updatedAt: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 'prod-107',
    name: 'Heritage Top-Grain RFID Leather Bifold Wallet',
    slug: 'heritage-top-grain-rfid-leather-bifold-wallet',
    category: 'Fashion & Apparel',
    price: 799,
    originalPrice: 1499,
    discountPercent: 47,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Engineered with full-grain genuine buffalo leather that develops a rich vintage patina over time. Equipped with certified RFID electromagnetic blocking shield to protect cards against unauthorized skimming.',
    specifications: [
      { key: 'Material', value: '100% Full Grain Leather' },
      { key: 'Slots', value: '8 Card Slots, 2 Cash Sleeves, 1 ID Window' },
      { key: 'Security', value: 'RFID Shielded 13.56 MHz' },
      { key: 'Thickness', value: 'Ultra-slim 1.2 cm profile' },
    ],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-10-07T08:00:00.000Z',
    updatedAt: '2026-10-07T08:00:00.000Z',
  },
  {
    id: 'prod-108',
    name: 'SonicClean Ultra Sonic Electric Toothbrush',
    slug: 'sonicclean-ultra-sonic-electric-toothbrush',
    category: 'Personal Care',
    price: 1199,
    originalPrice: 2299,
    discountPercent: 48,
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1559591937-e62fb33091ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Up to 42,000 micro-vibrations per minute for clinic-grade dental plaque removal. Features 5 cleaning modes (Clean, White, Sensitive, Polish, Massage), smart 2-minute quadrant timer, and a 90-day battery life per USB-C charge.',
    specifications: [
      { key: 'Frequency', value: '42,000 vibrations / min' },
      { key: 'Modes', value: '5 Distinct Oral Care Settings' },
      { key: 'Battery', value: '90 Days on a single 3-hour charge' },
      { key: 'Waterproof', value: 'IPX7 100% Washable' },
      { key: 'In The Box', value: 'Toothbrush body, 2 DuPont brush heads, USB-C cable' },
    ],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-10-08T09:30:00.000Z',
    updatedAt: '2026-10-08T09:30:00.000Z',
  },
];

const INITIAL_SETTINGS: WebsiteSettings = {
  storeName: 'NexMart',
  tagline: 'Your Trusted Online Shopping Destination',
  logoText: 'NexMart',
  logoBadge: 'MP Verified Store',
  themeColor: 'indigo',
  announcementBar: {
    enabled: true,
    text: '⚡ Free Express Delivery on orders above ₹499 in Dewas, Indore, Hatpipliya & Bagli! Cash on Delivery Available.',
    link: '#newarrivals',
  },
  contact: {
    phone: '+91 98260 12345',
    email: 'support@nexmart.in',
    address: 'NexMart Commercial Hub, A.B. Road, Dewas - 455001, Madhya Pradesh',
    workingHours: 'Mon - Sun: 9:00 AM to 9:00 PM IST',
  },
  policies: {
    aboutUs: 'NexMart was founded with a singular mission: to bring authentic, high-quality, verified lifestyle and electronic products straight to customers across Madhya Pradesh. We operate local fulfillment hubs ensuring speedy dispatch, genuine product guarantees, and hassle-free Cash on Delivery.',
    privacyPolicy: 'We respect your confidentiality. NexMart strictly uses customer details (name, delivery address, phone number) exclusively for processing order fulfillment and logistics updates. We never sell, rent, or distribute your private personal data to external advertisers.',
    termsAndConditions: 'By placing an order on NexMart, you confirm that you are authorized to place orders and have supplied accurate shipping details within our active service territories. All items are dispatched with authentic tax invoices.',
    returnPolicy: 'We offer an easy 7-day doorstep replacement or refund guarantee on all products if received damaged, defective, or noticeably different from the product description. Simply contact our support team with your Order ID.',
    shippingPolicy: 'We currently deliver directly across Dewas, Indore, Hatpipliya, and Bagli. Orders placed before 4:00 PM are dispatched on the same day. Standard delivery completes within 24 to 48 hours with live SMS tracking.',
  },
  socialLinks: {
    whatsapp: 'https://wa.me/919826012345',
    instagram: 'https://instagram.com/nexmart.official',
    facebook: 'https://facebook.com/nexmart.store',
    twitter: 'https://twitter.com/nexmart_in',
  },
  payment: {
    codEnabled: true,
    onlineEnabled: false,
    freeDeliveryThreshold: 499,
    deliveryCharge: 40,
  },
};

// Seed an initial demo order so dashboard statistics have real data right away
const INITIAL_ORDERS: Order[] = [
  {
    id: 'NEX-20261008-8012',
    customer: {
      fullName: 'Rahul Sharma',
      mobileNumber: '9826123456',
      pincode: '455001',
      city: 'Dewas',
      state: 'Madhya Pradesh',
      houseNo: 'Flat 302, Royal Residency',
      roadName: 'Moti Bungalow Road',
    },
    items: [
      {
        productId: 'prod-101',
        productName: 'NexPulse Pro Wireless ANC Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        price: 2499,
        quantity: 1,
        subtotal: 2499,
      },
    ],
    subtotal: 2499,
    deliveryFee: 0,
    codFee: 50,
    totalAmount: 2549,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'Delivered',
    trackingNumber: 'DEL-MP-98124',
    statusHistory: [
      { status: 'Pending', timestamp: '2026-10-08T10:15:00.000Z', note: 'Order placed via Cash on Delivery (₹50 COD charge applied).' },
      { status: 'Confirmed', timestamp: '2026-10-08T10:30:00.000Z', note: 'Order confirmed by store' },
      { status: 'Processing', timestamp: '2026-10-08T11:00:00.000Z', note: 'Packed at Dewas fulfillment center' },
      { status: 'Shipped', timestamp: '2026-10-08T14:00:00.000Z', note: 'Dispatched with local rider' },
      { status: 'Delivered', timestamp: '2026-10-09T11:30:00.000Z', note: 'Handed over to customer Rahul Sharma' },
    ],
    createdAt: '2026-10-08T10:15:00.000Z',
  },
  {
    id: 'NEX-20261009-4190',
    customer: {
      fullName: 'Pooja Verma',
      mobileNumber: '9425098765',
      pincode: '452001',
      city: 'Indore',
      state: 'Madhya Pradesh',
      houseNo: 'House 45',
      roadName: 'Vijay Nagar Main Road',
    },
    items: [
      {
        productId: 'prod-102',
        productName: 'ApexFit Horizon AMOLED Smartwatch',
        productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        price: 1899,
        quantity: 1,
        subtotal: 1899,
      },
      {
        productId: 'prod-104',
        productName: 'ThermalGuard Double Wall Flask 1000ml',
        productImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
        price: 699,
        quantity: 1,
        subtotal: 699,
      },
    ],
    subtotal: 2598,
    deliveryFee: 0,
    codFee: 50,
    totalAmount: 2648,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'Shipped',
    trackingNumber: 'TRK-IND-24891',
    statusHistory: [
      { status: 'Pending', timestamp: '2026-10-09T09:20:00.000Z', note: 'Order placed via Cash on Delivery (₹50 COD charge applied).' },
      { status: 'Confirmed', timestamp: '2026-10-09T09:45:00.000Z', note: 'Customer contact verified' },
      { status: 'Processing', timestamp: '2026-10-09T10:30:00.000Z', note: 'Quality check passed' },
      { status: 'Shipped', timestamp: '2026-10-09T15:00:00.000Z', note: 'In transit to Indore Hub' },
    ],
    createdAt: '2026-10-09T09:20:00.000Z',
  },
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadOrInitialize();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.products && parsed.admin) {
          // Ensure admin password is reset to initial password "NiShAlDaMoR"
          if (!parsed.admin.passwordInitializedWithNiShAlDaMoR) {
            const salt = crypto.randomBytes(16).toString('hex');
            parsed.admin.salt = salt;
            parsed.admin.passwordHash = hashPassword('NiShAlDaMoR', salt);
            parsed.admin.passwordInitializedWithNiShAlDaMoR = true;
            this.persist(parsed);
          }
          // Ensure existing orders have codFee
          if (Array.isArray(parsed.orders)) {
            let orderUpdated = false;
            for (const ord of parsed.orders) {
              if (ord.codFee === undefined) {
                ord.codFee = ord.paymentMethod === 'cod' ? 50 : 0;
                orderUpdated = true;
              }
            }
            if (orderUpdated) {
              this.persist(parsed);
            }
          }
          // Ensure sections only contain newarrivals
          if (Array.isArray(parsed.sections)) {
            const validKeys = ['newarrivals'];
            const cleanedSections = parsed.sections.filter((s: any) => validKeys.includes(s.key));
            if (cleanedSections.length !== parsed.sections.length || !cleanedSections.some((s: any) => s.key === 'newarrivals')) {
              parsed.sections = INITIAL_SECTIONS;
              this.persist(parsed);
            }
          }

          // Deduplicate products by ID if needed
          if (Array.isArray(parsed.products)) {
            const seen = new Set<string>();
            const uniqueProds = parsed.products.filter((p: any) => {
              if (!p.id || seen.has(p.id)) return false;
              seen.add(p.id);
              return true;
            });
            if (uniqueProds.length !== parsed.products.length) {
              parsed.products = uniqueProds;
              this.persist(parsed);
            }
          }

          return parsed;
        }
      } catch (err) {
        console.error('Failed reading existing db, will re-initialize seed:', err);
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword('NiShAlDaMoR', salt);

    const initialDb: DatabaseSchema = {
      admin: {
        id: 'admin-master',
        email: 'admin@nexmart.com',
        name: 'NexMart Store Manager',
        role: 'superadmin',
        salt,
        passwordHash,
      },
      settings: INITIAL_SETTINGS,
      categories: INITIAL_CATEGORIES,
      banners: INITIAL_BANNERS,
      sections: INITIAL_SECTIONS,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
    };

    this.persist(initialDb);
    return initialDb;
  }

  private persist(dbData: DatabaseSchema) {
    const tmpFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(dbData, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  private save() {
    this.persist(this.data);
  }

  // --- ADMIN AUTH ---
  public verifyAdminPassword(pass: string): { token: string; user: { name: string } } | null {
    if (!pass) return null;
    const checkHash = hashPassword(pass, this.data.admin.salt);
    if (checkHash !== this.data.admin.passwordHash) {
      return null;
    }

    // Generate session token valid for 7 days
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.data.admin.token = token;
    this.data.admin.tokenExpiresAt = expiresAt;

    if (!Array.isArray(this.data.admin.tokens)) {
      this.data.admin.tokens = [];
    }
    // Clean up expired tokens
    const now = Date.now();
    this.data.admin.tokens = this.data.admin.tokens.filter((t) => t.expiresAt > now);
    this.data.admin.tokens.push({ token, expiresAt });
    this.save();

    return {
      token,
      user: {
        name: this.data.admin.name || 'NexMart Admin',
      },
    };
  }

  public verifyAdminLogin(email: string, pass: string): { token: string; user: { email: string; name: string } } | null {
    return this.verifyAdminPassword(pass) ? {
      token: this.data.admin.token!,
      user: { email: this.data.admin.email, name: this.data.admin.name },
    } : null;
  }

  public validateAdminToken(token: string | undefined): boolean {
    if (!token) return false;
    const cleanToken = token.replace('Bearer ', '').trim();
    if (!cleanToken) return false;

    const now = Date.now();
    if (
      this.data.admin.token &&
      this.data.admin.token === cleanToken &&
      this.data.admin.tokenExpiresAt &&
      this.data.admin.tokenExpiresAt > now
    ) {
      return true;
    }

    if (Array.isArray(this.data.admin.tokens)) {
      const match = this.data.admin.tokens.find((t) => t.token === cleanToken && t.expiresAt > now);
      if (match) return true;
    }

    return false;
  }

  public changeAdminPassword(currentPass: string, newPass: string): boolean {
    const currentHash = hashPassword(currentPass, this.data.admin.salt);
    if (currentHash !== this.data.admin.passwordHash) {
      return false;
    }
    const newSalt = crypto.randomBytes(16).toString('hex');
    this.data.admin.salt = newSalt;
    this.data.admin.passwordHash = hashPassword(newPass, newSalt);
    this.save();
    return true;
  }

  // --- PRODUCTS ---
  public getCustomerProducts(query?: string, categorySlug?: string, sort?: string): Product[] {
    let list = this.data.products.filter((p) => p.isPublished);

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (categorySlug && categorySlug !== 'all') {
      const cat = this.data.categories.find((c) => c.slug === categorySlug);
      const catName = cat ? cat.name : categorySlug;
      list = list.filter((p) => p.category.toLowerCase() === catName.toLowerCase());
    }

    if (sort === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }

  public getProductById(id: string): Product | null {
    return this.data.products.find((p) => p.id === id) || null;
  }

  public getAllProductsAdmin(): Product[] {
    return this.data.products || [];
  }

  public createProduct(payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'>): Product {
    // Guard against accidental double submit or duplicate insert operations
    const now = Date.now();
    const existing = this.data.products.find(
      (p) =>
        p.name.trim().toLowerCase() === payload.name.trim().toLowerCase() &&
        p.category === payload.category &&
        p.price === payload.price &&
        now - new Date(p.createdAt).getTime() < 3000
    );
    if (existing) {
      return existing;
    }

    const slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const newProduct: Product = {
      ...payload,
      id: `prod-${Date.now()}`,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public updateProductStock(id: string, stock: number): Product | null {
    const product = this.data.products.find((p) => p.id === id);
    if (!product) return null;
    product.stock = Math.max(0, stock);
    product.updatedAt = new Date().toISOString();
    this.save();
    return product;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    // dynamically attach product counts
    return this.data.categories.map((c) => {
      const count = this.data.products.filter((p) => p.category.toLowerCase() === c.name.toLowerCase() && p.isPublished).length;
      return { ...c, productCount: count };
    });
  }

  public saveCategories(categories: Category[]) {
    this.data.categories = categories;
    this.save();
  }

  // --- BANNERS ---
  public getBanners(activeOnly = false): Banner[] {
    if (activeOnly) {
      return this.data.banners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
    }
    return this.data.banners.sort((a, b) => a.order - b.order);
  }

  public saveBanners(banners: Banner[]) {
    this.data.banners = banners;
    this.save();
  }

  // --- SECTIONS ---
  public getHomepageSections(): HomepageSection[] {
    const validKeys = ['newarrivals'];
    const filtered = (this.data.sections || []).filter((s) => validKeys.includes(s.key));
    if (filtered.length === 0) {
      this.data.sections = INITIAL_SECTIONS;
      this.save();
      return INITIAL_SECTIONS;
    }
    return filtered.sort((a, b) => a.order - b.order);
  }

  public saveHomepageSections(sections: HomepageSection[]) {
    const validKeys = ['newarrivals'];
    this.data.sections = sections.filter((s) => validKeys.includes(s.key));
    this.save();
  }

  // --- SETTINGS ---
  public getSettings(): WebsiteSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.save();
    return this.data.settings;
  }

  // --- ORDERS & CHECKOUT ---
  public createOrder(payload: {
    customer: {
      fullName: string;
      mobileNumber: string;
      pincode: string;
      city: string;
      state: string;
      houseNo: string;
      roadName: string;
    };
    items: { productId: string; quantity: number }[];
    paymentMethod: 'cod' | 'online';
  }): { success: true; order: Order } | { success: false; error: string } {
    // 1. Validate customer input
    if (!payload.customer.fullName || payload.customer.fullName.trim().length < 2) {
      return { success: false, error: 'Full Name is required and must be at least 2 characters.' };
    }

    const mobileClean = payload.customer.mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(mobileClean)) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' };
    }

    const pincodeClean = payload.customer.pincode.replace(/\D/g, '');
    if (!/^\d{6}$/.test(pincodeClean)) {
      return { success: false, error: 'PIN Code must be exactly 6 digits.' };
    }

    if (!ALLOWED_CITIES.includes(payload.customer.city as any)) {
      return { success: false, error: `Delivery is currently supported only in: ${ALLOWED_CITIES.join(', ')}.` };
    }

    if (payload.customer.state !== FIXED_STATE) {
      return { success: false, error: `Delivery state is fixed to ${FIXED_STATE}.` };
    }

    if (!payload.customer.houseNo || !payload.customer.houseNo.trim()) {
      return { success: false, error: 'House No. / Building Name is required.' };
    }

    if (!payload.customer.roadName || !payload.customer.roadName.trim()) {
      return { success: false, error: 'Road Name / Area / Colony is required.' };
    }

    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items to checkout.' };
    }

    // 2. Validate stock & assemble items against trusted DB data
    const verifiedItems: Order['items'] = [];
    let subtotal = 0;

    for (const reqItem of payload.items) {
      const product = this.data.products.find((p) => p.id === reqItem.productId);
      if (!product) {
        return { success: false, error: `Product with ID ${reqItem.productId} was not found.` };
      }
      if (!product.isPublished) {
        return { success: false, error: `"${product.name}" is no longer available.` };
      }
      if (product.stock < reqItem.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) remaining.`,
        };
      }

      const itemTotal = product.price * reqItem.quantity;
      subtotal += itemTotal;
      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || '',
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: reqItem.quantity,
        subtotal: itemTotal,
      });
    }

    // 3. Calculate delivery fee & fixed ₹50 COD fee based on requirements
    const settings = this.data.settings;
    const deliveryFee =
      subtotal >= settings.payment.freeDeliveryThreshold ? 0 : settings.payment.deliveryCharge;
    const isCod = (payload.paymentMethod || 'cod') === 'cod';
    const codFee = isCod ? 50 : 0;
    const totalAmount = subtotal + deliveryFee + codFee;

    // 4. Atomically decrement stock
    for (const reqItem of payload.items) {
      const product = this.data.products.find((p) => p.id === reqItem.productId)!;
      product.stock -= reqItem.quantity;
      product.updatedAt = new Date().toISOString();
    }

    // 5. Generate unique order ID
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `NEX-${dateStr}-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      customer: {
        fullName: payload.customer.fullName.trim(),
        mobileNumber: mobileClean,
        pincode: pincodeClean,
        city: payload.customer.city as any,
        state: FIXED_STATE,
        houseNo: payload.customer.houseNo.trim(),
        roadName: payload.customer.roadName.trim(),
      },
      items: verifiedItems,
      subtotal,
      deliveryFee,
      codFee,
      totalAmount,
      paymentMethod: payload.paymentMethod || 'cod',
      paymentStatus: 'pending',
      orderStatus: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: isCod
            ? 'Order placed via Cash on Delivery (₹50 COD charge applied).'
            : 'Order placed via Online Payment.',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    this.data.orders.unshift(newOrder);
    this.save();

    return { success: true, order: newOrder };
  }

  public getOrders(filters?: { status?: string; search?: string; startDate?: string; endDate?: string }): Order[] {
    let list = this.data.orders;

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((o) => o.orderStatus === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.mobileNumber.includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.city.toLowerCase().includes(q)
      );
    }

    if (filters?.startDate) {
      const start = new Date(filters.startDate).getTime();
      list = list.filter((o) => new Date(o.createdAt).getTime() >= start);
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate).getTime();
      list = list.filter((o) => new Date(o.createdAt).getTime() <= end);
    }

    return list;
  }

  public getOrderById(id: string): Order | null {
    return this.data.orders.find((o) => o.id === id) || null;
  }

  public trackOrder(orderId: string, mobileNumber: string): Order | null {
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const cleanId = orderId.trim();
    const order = this.data.orders.find(
      (o) => o.id.toLowerCase() === cleanId.toLowerCase() && o.customer.mobileNumber === cleanMobile
    );
    return order || null;
  }

  public updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, note?: string): Order | null {
    const order = this.data.orders.find((o) => o.id === id);
    if (!order) return null;

    order.orderStatus = status;
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber.trim();
    }

    if (status === 'Delivered') {
      order.paymentStatus = 'paid';
    }

    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status changed to ${status}`,
    });

    this.save();
    return order;
  }

  // --- DASHBOARD STATS ---
  public getDashboardStats(): DashboardStats {
    const totalOrders = this.data.orders.length;
    const totalProducts = this.data.products.length;

    // unique customers by mobile
    const customerMobiles = new Set(this.data.orders.map((o) => o.customer.mobileNumber));
    const totalCustomers = customerMobiles.size;

    // total sales excluding Cancelled orders
    const validOrders = this.data.orders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalSales = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = this.data.orders.filter((o) => o.orderStatus === 'Pending').length;
    const confirmedOrders = this.data.orders.filter((o) => o.orderStatus === 'Confirmed').length;
    const processingOrders = this.data.orders.filter((o) => o.orderStatus === 'Processing').length;
    const shippedOrders = this.data.orders.filter((o) => o.orderStatus === 'Shipped').length;
    const deliveredOrders = this.data.orders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = this.data.orders.filter((o) => o.orderStatus === 'Cancelled').length;

    const lowStockCount = this.data.products.filter((p) => p.stock <= 5).length;

    return {
      totalOrders,
      totalProducts,
      totalCustomers,
      totalSales,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockCount,
    };
  }

  // --- CUSTOMERS ---
  public getCustomersSummary(): CustomerSummary[] {
    const map = new Map<string, CustomerSummary>();

    for (const order of this.data.orders) {
      const mob = order.customer.mobileNumber;
      if (!map.has(mob)) {
        map.set(mob, {
          name: order.customer.fullName,
          mobile: mob,
          city: order.customer.city,
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
        });
      }

      const rec = map.get(mob)!;
      rec.ordersCount += 1;
      if (order.orderStatus !== 'Cancelled') {
        rec.totalSpent += order.totalAmount;
      }
      if (new Date(order.createdAt).getTime() > new Date(rec.lastOrderDate).getTime()) {
        rec.lastOrderDate = order.createdAt;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }
}

export const db = new DatabaseService();
