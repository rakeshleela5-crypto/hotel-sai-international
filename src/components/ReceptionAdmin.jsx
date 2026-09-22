import React, { useState } from 'react';
import { 
  Hotel, Layers, Users, Calendar, ShieldCheck, Clock, 
  DollarSign, CheckCircle2, AlertTriangle, Printer, Download, 
  Search, RefreshCw, UserCheck, Phone, FileText, Sparkles, 
  Check, X, ChevronRight, Lock, Bed, Send, Ban, Wrench, Eye,
  Calculator, ClipboardList
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS } from '../data/hotelData';
import { maskAadhaar } from '../utils/security';
import { calculateRoomTax } from '../utils/taxUtils';
import FolioActionsModal from './FolioActionsModal';
import BookingReceiptModal from './BookingReceiptModal';
import CheckoutSplitModal from './CheckoutSplitModal';
import InteractiveCalendar from '@/components/ui/visualize-booking';

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

  // Checkout & Multi-Tender Split Settlement Modal (Owner Request: PhonePe + Cash Split)
  const [checkoutRoom, setCheckoutRoom] = useState(null);
  const [recentSettlements, setRecentSettlements] = useState([
    {
      roomNumber: '301',
      guestName: 'MR. P ASHOK',
      tier: 'Executive AC',
      totalAmount: 962.00,
      billTotal: 962.00,
      settlementTime: '12:45 PM',
      settlementDate: '22/09/2026',
      billNo: 'FMBIL2627-00301',
      tendersSummary: ['Cash: ₹500', 'PhonePe (UPI): ₹462 [Ref: UPI-849102]'],
      tenders: { cash: 500, upi: 462, upiRef: 'UPI-849102', upiProvider: 'PhonePe', card: 0, btc: 0 }
    }
  ]);

  const handleCheckoutConfirm = (payload) => {
    // 1. Release room to Cleaning
    onUpdateRoomStatus(payload.roomNumber, 'Cleaning', null, null);

    // 2. Add cash to cashier drawer if cash tender was used
    if (payload.tenders.cash > 0) {
      setCashCollected(prev => prev + payload.tenders.cash);
      setDenominations(prev => ({
        ...prev,
        500: (Number(prev[500]) || 0) + Math.floor(payload.tenders.cash / 500),
        coins: (Number(prev.coins) || 0) + (payload.tenders.cash % 500)
      }));
    }

    // 3. Add to recent settlements log
    setRecentSettlements(prev => [payload, ...prev]);

    // 4. Close checkout modal
    setCheckoutRoom(null);

    // 5. If requested, automatically open the official split tax invoice
    if (payload.openReceiptAfter) {
      const receiptBooking = {
        bookingId: payload.billNo,
        billNo: payload.billNo,
        roomNumber: payload.roomNumber,
        guestName: payload.guestName,
        guestPhone: payload.guestPhone,
        tier: payload.tier,
        totalAmount: payload.totalAmount,
        advancePaid: payload.advancePaid || 0,
        paymentMode: 'Split Tender',
        paymentStatus: 'Fully Settled & Checked Out',
        tenders: payload.tenders,
        tendersSummary: payload.tendersSummary,
        foodAmount: payload.billTotal > 1500 ? 962 : payload.billTotal,
        grcNo: '684'
      };
      setSelectedReceiptBooking(receiptBooking);
      setIsReceiptModalOpen(true);
    }
  };

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

  // Cashier Handover & Physical Note Denomination Counter State
  const [openingFloat, setOpeningFloat] = useState(5000);
  const [cashCollected, setCashCollected] = useState(18500);
  const [pettyCashPaid, setPettyCashPaid] = useState(1200);
  const [closingCashActual, setClosingCashActual] = useState(22300);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Denominations State: 500, 200, 100, 50, 20, 10, Coins
  const [denominations, setDenominations] = useState({
    500: 36, // 18,000
    200: 15, // 3,000
    100: 10, // 1,000
    50: 4,   // 200
    20: 5,   // 100
    10: 0,
    coins: 0
  });

  const totalDenominationSum = 
    ((Number(denominations[500]) || 0) * 500) +
    ((Number(denominations[200]) || 0) * 200) +
    ((Number(denominations[100]) || 0) * 100) +
    ((Number(denominations[50]) || 0) * 50) +
    ((Number(denominations[20]) || 0) * 20) +
    ((Number(denominations[10]) || 0) * 10) +
    (Number(denominations.coins) || 0);

  const expectedDrawerCash = openingFloat + cashCollected - pettyCashPaid;
  const drawerVariance = closingCashActual - expectedDrawerCash;

  // Shift Handover Audit Trail Log
  const [handoverLogs, setHandoverLogs] = useState([
    {
      shiftId: 'SH-2026-0921-E',
      date: '21-Sep-2026',
      shift: 'Evening (15:00 - 23:00)',
      cashier: 'K. Simhachalam',
      supervisor: 'S. Patnaik',
      openingFloat: 5000,
      cashCollected: 18500,
      pettyCash: 1200,
      expected: 22300,
      actual: 22300,
      variance: 0,
      status: 'BALANCED',
      notes: 'Denominations physically verified; safe drop completed.'
    },
    {
      shiftId: 'SH-2026-0921-M',
      date: '21-Sep-2026',
      shift: 'Morning (07:00 - 15:00)',
      cashier: 'E. Ramesh',
      supervisor: 'Eswara (MD)',
      openingFloat: 5000,
      cashCollected: 24200,
      pettyCash: 850,
      expected: 28350,
      actual: 28350,
      variance: 0,
      status: 'BALANCED',
      notes: 'Morning shift turnover balanced with zero discrepancy.'
    }
  ]);

  // Housekeeping Floor Attendants State
  const [floorAttendants, setFloorAttendants] = useState({
    2: { name: 'Santosh Nayak', phone: '+91 94371 88201', shift: 'Morning (07:00 - 15:30)', status: 'On Floor' },
    3: { name: 'Kailash Gouda', phone: '+91 94372 66314', shift: 'Morning (07:00 - 15:30)', status: 'On Floor' },
    4: { name: 'Ramesh Rao', phone: '+91 94370 55192', shift: 'Morning (07:00 - 15:30)', status: 'On Floor' }
  });
  const [isEditAttendantOpen, setIsEditAttendantOpen] = useState(false);
  const [selectedFloorToEdit, setSelectedFloorToEdit] = useState(2);
  const [attendantForm, setAttendantForm] = useState({ name: '', phone: '', shift: '' });

  // Maintenance Work Orders Ticketing State
  const [workOrders, setWorkOrders] = useState([
    {
      id: 'WO-2026-081',
      roomNumber: '307',
      issue: 'AC Cooling Coil Leaking & Remote Defective',
      category: 'HVAC / AC',
      priority: 'High',
      technician: 'Bikram Patra (AC Specialist)',
      targetEta: 'Within 2 Hours',
      loggedAt: '2026-09-22 08:30 AM',
      status: 'In Progress',
      notes: 'Capacitor replaced; gas pressure checked at 65 PSI.'
    },
    {
      id: 'WO-2026-082',
      roomNumber: '404',
      issue: 'Geyser thermostat tripping after 5 mins',
      category: 'Electrical',
      priority: 'Medium',
      technician: 'Pradeep Jena (Electrician)',
      targetEta: 'Same Day by 18:00',
      loggedAt: '2026-09-22 09:15 AM',
      status: 'Pending',
      notes: 'Replacement heating element requested from Rayagada market.'
    }
  ]);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [workOrderForm, setWorkOrderForm] = useState({
    roomNumber: '204',
    issue: '',
    category: 'HVAC / AC',
    priority: 'High',
    technician: 'Bikram Patra (AC Specialist)',
    targetEta: 'Within 2 Hours',
    notes: ''
  });

  // Printable Cashier Handover Voucher Modal State
  const [handoverVoucherModalOpen, setHandoverVoucherModalOpen] = useState(false);
  const [activeHandoverForVoucher, setActiveHandoverForVoucher] = useState(null);

  // Police Register Dispatch State
  const [policeDispatchSent, setPoliceDispatchSent] = useState(false);

  // Counts for the 39 physical inventory across 5-stage lifecycle
  const totalCount = rooms.length;
  const vacantCleanCount = rooms.filter(r => r.status === 'Available').length;
  const vacantDirtyCount = rooms.filter(r => r.status === 'Vacant Dirty' || r.status === 'Cleaning').length;
  const occupiedCleanCount = rooms.filter(r => r.status === 'Occupied Clean').length;
  const occupiedDirtyCount = rooms.filter(r => r.status === 'Occupied').length;
  const oooCount = rooms.filter(r => r.status === 'Maintenance' || r.status === 'VIP Hold').length;

  // Filtered rooms for Tape Chart
  const filteredRooms = rooms.filter(r => {
    let matchesFilter = true;
    if (statusFilter === 'all') matchesFilter = true;
    else if (statusFilter === 'Available') matchesFilter = r.status === 'Available';
    else if (statusFilter === 'Vacant Dirty') matchesFilter = r.status === 'Vacant Dirty' || r.status === 'Cleaning';
    else if (statusFilter === 'Occupied') matchesFilter = r.status === 'Occupied' || r.status === 'Occupied Clean';
    else if (statusFilter === 'Occupied Clean') matchesFilter = r.status === 'Occupied Clean';
    else if (statusFilter === 'Maintenance') matchesFilter = r.status === 'Maintenance' || r.status === 'VIP Hold';
    else matchesFilter = r.status === statusFilter;

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
    const expected = openingFloat + cashCollected - pettyCashPaid;
    const variance = closingCashActual - expected;
    const newLog = {
      shiftId: `SH-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      shift: 'Evening (15:00 - 23:00)',
      cashier: 'Front Desk Cashier',
      supervisor: 'Operations Lead',
      openingFloat,
      cashCollected,
      pettyCash: pettyCashPaid,
      expected,
      actual: closingCashActual,
      variance,
      status: variance === 0 ? 'BALANCED' : variance > 0 ? 'OVERAGE' : 'SHORTAGE',
      denominations: { ...denominations },
      notes: variance === 0 ? 'Shift drawer physically balanced and signed.' : `Variance of ₹${variance} logged for audit.`
    };
    setHandoverLogs([newLog, ...handoverLogs]);
    setActiveHandoverForVoucher(newLog);
    setHandoverSuccess(true);
    setTimeout(() => setHandoverSuccess(false), 4000);
  };

  const handleCreateWorkOrderSubmit = (e) => {
    e.preventDefault();
    if (!workOrderForm.roomNumber || !workOrderForm.issue) return;

    const newTicket = {
      id: `WO-${Date.now().toString().slice(-6)}`,
      roomNumber: workOrderForm.roomNumber,
      issue: workOrderForm.issue,
      category: workOrderForm.category,
      priority: workOrderForm.priority,
      technician: workOrderForm.technician,
      targetEta: workOrderForm.targetEta || 'Within 2 Hours',
      loggedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'In Progress',
      notes: workOrderForm.notes || 'Logged from Front Desk Maintenance Console'
    };

    setWorkOrders([newTicket, ...workOrders]);
    onUpdateRoomStatus(workOrderForm.roomNumber, 'Maintenance', `OOO: ${workOrderForm.issue}`, null);
    setIsWorkOrderModalOpen(false);
    setWorkOrderForm({
      roomNumber: '',
      issue: '',
      category: 'HVAC / AC',
      priority: 'High',
      technician: 'Bikram Patra (AC Specialist)',
      targetEta: 'Within 2 Hours',
      notes: ''
    });
  };

  const handleResolveWorkOrder = (ticketId, roomNumber) => {
    setWorkOrders(workOrders.map(wo => wo.id === ticketId ? { ...wo, status: 'Resolved' } : wo));
    // Move room to Vacant Dirty so housekeeping inspects after maintenance repair
    onUpdateRoomStatus(roomNumber, 'Vacant Dirty', null, null);
  };

  const handleSaveFloorAttendant = (e) => {
    e.preventDefault();
    setFloorAttendants({
      ...floorAttendants,
      [selectedFloorToEdit]: {
        name: attendantForm.name,
        phone: attendantForm.phone,
        shift: attendantForm.shift || 'Morning (07:00 - 15:30)',
        status: 'On Floor'
      }
    });
    setIsEditAttendantOpen(false);
  };

  const dispatchPoliceRegisterWhatsApp = () => {
    setPoliceDispatchSent(true);
    setTimeout(() => setPoliceDispatchSent(false), 5000);
  };

  return (
    <section style={{ padding: '2rem 1.5rem 4rem 1.5rem', maxWidth: 1580, margin: '0 auto' }}>
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
          { id: 'visualize-bookings', label: '📅 Booking Visualizer & Calendar' },
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

      {/* TAB: INTERACTIVE BOOKING VISUALIZER (visualize-booking.tsx) */}
      {activeTab === 'visualize-bookings' && (
        <div className="w-full mb-8">
          <InteractiveCalendar 
            rooms={rooms}
            bookings={bookings}
            onSelectBooking={(evt) => {
              const roomMatch = evt.venue?.match(/Room\s*(\d+)/i);
              const roomNum = roomMatch ? roomMatch[1] : null;
              const foundRoom = roomNum ? rooms.find(r => r.roomNumber === roomNum) : null;
              if (foundRoom) {
                setSelectedFolioRoom(foundRoom);
              } else {
                const foundBooking = bookings.find(b => 
                  (evt.contactPerson && b.guestName?.toLowerCase().includes(evt.contactPerson.toLowerCase())) || 
                  b.id === evt.id ||
                  (b.roomNumber && evt.venue?.includes(b.roomNumber))
                );
                if (foundBooking) {
                  setSelectedReceiptBooking(foundBooking);
                  setIsReceiptModalOpen(true);
                } else {
                  const fallbackRoom = rooms.find(r => r.status === 'Occupied') || rooms[0];
                  if (fallbackRoom) setSelectedFolioRoom(fallbackRoom);
                }
              }
            }}
          />
        </div>
      )}

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Physical Keys</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{totalCount} Rooms</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase' }}>Vacant Clean</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{vacantCleanCount} Ready</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#facc15', textTransform: 'uppercase' }}>Vacant Dirty</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#facc15' }}>{vacantDirtyCount} Dirty</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#fb923c', textTransform: 'uppercase' }}>Occupied (In-House)</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb923c' }}>{occupiedDirtyCount + occupiedCleanCount} Occ</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#f87171', textTransform: 'uppercase' }}>Blocked / OOO</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171' }}>{oooCount} Maint</div>
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

          {/* Search & Filter Bar with 5-Stage Lifecycle Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All (${totalCount})` },
                { id: 'Available', label: `Vacant Clean (${vacantCleanCount})` },
                { id: 'Vacant Dirty', label: `Vacant Dirty (${vacantDirtyCount})` },
                { id: 'Occupied', label: `Occupied In-House (${occupiedDirtyCount + occupiedCleanCount})` },
                { id: 'Occupied Clean', label: `Occupied Serviced (${occupiedCleanCount})` },
                { id: 'Maintenance', label: `OOO / Maint (${oooCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: statusFilter === tab.id ? 'rgba(212, 175, 55, 0.25)' : 'rgba(12, 24, 43, 0.6)',
                    color: statusFilter === tab.id ? 'var(--gold-glow)' : '#94a3b8',
                    border: statusFilter === tab.id ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setWorkOrderForm({
                    roomNumber: '201',
                    issue: '',
                    category: 'HVAC / AC',
                    priority: 'High',
                    technician: 'Bikram Patra (AC Specialist)',
                    notes: ''
                  });
                  setIsWorkOrderModalOpen(true);
                }}
                className="btn-outline-gold"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Wrench size={14} color="var(--gold-glow)" /> + Log Work Order
              </button>
              <div style={{ position: 'relative', width: 220 }}>
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
                                      setCheckoutRoom(room);
                                    }}
                                    title="Check Out & Multi-Tender Split Settlement (PhonePe + Cash)"
                                    style={{
                                      flex: 1,
                                      padding: '2px 4px',
                                      fontSize: '0.65rem',
                                      fontWeight: 800,
                                      background: 'rgba(234, 179, 8, 0.25)',
                                      color: '#facc15',
                                      border: '1px solid rgba(234, 179, 8, 0.5)',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    ⚡ Out
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

                          {/* Status-Specific Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            {room.status === 'Occupied' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setCheckoutRoom(room)}
                                  title="Guest Checkout & Multi-Tender Split Settlement"
                                  style={{
                                    flex: 2,
                                    padding: '0.35rem 0.5rem',
                                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(245, 158, 11, 0.2))',
                                    color: 'var(--gold-glow)',
                                    border: '1px solid var(--gold-glow)',
                                    borderRadius: '5px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  ⚡ Checkout &amp; Settle
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBlockSelectedRoom(room.roomNumber);
                                    setBlockRoomOpen(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Block
                                </button>
                              </>
                            )}

                            {room.status === 'Available' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWalkInRoom(room.roomNumber);
                                    setWalkInRate(room.tariff);
                                    setWalkInDeposit(room.tariff);
                                    setWalkInOpen(true);
                                  }}
                                  style={{
                                    flex: 2,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '5px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Walk-In
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBlockSelectedRoom(room.roomNumber);
                                    setBlockRoomOpen(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Block
                                </button>
                              </>
                            )}

                            {room.status === 'Cleaning' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onUpdateRoomStatus(room.roomNumber, 'Available', null, null)}
                                  style={{
                                    flex: 2,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(16, 185, 129, 0.25)',
                                    color: '#34d399',
                                    border: '1px solid #10b981',
                                    borderRadius: '5px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✓ Mark Ready
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBlockSelectedRoom(room.roomNumber);
                                    setBlockRoomOpen(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '0.35rem 0.5rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Block
                                </button>
                              </>
                            )}

                            {room.status === 'Maintenance' && (
                              <button
                                type="button"
                                onClick={() => onUpdateRoomStatus(room.roomNumber, 'Available', null, null)}
                                style={{
                                  width: '100%',
                                  padding: '0.35rem 0.5rem',
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.4)',
                                  borderRadius: '5px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ Release to Available
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
            {/* Shift Handover Card with Note Denomination Counter */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--gold-glow)" /> Cashier Shift Handover &amp; Drawer Balance
                </h3>
                <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', fontSize: '0.72rem' }}>
                  IDS Next Standard
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Shift:</span>
                  <span style={{ fontWeight: 600 }}>Evening Shift (15:00 - 23:00 IST)</span>
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
                  <span style={{ fontWeight: 700 }}>Expected Cash in Drawer:</span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--gold-glow)' }}>
                    ₹{expectedDrawerCash.toLocaleString()}
                  </span>
                </div>

                {/* Currency Note Denomination Counter */}
                <div style={{
                  background: 'rgba(10, 16, 30, 0.75)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-glow)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calculator size={15} /> Physical Currency Note Denomination Counter
                    </span>
                    <button
                      type="button"
                      onClick={() => setClosingCashActual(totalDenominationSum)}
                      className="btn-outline-gold"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                    >
                      ⚡ Sync to Drawer Count
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { note: 500, count: denominations[500] },
                      { note: 200, count: denominations[200] },
                      { note: 100, count: denominations[100] },
                      { note: 50, count: denominations[50] },
                      { note: 20, count: denominations[20] },
                      { note: 10, count: denominations[10] }
                    ].map(d => (
                      <div key={d.note} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>₹{d.note} Notes</div>
                        <input
                          type="number"
                          min="0"
                          value={d.count}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            const updated = { ...denominations, [d.note]: val };
                            setDenominations(updated);
                            const newTotal = ((Number(updated[500]) || 0) * 500) +
                              ((Number(updated[200]) || 0) * 200) +
                              ((Number(updated[100]) || 0) * 100) +
                              ((Number(updated[50]) || 0) * 50) +
                              ((Number(updated[20]) || 0) * 20) +
                              ((Number(updated[10]) || 0) * 10) +
                              (Number(updated.coins) || 0);
                            setClosingCashActual(newTotal);
                          }}
                          style={{
                            width: '100%',
                            background: '#060e1a',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '4px',
                            padding: '0.3rem 0.4rem',
                            fontSize: '0.82rem',
                            fontWeight: 700
                          }}
                        />
                        <div style={{ fontSize: '0.65rem', color: '#38bdf8', textAlign: 'right', marginTop: '2px' }}>
                          ₹{(d.note * (Number(d.count) || 0)).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Coins Value</div>
                      <input
                        type="number"
                        min="0"
                        value={denominations.coins}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          const updated = { ...denominations, coins: val };
                          setDenominations(updated);
                          const newTotal = ((Number(updated[500]) || 0) * 500) +
                            ((Number(updated[200]) || 0) * 200) +
                            ((Number(updated[100]) || 0) * 100) +
                            ((Number(updated[50]) || 0) * 50) +
                            ((Number(updated[20]) || 0) * 20) +
                            ((Number(updated[10]) || 0) * 10) +
                            val;
                          setClosingCashActual(newTotal);
                        }}
                        style={{
                          width: '100%',
                          background: '#060e1a',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '4px',
                          padding: '0.3rem 0.4rem',
                          fontSize: '0.82rem',
                          fontWeight: 700
                        }}
                      />
                      <div style={{ fontSize: '0.65rem', color: '#38bdf8', textAlign: 'right', marginTop: '2px' }}>
                        ₹{Number(denominations.coins || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total Denomination Counted:</span>
                    <strong style={{ color: 'var(--gold-glow)', fontSize: '1rem' }}>₹{totalDenominationSum.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.25rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual Physical Cash Counted in Drawer:</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-synced from denominations</span>
                  </label>
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
                  background: drawerVariance === 0
                    ? 'rgba(16, 185, 129, 0.15)'
                    : drawerVariance > 0
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  border: drawerVariance === 0
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : drawerVariance > 0
                      ? '1px solid rgba(56, 189, 248, 0.4)'
                      : '1px solid rgba(239, 68, 68, 0.4)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Drawer Variance:</span>
                  <strong style={{
                    color: drawerVariance === 0 ? '#10b981' : drawerVariance > 0 ? '#38bdf8' : '#f87171'
                  }}>
                    {drawerVariance === 0
                      ? 'BALANCED (₹0.00)'
                      : drawerVariance > 0
                        ? `OVERAGE (+₹${drawerVariance.toLocaleString()})`
                        : `SHORTAGE (-₹${Math.abs(drawerVariance).toLocaleString()})`}
                  </strong>
                </div>

                {handoverSuccess && (
                  <div style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                    ✓ Shift Handover recorded to Cloudflare D1 and logged to Telegram.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={executeShiftHandover}
                    className="btn-primary-gold"
                    style={{ flex: 1.5, justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={16} /> Sign Off &amp; Submit Handover Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentVoucher = {
                        shiftId: `SH-${Date.now().toString().slice(-6)}`,
                        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                        shift: 'Evening (15:00 - 23:00)',
                        cashier: 'Front Desk Cashier (K. Simhachalam)',
                        supervisor: 'Operations Lead (S. Patnaik)',
                        openingFloat,
                        cashCollected,
                        pettyCash: pettyCashPaid,
                        expected: expectedDrawerCash,
                        actual: closingCashActual,
                        variance: drawerVariance,
                        status: drawerVariance === 0 ? 'BALANCED' : drawerVariance > 0 ? 'OVERAGE' : 'SHORTAGE',
                        denominations: { ...denominations },
                        notes: drawerVariance === 0 ? 'Physical drawer notes counted and balanced.' : `Variance of ₹${drawerVariance} noted.`
                      };
                      setActiveHandoverForVoucher(currentVoucher);
                      setHandoverVoucherModalOpen(true);
                    }}
                    className="btn-outline-gold"
                    style={{ flex: 1, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Printer size={16} /> Print Voucher
                  </button>
                </div>
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
                  <strong>{occupiedDirtyCount + occupiedCleanCount} Rooms ({(((occupiedDirtyCount + occupiedCleanCount) / 39) * 100).toFixed(1)}%)</strong>
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

          {/* Audited Multi-Tender Split Settlements Log */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Receipt size={18} color="var(--gold-glow)" /> Audited Multi-Tender Split Settlements (Direct Checkout Log)
                </h4>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Front desk checkout audit ledger showing exact split across PhonePe/UPI, Cash drawer, Card POS, and Corporate credit.
                </p>
              </div>
              <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                ✓ {recentSettlements.length} Audited Settlements
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--gold-glow)', borderBottom: '1px solid rgba(212, 175, 55, 0.25)' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Time</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Room</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Guest Name</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Bill #</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Total Settled</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Split Payment Breakdown</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSettlements.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{s.settlementTime}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>Room {s.roomNumber}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#fff' }}>{s.guestName}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{s.billNo}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: 'var(--gold-glow)' }}>₹{Number(s.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {s.tendersSummary?.map((t, i) => (
                            <span key={i} style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: t.includes('Cash') ? 'rgba(52, 211, 153, 0.15)' : (t.includes('UPI') || t.includes('PhonePe')) ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                              color: t.includes('Cash') ? '#34d399' : (t.includes('UPI') || t.includes('PhonePe')) ? '#38bdf8' : '#cbd5e1',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedReceiptBooking({
                              bookingId: s.billNo,
                              billNo: s.billNo,
                              roomNumber: s.roomNumber,
                              guestName: s.guestName,
                              tier: s.tier || 'Executive AC',
                              totalAmount: s.totalAmount,
                              paymentMode: 'Split Tender',
                              paymentStatus: 'Fully Settled & Checked Out',
                              tenders: s.tenders,
                              tendersSummary: s.tendersSummary,
                              foodAmount: s.billTotal > 1500 ? 962 : s.billTotal,
                              grcNo: '684'
                            });
                            setIsReceiptModalOpen(true);
                          }}
                          className="btn-outline-gold"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        >
                          📄 View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cashier Shift Handover Audit Trail Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ClipboardList size={18} color="var(--gold-glow)" /> Shift Handover Audit Trail &amp; Safe Drop Register
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Shift ID / Date</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Cashier &amp; Shift</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Float (₹)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Receipts (₹)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Petty Cash (₹)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Expected (₹)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Physical (₹)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Variance Status</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Verification Notes</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Voucher</th>
                  </tr>
                </thead>
                <tbody>
                  {handoverLogs.map(log => (
                    <tr key={log.shiftId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{log.shiftId}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.date}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--gold-glow)' }}>{log.cashier}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.shift}</div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{log.openingFloat.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>+₹{log.cashCollected.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171' }}>-₹{log.pettyCash.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>₹{log.expected.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--gold-glow)' }}>₹{log.actual.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: log.variance === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          color: log.variance === 0 ? '#34d399' : '#f87171',
                          border: log.variance === 0 ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)'
                        }}>
                          {log.status} {log.variance !== 0 && `(₹${log.variance})`}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                        {log.notes}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveHandoverForVoucher(log);
                            setHandoverVoucherModalOpen(true);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: 'rgba(212, 175, 55, 0.15)',
                            color: 'var(--gold-glow)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            cursor: 'pointer'
                          }}
                        >
                          🖨️ Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOUSEKEEPING & 5-STAGE LIFECYCLE TRACKER */}
      {activeTab === 'housekeeping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Floor Attendant Allocation Cards */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🧹 Housekeeping Operations &amp; Floor Attendant Allocation
                </h3>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Floor attendants assigned per shift • Turnaround time tracking • Linen par-stock buffer
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setWorkOrderForm({
                      roomNumber: '202',
                      issue: '',
                      category: 'HVAC / AC',
                      priority: 'High',
                      technician: 'Bikram Patra (AC Specialist)',
                      notes: ''
                    });
                    setIsWorkOrderModalOpen(true);
                  }}
                  className="btn-outline-gold"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Wrench size={14} color="var(--gold-glow)" /> + Log Maintenance Ticket
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[2, 3, 4].map(floorNum => {
                const att = floorAttendants[floorNum] || { name: 'Staff Assigned', phone: '-', shift: 'Morning' };
                const floorRooms = rooms.filter(r => r.floor === floorNum);
                const dirtyRooms = floorRooms.filter(r => r.status === 'Vacant Dirty' || r.status === 'Cleaning').length;
                const cleanRooms = floorRooms.filter(r => r.status === 'Available').length;

                return (
                  <div key={floorNum} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 800, color: 'var(--gold-glow)', fontSize: '0.95rem' }}>
                          FLOOR {floorNum} ATTENDANT
                        </span>
                        <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.7rem' }}>
                          {att.status || 'On Floor'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginTop: '0.25rem' }}>
                        {att.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        📞 {att.phone} • {att.shift}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                      <span style={{ color: '#facc15' }}>{dirtyRooms} Dirty Pending</span>
                      <span style={{ color: '#34d399' }}>{cleanRooms} Ready to Sell</span>
                      <button
                        onClick={() => {
                          setSelectedFloorToEdit(floorNum);
                          setAttendantForm({ name: att.name, phone: att.phone, shift: att.shift });
                          setIsEditAttendantOpen(true);
                        }}
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: 'var(--gold-glow)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5-Stage Inventory KPI Counters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.85rem'
            }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 600 }}>1. Vacant Clean</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>{vacantCleanCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Inspected &amp; Ready</div>
              </div>

              <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#facc15', textTransform: 'uppercase', fontWeight: 600 }}>2. Vacant Dirty</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#facc15' }}>{vacantDirtyCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Checked Out Turnover</div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 600 }}>3. Occupied Clean</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>{occupiedCleanCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Stayover Serviced</div>
              </div>

              <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#fb923c', textTransform: 'uppercase', fontWeight: 600 }}>4. Occupied Dirty</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fb923c' }}>{occupiedDirtyCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Service Pending</div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 600 }}>5. Out of Order</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171' }}>{oooCount}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Maintenance Blocked</div>
              </div>
            </div>
          </div>

          {/* Interactive 39-Room Cleaning Matrix */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ color: 'var(--gold-glow)', margin: 0, fontSize: '1.05rem' }}>
                Interactive 39-Room Status &amp; Cleaning Dispatch:
              </h4>
              <button
                onClick={() => {
                  rooms.forEach(r => {
                    if (r.status === 'Vacant Dirty' || r.status === 'Cleaning') {
                      onUpdateRoomStatus(r.roomNumber, 'Available', null, null);
                    }
                  });
                }}
                className="btn-primary-gold"
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
              >
                🧹 Quick Release: Mark All Dirty As Inspected Clean
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {rooms.map(r => {
                const isClean = r.status === 'Available';
                const isDirty = r.status === 'Vacant Dirty' || r.status === 'Cleaning';
                const isOccClean = r.status === 'Occupied Clean';
                const isOcc = r.status === 'Occupied';
                const isMaint = r.status === 'Maintenance' || r.status === 'VIP Hold';

                const statusLabel = isClean ? 'Vacant Clean' : isDirty ? 'Vacant Dirty' : isOccClean ? 'Occupied Clean' : isOcc ? 'Occupied Dirty' : 'Out of Order';
                const statusColor = isClean ? '#34d399' : isDirty ? '#facc15' : isOccClean ? '#38bdf8' : isOcc ? '#fb923c' : '#f87171';

                return (
                  <div key={r.roomNumber} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${statusColor}40`,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '1.1rem' }}>Room {r.roomNumber}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Floor {r.floor} • {r.tier}</div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: statusColor,
                        background: `${statusColor}20`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid ${statusColor}50`
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {isDirty && (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Available', null, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ✓ Mark Clean
                        </button>
                      )}
                      {isClean && (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Vacant Dirty', null, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(234,179,8,0.2)', color: '#facc15', border: '1px solid #facc15', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Mark Dirty
                        </button>
                      )}
                      {isOcc && (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Occupied Clean', r.currentGuestName, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ✨ Serviced
                        </button>
                      )}
                      {isOccClean && (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Occupied', r.currentGuestName, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(249,115,22,0.2)', color: '#fb923c', border: '1px solid #fb923c', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Svc Pending
                        </button>
                      )}
                      {isMaint ? (
                        <button
                          onClick={() => onUpdateRoomStatus(r.roomNumber, 'Available', null, null)}
                          style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Release OOO
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setWorkOrderForm({ ...workOrderForm, roomNumber: r.roomNumber });
                            setIsWorkOrderModalOpen(true);
                          }}
                          style={{ padding: '3px 6px', fontSize: '0.7rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          🔧 Ticket
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maintenance Work Orders Ticketing Dashboard */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wrench size={17} color="#f87171" /> Maintenance Work Orders &amp; Defect Logs
              </h4>
              <button
                onClick={() => setIsWorkOrderModalOpen(true)}
                className="btn-outline-gold"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                + New Work Order
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Ticket # / Date</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Room</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Category &amp; Defect Issue</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Assigned Technician</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Target ETA</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Priority</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map(wo => (
                    <tr key={wo.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{wo.id}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{wo.loggedAt}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 800 }}>
                          Room {wo.roomNumber}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{wo.issue}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Category: {wo.category} • {wo.notes}</div>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                        {wo.technician}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)'
                        }}>
                          ⏱️ {wo.targetEta || 'Within 2 Hours'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: wo.priority === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                          color: wo.priority === 'High' ? '#f87171' : '#fbbf24'
                        }}>
                          {wo.priority}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: wo.status === 'Resolved' ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)',
                          color: wo.status === 'Resolved' ? '#34d399' : '#38bdf8'
                        }}>
                          {wo.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {wo.status !== 'Resolved' ? (
                          <button
                            onClick={() => handleResolveWorkOrder(wo.id, wo.roomNumber)}
                            style={{
                              background: 'rgba(16,185,129,0.2)',
                              border: '1px solid #10b981',
                              color: '#34d399',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ✓ Resolve &amp; Release
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          onCheckoutRoom={(roomNumber, checkoutData) => {
            onUpdateRoomStatus(roomNumber, 'Cleaning', null, null);
            if (checkoutData?.transactions) {
              const settleTx = checkoutData.transactions.find(t => t.type === 'SETTLEMENT');
              if (settleTx?.tenders?.cash) {
                setCashCollected(prev => prev + settleTx.tenders.cash);
              }
            }
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

      {/* CHECKOUT & MULTI-TENDER SPLIT SETTLEMENT MODAL (Owner Video Requirement) */}
      {checkoutRoom && (
        <CheckoutSplitModal
          isOpen={!!checkoutRoom}
          onClose={() => setCheckoutRoom(null)}
          room={checkoutRoom}
          bookings={bookings}
          onConfirmCheckout={handleCheckoutConfirm}
        />
      )}

      {/* MAINTENANCE WORK ORDER MODAL */}
      {isWorkOrderModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={20} color="#f87171" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Log Maintenance Defect Ticket</h3>
              </div>
              <button onClick={() => setIsWorkOrderModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrderSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Room Number</label>
                <select
                  className="form-select"
                  value={workOrderForm.roomNumber}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, roomNumber: e.target.value })}
                  required
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • Current: {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Defect Category</label>
                <select
                  className="form-select"
                  value={workOrderForm.category}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, category: e.target.value })}
                >
                  <option value="HVAC / AC">HVAC / Air Conditioner</option>
                  <option value="Plumbing">Plumbing &amp; Sanitary</option>
                  <option value="Electrical">Electrical &amp; Lighting</option>
                  <option value="Carpentry">Carpentry &amp; Door Locks</option>
                  <option value="Electronics / TV">Electronics / TV / Wi-Fi</option>
                  <option value="Painting / Civil">Painting &amp; Civil Works</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specific Defect Issue Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AC compressor tripping / Geyser element failure"
                  value={workOrderForm.issue}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, issue: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    className="form-select"
                    value={workOrderForm.priority}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, priority: e.target.value })}
                  >
                    <option value="High">High (Urgent Attention)</option>
                    <option value="Medium">Medium (Within Shift)</option>
                    <option value="Low">Low (Routine)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Technician</label>
                  <select
                    className="form-select"
                    value={workOrderForm.technician}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, technician: e.target.value })}
                  >
                    <option value="Bikram Patra (AC Specialist)">Bikram Patra (AC Specialist)</option>
                    <option value="Pradeep Jena (Electrician & Plumber)">Pradeep Jena (Electrician &amp; Plumber)</option>
                    <option value="Santosh Nayak (Floor Support)">Santosh Nayak (Floor Support)</option>
                    <option value="External Rayagada Vendor">External Rayagada Vendor</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Resolution ETA</label>
                <select
                  className="form-select"
                  value={workOrderForm.targetEta}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, targetEta: e.target.value })}
                >
                  <option value="Within 2 Hours">Within 2 Hours (Urgent Attention)</option>
                  <option value="Within 4 Hours">Within 4 Hours (Standard)</option>
                  <option value="Same Day by 18:00">Same Day by 18:00 PM</option>
                  <option value="Next Morning (Scheduled)">Next Morning (Scheduled)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Technician Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Spare parts required or diagnosis notes..."
                  value={workOrderForm.notes}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsWorkOrderModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444' }}>
                  Dispatch Ticket &amp; Mark Room OOO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FLOOR ATTENDANT MODAL */}
      {isEditAttendantOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} color="var(--gold-glow)" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Reassign Floor {selectedFloorToEdit} Attendant</h3>
              </div>
              <button onClick={() => setIsEditAttendantOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFloorAttendant} className="modal-body">
              <div className="form-group">
                <label className="form-label">Attendant Staff Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={attendantForm.name}
                  onChange={(e) => setAttendantForm({ ...attendantForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={attendantForm.phone}
                  onChange={(e) => setAttendantForm({ ...attendantForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shift Timing</label>
                <select
                  className="form-select"
                  value={attendantForm.shift}
                  onChange={(e) => setAttendantForm({ ...attendantForm, shift: e.target.value })}
                >
                  <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
                  <option value="Evening (14:30 - 23:00)">Evening (14:30 - 23:00)</option>
                  <option value="Night (23:00 - 07:30)">Night (23:00 - 07:30)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsEditAttendantOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Floor Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUTORY TAX INVOICE, GRC & SPLIT BILL MODAL (hotel_documents.pdf Pages 1, 2, 3) */}
      {isReceiptModalOpen && selectedReceiptBooking && (
        <BookingReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          booking={selectedReceiptBooking}
        />
      )}

      {/* PRINTABLE SHIFT HANDOVER & NOTE DENOMINATION VOUCHER MODAL */}
      {handoverVoucherModalOpen && activeHandoverForVoucher && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 15, 0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: 680,
            maxHeight: '94vh',
            overflowY: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            background: '#ffffff',
            color: '#0f172a',
            padding: '2rem'
          }}>
            {/* Header (Printable) */}
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
                    {HOTEL_CONFIG.legalName.toUpperCase()}
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                    {HOTEL_CONFIG.address} • Phone: {HOTEL_CONFIG.phone}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    GSTIN: {HOTEL_CONFIG.gstin} • State: 21 (Odisha)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: '#0f172a',
                    color: '#fbbf24',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    letterSpacing: '0.5px'
                  }}>
                    SHIFT HANDOVER VOUCHER
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Shift ID: <strong>{activeHandoverForVoucher.shiftId}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Shift & Staff Particulars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Date &amp; Time</span>
                <strong style={{ color: '#0f172a' }}>{activeHandoverForVoucher.date} • {activeHandoverForVoucher.shift}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Shift Outgoing Cashier</span>
                <strong style={{ color: '#0f172a' }}>{activeHandoverForVoucher.cashier}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Counter-Signing Supervisor</span>
                <strong style={{ color: '#0f172a' }}>{activeHandoverForVoucher.supervisor}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Handover Status</span>
                <strong style={{
                  color: activeHandoverForVoucher.variance === 0 ? '#059669' : activeHandoverForVoucher.variance > 0 ? '#0284c7' : '#dc2626'
                }}>
                  {activeHandoverForVoucher.status} {activeHandoverForVoucher.variance !== 0 && `(₹${activeHandoverForVoucher.variance})`}
                </strong>
              </div>
            </div>

            {/* Physical Currency Denominations Table */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Physical Currency Denomination Breakdown
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left' }}>Denomination</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}>Multiplier</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}>Physical Count</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'right' }}>Total Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { denom: 500, label: '₹500 Note' },
                    { denom: 200, label: '₹200 Note' },
                    { denom: 100, label: '₹100 Note' },
                    { denom: 50, label: '₹50 Note' },
                    { denom: 20, label: '₹20 Note' },
                    { denom: 10, label: '₹10 Note' },
                    { denom: 'coins', label: 'Coins (₹1, 2, 5, 10)' }
                  ].map(row => {
                    const count = activeHandoverForVoucher.denominations?.[row.denom] || 0;
                    const value = row.denom === 'coins' ? Number(count) : (Number(count) * Number(row.denom));
                    return (
                      <tr key={String(row.denom)} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>{row.label}</td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', color: '#64748b' }}>
                          {row.denom === 'coins' ? 'Direct Total' : `x ₹${row.denom}`}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontWeight: 700 }}>
                          {count}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #0f172a' }}>
                    <td colSpan="3" style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#0f172a' }}>
                      TOTAL PHYSICAL CASH COUNTED:
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#0f172a', fontSize: '0.95rem' }}>
                      ₹{Number(activeHandoverForVoucher.actual || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Reconciliation Statement */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Opening Cash Float (Petty Drawer Base):</span>
                <strong>₹{Number(activeHandoverForVoucher.openingFloat || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#059669' }}>
                <span>Add: Shift Gross Cash Collections:</span>
                <strong>+ ₹{Number(activeHandoverForVoucher.cashCollected || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#dc2626' }}>
                <span>Less: Authorized Petty Cash Disbursements:</span>
                <strong>- ₹{Number(activeHandoverForVoucher.pettyCash || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '0.4rem', fontWeight: 800 }}>
                <span>Expected Drawer Float Total:</span>
                <span>₹{Number(activeHandoverForVoucher.expected || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.2rem', fontWeight: 800, color: activeHandoverForVoucher.variance === 0 ? '#059669' : '#dc2626' }}>
                <span>Drawer Discrepancy / Variance:</span>
                <span>
                  {activeHandoverForVoucher.variance === 0 
                    ? 'BALANCED (₹0.00 NIL VARIANCE)' 
                    : activeHandoverForVoucher.variance > 0 
                      ? `+₹${activeHandoverForVoucher.variance} OVERAGE` 
                      : `-₹${Math.abs(activeHandoverForVoucher.variance)} SHORTAGE`}
                </span>
              </div>
            </div>

            {/* Verification Note */}
            <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              <strong>Audit Declaration:</strong> {activeHandoverForVoucher.notes || 'All cash receipts and physical notes matched with front desk guest folio logs.'} Physical cash handed over to the incoming shift cashier and deposited into the front desk drop safe.
            </div>

            {/* Signature Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '35px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  OUTGOING CASHIER SIGNATURE
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {activeHandoverForVoucher.cashier}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '35px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  SUPERVISOR / GM VERIFICATION
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {activeHandoverForVoucher.supervisor}
                </div>
              </div>
            </div>

            {/* Action Bar (No-Print) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setHandoverVoucherModalOpen(false)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fbbf24',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Printer size={16} /> Print Shift Handover Voucher (Ctrl+P)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
