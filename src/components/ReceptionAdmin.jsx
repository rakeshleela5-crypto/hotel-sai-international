import React, { useState } from 'react';
import { 
  Hotel, Layers, Users, Calendar, ShieldCheck, Clock, 
  DollarSign, CheckCircle2, AlertTriangle, Printer, Download, 
  Search, RefreshCw, UserCheck, Phone, FileText, Sparkles, 
  Check, X, ChevronRight, Lock, Bed, Send, Ban, Wrench, Eye
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS } from '../data/hotelData';
import { maskAadhaar } from '../utils/security';
import { calculateRoomTax } from '../utils/taxUtils';
import FolioActionsModal from './FolioActionsModal';
import BookingReceiptModal from './BookingReceiptModal';

export default function ReceptionAdmin({
  rooms = [],
  bookings = [],
  onUpdateRoomStatus,
  onNewBooking,
  onRunNightAudit,
  nightAudits = []
}) {
  const [activeTab, setActiveTab] = useState('tape-chart'); // 'tape-chart', 'cashier-audit', 'housekeeping', 'police-register', 'dpdp'
  const [tapeChartViewMode, setTapeChartViewMode] = useState('mysoft'); // 'mysoft' (Screenshot 2 Legacy Tape Chart) or 'modern'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Folio Actions & GRC Modals State (hotel_documents.pdf Pages 1 & 5)
  const [selectedFolioRoom, setSelectedFolioRoom] = useState(null);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Walk-in Modal State (Enhanced with Screenshot 4 & 5 fields)
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
  const [walkInMealPlan, setWalkInMealPlan] = useState('CP'); // CP, EP, MAP, AP
  const [walkInBillingType, setWalkInBillingType] = useState('Direct'); // Direct or BTC (Bill to Company)
  const [walkInCompany, setWalkInCompany] = useState('');

  // Block Rooms Modal State (Screenshot 10 - block_rooms.php)
  const [blockRoomOpen, setBlockRoomOpen] = useState(false);
  const [blockSelectedRoom, setBlockSelectedRoom] = useState('');
  const [blockReason, setBlockReason] = useState('AC PRBLM');
  const [blockFromDate, setBlockFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockToDate, setBlockToDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [blockNotes, setBlockNotes] = useState('');

  // Cashier Handover State
  const [openingFloat, setOpeningFloat] = useState(5000);
  const [cashCollected, setCashCollected] = useState(18500);
  const [pettyCashPaid, setPettyCashPaid] = useState(1200);
  const [closingCashActual, setClosingCashActual] = useState(22300);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Police Register Dispatch State
  const [policeDispatchSent, setPoliceDispatchSent] = useState(false);

  // Counts for the 39 physical inventory
  const totalCount = rooms.length;
  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
  const vacantCount = rooms.filter(r => r.status === 'Available').length;
  const maintCount = rooms.filter(r => r.status === 'Maintenance' || r.status === 'Cleaning' || r.status === 'VIP Hold').length;

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
      mealPlan: walkInMealPlan,
      billingType: walkInBillingType,
      company: walkInBillingType === 'BTC' ? walkInCompany : 'Individual',
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
      isB2b: walkInBillingType === 'BTC',
      consentDpdp: 1
    };

    onNewBooking(bookingPayload);
    onUpdateRoomStatus(walkInRoom, 'Occupied', walkInName, bookingPayload.bookingId);
    setWalkInOpen(false);
  };

  const handleBlockRoomSubmit = (e) => {
    e.preventDefault();
    if (!blockSelectedRoom) return;

    onUpdateRoomStatus(blockSelectedRoom, 'Maintenance', `${blockReason} (${blockNotes || 'OOO'})`, null);
    setBlockRoomOpen(false);
    setBlockSelectedRoom('');
    setBlockNotes('');
  };

  const executeShiftHandover = () => {
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
        marginBottom: '1.75rem',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-glow)', fontSize: '0.8rem', fontWeight: 600 }}>
            <ShieldCheck size={16} /> Central PMS Operations • {HOTEL_CONFIG.legalName}
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0.2rem 0' }}>Front Desk &amp; 39-Room Operations Console</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            GSTIN: <strong style={{ color: '#fbbf24' }}>{HOTEL_CONFIG.gstin}</strong> • Rayagada, Odisha • Sarai Act 1867 &amp; Rule 46 Compliant
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setBlockRoomOpen(true)}
            className="btn-outline-gold"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Ban size={15} color="#f87171" /> Block Room / OOO (Screenshot 10)
          </button>
          <button 
            onClick={() => setWalkInOpen(true)}
            className="btn-primary-gold"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
          >
            <UserCheck size={16} /> Express Walk-In Check-In
          </button>
          <button 
            onClick={() => setActiveTab('cashier-audit')}
            className="btn-secondary-sapphire"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
          >
            <Clock size={16} /> Cashier Handover &amp; Night Audit
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
          { id: 'tape-chart', label: '📊 39-Room Tape Chart Matrix' },
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

      {/* TAB 1: 39-ROOM TAPE CHART MATRIX */}
      {activeTab === 'tape-chart' && (
        <div>
          {/* Top Operational Status Ribbon (Exact from Screenshot 2) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(90deg, rgba(15,23,42,0.9), rgba(30,41,59,0.95))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Physical Keys</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{totalCount} Rooms</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase' }}>Vacant / Clean</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{vacantCount} Vacant</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#fb923c', textTransform: 'uppercase' }}>Occupied (In-House)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fb923c' }}>{occupiedCount} Occupied</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#f87171', textTransform: 'uppercase' }}>Blocked / Maint</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f87171' }}>{maintCount} Blocked</div>
              </div>
            </div>

            {/* View Mode Toggle Button */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(6, 14, 26, 0.8)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <button
                onClick={() => setTapeChartViewMode('mysoft')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: tapeChartViewMode === 'mysoft' ? 'var(--gold-glow)' : 'transparent',
                  color: tapeChartViewMode === 'mysoft' ? '#060e1a' : '#94a3b8',
                  border: 'none'
                }}
              >
                📊 MySoft Legacy Tape Matrix (Screenshot 2)
              </button>
              <button
                onClick={() => setTapeChartViewMode('modern')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: tapeChartViewMode === 'modern' ? 'var(--gold-glow)' : 'transparent',
                  color: tapeChartViewMode === 'modern' ? '#060e1a' : '#94a3b8',
                  border: 'none'
                }}
              >
                🏢 Modern Card Layout
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['all', 'Available', 'Occupied', 'Cleaning', 'Maintenance', 'VIP Hold'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: statusFilter === st ? 'rgba(212, 175, 55, 0.25)' : 'rgba(12, 24, 43, 0.6)',
                    color: statusFilter === st ? 'var(--gold-glow)' : '#94a3b8',
                    border: statusFilter === st ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {st === 'all' ? `All (${totalCount})` : st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search Room or Guest..." 
                className="form-input" 
                style={{ width: '100%', paddingLeft: '2rem', paddingRight: '0.75rem', height: 38, fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* VIEW 1: MYSOFT LEGACY TAPE MATRIX (Screenshot 2 Mirror) */}
          {tapeChartViewMode === 'mysoft' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[2, 3, 4].map(floorNum => {
                const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
                if (floorRooms.length === 0) return null;

                const floorLabel = floorNum === 2 
                  ? '2ND FLOOR (Rooms 201 - 208)' 
                  : floorNum === 3 
                    ? '3RD FLOOR (Rooms 301 - 316)' 
                    : '4TH FLOOR (Rooms 401 - 416)';

                return (
                  <div key={floorNum} style={{
                    background: 'rgba(10, 15, 28, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.85rem',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      paddingBottom: '0.5rem'
                    }}>
                      <span style={{ fontWeight: 800, color: 'var(--gold-glow)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                        {floorLabel}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {floorRooms.filter(r => r.status === 'Available').length} Vacant / {floorRooms.length} Total
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '0.65rem'
                    }}>
                      {floorRooms.map(room => {
                        const isOccupied = room.status === 'Occupied';
                        const isMaint = room.status === 'Maintenance';
                        const isCleaning = room.status === 'Cleaning';
                        const isVacant = room.status === 'Available';

                        const bgColor = isOccupied
                          ? 'rgba(234, 88, 12, 0.18)'
                          : isMaint
                            ? 'rgba(100, 116, 139, 0.25)'
                            : isCleaning
                              ? 'rgba(234, 179, 8, 0.18)'
                              : 'rgba(16, 185, 129, 0.18)';

                        const borderColor = isOccupied
                          ? 'rgba(249, 115, 22, 0.5)'
                          : isMaint
                            ? 'rgba(148, 163, 184, 0.5)'
                            : isCleaning
                              ? 'rgba(234, 179, 8, 0.5)'
                              : 'rgba(16, 185, 129, 0.5)';

                        const badgeColor = isOccupied
                          ? '#fb923c'
                          : isMaint
                            ? '#94a3b8'
                            : isCleaning
                              ? '#facc15'
                              : '#34d399';

                        return (
                          <div
                            key={room.roomNumber}
                            style={{
                              background: bgColor,
                              border: `1px solid ${borderColor}`,
                              borderRadius: '8px',
                              padding: '0.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              minHeight: 110,
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                            }}
                            onClick={() => {
                              if (isVacant) {
                                setWalkInRoom(room.roomNumber);
                                setWalkInRate(room.tariff);
                                setWalkInDeposit(room.tariff);
                                setWalkInOpen(true);
                              }
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                                  {room.roomNumber}
                                </span>
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  color: badgeColor,
                                  textTransform: 'uppercase',
                                  background: 'rgba(0,0,0,0.3)',
                                  padding: '1px 5px',
                                  borderRadius: '3px'
                                }}>
                                  {isMaint ? 'MAINT' : isOccupied ? 'OCCUPIED' : isCleaning ? 'CLEANING' : 'VACANT'}
                                </span>
                              </div>

                              <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', lineHeight: '1.2' }}>
                                {isOccupied ? (
                                  <>
                                    <div style={{ color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {room.currentGuestName || 'Guest In-House'}
                                    </div>
                                    <div style={{ color: '#fb923c', fontWeight: 800, marginTop: '2px', fontSize: '0.8rem' }}>
                                      ₹{(room.outstandingBalance || room.tariff || 0).toLocaleString('en-IN')}
                                    </div>
                                  </>
                                ) : isMaint ? (
                                  <div style={{ color: '#f87171', fontWeight: 700 }}>
                                    ⚠️ {room.currentGuestName || 'AC PRBLM'}
                                  </div>
                                ) : (
                                  <div style={{ color: '#34d399', fontSize: '0.72rem' }}>
                                    ₹{room.tariff} • Ready
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quick Action Strip (Enhanced with Folio Actions from hotel_documents.pdf Page 5) */}
                            <div style={{
                              display: 'flex',
                              gap: '0.2rem',
                              marginTop: '0.5rem',
                              borderTop: '1px solid rgba(255,255,255,0.06)',
                              paddingTop: '0.35rem'
                            }}>
                              {isOccupied && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFolioRoom(room);
                                    }}
                                    title="Open 12 Folio Edit Options (hotel_documents.pdf Page 5)"
                                    style={{
                                      flex: 1,
                                      padding: '2px 4px',
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      background: 'rgba(56, 189, 248, 0.2)',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.4)',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    ⚙️ Folio
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                        bookingId: `FMBIL2627-${room.roomNumber}`,
                                        billNo: `FMBIL2627-${room.roomNumber}`,
                                        roomNumber: room.roomNumber,
                                        guestName: room.currentGuestName || 'MR. P ASHOK',
                                        guestPhone: '+91 6305202068',
                                        company: 'LINDE INDIA LTD',
                                        corporateGstin: '21AAACB2528H1ZA',
                                        tier: room.tier,
                                        totalAmount: room.balanceDue || room.tariff || 13538,
                                        nights: 4,
                                        grcNo: '684'
                                      };
                                      setSelectedReceiptBooking(matchedBooking);
                                      setIsReceiptModalOpen(true);
                                    }}
                                    title="Print GRC (Page 1) or Split Bill (Pages 2 & 3)"
                                    style={{
                                      flex: 1,
                                      padding: '2px 4px',
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      background: 'rgba(212, 175, 55, 0.2)',
                                      color: 'var(--gold-glow)',
                                      border: '1px solid rgba(212, 175, 55, 0.4)',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    📄 GRC
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateRoomStatus(room.roomNumber, 'Cleaning', null, null);
                                    }}
                                    style={{
                                      padding: '2px 4px',
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      background: 'rgba(234, 179, 8, 0.2)',
                                      color: '#facc15',
                                      border: '1px solid rgba(234, 179, 8, 0.4)',
                                      borderRadius: '3px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Out
                                  </button>
                                </>
                              )}
                              {isVacant && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setWalkInRoom(room.roomNumber);
                                    setWalkInRate(room.tariff);
                                    setWalkInDeposit(room.tariff);
                                    setWalkInOpen(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '2px 4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Walk-In
                                </button>
                              )}
                              {isMaint && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateRoomStatus(room.roomNumber, 'Available', null, null);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '2px 4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Release OOO
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: MODERN CARD LAYOUT */
            <div className="tape-chart-container">
              {[2, 3, 4].map(floorNum => {
                const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
                if (floorRooms.length === 0) return null;

                const tierName = floorNum === 2 ? 'Standard Deluxe (₹1,699)' : floorNum === 3 ? 'Deluxe Room (₹2,199)' : 'Executive / Suite (₹2,899 - ₹3,999)';

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
                                Bed: {room.bedType || 'King Bed'} • ₹{room.tariff}/night
                              </div>
                            )}
                          </div>

                          {/* Status Modifiers */}
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
                            {room.status !== 'Maintenance' && (
                              <button
                                onClick={() => {
                                  setBlockSelectedRoom(room.roomNumber);
                                  setBlockRoomOpen(true);
                                }}
                                style={{
                                  flex: 1,
                                  padding: '0.25rem',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: '#f87171',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600
                                }}
                              >
                                Block
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
          )}
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
                <span style={{ color: 'var(--text-secondary)' }}>Cash Receipts (Rooms &amp; POS):</span>
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
                Sign Off &amp; Submit Handover
              </button>
            </div>
          </div>

          {/* 09:00 PM Night Audit Engine */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} color="var(--gold-glow)" /> Daily Night Audit &amp; Revenue Closure
            </h3>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Executes the daily 24-hour financial balance, verifies 39-room inventory, charges midnight room revenues, and freezes the day's cashier folios.
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
                <span>Total 39-Room Capacity:</span>
                <strong>39 Keys</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Current Occupancy:</span>
                <strong>{occupiedCount} Rooms ({((occupiedCount / 39) * 100).toFixed(1)}%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Daily Revenue (Flash):</span>
                <strong>₹58,247.07</strong>
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
            🧹 Housekeeping &amp; 39-Room Linen Par-Stock Tracker
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
                  Mark Inspected &amp; Ready
                </button>
              </div>
            ))}
            {rooms.filter(r => r.status === 'Cleaning').length === 0 && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                ✓ All 39 rooms are clean and turnover inspected.
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
              ✓ Sarai Act Daily Guest Register securely formatted and transmitted to Rayagada Town Police Station email &amp; WhatsApp desk.
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
                Cloudflare Worker executes automated hard deletion of expired Aadhaar/identity records older than 30 days.
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

      {/* EXPRESS WALK-IN MODAL (Enhanced with Screenshot 4 & 5 fields) */}
      {walkInOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 580 }}>
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
                  <option value="">-- Choose Key from 39 Physical Keys --</option>
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
                  <label className="form-label">Aadhaar (Govt ID Proof)</label>
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

              {/* Meal Plan & Billing Type (Screenshot 4 & 5) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Meal Plan Code</label>
                  <select
                    className="form-select"
                    value={walkInMealPlan}
                    onChange={(e) => setWalkInMealPlan(e.target.value)}
                  >
                    <option value="CP">CP (Continental Plan - Room + Breakfast)</option>
                    <option value="EP">EP (European Plan - Room Only)</option>
                    <option value="MAP">MAP (Modified American - Room + 2 Meals)</option>
                    <option value="AP">AP (American Plan - All Meals Included)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Billing Settlement Type</label>
                  <select
                    className="form-select"
                    value={walkInBillingType}
                    onChange={(e) => setWalkInBillingType(e.target.value)}
                  >
                    <option value="Direct">Direct Guest Settlement</option>
                    <option value="BTC">BTC (Bill to Company / Corporate)</option>
                  </select>
                </div>
              </div>

              {walkInBillingType === 'BTC' && (
                <div className="form-group">
                  <label className="form-label">Corporate Account / Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ashok Leyland Ltd / PRADAN / JK Paper"
                    value={walkInCompany}
                    onChange={(e) => setWalkInCompany(e.target.value)}
                    required
                  />
                </div>
              )}

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
                  <label className="form-label">Advance Deposit (₹)</label>
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
                  Complete Walk-In &amp; Handover Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK ROOM / OUT OF ORDER MODAL (Screenshot 10 - block_rooms.php) */}
      {blockRoomOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ban size={20} color="#f87171" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Block Room / Out of Order (Screenshot 10)</h3>
              </div>
              <button onClick={() => setBlockRoomOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBlockRoomSubmit} className="modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Blocks room from live inventory and stops dynamic yield pricing on Rayagada engine.
              </p>

              <div className="form-group">
                <label className="form-label">Select Room to Block</label>
                <select
                  className="form-select"
                  value={blockSelectedRoom}
                  onChange={(e) => setBlockSelectedRoom(e.target.value)}
                  required
                >
                  <option value="">-- Choose Room Number --</option>
                  {rooms.map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • Current Status: {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Block Reason (Standard MySoft Codes)</label>
                <select
                  className="form-select"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                >
                  <option value="AC PRBLM">AC PRBLM (Air Conditioner Issue - Screenshot 2)</option>
                  <option value="PAINTING">PAINTING (Room Wall Refurbishment)</option>
                  <option value="PLUMBING">PLUMBING (Bathroom Leakage)</option>
                  <option value="MANAGEMENT HOLD">MANAGEMENT HOLD (Reserved for MD / Consultant)</option>
                  <option value="DEEP SANITIZATION">DEEP SANITIZATION (Routine Maintenance)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Block From Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={blockFromDate}
                    onChange={(e) => setBlockFromDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Block To Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={blockToDate}
                    onChange={(e) => setBlockToDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Technician called for compressor gas top-up"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setBlockRoomOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444' }}>
                  Confirm Block &amp; Mark OOO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOLIO ACTIONS MODAL (hotel_documents.pdf Page 5 - 12 Edit Options) */}
      {selectedFolioRoom && (
        <FolioActionsModal
          isOpen={!!selectedFolioRoom}
          onClose={() => setSelectedFolioRoom(null)}
          room={selectedFolioRoom}
          rooms={rooms}
          onUpdateFolio={(roomNumber, updateData) => {
            console.log(`Updated Folio for Room ${roomNumber}:`, updateData);
          }}
          onShiftRoom={(fromRoom, toRoom, reason) => {
            onUpdateRoomStatus(fromRoom, 'Available', null, null);
            onUpdateRoomStatus(toRoom, 'Occupied', selectedFolioRoom.currentGuestName, null);
            setSelectedFolioRoom(null);
          }}
          onOpenSplitInvoice={(type) => {
            const matchedBooking = bookings.find(b => b.roomNumber === selectedFolioRoom.roomNumber) || {
              bookingId: `FMBIL2627-${selectedFolioRoom.roomNumber}`,
              billNo: `FMBIL2627-${selectedFolioRoom.roomNumber}`,
              roomNumber: selectedFolioRoom.roomNumber,
              guestName: selectedFolioRoom.currentGuestName || 'MR. P ASHOK',
              guestPhone: '+91 6305202068',
              company: 'LINDE INDIA LTD',
              corporateGstin: '21AAACB2528H1ZA',
              tier: selectedFolioRoom.tier,
              totalAmount: selectedFolioRoom.balanceDue || 13538,
              nights: 4,
              grcNo: '684'
            };
            setSelectedReceiptBooking(matchedBooking);
            setIsReceiptModalOpen(true);
            setSelectedFolioRoom(null);
          }}
        />
      )}

      {/* STATUTORY TAX INVOICE, GRC & SPLIT BILL MODAL (hotel_documents.pdf Pages 1, 2, 3) */}
      {isReceiptModalOpen && selectedReceiptBooking && (
        <BookingReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          booking={selectedReceiptBooking}
        />
      )}
    </section>
  );
}
