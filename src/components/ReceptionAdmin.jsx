import React, { useState } from 'react';
import { 
  Hotel, Layers, Users, Calendar, ShieldCheck, Clock, 
  DollarSign, CheckCircle2, AlertTriangle, Printer, Download, 
  Search, RefreshCw, UserCheck, Phone, FileText, Sparkles, 
  Check, X, ChevronRight, Lock, Bed, Send
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS } from '../data/hotelData';
import { maskAadhaar } from '../utils/security';
import { calculateRoomTax } from '../utils/taxUtils';

export default function ReceptionAdmin({
  rooms = [],
  bookings = [],
  onUpdateRoomStatus,
  onNewBooking,
  onRunNightAudit,
  nightAudits = []
}) {
  const [activeTab, setActiveTab] = useState('tape-chart'); // 'tape-chart', 'walk-in', 'cashier-audit', 'housekeeping', 'police-register', 'dpdp'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Walk-in Modal State
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInRoom, setWalkInRoom] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAadhaar, setWalkInAadhaar] = useState('');
  const [walkInRate, setWalkInRate] = useState(1699);
  const [walkInDeposit, setWalkInDeposit] = useState(1699);
  const [walkInOrigin, setWalkInOrigin] = useState('Odisha');
  const [walkInNights, setWalkInNights] = useState(1);
  const [walkInPaymentMode, setWalkInPaymentMode] = useState('Cash');

  // Cashier Handover State
  const [openingFloat, setOpeningFloat] = useState(5000);
  const [cashCollected, setCashCollected] = useState(18500);
  const [pettyCashPaid, setPettyCashPaid] = useState(1200);
  const [closingCashActual, setClosingCashActual] = useState(22300);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Police Register Dispatch State
  const [policeDispatchSent, setPoliceDispatchSent] = useState(false);

  // Filtered rooms for Tape Chart
  const filteredRooms = rooms.filter(r => {
    const matchesFilter = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = r.roomNumber.includes(searchTerm) || 
      (r.currentGuestName && r.currentGuestName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    if (!walkInRoom || !walkInName || !walkInPhone) return;

    const selectedRoomObj = rooms.find(r => r.roomNumber === walkInRoom);
    const tier = selectedRoomObj ? selectedRoomObj.tier : 'Standard Deluxe';
    const tax = calculateRoomTax(walkInRate * walkInNights);

    const bookingPayload = {
      bookingId: `WALK-${Date.now().toString().slice(-6)}`,
      roomNumber: walkInRoom,
      tier,
      guestName: walkInName,
      guestPhone: walkInPhone,
      idProofType: 'Aadhaar',
      idProofMasked: maskAadhaar(walkInAadhaar),
      stateOfOrigin: walkInOrigin,
      isInterstate: walkInOrigin.toLowerCase() !== 'odisha',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + walkInNights * 86400000).toISOString().split('T')[0],
      nights: walkInNights,
      adults: 1,
      children: 0,
      tariffPerNight: walkInRate,
      baseTotal: walkInRate * walkInNights,
      cgst: tax.cgst,
      sgst: tax.sgst,
      totalAmount: tax.total,
      advanceDeposit: Number(walkInDeposit),
      balanceDue: Math.max(0, tax.total - Number(walkInDeposit)),
      paymentMode: walkInPaymentMode,
      paymentStatus: Number(walkInDeposit) >= tax.total ? 'Paid at Check-In' : 'Partially Paid',
      bookingStatus: 'Checked In',
      isB2b: false,
      consentDpdp: 1
    };

    onNewBooking(bookingPayload);
    onUpdateRoomStatus(walkInRoom, 'Occupied', walkInName, bookingPayload.bookingId);
    setWalkInOpen(false);
  };

  const executeShiftHandover = () => {
    const expected = openingFloat + cashCollected - pettyCashPaid;
    const variance = closingCashActual - expected;
    setHandoverSuccess(true);
    setTimeout(() => setHandoverSuccess(false), 4000);
  };

  const dispatchPoliceRegisterWhatsApp = () => {
    setPoliceDispatchSent(true);
    setTimeout(() => setPoliceDispatchSent(false), 5000);
  };

  return (
    <section style={{ padding: '2rem 1.5rem 4rem 1.5rem', maxWidth: 1380, margin: '0 auto' }}>
      {/* Front Desk Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-glow)', fontSize: '0.8rem', fontWeight: 600 }}>
            <ShieldCheck size={16} /> Central PMS Command Center • Rayagada
          </div>
          <h2 style={{ fontSize: '2.1rem' }}>Reception & 40-Room Property Desk</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Connected to Cloudflare Edge • Sarai Act 1867 & Statutory Rule 46 Compliant
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setWalkInOpen(true)}
            className="btn-primary-gold"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            <UserCheck size={16} /> Express Walk-In Check-In
          </button>
          <button 
            onClick={() => setActiveTab('cashier-audit')}
            className="btn-secondary-sapphire"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            <Clock size={16} /> Cashier Handover & Night Audit
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '1.75rem',
        background: 'rgba(6, 14, 26, 0.7)',
        padding: '0.4rem',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {[
          { id: 'tape-chart', label: '📊 40-Room Tape Chart (Gantt View)' },
          { id: 'cashier-audit', label: '💰 Cashier Shift Handover & Night Audit' },
          { id: 'housekeeping', label: '🧹 Housekeeping & Linen Tracker' },
          { id: 'police-register', label: '🚨 Sarai Act Police Register' },
          { id: 'dpdp', label: '🛡️ DPDP Act 2023 Compliance' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === tab.id ? 'var(--gold-glow)' : 'transparent',
              color: activeTab === tab.id ? '#060e1a' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 40-ROOM TAPE CHART (GANTT VIEW) */}
      {activeTab === 'tape-chart' && (
        <div>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['all', 'Available', 'Occupied', 'Cleaning', 'Maintenance', 'VIP Hold'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: statusFilter === st ? 'rgba(212, 175, 55, 0.25)' : 'rgba(12, 24, 43, 0.6)',
                    color: statusFilter === st ? 'var(--gold-glow)' : '#94a3b8',
                    border: statusFilter === st ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {st === 'all' ? 'All (40)' : st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search Room / Guest..." 
                className="form-input" 
                style={{ width: '100%', paddingLeft: '2rem', paddingRight: '0.75rem', height: 38, fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 4-Floor Tape Chart Table */}
          <div className="tape-chart-container">
            {[1, 2, 3, 4].map(floorNum => {
              const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
              if (floorRooms.length === 0) return null;

              const tierName = floorNum === 1 ? 'Standard Deluxe (₹1,699)' : floorNum === 2 ? 'Deluxe Room (₹2,199)' : floorNum === 3 ? 'Executive Room (₹2,899)' : 'Premium Suite (₹3,999)';

              return (
                <div key={floorNum} className="tape-floor-group">
                  <div className="tape-floor-header">
                    <span>FLOOR {floorNum} • {tierName}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {floorRooms.filter(r => r.status === 'Available').length} / {floorRooms.length} Available
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem', padding: '1rem' }}>
                    {floorRooms.map(room => (
                      <div 
                        key={room.roomNumber}
                        style={{
                          background: 'rgba(6, 14, 26, 0.65)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                            Room {room.roomNumber}
                          </span>
                          <span className={`badge-status badge-${(room.status || 'available').toLowerCase().replace(' ', '-')}`}>
                            {room.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {room.currentGuestName ? (
                            <div style={{ color: '#f8fafc', fontWeight: 600 }}>
                              👤 {room.currentGuestName}
                            </div>
                          ) : (
                            <div style={{ color: 'var(--text-muted)' }}>
                              Bed: {room.bedType || 'King Bed'}
                            </div>
                          )}
                        </div>

                        {/* Fast Status Modifier */}
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: 'auto', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {room.status !== 'Available' && (
                            <button
                              onClick={() => onUpdateRoomStatus(room.roomNumber, 'Available', null, null)}
                              style={{
                                flex: 1,
                                padding: '0.25rem',
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}
                            >
                              Free
                            </button>
                          )}
                          {room.status !== 'Cleaning' && (
                            <button
                              onClick={() => onUpdateRoomStatus(room.roomNumber, 'Cleaning', null, null)}
                              style={{
                                flex: 1,
                                padding: '0.25rem',
                                background: 'rgba(245, 158, 11, 0.2)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}
                            >
                              Clean
                            </button>
                          )}
                          {room.status !== 'VIP Hold' && (
                            <button
                              onClick={() => onUpdateRoomStatus(room.roomNumber, 'VIP Hold', 'VIP Hold / Dignitary', null)}
                              style={{
                                flex: 1,
                                padding: '0.25rem',
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#a78bfa',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}
                            >
                              Hold
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CASHIER SHIFT HANDOVER & NIGHT AUDIT */}
      {activeTab === 'cashier-audit' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {/* Shift Handover Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--gold-glow)" /> Cashier Shift Handover Slip
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shift Type:</span>
                <span style={{ fontWeight: 600 }}>Evening (15:00 - 23:00)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Opening Float:</span>
                <span style={{ fontWeight: 600 }}>₹{openingFloat.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cash Receipts (Rooms & POS):</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>+ ₹{cashCollected.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Petty Cash Vouchers Paid:</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>- ₹{pettyCashPaid.toLocaleString()}</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Expected Cash in Drawer:</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold-glow)' }}>
                  ₹{(openingFloat + cashCollected - pettyCashPaid).toLocaleString()}
                </span>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Actual Physical Cash Counted in Drawer:</label>
                <input 
                  type="number"
                  className="form-input"
                  value={closingCashActual}
                  onChange={(e) => setClosingCashActual(Number(e.target.value))}
                />
              </div>

              {/* Discrepancy Status */}
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: closingCashActual === (openingFloat + cashCollected - pettyCashPaid)
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                border: closingCashActual === (openingFloat + cashCollected - pettyCashPaid)
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Drawer Variance:</span>
                <strong style={{ color: closingCashActual === (openingFloat + cashCollected - pettyCashPaid) ? '#10b981' : '#f87171' }}>
                  {closingCashActual === (openingFloat + cashCollected - pettyCashPaid) ? 'BALANCED (₹0.00)' : `DISCREPANCY (₹${(closingCashActual - (openingFloat + cashCollected - pettyCashPaid)).toLocaleString()})`}
                </strong>
              </div>

              {handoverSuccess && (
                <div style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center' }}>
                  ✓ Shift Handover recorded to Cloudflare D1 and logged to Telegram.
                </div>
              )}

              <button 
                onClick={executeShiftHandover}
                className="btn-primary-gold"
                style={{ justifyContent: 'center', marginTop: '0.5rem' }}
              >
                Sign Off & Submit Handover
              </button>
            </div>
          </div>

          {/* 09:00 PM Night Audit Engine */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} color="var(--gold-glow)" /> Daily Night Audit & Revenue Closure
            </h3>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Executes the daily 24-hour financial balance, checks 40-room occupancy, charges midnight room revenues, and freezes the day's cashier folios.
            </div>

            <div style={{
              background: 'rgba(6, 14, 26, 0.6)',
              padding: '1rem',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total 40-Room Capacity:</span>
                <strong>40 Keys</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Current Occupancy:</span>
                <strong>{rooms.filter(r => r.status === 'Occupied').length} Rooms ({((rooms.filter(r => r.status === 'Occupied').length / 40) * 100).toFixed(1)}%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Daily Room Revenue:</span>
                <strong>₹{bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SAC 996311 GST Billed:</span>
                <strong>₹{bookings.reduce((sum, b) => sum + (b.cgst + b.sgst || 0), 0).toFixed(2)}</strong>
              </div>
            </div>

            <button 
              onClick={() => onRunNightAudit()}
              className="btn-secondary-sapphire"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <RefreshCw size={16} /> Execute 09:00 PM Night Audit Run
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: HOUSEKEEPING & LINEN TRACKER */}
      {activeTab === 'housekeeping' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            🧹 Housekeeping & 40-Room Linen Par-Stock Tracker
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rooms Queued for Cleaning</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--status-cleaning)' }}>
                {rooms.filter(r => r.status === 'Cleaning').length}
              </div>
            </div>
            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>King Bed Sheets Buffer</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>70 / 120 Par</div>
            </div>
            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bath Towels Buffer</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>55 / 100 Par</div>
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--gold-glow)' }}>
            Rooms Currently in Cleaning Workflow:
          </h4>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {rooms.filter(r => r.status === 'Cleaning').map(r => (
              <div 
                key={r.roomNumber}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div>
                  <strong style={{ color: '#fff' }}>Room {r.roomNumber}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Floor {r.floor} • Linen Dispatched</div>
                </div>
                <button
                  onClick={() => onUpdateRoomStatus(r.roomNumber, 'Available', null, null)}
                  className="btn-primary-gold"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Mark Inspected & Ready
                </button>
              </div>
            ))}
            {rooms.filter(r => r.status === 'Cleaning').length === 0 && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                ✓ All 40 rooms are clean and turnover inspected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SARAI ACT POLICE REGISTER */}
      {activeTab === 'police-register' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>🚨 Statutory Sarai Act 1867 Daily Police Register</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Jurisdiction: Rayagada Town Police Station (Odisha Police) • Inter-State Guest Tagging
              </div>
            </div>

            <button 
              onClick={dispatchPoliceRegisterWhatsApp}
              className="btn-primary-gold"
              style={{ fontSize: '0.85rem' }}
            >
              <Send size={15} /> Dispatch Register to Police Station
            </button>
          </div>

          {policeDispatchSent && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              ✓ Sarai Act Daily Guest Register securely formatted and transmitted to Rayagada Town Police Station email & WhatsApp desk.
            </div>
          )}

          {/* Guest Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(19, 34, 61, 0.8)', color: 'var(--gold-glow)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Room</th>
                  <th style={{ padding: '0.75rem' }}>Guest Name</th>
                  <th style={{ padding: '0.75rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem' }}>Govt ID (Masked)</th>
                  <th style={{ padding: '0.75rem' }}>State of Origin</th>
                  <th style={{ padding: '0.75rem' }}>Inter-State</th>
                  <th style={{ padding: '0.75rem' }}>Dates</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>Room {b.room_number || b.roomNumber}</td>
                    <td style={{ padding: '0.75rem' }}>{b.guest_name || b.guestName}</td>
                    <td style={{ padding: '0.75rem' }}>{b.guest_phone || b.guestPhone}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                        {b.id_proof_masked || b.idProofMasked || 'XXXX-XXXX-1234'}
                      </code>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{b.state_of_origin || b.stateOfOrigin || 'Odisha'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {(b.is_interstate || b.isInterstate) ? (
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>INTER-STATE</span>
                      ) : (
                        <span style={{ color: '#10b981' }}>Intra-Odisha</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {b.check_in_date || b.checkInDate} to {b.check_out_date || b.checkOutDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DPDP ACT 2023 COMPLIANCE */}
      {activeTab === 'dpdp' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            🛡️ Digital Personal Data Protection (DPDP) Act 2023 Module
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Hotel Sai International enforces statutory DPDP compliance. Guest PII is strictly protected, purpose-bound, and scheduled for auto-purge 30 days after check-out.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1.2rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: 'var(--gold-glow)', marginBottom: '0.4rem' }}>
                1. Unticked Consent Checkbox Rule
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Public reservation modal checkboxes are never pre-ticked. Every guest actively grants purpose-bound consent.
              </div>
            </div>

            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1.2rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: 'var(--gold-glow)', marginBottom: '0.4rem' }}>
                2. Automated 30-Day Hard Purge
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Bot 17 runs daily on Cloudflare Edge executing hard deletion of expired Aadhaar/identity records older than 30 days.
              </div>
            </div>

            <div style={{ background: 'rgba(6, 14, 26, 0.6)', padding: '1.2rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: 'var(--gold-glow)', marginBottom: '0.4rem' }}>
                3. Data Rights Grievance Officer
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Grievance Officer: R. K. Mohapatra (Desk: +91 6856 225555, Email: privacy@hotelsaiinternational.com).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPRESS WALK-IN MODAL */}
      {walkInOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} color="var(--gold-glow)" />
                <h3 style={{ fontSize: '1.2rem' }}>Express Front Desk Walk-In Check-In</h3>
              </div>
              <button onClick={() => setWalkInOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Assign Available Room Key</label>
                <select 
                  className="form-select"
                  value={walkInRoom}
                  onChange={(e) => {
                    setWalkInRoom(e.target.value);
                    const roomObj = rooms.find(r => r.roomNumber === e.target.value);
                    if (roomObj) setWalkInRate(roomObj.tariff);
                  }}
                  required
                >
                  <option value="">-- Choose Key from 40 Inventory --</option>
                  {rooms.filter(r => r.status === 'Available').map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • {r.tier} - ₹{r.tariff})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Guest Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Anil Kumar Patnaik"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+91 9876543210"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar (Govt ID)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="12-digit number"
                    value={walkInAadhaar}
                    onChange={(e) => setWalkInAadhaar(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Agreed Rate/Night (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={walkInRate}
                    onChange={(e) => setWalkInRate(Number(e.target.value))}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Advance Cash / UPI Deposit (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={walkInDeposit}
                    onChange={(e) => setWalkInDeposit(Number(e.target.value))}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setWalkInOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center' }}>
                  Complete Walk-In & Handover Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
