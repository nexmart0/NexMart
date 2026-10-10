import {
  Product,
  Category,
  Banner,
  HomepageSection,
  Order,
  WebsiteSettings,
  DashboardStats,
  CustomerSummary,
  OrderStatus,
} from '../types/index.ts';

const TOKEN_KEY = 'nexmart_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string, remember = true) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

function adminHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...adminHeaders(),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearAdminToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('admin_unauthorized'));
    }
  }
  return res;
}

export const api = {
  // Public Store APIs
  async getProducts(params?: { q?: string; category?: string; sort?: string }): Promise<Product[]> {
    const url = new URL('/api/products', window.location.origin);
    if (params?.q) url.searchParams.set('q', params.q);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.sort) url.searchParams.set('sort', params.sort);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  },

  async getProductById(id: string): Promise<{ product: Product; related: Product[] }> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.categories;
  },

  async getBanners(): Promise<Banner[]> {
    const res = await fetch('/api/banners');
    if (!res.ok) throw new Error('Failed to fetch banners');
    const data = await res.json();
    return data.banners;
  },

  async getHomepageSections(): Promise<HomepageSection[]> {
    const res = await fetch('/api/homepage-sections');
    if (!res.ok) throw new Error('Failed to fetch homepage sections');
    const data = await res.json();
    return data.sections;
  },

  async getSettings(): Promise<WebsiteSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch website settings');
    const data = await res.json();
    return data.settings;
  },

  async createOrder(payload: {
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
  }): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place order');
    }
    return data;
  },

  async trackOrder(orderId: string, mobileNumber: string): Promise<Order> {
    const res = await fetch('/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, mobileNumber }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Order lookup failed');
    }
    return data.order;
  },

  // Admin APIs
  async adminLogin(password: string): Promise<{ token: string; user: { name: string } }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Admin login failed');
    }
    return data;
  },

  async getAdminMe(): Promise<{ success: boolean; user: any }> {
    const res = await adminFetch('/api/admin/me');
    if (!res.ok) throw new Error('Admin session expired or invalid');
    return res.json();
  },

  async changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await adminFetch('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await adminFetch('/api/admin/dashboard-stats');
    if (!res.ok) throw new Error('Failed to load dashboard statistics');
    const data = await res.json();
    return data.stats;
  },

  async getAdminProducts(): Promise<Product[]> {
    const res = await adminFetch('/api/admin/products');
    if (!res.ok) throw new Error('Failed to fetch admin products');
    const data = await res.json();
    return data.products || [];
  },

  async createAdminProduct(productData: Partial<Product>): Promise<Product> {
    const res = await adminFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data.product;
  },

  async updateAdminProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await adminFetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data.product;
  },

  async updateStock(id: string, stock: number): Promise<Product> {
    const res = await adminFetch(`/api/admin/products/${encodeURIComponent(id)}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update stock');
    return data.product;
  },

  async deleteAdminProduct(id: string): Promise<void> {
    const res = await adminFetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete product');
  },

  async getAdminOrders(params?: { status?: string; search?: string; startDate?: string; endDate?: string }): Promise<Order[]> {
    const url = new URL('/api/admin/orders', window.location.origin);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.startDate) url.searchParams.set('startDate', params.startDate);
    if (params?.endDate) url.searchParams.set('endDate', params.endDate);

    const res = await adminFetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.orders || [];
  },

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, note?: string): Promise<Order> {
    const res = await adminFetch(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, trackingNumber, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data.order;
  },

  async getAdminCustomers(): Promise<CustomerSummary[]> {
    const res = await adminFetch('/api/admin/customers');
    if (!res.ok) throw new Error('Failed to fetch customers');
    const data = await res.json();
    return data.customers || [];
  },

  async getAdminBanners(): Promise<Banner[]> {
    const res = await adminFetch('/api/admin/banners');
    if (!res.ok) throw new Error('Failed to fetch banners');
    const data = await res.json();
    return data.banners || [];
  },

  async saveAdminBanners(banners: Banner[]): Promise<Banner[]> {
    const res = await adminFetch('/api/admin/banners', {
      method: 'PUT',
      body: JSON.stringify({ banners }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save banners');
    return data.banners || [];
  },

  async getAdminHomepageSections(): Promise<HomepageSection[]> {
    const res = await adminFetch('/api/admin/homepage-sections');
    if (!res.ok) throw new Error('Failed to fetch homepage sections');
    const data = await res.json();
    return data.sections || [];
  },

  async saveAdminHomepageSections(sections: HomepageSection[]): Promise<HomepageSection[]> {
    const res = await adminFetch('/api/admin/homepage-sections', {
      method: 'PUT',
      body: JSON.stringify({ sections }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save sections');
    return data.sections || [];
  },

  async getAdminSettings(): Promise<WebsiteSettings> {
    const res = await adminFetch('/api/admin/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    return data.settings;
  },

  async saveAdminSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const res = await adminFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save settings');
    return data.settings;
  },
};
