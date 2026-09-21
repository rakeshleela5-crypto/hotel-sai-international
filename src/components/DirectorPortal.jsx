import React, { useState } from 'react';
import { 
  Building2, TrendingUp, DollarSign, Bed, ShieldCheck, 
  Smartphone, Eye, CheckCircle2, AlertTriangle, Clock, 
  RefreshCw, Lock, X, Users, Compass, ChevronRight
} from 'lucide-react';
import { HOTEL_CONFIG, CORPORATE_PARTNERS } from '../data/hotelData';

export default function DirectorPortal({
  isOpen,
  onClose,
  rooms = [],
  bookings = []
}) {
  if (!isOpen) return null;

  const [activeCity, setActiveCity] = useState('All Directors');
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  // Metrics
  const totalRooms = 40;
  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length || 32;
  const availableCount = rooms.filter(r => r.status === 'Available').length || 5;
  const cleaningCount = rooms.filter(r => r.status === 'Cleaning').length || 2;
  const vipHoldCount = rooms.filter(r => r.status === 'VIP Hold').length || 1;
  const occupancyPct = ((occupiedCount / totalRooms) * 100).toFixed(1);

  // Collections Today
  const todayCashInDrawer = 24500.00;
  const todayUpiBank = 46800.00;
  const todayCardPos = 12200.00;
  const todayCorpCredit = 18450.00;
  const todayGrossCollection = todayCashInDrawer + todayUpiBank + todayCardPos + todayCorpCredit;

  // Month-to-Date
  const mtdRevenue = 1842600.00;
  const mtdTarget = 2200000.00;
  const mtdProgress = ((mtdRevenue / mtdTarget) * 100).toFixed(1);
  const mtdAdr = 2480.00;
  const mtdRevpar = 1984.00;

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.92)',
      backdropFilter: 'blur(12px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1240,
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          background: 'linear-gradient(90deg, rgba(20,25,45,0.95), rgba(12,16,30,0.98))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.25)', color: 'var(--gold-glow)', border: '1px solid var(--gold-primary)' }}>
                REMOTE CLOUD DASHBOARD
              </span>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Executive Director Oversight Portal
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Secure multi-city live access for Managing Directors in Bhubaneswar, Vizag & Hyderabad
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleRefresh}
              className="btn-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={14} /> Live Sync ({lastRefreshed})
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                width: 36,
                height: 36,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Director City Location Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 2rem',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All Directors', 'Bhubaneswar HQ', 'Visakhapatnam Desk', 'Hyderabad Desk'].map(loc => (
              <button
                key={loc}
                onClick={() => setActiveCity(loc)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeCity === loc ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                  color: activeCity === loc ? 'var(--gold-glow)' : 'var(--text-muted)'
                }}
              >
                {loc}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
            Rayagada Property Online • Sub-50ms Cloud Edge
          </div>
        </div>

        {/* Dashboard Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {/* Occupancy Card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live Occupancy</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>{occupancyPct}%</div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <Bed size={22} />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <strong style={{ color: '#fff' }}>{occupiedCount}</strong> Occupied • <strong style={{ color: '#fff' }}>{availableCount}</strong> Available • <strong style={{ color: '#fff' }}>{vipHoldCount}</strong> VIP
              </div>
            </div>

            {/* Today Gross Collections */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today's Collections</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                    ₹{todayGrossCollection.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <DollarSign size={22} />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Bank UPI: <strong style={{ color: '#34d399' }}>₹{todayUpiBank.toLocaleString('en-IN')}</strong> • Drawer: <strong style={{ color: '#fff' }}>₹{todayCashInDrawer.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* MTD Net Revenue */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Month-to-Date (Sept)</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-glow)', marginTop: '0.2rem' }}>
                    ₹{(mtdRevenue / 100000).toFixed(2)}L
                  </div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-glow)' }}>
                  <TrendingUp size={22} />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Target: ₹22.0L ({mtdProgress}%) • ADR: ₹{mtdAdr}
              </div>
            </div>

            {/* Corporate Credit Health */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corporate Credit (BTC)</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>
                    ₹5.88L
                  </div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                  <Building2 size={22} />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                JK Paper, GAIL, Mahindra • 100% within 30-day term
              </div>
            </div>
          </div>

          {/* Section 2: Real-time Cashier Tender Breakdown & Shift Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
              <h4 style={{ color: '#fff', margin: '0 0 1rem', fontSize: '1.05rem' }}>
                Today's Real-Time Collection Breakdown by Tender
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#fff' }}>SBI Merchant UPI / QR:</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>₹{todayUpiBank.toLocaleString('en-IN')} (46%)</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '46%', height: '100%', background: '#34d399' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#fff' }}>Physical Cash in Safe & Drawer:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>₹{todayCashInDrawer.toLocaleString('en-IN')} (24%)</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '24%', height: '100%', background: '#38bdf8' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#fff' }}>Corporate Direct Credit (BTC):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>₹{todayCorpCredit.toLocaleString('en-IN')} (18%)</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '18%', height: '100%', background: '#fbbf24' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#fff' }}>Card Swipe Machines:</span>
                    <span style={{ fontWeight: 700, color: '#c084fc' }}>₹{todayCardPos.toLocaleString('en-IN')} (12%)</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '12%', height: '100%', background: '#c084fc' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Front Desk Operational Health */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
              <h4 style={{ color: '#fff', margin: '0 0 1rem', fontSize: '1.05rem' }}>
                Live Front Office & Cashier Status
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Duty Shift:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>Evening Shift (Sudhakar Reddy & Team)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cash Float Balance:</span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>✓ Exactly Balanced (Zero Shortage)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Next 12:00 AM Night Audit:</span>
                  <span style={{ fontWeight: 600, color: '#c084fc' }}>Scheduled in ~20 hours</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Manual Discount Overrides:</span>
                  <span style={{ fontWeight: 600, color: '#34d399' }}>0 Flagged (Audit Compliant)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 40-Room Visual Floor Matrix */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ color: '#fff', margin: 0, fontSize: '1.05rem' }}>
                40-Room Property Inventory Status
              </h4>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#38bdf8' }}>● Occupied ({occupiedCount})</span>
                <span style={{ color: '#34d399' }}>● Available ({availableCount})</span>
                <span style={{ color: '#fbbf24' }}>● Cleaning ({cleaningCount})</span>
                <span style={{ color: '#c084fc' }}>● VIP Hold ({vipHoldCount})</span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))',
              gap: '0.5rem'
            }}>
              {rooms.map(r => {
                const isOccupied = r.status === 'Occupied';
                const isAvailable = r.status === 'Available';
                const isCleaning = r.status === 'Cleaning';
                const isVip = r.status === 'VIP Hold';

                let bg = 'rgba(255,255,255,0.05)';
                let color = '#fff';
                let border = 'rgba(255,255,255,0.1)';

                if (isOccupied) {
                  bg = 'rgba(56, 189, 248, 0.2)';
                  color = '#38bdf8';
                  border = 'rgba(56, 189, 248, 0.4)';
                } else if (isAvailable) {
                  bg = 'rgba(52, 211, 153, 0.2)';
                  color = '#34d399';
                  border = 'rgba(52, 211, 153, 0.4)';
                } else if (isCleaning) {
                  bg = 'rgba(245, 158, 11, 0.2)';
                  color = '#fbbf24';
                  border = 'rgba(245, 158, 11, 0.4)';
                } else if (isVip) {
                  bg = 'rgba(192, 132, 252, 0.2)';
                  color = '#c084fc';
                  border = 'rgba(192, 132, 252, 0.4)';
                }

                return (
                  <div
                    key={r.roomNumber}
                    style={{
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: '6px',
                      padding: '0.5rem 0.25rem',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color }}>{r.roomNumber}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{r.status.slice(0, 4)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
