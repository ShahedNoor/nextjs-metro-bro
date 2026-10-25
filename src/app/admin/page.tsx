'use client';

import { useState, useEffect } from 'react';
import { Product, Order, parseProductImages } from '@/types';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Settings,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  Check,
  AlertCircle,
  RefreshCw,
  LogOut,
  Lock,
  Eye,
  Send,
  Truck,
  Upload,
  X
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'orders' | 'products' | 'settings' | 'whatsapp'
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'whatsapp'>('orders');

  // Delivery Charges & Store Settings
  const [deliveryInsideDhaka, setDeliveryInsideDhaka] = useState(80);
  const [deliveryOutsideDhaka, setDeliveryOutsideDhaka] = useState(120);
  const [brandPhone, setBrandPhone] = useState('8801799767774');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Filter for orders
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Product Edit/Create Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [productForm, setProductForm] = useState<{
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    images: string[];
    badge: string;
    available: boolean;
  }>({
    id: '',
    name: '',
    price: 0,
    description: '',
    image: '',
    images: [],
    badge: '',
    available: true
  });

  // Telegram Testing & Configuration
  const [testTgToken, setTestTgToken] = useState('');
  const [testTgChatId, setTestTgChatId] = useState('');
  const [testTgStatus, setTestTgStatus] = useState<{ loading: boolean; message: string; error?: boolean } | null>(null);
  const [savingTg, setSavingTg] = useState(false);
  const [tgSavedSuccess, setTgSavedSuccess] = useState('');

  // WhatsApp Testing & Configuration
  const [testNumberId, setTestNumberId] = useState('');
  const [testToken, setTestToken] = useState('');
  const [testRecipient, setTestRecipient] = useState('8801799767774');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message: string; error?: boolean } | null>(null);
  const [savingWa, setSavingWa] = useState(false);
  const [waSavedSuccess, setWaSavedSuccess] = useState('');

  // Check existing session
  useEffect(() => {
    const session = sessionStorage.getItem('metro_admin_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  async function loadData() {
    setLoading(true);
    try {
      const [resProd, resOrd, resSet] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()).catch(() => null)
      ]);

      if (resProd?.products) setProducts(resProd.products);
      if (resOrd?.orders) setOrders(resOrd.orders);
      if (resSet?.settings) {
        if (resSet.settings.deliveryInsideDhaka !== undefined) {
          setDeliveryInsideDhaka(Number(resSet.settings.deliveryInsideDhaka));
        }
        if (resSet.settings.deliveryOutsideDhaka !== undefined) {
          setDeliveryOutsideDhaka(Number(resSet.settings.deliveryOutsideDhaka));
        }
        if (resSet.settings.whatsappNumber) {
          setBrandPhone(resSet.settings.whatsappNumber);
          setTestRecipient(resSet.settings.whatsappNumber);
        }
        if (resSet.settings.telegramBotToken) {
          setTestTgToken(resSet.settings.telegramBotToken);
        }
        if (resSet.settings.telegramChatId) {
          setTestTgChatId(resSet.settings.telegramChatId);
        }
        if (resSet.settings.whatsappPhoneNumberId) {
          setTestNumberId(resSet.settings.whatsappPhoneNumberId);
        }
        if (resSet.settings.whatsappAccessToken) {
          setTestToken(resSet.settings.whatsappAccessToken);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTelegramSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!testTgToken.trim() || !testTgChatId.trim()) {
      alert('Please enter both Telegram Bot Token and Chat ID before saving.');
      return;
    }
    setSavingTg(true);
    setTgSavedSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramBotToken: testTgToken.trim(),
          telegramChatId: testTgChatId.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTgSavedSuccess('Telegram credentials saved to database! All future customer orders will alert this Telegram.');
        setTimeout(() => setTgSavedSuccess(''), 5000);
      } else {
        alert(data.error || 'Failed to save Telegram settings');
      }
    } catch (err) {
      alert('Error saving Telegram settings');
    } finally {
      setSavingTg(false);
    }
  }

  async function handleSaveWhatsAppSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSavingWa(true);
    setWaSavedSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappPhoneNumberId: testNumberId.trim(),
          whatsappAccessToken: testToken.trim(),
          whatsappNumber: testRecipient.trim()
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaSavedSuccess('WhatsApp Cloud API credentials saved to database!');
        setTimeout(() => setWaSavedSuccess(''), 5000);
      } else {
        alert(data.error || 'Failed to save WhatsApp settings');
      }
    } catch (err) {
      alert('Error saving WhatsApp settings');
    } finally {
      setSavingWa(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryInsideDhaka: Number(deliveryInsideDhaka),
          deliveryOutsideDhaka: Number(deliveryOutsideDhaka),
          whatsappNumber: brandPhone
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess('Delivery charges & store settings updated successfully! Live checkout will immediately use these rates.');
        setTimeout(() => setSettingsSuccess(''), 4000);
      } else {
        alert(data.error || 'Failed to update settings');
      }
    } catch (err) {
      alert('Error updating settings');
    } finally {
      setSavingSettings(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Default admin password is 'metro2026'
    if (passwordInput.trim() === 'metro2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('metro_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password. Default is: metro2026');
    }
  }

  function handleLogout() {
    setIsAuthenticated(false);
    sessionStorage.removeItem('metro_admin_auth');
  }

  // ========================
  // PRODUCT OPERATIONS
  // ========================

  function openCreateProduct() {
    setIsCreatingProduct(true);
    setEditingProduct(null);
    setUrlInput('');
    const defaultImg = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80';
    setProductForm({
      id: 'mask-' + Date.now().toString().slice(-4),
      name: '',
      price: 650,
      description: '',
      image: defaultImg,
      images: [defaultImg],
      badge: '',
      available: true
    });
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);
    setIsCreatingProduct(false);
    setUrlInput('');
    const imgs = parseProductImages(product);
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: imgs[0] || product.image || '',
      images: imgs.length > 0 ? imgs : (product.image ? [product.image] : []),
      badge: product.badge || '',
      available: product.available
    });
  }

  async function handleImageFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const compressedImages: string[] = [];

    for (const file of fileList) {
      if (!file.type.startsWith('image/')) continue;

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1000;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              resolve(event.target?.result as string);
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });

      if (dataUrl) {
        compressedImages.push(dataUrl);
      }
    }

    if (compressedImages.length > 0) {
      setProductForm((prev) => {
        const updated = [...prev.images, ...compressedImages];
        return {
          ...prev,
          images: updated,
          image: updated[0] || ''
        };
      });
    }

    // Reset input so user can pick the same file again if desired
    e.target.value = '';
  }

  function handleRemoveImage(indexToRemove: number) {
    setProductForm((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated,
        image: updated[0] || ''
      };
    });
  }

  function handleAddImageUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setProductForm((prev) => {
      const updated = [...prev.images, trimmed];
      return {
        ...prev,
        images: updated,
        image: updated[0] || ''
      };
    });
    setUrlInput('');
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (productForm.images.length === 0) {
      alert('Please add or upload at least 1 image for this product before saving.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        image: productForm.images[0] || '',
        images: productForm.images
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsCreatingProduct(false);
        setEditingProduct(null);
        await loadData();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Network error saving product');
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this mask edition?')) return;
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  }

  // ========================
  // ORDER OPERATIONS
  // ========================
  async function handleUpdateOrderStatus(orderId: string, status: Order['status']) {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    }
  }

  // ========================
  // TEST WHATSAPP
  // ========================
  async function handleTestWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    setTestStatus({ loading: true, message: 'Sending test message via Meta WhatsApp Cloud API...' });

    try {
      const res = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: testNumberId,
          accessToken: testToken,
          recipientNumber: testRecipient
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus({ loading: false, message: 'Success! Test message delivered to your WhatsApp.' });
      } else {
        setTestStatus({ loading: false, message: data.error || 'Failed to send test message', error: true });
      }
    } catch (err) {
      setTestStatus({ loading: false, message: 'Network error communicating with Meta API', error: true });
    }
  }

  async function handleTestTelegram(e: React.FormEvent) {
    e.preventDefault();
    setTestTgStatus({ loading: true, message: 'Sending test message to Telegram...' });

    try {
      const res = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: testTgToken,
          chatId: testTgChatId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestTgStatus({ loading: false, message: 'Success! Test message delivered to your Telegram.' });
      } else {
        setTestTgStatus({ loading: false, message: data.error || 'Failed to send Telegram message', error: true });
      }
    } catch (err) {
      setTestTgStatus({ loading: false, message: 'Network error communicating with Telegram', error: true });
    }
  }

  // Calculations for stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_price : 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === orderFilter);

  // If not logged in, show Password Screen
  if (!isAuthenticated) {
    return (
      <div className="modal-backdrop" style={{ background: 'var(--bg)' }}>
        <div className="modal-content" style={{ maxWidth: '420px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <ThemeToggle />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <img src="/logo.png" alt="Metro Bro" className="brand-logo" />
            </div>
            <h2>Metro Bro Admin</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>
              Enter password to access management console
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
            <label style={{ display: 'grid', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
              Admin Password
              <input
                type="password"
                required
                placeholder="Password (default: metro2026)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
              />
            </label>

            {authError && (
              <p style={{ color: '#ef4444', fontSize: '12px' }}>{authError}</p>
            )}

            <button className="primary-button" type="submit" style={{ width: '100%' }}>
              <Lock size={16} /> Unlock Dashboard
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Link href="/" style={{ color: 'var(--muted)', fontSize: '12px' }}>
                ← Return to Storefront
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Top Bar */}
      <div className="admin-header">
        <div className="admin-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="Metro Bro" className="brand-logo" />
            </Link>
            <h1>Metro Bro Management</h1>
          </div>
          <p>Product Catalog, Prices, Delivery Rates, Orders &amp; WhatsApp</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button className="action-btn" onClick={loadData} title="Refresh Data">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/" target="_blank" className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={14} /> View Store ↗
          </Link>
          <button className="action-btn btn-danger" onClick={handleLogout} title="Log Out">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Orders</div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-desc">Lifetime order requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Pending Orders</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {pendingOrders.length}
          </div>
          <div className="stat-desc">Require verification</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Estimated Sales</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>
            ৳{totalRevenue.toLocaleString('en-BD')}
          </div>
          <div className="stat-desc">Non-cancelled revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Live Products</div>
          <div className="stat-value">{products.filter((p) => p.available).length}</div>
          <div className="stat-desc">{products.length} total mask editions</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingCart size={16} /> Customer Orders ({orders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} /> Product Variants &amp; Pricing ({products.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Truck size={16} /> Delivery Charges &amp; Rates
        </button>
        <button
          className={`tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          <Settings size={16} /> Telegram Cloud API &amp; Setup
        </button>
      </div>

      {/* ========================================================
          TAB 1: ORDERS MANAGEMENT
         ======================================================== */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '18px' }}>All Order Inquiries</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  className={`action-btn ${orderFilter === st ? 'active' : ''}`}
                  onClick={() => setOrderFilter(st)}
                  style={{ textTransform: 'capitalize', background: orderFilter === st ? 'var(--accent)' : '' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--muted)', padding: '40px 0' }}>Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="stat-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--muted)' }}>No orders found for status &quot;{orderFilter}&quot;.</p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Product &amp; Qty</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong>{ord.order_ref}</strong>
                      </td>
                      <td style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div>
                          <strong>{ord.customer_name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                            {ord.phone}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{ord.product_name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            Qty: {ord.quantity} × ৳{ord.unit_price}
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--accent)' }}>
                          ৳{ord.total_price.toLocaleString('en-BD')}
                        </strong>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                          Delivery: ৳{ord.delivery_charge || (ord.district?.toLowerCase() === 'dhaka' ? 80 : 120)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{ord.payment_method}</div>
                      </td>
                      <td style={{ maxWidth: '240px', fontSize: '12px', color: 'var(--ink-secondary)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '2px' }}>
                          📍 {ord.district || 'Dhaka'}
                        </div>
                        <div>{ord.address}</div>
                        {ord.note && <div style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '4px' }}>Note: {ord.note}</div>}
                      </td>
                      <td>
                        <span className={`badge badge-${ord.status}`}>{ord.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <a
                            className="action-btn"
                            href={`https://wa.me/${ord.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${ord.customer_name}, this is Metro Bro regarding your order ${ord.order_ref} for ${ord.product_name}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat with Customer on WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: PRODUCTS & PRICING MANAGEMENT
         ======================================================== */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px' }}>Product Catalog &amp; Pricing</h3>
              <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Add new variants, change prices, update images, and toggle availability.
              </p>
            </div>
            <button className="primary-button" onClick={openCreateProduct}>
              <Plus size={16} /> Add New Variant
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {products.map((p) => (
              <div
                key={p.id}
                className="stat-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: p.available ? 1 : 0.6,
                  border: p.available ? '1px solid var(--border)' : '1px dashed var(--border)'
                }}
              >
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden', borderRadius: '4px', marginBottom: '14px', background: '#000' }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {p.badge && (
                    <span className="product-badge" style={{ top: '10px', left: '10px' }}>
                      {p.badge}
                    </span>
                  )}
                  {!p.available && (
                    <span style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: '#ef4444',
                      color: '#fff',
                      padding: '4px 8px',
                      fontSize: '10px',
                      borderRadius: '2px',
                      fontWeight: 700
                    }}>
                      HIDDEN FROM STORE
                    </span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '16px' }}>{p.name}</h4>
                    <span style={{ font: '700 16px var(--mono)', color: 'var(--accent)' }}>
                      ৳{p.price.toLocaleString('en-BD')}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {p.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <button
                    className="action-btn"
                    onClick={() => openEditProduct(p)}
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={14} /> Edit Details &amp; Price
                  </button>
                  <button
                    className="action-btn btn-danger"
                    onClick={() => handleDeleteProduct(p.id)}
                    title="Delete product"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: DELIVERY CHARGES & STORE SETTINGS
         ======================================================== */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '800px' }}>
          <div className="stat-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Truck size={22} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: '18px' }}>
                Delivery Charges Configuration
              </h3>
            </div>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
              Configure shipping fees for Bangladesh. Whenever a customer picks their district in the storefront checkout, the system automatically applies the fee set here.
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: '20px' }}>
              <div className="form-grid">
                <label>
                  Inside Dhaka Delivery Charge (৳ BDT) *
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="80"
                    value={deliveryInsideDhaka}
                    onChange={(e) => setDeliveryInsideDhaka(Number(e.target.value) || 0)}
                  />
                  <span style={{ font: '11px var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
                    Applied when customer selects &quot;Dhaka&quot; district
                  </span>
                </label>

                <label>
                  Outside Dhaka Delivery Charge (৳ BDT) *
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="120"
                    value={deliveryOutsideDhaka}
                    onChange={(e) => setDeliveryOutsideDhaka(Number(e.target.value) || 0)}
                  />
                  <span style={{ font: '11px var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
                    Applied for all other 63 Bangladesh districts
                  </span>
                </label>

                <label className="full">
                  Store WhatsApp Order Notification Number
                  <input
                    type="text"
                    placeholder="8801799767774"
                    value={brandPhone}
                    onChange={(e) => setBrandPhone(e.target.value)}
                  />
                  <span style={{ font: '11px var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
                    Format with country code (e.g. 8801799767774). Receives WhatsApp order notifications.
                  </span>
                </label>
              </div>

              {settingsSuccess && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid #22c55e',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  color: '#22c55e',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={16} /> {settingsSuccess}
                </div>
              )}

              <button
                type="submit"
                className="primary-button"
                style={{ width: 'fit-content' }}
                disabled={savingSettings}
              >
                {savingSettings ? 'Saving Settings...' : 'Save & Update Delivery Charges ↗'}
              </button>
            </form>
          </div>

          <div className="stat-card">
            <h4 style={{ fontSize: '15px', marginBottom: '8px' }}>How Backend Delivery Pricing Works</h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--ink-secondary)', fontSize: '13px', lineHeight: 1.8 }}>
              <li><strong>Live API Sync:</strong> When customers load the checkout modal, rates are fetched live from <code>/api/settings</code>.</li>
              <li><strong>Backend Verification:</strong> The order submission endpoint recalculates pricing on the server before saving to prevent tampering.</li>
              <li><strong>WhatsApp Invoices:</strong> Automated WhatsApp order summaries immediately use the updated shipping rates.</li>
              <li><strong>Cloud Storage:</strong> Rates are persisted in the Supabase <code>store_settings</code> table or cached in-memory fallback.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: TELEGRAM & WHATSAPP NOTIFICATIONS
         ======================================================== */}
      {activeTab === 'whatsapp' && (
        <div style={{ maxWidth: '800px' }}>
          {/* Telegram Card (100% Free) */}
          <div className="stat-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} style={{ color: '#229ED9' }} />
                <h3 style={{ fontSize: '18px' }}>
                  Option A: Instant Telegram Bot Alerts (100% Free Forever)
                </h3>
              </div>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                RECOMMENDED &amp; ZERO COST
              </span>
            </div>

            <p style={{ color: 'var(--ink-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
              Whenever a customer places an order on Metro Bro, Next.js instantly sends the complete order receipt to your private Telegram or a Team Group. No credit card, no Meta approvals, and unlimited free messages!
            </p>

            <form onSubmit={handleTestTelegram} style={{ display: 'grid', gap: '16px' }}>
              <div className="form-grid">
                <label>
                  Telegram Bot Token *
                  <input
                    type="text"
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={testTgToken}
                    onChange={(e) => setTestTgToken(e.target.value)}
                  />
                  <span style={{ font: '11px var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
                    From @BotFather on Telegram
                  </span>
                </label>

                <label>
                  Telegram Chat ID (Personal or Group) *
                  <input
                    type="text"
                    placeholder="e.g. 987654321 or -100123456789"
                    value={testTgChatId}
                    onChange={(e) => setTestTgChatId(e.target.value)}
                  />
                  <span style={{ font: '11px var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
                    Your numeric ID or Group ID
                  </span>
                </label>
              </div>

              {tgSavedSuccess && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid #22c55e',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  color: '#22c55e',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={16} /> {tgSavedSuccess}
                </div>
              )}

              {testTgStatus && (
                <div style={{
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  background: testTgStatus.error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: testTgStatus.error ? '#ef4444' : 'var(--success)',
                  border: `1px solid ${testTgStatus.error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  {testTgStatus.loading ? 'Sending test...' : testTgStatus.message}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{ background: '#229ED9' }}
                  onClick={handleSaveTelegramSettings}
                  disabled={savingTg}
                >
                  <Check size={16} /> {savingTg ? 'Saving to Database...' : 'Save Telegram Settings to Backend ↗'}
                </button>

                <button
                  type="submit"
                  className="outline-button"
                  disabled={testTgStatus?.loading}
                >
                  <Send size={15} /> Send Test Telegram Alert
                </button>
              </div>
            </form>

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong>Quick 2-Minute Setup:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                <li>Open <strong>@BotFather</strong> on Telegram → type <code>/newbot</code> → give it a name (e.g. <code>MetroBroOrderBot</code>) → copy the <strong>Token</strong>.</li>
                <li><strong>To receive in private chat:</strong> Send a message to <strong>@userinfobot</strong> on Telegram to get your numeric <code>Id</code>.</li>
                <li><strong>Or to receive in a Group:</strong> Create a Group, add your bot as Admin, and use the Group Chat ID.</li>
                <li>Add them to your <code>.env.local</code> as <code>TELEGRAM_BOT_TOKEN</code> and <code>TELEGRAM_CHAT_ID</code>.</li>
              </ol>
            </div>
          </div>

          <div className="stat-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
              Option B: Meta WhatsApp Cloud API Setup
            </h3>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
              When a customer places an order, Next.js can send an automated WhatsApp message to your phone (<strong>+8801799767774</strong>) via Meta&apos;s WhatsApp Cloud API.
            </p>

            <form onSubmit={handleTestWhatsApp} style={{ display: 'grid', gap: '16px' }}>
              <div className="form-grid">
                <label>
                  WhatsApp Phone Number ID
                  <input
                    type="text"
                    placeholder="e.g. 104829103847291"
                    value={testNumberId}
                    onChange={(e) => setTestNumberId(e.target.value)}
                  />
                </label>

                <label>
                  Recipient WhatsApp Number
                  <input
                    type="text"
                    placeholder="8801799767774"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                  />
                </label>

                <label className="full">
                  Meta WhatsApp Access Token
                  <input
                    type="password"
                    placeholder="Permanent or Temporary System User Access Token"
                    value={testToken}
                    onChange={(e) => setTestToken(e.target.value)}
                  />
                </label>
              </div>

              {waSavedSuccess && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid #22c55e',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  color: '#22c55e',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={16} /> {waSavedSuccess}
                </div>
              )}

              {testStatus && (
                <div style={{
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  background: testStatus.error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: testStatus.error ? '#ef4444' : 'var(--success)',
                  border: `1px solid ${testStatus.error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  {testStatus.loading ? 'Sending test...' : testStatus.message}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSaveWhatsAppSettings}
                  disabled={savingWa}
                >
                  <Check size={16} /> {savingWa ? 'Saving to Database...' : 'Save WhatsApp Settings to Backend ↗'}
                </button>

                <button
                  type="submit"
                  className="outline-button"
                  disabled={testStatus?.loading}
                >
                  <Send size={15} /> Send Test WhatsApp Message
                </button>
              </div>
            </form>
          </div>

          <div className="stat-card">
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>
              Free Supabase Cloud Database Checklist
            </h3>
            <ol style={{ paddingLeft: '20px', color: 'var(--ink-secondary)', fontSize: '13px', lineHeight: 2 }}>
              <li>Create a free account at <strong>supabase.com</strong>.</li>
              <li>Create a new project named <strong>metro-bro</strong>.</li>
              <li>Open the <strong>SQL Editor</strong> tab on the left.</li>
              <li>Copy and paste all code from <code>supabase-schema.sql</code> into the editor and hit <strong>Run</strong>.</li>
              <li>Copy your <strong>Project URL</strong> and <strong>anon key</strong> from Settings → API into your <code>.env.local</code>.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT / CREATE PRODUCT MODAL
         ======================================================== */}
      {(isCreatingProduct || editingProduct) && (
        <div className="modal-backdrop" onClick={() => { setIsCreatingProduct(false); setEditingProduct(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">PRODUCT EDITOR</p>
                <h2>{isCreatingProduct ? 'Add New Mask Edition' : 'Edit Product & Price'}</h2>
              </div>
              <button className="close-btn" onClick={() => { setIsCreatingProduct(false); setEditingProduct(null); }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gap: '16px' }}>
              <div className="form-grid">
                <label className="full">
                  Product Name *
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Bro Mask — Carbon Edition"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </label>

                <label>
                  Price in BDT (৳) *
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="650"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) || 0 })}
                  />
                </label>

                <label>
                  Badge Tag (Optional)
                  <input
                    type="text"
                    placeholder="e.g. FIRST DROP, HOT, LIMITED"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                  />
                </label>

                {/* Multi-Image Box / Gallery */}
                <div className="full" style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontWeight: 700, fontSize: '13px' }}>
                      Product Images Gallery ({productForm.images.length}) *
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      First image is the primary cover
                    </span>
                  </div>

                  {/* Add images controls */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--surface-2)',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px dashed var(--border)'
                  }}>
                    <label
                      className="primary-button"
                      style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        padding: '9px 16px',
                        margin: 0
                      }}
                    >
                      <Upload size={16} /> Add Images from Device (Multiple Allowed)
                      <input
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageFilesChange}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '220px' }}>
                      <input
                        type="text"
                        placeholder="Or paste image URL and click Add..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                        style={{ fontSize: '12px', padding: '8px 10px' }}
                      />
                      <button
                        type="button"
                        className="action-btn"
                        onClick={handleAddImageUrl}
                        style={{ whiteSpace: 'nowrap', fontSize: '12px' }}
                      >
                        <Plus size={14} /> Add URL
                      </button>
                    </div>
                  </div>

                  {/* Images Box Grid with Cross Buttons */}
                  {productForm.images.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                      gap: '12px',
                      background: 'var(--surface-2)',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}>
                      {productForm.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: idx === 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
                            background: 'var(--surface-1)',
                            aspectRatio: '1 / 1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`Product image ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />

                          {/* Primary Badge */}
                          {idx === 0 && (
                            <span style={{
                              position: 'absolute',
                              bottom: '6px',
                              left: '6px',
                              background: 'var(--accent)',
                              color: '#fff',
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              letterSpacing: '0.04em'
                            }}>
                              PRIMARY
                            </span>
                          )}

                          {/* Cross (✕) Button at Top Corner */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove this image"
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: 'rgba(0, 0, 0, 0.75)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              padding: 0
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ef4444';
                              e.currentTarget.style.transform = 'scale(1.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <X size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      background: 'var(--surface-2)',
                      borderRadius: '6px',
                      border: '1px dashed #ef4444',
                      color: '#ef4444',
                      fontSize: '13px'
                    }}>
                      No images added yet. Click &quot;Add Images from Device&quot; or paste a URL above.
                    </div>
                  )}
                </div>

                <label className="full">
                  Description
                  <textarea
                    rows={3}
                    placeholder="Explain fabrics, breathability, wind protection, etc."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </label>

                <label className="full" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto' }}
                    checked={productForm.available}
                    onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                  />
                  <span>Show in live storefront (Available for purchase)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="primary-button" style={{ flex: 1 }} disabled={isSavingProduct}>
                  {isSavingProduct ? 'Saving to Database...' : 'Save & Update Live Store ↗'}
                </button>
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => { setIsCreatingProduct(false); setEditingProduct(null); }}
                  disabled={isSavingProduct}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
