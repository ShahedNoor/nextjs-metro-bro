'use client';

import { useState, useEffect } from 'react';
import { Product, Order } from '@/types';
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
  Send
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'orders' | 'products' | 'whatsapp'
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'whatsapp'>('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Filter for orders
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Product Edit/Create Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    price: 0,
    description: '',
    image: '',
    badge: '',
    available: true
  });

  // WhatsApp Testing
  const [testNumberId, setTestNumberId] = useState('');
  const [testToken, setTestToken] = useState('');
  const [testRecipient, setTestRecipient] = useState('8801799767774');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message: string; error?: boolean } | null>(null);

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
      const [resProd, resOrd] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json())
      ]);

      if (resProd.products) setProducts(resProd.products);
      if (resOrd.orders) setOrders(resOrd.orders);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
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
    setProductForm({
      id: 'mask-' + Date.now().toString().slice(-4),
      name: '',
      price: 650,
      description: '',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      badge: '',
      available: true
    });
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);
    setIsCreatingProduct(false);
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      badge: product.badge || '',
      available: product.available
    });
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
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
            <div className="brand-mark" style={{ margin: '0 auto 16px' }}>MB</div>
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
            <Link className="brand-mark" href="/">MB</Link>
            <h1>Metro Bro Management</h1>
          </div>
          <p>Product Catalog, Prices, Photos, Orders &amp; WhatsApp Notifications</p>
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
          className={`tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          <Settings size={16} /> WhatsApp Cloud API &amp; Setup
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
          TAB 3: WHATSAPP CLOUD API & SETTINGS
         ======================================================== */}
      {activeTab === 'whatsapp' && (
        <div style={{ maxWidth: '800px' }}>
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

              <button 
                type="submit" 
                className="primary-button" 
                style={{ width: 'fit-content' }}
                disabled={testStatus?.loading}
              >
                <Send size={15} /> Send Test WhatsApp Message
              </button>
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

                <label className="full">
                  Image URL / Photo Path *
                  <input 
                    type="text" 
                    required 
                    placeholder="https://... or /images/mask.jpg" 
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  />
                </label>

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

              {/* Preview image */}
              {productForm.image && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ font: '11px var(--mono)', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>Image Preview:</span>
                  <img 
                    src={productForm.image} 
                    alt="Preview" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} 
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="primary-button" style={{ flex: 1 }}>
                  Save &amp; Update Live Store ↗
                </button>
                <button 
                  type="button" 
                  className="outline-button" 
                  onClick={() => { setIsCreatingProduct(false); setEditingProduct(null); }}
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
