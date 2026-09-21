import React, { useState } from 'react';
import { 
  Check, Wifi, Tv, Coffee, Wind, Compass, Sparkles, 
  ArrowRight, ShieldCheck, Users, Bed, Layers, Car, Briefcase
} from 'lucide-react';
import { ROOM_TIERS } from '../data/hotelData';
import { calculateRoomTax } from '../utils/taxUtils';

export default function RoomCatalog({ onSelectTier, onOpen3DExplorer, rooms = [] }) {
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('all');

  const filteredTiers = selectedFloorFilter === 'all' 
    ? ROOM_TIERS 
    : ROOM_TIERS.filter(t => t.floor === Number(selectedFloorFilter));

  const getTierStats = (tierName) => {
    const tierRooms = rooms.filter(r => r.tier === tierName);
    const available = tierRooms.filter(r => r.status === 'Available').length;
    return { available, total: tierRooms.length || 10 };
  };

  return (
    <section style={{ padding: '3.5rem 1.5rem 4.5rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem'
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
              <Sparkles size={14} /> 40 Curated Inventory Rooms
            </div>
            <h2 style={{ fontSize: '2.4rem' }}>
              4 Luxury Tiers Across <span className="gold-gradient-text">4 Dedicated Floors</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: 650 }}>
              Engineered with soundproof glazing, high-speed fiber Wi-Fi, 24-hr hot water, and authentic Odia hospitality. Each floor features 10 dedicated private keys.
            </p>
          </div>

          {/* Floor Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedFloorFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: selectedFloorFilter === 'all' ? 'var(--gold-glow)' : 'rgba(12, 24, 43, 0.7)',
                color: selectedFloorFilter === 'all' ? '#060e1a' : '#fff',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              All 4 Floors (40 Rooms)
            </button>
            {[1, 2, 3, 4].map(fl => (
              <button
                key={fl}
                onClick={() => setSelectedFloorFilter(fl)}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  background: selectedFloorFilter === fl ? 'var(--sapphire-light)' : 'rgba(12, 24, 43, 0.7)',
                  color: selectedFloorFilter === fl ? '#060e1a' : '#fff',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                Floor {fl}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Tiers Display Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '2rem'
        }}>
          {filteredTiers.map((tier) => {
            const tax = calculateRoomTax(tier.tariff);
            const stats = getTierStats(tier.name);

            return (
              <div 
                key={tier.id}
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                {/* Room Image */}
                <div style={{ position: 'relative', height: 230, width: '100%', overflow: 'hidden' }}>
                  <img 
                    src={tier.image} 
                    alt={tier.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    background: 'rgba(6, 14, 26, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--gold-glow)',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}>
                    Floor {tier.floor} • Keys {tier.roomsRange}
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: stats.available > 0 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {stats.available} Available
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    background: 'linear-gradient(to top, rgba(6, 14, 26, 0.95), transparent)'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--sapphire-light)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {tier.tag}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem' }}>{tier.name}</h3>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                        ₹{tier.tariff.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        +5% GST (₹{tax.totalTax})
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {tier.description}
                  </p>

                  {/* Room Specs */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    background: 'rgba(6, 14, 26, 0.5)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.25rem'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={14} color="var(--gold-champagne)" /> {tier.capacityAdults} Adults + {tier.capacityChildren} Child
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Bed size={14} color="var(--gold-champagne)" /> {tier.bedType}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={14} color="var(--gold-champagne)" /> {tier.areaSqFt} sq. ft.
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={14} color="var(--gold-champagne)" /> SAC: 996311
                    </span>
                  </div>

                  {/* Amenity Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {tier.amenities.map((am, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          color: '#e2e8f0'
                        }}
                      >
                        ✓ {am}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Action */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => onSelectTier(tier)}
                      className="btn-primary-gold"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Book Room <ArrowRight size={16} />
                    </button>
                    <button 
                      onClick={onOpen3DExplorer}
                      className="btn-secondary-sapphire"
                      style={{ padding: '0.75rem' }}
                      title="View on 3D Floor Model"
                    >
                      <Layers size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
