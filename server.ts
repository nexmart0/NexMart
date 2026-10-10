import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- AUTH MIDDLEWARE ---
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !db.validateAdminToken(authHeader)) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required or expired.' });
    return;
  }
  next();
}

// ==========================================
// PUBLIC CUSTOMER API ROUTES
// ==========================================

// Get customer products
app.get('/api/products', (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;

  const products = db.getCustomerProducts(query, category, sort);
  res.json({ products });
});

// Get single product details
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  // Related products from same category
  const related = db
    .getCustomerProducts(undefined, undefined, undefined)
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  res.json({ product, related });
});

// Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = db.getCategories();
  res.json({ categories });
});

// Active promotional banners
app.get('/api/banners', (_req: Request, res: Response) => {
  const banners = db.getBanners(true);
  res.json({ banners });
});

// Homepage sections configuration
app.get('/api/homepage-sections', (_req: Request, res: Response) => {
  const sections = db.getHomepageSections();
  res.json({ sections });
});

// Public store settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

// Create order / Checkout
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { customer, items, paymentMethod } = req.body;
    if (!customer || !items) {
      res.status(400).json({ error: 'Missing customer details or items in order request.' });
      return;
    }

    const result = db.createOrder({ customer, items, paymentMethod });
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: result.order,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error processing order.' });
  }
});

// Customer Order Tracking
app.post('/api/orders/track', (req: Request, res: Response) => {
  const { orderId, mobileNumber } = req.body;
  if (!orderId || !mobileNumber) {
    res.status(400).json({ error: 'Please provide both Order ID and registered Mobile Number.' });
    return;
  }

  const order = db.trackOrder(orderId, mobileNumber);
  if (!order) {
    res.status(404).json({
      error: 'No order matching this Order ID and Mobile Number was found. Please check your details.',
    });
    return;
  }

  res.json({ success: true, order });
});

// ==========================================
// ADMIN AUTHENTICATION & MANAGEMENT ROUTES
// ==========================================

// Admin login (password only)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Password is required.' });
    return;
  }

  const auth = db.verifyAdminPassword(password);
  if (!auth) {
    res.status(401).json({ error: 'Incorrect administrator password.' });
    return;
  }

  res.json({ success: true, token: auth.token, user: auth.user });
});

// Admin verify session
app.get('/api/admin/me', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, user: { role: 'admin' } });
});

// Admin change password
app.post('/api/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    return;
  }

  const ok = db.changeAdminPassword(currentPassword, newPassword);
  if (!ok) {
    res.status(400).json({ error: 'Current password verification failed.' });
    return;
  }

  res.json({ success: true, message: 'Admin password successfully updated.' });
});

// Dashboard stats
app.get('/api/admin/dashboard-stats', requireAdminAuth, (_req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  res.json({ stats });
});

// All products for admin (published + unpublished)
app.get('/api/admin/products', requireAdminAuth, (_req: Request, res: Response) => {
  const products = db.getAllProductsAdmin();
  res.json({ products });
});

// Create product
app.post('/api/admin/products', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      discountPercent,
      stock,
      images,
      description,
      specifications,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isPublished,
    } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      res.status(400).json({ error: 'Name, category, price, and stock are required.' });
      return;
    }

    const newProd = db.createProduct({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      stock: Number(stock),
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      description: description || '',
      specifications: Array.isArray(specifications) ? specifications : [],
      isFeatured: !!isFeatured,
      isBestSeller: !!isBestSeller,
      isNewArrival: !!isNewArrival,
      isPublished: isPublished !== false,
    });

    res.status(201).json({ success: true, product: newProd });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed creating product' });
  }
});

// Update product
app.put('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed updating product' });
  }
});

// Quick update stock
app.patch('/api/admin/products/:id/stock', requireAdminAuth, (req: Request, res: Response) => {
  const stock = Number(req.body.stock);
  if (isNaN(stock) || stock < 0) {
    res.status(400).json({ error: 'Invalid stock quantity' });
    return;
  }
  const updated = db.updateProductStock(req.params.id, stock);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true, product: updated });
});

// Delete product
app.delete('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const ok = db.deleteProduct(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Product not found or already deleted' });
    return;
  }
  res.json({ success: true, message: 'Product deleted successfully' });
});

// Admin categories
app.get('/api/admin/categories', requireAdminAuth, (_req: Request, res: Response) => {
  const categories = db.getCategories();
  res.json({ categories });
});

app.put('/api/admin/categories', requireAdminAuth, (req: Request, res: Response) => {
  if (!Array.isArray(req.body.categories)) {
    res.status(400).json({ error: 'Expected an array of categories.' });
    return;
  }
  db.saveCategories(req.body.categories);
  res.json({ success: true, categories: db.getCategories() });
});

// Admin Banners
app.get('/api/admin/banners', requireAdminAuth, (_req: Request, res: Response) => {
  const banners = db.getBanners(false);
  res.json({ banners });
});

app.put('/api/admin/banners', requireAdminAuth, (req: Request, res: Response) => {
  if (!Array.isArray(req.body.banners)) {
    res.status(400).json({ error: 'Expected an array of banners.' });
    return;
  }
  db.saveBanners(req.body.banners);
  res.json({ success: true, banners: db.getBanners(false) });
});

// Admin Homepage Sections
app.get('/api/admin/homepage-sections', requireAdminAuth, (_req: Request, res: Response) => {
  const sections = db.getHomepageSections();
  res.json({ sections });
});

app.put('/api/admin/homepage-sections', requireAdminAuth, (req: Request, res: Response) => {
  if (!Array.isArray(req.body.sections)) {
    res.status(400).json({ error: 'Expected an array of homepage sections.' });
    return;
  }
  db.saveHomepageSections(req.body.sections);
  res.json({ success: true, sections: db.getHomepageSections() });
});

// Admin Orders
app.get('/api/admin/orders', requireAdminAuth, (req: Request, res: Response) => {
  const { status, search, startDate, endDate } = req.query;
  const orders = db.getOrders({
    status: typeof status === 'string' ? status : undefined,
    search: typeof search === 'string' ? search : undefined,
    startDate: typeof startDate === 'string' ? startDate : undefined,
    endDate: typeof endDate === 'string' ? endDate : undefined,
  });
  res.json({ orders });
});

// Admin Order details
app.get('/api/admin/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ order });
});

// Admin Update Order Status
app.patch('/api/admin/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { status, trackingNumber, note } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Order status is required' });
    return;
  }
  const updated = db.updateOrderStatus(req.params.id, status, trackingNumber, note);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ success: true, order: updated });
});

// Export orders to CSV
app.get('/api/admin/orders/export/csv', requireAdminAuth, (_req: Request, res: Response) => {
  const orders = db.getOrders();
  const headers = [
    'Order ID',
    'Date',
    'Customer Name',
    'Mobile',
    'City',
    'State',
    'Full Address',
    'Items Count',
    'Subtotal (INR)',
    'Delivery Fee (INR)',
    'COD Charge (INR)',
    'Total Amount (INR)',
    'Payment Method',
    'Order Status',
    'Tracking Number',
  ];

  const escapeCsv = (val: any) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = orders.map((o) => [
    escapeCsv(o.id),
    escapeCsv(o.createdAt),
    escapeCsv(o.customer.fullName),
    escapeCsv(o.customer.mobileNumber),
    escapeCsv(o.customer.city),
    escapeCsv(o.customer.state),
    escapeCsv(`${o.customer.houseNo}, ${o.customer.roadName}, ${o.customer.city} - ${o.customer.pincode}`),
    escapeCsv(o.items.reduce((acc, i) => acc + i.quantity, 0)),
    escapeCsv(o.subtotal),
    escapeCsv(o.deliveryFee),
    escapeCsv(o.codFee ?? (o.paymentMethod === 'cod' ? 50 : 0)),
    escapeCsv(o.totalAmount),
    escapeCsv(o.paymentMethod.toUpperCase()),
    escapeCsv(o.orderStatus),
    escapeCsv(o.trackingNumber || 'N/A'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=nexmart_orders_${Date.now()}.csv`);
  res.send(csvContent);
});

// Admin Customers Summary
app.get('/api/admin/customers', requireAdminAuth, (_req: Request, res: Response) => {
  const customers = db.getCustomersSummary();
  res.json({ customers });
});

// Admin Settings
app.get('/api/admin/settings', requireAdminAuth, (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

app.put('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 NexMart Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
