import React from 'react';
import { 
  Calendar, Users, Sparkles, Layers, ShieldCheck, MapPin, 
  ArrowRight, Compass, Phone, CheckCircle2, Star, Wifi, Coffee, Building2
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS } from '../data/hotelData';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Marquee } from '@/components/ui/marquee';

export default function Hero({
  rooms = [],
  onOpenBooking,
  onOpen3DExplorer,
  onOpenAiConcierge,
  searchDates,
  setSearchDates
}) {
  const getFloorAvailability = (floorNum) => {
    const floorRooms = rooms.filter(r => r.floor === floorNum);
    const available = floorRooms.filter(r => r.status === 'Available').length;
    return { available, total: floorRooms.length || 10 };
  };

  const fl1 = getFloorAvailability(1);
  const fl2 = getFloorAvailability(2);
  const fl3 = getFloorAvailability(3);
  const fl4 = getFloorAvailability(4);

  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '3.5rem 1.5rem 4rem 1.5rem' }}>
      {/* Cinematic Ken Burns Background Aura */}
      <div 
        className="ken-burns"
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(29, 78, 216, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />

      <div style={{ maxWidth: 1300, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Top Trust & Regional Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem'
        }}>
          <div 
            className="aura-breathing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(212, 175, 55, 0.14)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--gold-glow)'
            }}
          >
            <Sparkles size={14} /> Rayagada's Premier <span style={{ color: '#fff', margin: '0 3px' }}><NumberTicker value={40} /></span>-Room Hospitality Landmark
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(29, 78, 216, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            color: '#38bdf8'
          }}>
            <MapPin size={13} /> 1.5 km to RGDA Railway Junction • 2.0 km to Maa Majhighariani Mandir
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem'
          }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={{ color: '#fff', fontWeight: 600 }}>4.96/5</span> (<span style={{ color: 'var(--gold-glow)' }}><NumberTicker value={2850} />+</span> Verified Stays)
            
            {/* Live Audio / Concierge Soundwave Indicator */}
            <div className="soundwave-container" style={{ marginLeft: '0.5rem' }} title="24/7 Live Guest Support Active">
              <span className="soundwave-bar"></span>
              <span className="soundwave-bar"></span>
              <span className="soundwave-bar"></span>
              <span className="soundwave-bar"></span>
            </div>
          </div>
        </div>

        {/* Hero Main Headline & Subtitle */}
        <div style={{ maxWidth: 880, marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.3rem, 5vw, 3.8rem)',
            lineHeight: 1.15,
            marginBottom: '1.25rem'
          }}>
            Experience Imperial Serenity in the <span className="gold-gradient-text">Heart of Rayagada</span>
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 760
          }}>
            Welcome to <strong>Hotel Sai International</strong>, Sai Priya Nagar. Featuring 40 thoughtfully curated rooms across 4 luxury tiers, in-room Satvik & Odia dining, seamless RGDA train transit pickups, and sacred Maa Majhighariani Temple pilgrimage assistance.
          </p>
        </div>

        {/* Real-Time 40-Room Availability Cards Across 4 Floors (Staggered Waterfall Entry) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}>
          {/* Floor 1: Standard Deluxe */}
          <div className="glass-panel waterfall-item waterfall-delay-1" style={{ padding: '1.2rem 1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', fontWeight: 600, letterSpacing: '0.05em' }}>
                1ST FLOOR (101 - 110)
              </span>
              <span className={`badge-status ${fl1.available > 0 ? 'badge-available' : 'badge-occupied'}`}>
                {fl1.available > 0 && <span className="ripple-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-available)', marginRight: 3 }}></span>}
                {fl1.available} / 10 Free
              </span>
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Standard Deluxe</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              King Bed • AC • Free Buffet Breakfast
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>₹1,699</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / night + GST</span>
              </div>
              <button 
                onClick={() => onOpenBooking(ROOM_TIERS[0])}
                className="btn-outline-gold"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Book Tier
              </button>
            </div>
          </div>

          {/* Floor 2: Deluxe Room */}
          <div className="glass-panel waterfall-item waterfall-delay-2" style={{ padding: '1.2rem 1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', fontWeight: 600, letterSpacing: '0.05em' }}>
                2ND FLOOR (201 - 210)
              </span>
              <span className={`badge-status ${fl2.available > 0 ? 'badge-available' : 'badge-occupied'}`}>
                {fl2.available > 0 && <span className="ripple-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-available)', marginRight: 3 }}></span>}
                {fl2.available} / 10 Free
              </span>
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Deluxe Room</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Balcony • Premium AC • In-Room Dining
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>₹2,199</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / night + GST</span>
              </div>
              <button 
                onClick={() => onOpenBooking(ROOM_TIERS[1])}
                className="btn-outline-gold"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Book Tier
              </button>
            </div>
          </div>

          {/* Floor 3: Executive Room */}
          <div className="glass-panel waterfall-item waterfall-delay-3" style={{ padding: '1.2rem 1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', fontWeight: 600, letterSpacing: '0.05em' }}>
                3RD FLOOR (301 - 310)
              </span>
              <span className={`badge-status ${fl3.available > 0 ? 'badge-available' : 'badge-occupied'}`}>
                {fl3.available > 0 && <span className="ripple-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-available)', marginRight: 3 }}></span>}
                {fl3.available} / 10 Free
              </span>
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Executive Room</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Workstation • Mini Bar • Station Transit
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>₹2,899</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / night + GST</span>
              </div>
              <button 
                onClick={() => onOpenBooking(ROOM_TIERS[2])}
                className="btn-outline-gold"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Book Tier
              </button>
            </div>
          </div>

          {/* Floor 4: Premium Suite */}
          <div className="glass-panel waterfall-item waterfall-delay-4" style={{ padding: '1.2rem 1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', fontWeight: 600, letterSpacing: '0.05em' }}>
                4TH FLOOR (401 - 410)
              </span>
              <span className={`badge-status ${fl4.available > 0 ? 'badge-available' : 'badge-occupied'}`}>
                {fl4.available > 0 && <span className="ripple-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--status-available)', marginRight: 3 }}></span>}
                {fl4.available} / 10 Free
              </span>
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Premium Suite</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Living Room • Master Suite • Local Shuttle
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>₹3,999</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / night + GST</span>
              </div>
              <button 
                onClick={() => onOpenBooking(ROOM_TIERS[3])}
                className="btn-outline-gold"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Book Tier
              </button>
            </div>
          </div>
        </div>

        {/* Live Booking Engine Bar */}
        <div className="glass-panel" style={{
          padding: '1.5rem 2rem',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.15)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            alignItems: 'flex-end'
          }}>
            {/* Check-In Date */}
            <div>
              <label className="form-label">
                <Calendar size={14} color="var(--gold-glow)" /> Check-In Date (12:00 PM)
              </label>
              <input 
                type="date"
                className="form-input"
                style={{ width: '100%' }}
                value={searchDates.checkIn}
                onChange={(e) => setSearchDates({ ...searchDates, checkIn: e.target.value })}
              />
            </div>

            {/* Check-Out Date */}
            <div>
              <label className="form-label">
                <Calendar size={14} color="var(--gold-glow)" /> Check-Out Date (12:00 PM)
              </label>
              <input 
                type="date"
                className="form-input"
                style={{ width: '100%' }}
                value={searchDates.checkOut}
                onChange={(e) => setSearchDates({ ...searchDates, checkOut: e.target.value })}
              />
            </div>

            {/* Adults & Children */}
            <div>
              <label className="form-label">
                <Users size={14} color="var(--gold-glow)" /> Guests & Room
              </label>
              <select 
                className="form-select"
                style={{ width: '100%' }}
                value={searchDates.guests}
                onChange={(e) => setSearchDates({ ...searchDates, guests: e.target.value })}
              >
                <option value="1">1 Adult (Executive)</option>
                <option value="2">2 Adults (Couple / Deluxe)</option>
                <option value="3">2 Adults + 1 Child (Standard)</option>
                <option value="4">3 Adults (Executive Corporate)</option>
                <option value="5">4 Adults (Family Suite)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <ShimmerButton 
                onClick={() => onOpenBooking(ROOM_TIERS[0])}
                shimmerColor="#fceec5"
                background="linear-gradient(135deg, #d4af37 0%, #aa831b 100%)"
                className="font-bold text-[#060e1a] shadow-[0_4px_25px_rgba(212,175,55,0.4)]"
                style={{ flex: 1, padding: '0.75rem 1.25rem' }}
              >
                <span className="flex items-center gap-1.5 font-bold tracking-wide">
                  Instant Reserve <ArrowRight size={16} />
                </span>
              </ShimmerButton>
              <button 
                onClick={onOpen3DExplorer}
                className="btn-secondary-sapphire"
                style={{ padding: '0.75rem', justifyContent: 'center' }}
                title="View 3D Floor Plan"
              >
                <Layers size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Magic UI Infinite Marquee for Corporate & Regional Partners */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: 'var(--gold-glow)', 
            marginBottom: '0.75rem', 
            textAlign: 'center',
            fontWeight: 600
          }}>
            Trusted Corporate Corridors &amp; Pilgrimage Partners
          </div>
          <Marquee className="[--duration:28s]" pauseOnHover>
            {[
              { name: "JK Paper Ltd (Rayagada Mills)", badge: "Corporate B2B Rate Tie-up" },
              { name: "IMFA Therubali", badge: "Preferred Executive Stay" },
              { name: "Maa Majhighariani Temple Trust", badge: "Sacred Pilgrim Portal" },
              { name: "Utkal Alumina (Aditya Birla)", badge: "Industrial Guest Corridor" },
              { name: "East Coast Railways (RGDA)", badge: "1.5 km Station Pick-up" },
              { name: "Odisha Tourism Dev Corp", badge: "Verified Heritage Partner" },
            ].map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(12, 24, 43, 0.65)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Building2 size={13} color="var(--gold-glow)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                  {p.name}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  {p.badge}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
