import React, { useState } from 'react';
import { 
  FileText, Split, CreditCard, DollarSign, CheckCircle2, 
  Printer, Download, ShieldCheck, Clock, User, Bed, 
  UtensilsCrossed, AlertTriangle, Plus, X, ChevronRight, Lock,
  MessageCircle, Edit2, Trash2, Tag, Percent
} from 'lucide-react';
import { HOTEL_CONFIG, CORPORATE_PARTNERS } from '../data/hotelData';

export default function MasterFolioModal({
  isOpen,
  onClose,
  rooms = [],
  bookings = [],
  transactions = [],
  onAddTransaction,
  onSettleFolio
}) {
  if (!isOpen) return null;

  // Active selected room folio (defaults to 402 for the iconic scenario)
  const [selectedRoom, setSelectedRoom] = useState('402');
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger', 'split-bills', 'multi-settle'

  // Split Invoice view state
  const [activeSplitView, setActiveSplitView] = useState('split'); // 'split', 'invoice-a', 'invoice-b'

  // Multi-tender payment state
  const [tenderRows, setTenderRows] = useState([
    { id: 1, mode: 'UPI', amount: 4000, ref: 'UPI/SBI/99182301' },
    { id: 2, mode: 'Cash', amount: 4588, ref: 'Front Desk Cash Drawer' }
  ]);
  const [isSettled, setIsSettled] = useState(false);

  // New Charge Posting Modal inside Folio
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [chargeType, setChargeType] = useState('Food & Beverage');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeOutlet, setChargeOutlet] = useState('Cannon Kitchen');

  // In-place Profile Edit Modal State
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [profileOverrides, setProfileOverrides] = useState({});
  const [formGuestName, setFormGuestName] = useState('');
  const [formGuestPhone, setFormGuestPhone] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formCorporateGstin, setFormCorporateGstin] = useState('');

  // Courtesy Discount Modal State
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percent'
  const [discountVal, setDiscountVal] = useState('500');
  const [discountReason, setDiscountReason] = useState('Managing Director Discretionary Courtesy');

  // Line-Item Void / Credit Note Modal State
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidTargetTxn, setVoidTargetTxn] = useState(null);
  const [voidReason, setVoidReason] = useState('Billing Discrepancy Correction');

  // Filter transactions for currently selected room
  const currentTxns = transactions.filter(t => t.roomNumber === selectedRoom);

  // Find booking details for room (with live profile overrides)
  const baseBooking = bookings.find(b => b.roomNumber === selectedRoom) || {
    guestName: selectedRoom === '402' ? 'Anil Sharma (GAIL Regional)' : 'In-House Guest',
    guestPhone: '+91 98210 44556',
    corporateGstin: selectedRoom === '402' ? '07AAACG1509J1ZQ' : null,
    companyName: selectedRoom === '402' ? 'GAIL (India) Limited' : 'Direct Walk-In'
  };

  const roomBooking = profileOverrides[selectedRoom] || baseBooking;

  // Calculations
  const totalDebits = currentTxns.reduce((sum, t) => sum + (t.debitAmount || 0), 0);
  const totalCredits = currentTxns.reduce((sum, t) => sum + (t.creditAmount || 0), 0);
  const balanceDue = Math.max(0, totalDebits - totalCredits);

  // Split calculations
  // Invoice A: Accommodation & Laundry (SAC 996311 / 999799 - 12% / 18%)
  const roomTxns = currentTxns.filter(t => t.invoiceCategory === 'Room');
  const invoiceATotal = roomTxns.reduce((sum, t) => sum + t.debitAmount, 0);

  // Invoice B: Food & Beverage (SAC 996331 - 5%)
  const foodTxns = currentTxns.filter(t => t.invoiceCategory === 'Food');
  const invoiceBTotal = foodTxns.reduce((sum, t) => sum + t.debitAmount, 0);

  const totalTendered = tenderRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const tenderVariance = balanceDue - totalTendered;

  const handleAddTenderRow = () => {
    setTenderRows([
      ...tenderRows,
      { id: Date.now(), mode: 'Cash', amount: tenderVariance > 0 ? tenderVariance : 0, ref: '' }
    ]);
  };

  const handleRemoveTenderRow = (id) => {
    if (tenderRows.length > 1) {
      setTenderRows(tenderRows.filter(r => r.id !== id));
    }
  };

  const handleUpdateTender = (id, field, value) => {
    setTenderRows(tenderRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handlePostCharge = (e) => {
    e.preventDefault();
    if (!chargeDesc || !chargeAmount) return;

    const amt = parseFloat(chargeAmount);
    const isFood = chargeType.includes('Food') || chargeOutlet === 'Cannon Kitchen' || chargeOutlet === 'Room Service';
    const gstRate = isFood ? 5 : 12;
    const sacCode = isFood ? '996331' : '996311';

    const newTxn = {
      transactionId: `TXN-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: chargeType,
      outlet: chargeOutlet,
      itemCode: `MANUAL-${Date.now().toString().slice(-3)}`,
      description: chargeDesc,
      debitAmount: amt,
      creditAmount: 0,
      taxableBase: amt / (1 + gstRate / 100),
      gstRate,
      cgst: (amt / (1 + gstRate / 100)) * (gstRate / 200),
      sgst: (amt / (1 + gstRate / 100)) * (gstRate / 200),
      sacCode,
      invoiceCategory: isFood ? 'Food' : 'Room',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(newTxn);
    }
    setChargeModalOpen(false);
    setChargeDesc('');
    setChargeAmount('');
  };

  const handleOpenEditProfile = () => {
    setFormGuestName(roomBooking.guestName || '');
    setFormGuestPhone(roomBooking.guestPhone || '');
    setFormCompanyName(roomBooking.companyName || '');
    setFormCorporateGstin(roomBooking.corporateGstin || '');
    setEditProfileModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileOverrides(prev => ({
      ...prev,
      [selectedRoom]: {
        ...roomBooking,
        guestName: formGuestName,
        guestPhone: formGuestPhone,
        companyName: formCompanyName,
        corporateGstin: formCorporateGstin
      }
    }));
    setEditProfileModalOpen(false);
  };

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    const val = parseFloat(discountVal) || 0;
    if (val <= 0) return;

    let discountAmt = val;
    if (discountType === 'percent') {
      discountAmt = Math.round((balanceDue * (val / 100)) * 100) / 100;
    }

    if (discountAmt > balanceDue) {
      discountAmt = balanceDue;
    }

    const discountTxn = {
      transactionId: `ALW-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Allowance',
      outlet: 'Front Desk',
      itemCode: 'DISC-AUTH',
      description: `Manager Allowance (${discountReason})`,
      debitAmount: 0,
      creditAmount: discountAmt,
      taxableBase: discountAmt / 1.12,
      gstRate: 12,
      cgst: (discountAmt / 1.12) * 0.06,
      sgst: (discountAmt / 1.12) * 0.06,
      sacCode: '996311',
      invoiceCategory: 'Room',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(discountTxn);
    }
    setDiscountModalOpen(false);
  };

  const handleAddExtraBed = () => {
    const amt = 560; // ₹500 + 12% GST = ₹560
    const extraBedTxn = {
      transactionId: `BED-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Extra Bed / Rollaway',
      outlet: 'Housekeeping',
      itemCode: 'ROLLAWAY-BED',
      description: 'Extra Rollaway Bed Mattress (Night Tariff)',
      debitAmount: amt,
      creditAmount: 0,
      taxableBase: 500,
      gstRate: 12,
      cgst: 30,
      sgst: 30,
      sacCode: '996311',
      invoiceCategory: 'Room',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(extraBedTxn);
    }
    alert(`🛏️ Added Extra Rollaway Bed (₹500 + 12% GST = ₹560) to Room ${selectedRoom} Folio!`);
  };

  const handleOpenVoid = (txn) => {
    setVoidTargetTxn(txn);
    setVoidModalOpen(true);
  };

  const handleConfirmVoid = (e) => {
    e.preventDefault();
    if (!voidTargetTxn) return;

    const reversalAmt = voidTargetTxn.debitAmount || 0;
    const reversalTxn = {
      transactionId: `CN-${selectedRoom}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${selectedRoom}`,
      bookingId: roomBooking.bookingId || `BOOK-${selectedRoom}`,
      roomNumber: selectedRoom,
      transactionType: 'Credit Note / Reversal',
      outlet: voidTargetTxn.outlet,
      itemCode: 'SEC34-CREDIT-NOTE',
      description: `GST Sec 34 Credit Note: Reversal of ${voidTargetTxn.transactionId} (${voidReason})`,
      debitAmount: 0,
      creditAmount: reversalAmt,
      taxableBase: voidTargetTxn.taxableBase || (reversalAmt / (1 + (voidTargetTxn.gstRate || 12) / 100)),
      gstRate: voidTargetTxn.gstRate || 12,
      cgst: voidTargetTxn.cgst || 0,
      sgst: voidTargetTxn.sgst || 0,
      sacCode: voidTargetTxn.sacCode || '996311',
      invoiceCategory: voidTargetTxn.invoiceCategory || 'Room',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (onAddTransaction) {
      onAddTransaction(reversalTxn);
    }
    setVoidModalOpen(false);
    setVoidTargetTxn(null);
  };

  const handleSendWhatsAppInvoice = () => {
    const rawPhone = (roomBooking.guestPhone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const message = 
`🏨 *HOTEL SAI INTERNATIONAL, RAYAGADA*
📍 J.K. Road, Rayagada, Odisha - 765001
📞 06856 225 555 | GSTIN: ${HOTEL_CONFIG.gstin}
───────────────────────────────
📋 *TAX INVOICE & FOLIO SUMMARY*
Room Number: *${selectedRoom}*
Guest: *${roomBooking.guestName}*
Company: ${roomBooking.companyName || 'Direct Walk-In'}
${roomBooking.corporateGstin ? `Corporate GSTIN: ${roomBooking.corporateGstin}\n` : ''}Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
───────────────────────────────
🛏️ Room Charges (SAC 996311): ₹${invoiceATotal.toFixed(2)}
🍳 Restaurant F&B (SAC 996331): ₹${invoiceBTotal.toFixed(2)}
💰 Gross Debits: ₹${totalDebits.toFixed(2)}
💳 Advances / Paid: ₹${totalCredits.toFixed(2)}
⚖️ *Net Balance Due: ₹${balanceDue.toFixed(2)}*
───────────────────────────────
${balanceDue > 0 ? `💳 Quick UPI Pay: ${HOTEL_CONFIG.upiId}\n` : '✓ Status: FULLY SETTLED & PAID\n'}
🙏 *Thank you for staying at Hotel Sai International, Rayagada!*
Divine blessings of sacred Maa Majhighariani.`;

    const encoded = encodeURIComponent(message);
    const targetUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  const handleExecuteSettlement = () => {
    if (tenderVariance !== 0) {
      alert(`Settlement unbalanced! Variance of ₹${tenderVariance.toFixed(2)} must be 0 before checkout.`);
      return;
    }
    setIsSettled(true);
    if (onSettleFolio) {
      onSettleFolio(selectedRoom, tenderRows);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1280,
        maxHeight: '94vh',
        overflowY: 'auto',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(20,25,45,0.9), rgba(10,14,28,0.95))',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', border: '1px solid var(--gold-primary)' }}>
                IDS NEXT STANDARD
              </span>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Master Guest Folio & Split Billing Console
              </h2>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Single source of truth double-entry ledger • Zero ₹17k discrepancies • Permanent F&B binding
            </p>
          </div>

          {/* Room Selector Pills & Quick Dispatch Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Folio:</span>
            {['402', '301', '104'].map(rNum => (
              <button
                key={rNum}
                onClick={() => { setSelectedRoom(rNum); setIsSettled(false); }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedRoom === rNum ? 'var(--gold-primary)' : 'rgba(255,255,255,0.06)',
                  color: selectedRoom === rNum ? '#000' : 'var(--text-primary)',
                  border: selectedRoom === rNum ? '1px solid var(--gold-glow)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Room {rNum} {rNum === '402' ? '(GAIL B2B)' : rNum === '301' ? '(Executive)' : '(Standard)'}
              </button>
            ))}

            <button
              onClick={handleSendWhatsAppInvoice}
              style={{
                padding: '0.42rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: '#25D366',
                color: '#060e1a',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
              }}
              title="Send Official Tax Invoice & Payment Link on WhatsApp"
            >
              <MessageCircle size={15} /> WhatsApp Invoice
            </button>

            <button
              onClick={() => window.print()}
              style={{
                padding: '0.42rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Printer size={15} /> Print
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

        {/* Guest Folio Summary Card */}
        <div style={{
          padding: '1.25rem 2rem',
          background: 'rgba(212, 175, 55, 0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guest Name / Corporate</div>
              <button 
                onClick={handleOpenEditProfile}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold-glow)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: 600
                }}
              >
                <Edit2 size={12} /> Edit Profile
              </button>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{roomBooking.guestName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-glow)' }}>{roomBooking.companyName} • {roomBooking.guestPhone}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corporate GSTIN</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
              {roomBooking.corporateGstin || 'B2C Direct Walk-in'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAC: 996311 (Room) / 996331 (F&B)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Debits (Gross)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#60a5fa' }}>₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentTxns.length} Ledger Line Items</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Advance & Credits</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Bank / UPI Receipts</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Balance Due</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: balanceDue > 0 ? '#f87171' : '#34d399' }}>
              ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: balanceDue === 0 ? '#34d399' : '#f87171' }}>
              {balanceDue === 0 ? '✓ Folio Fully Cleared' : 'Pending Multi-Mode Settlement'}
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10, 14, 25, 0.5)'
        }}>
          <button
            onClick={() => setActiveTab('ledger')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'ledger' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              color: activeTab === 'ledger' ? 'var(--gold-glow)' : 'var(--text-muted)',
              border: activeTab === 'ledger' ? '1px solid var(--gold-glow)' : '1px solid transparent'
            }}
          >
            <FileText size={16} /> Master Folio Ledger ({currentTxns.length})
          </button>

          <button
            onClick={() => setActiveTab('split-bills')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'split-bills' ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
              color: activeTab === 'split-bills' ? '#60a5fa' : 'var(--text-muted)',
              border: activeTab === 'split-bills' ? '1px solid #60a5fa' : '1px solid transparent'
            }}
          >
            <Split size={16} /> Split Invoicing (Room 12% vs Food 5%)
          </button>

          <button
            onClick={() => setActiveTab('multi-settle')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'multi-settle' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
              color: activeTab === 'multi-settle' ? '#34d399' : 'var(--text-muted)',
              border: activeTab === 'multi-settle' ? '1px solid #34d399' : '1px solid transparent'
            }}
          >
            <CreditCard size={16} /> Multi-Tender Settlement Dialog
          </button>
        </div>

        {/* Tab 1: Master Folio Ledger */}
        {activeTab === 'ledger' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Master Folio Account Entries</h3>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Immutable audit trail. Every room rent, Cannon Kitchen order, and laundry voucher is tracked.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setChargeModalOpen(true)}
                  className="btn-primary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={14} /> Post Debit / KOT
                </button>
                <button
                  onClick={() => setDiscountModalOpen(true)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid var(--gold-glow)',
                    color: 'var(--gold-glow)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Tag size={14} /> Courtesy Allowance
                </button>
                <button
                  onClick={handleAddExtraBed}
                  style={{
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Bed size={14} /> + Extra Bed (₹560)
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Txn ID / Time</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Outlet / Type</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Description</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>SAC / HSN</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>GST Rate</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Credit (₹)</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>Audit Status</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTxns.map((txn, idx) => (
                    <tr 
                      key={txn.transactionId}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{txn.transactionId}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.createdAt}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge" style={{
                          background: txn.outlet === 'Cannon Kitchen' ? 'rgba(245, 158, 11, 0.2)' : (txn.transactionType === 'Payment' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(96, 165, 250, 0.2)'),
                          color: txn.outlet === 'Cannon Kitchen' ? '#fbbf24' : (txn.transactionType === 'Payment' ? '#34d399' : '#60a5fa'),
                          fontSize: '0.75rem'
                        }}>
                          {txn.outlet}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}>
                        <div style={{ fontWeight: 500 }}>{txn.description}</div>
                        {txn.itemCode && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code: {txn.itemCode}</div>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {txn.sacCode}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {txn.gstRate > 0 ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {txn.gstRate}% (C:{txn.cgst.toFixed(1)} S:{txn.sgst.toFixed(1)})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, color: txn.debitAmount > 0 ? '#f87171' : 'var(--text-muted)' }}>
                        {txn.debitAmount > 0 ? `₹${txn.debitAmount.toFixed(2)}` : '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, color: txn.creditAmount > 0 ? '#34d399' : 'var(--text-muted)' }}>
                        {txn.creditAmount > 0 ? `₹${txn.creditAmount.toFixed(2)}` : '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        {txn.isLocked ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                            <Lock size={12} /> 12 AM Locked
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#34d399', fontSize: '0.75rem' }}>
                            <CheckCircle2 size={12} /> Open Folio
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        {txn.debitAmount > 0 && !txn.isLocked ? (
                          <button
                            onClick={() => handleOpenVoid(txn)}
                            title="Issue Credit Note Reversal (Sec 34 CGST Act)"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600
                            }}
                          >
                            <Trash2 size={12} /> Void / Credit Note
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'rgba(212, 175, 55, 0.08)', fontWeight: 700 }}>
                    <td colSpan={5} style={{ padding: '1rem', color: 'var(--gold-glow)' }}>
                      LEDGER RECONCILIATION SUMMARY (ROOM {selectedRoom})
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#f87171' }}>
                      ₹{totalDebits.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#34d399' }}>
                      ₹{totalCredits.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: balanceDue > 0 ? '#f87171' : '#34d399' }}>
                      Bal: ₹{balanceDue.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Split Invoicing (The Room 402 / ₹13,588 Scenario) */}
        {activeTab === 'split-bills' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(16,185,129,0.08))',
              border: '1px solid rgba(96,165,250,0.3)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem' }}>
                  <Split size={16} /> THE CORPORATE SPLIT-INVOICING ENGINE (ROOM 402 CASE)
                </div>
                <h4 style={{ color: '#fff', margin: '0.25rem 0', fontSize: '1.1rem' }}>
                  Total Folio: ₹{totalDebits.toFixed(2)} Split into Two GST-Compliant Tax Invoices
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Corporate clients (GAIL, JK Paper) reject combined bills due to distinct food per-diem limits and differing GST rates (12% vs 5%).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveSplitView('split')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeSplitView === 'split' ? '#60a5fa' : 'rgba(255,255,255,0.08)',
                    color: activeSplitView === 'split' ? '#000' : '#fff',
                    border: 'none'
                  }}
                >
                  Side-by-Side Split View
                </button>
                <button
                  onClick={() => setActiveSplitView('invoice-a')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeSplitView === 'invoice-a' ? '#38bdf8' : 'rgba(255,255,255,0.08)',
                    color: activeSplitView === 'invoice-a' ? '#000' : '#fff',
                    border: 'none'
                  }}
                >
                  Invoice A (Room 12%)
                </button>
                <button
                  onClick={() => setActiveSplitView('invoice-b')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeSplitView === 'invoice-b' ? '#34d399' : 'rgba(255,255,255,0.08)',
                    color: activeSplitView === 'invoice-b' ? '#000' : '#fff',
                    border: 'none'
                  }}
                >
                  Invoice B (Food 5%)
                </button>
              </div>
            </div>

            {/* Side-by-side Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
              {/* INVOICE A: ROOM TARIFF & ACCOMMODATION */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>INVOICE A: ACCOMMODATION</span>
                    <h4 style={{ color: '#fff', margin: '0.4rem 0 0', fontSize: '1.05rem' }}>Tax Invoice #INV-ROOM-202609-0402</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAC Code: 996311 • GST 12% (CGST 6% + SGST 6%)</div>
                  </div>
                  <button 
                    onClick={() => alert("Printing Official Tax Invoice A (Room Tariff) for Corporate Reimbursement")}
                    className="btn-outline" 
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Printer size={14} /> Print Bill A
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '0.5rem 0' }}>Item / Service</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Taxable Base</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>GST (12%/18%)</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomTxns.map(t => (
                        <tr key={t.transactionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.6rem 0', color: '#fff' }}>{t.description}</td>
                          <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>₹{t.taxableBase.toFixed(2)}</td>
                          <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>₹{(t.cgst + t.sgst).toFixed(2)}</td>
                          <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>₹{t.debitAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                    <span>Invoice A Net Total:</span>
                    <span style={{ color: '#38bdf8' }}>₹{invoiceATotal.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>
                    ✓ Eligible for Corporate Input Tax Credit (ITC) under GSTR-2B
                  </div>
                </div>
              </div>

              {/* INVOICE B: FOOD & BEVERAGE */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>INVOICE B: RESTAURANT & DINING</span>
                    <h4 style={{ color: '#fff', margin: '0.4rem 0 0', fontSize: '1.05rem' }}>Tax Invoice #INV-FOOD-202609-0402</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAC Code: 996331 • GST 5% (CGST 2.5% + SGST 2.5%)</div>
                  </div>
                  <button 
                    onClick={() => alert("Printing Official Tax Invoice B (Cannon Kitchen Food Bill) for Corporate Per-Diem Reimbursement")}
                    className="btn-outline" 
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Printer size={14} /> Print Bill B
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '0.5rem 0' }}>Item / Outlet</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Taxable Base</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>GST (5%)</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodTxns.map(t => (
                        <tr key={t.transactionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.6rem 0', color: '#fff' }}>{t.description}</td>
                          <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>₹{t.taxableBase.toFixed(2)}</td>
                          <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>₹{(t.cgst + t.sgst).toFixed(2)}</td>
                          <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, color: '#34d399' }}>₹{t.debitAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                    <span>Invoice B Net Total:</span>
                    <span style={{ color: '#34d399' }}>₹{invoiceBTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Food expenses billed cleanly without ITC as per statutory GST restaurant rules
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Tender Payment Settlement Dialog */}
        {activeTab === 'multi-settle' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.15rem' }}>
                  Multi-Mode Payment Settlement (Bill Split by Tender)
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Direct solution to MySoft flaw where entering UPI erased Cash drawer counts. Add multiple tender modes for a single invoice.
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(212, 175, 55, 0.08)',
                  padding: '1rem',
                  borderRadius: '8px',
                  margin: '1.25rem 0'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Folio Outstanding Balance:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171' }}>₹{balanceDue.toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Tendered:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>₹{totalTendered.toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Variance / Unbalanced:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: tenderVariance === 0 ? '#34d399' : '#f87171' }}>
                      {tenderVariance === 0 ? '✓ Balanced (₹0.00)' : `₹${tenderVariance.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Tender Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {tenderRows.map((row, index) => (
                    <div key={row.id} style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <div style={{ width: 30, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                        #{index + 1}
                      </div>

                      <div style={{ width: 180 }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Tender Mode</label>
                        <select
                          value={row.mode}
                          onChange={(e) => handleUpdateTender(row.id, 'mode', e.target.value)}
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
                          <option value="Cash">Cash (Front Desk Drawer)</option>
                          <option value="UPI">UPI (SBI / PhonePe QR)</option>
                          <option value="Card">Card (Swipe POS Machine)</option>
                          <option value="Corporate Credit">Corporate Credit (GAIL / JK Paper)</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      <div style={{ width: 140 }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Amount (₹)</label>
                        <input
                          type="number"
                          value={row.amount}
                          onChange={(e) => handleUpdateTender(row.id, 'amount', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem',
                            background: '#0d111d',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Reference / UTR / Auth Code</label>
                        <input
                          type="text"
                          value={row.ref}
                          placeholder="e.g. PhonePe UTR 4291840192 or Cheque #"
                          onChange={(e) => handleUpdateTender(row.id, 'ref', e.target.value)}
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

                      <button
                        onClick={() => handleRemoveTenderRow(row.id)}
                        disabled={tenderRows.length === 1}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          cursor: tenderRows.length === 1 ? 'not-allowed' : 'pointer',
                          marginTop: '1rem'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={handleAddTenderRow}
                    className="btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={14} /> Add Another Payment Mode
                  </button>

                  <button
                    onClick={handleExecuteSettlement}
                    disabled={tenderVariance !== 0 || isSettled}
                    className="btn-primary"
                    style={{
                      padding: '0.65rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      opacity: (tenderVariance !== 0 || isSettled) ? 0.5 : 1,
                      cursor: (tenderVariance !== 0 || isSettled) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSettled ? '✓ Settle Completed & Room Cleared' : 'Settle Folio & Check-Out Room'}
                  </button>
                </div>

                {isSettled && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '1px solid #34d399',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#34d399'
                  }}>
                    <CheckCircle2 size={22} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Settlement Successful & Audit Locked!</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        All 2 tender records logged to Cashier Shift Handover. Room 402 marked as 'Cleaning'.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Post New Charge inside Folio */}
        {chargeModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', margin: 0 }}>Post Debit to Room {selectedRoom}</h4>
                <button onClick={() => setChargeModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePostCharge}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Outlet / Category</label>
                  <select
                    value={chargeOutlet}
                    onChange={(e) => {
                      setChargeOutlet(e.target.value);
                      if (e.target.value === 'Cannon Kitchen') setChargeType('Food & Beverage');
                      else if (e.target.value === 'Room Service') setChargeType('Room Service');
                      else if (e.target.value === 'Laundry Dept') setChargeType('Laundry');
                    }}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Cannon Kitchen">Cannon Kitchen (Restaurant Dining)</option>
                    <option value="Room Service">In-Room Dining (Room Service)</option>
                    <option value="Laundry Dept">Laundry & Dry Cleaning</option>
                    <option value="Front Desk">Front Desk (Extra Bed / Tariff)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KOT #1052 Paneer Butter Masala & Roti"
                    value={chargeDesc}
                    onChange={(e) => setChargeDesc(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 450"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setChargeModalOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>
                    Post to Master Folio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: In-place Guest Profile Edit */}
        {editProfileModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Edit2 size={16} color="var(--gold-glow)" /> Edit Billing Profile (Room {selectedRoom})
                </h4>
                <button onClick={() => setEditProfileModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={formGuestName}
                    onChange={(e) => setFormGuestName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>WhatsApp / Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={formGuestPhone}
                    onChange={(e) => setFormGuestPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Company / Organization (Optional)</label>
                  <input
                    type="text"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="e.g. GAIL (India) Limited / JK Paper"
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Corporate GSTIN (Rule 46 ITC)</label>
                  <input
                    type="text"
                    value={formCorporateGstin}
                    onChange={(e) => setFormCorporateGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 21AABCH7663L1ZG"
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditProfileModalOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Apply Courtesy Discount / Allowance */}
        {discountModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={16} color="var(--gold-glow)" /> Apply Courtesy Allowance (Room {selectedRoom})
                </h4>
                <button onClick={() => setDiscountModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleApplyDiscount}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Discount Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: discountType === 'fixed' ? 'var(--gold-glow)' : '#0b0f19',
                        color: discountType === 'fixed' ? '#000' : '#fff',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      Fixed Amount (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: discountType === 'percent' ? 'var(--gold-glow)' : '#0b0f19',
                        color: discountType === 'percent' ? '#000' : '#fff',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    {discountType === 'fixed' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === 'percent' ? '100' : balanceDue}
                    value={discountVal}
                    onChange={(e) => setDiscountVal(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Current Net Balance Due: ₹{balanceDue.toFixed(2)}
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Authorized Reason</label>
                  <select
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Managing Director Discretionary Courtesy">MD Courtesy</option>
                    <option value="Corporate Volume Contract Discount">Corporate Volume Partner (JK/GAIL)</option>
                    <option value="Service Quality Recovery Allowance">Service Quality Recovery</option>
                    <option value="Long-Stay Devotee Courtesy">Long-Stay Pilgrim Courtesy</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setDiscountModalOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>
                    Post Allowance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Void / Credit Note Reversal (Section 34 CGST Act) */}
        {voidModalOpen && voidTargetTxn && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2200
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#f87171', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trash2 size={16} /> Issue GST Credit Note / Reversal
                </h4>
                <button onClick={() => setVoidModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmVoid}>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{voidTargetTxn.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Txn ID: {voidTargetTxn.transactionId} • Amount: ₹{voidTargetTxn.debitAmount?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '0.25rem' }}>
                    Section 34 CGST Act: This will create an offsetting Credit Note entry, zeroing out the charge on the folio without deleting the audit trail.
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Mandatory Audit Reason</label>
                  <select
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0b0f19', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Wrong Room Bill Posting Error">Wrong Room Bill Posting Error</option>
                    <option value="Disputed KOT Food Quality Issue">Disputed KOT Food Quality Issue</option>
                    <option value="Late Check-Out Tariff Waived by GM">Late Check-Out Tariff Waived by GM</option>
                    <option value="Duplicate Charge Correction">Duplicate Charge Correction</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setVoidModalOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '0.4rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    Confirm Credit Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
