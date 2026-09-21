import React, { useState, useRef, useEffect } from 'react';
import { 
  UtensilsCrossed, Plus, Minus, Trash2, Printer, CheckCircle2, 
  Search, Hash, DollarSign, Smartphone, Bed, ShieldCheck, X, 
  Send, Sparkles, Clock, AlertCircle
} from 'lucide-react';
import { RESTAURANT_MENU, HOTEL_CONFIG, MYPOS_CANNON_KITCHEN_LAYOUT } from '../data/hotelData';

export default function CannonKitchenPOS({
  isOpen,
  onClose,
  rooms = [],
  onBillToRoom
}) {
  if (!isOpen) return null;

  // View Mode: 'tableGrid' (Authentic MySoft Screenshot 20 layout) | 'menu'
  const [posViewMode, setPosViewMode] = useState('tableGrid');

  // Outlet selection: 'Cannon Kitchen (Dine-In)', 'Bar Outlet', 'Room Service', 'Swiggy / Zomato'
  const [selectedOutlet, setSelectedOutlet] = useState('Cannon Kitchen');
  
  // Table or Room selector
  const [orderType, setOrderType] = useState('room'); // 'room', 'table', 'delivery'
  const [targetRoom, setTargetRoom] = useState('402');
  const [tableNumber, setTableNumber] = useState('6');
  const [captainName, setCaptainName] = useState('KOTI');

  // Fast numeric code input state
  const [codeQuery, setCodeQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const codeInputRef = useRef(null);

  // Cart / KOT Items
  const [cart, setCart] = useState([
    {
      item: RESTAURANT_MENU.find(m => m.itemCode === '214') || RESTAURANT_MENU[4],
      quantity: 1,
      notes: 'Medium spicy, stone-ground mustard gravy'
    },
    {
      item: RESTAURANT_MENU.find(m => m.itemCode === '307') || RESTAURANT_MENU[7],
      quantity: 2,
      notes: 'Extra hot'
    }
  ]);

  const [kotSentSuccess, setKotSentSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [isOpen]);

  // Determine price based on active outlet
  const getItemPrice = (item) => {
    if (selectedOutlet === 'Room Service') return item.roomServicePrice || item.price * 1.1;
    if (selectedOutlet === 'Swiggy / Zomato') return item.swiggyPrice || item.price * 1.45;
    if (selectedOutlet === 'Bar Outlet') return item.barPrice || item.price * 1.05;
    return item.dineInPrice || item.price;
  };

  // Add item by numeric code (Fast Numpad Flow)
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!codeQuery.trim()) return;

    const matched = RESTAURANT_MENU.find(m => m.itemCode === codeQuery.trim());
    if (matched) {
      addItemToCart(matched);
      setCodeQuery('');
    } else {
      alert(`Item code "${codeQuery}" not found in Menu. Try 214 (Mushroom Masala) or 307 (Rice).`);
    }
  };

  const addItemToCart = (item) => {
    const existingIndex = cart.findIndex(c => c.item.id === item.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { item, quantity: 1, notes: '' }]);
    }
  };

  const updateQuantity = (itemId, delta) => {
    const updated = cart.map(c => {
      if (c.item.id === itemId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter(Boolean);
    setCart(updated);
  };

  // Tax calculations (F&B: 5% GST without ITC under SAC 996331)
  const subtotal = cart.reduce((sum, c) => sum + (getItemPrice(c.item) * c.quantity), 0);
  const gst = subtotal * 0.05;
  const netTotal = subtotal + gst;

  // Handle "Bill to Room" action (fixes MySoft bug)
  const handleTransferToRoom = () => {
    if (cart.length === 0) return;

    const kotId = `CK-KOT-${Date.now().toString().slice(-4)}`;
    const itemsDescription = cart.map(c => `${c.quantity}x ${c.item.name}`).join(', ');

    const payload = {
      kotId,
      roomNumber: targetRoom,
      outlet: selectedOutlet,
      items: cart,
      subtotal,
      gst,
      totalAmount: netTotal,
      description: `${selectedOutlet} Order (${itemsDescription})`,
      captainName,
      createdAt: new Date().toISOString()
    };

    if (onBillToRoom) {
      onBillToRoom(payload);
    }

    setLastOrderDetails(payload);
    setKotSentSuccess(true);
    setCart([]);
  };

  // Filtered menu list for visual clicking
  const filteredMenu = RESTAURANT_MENU.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.itemCode.includes(searchQuery);
    return matchesSearch;
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1340,
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(90deg, rgba(25,20,10,0.95), rgba(15,12,8,0.98))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b' }}>
                HIGH-SPEED F&B POS
              </span>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Cannon Kitchen & Multi-Outlet Order Terminal
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Numpad short codes • Differential outlet pricing • Seamless "Bill to Room" Folio transfer
            </p>
          </div>

          {/* Outlet Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '10px' }}>
            {[
              { id: 'Cannon Kitchen', label: 'Cannon Kitchen (Dine-in)', markup: 'Standard Base' },
              { id: 'Bar Outlet', label: 'Bar Outlet', markup: '+5% Bar' },
              { id: 'Room Service', label: 'Room Service', markup: '+10% Tray' },
              { id: 'Swiggy / Zomato', label: 'Swiggy / Zomato', markup: '+45% Aggregator' }
            ].map(outlet => (
              <button
                key={outlet.id}
                onClick={() => setSelectedOutlet(outlet.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: selectedOutlet === outlet.id ? 'var(--gold-primary)' : 'transparent',
                  color: selectedOutlet === outlet.id ? '#000' : 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <span>{outlet.label}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{outlet.markup}</span>
              </button>
            ))}
          </div>

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

        {/* Mode Switcher Bar (Screenshot 20: Table Grid vs Code Entry) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 1.75rem',
          background: 'rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPosViewMode('tableGrid')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: posViewMode === 'tableGrid' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: posViewMode === 'tableGrid' ? '#34d399' : 'var(--text-muted)',
                border: posViewMode === 'tableGrid' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '2px', background: '#10b981' }}></span>
              🔲 MyPOS Table Grid (Screenshot 20)
            </button>
            <button
              onClick={() => setPosViewMode('menu')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: posViewMode === 'menu' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: posViewMode === 'menu' ? '#fbbf24' : 'var(--text-muted)',
                border: posViewMode === 'menu' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              📋 Fast Code & Dish Catalog
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span>Duty Steward: <strong style={{ color: 'var(--gold-glow)' }}>{captainName}</strong></span>
            <span>Active Table: <strong style={{ color: '#38bdf8' }}>{tableNumber}</strong></span>
            <span>Target Room: <strong style={{ color: '#34d399' }}>Room {targetRoom}</strong></span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Column: Menu Items & Short Code Numpad Entry OR Table Grid */}
          <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {/* Quick Fast Numpad Input Bar */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <form onSubmit={handleCodeSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                <div style={{ position: 'relative', flex: '0 0 200px' }}>
                  <Hash size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#fbbf24' }} />
                  <input
                    ref={codeInputRef}
                    type="text"
                    placeholder="Short Code (e.g. 214)"
                    value={codeQuery}
                    onChange={(e) => setCodeQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      background: '#0d111d',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      letterSpacing: '1px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 700, background: '#f59e0b', color: '#000' }}
                >
                  Enter [↵]
                </button>
              </form>

              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Or search by dish name, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                    background: '#0d111d',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Quick Reference Code Strip */}
            <div style={{
              padding: '0.5rem 1.5rem',
              background: 'rgba(245, 158, 11, 0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: '1rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ fontWeight: 600, color: '#fbbf24' }}>Quick Codes:</span>
              <span><strong style={{ color: '#fff' }}>214:</strong> Mushroom Masala</span>
              <span><strong style={{ color: '#fff' }}>215:</strong> Paneer Butter</span>
              <span><strong style={{ color: '#fff' }}>216:</strong> Desi Chicken</span>
              <span><strong style={{ color: '#fff' }}>307:</strong> Plain Rice</span>
              <span><strong style={{ color: '#fff' }}>101:</strong> Chhena Poda</span>
              <span><strong style={{ color: '#fff' }}>401:</strong> Masala Chai</span>
            </div>

            {/* Conditional Content: Authentic MySoft Table Grid OR Fast Dish Catalog */}
            {posViewMode === 'tableGrid' ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Active KOTs Alert Banner */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }}></span>
                    <strong style={{ color: '#fbbf24' }}>Active Kitchen Orders Running:</strong>
                    <span style={{ color: '#cbd5e1' }}>Table 6 (KOT #F2627-7514 • KOTI • ₹1,190) | Table B (KOT #F2627-7515 • SADANANDA)</span>
                  </div>
                  <span style={{ color: '#94a3b8' }}>Tap any table or room button to select and add dishes</span>
                </div>

                {/* Section 1: Main Dining Tables (1 - 13) */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-glow)', marginBottom: '0.5rem' }}>
                    🍽️ Ground Floor Main Dining (Tables 1 – 13)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.65rem' }}>
                    {MYPOS_CANNON_KITCHEN_LAYOUT.tables.filter(t => t.section === 'Main Dining').map(table => {
                      const activeKot = MYPOS_CANNON_KITCHEN_LAYOUT.activeKotOrders.find(k => k.tableId === table.id);
                      const isSelected = tableNumber === table.id;

                      return (
                        <div
                          key={table.id}
                          onClick={() => {
                            setTableNumber(table.id);
                            setOrderType('table');
                            if (activeKot) setCaptainName(activeKot.steward);
                          }}
                          style={{
                            background: activeKot 
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.35))'
                              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.25))',
                            border: isSelected 
                              ? '2px solid var(--gold-glow)' 
                              : activeKot ? '1px solid #f59e0b' : '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '8px',
                            padding: '0.6rem 0.4rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: activeKot ? '#fbbf24' : '#34d399' }}>
                            {table.label}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            {activeKot ? `₹${activeKot.amount} (${activeKot.steward})` : 'VACANT'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Terrace & Bar Lounge (1A - 13A & 1B - 5B) */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
                    🍸 Terrace & Bar Lounge (Tables 1A–13A & 1B–5B)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.65rem' }}>
                    {[
                      ...MYPOS_CANNON_KITCHEN_LAYOUT.tables.filter(t => t.section === 'Terrace Dining'),
                      ...MYPOS_CANNON_KITCHEN_LAYOUT.tables.filter(t => t.section === 'Bar Lounge')
                    ].map(table => {
                      const activeKot = MYPOS_CANNON_KITCHEN_LAYOUT.activeKotOrders.find(k => k.tableId === table.id);
                      const isSelected = tableNumber === table.id;

                      return (
                        <div
                          key={table.id}
                          onClick={() => {
                            setTableNumber(table.id);
                            setOrderType('table');
                            setSelectedOutlet(table.section === 'Bar Lounge' ? 'Bar Outlet' : 'Cannon Kitchen');
                          }}
                          style={{
                            background: activeKot 
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(180, 83, 9, 0.35))'
                              : 'rgba(56, 189, 248, 0.12)',
                            border: isSelected 
                              ? '2px solid var(--gold-glow)' 
                              : activeKot ? '1px solid #f59e0b' : '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '8px',
                            padding: '0.6rem 0.4rem',
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: activeKot ? '#fbbf24' : '#38bdf8' }}>
                            {table.label}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                            {activeKot ? activeKot.status : 'VACANT'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Banquets, Halls & PDRs */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem' }}>
                    🏛️ Private Dining Rooms & Banquets (PDR, PAR3–16, A/C Conference)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem' }}>
                    {MYPOS_CANNON_KITCHEN_LAYOUT.tables.filter(t => t.section === 'PDR' || t.section === 'Banquet' || t.section === 'Admin').map(table => {
                      const isSelected = tableNumber === table.id;

                      return (
                        <div
                          key={table.id}
                          onClick={() => {
                            setTableNumber(table.id);
                            setOrderType('table');
                          }}
                          style={{
                            background: 'rgba(168, 85, 247, 0.12)',
                            border: isSelected ? '2px solid var(--gold-glow)' : '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '8px',
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#c084fc' }}>
                            {table.id}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {table.label} ({table.pax} Pax)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Direct Room Service Transfer Buttons */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>
                    🛎️ Direct Room Service Transfer Keys (Bill to Folio)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.65rem' }}>
                    {['201', '202', '206', '207', '208', '301', '304', '305', '308', '402', '408', '409', '410', '411', '412', '413', '415', '416'].map(rNum => {
                      const isSelected = targetRoom === rNum && orderType === 'room';
                      return (
                        <button
                          key={rNum}
                          onClick={() => {
                            setTargetRoom(rNum);
                            setOrderType('room');
                            setSelectedOutlet('Room Service');
                          }}
                          style={{
                            background: isSelected ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                            border: isSelected ? '2px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            padding: '0.55rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: isSelected ? 'var(--gold-glow)' : '#f8fafc',
                            fontWeight: 800,
                            fontSize: '0.85rem'
                          }}
                        >
                          R-{rNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Fast Dish Catalog View */
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.85rem',
                alignContent: 'flex-start'
              }}>
              {filteredMenu.map(dish => {
                const activePrice = getItemPrice(dish);
                return (
                  <div
                    key={dish.id}
                    onClick={() => addItemToCart(dish)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#fbbf24';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700 }}>
                        #{dish.itemCode}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: dish.isVeg ? '#34d399' : '#f87171' }}>
                        {dish.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', marginBottom: '0.25rem', lineHeight: '1.2' }}>
                      {dish.name}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {dish.category}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>
                        ₹{activePrice.toFixed(0)}
                      </span>
                      <button
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          color: '#fff',
                          width: 26,
                          height: 26,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* Right Column: Order Cart & Bill-to-Room Action */}
          <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', background: 'rgba(10, 14, 25, 0.4)' }}>
            {/* Order Destination Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setOrderType('room')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: orderType === 'room' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: orderType === 'room' ? '#38bdf8' : 'var(--text-muted)',
                    border: orderType === 'room' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Bill to In-House Room
                </button>
                <button
                  onClick={() => setOrderType('table')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: orderType === 'table' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                    color: orderType === 'table' ? '#34d399' : 'var(--text-muted)',
                    border: orderType === 'table' ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Restaurant Dine-In Table
                </button>
              </div>

              {orderType === 'room' ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Target Room Folio</label>
                    <select
                      value={targetRoom}
                      onChange={(e) => setTargetRoom(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        background: '#0d111d',
                        color: '#fff',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <option value="402">Room 402 - Anil Sharma (GAIL)</option>
                      <option value="301">Room 301 - Vikram Singhania (JK Paper)</option>
                      <option value="104">Room 104 - Santosh Patra (Pilgrim)</option>
                      <option value="202">Room 202 - Prakash Tripathy</option>
                    </select>
                  </div>
                  <div style={{ width: 130 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Captain / Waiter</label>
                    <input
                      type="text"
                      value={captainName}
                      onChange={(e) => setCaptainName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        background: '#0d111d',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Dining Table #</label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        background: '#0d111d',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="T-01">Table 1 (Window Vista)</option>
                      <option value="T-02">Table 2 (Family 6-Seater)</option>
                      <option value="T-03">Table 3 (4-Seater)</option>
                      <option value="T-04">Table 4 (Executive)</option>
                      <option value="T-05">Table 5 (Bar Counter)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <UtensilsCrossed size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <div>No items in active KOT.</div>
                  <div style={{ fontSize: '0.8rem' }}>Type a code like 214 or click menu items.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cart.map((c, i) => {
                    const price = getItemPrice(c.item);
                    return (
                      <div
                        key={c.item.id}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                            {c.item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            #{c.item.itemCode} • ₹{price.toFixed(0)} each
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateQuantity(c.item.id, -1)}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: 'none',
                              color: '#fff',
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: 700, color: '#fff', minWidth: 20, textAlign: 'center' }}>
                            {c.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(c.item.id, 1)}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: 'none',
                              color: '#fff',
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div style={{ width: 80, textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                          ₹{(price * c.quantity).toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bill Summary & Action Footer */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                <span>Subtotal ({cart.length} items):</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span>GST @ 5% (SAC 996331):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', marginBottom: '1rem' }}>
                <span>Net KOT Total:</span>
                <span style={{ color: '#fbbf24' }}>₹{netTotal.toFixed(2)}</span>
              </div>

              {kotSentSuccess ? (
                <div style={{
                  padding: '0.85rem',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid #34d399',
                  borderRadius: '8px',
                  color: '#34d399',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>KOT #{lastOrderDetails?.kotId} Transferred!</strong>
                    <div>₹{lastOrderDetails?.totalAmount.toFixed(2)} debited directly to Room {lastOrderDetails?.roomNumber} Master Folio.</div>
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {orderType === 'room' ? (
                  <button
                    onClick={handleTransferToRoom}
                    disabled={cart.length === 0}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      background: '#f59e0b',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: cart.length === 0 ? 0.5 : 1,
                      cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Bed size={16} /> Bill to Room {targetRoom} Folio
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      alert(`KOT for ${tableNumber} printed to Cannon Kitchen! Total: ₹${netTotal.toFixed(2)}`);
                      setCart([]);
                    }}
                    disabled={cart.length === 0}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.75rem', fontWeight: 700 }}
                  >
                    Print KOT to Kitchen (Table {tableNumber})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
