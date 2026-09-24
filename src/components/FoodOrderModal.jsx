import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Utensils, AlertCircle } from 'lucide-react';
import { RESTAURANT_MENU, HOTEL_CONFIG } from '../data/hotelData';
import { playSuccessChime } from '../utils/soundAlert';

export default function FoodOrderModal({ isOpen, onClose, initialItem = null, rooms = [], onBillToRoom }) {
  const [cart, setCart] = useState(initialItem ? [{ ...initialItem, qty: 1 }] : []);
  const [roomNumber, setRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [billingMode, setBillingMode] = useState('Bill to Room Folio');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const addItemToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const gst = Math.round(subtotal * 0.05 * 100) / 100; // 5% Restaurant GST
  const total = subtotal + gst;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!roomNumber) return;

    setSubmitting(true);
    const kotId = `IR-KOT-${Date.now().toString().slice(-4)}`;
    const itemsDescription = cart.map(c => `${c.qty}x ${c.name}`).join(', ');

    const payload = {
      kotId,
      roomNumber,
      guestName: guestName || `Room ${roomNumber} Guest`,
      items: cart,
      subtotal,
      gst,
      totalAmount: total,
      isJain: cart.some(i => i.isJain),
      billingMode
    };

    try {
      // Connect to central Front Desk & Accountant Folio Pipeline
      if (billingMode === 'Bill to Room Folio' && onBillToRoom) {
        onBillToRoom({
          kotId,
          roomNumber,
          outlet: 'In-Room Dining (Satvik Tray)',
          items: cart,
          grossSubtotal: subtotal,
          discount: 0,
          discountReason: 'None',
          subtotal,
          gst,
          totalAmount: total,
          isNonCommercial: false,
          description: `In-Room Dining (${itemsDescription})`,
          captainName: 'In-Room Service Captain',
          createdAt: new Date().toISOString()
        });
      } else {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'place_food_order', payload })
        });
      }
      playSuccessChime();
      setOrderSubmitted(true);
    } catch (err) {
      console.warn("Order sync note:", err);
      playSuccessChime();
      setOrderSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 540 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={20} color="var(--gold-glow)" />
            <h3 style={{ fontSize: '1.2rem' }}>In-Room Odia & Satvik Dining Tray</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {orderSubmitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
                Order Dispatched to Kitchen!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Your order for <strong>Room {roomNumber}</strong> has been transmitted to our Satvik kitchen. Delivery estimate: 20-25 minutes.
              </p>
              <button 
                onClick={() => {
                  setOrderSubmitted(false);
                  setCart([]);
                  onClose();
                }} 
                className="btn-primary-gold"
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder}>
              {/* Room Key Picker */}
              <div className="form-group">
                <label className="form-label">Deliver to Room Key (40 Inventory)</label>
                <select 
                  className="form-select"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                >
                  <option value="">-- Choose In-House Room --</option>
                  {rooms.map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • {r.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Tray Items ({cart.reduce((sum, i) => sum + i.qty, 0)})
                </label>
                {cart.length === 0 ? (
                  <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: 'rgba(6, 14, 26, 0.5)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem'
                  }}>
                    Your dining tray is empty. Add dishes below:
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                      {RESTAURANT_MENU.slice(0, 3).map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => addItemToCart(m)}
                          className="btn-outline-gold"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          + {m.name} (₹{m.price})
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cart.map(item => (
                      <div 
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(6, 14, 26, 0.6)',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price} each</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <button 
                            type="button" 
                            onClick={() => updateQty(item.id, -1)}
                            style={{ padding: '0.2rem', color: 'var(--text-secondary)' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                          <button 
                            type="button" 
                            onClick={() => updateQty(item.id, 1)}
                            style={{ padding: '0.2rem', color: 'var(--gold-glow)' }}
                          >
                            <Plus size={14} />
                          </button>
                          <span style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtotal Calculation Box */}
              {cart.length > 0 && (
                <div style={{
                  background: 'rgba(12, 24, 43, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    <span>Food Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Restaurant GST 5% (SAC 996331):</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.4rem', fontWeight: 700, color: 'var(--gold-glow)' }}>
                    <span>Total Billed:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Billing Mode */}
              <div className="form-group">
                <label className="form-label">Payment Settlement</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Bill to Room Folio', 'Pay via UPI on Delivery', 'Cash on Delivery'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBillingMode(mode)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: billingMode === mode ? 'var(--gold-glow)' : 'rgba(6, 14, 26, 0.6)',
                        color: billingMode === mode ? '#060e1a' : '#94a3b8',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={onClose} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || cart.length === 0 || !roomNumber}
                  className="btn-primary-gold" 
                  style={{ flex: 2, justifyContent: 'center', opacity: (cart.length === 0 || !roomNumber) ? 0.6 : 1 }}
                >
                  {submitting ? 'Dispatching...' : `Confirm Order • ₹${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
