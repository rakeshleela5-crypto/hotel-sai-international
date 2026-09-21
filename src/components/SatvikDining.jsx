import React, { useState } from 'react';
import { Utensils, Sparkles, ShoppingBag, Check, Plus, AlertCircle } from 'lucide-react';
import { RESTAURANT_MENU } from '../data/hotelData';

export default function SatvikDining({ onOpenOrderModal }) {
  const [jainFilterOnly, setJainFilterOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Odia Delicacies', 'Satvik & Jain', 'Breakfast', 'Main Course', 'Beverages'];

  const filteredMenu = RESTAURANT_MENU.filter(item => {
    const matchesJain = !jainFilterOnly || item.isJain;
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    return matchesJain && matchesCat;
  });

  return (
    <section style={{ padding: '3.5rem 1.5rem', background: 'rgba(6, 14, 26, 0.4)' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--gold-glow)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem'
            }}>
              <Utensils size={14} /> Authentic Culinary Heritage
            </div>
            <h2 style={{ fontSize: '2.4rem' }}>
              Odia Delicacies & Pure <span className="gold-gradient-text">Satvik / Jain Kitchen</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: 650 }}>
              Savor traditional Chhena Poda, Dalma, and pure Satvik recipes prepared strictly without onion or garlic in pure desi ghee for pilgrim sanctity.
            </p>
          </div>

          {/* Jain Filter Toggle & Order CTA */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: jainFilterOnly ? 'rgba(16, 185, 129, 0.2)' : 'rgba(12, 24, 43, 0.6)',
              border: jainFilterOnly ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: jainFilterOnly ? '#10b981' : '#cbd5e1'
            }}>
              <input 
                type="checkbox" 
                checked={jainFilterOnly} 
                onChange={(e) => setJainFilterOnly(e.target.checked)} 
              />
              🥬 100% Satvik & Jain Only (No Onion/Garlic)
            </label>

            <button 
              onClick={() => onOpenOrderModal()}
              className="btn-primary-gold"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
            >
              <ShoppingBag size={16} /> Order In-Room Dining
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: activeCategory === cat ? 'var(--gold-glow)' : 'rgba(12, 24, 43, 0.6)',
                color: activeCategory === cat ? '#060e1a' : '#94a3b8',
                border: activeCategory === cat ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredMenu.map(item => (
            <div 
              key={item.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'rgba(12, 24, 43, 0.7)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{
                      width: 14,
                      height: 14,
                      border: '1px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 1
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                    </span>
                    <h3 style={{ fontSize: '1.15rem' }}>{item.name}</h3>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                    ₹{item.price}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  {item.isJain && (
                    <span style={{
                      fontSize: '0.7rem',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      Jain / Satvik
                    </span>
                  )}
                  {item.isSpecial && (
                    <span style={{
                      fontSize: '0.7rem',
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--gold-glow)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      Odia Special
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {item.description}
                </p>
              </div>

              <button 
                onClick={() => onOpenOrderModal(item)}
                className="btn-outline-gold"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
              >
                <Plus size={14} /> Add to In-Room Tray
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
