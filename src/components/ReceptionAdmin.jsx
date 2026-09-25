import React, { useState } from 'react';
import { 
  Hotel, Layers, Users, Calendar, ShieldCheck, Clock, 
  DollarSign, CheckCircle2, AlertTriangle, Printer, Download, 
  Search, RefreshCw, UserCheck, Phone, FileText, Sparkles, 
  Check, X, ChevronRight, Lock, Bed, Send, Ban, Wrench, Eye,
  Calculator, ClipboardList, Utensils, ShoppingBag, Receipt, Sparkle,
  ArrowRightLeft, Edit3, MessageCircle, TrendingUp, QrCode, Database,
  BellRing
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS } from '../data/hotelData';
import { maskAadhaar } from '../utils/security';
import { calculateRoomTax } from '../utils/taxUtils';
import FolioActionsModal from './FolioActionsModal';
import BookingReceiptModal from './BookingReceiptModal';
import CheckoutSplitModal from './CheckoutSplitModal';
import InteractiveCalendar from '@/components/ui/visualize-booking';
import RoomQrModal from './RoomQrModal';
import BackupRestoreModal from './BackupRestoreModal';
import LiveOrdersDrawerModal from './LiveOrdersDrawerModal';
import RoomServicesCareModal from './RoomServicesCareModal';
import LinenRoomAssetsSection from './LinenRoomAssetsSection';
import StaffPayrollSection from './StaffPayrollSection';

// Frequent VIP & Corporate Guests for instant Walk-in auto-fill
const FREQUENT_VIP_GUESTS = [
  { name: 'MR. P ASHOK', phone: '+91 6305202068', aadhaar: '891234567890', origin: 'Andhra Pradesh', company: 'Linde India Ltd', billingType: 'BTC', mealPlan: 'CP' },
  { name: 'LAVAKANTA OJHA', phone: '+91 94371 44520', aadhaar: '745612348901', origin: 'Odisha', company: 'Akchem Synthetics', billingType: 'BTC', mealPlan: 'CP' },
  { name: 'BIJAY PASWAN', phone: '+91 98610 33812', aadhaar: '623489012345', origin: 'Jharkhand', company: 'PRADAN NGO', billingType: 'BTC', mealPlan: 'EP' },
  { name: 'UTKARSH SRIVASTAVA', phone: '+91 94370 88912', aadhaar: '512345678901', origin: 'Uttar Pradesh', company: 'Direct Guest', billingType: 'Direct', mealPlan: 'CP' },
  { name: 'SAHANAWAZ HUSSAIN', phone: '+91 94370 22555', aadhaar: '401234567890', origin: 'Odisha', company: 'Direct Guest', billingType: 'Direct', mealPlan: 'EP' },
  { name: 'SATYARANJAN SAHOO', phone: '+91 98612 11099', aadhaar: '390123456789', origin: 'Odisha', company: 'Direct Guest', billingType: 'Direct', mealPlan: 'CP' }
];

export default function ReceptionAdmin({
  rooms = [],
  bookings = [],
  transactions = [],
  onAddTransaction,
  onUpdateRoomStatus,
  onNewBooking,
  onRunNightAudit,
  nightAudits = [],
  onOpenRestaurantPOS,
  onOpenAccountsLedger,
  onOpenStoreInventory,
  foodOrders: propFoodOrders,
  onUpdateOrderStatus: propUpdateOrderStatus
}) {
  // The 3 Authorized Roles & 5 Department Console (Owner Video 2 Requirement)
  const [activeRole, setActiveRole] = useState('owner'); // 'owner' (Eswara MD), 'receptionist' (Front Desk), 'accounts' (Accounts Lead)
  const [activeDepartment, setActiveDepartment] = useState('reception'); // 'reception', 'restaurant', 'accounts', 'store', 'housekeeping'
  const [activeTab, setActiveTab] = useState('tape-chart'); // 'tape-chart', 'cashier-audit', 'housekeeping', 'police-register', 'dpdp'
  const [tapeChartViewMode, setTapeChartViewMode] = useState('mysoft'); // 'mysoft' (Screenshot 2 Legacy Tape Chart) or 'modern'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Folio Actions & GRC Modals State (hotel_documents.pdf Pages 1 & 5)
  const [selectedFolioRoom, setSelectedFolioRoom] = useState(null);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptModalType, setReceiptModalType] = useState('a4'); // 'a4', 'grc', 'room-split', 'food-split', 'pos'

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

  // Operational Modals: Room QR, Backup JSON, Live Food Orders, Room Services Care
  const [roomQrOpen, setRoomQrOpen] = useState(false);
  const [selectedRoomForQr, setSelectedRoomForQr] = useState('101');
  const [backupOpen, setBackupOpen] = useState(false);
  const [liveOrdersOpen, setLiveOrdersOpen] = useState(false);
  const [roomServicesCareOpen, setRoomServicesCareOpen] = useState(false);

  // 1. Rayagada Transit / Fresh-Up Day-Use Engine State (4h / 6h Slots)
  const [transitStays, setTransitStays] = useState([
    {
      id: 'TR-1081',
      roomNumber: '105',
      guestName: 'SUBHASH CHANDRA DAS',
      phone: '+91 94371 88291',
      origin: 'Bhubaneswar (Express Train 18447)',
      purpose: 'JK Paper Plant Technical Review',
      slotType: '4-Hour Transit',
      hoursAllowed: 4,
      checkInTime: '07:30 AM',
      expectedCheckoutTime: '11:30 AM',
      tariff: 899,
      paymentMode: 'UPI (PhonePe)',
      status: 'Active In-Stay',
      depositPaid: 1000
    },
    {
      id: 'TR-1082',
      roomNumber: '206',
      guestName: 'K. RAMA MURTHY',
      phone: '+91 98480 33119',
      origin: 'Visakhapatnam (Tirupati Spl 07488)',
      purpose: 'Maa Majhighariani Sacred Darshan',
      slotType: '6-Hour Transit',
      hoursAllowed: 6,
      checkInTime: '06:15 AM',
      expectedCheckoutTime: '12:15 PM',
      tariff: 1199,
      paymentMode: 'Cash',
      status: 'Active In-Stay',
      depositPaid: 1500
    }
  ]);
  const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
  const [transitForm, setTransitForm] = useState({
    roomNumber: '',
    guestName: '',
    phone: '',
    origin: '',
    purpose: 'Maa Majhighariani Pilgrimage',
    slotType: '4-Hour Transit',
    hoursAllowed: 4,
    tariff: 899,
    paymentMode: 'UPI',
    depositPaid: 1000
  });

  // 2. Lost & Found Digital Custody Locker State (Reception Vault)
  const [lostAndFoundItems, setLostAndFoundItems] = useState([
    {
      id: 'LF-2026-0041',
      dateFound: '24/09/2026',
      roomNumber: '302',
      itemDescription: 'Samsung 45W Fast Charger + Fastrack Digital Watch (Black Strap)',
      category: 'Electronics',
      foundByStaff: 'Anita Majhi (Housekeeping)',
      lockerNumber: 'Locker B-04 (Reception Safe)',
      guestName: 'UTKARSH SRIVASTAVA',
      guestPhone: '+91 94370 88912',
      status: 'In Custody',
      notes: 'Item tagged and sealed in zip-lock bag. Guest notified via phone.'
    },
    {
      id: 'LF-2026-0042',
      dateFound: '25/09/2026',
      roomNumber: '204',
      itemDescription: 'Titan Gold Dial Spectacles in hard leather case',
      category: 'Personal Accessories',
      foundByStaff: 'Babula Sahu (Housekeeping)',
      lockerNumber: 'Locker B-07 (Reception Safe)',
      guestName: 'BIJAY PASWAN',
      guestPhone: '+91 98610 33812',
      status: 'In Custody',
      notes: 'Left on nightstand during morning checkout. Awaiting collection.'
    },
    {
      id: 'LF-2026-0040',
      dateFound: '22/09/2026',
      roomNumber: '401',
      itemDescription: 'HP Wireless Mouse + Ray-Ban Aviator Sunglasses',
      category: 'Electronics',
      foundByStaff: 'Kailash Sabar',
      lockerNumber: 'Locker B-02',
      guestName: 'MR. P ASHOK',
      guestPhone: '+91 6305202068',
      status: 'Handed Over',
      notes: 'Handed over in person to guest colleague Mr. Sahoo on 23/09/2026.'
    }
  ]);
  const [isLfModalOpen, setIsLfModalOpen] = useState(false);
  const [lfForm, setLfForm] = useState({
    roomNumber: '101',
    itemDescription: '',
    category: 'Electronics',
    foundByStaff: 'Anita Majhi',
    lockerNumber: 'Locker B-05',
    guestName: '',
    guestPhone: '',
    notes: ''
  });

  // 3. Room Maintenance & Out-of-Order (OOO / OOS) Management State
  const [maintenanceTickets, setMaintenanceTickets] = useState([
    {
      ticketId: 'MNT-8041',
      roomNumber: '205',
      category: 'Air Conditioning',
      severity: 'High',
      issueDescription: 'Carrier 1.5T AC cooling coil leaking water onto desk. Filter needs descaling.',
      reportedBy: 'Babula Sahu',
      reportedAt: '25/09/2026 10:15 AM',
      assignedTech: 'Naveen Kumar (AC Specialist)',
      blockType: 'OOO (Out of Order)',
      status: 'In Progress',
      costEst: 450
    },
    {
      ticketId: 'MNT-8042',
      roomNumber: '307',
      category: 'Plumbing & Geyser',
      severity: 'Medium',
      issueDescription: 'Geyser pilot element tripped. Thermostat replaced; final inspection pending.',
      reportedBy: 'Kailash Sabar',
      reportedAt: '25/09/2026 11:45 AM',
      assignedTech: 'Bishnu Prasad (Plumber)',
      blockType: 'OOS (Out of Service)',
      status: 'In Progress',
      costEst: 200
    }
  ]);
  const [isMntModalOpen, setIsMntModalOpen] = useState(false);
  const [mntForm, setMntForm] = useState({
    roomNumber: '101',
    category: 'Air Conditioning',
    severity: 'Medium',
    issueDescription: '',
    assignedTech: 'Naveen Kumar (AC Specialist)',
    blockType: 'OOO (Out of Order)',
    costEst: 250
  });

  // Live Food Orders & Room Services Data State (2 New, 4 Pending defaults matching live reference)
  const [internalFoodOrdersList, setInternalFoodOrdersList] = useState([
    {
      orderId: 'KOT-8491',
      roomNumber: '204',
      guestName: 'BIJAY PASWAN',
      outlet: 'Cannon Kitchen',
      status: 'Received',
      items: [
        { name: 'Paneer Butter Masala', quantity: 1, price: 240 },
        { name: 'Butter Tandoori Roti', quantity: 4, price: 30 },
        { name: 'Jeera Rice', quantity: 1, price: 160 }
      ],
      totalAmount: 520,
      is_jain_satvik: 0,
      created_at: new Date(Date.now() - 6 * 60000).toISOString()
    },
    {
      orderId: 'KOT-8492',
      roomNumber: '302',
      guestName: 'UTKARSH SRIVASTAVA',
      outlet: 'Cannon Kitchen',
      status: 'Received',
      items: [
        { name: 'Dal Tadka (Satvik Pure Veg)', quantity: 1, price: 180 },
        { name: 'Steamed Basmati Rice', quantity: 2, price: 90 },
        { name: 'Curd & Salad Platter', quantity: 1, price: 80 }
      ],
      totalAmount: 440,
      is_jain_satvik: 1,
      created_at: new Date(Date.now() - 2 * 60000).toISOString()
    }
  ]);

  const foodOrdersList = propFoodOrders || internalFoodOrdersList;

  const [roomServicesList, setRoomServicesList] = useState([
    {
      requestId: 'REQ-1092',
      roomNumber: '105',
      serviceType: 'Extra Water',
      description: 'Guest requested 2 extra Kinley water bottles and clean glasses',
      priority: 'Normal',
      status: 'Pending',
      assignedStaff: 'Babula Sahu',
      requestedAt: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      requestId: 'REQ-1093',
      roomNumber: '202',
      serviceType: 'Linen Change',
      description: 'Replace king bedsheet and 2 fresh terry bath towels',
      priority: 'Normal',
      status: 'Pending',
      assignedStaff: 'Anita Majhi',
      requestedAt: new Date(Date.now() - 25 * 60000).toISOString()
    },
    {
      requestId: 'REQ-1094',
      roomNumber: '308',
      serviceType: 'Maintenance',
      description: 'Geyser pilot light checked, guest requested hot water verification',
      priority: 'High',
      status: 'Pending',
      assignedStaff: 'Kailash Sabar',
      requestedAt: new Date(Date.now() - 8 * 60000).toISOString()
    },
    {
      requestId: 'REQ-1095',
      roomNumber: '401',
      serviceType: 'Toiletries',
      description: 'VIP Suite: Extra Ayurvedic soap, shampoo kit and herbal dental set',
      priority: 'Urgent',
      status: 'Pending',
      assignedStaff: 'Anita Majhi',
      requestedAt: new Date(Date.now() - 3 * 60000).toISOString()
    }
  ]);

  const handleUpdateFoodOrderStatus = (orderId, newStatus) => {
    if (propUpdateOrderStatus) {
      propUpdateOrderStatus(orderId, newStatus);
    }
    setInternalFoodOrdersList(prev => prev.map(o => {
      if ((o.order_id || o.orderId) === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'update_order_status',
        payload: { orderId, status: newStatus }
      })
    }).catch(err => console.warn('Order status sync fallback:', err));

    setFeedbackToast(`Order #${orderId} marked as ${newStatus}`);
  };

  const handleBillToRoomFromLiveOrders = (payload) => {
    if (onAddTransaction) {
      onAddTransaction({
        id: `TXN-${Date.now()}`,
        roomNumber: payload.roomNumber,
        category: 'Food & Beverage',
        description: `KOT #${payload.orderId} - Cannon Kitchen In-Room Dining`,
        amount: payload.totalAmount,
        type: 'Charge',
        date: new Date().toISOString()
      });
    }

    setFoodOrdersList(prev => prev.map(o => {
      if ((o.order_id || o.orderId) === payload.orderId) {
        return { ...o, payment_status: 'Billed to Room', status: 'Delivered' };
      }
      return o;
    }));

    setFeedbackToast(`KOT #${payload.orderId} (₹${payload.totalAmount}) billed to Room ${payload.roomNumber} folio!`);
  };

  const handleAddRoomServiceRequest = (newReq) => {
    setRoomServicesList(prev => [newReq, ...prev]);

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'place_room_service',
        payload: newReq
      })
    }).catch(err => console.warn('Service request sync fallback:', err));

    setFeedbackToast(`Service call logged for Room ${newReq.roomNumber}!`);
  };

  const handleUpdateRoomServiceStatus = (requestId, newStatus) => {
    setRoomServicesList(prev => prev.map(r => {
      if ((r.requestId || r.request_id) === requestId) {
        return { ...r, status: newStatus };
      }
      return r;
    }));

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'update_room_service_status',
        payload: { requestId, status: newStatus }
      })
    }).catch(err => console.warn('Service status sync fallback:', err));

    setFeedbackToast(`Service ticket #${requestId} marked as ${newStatus}`);
  };

  const handleCheckoutConfirm = (payload) => {
    // 1. Release room to Vacant Dirty (Owner requirement: "automatic ga Dirty ani padatadi")
    onUpdateRoomStatus(payload.roomNumber, 'Vacant Dirty', null, null);

    // 2. Add cash to cashier drawer if cash tender was used
    if (payload.tenders.cash > 0) {
      setCashCollected(prev => prev + payload.tenders.cash);
      setDenominations(prev => ({
        ...prev,
        500: (Number(prev[500]) || 0) + Math.floor(payload.tenders.cash / 500),
        coins: (Number(prev.coins) || 0) + (payload.tenders.cash % 500)
      }));
    }

    // 2b. Dispatch Multi-Tender Split Payment to Cloudflare D1
    const tenderRows = [];
    if (payload.tenders.cash > 0) {
      tenderRows.push({ mode: 'Cash', amount: payload.tenders.cash, ref: 'Front Desk Cash Drawer' });
    }
    if (payload.tenders.upi > 0) {
      tenderRows.push({ mode: 'UPI', amount: payload.tenders.upi, ref: `${payload.tenders.upiProvider || 'UPI'} Ref: ${payload.tenders.upiRef || 'DIRECT'}` });
    }
    if (payload.tenders.card > 0) {
      tenderRows.push({ mode: 'Card', amount: payload.tenders.card, ref: `POS Auth: ${payload.tenders.cardAuth || 'AUTH'}` });
    }
    if (payload.tenders.btc > 0) {
      tenderRows.push({ mode: 'Corporate Credit', amount: payload.tenders.btc, ref: `BTC: ${payload.tenders.btcCompany || 'Company Credit'}` });
    }

    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'settle_split_payment',
        payload: {
          folioId: `FOLIO-${payload.roomNumber}`,
          roomNumber: payload.roomNumber,
          invoiceId: payload.billNo || `INV-${payload.roomNumber}`,
          tenderRows
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          console.log(`✓ Split payment settled in D1 for room ${payload.roomNumber}`);
        }
      })
      .catch(err => console.warn('Offline split payment fallback:', err));

    // 3. Add to recent settlements log
    setRecentSettlements(prev => [payload, ...prev]);

    // 4. Close checkout modal
    setCheckoutRoom(null);

    // 5. If requested, automatically open the requested document (Money Receipt Voucher or Tax Invoice)
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
      setReceiptModalType(payload.targetReceiptType || 'a4');
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

  // Shift Room Modal State (Inter-Room Reassignment)
  const [shiftModalRoom, setShiftModalRoom] = useState(null);
  const [shiftTargetRoom, setShiftTargetRoom] = useState('');
  const [shiftReason, setShiftReason] = useState('Guest Requested Upgrade / Quiet Wing');

  // Edit Stay & Guest Details Modal State
  const [editStayRoom, setEditStayRoom] = useState(null);
  const [editStayGuestName, setEditStayGuestName] = useState('');
  const [editStayPhone, setEditStayPhone] = useState('');
  const [editStayVehicle, setEditStayVehicle] = useState('');
  const [editStayExtendNights, setEditStayExtendNights] = useState(0);
  const [editStayAddExtraBed, setEditStayAddExtraBed] = useState(false);
  const [editStayNotes, setEditStayNotes] = useState('');

  // Live Notification Toast State
  const [feedbackToast, setFeedbackToast] = useState('');
  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 4500);
  };

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

  // Occupancy Report State (Sheet 2 Requirement: Day / Month / Year with CSV Download)
  const [occupancyViewMode, setOccupancyViewMode] = useState('day'); // 'day', 'month', 'year'

  // Daily Occupancy Historical Trend (Last 14 Days)
  const dailyOccupancyData = [
    { date: '11/09/2026', day: 'Fri', totalRooms: 39, occupied: 34, vacant: 4, ooo: 1, rate: 87.2, revenue: 76466, adr: 2249 },
    { date: '12/09/2026', day: 'Sat', totalRooms: 39, occupied: 38, vacant: 0, ooo: 1, rate: 97.4, revenue: 86450, adr: 2275 },
    { date: '13/09/2026', day: 'Sun', totalRooms: 39, occupied: 36, vacant: 2, ooo: 1, rate: 92.3, revenue: 81900, adr: 2275 },
    { date: '14/09/2026', day: 'Mon', totalRooms: 39, occupied: 31, vacant: 7, ooo: 1, rate: 79.5, revenue: 69750, adr: 2250 },
    { date: '15/09/2026', day: 'Tue', totalRooms: 39, occupied: 29, vacant: 9, ooo: 1, rate: 74.4, revenue: 64960, adr: 2240 },
    { date: '16/09/2026', day: 'Wed', totalRooms: 39, occupied: 33, vacant: 5, ooo: 1, rate: 84.6, revenue: 74250, adr: 2250 },
    { date: '17/09/2026', day: 'Thu', totalRooms: 39, occupied: 35, vacant: 3, ooo: 1, rate: 89.7, revenue: 79100, adr: 2260 },
    { date: '18/09/2026', day: 'Fri', totalRooms: 39, occupied: 37, vacant: 1, ooo: 1, rate: 94.9, revenue: 84360, adr: 2280 },
    { date: '19/09/2026', day: 'Sat', totalRooms: 39, occupied: 39, vacant: 0, ooo: 0, rate: 100.0, revenue: 89500, adr: 2295 },
    { date: '20/09/2026', day: 'Sun', totalRooms: 39, occupied: 35, vacant: 3, ooo: 1, rate: 89.7, revenue: 79450, adr: 2270 },
    { date: '21/09/2026', day: 'Mon', totalRooms: 39, occupied: 30, vacant: 8, ooo: 1, rate: 76.9, revenue: 67200, adr: 2240 },
    { date: '22/09/2026', day: 'Tue', totalRooms: 39, occupied: 32, vacant: 6, ooo: 1, rate: 82.1, revenue: 72320, adr: 2260 },
    { date: '23/09/2026', day: 'Wed', totalRooms: 39, occupied: 34, vacant: 4, ooo: 1, rate: 87.2, revenue: 77180, adr: 2270 },
    { date: '24/09/2026', day: 'Thu (Today)', totalRooms: 39, occupied: rooms.filter(r => r.status === 'Occupied').length || 33, vacant: rooms.filter(r => r.status === 'Available').length || 5, ooo: rooms.filter(r => r.status === 'Maintenance').length || 1, rate: Number((((rooms.filter(r => r.status === 'Occupied').length || 33) / 39) * 100).toFixed(1)), revenue: 74900, adr: 2269 }
  ];

  // Monthly Occupancy Trend (Last 12 Months)
  const monthlyOccupancyData = [
    { month: 'Oct 2025', totalNights: 1209, occupiedNights: 894, avgOccupancy: 73.9, revpar: 1640, roomRev: 1982000 },
    { month: 'Nov 2025', totalNights: 1170, occupiedNights: 948, avgOccupancy: 81.0, revpar: 1814, roomRev: 2123520 },
    { month: 'Dec 2025', totalNights: 1209, occupiedNights: 1088, avgOccupancy: 90.0, revpar: 2061, roomRev: 2491520 },
    { month: 'Jan 2026', totalNights: 1209, occupiedNights: 1028, avgOccupancy: 85.0, revpar: 1930, roomRev: 2333560 },
    { month: 'Feb 2026', totalNights: 1092, occupiedNights: 885, avgOccupancy: 81.0, revpar: 1823, roomRev: 1990250 },
    { month: 'Mar 2026', totalNights: 1209, occupiedNights: 955, avgOccupancy: 79.0, revpar: 1778, roomRev: 2148750 },
    { month: 'Apr 2026', totalNights: 1170, occupiedNights: 866, avgOccupancy: 74.0, revpar: 1650, roomRev: 1930500 },
    { month: 'May 2026', totalNights: 1209, occupiedNights: 822, avgOccupancy: 68.0, revpar: 1516, roomRev: 1833060 },
    { month: 'Jun 2026', totalNights: 1170, occupiedNights: 878, avgOccupancy: 75.0, revpar: 1688, roomRev: 1974900 },
    { month: 'Jul 2026', totalNights: 1209, occupiedNights: 919, avgOccupancy: 76.0, revpar: 1718, roomRev: 2077020 },
    { month: 'Aug 2026', totalNights: 1209, occupiedNights: 967, avgOccupancy: 80.0, revpar: 1808, roomRev: 2185880 },
    { month: 'Sep 2026 (MTD)', totalNights: 936, occupiedNights: 786, avgOccupancy: 84.0, revpar: 1906, roomRev: 1784220 }
  ];

  // Yearly Occupancy Comparison
  const yearlyOccupancyData = [
    { year: 'FY 2024-25', availableNights: 14235, occupiedNights: 10818, avgOccupancy: 76.0, totalRoomRev: 23799600, adr: 2200 },
    { year: 'FY 2025-26', availableNights: 14235, occupiedNights: 11530, avgOccupancy: 81.0, totalRoomRev: 25942500, adr: 2250 },
    { year: 'FY 2026-27 (YTD Projected)', availableNights: 14235, occupiedNights: 12099, avgOccupancy: 85.0, totalRoomRev: 27585720, adr: 2280 }
  ];

  // CSV Generator for Occupancy Report (Sheet 2: Report CSV / download)
  const handleDownloadOccupancyCSV = (mode) => {
    let headers = [];
    let rows = [];

    if (mode === 'day') {
      headers = ['Date', 'Day', 'Total Rooms', 'Occupied', 'Vacant', 'Out of Order', 'Occupancy %', 'Room Revenue (INR)', 'ADR (INR)'];
      rows = dailyOccupancyData.map(d => [d.date, d.day, d.totalRooms, d.occupied, d.vacant, d.ooo, `${d.rate}%`, d.revenue, d.adr]);
    } else if (mode === 'month') {
      headers = ['Month', 'Available Room Nights', 'Occupied Room Nights', 'Average Occupancy %', 'RevPAR (INR)', 'Total Room Revenue (INR)'];
      rows = monthlyOccupancyData.map(m => [m.month, m.totalNights, m.occupiedNights, `${m.avgOccupancy}%`, m.revpar, m.roomRev]);
    } else {
      headers = ['Financial Year', 'Available Room Nights', 'Occupied Room Nights', 'Average Occupancy %', 'ADR (INR)', 'Total Room Revenue (INR)'];
      rows = yearlyOccupancyData.map(y => [y.year, y.availableNights, y.occupiedNights, `${y.avgOccupancy}%`, y.adr, y.totalRoomRev]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hotel_Sai_Occupancy_Report_${mode.toUpperCase()}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Downloaded ${mode.toUpperCase()} Occupancy Report CSV!`);
  };

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

  // Operational Modal Submit Handlers
  const handleTransitSubmit = (e) => {
    e.preventDefault();
    if (!transitForm.roomNumber || !transitForm.guestName || !transitForm.phone) {
      alert('Please fill in Room Number, Guest Name, and Mobile Number.');
      return;
    }
    const newStay = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      roomNumber: transitForm.roomNumber,
      guestName: transitForm.guestName,
      phone: transitForm.phone,
      origin: transitForm.origin || 'Rayagada Railway Junction Transit',
      purpose: transitForm.purpose,
      slotType: transitForm.slotType,
      hoursAllowed: transitForm.hoursAllowed,
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      expectedCheckoutTime: `In ${transitForm.hoursAllowed} Hours`,
      tariff: Number(transitForm.tariff) || 899,
      paymentMode: transitForm.paymentMode,
      status: 'Active In-Stay',
      depositPaid: Number(transitForm.depositPaid) || 1000
    };
    setTransitStays(prev => [newStay, ...prev]);
    onUpdateRoomStatus(transitForm.roomNumber, 'Occupied', transitForm.guestName, newStay.id);
    setIsTransitModalOpen(false);
    showToast(`✓ Transit Check-In complete for Room ${transitForm.roomNumber} (${transitForm.slotType} - ₹${transitForm.tariff}).`);
  };

  const handleLfSubmit = (e) => {
    e.preventDefault();
    if (!lfForm.roomNumber || !lfForm.itemDescription) {
      alert('Please enter Room Number and Article Description.');
      return;
    }
    const newArticle = {
      id: `LF-2026-${Date.now().toString().slice(-4)}`,
      dateFound: new Date().toLocaleDateString('en-GB'),
      roomNumber: lfForm.roomNumber,
      itemDescription: lfForm.itemDescription,
      category: lfForm.category,
      foundByStaff: lfForm.foundByStaff || 'Anita Majhi (Housekeeping)',
      lockerNumber: lfForm.lockerNumber,
      guestName: lfForm.guestName || 'In-House Guest',
      guestPhone: lfForm.guestPhone || '+91 94370 00000',
      status: 'In Custody',
      notes: lfForm.notes || 'Tagged and placed in reception custody vault.'
    };
    setLostAndFoundItems(prev => [newArticle, ...prev]);
    setIsLfModalOpen(false);
    showToast(`✓ Found article logged in ${lfForm.lockerNumber} (ID: ${newArticle.id}).`);
  };

  const handleMntSubmit = (e) => {
    e.preventDefault();
    if (!mntForm.roomNumber || !mntForm.issueDescription) {
      alert('Please enter Room Number and Issue Description.');
      return;
    }
    const newTkt = {
      ticketId: `MNT-${Date.now().toString().slice(-4)}`,
      roomNumber: mntForm.roomNumber,
      category: mntForm.category,
      severity: mntForm.severity,
      issueDescription: mntForm.issueDescription,
      reportedBy: 'Front Desk Lead',
      reportedAt: new Date().toLocaleString('en-GB'),
      assignedTech: mntForm.assignedTech,
      blockType: mntForm.blockType,
      status: 'In Progress',
      costEst: Number(mntForm.costEst) || 250
    };
    setMaintenanceTickets(prev => [newTkt, ...prev]);
    if (mntForm.blockType === 'OOO (Out of Order)') {
      onUpdateRoomStatus(mntForm.roomNumber, 'Maintenance', null, null);
    }
    setIsMntModalOpen(false);
    showToast(`✓ Work order ${newTkt.ticketId} created. Room ${mntForm.roomNumber} blocked as ${mntForm.blockType}.`);
  };

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

  // WhatsApp Digital Keycard & Welcome Pass Dispatch
  const handleSendWelcomePass = (room) => {
    const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber);
    const guestName = room.currentGuestName || matchedBooking?.guestName || 'Valued Guest';
    const rawPhone = matchedBooking?.guestPhone || room.guestPhone || '+91 94370 00000';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = `🏨 *HOTEL SAI INTERNATIONAL - DIGITAL KEYCARD & WELCOME PASS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Namaste *${guestName}*, welcome to Hotel Sai International, Rayagada!

🔑 *Assigned Room:* Room ${room.roomNumber} (${room.tier})
📶 *High-Speed Wi-Fi:* SAI_GUEST_5G
🔐 *Wi-Fi Password:* SaiLuxury@2026
📞 *Reception Desk:* Dial 0
🍽️ *Cannon Kitchen & In-Room Dining:* Dial 9

🛕 *Rayagada Temple Darshan Timings:*
• Maa Majhighariani Temple: 05:30 AM - 01:30 PM & 04:30 PM - 09:00 PM
• Jagannath Temple: 06:00 AM - 12:30 PM & 05:00 PM - 08:30 PM

Enjoy your stay! For 24/7 front desk support or housekeeping, dial 0 or message us back directly here.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, '_blank');
    showToast(`✓ WhatsApp Welcome Pass dispatched for Room ${room.roomNumber}!`);
  };

  // Inter-Room Shift Handlers
  const handleOpenShiftModal = (room) => {
    setShiftModalRoom(room);
    const available = rooms.filter(r => (r.status === 'Available' || r.status === 'Vacant Clean') && r.roomNumber !== room.roomNumber);
    setShiftTargetRoom(available.length > 0 ? available[0].roomNumber : '');
    setShiftReason('Guest Requested Upgrade / Quiet Wing');
  };

  const handleConfirmShiftRoom = (e) => {
    e.preventDefault();
    if (!shiftModalRoom || !shiftTargetRoom) return;

    const fromRoomNo = shiftModalRoom.roomNumber;
    const toRoomNo = shiftTargetRoom;
    const guestName = shiftModalRoom.currentGuestName || 'In-House Guest';

    // 1. Release source room to Vacant Dirty for housekeeping
    onUpdateRoomStatus(fromRoomNo, 'Vacant Dirty', null, null);
    // 2. Mark destination room as Occupied with guest details
    onUpdateRoomStatus(toRoomNo, 'Occupied', guestName, shiftModalRoom.bookingId);

    // 3. Dispatch shift audit event to D1 Edge DB
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'shift_room',
        payload: {
          fromRoom: fromRoomNo,
          toRoom: toRoomNo,
          guestName,
          reason: shiftReason
        }
      })
    }).catch(err => console.warn('Offline shift fallback:', err));

    showToast(`✓ Room shifted from Room ${fromRoomNo} to Room ${toRoomNo} (${shiftReason}). Room ${fromRoomNo} released to Housekeeping.`);
    setShiftModalRoom(null);
  };

  // Edit Stay Details Handlers
  const handleOpenEditStay = (room) => {
    const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber);
    setEditStayRoom(room);
    setEditStayGuestName(room.currentGuestName || matchedBooking?.guestName || '');
    setEditStayPhone(matchedBooking?.guestPhone || '+91 94370 00000');
    setEditStayVehicle(matchedBooking?.vehicleNumber || '');
    setEditStayExtendNights(0);
    setEditStayAddExtraBed(false);
    setEditStayNotes('');
  };

  const handleSaveEditStay = (e) => {
    e.preventDefault();
    if (!editStayRoom) return;

    let extraTariff = 0;
    if (editStayExtendNights > 0) {
      extraTariff = Math.round((editStayRoom.tariff || 1699) * editStayExtendNights * 1.12);
    }
    const extraBed = editStayAddExtraBed ? 560 : 0;
    const totalAdded = extraTariff + extraBed;

    // Update room with modified guest name
    onUpdateRoomStatus(editStayRoom.roomNumber, 'Occupied', editStayGuestName, editStayRoom.bookingId);

    // Dispatch update to D1
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
      body: JSON.stringify({
        action: 'update_stay_details',
        payload: {
          roomNumber: editStayRoom.roomNumber,
          guestName: editStayGuestName,
          guestPhone: editStayPhone,
          vehicleNumber: editStayVehicle,
          extendedNights: editStayExtendNights,
          extraBedAdded: editStayAddExtraBed,
          totalAddedToFolio: totalAdded,
          notes: editStayNotes
        }
      })
    }).catch(err => console.warn('Offline stay update fallback:', err));

    showToast(`✓ Stay updated for Room ${editStayRoom.roomNumber}! ${totalAdded > 0 ? `Added ₹${totalAdded} (Nights: +${editStayExtendNights}, Bed: ₹${extraBed}) to Folio.` : 'Guest details refreshed.'}`);
    setEditStayRoom(null);
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

    // Dispatch to Cloudflare D1 maintenance_work_orders table
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'save_work_order',
        payload: {
          id: newTicket.id,
          roomNumber: newTicket.roomNumber,
          issue: newTicket.issue,
          category: newTicket.category,
          priority: newTicket.priority,
          technician: newTicket.technician,
          targetEta: newTicket.targetEta,
          notes: newTicket.notes
        }
      })
    }).catch(err => console.warn('Offline work order save:', err));

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
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'resolve_work_order',
        payload: {
          ticketId,
          roomNumber
        }
      })
    }).catch(err => console.warn('Offline work order resolution:', err));

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
      {/* 5-DEPARTMENT CONSOLE & 3-ROLE AUTHORIZATION BAR (Owner Video Requirement) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(12, 24, 43, 0.98), rgba(6, 14, 26, 0.99))',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        marginBottom: '1.75rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Top Line: 3 Authorized Operational Roles */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', border: '1px solid rgba(212, 175, 55, 0.4)', fontWeight: 800 }}>
                AUTHENTIC MYSOFT ENTERPRISE PMS
              </span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Active Operator Profile: <strong style={{ color: activeRole === 'owner' ? '#fbbf24' : activeRole === 'receptionist' ? '#38bdf8' : '#34d399' }}>
                  {activeRole === 'owner' ? '👑 Eswara (Managing Director / Owner)' : activeRole === 'receptionist' ? '👤 Front Desk Reception Lead' : '💼 Chief Accountant & Cashier Lead'}
                </strong>
              </span>
            </div>
          </div>

          {/* 3 Role Switcher Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'owner', label: '👑 Owner / MD (Eswara)', color: '#fbbf24' },
              { id: 'receptionist', label: '👤 Receptionist', color: '#38bdf8' },
              { id: 'accounts', label: '💼 Accounts Lead', color: '#34d399' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '6px',
                  border: activeRole === r.id ? `1px solid ${r.color}` : '1px solid transparent',
                  background: activeRole === r.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: activeRole === r.id ? r.color : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Line: 5 Department Master Section Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.65rem',
          paddingTop: '0.85rem'
        }}>
          {[
            { 
              id: 'reception', 
              label: '1. Front Desk & Reception', 
              icon: Hotel, 
              color: '#38bdf8', 
              desc: 'Tape Chart, 39 Rooms, Walk-in, GRC',
              onClick: () => {
                setActiveDepartment('reception');
                setActiveTab('tape-chart');
              }
            },
            { 
              id: 'restaurant', 
              label: '2. Fenugreek Restaurant', 
              icon: Utensils, 
              color: '#fbbf24', 
              desc: 'KOT Billing, In-Room Dining & POS',
              badge: foodOrdersList.filter(o => o.status === 'Received').length > 0 ? `${foodOrdersList.filter(o => o.status === 'Received').length} New` : null,
              badgeColor: '#ef4444',
              onClick: () => {
                setActiveDepartment('restaurant');
                if (onOpenRestaurantPOS) onOpenRestaurantPOS();
              }
            },
            { 
              id: 'accounts', 
              label: '3. Accounts & Cashier', 
              icon: DollarSign, 
              color: '#34d399', 
              desc: 'Cash Drawer, Split Tenders, Day Book',
              onClick: () => {
                setActiveDepartment('accounts');
                setActiveTab('cashier-audit');
              }
            },
            { 
              id: 'store', 
              label: '4. Mandi Store & Inventory', 
              icon: ShoppingBag, 
              color: '#a78bfa', 
              desc: 'Kitchen Stock, Linen & Amenities',
              onClick: () => {
                setActiveDepartment('store');
                if (onOpenStoreInventory) onOpenStoreInventory();
              }
            },
            { 
              id: 'housekeeping', 
              label: '5. Housekeeping & Turnover', 
              icon: Layers, 
              color: '#facc15', 
              desc: '39-Room Vacant Dirty Turnover',
              badge: roomServicesList.filter(r => r.status === 'Pending').length > 0 ? `${roomServicesList.filter(r => r.status === 'Pending').length} Pending` : null,
              badgeColor: '#f59e0b',
              onClick: () => {
                setActiveDepartment('housekeeping');
                setActiveTab('housekeeping');
              }
            }
          ].map(dept => {
            const Icon = dept.icon;
            const isSelected = activeDepartment === dept.id;
            return (
              <button
                key={dept.id}
                onClick={dept.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.07)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: isSelected ? dept.color : 'rgba(255,255,255,0.08)',
                  color: isSelected ? '#060e1a' : dept.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? '#fff' : '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {dept.label}
                    {dept.badge && (
                      <span style={{
                        background: dept.badgeColor,
                        color: '#fff',
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontWeight: 800
                      }}>
                        {dept.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--gold-glow)' : 'var(--text-muted)' }}>
                    {dept.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
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

        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={() => { setSelectedRoomForQr('101'); setRoomQrOpen(true); }}
            className="btn-outline-gold"
            title="Generate In-Room Dining, Digital Keycard & Standee QR"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <QrCode size={15} color="var(--gold-glow)" /> Room QR
          </button>
          <button 
            onClick={() => setBackupOpen(true)}
            className="btn-outline-gold"
            title="One-click Complete JSON Database Dump & Restore"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Database size={15} color="#38bdf8" /> Backup JSON
          </button>
          <button 
            onClick={() => setLiveOrdersOpen(true)}
            className="btn-outline-gold"
            title="View Real-Time Cannon Kitchen In-Room Dining Orders"
            style={{ 
              padding: '0.55rem 0.95rem', 
              fontSize: '0.82rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              borderColor: foodOrdersList.filter(o => o.status === 'Received').length > 0 ? '#ef4444' : undefined,
              background: foodOrdersList.filter(o => o.status === 'Received').length > 0 ? 'rgba(239, 68, 68, 0.12)' : undefined
            }}
          >
            <Utensils size={15} color="#fbbf24" /> Live Food Orders
            {foodOrdersList.filter(o => o.status === 'Received').length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                {foodOrdersList.filter(o => o.status === 'Received').length} New
              </span>
            )}
          </button>
          <button 
            onClick={() => setRoomServicesCareOpen(true)}
            className="btn-outline-gold"
            title="Manage Housekeeping, Extra Water, Linen & Maintenance Calls"
            style={{ 
              padding: '0.55rem 0.95rem', 
              fontSize: '0.82rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              borderColor: roomServicesList.filter(r => r.status === 'Pending').length > 0 ? '#f59e0b' : undefined,
              background: roomServicesList.filter(r => r.status === 'Pending').length > 0 ? 'rgba(245, 158, 11, 0.12)' : undefined
            }}
          >
            <BellRing size={15} color="#facc15" /> Room Services &amp; Care
            {roomServicesList.filter(r => r.status === 'Pending').length > 0 && (
              <span style={{ background: '#f59e0b', color: '#060e1a', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                {roomServicesList.filter(r => r.status === 'Pending').length} Pending
              </span>
            )}
          </button>
          <button 
            onClick={() => setBlockRoomOpen(true)}
            className="btn-outline-gold"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Ban size={15} color="#f87171" /> Block Room
          </button>
          <button 
            onClick={() => setWalkInOpen(true)}
            className="btn-primary-gold"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          >
            <UserCheck size={15} /> Express Walk-In
          </button>
          <button 
            onClick={() => setActiveTab('cashier-audit')}
            className="btn-secondary-sapphire"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          >
            <Clock size={15} /> Night Audit
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.45rem',
        flexWrap: 'wrap',
        marginBottom: '1.75rem',
        background: 'rgba(6, 14, 26, 0.7)',
        padding: '0.4rem',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {[
          { id: 'tape-chart', label: '📊 39-Room Tape Chart Matrix' },
          { id: 'transit-dayuse', label: '🚆 Transit / Fresh-Up Day-Use' },
          { id: 'lost-and-found', label: '🧳 Lost & Found Custody Locker' },
          { id: 'maintenance-ooo', label: '🔧 Maintenance & OOO Blocker' },
          { id: 'visualize-bookings', label: '📅 Booking Visualizer & Calendar' },
          { id: 'occupancy-report', label: '📈 Occupancy Report (Day/Mo/Yr)' },
          { id: 'cashier-audit', label: '💰 Cashier Shift Handover & Night Audit' },
          { id: 'housekeeping', label: '🧹 Housekeeping & Linen Tracker' },
          { id: 'linen-assets', label: '🧺 Linen & Room Assets (Part 3)' },
          { id: 'staff-payroll', label: '👥 Staff Attendance & Payroll (Part 1)' },
          { id: 'police-register', label: '🚨 Sarai Act Police Register' },
          { id: 'dpdp', label: '🛡️ DPDP Act 2023 Compliance' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === tab.id ? 'var(--gold-glow)' : 'transparent',
              color: activeTab === tab.id ? '#060e1a' : '#94a3b8',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer'
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

      {/* TAB: OCCUPANCY REPORT (Day / Month / Year with CSV Export - Sheet 2 Requirement) */}
      {activeTab === 'occupancy-report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Top Control Header */}
          <div className="glass-panel" style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
            border: '1px solid rgba(212, 175, 55, 0.35)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={22} color="var(--gold-glow)" />
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>
                  Occupancy Performance &amp; Revenue Analytics
                </h3>
                <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', fontSize: '0.72rem', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                  Day • Month • Year
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Track Room Nights Sold, Available Inventory (39 Keys), Average Daily Rate (ADR), RevPAR, and statutory capacity metrics
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Day / Month / Year Mode Toggle */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(6, 14, 26, 0.85)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  onClick={() => setOccupancyViewMode('day')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: occupancyViewMode === 'day' ? 'var(--gold-glow)' : 'transparent',
                    color: occupancyViewMode === 'day' ? '#060e1a' : '#94a3b8',
                    border: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📅 Daily View
                </button>
                <button
                  onClick={() => setOccupancyViewMode('month')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: occupancyViewMode === 'month' ? 'var(--gold-glow)' : 'transparent',
                    color: occupancyViewMode === 'month' ? '#060e1a' : '#94a3b8',
                    border: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📆 Monthly View
                </button>
                <button
                  onClick={() => setOccupancyViewMode('year')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: occupancyViewMode === 'year' ? 'var(--gold-glow)' : 'transparent',
                    color: occupancyViewMode === 'year' ? '#060e1a' : '#94a3b8',
                    border: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📊 Annual View
                </button>
              </div>

              {/* 1-Click CSV Download Button (Sheet 2: Report CSV) */}
              <button
                onClick={() => handleDownloadOccupancyCSV(occupancyViewMode)}
                className="btn-primary-gold"
                style={{
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)'
                }}
              >
                📥 Download {occupancyViewMode.toUpperCase()} CSV
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem'
          }}>
            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #34d399' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                {occupancyViewMode === 'day' ? "Today's Occupancy" : occupancyViewMode === 'month' ? 'MTD Avg Occupancy' : 'FY Avg Occupancy'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
                {occupancyViewMode === 'day' ? `${(((rooms.filter(r => r.status === 'Occupied').length || 33) / 39) * 100).toFixed(1)}%` : occupancyViewMode === 'month' ? '84.0%' : '85.0%'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.2rem' }}>
                ↑ +5.2% vs target benchmark
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--gold-glow)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                {occupancyViewMode === 'day' ? "Active In-House Rooms" : occupancyViewMode === 'month' ? 'Room Nights Sold' : 'Total Nights Sold'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gold-glow)', marginTop: '0.2rem' }}>
                {occupancyViewMode === 'day' ? `${rooms.filter(r => r.status === 'Occupied').length || 33} / 39` : occupancyViewMode === 'month' ? '786 Nights' : '12,099 Nights'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {occupancyViewMode === 'day' ? '5 Vacant Clean Ready' : '39 Total Keys Basis'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Average Daily Rate (ADR)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.2rem' }}>
                ₹2,269
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Standard: ₹1.6k • Deluxe: ₹2.2k • Suite: ₹3.8k
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid #a855f7' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                {occupancyViewMode === 'day' ? "Today's Room Rev" : occupancyViewMode === 'month' ? 'September MTD Rev' : 'FY Projected Revenue'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#c084fc', marginTop: '0.2rem' }}>
                {occupancyViewMode === 'day' ? '₹74,900' : occupancyViewMode === 'month' ? '₹17,84,220' : '₹2,75,85,720'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.2rem' }}>
                Excl. 12% GST (SAC 996311)
              </div>
            </div>
          </div>

          {/* VIEW: DAILY OCCUPANCY TABLE */}
          {occupancyViewMode === 'day' && (
            <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>
                  📅 14-Day Daily Occupancy &amp; Room Revenue Audit
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Audit Cutoff: 12:00 AM Nightly Roll
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Date</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Day</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Total Rooms</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Occupied</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Vacant Clean</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Out of Order</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Occupancy %</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Room Rev (₹)</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>ADR (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyOccupancyData.map((row, idx) => {
                    const isToday = row.day.includes('Today');
                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: isToday ? 'rgba(212, 175, 55, 0.08)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                      }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--gold-glow)' : '#fff' }}>
                          {row.date} {isToday && <span className="badge" style={{ background: 'var(--gold-glow)', color: '#000', fontSize: '0.65rem', marginLeft: '0.35rem' }}>LIVE</span>}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8' }}>{row.day}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#cbd5e1' }}>{row.totalRooms}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#fb923c' }}>{row.occupied}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#34d399' }}>{row.vacant}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: row.ooo > 0 ? '#f87171' : '#64748b' }}>{row.ooo}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            background: row.rate >= 90 ? 'rgba(52, 211, 153, 0.15)' : row.rate >= 75 ? 'rgba(250, 204, 21, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: row.rate >= 90 ? '#34d399' : row.rate >= 75 ? '#facc15' : '#38bdf8',
                            border: `1px solid ${row.rate >= 90 ? '#34d39940' : row.rate >= 75 ? '#facc1540' : '#38bdf840'}`
                          }}>
                            {row.rate}%
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                          ₹{row.revenue.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#94a3b8' }}>
                          ₹{row.adr.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: MONTHLY OCCUPANCY TABLE */}
          {occupancyViewMode === 'month' && (
            <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>
                  📆 12-Month Financial Year Occupancy &amp; RevPAR Roll-Up
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Total Key Capacity: 39 Rooms × Days in Month
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Month</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Available Room Nights</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Occupied Room Nights</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Avg Occupancy %</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>RevPAR (₹)</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Total Room Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyOccupancyData.map((row, idx) => {
                    const isCurrent = row.month.includes('MTD');
                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: isCurrent ? 'rgba(212, 175, 55, 0.08)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                      }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--gold-glow)' : '#fff' }}>
                          {row.month}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#cbd5e1' }}>
                          {row.totalNights.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#38bdf8' }}>
                          {row.occupiedNights.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            background: row.avgOccupancy >= 80 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                            color: row.avgOccupancy >= 80 ? '#34d399' : '#facc15',
                            border: `1px solid ${row.avgOccupancy >= 80 ? '#34d39940' : '#facc1540'}`
                          }}>
                            {row.avgOccupancy}%
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#cbd5e1' }}>
                          ₹{row.revpar.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--gold-glow)' }}>
                          ₹{row.roomRev.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: ANNUAL OCCUPANCY COMPARISON */}
          {occupancyViewMode === 'year' && (
            <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>
                  📊 Year-on-Year Capacity Utilization &amp; Annual Revenue Growth
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Statutory Accounting Audit Comparison
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Financial Year</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Available Room Nights</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Occupied Nights</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Average Occupancy %</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Average ADR (₹)</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Total Room Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyOccupancyData.map((row, idx) => (
                    <tr key={idx} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                    }}>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--gold-glow)' }}>
                        {row.year}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#cbd5e1' }}>
                        {row.availableNights.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#34d399' }}>
                        {row.occupiedNights.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          background: 'rgba(52, 211, 153, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(52, 211, 153, 0.4)'
                        }}>
                          {row.avgOccupancy}%
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#cbd5e1' }}>
                        ₹{row.adr.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 900, color: '#fff', fontSize: '0.95rem' }}>
                        ₹{row.totalRoomRev.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                📊 Legacy Tape Matrix View
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
                        const isCleaning = room.status === 'Cleaning' || room.status === 'Vacant Dirty';
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
                              } else if (isCleaning) {
                                onUpdateRoomStatus(room.roomNumber, 'Available', null, null);
                              } else if (isOccupied) {
                                setReceiptModalType('a4');
                                const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                  bookingId: `FMBIL2627-${room.roomNumber}`,
                                  billNo: `FMBIL2627-${room.roomNumber}`,
                                  roomNumber: room.roomNumber,
                                  guestName: room.currentGuestName || 'SAHANAWAZ',
                                  guestPhone: '+91 94370 22555',
                                  company: room.currentGuestName?.includes('ASHOK') ? 'LINDE INDIA LTD' : 'Direct Guest',
                                  corporateGstin: '21AAACB2528H1ZA',
                                  tier: room.tier,
                                  tariff: room.tariff || 2199,
                                  totalAmount: room.balanceDue || room.tariff || 2199,
                                  nights: 1,
                                  grcNo: `GRC-${room.roomNumber}`,
                                  checkInDate: '22/09/2026',
                                  checkInTime: '11:00 AM',
                                  checkOutDate: '23/09/2026 (12:00 PM)'
                                };
                                setSelectedReceiptBooking(matchedBooking);
                                setIsReceiptModalOpen(true);
                              }
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                                    {room.roomNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRoomForQr(room.roomNumber);
                                      setRoomQrOpen(true);
                                    }}
                                    title={`Generate Room ${room.roomNumber} QR Standee, Key & Dining`}
                                    style={{
                                      background: 'rgba(212, 175, 55, 0.15)',
                                      border: '1px solid var(--gold-glow)',
                                      color: 'var(--gold-glow)',
                                      padding: '1px 4px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <QrCode size={11} />
                                  </button>
                                </div>
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  color: badgeColor,
                                  textTransform: 'uppercase',
                                  background: 'rgba(0,0,0,0.3)',
                                  padding: '1px 5px',
                                  borderRadius: '3px'
                                }}>
                                  {isMaint ? 'MAINT' : isOccupied ? 'OCCUPIED' : (room.status === 'Vacant Dirty' ? 'VACANT DIRTY' : isCleaning ? 'CLEANING' : 'VACANT')}
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
                                  {/* Row 1: Folio, Tax Bill, GRC, Quick Checkout */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', width: '100%' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFolioRoom(room);
                                      }}
                                      title="Open 12 Folio Edit Options (hotel_documents.pdf Page 5)"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(56, 189, 248, 0.2)',
                                        color: '#38bdf8',
                                        border: '1px solid rgba(56, 189, 248, 0.4)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      ⚙️ Folio
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReceiptModalType('a4');
                                        const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                          bookingId: `FMBIL2627-${room.roomNumber}`,
                                          billNo: `FMBIL2627-${room.roomNumber}`,
                                          roomNumber: room.roomNumber,
                                          guestName: room.currentGuestName || 'SAHANAWAZ',
                                          guestPhone: '+91 94370 22555',
                                          company: room.currentGuestName?.includes('ASHOK') ? 'LINDE INDIA LTD' : 'Direct Guest',
                                          corporateGstin: '21AAACB2528H1ZA',
                                          tier: room.tier,
                                          tariff: room.tariff || 2199,
                                          totalAmount: room.balanceDue || room.tariff || 2199,
                                          nights: 1,
                                          grcNo: `GRC-${room.roomNumber}`,
                                          checkInDate: '22/09/2026',
                                          checkInTime: '11:00 AM',
                                          checkOutDate: '23/09/2026 (12:00 PM)'
                                        };
                                        setSelectedReceiptBooking(matchedBooking);
                                        setIsReceiptModalOpen(true);
                                      }}
                                      title="Consolidated Tax Invoice / Non-GST Bill (GST / Non-GST Toggle, Taxable Breakdown)"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(16, 185, 129, 0.25)',
                                        color: '#34d399',
                                        border: '1px solid rgba(16, 185, 129, 0.5)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      🧾 Bill
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReceiptModalType('grc');
                                        const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                          bookingId: `FMBIL2627-${room.roomNumber}`,
                                          billNo: `FMBIL2627-${room.roomNumber}`,
                                          roomNumber: room.roomNumber,
                                          guestName: room.currentGuestName || 'SAHANAWAZ',
                                          guestPhone: '+91 94370 22555',
                                          company: room.currentGuestName?.includes('ASHOK') ? 'LINDE INDIA LTD' : 'Direct Guest',
                                          corporateGstin: '21AAACB2528H1ZA',
                                          tier: room.tier,
                                          tariff: room.tariff || 2199,
                                          totalAmount: room.balanceDue || room.tariff || 2199,
                                          nights: 1,
                                          grcNo: `GRC-${room.roomNumber}`,
                                          checkInDate: '22/09/2026',
                                          checkInTime: '11:00 AM',
                                          checkOutDate: '23/09/2026 (12:00 PM)'
                                        };
                                        setSelectedReceiptBooking(matchedBooking);
                                        setIsReceiptModalOpen(true);
                                      }}
                                      title="Official Guest Registration Card (Page 1) - Print for Guest Signature"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(212, 175, 55, 0.25)',
                                        color: 'var(--gold-glow)',
                                        border: '1px solid var(--gold-glow)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
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
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 800,
                                        background: 'rgba(234, 179, 8, 0.25)',
                                        color: '#facc15',
                                        border: '1px solid rgba(234, 179, 8, 0.5)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      ⚡ Out
                                    </button>
                                  </div>

                                  {/* Row 2: Shift Room, Edit Stay, WhatsApp Pass */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', width: '100%' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenShiftModal(room);
                                      }}
                                      title="Shift Room to another Vacant room"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(168, 85, 247, 0.2)',
                                        color: '#c084fc',
                                        border: '1px solid rgba(168, 85, 247, 0.4)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      ⇄ Shift
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditStay(room);
                                      }}
                                      title="Edit Stay & Guest Details: extend dates, extra bed, info"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        color: '#60a5fa',
                                        border: '1px solid rgba(59, 130, 246, 0.4)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      ✏️ Stay
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendWelcomePass(room);
                                      }}
                                      title="Send WhatsApp Digital Keycard & Welcome Pass"
                                      style={{
                                        padding: '3px 2px',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        color: '#4ade80',
                                        border: '1px solid rgba(34, 197, 94, 0.4)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center'
                                      }}
                                    >
                                      💬 Pass
                                    </button>
                                  </div>
                                </div>
                              )}
                              {isCleaning && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '3px', width: '100%' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateRoomStatus(room.roomNumber, 'Available', null, null);
                                    }}
                                    title="Housekeeping complete: Release room to Vacant Clean (Ready for Guest)"
                                    style={{
                                      padding: '3px 2px',
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(5, 150, 105, 0.45))',
                                      color: '#34d399',
                                      border: '1px solid #10b981',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center'
                                    }}
                                  >
                                    🧹 Ready
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setWalkInRoom(room.roomNumber);
                                      setWalkInRate(room.tariff);
                                      setWalkInDeposit(room.tariff);
                                      setWalkInOpen(true);
                                    }}
                                    title="Immediate Walk-In Check-In"
                                    style={{
                                      padding: '3px 2px',
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      background: 'rgba(56, 189, 248, 0.2)',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.4)',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center'
                                    }}
                                  >
                                    + Walk-In
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReceiptModalType('a4');
                                      const matchedBooking = bookings.find(b => b.roomNumber === room.roomNumber || b.room_number === room.roomNumber) || {
                                        bookingId: `FMBIL2627-${room.roomNumber}`,
                                        billNo: `FMBIL2627-${room.roomNumber}`,
                                        roomNumber: room.roomNumber,
                                        guestName: room.currentGuestName || 'RECENT GUEST (CHECKED OUT)',
                                        guestPhone: '+91 94370 22555',
                                        company: 'LINDE INDIA LTD',
                                        corporateGstin: '21AAACB2528H1ZA',
                                        tier: room.tier,
                                        tariff: room.tariff || 2199,
                                        totalAmount: room.tariff || 2199,
                                        nights: 1,
                                        grcNo: `GRC-${room.roomNumber}`,
                                        checkInDate: '22/09/2026',
                                        checkInTime: '11:00 AM',
                                        checkOutDate: '23/09/2026 (12:00 PM)'
                                      };
                                      setSelectedReceiptBooking(matchedBooking);
                                      setIsReceiptModalOpen(true);
                                    }}
                                    title="View Last Settled Tax Invoice / Non-GST Bill"
                                    style={{
                                      padding: '3px 2px',
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      background: 'rgba(212, 175, 55, 0.2)',
                                      color: 'var(--gold-glow)',
                                      border: '1px solid var(--gold-glow)',
                                      borderRadius: '3px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center'
                                    }}
                                  >
                                    🧾 Bill
                                  </button>
                                </div>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                                Room {room.roomNumber}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRoomForQr(room.roomNumber);
                                  setRoomQrOpen(true);
                                }}
                                title={`Generate Room ${room.roomNumber} QR Standee & Key`}
                                style={{
                                  background: 'rgba(212, 175, 55, 0.15)',
                                  border: '1px solid var(--gold-glow)',
                                  color: 'var(--gold-glow)',
                                  padding: '2px 5px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                              >
                                <QrCode size={13} />
                              </button>
                            </div>
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
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedFolioRoom(room)}
                                    title="Open 12 Master Folio Options"
                                    style={{
                                      flex: 1,
                                      padding: '0.35rem',
                                      background: 'rgba(56, 189, 248, 0.2)',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.4)',
                                      borderRadius: '4px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ⚙️ Folio
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCheckoutRoom(room)}
                                    title="Guest Checkout & Multi-Tender Split Settlement"
                                    style={{
                                      flex: 1.5,
                                      padding: '0.35rem 0.5rem',
                                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(245, 158, 11, 0.2))',
                                      color: 'var(--gold-glow)',
                                      border: '1px solid var(--gold-glow)',
                                      borderRadius: '4px',
                                      fontSize: '0.74rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    ⚡ Out &amp; Settle
                                  </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenShiftModal(room)}
                                    title="Shift Room"
                                    style={{
                                      padding: '0.3rem',
                                      background: 'rgba(168, 85, 247, 0.2)',
                                      color: '#c084fc',
                                      border: '1px solid rgba(168, 85, 247, 0.4)',
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ⇄ Shift
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStay(room)}
                                    title="Edit Stay & Guest Details"
                                    style={{
                                      padding: '0.3rem',
                                      background: 'rgba(59, 130, 246, 0.2)',
                                      color: '#60a5fa',
                                      border: '1px solid rgba(59, 130, 246, 0.4)',
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ✏️ Stay
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSendWelcomePass(room)}
                                    title="WhatsApp Welcome Pass"
                                    style={{
                                      padding: '0.3rem',
                                      background: 'rgba(34, 197, 94, 0.2)',
                                      color: '#4ade80',
                                      border: '1px solid rgba(34, 197, 94, 0.4)',
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    💬 Pass
                                  </button>
                                </div>
                              </div>
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

                            {(room.status === 'Cleaning' || room.status === 'Vacant Dirty') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onUpdateRoomStatus(room.roomNumber, 'Available', null, null)}
                                  title="Housekeeping inspection complete: Release room to Vacant Clean"
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
                                  ✓ Mark Inspected Clean
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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

            {/* Sheet 3 Requirement: Emergency Housekeeping Shorthand Codes Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.78rem'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--gold-glow)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ⚡ Front Desk Shorthand Codes (Quick Toggles):
              </span>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#facc15', background: 'rgba(234, 179, 8, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                  <strong>[ D ]</strong> Dirty
                </span>
                <span style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <strong>[ S ]</strong> Serviced
                </span>
                <span style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                  <strong>[ T ]</strong> Touch-up
                </span>
                <span style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <strong>[ H ]</strong> Hold / Defect
                </span>
                <span style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  <strong>[ HF ]</strong> Handover Free (Ready to Sell)
                </span>
              </div>
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

                    {/* Sheet 3: Rapid Shorthand Toggles [D] [S] [T] [H] [HF] */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      background: 'rgba(0,0,0,0.35)',
                      padding: '3px 6px',
                      borderRadius: '6px',
                      marginTop: '0.25rem',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Code:</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button
                          title="D: Mark Dirty"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, 'Vacant Dirty', null, null);
                            showToast(`Room ${r.roomNumber} -> [D] Dirty`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: isDirty && r.status !== 'Cleaning' ? '#facc15' : 'rgba(234,179,8,0.15)',
                            color: isDirty && r.status !== 'Cleaning' ? '#000' : '#facc15',
                            border: '1px solid rgba(234,179,8,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          D
                        </button>
                        <button
                          title="S: Mark Serviced"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, r.status === 'Occupied' || r.status === 'Occupied Clean' ? 'Occupied Clean' : 'Available', r.currentGuestName, null);
                            showToast(`Room ${r.roomNumber} -> [S] Serviced`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: isOccClean ? '#38bdf8' : 'rgba(56,189,248,0.15)',
                            color: isOccClean ? '#000' : '#38bdf8',
                            border: '1px solid rgba(56,189,248,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          S
                        </button>
                        <button
                          title="T: Touch-up in Progress"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, 'Cleaning', r.currentGuestName, null);
                            showToast(`Room ${r.roomNumber} -> [T] Touch-up`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: r.status === 'Cleaning' ? '#c084fc' : 'rgba(192,132,252,0.15)',
                            color: r.status === 'Cleaning' ? '#000' : '#c084fc',
                            border: '1px solid rgba(192,132,252,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          T
                        </button>
                        <button
                          title="H: Hold / Maintenance"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, 'Maintenance', null, null);
                            showToast(`Room ${r.roomNumber} -> [H] Hold / OOO`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: isMaint ? '#f87171' : 'rgba(239,68,68,0.15)',
                            color: isMaint ? '#fff' : '#f87171',
                            border: '1px solid rgba(239,68,68,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          H
                        </button>
                        <button
                          title="HF: Handover Free / Ready to Sell"
                          onClick={() => {
                            onUpdateRoomStatus(r.roomNumber, 'Available', null, null);
                            showToast(`Room ${r.roomNumber} -> [HF] Handover Free`);
                          }}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            background: isClean ? '#34d399' : 'rgba(52,211,153,0.15)',
                            color: isClean ? '#060e1a' : '#34d399',
                            border: '1px solid rgba(52,211,153,0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          HF
                        </button>
                      </div>
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

          {/* Part 3: Linen Par Stock & Room Asset Custody Embedded */}
          <LinenRoomAssetsSection rooms={rooms} />
        </div>
      )}

      {/* TAB: LINEN & ROOM ASSETS (Part 3) */}
      {activeTab === 'linen-assets' && (
        <LinenRoomAssetsSection rooms={rooms} />
      )}

      {/* TAB: STAFF ATTENDANCE & PAYROLL (Part 1) */}
      {activeTab === 'staff-payroll' && (
        <StaffPayrollSection />
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

      {/* ========================================================================= */}
      {/* 1. TRANSIT / FRESH-UP DAY-USE ENGINE TAB (Screens 14-22 Operational Upgrade) */}
      {/* ========================================================================= */}
      {activeTab === 'transit-dayuse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '1.4rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid #38bdf8'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🚆</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                  Rayagada Transit &amp; Temple Fresh-Up Engine (Day-Use Slots)
                </h3>
                <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.72rem', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                  150%+ Daily Occupancy Booster
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 760 }}>
                Engineered for Rayagada Railway Junction express layovers (Howrah–Chennai &amp; Raipur–Vizag trains) and sacred Maa Majhighariani darshan pilgrims. Sell rooms on 4-Hour (₹899) and 6-Hour (₹1,199) slots during the day, release to housekeeping, and re-sell to overnight corporate guests at 2:00 PM!
              </p>
            </div>
            <button
              onClick={() => setIsTransitModalOpen(true)}
              className="btn-primary-gold"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <UserCheck size={16} /> + New Transit Check-In
            </button>
          </div>

          {/* KPI Statistics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #38bdf8' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Transit Stays
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                {transitStays.filter(t => t.status === 'Active In-Stay').length} Rooms
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Occupying Room 105 &amp; 206 currently
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #34d399' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Daytime Transit Revenue
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
                ₹{transitStays.reduce((sum, t) => sum + t.tariff, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', marginTop: '0.15rem' }}>
                Pure incremental daytime cashflow
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid var(--gold-glow)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-glow)', fontWeight: 700, textTransform: 'uppercase' }}>
                Effective Turnover Multiplier
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                118.2%
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Rooms turned over twice in 24 hours
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #c084fc' }}>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
                Standard Pricing Slots
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem' }}>
                4h: ₹899 | 6h: ₹1,199
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Includes complimentary Wi-Fi &amp; fresh linen
              </div>
            </div>
          </div>

          {/* Active Transit Stays Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#38bdf8" /> Live Transit &amp; Fresh-Up Register (25/09/2026)
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Auto-releasing rooms for evening corporate arrivals
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>ROOM</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>GUEST NAME &amp; PHONE</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>TRAIN / ORIGIN &amp; PURPOSE</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>SLOT</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>CHECK-IN</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>EXPECTED OUT</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'right' }}>TARIFF (₹)</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>MODE</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>STATUS</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'center' }}>OPERATIONAL ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {transitStays.map(stay => (
                  <tr key={stay.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 800 }}>
                        Room {stay.roomNumber}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{stay.guestName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stay.phone}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      <div style={{ color: '#cbd5e1' }}>{stay.origin}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gold-glow)' }}>{stay.purpose}</div>
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontWeight: 600, color: '#fbbf24' }}>
                      {stay.slotType}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#cbd5e1' }}>
                      {stay.checkInTime}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>
                      {stay.expectedCheckoutTime}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'right', fontWeight: 800, color: 'var(--gold-glow)' }}>
                      ₹{stay.tariff.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>
                      {stay.paymentMode}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: stay.status === 'Active In-Stay' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.08)',
                        color: stay.status === 'Active In-Stay' ? '#34d399' : '#94a3b8'
                      }}>
                        {stay.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        {stay.status === 'Active In-Stay' ? (
                          <>
                            <button
                              onClick={() => {
                                onUpdateRoomStatus(stay.roomNumber, 'Vacant Dirty', null, null);
                                setTransitStays(prev => prev.map(t => t.id === stay.id ? { ...t, status: 'Checked Out & Cleaned' } : t));
                                showToast(`✓ Room ${stay.roomNumber} Transit checkout completed. Key released to Housekeeping.`);
                              }}
                              className="btn-primary-gold"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}
                            >
                              ⚡ Express Out
                            </button>
                            <button
                              onClick={() => {
                                setTransitStays(prev => prev.map(t => t.id === stay.id ? { ...t, slotType: 'Overnight Regular', tariff: stay.tariff + 999, expectedCheckoutTime: 'Tomorrow 11:00 AM' } : t));
                                showToast(`✓ Room ${stay.roomNumber} stay upgraded to Overnight (+₹999).`);
                              }}
                              style={{
                                background: 'rgba(168, 85, 247, 0.2)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                color: '#c084fc',
                                borderRadius: '4px',
                                padding: '0.25rem 0.55rem',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              🌙 Extend Overnight (+₹999)
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Folio Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOST & FOUND DIGITAL CUSTODY LOCKER TAB (Statutory Property Vault)     */}
      {/* ========================================================================= */}
      {activeTab === 'lost-and-found' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '1.4rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid #fbbf24'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🧳</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                  Lost &amp; Found Digital Custody Locker (Reception Vault)
                </h3>
                <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', fontSize: '0.72rem', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
                  Statutory Innkeepers Act Compliance
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 760 }}>
                Secure custody protocol for articles left behind in hotel guest rooms. Every recovered charger, watch, or document is logged with photographic tag, placed into numbered reception vault locker (Lockers B-01 to B-12), and audited until returned to the verified guest.
              </p>
            </div>
            <button
              onClick={() => setIsLfModalOpen(true)}
              className="btn-primary-gold"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <PlusCircle size={16} /> + Log Found Article
            </button>
          </div>

          {/* KPI Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #fbbf24' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
                Articles in Safe Custody
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                {lostAndFoundItems.filter(i => i.status === 'In Custody').length} Items
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Stored in Reception Lockers B-04 &amp; B-07
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #34d399' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Successfully Returned
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
                {lostAndFoundItems.filter(i => i.status === 'Handed Over').length} Items
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', marginTop: '0.15rem' }}>
                100% verified handover rate this month
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #38bdf8' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Vault Locker Capacity
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                {lostAndFoundItems.filter(i => i.status === 'In Custody').length} / 12 Lockers
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                10 secure lockers currently empty and ready
              </div>
            </div>
          </div>

          {/* Lost & Found Register Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>LOG ID</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>DATE</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>ROOM</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>ARTICLE DESCRIPTION</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>CATEGORY</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>RECOVERED BY (STAFF)</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>VAULT LOCKER</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>GUEST NAME &amp; PHONE</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>CUSTODY STATUS</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {lostAndFoundItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {item.id}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#cbd5e1' }}>
                      {item.dateFound}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', fontWeight: 700, color: '#fff' }}>
                        Room {item.roomNumber}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'normal', maxWidth: 280 }}>
                      {item.itemDescription}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#fbbf24', fontSize: '0.72rem' }}>
                      {item.category}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#38bdf8' }}>
                      {item.foundByStaff}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: 'var(--gold-glow)', fontWeight: 700 }}>
                      {item.lockerNumber}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{item.guestName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.guestPhone}</div>
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: item.status === 'In Custody' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                        color: item.status === 'In Custody' ? '#fbbf24' : '#34d399',
                        border: `1px solid ${item.status === 'In Custody' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`
                      }}>
                        {item.status === 'In Custody' ? '🟡 In Custody Vault' : '🟢 Handed Over'}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                      {item.status === 'In Custody' ? (
                        <button
                          onClick={() => {
                            setLostAndFoundItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'Handed Over', notes: `Handed over on ${new Date().toLocaleDateString('en-GB')}` } : i));
                            showToast(`✓ Article ${item.id} marked as Handed Over to ${item.guestName}. Locker vacated.`);
                          }}
                          className="btn-primary-gold"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          🤝 Hand Over to Guest
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Archived ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROOM MAINTENANCE & OUT-OF-ORDER (OOO / OOS) MANAGEMENT TAB             */}
      {/* ========================================================================= */}
      {activeTab === 'maintenance-ooo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: '1.4rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid #ef4444'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔧</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                  Room Maintenance &amp; Out-of-Order (OOO / OOS) Management
                </h3>
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.72rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  Inventory Protection Guard
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 760 }}>
                Controls active engineering work orders (AC leakage, geyser servicing, plumbing). Blocking a room as Out of Order (OOO) automatically prevents receptionists and online booking portals from assigning it to arriving guests until maintenance signs off.
              </p>
            </div>
            <button
              onClick={() => setIsMntModalOpen(true)}
              className="btn-primary-gold"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Wrench size={16} /> + Create Maintenance Ticket
            </button>
          </div>

          {/* KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #ef4444' }}>
              <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
                OOO Rooms Blocked
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ef4444', marginTop: '0.2rem' }}>
                {maintenanceTickets.filter(t => t.blockType === 'OOO (Out of Order)' && t.status === 'In Progress').length} Room
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Room 205 (AC Coil Leakage)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #fbbf24' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
                OOS Minor Servicing
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fbbf24', marginTop: '0.2rem' }}>
                {maintenanceTickets.filter(t => t.blockType === 'OOS (Out of Service)' && t.status === 'In Progress').length} Room
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Room 307 (Geyser Pilot Element)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid #34d399' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Rentable Operational Inventory
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>
                37 / 39 Rooms
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', marginTop: '0.15rem' }}>
                94.8% physical inventory operational
              </div>
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>TICKET ID</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>ROOM</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>CATEGORY</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>SEVERITY</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>ISSUE &amp; DEFECT DESCRIPTION</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>REPORTED BY</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'left' }}>ASSIGNED TECHNICIAN</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>BLOCK TYPE</th>
                  <th style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>STATUS</th>
                  <th style={{ padding: '0.7rem 0.8rem', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceTickets.map(tkt => (
                  <tr key={tkt.ticketId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {tkt.ticketId}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 800 }}>
                        Room {tkt.roomNumber}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                      {tkt.category}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: tkt.severity === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: tkt.severity === 'High' ? '#f87171' : '#fbbf24'
                      }}>
                        {tkt.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'normal', maxWidth: 300, color: '#fff' }}>
                      {tkt.issueDescription}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: 'var(--text-muted)' }}>
                      {tkt.reportedBy}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                      {tkt.assignedTech}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: '#f87171', fontWeight: 700, fontSize: '0.72rem' }}>
                      {tkt.blockType}
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: tkt.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                        color: tkt.status === 'In Progress' ? '#fbbf24' : '#34d399'
                      }}>
                        {tkt.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                      {tkt.status === 'In Progress' ? (
                        <button
                          onClick={() => {
                            onUpdateRoomStatus(tkt.roomNumber, 'Vacant Dirty', null, null);
                            setMaintenanceTickets(prev => prev.map(t => t.ticketId === tkt.ticketId ? { ...t, status: 'Resolved' } : t));
                            showToast(`✓ Ticket ${tkt.ticketId} resolved. Room ${tkt.roomNumber} released to Housekeeping for cleaning.`);
                          }}
                          className="btn-primary-gold"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          ✓ Resolve &amp; Release
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Closed ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

              {/* VIP / Frequent Corporate Guest Quick-Selector */}
              <div className="form-group" style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '0.65rem', borderRadius: '6px', border: '1px dashed var(--gold-glow)' }}>
                <label className="form-label" style={{ color: 'var(--gold-glow)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.35rem' }}>
                  ⚡ Repeat / VIP Guest Fast Auto-Fill
                </label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', background: '#0a101d', borderColor: 'rgba(212, 175, 55, 0.4)' }}
                  onChange={(e) => {
                    const idx = e.target.value;
                    if (idx !== '') {
                      const g = FREQUENT_VIP_GUESTS[parseInt(idx, 10)];
                      if (g) {
                        setWalkInName(g.name);
                        setWalkInPhone(g.phone);
                        setWalkInAadhaar(g.aadhaar);
                        setWalkInOrigin(g.origin);
                        setWalkInBillingType(g.billingType);
                        setWalkInCompany(g.company);
                        setWalkInMealPlan(g.mealPlan);
                      }
                    }
                  }}
                >
                  <option value="">-- Choose frequent guest to auto-fill details --</option>
                  {FREQUENT_VIP_GUESTS.map((g, idx) => (
                    <option key={idx} value={idx}>
                      {g.name} ({g.company} • {g.phone})
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
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Block Room / Out of Order</h3>
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
                <label className="form-label">Block Reason (Standard PMS Codes)</label>
                <select
                  className="form-select"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                >
                  <option value="AC PRBLM">AC PRBLM (Air Conditioner Issue)</option>
                  <option value="PAINTING">PAINTING (Room Wall Refurbishment)</option>
                  <option value="PLUMBING">PLUMBING (Bathroom Leakage)</option>
                  <option value="MANAGEMENT HOLD">MANAGEMENT HOLD (Executive Reservation)</option>
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
          transactions={transactions}
          onAddTransaction={onAddTransaction}
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
              if (settleTx?.tenders) {
                const tenderRows = [];
                if (settleTx.tenders.cash > 0) tenderRows.push({ mode: 'Cash', amount: settleTx.tenders.cash, ref: 'Front Desk Cash' });
                if (settleTx.tenders.upi > 0) tenderRows.push({ mode: 'UPI', amount: settleTx.tenders.upi, ref: settleTx.tenders.upiRef || 'UPI' });
                if (settleTx.tenders.card > 0) tenderRows.push({ mode: 'Card', amount: settleTx.tenders.card, ref: settleTx.tenders.cardRef || 'POS-Card' });
                if (settleTx.tenders.btc > 0) tenderRows.push({ mode: 'Corporate Credit', amount: settleTx.tenders.btc, ref: settleTx.tenders.btcCompany || 'Company Credit' });

                const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
                fetch('/api/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminPin },
                  body: JSON.stringify({
                    action: 'settle_split_payment',
                    payload: { folioId: `FOLIO-${roomNumber}`, roomNumber, invoiceId: `INV-${roomNumber}`, tenderRows }
                  })
                }).catch(() => {});
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
            setReceiptModalType(type || 'a4');
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
          initialType={receiptModalType}
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

      {/* 1-CLICK INTER-ROOM SHIFT MODAL */}
      {shiftModalRoom && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowRightLeft size={20} color="#c084fc" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Shift Room (Inter-Room Transfer)</h3>
              </div>
              <button onClick={() => setShiftModalRoom(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmShiftRoom} className="modal-body">
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>CURRENT IN-HOUSE OCCUPANT</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  Room {shiftModalRoom.roomNumber} • {shiftModalRoom.tier}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#c084fc', marginTop: '2px' }}>
                  Guest: <strong>{shiftModalRoom.currentGuestName || 'In-House Guest'}</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Destination Vacant Room</label>
                <select
                  className="form-select"
                  value={shiftTargetRoom}
                  onChange={(e) => setShiftTargetRoom(e.target.value)}
                  required
                >
                  <option value="">-- Choose Target Vacant Room --</option>
                  {rooms.filter(r => (r.status === 'Available' || r.status === 'Vacant Clean') && r.roomNumber !== shiftModalRoom.roomNumber).map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} (Floor {r.floor} • {r.tier} - ₹{r.tariff}/night)
                    </option>
                  ))}
                </select>
                {rooms.filter(r => (r.status === 'Available' || r.status === 'Vacant Clean') && r.roomNumber !== shiftModalRoom.roomNumber).length === 0 && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    ⚠️ No vacant clean rooms currently available for reassignment.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Shift</label>
                <select
                  className="form-select"
                  value={shiftReason}
                  onChange={(e) => setShiftReason(e.target.value)}
                >
                  <option value="Guest Requested Upgrade / Quiet Wing">Guest Requested Upgrade / Quiet Wing</option>
                  <option value="AC Cooling Defect / Remote Issue">AC Cooling Defect / Remote Issue</option>
                  <option value="Plumbing / Water Pressure Concern">Plumbing / Water Pressure Concern</option>
                  <option value="Bed Preference (Twin to King Reassignment)">Bed Preference (Twin to King Reassignment)</option>
                  <option value="Administrative / Group Floor Consolidation">Administrative / Group Floor Consolidation</option>
                </select>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                ℹ️ <strong>Operational Protocol:</strong> Shifting will immediately move guest folio balance to Room {shiftTargetRoom || '...'}, mark Room {shiftModalRoom.roomNumber} as <em>Vacant Dirty</em> for Housekeeping turnover, and log the shift audit record.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShiftModalRoom(null)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!shiftTargetRoom}
                  className="btn-primary-gold"
                  style={{ flex: 2, justifyContent: 'center', background: '#9333ea', borderColor: '#9333ea', color: '#fff', opacity: !shiftTargetRoom ? 0.5 : 1 }}
                >
                  Confirm Room Shift ⇄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-CLICK EDIT STAY & GUEST DETAILS MODAL */}
      {editStayRoom && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} color="#60a5fa" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Edit Stay &amp; Guest Details (Room {editStayRoom.roomNumber})</h3>
              </div>
              <button onClick={() => setEditStayRoom(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditStay} className="modal-body">
              <div className="form-group">
                <label className="form-label">Guest Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editStayGuestName}
                  onChange={(e) => setEditStayGuestName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editStayPhone}
                    onChange={(e) => setEditStayPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Reg. No. (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. OD-18-B-9988"
                    value={editStayVehicle}
                    onChange={(e) => setEditStayVehicle(e.target.value)}
                  />
                </div>
              </div>

              {/* Stay Extension & Extra Bed Adders */}
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '0.85rem', margin: '0.5rem 0 1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.65rem' }}>
                  ⏳ Stay Extension &amp; Amenities Addition:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Extend Stay (Additional Nights)</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {[0, 1, 2, 3].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setEditStayExtendNights(n)}
                          style={{
                            flex: 1,
                            padding: '4px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: editStayExtendNights === n ? '#2563eb' : 'rgba(255,255,255,0.06)',
                            color: editStayExtendNights === n ? '#fff' : '#94a3b8',
                            border: editStayExtendNights === n ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          {n === 0 ? 'Same' : `+${n}n`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Extra Bed Request</label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer', marginTop: '4px' }}>
                      <input
                        type="checkbox"
                        checked={editStayAddExtraBed}
                        onChange={(e) => setEditStayAddExtraBed(e.target.checked)}
                      />
                      <span>+1 Rollaway Bed (₹560)</span>
                    </label>
                  </div>
                </div>

                {(editStayExtendNights > 0 || editStayAddExtraBed) && (
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(59, 130, 246, 0.3)', fontSize: '0.74rem', color: '#93c5fd', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Calculated Folio Debit (incl. 12% GST):</span>
                    <strong style={{ color: '#fff' }}>
                      +₹{Math.round((editStayRoom.tariff || 1699) * editStayExtendNights * 1.12 + (editStayAddExtraBed ? 560 : 0))}
                    </strong>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Front Desk Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Guest requested late breakfast, temple darshan car"
                  value={editStayNotes}
                  onChange={(e) => setEditStayNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditStayRoom(null)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                  style={{ flex: 2, justifyContent: 'center', background: '#2563eb', borderColor: '#2563eb', color: '#fff' }}
                >
                  Save Stay Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TRANSIT CHECK-IN MODAL */}
      {isTransitModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🚆</span>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>New Transit &amp; Fresh-Up Check-In</h3>
              </div>
              <button onClick={() => setIsTransitModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransitSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Assign Available Room Key *</label>
                <select
                  className="form-select"
                  required
                  value={transitForm.roomNumber}
                  onChange={(e) => setTransitForm({ ...transitForm, roomNumber: e.target.value })}
                >
                  <option value="">-- Choose Key from Available Rooms --</option>
                  {rooms.filter(r => r.status === 'Available').map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} ({r.tier} - Regular ₹{r.tariff})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Subhash Chandra Das"
                    value={transitForm.guestName}
                    onChange={(e) => setTransitForm({ ...transitForm, guestName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="+91 94371 00000"
                    value={transitForm.phone}
                    onChange={(e) => setTransitForm({ ...transitForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Transit Slot Selection</label>
                  <select
                    className="form-select"
                    value={transitForm.slotType}
                    onChange={(e) => {
                      const is6h = e.target.value.includes('6-Hour');
                      setTransitForm({
                        ...transitForm,
                        slotType: e.target.value,
                        hoursAllowed: is6h ? 6 : 4,
                        tariff: is6h ? 1199 : 899
                      });
                    }}
                  >
                    <option value="4-Hour Transit">4-Hour Transit Slot (₹899)</option>
                    <option value="6-Hour Transit">6-Hour Transit Slot (₹1,199)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Tender</label>
                  <select
                    className="form-select"
                    value={transitForm.paymentMode}
                    onChange={(e) => setTransitForm({ ...transitForm, paymentMode: e.target.value })}
                  >
                    <option value="UPI (PhonePe)">UPI (PhonePe / GPay)</option>
                    <option value="Cash">Direct Cash (Front Desk)</option>
                    <option value="Card">POS Debit/Credit Card</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Train / City Origin</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bhubaneswar Express 18447"
                    value={transitForm.origin}
                    onChange={(e) => setTransitForm({ ...transitForm, origin: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose of Stay</label>
                  <select
                    className="form-select"
                    value={transitForm.purpose}
                    onChange={(e) => setTransitForm({ ...transitForm, purpose: e.target.value })}
                  >
                    <option value="Maa Majhighariani Pilgrimage">Maa Majhighariani Darshan</option>
                    <option value="JK Paper / IMFA Day Delegation">JK Paper / IMFA Plant Work</option>
                    <option value="Railway Junction Transit Rest">Railway Transit Rest</option>
                    <option value="Business Meeting">Commercial Business Meeting</option>
                  </select>
                </div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 700 }}>
                  <span>Total Day-Use Fee:</span>
                  <span style={{ fontSize: '1.1rem' }}>₹{transitForm.tariff.toFixed(2)}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.2rem' }}>
                  Auto-scheduled checkout in {transitForm.hoursAllowed} hours. Room will be released to Housekeeping for evening corporate re-sale.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsTransitModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#0284c7', borderColor: '#0284c7', color: '#fff' }}>
                  Confirm Transit Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG FOUND ARTICLE (LOST & FOUND VAULT) MODAL */}
      {isLfModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🧳</span>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Log Found Article (Reception Vault)</h3>
              </div>
              <button onClick={() => setIsLfModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLfSubmit} className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Recovered Room # *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 204"
                    value={lfForm.roomNumber}
                    onChange={(e) => setLfForm({ ...lfForm, roomNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Article Category</label>
                  <select
                    className="form-select"
                    value={lfForm.category}
                    onChange={(e) => setLfForm({ ...lfForm, category: e.target.value })}
                  >
                    <option value="Electronics">Electronics (Charger, Mobile, Watch)</option>
                    <option value="Personal Accessories">Personal Accessories (Glasses, Ring)</option>
                    <option value="Clothing / Luggage">Clothing / Bag / Shoes</option>
                    <option value="Documents / Identity">Identity / Wallet / Tickets</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Article Detailed Description *</label>
                <textarea
                  required
                  rows={2}
                  className="form-input"
                  placeholder="e.g. Samsung 45W Type-C adapter with white cable, left plugged in bed socket"
                  value={lfForm.itemDescription}
                  onChange={(e) => setLfForm({ ...lfForm, itemDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Vault Locker Assigned</label>
                  <select
                    className="form-select"
                    value={lfForm.lockerNumber}
                    onChange={(e) => setLfForm({ ...lfForm, lockerNumber: e.target.value })}
                  >
                    <option value="Locker B-01">Locker B-01 (Top Shelf)</option>
                    <option value="Locker B-03">Locker B-03 (Top Shelf)</option>
                    <option value="Locker B-05">Locker B-05 (Middle Shelf)</option>
                    <option value="Locker B-08">Locker B-08 (Bottom Safe)</option>
                    <option value="Locker B-10">Locker B-10 (Bottom Safe)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Recovered by (Staff)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lfForm.foundByStaff}
                    onChange={(e) => setLfForm({ ...lfForm, foundByStaff: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Guest Name (If Known)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bijay Paswan"
                    value={lfForm.guestName}
                    onChange={(e) => setLfForm({ ...lfForm, guestName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guest Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 94370 00000"
                    value={lfForm.guestPhone}
                    onChange={(e) => setLfForm({ ...lfForm, guestPhone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsLfModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#d97706', borderColor: '#d97706', color: '#fff' }}>
                  Seal in Vault Locker 🔒
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MAINTENANCE WORK ORDER (OOO BLOCKER) MODAL */}
      {isMntModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Create Maintenance Ticket &amp; Block Room</h3>
              </div>
              <button onClick={() => setIsMntModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMntSubmit} className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Room Number to Block *</label>
                  <select
                    className="form-select"
                    required
                    value={mntForm.roomNumber}
                    onChange={(e) => setMntForm({ ...mntForm, roomNumber: e.target.value })}
                  >
                    <option value="">-- Select Room Key --</option>
                    {rooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} ({r.tier} - {r.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Maintenance Category</label>
                  <select
                    className="form-select"
                    value={mntForm.category}
                    onChange={(e) => setMntForm({ ...mntForm, category: e.target.value })}
                  >
                    <option value="Air Conditioning">Air Conditioning / Cooling</option>
                    <option value="Plumbing & Geyser">Plumbing &amp; Hot Water Geyser</option>
                    <option value="Electrical & Lighting">Electrical &amp; Switchboard</option>
                    <option value="Carpentry & Door Lock">Carpentry &amp; Smart Door Lock</option>
                    <option value="Civil & Paint Work">Civil &amp; Wall Painting</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select
                    className="form-select"
                    value={mntForm.severity}
                    onChange={(e) => setMntForm({ ...mntForm, severity: e.target.value })}
                  >
                    <option value="High">High (Immediate Action)</option>
                    <option value="Medium">Medium (Routine Servicing)</option>
                    <option value="Low">Low (Cosmetic Touchup)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Inventory Block Policy</label>
                  <select
                    className="form-select"
                    value={mntForm.blockType}
                    onChange={(e) => setMntForm({ ...mntForm, blockType: e.target.value })}
                  >
                    <option value="OOO (Out of Order)">OOO (Out of Order - Remove Key)</option>
                    <option value="OOS (Out of Service)">OOS (Out of Service - Minor)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Defect &amp; Work Description *</label>
                <textarea
                  required
                  rows={2}
                  className="form-input"
                  placeholder="e.g. Geyser MCB trips when hot water turned on. Element replacement required."
                  value={mntForm.issueDescription}
                  onChange={(e) => setMntForm({ ...mntForm, issueDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Assign Technician</label>
                  <input
                    type="text"
                    className="form-input"
                    value={mntForm.assignedTech}
                    onChange={(e) => setMntForm({ ...mntForm, assignedTech: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Est. Cost (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={mntForm.costEst}
                    onChange={(e) => setMntForm({ ...mntForm, costEst: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsMntModalOpen(false)} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center', background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}>
                  Block Room &amp; Issue Ticket ⚠️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPERATIONAL QUICK MODALS (Sri Sai Vasudev Residency Parity) */}
      <RoomQrModal
        isOpen={roomQrOpen}
        onClose={() => setRoomQrOpen(false)}
        initialRoomNumber={selectedRoomForQr}
        rooms={rooms}
      />

      <BackupRestoreModal
        isOpen={backupOpen}
        onClose={() => setBackupOpen(false)}
        rooms={rooms}
        bookings={bookings}
        onRestoreSuccess={() => setFeedbackToast("Database snapshot successfully restored from JSON!")}
      />

      <LiveOrdersDrawerModal
        isOpen={liveOrdersOpen}
        onClose={() => setLiveOrdersOpen(false)}
        foodOrders={foodOrdersList}
        onUpdateOrderStatus={handleUpdateFoodOrderStatus}
        onBillToRoom={handleBillToRoomFromLiveOrders}
      />

      <RoomServicesCareModal
        isOpen={roomServicesCareOpen}
        onClose={() => setRoomServicesCareOpen(false)}
        rooms={rooms}
        serviceRequests={roomServicesList}
        onAddRequest={handleAddRoomServiceRequest}
        onUpdateRequestStatus={handleUpdateRoomServiceStatus}
      />

      {/* FLOATING ACTION TOAST */}
      {feedbackToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#0f172a',
          color: '#38bdf8',
          border: '1px solid #38bdf8',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{feedbackToast}</span>
        </div>
      )}
    </section>
  );
}
