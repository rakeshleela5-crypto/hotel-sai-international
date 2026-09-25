import React, { useState, useEffect } from 'react';
import { 
  Scale, Hotel, Phone, Clock, Layers, Utensils, Compass, Bot, 
  ShieldCheck, Lock, Sparkles, Building2, Menu, X, ShoppingBag, 
  MapPin, CheckCircle2, FileText
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpen3DExplorer,
  onOpenDining,
  onOpenDarshan,
  onOpenAiConcierge,
  onOpenBotFleet,
  onOpenCorporate,
  onOpenMasterFolio,
  onOpenCannonKitchenPOS,
  onOpenAccountsLedger,
  onOpenNightAudit,
  onOpenStoreInventory,
  onOpenDirectorPortal,
  onOpenRevenueManagement,
  cartCount = 0,
  rooms = [],
  adminPinVerified,
  setAdminPinVerified,
  showPinPrompt: propShowPinPrompt,
  setShowPinPrompt: propSetShowPinPrompt
}) {
  const [timeString, setTimeString] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalShowPinPrompt, setInternalShowPinPrompt] = useState(false);
  const showPinPrompt = propShowPinPrompt !== undefined ? propShowPinPrompt : internalShowPinPrompt;
  const setShowPinPrompt = propSetShowPinPrompt !== undefined ? propSetShowPinPrompt : setInternalShowPinPrompt;
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdminAccess = () => {
    if (adminPinVerified) {
      setCurrentView(currentView === 'pms' ? 'guest' : 'pms');
    } else {
      setShowPinPrompt(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hsi_admin_pin');
    localStorage.removeItem('hsi_admin_pin');
    setAdminPinVerified(false);
    setCurrentView('guest');
  };

  const verifyPin = async (e) => {
    e.preventDefault();
    const pin = enteredPin.trim();
    if (!pin) {
      setPinError('Please enter the administrative security PIN.');
      return;
    }

    try {
      const res = await fetch('/api/sync', {
        headers: { 'X-Admin-Key': pin }
      });
      const data = await res.json();
      if (data && data.isAdmin) {
        sessionStorage.setItem('hsi_admin_pin', pin);
        localStorage.setItem('hsi_admin_pin', pin);
        setAdminPinVerified(true);
        setShowPinPrompt(false);
        setPinError('');
        setEnteredPin('');
        setCurrentView('pms');
      } else {
        setPinError('Invalid Security PIN. Authorization Denied.');
      }
    } catch {
      const validPin = sessionStorage.getItem('hsi_admin_pin') || localStorage.getItem('hsi_admin_pin');
      if (validPin && pin === validPin) {
        setAdminPinVerified(true);
        setShowPinPrompt(false);
        setPinError('');
        setEnteredPin('');
        setCurrentView('pms');
      } else {
        setPinError('Invalid Security PIN. Access Denied.');
      }
    }
  };

  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
  const availableCount = rooms.filter(r => r.status === 'Available').length;

  return (
    <>
      {/* Top Viewport Scroll Progress Line */}
      <div className="scroll-progress-line" style={{ width: `${scrollPercent}%` }} />

      {/* Top Statutory & Proximity Announcement Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #0c182b 0%, #13223d 50%, #0c182b 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        padding: '0.4rem 1.5rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gold-glow)' }}>
            <MapPin size={13} /> {HOTEL_CONFIG.distanceStation} | {HOTEL_CONFIG.distanceTemple}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={13} color="#38bdf8" /> 24-Hr Desk: {HOTEL_CONFIG.landline}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ color: 'var(--gold-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
            GSTIN: {HOTEL_CONFIG.gstin}
          </span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>
            ● IST: {timeString}
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span className="badge-status badge-available">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
              {availableCount} Available
            </span>
            <span className="badge-status badge-occupied">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
              {occupiedCount} Occupied
            </span>
          </div>
        </div>
      </div>

      {/* IDS Next Enterprise Operational Quick Bar (For Owner & Consultant Audit) */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(8,12,24,0.98), rgba(18,24,44,0.98))',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        padding: '0.4rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.7rem',
            background: 'rgba(212, 175, 55, 0.25)',
            color: 'var(--gold-glow)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            fontWeight: 800,
            border: '1px solid var(--gold-primary)'
          }}>
            IDS NEXT ERP
          </span>

          <button
            onClick={onOpenMasterFolio}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(96, 165, 250, 0.18)',
              border: '1px solid rgba(96, 165, 250, 0.4)',
              color: '#60a5fa',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            📑 Master Folio (Split Bill ₹13,588)
          </button>

          <button
            onClick={onOpenCannonKitchenPOS}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            🍳 Fenugreek Restaurant POS (Code 214)
          </button>

          <button
            onClick={onOpenAccountsLedger}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(52, 211, 153, 0.18)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: '#34d399',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            📊 Accounts Day Book & B2B GST
          </button>

          <button
            onClick={onOpenNightAudit}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(192, 132, 252, 0.18)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              color: '#c084fc',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            🌙 12 AM Night Audit Lock
          </button>

          <button
            onClick={onOpenDirectorPortal}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(212, 175, 55, 0.18)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: 'var(--gold-glow)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            📱 Remote Director Portal
          </button>

          <button
            onClick={onOpenStoreInventory}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#6ee7b7',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            🥬 Mandi Store
          </button>

          <button
            onClick={onOpenRevenueManagement}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.28), rgba(245, 158, 11, 0.22))',
              border: '1px solid var(--gold-primary)',
              color: 'var(--gold-glow)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.2)'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
            ⚡ IDeaS G3 RMS Console
          </button>


        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>● Front Desk Enterprise PMS</span>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'rgba(6, 14, 26, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.22)',
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{
          maxWidth: 1380,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Logo & Hotel Title */}
          <div 
            onClick={() => setCurrentView('guest')} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f3c64c 0%, #d4af37 50%, #997e26 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(212, 175, 55, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
              <Hotel size={26} color="#060e1a" strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
                  HOTEL SAI INTERNATIONAL
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  background: 'rgba(212, 175, 55, 0.18)',
                  color: 'var(--gold-glow)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  RAYAGADA
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(212, 175, 55, 0.25))',
                  color: '#e9d5ff',
                  border: '1px solid rgba(192, 132, 252, 0.65)',
                  padding: '0.12rem 0.55rem',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)',
                  letterSpacing: '0.04em'
                }}>
                  ✨ 2026 CRAFT ED.
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Premier 40-Room Executive & Pilgrim Hotel • Sai Priya Nagar • Emil Kowalski UI Motion
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div style={{ display: 'none', alignItems: 'center', gap: '1.5rem', '@media (min-width: 992px)': { display: 'flex' } }} className="desktop-nav-links">
            <button 
              onClick={() => setCurrentView('guest')}
              style={{
                color: currentView === 'guest' ? 'var(--gold-glow)' : 'var(--text-primary)',
                fontWeight: currentView === 'guest' ? 600 : 400,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              Rooms & 40-Inventory
            </button>

            <button 
              onClick={onOpen3DExplorer}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(29, 78, 216, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px'
              }}
            >
              <Layers size={15} color="#38bdf8" /> 3D Floor Explorer
            </button>

            <button 
              onClick={onOpenCannonKitchenPOS}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Utensils size={15} color="#34d399" /> Fenugreek Restaurant POS
            </button>

            <button 
              onClick={onOpenAccountsLedger}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Scale size={15} color="var(--gold-glow)" /> Audit Reconciler
            </button>

            <button 
              onClick={onOpenCorporate}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Building2 size={15} color="#8b5cf6" /> Corporate Ledgers
            </button>


          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* AI Concierge Trigger */}
            <button 
              onClick={onOpenAiConcierge}
              className="btn-outline-gold"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              title="24/7 AI Concierge"
            >
              <Sparkles size={15} color="var(--gold-glow)" />
              <span className="hide-on-mobile">AI Concierge</span>
            </button>

            {/* Back-Office PMS / Reception Toggle */}
            <button 
              onClick={handleAdminAccess}
              style={{
                background: currentView === 'pms' 
                  ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' 
                  : 'rgba(12, 24, 43, 0.8)',
                border: currentView === 'pms' 
                  ? '1px solid #60a5fa' 
                  : '1px solid rgba(212, 175, 55, 0.35)',
                color: '#fff',
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: currentView === 'pms' ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none'
              }}
            >
              {currentView === 'pms' ? (
                <>
                  <ShieldCheck size={16} color="#38bdf8" /> Exit PMS
                </>
              ) : (
                <>
                  <Lock size={15} color="var(--gold-champagne)" /> Front Desk PMS
                </>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: '#fff', padding: '0.4rem' }}
              className="show-on-mobile"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button onClick={() => { setCurrentView('guest'); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#fff', padding: '0.4rem 0' }}>
              🏨 40-Room Inventory Catalog
            </button>
            <button onClick={() => { onOpen3DExplorer(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#38bdf8', padding: '0.4rem 0' }}>
              🏛️ 3D Multi-Floor Explorer
            </button>
            <button onClick={() => { onOpenCannonKitchenPOS(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#34d399', padding: '0.4rem 0' }}>
              🍳 Fenugreek Restaurant Multi-Outlet POS
            </button>
            <button onClick={() => { onOpenAccountsLedger(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: 'var(--gold-glow)', padding: '0.4rem 0' }}>
              ⚖️ Accounts Day Book & GST Audit
            </button>
            <button onClick={() => { onOpenCorporate(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: '#a78bfa', padding: '0.4rem 0' }}>
              🏢 Corporate B2B (Ashok Leyland / JK Paper)
            </button>

            <button onClick={() => { onOpenRevenueManagement(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', color: 'var(--gold-glow)', padding: '0.4rem 0', fontWeight: 800 }}>
              ⚡ IDeaS G3 RMS Console
            </button>
          </div>
        )}
      </nav>

      {/* Admin Verification Modal */}
      {showPinPrompt && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} color="var(--gold-glow)" />
                <h3 style={{ fontSize: '1.15rem' }}>Reception & PMS Security Check</h3>
              </div>
              <button onClick={() => setShowPinPrompt(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Access to Hotel Sai International Front Desk Management, 40-Room Tape Chart, Night Audit, and Sarai Act Police Register requires duty staff authorization.
              </p>

              <form onSubmit={verifyPin}>
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={14} /> Front Desk Security PIN
                  </label>
                  <input 
                    type="password" 
                    className="form-input"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    maxLength={6}
                    autoFocus
                    required
                    style={{ letterSpacing: '0.3em', fontSize: '1.3rem', textAlign: 'center' }}
                  />
                </div>

                {pinError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {pinError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowPinPrompt(false)}
                    className="btn-outline-gold"
                    style={{ padding: '0.6rem 1.2rem' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary-gold"
                    style={{ padding: '0.6rem 1.4rem' }}
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .show-on-mobile {
            display: none !important;
          }
        }
        @media (max-width: 991px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
