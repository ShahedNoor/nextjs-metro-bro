'use client';

import { useState, useEffect } from 'react';
import { Product, Order, BANGLADESH_DISTRICTS } from '@/types';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShoppingBag, 
  CheckCircle, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  X,
  ExternalLink,
  MapPin
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    order: Order;
    directWhatsAppUrl: string;
    whatsappStatus: { success: boolean; statusText: string };
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states with District default to Dhaka
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    district: 'Dhaka',
    address: '',
    paymentMethod: 'Cash on delivery (if available)',
    note: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products.filter((p: Product) => p.available));
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenOrder(product: Product) {
    setSelectedProduct(product);
    setQuantity(1);
    setErrorMessage('');
    setOrderSuccess(null);
  }

  function handleCloseModal() {
    setSelectedProduct(null);
    setOrderSuccess(null);
    setFormData({
      customerName: '',
      phone: '',
      district: 'Dhaka',
      address: '',
      paymentMethod: 'Cash on delivery (if available)',
      note: ''
    });
  }

  // Delivery Calculations: Dhaka = ৳80, Outside Dhaka = ৳120
  const isDhaka = formData.district.trim().toLowerCase() === 'dhaka';
  const deliveryCharge = isDhaka ? 80 : 120;
  const itemsSubtotal = selectedProduct ? selectedProduct.price * quantity : 0;
  const totalPayable = itemsSubtotal + deliveryCharge;

  async function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;
    if (selectedProduct.price <= 0) {
      setErrorMessage('Price is not set yet. Please contact on WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity,
          unitPrice: selectedProduct.price,
          ...formData
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderSuccess({
          order: data.order,
          directWhatsAppUrl: data.directWhatsAppUrl,
          whatsappStatus: data.whatsappStatus
        });
      } else {
        setErrorMessage(data.error || 'Something went wrong while placing order.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Top Notification Bar */}
      <div className="announcement">
        <span>⚡</span> METRO BRO / FIRST DROP / FULL FACE RIDING MASKS / LIMITED STOCK
      </div>

      {/* Main Header */}
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">MB</span>
          <span className="brand-name">METRO BRO</span>
        </Link>
        <nav>
          <a href="#shop">Collection</a>
          <a href="#how-to-order">How to Order</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <a className="header-cta" href="#shop">
            Explore Drops <span>↗</span>
          </a>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-glow"></div>
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot"></span> BIKER GEAR ENGINEERED FOR STREET & HIGHWAY
            </p>
            <h1>
              Make your<br /><em>own statement.</em>
            </h1>
            <p className="hero-description">
              Full-face protective riding masks designed for motorcyclists. Windproof, breathable, and built to withstand dust and high speed.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#shop">
                Shop The Drop <ArrowRight size={16} />
              </a>
              <a 
                className="outline-button" 
                href="https://wa.me/8801799767774" 
                target="_blank" 
                rel="noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp Us
              </a>
            </div>
            <div className="hero-note">
              <strong>01</strong> Limited batch release <span className="note-divider">/</span> Direct WhatsApp & Supabase checkout
            </div>
          </div>

          <div className="hero-art" aria-label="Metro Bro Streetwear Graphic">
            <div className="art-grid"></div>
            <div className="art-label">
              FIRST DROP<br /><strong>VOL. 001</strong>
            </div>
            <div className="art-ring"></div>
            <div className="art-ring ring-two"></div>
            <div className="art-shape">
              <span>MB</span>
            </div>
            <div className="art-caption">
              HIGHWAY READY<br />EST. 2026
            </div>
          </div>
        </section>

        {/* Ticker Bar (Marquee Container) */}
        <section className="ticker-wrap">
          <div className="ticker-track">
            <span>HIGH-DENSITY BALACLAVA</span>
            <b>✳</b>
            <span>DELIVERY INSIDE DHAKA ৳80</span>
            <b>✳</b>
            <span>OUTSIDE DHAKA ৳120</span>
            <b>✳</b>
            <span>WINDPROOF & BREATHABLE</span>
            <b>✳</b>
            <span>LIMITED STOCK DROP</span>
            <b>✳</b>
            <span>HIGH-DENSITY BALACLAVA</span>
            <b>✳</b>
            <span>DELIVERY INSIDE DHAKA ৳80</span>
            <b>✳</b>
            <span>OUTSIDE DHAKA ৳120</span>
            <b>✳</b>
            <span>WINDPROOF & BREATHABLE</span>
            <b>✳</b>
            <span>LIMITED STOCK DROP</span>
          </div>
        </section>

        {/* Shop Collection Section */}
        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE COLLECTION</p>
              <h2>Available <em>Now.</em></h2>
            </div>
            <p className="section-side-note">Small batch drops. When it&apos;s gone, it&apos;s gone.</p>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
              Loading collection...
            </div>
          ) : products.length === 0 ? (
            <div className="stat-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                Next drop dropping soon. Stay tuned!
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product, idx) => (
                <article key={product.id} className="product-card">
                  <div className="product-image-wrap">
                    <img 
                      className="product-image" 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    {product.badge && (
                      <span className="product-badge">{product.badge}</span>
                    )}
                    <span className="image-index">
                      EDITION / 0{idx + 1}
                    </span>
                  </div>
                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>{product.name}</h3>
                      <span className="product-price">৳{product.price.toLocaleString('en-BD')}</span>
                    </div>
                    <p>{product.description}</p>
                    <button 
                      className="order-button" 
                      type="button"
                      onClick={() => handleOpenOrder(product)}
                    >
                      <span>Order This Item</span>
                      <span>↗</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* How to Order Strip */}
        <section className="order-strip" id="how-to-order">
          <div>
            <p className="eyebrow">FAST & SIMPLE</p>
            <div className="order-number" style={{ font: '700 24px var(--display)', color: 'var(--ink)' }}>
              02 / ORDER FLOW
            </div>
          </div>
          <div>
            <h2>Pick it. Order it.<br /><em>We&apos;ll handle the rest.</em></h2>
          </div>
          <ol>
            <li><span>01</span> Pick your riding mask edition and quantity.</li>
            <li><span>02</span> Select your District (Dhaka ৳80 / Outside Dhaka ৳120).</li>
            <li><span>03</span> Automated WhatsApp Cloud API alert is sent to Shishir immediately.</li>
          </ol>
        </section>

        {/* Contact Strip */}
        <section className="trust-section" id="contact">
          <div>
            <p className="eyebrow">QUESTIONS BEFORE ORDERING?</p>
            <h2>Talk to us <em>directly.</em></h2>
          </div>
          <a 
            className="outline-button" 
            href="https://wa.me/8801799767774?text=Hi%20Metro%20Bro%2C%20I%20have%20a%20question%20about%20your%20riding%20masks." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} /> Chat on WhatsApp (+8801799767774)
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <Link className="footer-brand" href="/">
          <span className="brand-mark">MB</span>
          <span>METRO BRO STORE</span>
        </Link>
        <p>© 2026 Metro Bro. Built for passionate riders.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#shop">Back to top ↑</a>
        </div>
      </footer>

      {/* Checkout Modal Dialog */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">CHECKOUT REQUEST</p>
                <h2>{orderSuccess ? 'Order Placed!' : 'Complete Your Order'}</h2>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {orderSuccess ? (
              <div className="order-success-box">
                <div className="order-success-icon">
                  <CheckCircle size={32} />
                </div>
                <h3>Order Registered Successfully!</h3>
                <span className="order-ref-badge">
                  Order Ref: {orderSuccess.order.order_ref}
                </span>

                <div style={{ 
                  background: 'var(--surface-2)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '6px', 
                  padding: '14px', 
                  textAlign: 'left',
                  fontSize: '13px',
                  marginBottom: '20px',
                  lineHeight: 1.8
                }}>
                  <div><strong>Item:</strong> {orderSuccess.order.product_name} (Qty: {orderSuccess.order.quantity})</div>
                  <div><strong>Subtotal:</strong> ৳{(orderSuccess.order.unit_price * orderSuccess.order.quantity).toLocaleString('en-BD')}</div>
                  <div><strong>District:</strong> {orderSuccess.order.district} (Delivery: ৳{orderSuccess.order.delivery_charge})</div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '6px', fontWeight: 800, color: 'var(--accent)', fontSize: '15px' }}>
                    Total Payable: ৳{orderSuccess.order.total_price.toLocaleString('en-BD')}
                  </div>
                </div>

                <p style={{ color: 'var(--ink-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Your order is saved into our database. We have triggered an alert to Shishir via WhatsApp.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a 
                    className="primary-button" 
                    href={orderSuccess.directWhatsAppUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ justifyContent: 'center' }}
                  >
                    <MessageCircle size={18} /> Open WhatsApp Chat with Order ID <ExternalLink size={14} />
                  </a>
                  <button 
                    type="button" 
                    className="outline-button" 
                    onClick={handleCloseModal}
                    style={{ justifyContent: 'center' }}
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder}>
                {/* Selected Product Summary Box with Live Price Breakdown */}
                <div className="selected-product-box" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={selectedProduct.image} alt={selectedProduct.name} />
                    <div className="selected-details">
                      <strong>{selectedProduct.name}</strong>
                      <span>৳{selectedProduct.price.toLocaleString('en-BD')} × {quantity} mask{quantity > 1 ? 's' : ''} = ৳{itemsSubtotal.toLocaleString('en-BD')}</span>
                    </div>
                  </div>

                  <div style={{ 
                    borderTop: '1px solid var(--border)', 
                    paddingTop: '8px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: 'var(--muted)' }}>
                      Delivery Fee ({isDhaka ? 'Inside Dhaka' : 'Outside Dhaka'}):
                    </span>
                    <strong style={{ color: 'var(--ink)', font: '700 13px var(--mono)' }}>৳{deliveryCharge}</strong>
                  </div>

                  <div style={{ 
                    borderTop: '1px solid var(--border)', 
                    paddingTop: '8px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '13px' }}>Total Amount to Pay:</span>
                    <span className="selected-total" style={{ fontSize: '18px' }}>
                      ৳{totalPayable.toLocaleString('en-BD')}
                    </span>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    Full Name *
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Tanvir Ahmed" 
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </label>

                  <label>
                    Mobile Phone *
                    <input 
                      type="tel" 
                      required 
                      placeholder="01XXXXXXXXX" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </label>

                  {/* District / Zilla Dropdown with Dhaka ৳80 & Outside ৳120 */}
                  <label className="full">
                    District (জেলা) *
                    <select 
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      required
                      style={{ fontWeight: 600 }}
                    >
                      <option value="Dhaka">Dhaka (ঢাকা) — Delivery: ৳80</option>
                      <optgroup label="Outside Dhaka Districts (Delivery: ৳120)">
                        {BANGLADESH_DISTRICTS.filter((d) => d !== 'Dhaka').map((dist) => (
                          <option key={dist} value={dist}>
                            {dist} — Delivery: ৳120
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </label>

                  <label className="full">
                    Detailed Delivery Address *
                    <textarea 
                      rows={3} 
                      required 
                      placeholder="House, Road, Area, Thana / Upazila" 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </label>

                  <label>
                    Quantity
                    <input 
                      type="number" 
                      min={1} 
                      max={20} 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </label>

                  <label>
                    Payment Preference
                    <select 
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <option>Cash on delivery (if available)</option>
                      <option>bKash / Nagad advance</option>
                      <option>Discuss on WhatsApp</option>
                    </select>
                  </label>

                  <label className="full">
                    Special Instructions (Optional)
                    <textarea 
                      rows={2} 
                      placeholder="e.g. Call before delivery, delivery after 4 PM" 
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                  </label>
                </div>

                <p className="form-disclaimer">
                  * Order total includes <strong>৳{deliveryCharge} delivery charge</strong> for {formData.district}. We will contact you to verify stock and delivery schedule.
                </p>

                {errorMessage && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>
                    {errorMessage}
                  </p>
                )}

                <button 
                  className="primary-button submit-order" 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Placing Order...' : `Confirm Order (৳${totalPayable.toLocaleString('en-BD')}) ↗`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
