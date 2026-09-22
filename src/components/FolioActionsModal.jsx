import React, { useState } from 'react';
import { 
  X, Check, DollarSign, ArrowRightLeft, Users, Link2, 
  RefreshCw, MinusCircle, PlusCircle, FileText, UserCheck, 
  Split, Building2, Calendar, ShieldCheck, AlertCircle, 
  CreditCard, CheckCircle2, ChevronRight, Tag, RotateCcw, 
  Receipt, Clock, Lock, CheckCheck
} from 'lucide-react';
import { HOTEL_CONFIG, POST_CHARGE_CATEGORIES, CORPORATE_PARTNERS } from '../data/hotelData';

export default function FolioActionsModal({
  isOpen,
  onClose,
  room,
  rooms = [],
  onUpdateFolio,
  onShiftRoom,
  onCheckoutRoom,
  onOpenSplitInvoice
}) {
  if (!isOpen || !room) return null;

  // Selected Action Tab (Enhanced with Reversals, Multi-Tender Split Settlement, and Late Checkout)
  const [selectedAction, setSelectedAction] = useState('ledger'); // 'ledger', 'charges', 'advance', 'split-settle', 'late-checkout', 'change-room', 'pax-change', 'link-room', 'swap-room', 'paid-out', 'allowance', 'edit-guest', 'split-folio'
  const [actionSuccess, setActionSuccess] = useState('');

  // Live Folio Transactions with Double-Entry Balancing & Reversals
  const [folioTransactions, setFolioTransactions] = useState([
    { id: 'TX-101', date: '17/09/2026', type: 'TARIFF', desc: 'Room Tariff - Executive Room (Day 1)', sac: '996311', debit: 2999.00, credit: 0, operator: 'Sudhakar Reddy' },
    { id: 'TX-102', date: '18/09/2026', type: 'TARIFF', desc: 'Room Tariff - Executive Room (Day 2)', sac: '996311', debit: 2999.00, credit: 0, operator: 'Sudhakar Reddy' },
    { id: 'TX-103', date: '18/09/2026', type: 'DINING', desc: 'Fenugreek Restaurant - KOT #18346 (Veg Fried Rice)', sac: '996331', debit: 294.00, credit: 0, operator: 'Sadananda' },
    { id: 'TX-104', date: '19/09/2026', type: 'TARIFF', desc: 'Room Tariff - Executive Room (Day 3)', sac: '996311', debit: 2999.00, credit: 0, operator: 'Sudhakar Reddy' },
    { id: 'TX-105', date: '19/09/2026', type: 'DINING', desc: 'Fenugreek Restaurant - KOT #18372 (Paneer Tikka + Water)', sac: '996331', debit: 325.50, credit: 0, operator: 'Koti' },
    { id: 'TX-106', date: '20/09/2026', type: 'TARIFF', desc: 'Room Tariff - Executive Room (Day 4)', sac: '996311', debit: 2999.00, credit: 0, operator: 'Sudhakar Reddy' },
    { id: 'TX-107', date: '20/09/2026', type: 'DINING', desc: 'Fenugreek Restaurant - KOT #18401 (Dal Makhani + Naan)', sac: '996331', debit: 325.50, credit: 0, operator: 'Deepak' },
    { id: 'TX-108', date: '17/09/2026', type: 'ADVANCE', desc: 'Check-In Advance (UPI SBI Merchant QR)', sac: '-', debit: 0, credit: 3000.00, operator: 'Front Desk' }
  ]);

  // Reversal Dialog State
  const [reversingTx, setReversingTx] = useState(null);
  const [reversalReason, setReversalReason] = useState('Billed to Wrong Room by Mistake');

  // Multi-Tender Split Settlement State
  const totalDebits = folioTransactions.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCredits = folioTransactions.reduce((sum, tx) => sum + tx.credit, 0);
  const netOutstanding = Math.max(0, totalDebits - totalCredits);

  const [settleCash, setSettleCash] = useState('');
  const [settleUpi, setSettleUpi] = useState('');
  const [settleUpiRef, setSettleUpiRef] = useState('UPI-' + Date.now().toString().slice(-6));
  const [settleCard, setSettleCard] = useState('');
  const [settleCardRef, setSettleCardRef] = useState('AUTH-9412');
  const [settleBtc, setSettleBtc] = useState('');
  const [settleBtcCompany, setSettleBtcCompany] = useState('Linde India Ltd');

  const allocatedTenders = (Number(settleCash) || 0) + (Number(settleUpi) || 0) + (Number(settleCard) || 0) + (Number(settleBtc) || 0);
  const tenderVariance = netOutstanding - allocatedTenders;

  // Late Checkout Calculator State
  const [checkoutTargetTime, setCheckoutTargetTime] = useState('14:30');
  const [lateFeePolicy, setLateFeePolicy] = useState('half-day'); // 'grace', 'half-day', 'full-day'

  // Standard Form States
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceMode, setAdvanceMode] = useState('UPI');
  const [advanceRef, setAdvanceRef] = useState('');

  const [targetRoomNo, setTargetRoomNo] = useState('');
  const [shiftReason, setShiftReason] = useState('Guest Requested Upgrade / Quiet Wing');

  const [adultPax, setAdultPax] = useState(room.pax ? parseInt(room.pax) || 1 : 1);
  const [childPax, setChildPax] = useState(0);

  const [masterCorporate, setMasterCorporate] = useState('CORP-12'); // Linde India Ltd default

  const [paidOutAmount, setPaidOutAmount] = useState('');
  const [paidOutPurpose, setPaidOutPurpose] = useState('Taxi Fare to Rayagada Station');
  const [paidOutReceiver, setPaidOutReceiver] = useState('Local Auto/Taxi Driver');

  const [chargeCategory, setChargeCategory] = useState('FENUGREEK_RESTAURANT');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeRemarks, setChargeRemarks] = useState('');

  const [allowanceAmount, setAllowanceAmount] = useState('');
  const [allowanceReason, setAllowanceReason] = useState('Commercial Courtesy Discount by GM');

  const [guestName, setGuestName] = useState(room.currentGuestName || 'MR. P ASHOK');
  const [guestCompany, setGuestCompany] = useState('Linde India Ltd');
  const [guestGstin, setGuestGstin] = useState('21AAACB2528H1ZA');
  const [guestPhone, setGuestPhone] = useState('+91 6305202068');

  // Available vacant rooms for shift
  const vacantRooms = rooms.filter(r => r.status === 'Available');

  const showFeedback = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // 1. Post Charge
  const handlePostCharge = (e) => {
    e.preventDefault();
    if (!chargeAmount) return;
    const cat = POST_CHARGE_CATEGORIES.find(c => c.id === chargeCategory);
    const amount = Number(chargeAmount);

    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: chargeCategory,
      desc: `${cat?.name || chargeCategory} (${chargeRemarks || 'Front Office Charge'})`,
      sac: cat?.sac || '996331',
      debit: amount,
      credit: 0,
      operator: 'Duty Manager'
    };

    setFolioTransactions([newTx, ...folioTransactions]);
    showFeedback(`✓ Posted ₹${amount.toFixed(2)} [${cat?.name || chargeCategory}] to Room ${room.roomNumber} folio!`);
    setChargeAmount('');
    setChargeRemarks('');
  };

  // 2. Void / Reversal (Double-Entry Balancing Memo)
  const handleConfirmReversal = (e) => {
    e.preventDefault();
    if (!reversingTx) return;

    const balancingCreditMemo = {
      id: `REV-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: 'REVERSAL',
      desc: `↩️ Reversal of ${reversingTx.desc} [Reason: ${reversalReason}]`,
      sac: reversingTx.sac,
      debit: 0,
      credit: reversingTx.debit, // Balances the original debit exactly!
      operator: 'Authorized Auditor'
    };

    setFolioTransactions([balancingCreditMemo, ...folioTransactions]);
    showFeedback(`✓ Reversed Transaction ${reversingTx.id}! Balancing credit memo of ₹${reversingTx.debit.toFixed(2)} posted.`);
    setReversingTx(null);
  };

  // 3. Multi-Tender Split Settlement Execution
  const handleCompleteSplitCheckout = () => {
    if (Math.abs(tenderVariance) > 1) {
      alert(`Cannot settle folio: Tender variance of ₹${tenderVariance.toFixed(2)} remaining. Total allocated must equal ₹${netOutstanding.toFixed(2)}.`);
      return;
    }

    const tendersSummary = [];
    if (Number(settleCash) > 0) tendersSummary.push(`Cash: ₹${settleCash}`);
    if (Number(settleUpi) > 0) tendersSummary.push(`UPI: ₹${settleUpi} (${settleUpiRef})`);
    if (Number(settleCard) > 0) tendersSummary.push(`Card: ₹${settleCard} (${settleCardRef})`);
    if (Number(settleBtc) > 0) tendersSummary.push(`BTC: ₹${settleBtc} (${settleBtcCompany})`);

    const settlementTx = {
      id: `SETTLE-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: 'SETTLEMENT',
      desc: `Full Checkout Settlement [${tendersSummary.join(' + ')}]`,
      sac: '-',
      debit: 0,
      credit: allocatedTenders,
      operator: 'Front Desk Lead'
    };

    setFolioTransactions([settlementTx, ...folioTransactions]);
    showFeedback(`✓ Succeeded! Room ${room.roomNumber} folio settled across ${tendersSummary.length} payment tenders. Room released to Cleaning.`);

    if (onCheckoutRoom) {
      onCheckoutRoom(room.roomNumber);
    }
  };

  // 4. Apply Late Checkout Surcharge
  const handleApplyLateCheckout = () => {
    const baseTariff = room.tariff || 2999;
    let fee = 0;
    let desc = '';

    if (lateFeePolicy === 'grace') {
      fee = 0;
      desc = `Late Checkout Grace Period until ${checkoutTargetTime} (Waiver by GM)`;
    } else if (lateFeePolicy === 'half-day') {
      fee = baseTariff * 0.5;
      desc = `Late Checkout Surcharge (Half-Day 50% Tariff until ${checkoutTargetTime})`;
    } else {
      fee = baseTariff;
      desc = `Late Checkout Surcharge (Full Day 100% Tariff after 18:00 PM)`;
    }

    if (fee > 0) {
      const lateTx = {
        id: `LATE-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString('en-IN'),
        type: 'LATE_CHECKOUT',
        desc,
        sac: '996311',
        debit: fee,
        credit: 0,
        operator: 'Duty Manager'
      };
      setFolioTransactions([lateTx, ...folioTransactions]);
      showFeedback(`✓ Added ${desc} of ₹${fee.toFixed(2)} to Room ${room.roomNumber} folio.`);
    } else {
      showFeedback(`✓ Grace period extension granted until ${checkoutTargetTime}. Zero surcharge applied.`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.94)',
      backdropFilter: 'blur(12px)',
      zIndex: 2200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1180,
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        boxShadow: '0 25px 70px rgba(0,0,0,0.9)',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          background: 'linear-gradient(90deg, rgba(20,25,48,0.98), rgba(12,16,32,0.99))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #60a5fa', fontWeight: 700 }}>
                ENTERPRISE FOLIO CONTROLS
              </span>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Room {room.roomNumber} Folio Operations &amp; Edit Console
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Guest: <strong style={{ color: '#fff' }}>{guestName}</strong> • Company: <strong style={{ color: '#fbbf24' }}>{guestCompany}</strong> • Net Outstanding: <strong style={{ color: netOutstanding > 0 ? '#f87171' : '#34d399', fontSize: '0.95rem' }}>₹{netOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              width: 34,
              height: 34,
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

        {/* Action Feedback Banner */}
        {actionSuccess && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.15)',
            borderBottom: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            padding: '0.65rem 1.75rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} /> {actionSuccess}
          </div>
        )}

        {/* Main Body: 2 Columns */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar: Operational Actions Menu */}
          <div style={{
            width: 270,
            background: 'rgba(8, 12, 22, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: '0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.35rem 0.5rem', fontWeight: 700 }}>
              Primary Folio Actions
            </div>

            {[
              { id: 'ledger', label: 'Folio Ledger & Voids', icon: Receipt, color: '#38bdf8' },
              { id: 'split-settle', label: 'Split-Tender Settlement', icon: CheckCheck, color: '#34d399' },
              { id: 'late-checkout', label: 'Late Checkout Calculator', icon: Clock, color: '#fbbf24' },
              { id: 'charges', label: 'Post Debit Charge', icon: PlusCircle, color: '#38bdf8' },
              { id: 'advance', label: 'Room Advance (Deposit)', icon: DollarSign, color: '#34d399' },
              { id: 'change-room', label: 'Change Room (Shift)', icon: ArrowRightLeft, color: '#fbbf24' },
              { id: 'pax-change', label: 'Pax Change', icon: Users, color: '#a78bfa' },
              { id: 'link-room', label: 'Link Corporate BTC', icon: Link2, color: '#60a5fa' },
              { id: 'paid-out', label: 'Paid Out (Drawer Cash)', icon: MinusCircle, color: '#f87171' },
              { id: 'allowance', label: 'Allowance (Discount)', icon: Tag, color: '#fb923c' },
              { id: 'edit-guest', label: 'Edit Guest & GSTIN', icon: UserCheck, color: '#38bdf8' },
              { id: 'split-folio', label: 'Split Folio (Room vs F&B)', icon: Split, color: '#34d399' }
            ].map(act => {
              const Icon = act.icon;
              const isActive = selectedAction === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setSelectedAction(act.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                    color: isActive ? 'var(--gold-glow)' : '#cbd5e1',
                    border: isActive ? '1px solid var(--gold-glow)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} color={isActive ? 'var(--gold-glow)' : act.color} />
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Workspace: Selected Action Details */}
          <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>
            {/* ACTION: LIVE FOLIO LEDGER & REVERSAL / VOID (IDS Next Standard) */}
            {selectedAction === 'ledger' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                      Itemized Folio Ledger &amp; Audited Reversals
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Click "↩️ Void / Reverse" on any erroneous line item to post a balancing credit memo without deleting records.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAction('charges')}
                    className="btn-primary-gold"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                  >
                    + Post New Charge
                  </button>
                </div>

                {/* Ledger Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.7rem' }}>Date / Tx #</th>
                      <th style={{ padding: '0.7rem' }}>Description &amp; Details</th>
                      <th style={{ padding: '0.7rem', textAlign: 'center' }}>SAC</th>
                      <th style={{ padding: '0.7rem', textAlign: 'right' }}>Debit (₹)</th>
                      <th style={{ padding: '0.7rem', textAlign: 'right' }}>Credit (₹)</th>
                      <th style={{ padding: '0.7rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folioTransactions.map(tx => {
                      const isReversal = tx.type === 'REVERSAL';
                      const isAdvance = tx.type === 'ADVANCE' || tx.type === 'SETTLEMENT';
                      return (
                        <tr key={tx.id} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isReversal ? 'rgba(244, 63, 94, 0.05)' : 'transparent'
                        }}>
                          <td style={{ padding: '0.7rem' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{tx.date}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.id}</div>
                          </td>
                          <td style={{ padding: '0.7rem' }}>
                            <div style={{ fontWeight: 600, color: isReversal ? '#f43f5e' : '#f8fafc' }}>
                              {tx.desc}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Operator: {tx.operator}
                            </div>
                          </td>
                          <td style={{ padding: '0.7rem', textAlign: 'center', fontFamily: 'monospace', color: '#fbbf24' }}>
                            {tx.sac}
                          </td>
                          <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: 600, color: tx.debit > 0 ? '#f87171' : 'var(--text-muted)' }}>
                            {tx.debit > 0 ? `₹${tx.debit.toFixed(2)}` : '-'}
                          </td>
                          <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: 600, color: tx.credit > 0 ? '#34d399' : 'var(--text-muted)' }}>
                            {tx.credit > 0 ? `₹${tx.credit.toFixed(2)}` : '-'}
                          </td>
                          <td style={{ padding: '0.7rem', textAlign: 'center' }}>
                            {tx.debit > 0 && !isReversal && (
                              <button
                                onClick={() => setReversingTx(tx)}
                                title="Reverse this charge with credit memo"
                                style={{
                                  padding: '3px 7px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  background: 'rgba(244, 63, 94, 0.2)',
                                  color: '#f43f5e',
                                  border: '1px solid rgba(244, 63, 94, 0.4)',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                ↩️ Void / Reverse
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(212, 175, 55, 0.08)', fontWeight: 800 }}>
                      <td colSpan="3" style={{ padding: '0.75rem', color: 'var(--gold-glow)' }}>
                        CURRENT NET OUTSTANDING (INR):
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171' }}>
                        ₹{totalDebits.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399' }}>
                        ₹{totalCredits.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--gold-glow)', fontSize: '1rem' }}>
                        ₹{netOutstanding.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Reversal Confirmation Dialog */}
                {reversingTx && (
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <RotateCcw size={18} color="#f43f5e" />
                      <strong style={{ color: '#f43f5e', fontSize: '0.95rem' }}>
                        Reverse Charge: {reversingTx.desc} (₹{reversingTx.debit.toFixed(2)})
                      </strong>
                    </div>

                    <form onSubmit={handleConfirmReversal} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className="form-group">
                        <label className="form-label">Mandatory Audit Reversal Reason</label>
                        <select
                          className="form-select"
                          value={reversalReason}
                          onChange={(e) => setReversalReason(e.target.value)}
                        >
                          <option value="Billed to Wrong Room by Mistake">Billed to Wrong Room by Mistake</option>
                          <option value="Guest Billing Dispute Resolved by GM">Guest Billing Dispute Resolved by GM</option>
                          <option value="Duplicate Order Punched in POS">Duplicate Order Punched in POS</option>
                          <option value="Service Quality Courtesy Waiver">Service Quality Courtesy Waiver</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button type="submit" className="btn-primary-gold" style={{ background: '#f43f5e', borderColor: '#f43f5e' }}>
                          Confirm Reversal Memo (-₹{reversingTx.debit.toFixed(2)})
                        </button>
                        <button type="button" onClick={() => setReversingTx(null)} className="btn-outline-gold">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ACTION: MULTI-TENDER SPLIT SETTLEMENT */}
            {selectedAction === 'split-settle' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Multi-Tender Split Settlement at Checkout
                </h3>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Split the guest's folio payment across Cash, UPI (PhonePe), Card Swipe, and Corporate Credit (Linde/JK Paper).
                </p>

                {/* Net Due Summary Card */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-glow)', textTransform: 'uppercase' }}>Total Folio Balance Payable</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                      ₹{netOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: tenderVariance === 0 ? '#34d399' : '#f87171', textTransform: 'uppercase', fontWeight: 700 }}>
                      {tenderVariance === 0 ? '✓ 100% Balanced' : `Unallocated Variance: ₹${tenderVariance.toFixed(2)}`}
                    </span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Total Allocated: ₹{allocatedTenders.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Split Tender Form */}
                <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Tender 1: Cash */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      💵 Tender 1: Physical Cash (Front Desk Drawer)
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 1000.00"
                      value={settleCash}
                      onChange={(e) => setSettleCash(e.target.value)}
                    />
                  </div>

                  {/* Tender 2: UPI */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      📱 Tender 2: UPI / QR Payment (PhonePe, GooglePay, Paytm)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="UPI Amount (₹)"
                        value={settleUpi}
                        onChange={(e) => setSettleUpi(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Bank UTR / Ref #"
                        value={settleUpiRef}
                        onChange={(e) => setSettleUpiRef(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tender 3: Card Swipe */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      💳 Tender 3: Credit / Debit Card Swipe (POS Terminal)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Card Amount (₹)"
                        value={settleCard}
                        onChange={(e) => setSettleCard(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Auth Code / Terminal Batch"
                        value={settleCardRef}
                        onChange={(e) => setSettleCardRef(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tender 4: Corporate Credit (BTC) */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      🏢 Tender 4: Bill To Company (BTC Corporate Ledger)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="BTC Billed Amount (₹)"
                        value={settleBtc}
                        onChange={(e) => setSettleBtc(e.target.value)}
                      />
                      <select
                        className="form-select"
                        value={settleBtcCompany}
                        onChange={(e) => setSettleBtcCompany(e.target.value)}
                      >
                        {CORPORATE_PARTNERS.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleCompleteSplitCheckout}
                    disabled={Math.abs(tenderVariance) > 1}
                    className="btn-primary-gold"
                    style={{
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      opacity: Math.abs(tenderVariance) <= 1 ? 1 : 0.5,
                      cursor: Math.abs(tenderVariance) <= 1 ? 'pointer' : 'not-allowed',
                      marginTop: '0.5rem'
                    }}
                  >
                    Complete Split-Tender Checkout &amp; Release Key
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: LATE CHECKOUT & 24-HOUR CYCLE CALCULATOR */}
            {selectedAction === 'late-checkout' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  24-Hour Cycle &amp; Late Checkout Surcharge Calculator
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Standard checkout is 12:00 PM (or 24-hour cycle from arrival). Calculate half-day (50%) or full-day extension charges.
                </p>

                <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Requested Departure Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={checkoutTargetTime}
                      onChange={(e) => setCheckoutTargetTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Late Checkout Policy</label>
                    <select
                      className="form-select"
                      value={lateFeePolicy}
                      onChange={(e) => setLateFeePolicy(e.target.value)}
                    >
                      <option value="grace">Grace Period (Free Extension until 14:00 PM - GM Courtesy)</option>
                      <option value="half-day">Half-Day Tariff (+50% Base Room Rate - Until 18:00 PM)</option>
                      <option value="full-day">Full-Day Tariff (+100% Base Room Rate - Post 18:00 PM)</option>
                    </select>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span>Base Room Tariff:</span>
                      <strong style={{ color: '#fff' }}>₹{room.tariff || 2999}.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 700 }}>
                      <span>Applicable Surcharge:</span>
                      <span>
                        {lateFeePolicy === 'grace' ? '₹0.00 (Waiver)' : lateFeePolicy === 'half-day' ? `+ ₹${((room.tariff || 2999) * 0.5).toFixed(2)} (50%)` : `+ ₹${(room.tariff || 2999).toFixed(2)} (100%)`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleApplyLateCheckout}
                    className="btn-primary-gold"
                    style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                  >
                    Apply Extension Policy to Folio
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: CHARGES (POST DEBIT) */}
            {selectedAction === 'charges' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Post Manual Folio Charge (MySoft charges.php)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Post dining, laundry, extra bed, or miscellaneous charges directly to Room {room.roomNumber} folio.
                </p>

                <form onSubmit={handlePostCharge} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Charge Category / Service Ledger</label>
                    <select
                      className="form-select"
                      value={chargeCategory}
                      onChange={(e) => setChargeCategory(e.target.value)}
                    >
                      {POST_CHARGE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (SAC {cat.sac} • {cat.taxRate}% GST)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Charge Amount Base (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 962.00"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Voucher / KOT Reference No.</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. KOT-F2627-18346"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service Description / Remarks</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Fenugreek Restaurant Dinner - Veg Fried Rice + Mineral Water"
                      value={chargeRemarks}
                      onChange={(e) => setChargeRemarks(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Post Charge to Folio
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: ROOM ADVANCE */}
            {selectedAction === 'advance' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Record Advance Deposit
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Collect partial payment or security deposit against Room {room.roomNumber} folio.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!advanceAmount) return;
                  const amt = Number(advanceAmount);
                  const newAdvTx = {
                    id: `ADV-${Date.now().toString().slice(-4)}`,
                    date: new Date().toLocaleDateString('en-IN'),
                    type: 'ADVANCE',
                    desc: `Advance Deposit (${advanceMode} • Ref: ${advanceRef || 'Direct'})`,
                    sac: '-',
                    debit: 0,
                    credit: amt,
                    operator: 'Duty Manager'
                  };
                  setFolioTransactions([newAdvTx, ...folioTransactions]);
                  showFeedback(`✓ Recorded Advance of ₹${amt.toFixed(2)} via ${advanceMode}.`);
                  setAdvanceAmount('');
                }} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Advance Amount Received (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 5000.00"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Payment Tender Mode</label>
                      <select
                        className="form-select"
                        value={advanceMode}
                        onChange={(e) => setAdvanceMode(e.target.value)}
                      >
                        <option value="UPI">UPI (PhonePe / GooglePay / SBI QR)</option>
                        <option value="Cash">Cash (Front Desk Physical Drawer)</option>
                        <option value="Card">Card Swipe (HDFC / Axis POS)</option>
                        <option value="NEFT">NEFT / RTGS Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transaction / Bank UTR Reference</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. SBI-UPI-884129384729"
                      value={advanceRef}
                      onChange={(e) => setAdvanceRef(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Record &amp; Print Advance Receipt
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: CHANGE ROOM (SHIFT) */}
            {selectedAction === 'change-room' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Change Room (Room Shift)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Seamlessly shift {guestName} from Room {room.roomNumber} to another vacant room key.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!targetRoomNo) return;
                  showFeedback(`✓ Shifted Guest from Room ${room.roomNumber} to Room ${targetRoomNo}. Folio balance transferred.`);
                  if (onShiftRoom) onShiftRoom(room.roomNumber, targetRoomNo, shiftReason);
                }} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Target Vacant Room</label>
                    <select
                      className="form-select"
                      value={targetRoomNo}
                      onChange={(e) => setTargetRoomNo(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Key from {vacantRooms.length} Vacant Keys --</option>
                      {vacantRooms.map(r => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room {r.roomNumber} (Floor {r.floor} • {r.tier} - ₹{r.tariff}/night)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reason for Room Shift</label>
                    <select
                      className="form-select"
                      value={shiftReason}
                      onChange={(e) => setShiftReason(e.target.value)}
                    >
                      <option value="Guest Requested Upgrade / Quiet Wing">Guest Requested Upgrade / Quiet Wing</option>
                      <option value="AC Maintenance / Technical Issue (AC PRBLM)">AC Maintenance / Technical Issue (AC PRBLM)</option>
                      <option value="Plumbing Issue">Plumbing Issue</option>
                      <option value="Extended Stay Extension">Extended Stay Extension</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Confirm Room Shift &amp; Transfer Folio
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: PAX CHANGE */}
            {selectedAction === 'pax-change' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Pax Change (Adults / Children)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Update guest occupancy numbers for Room {room.roomNumber} and recalculate meal plan allowances.
                </p>

                <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Adults Count</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        className="form-input"
                        value={adultPax}
                        onChange={(e) => setAdultPax(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Children Count</label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        className="form-input"
                        value={childPax}
                        onChange={(e) => setChildPax(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => showFeedback(`✓ Occupancy updated to ${adultPax} Adults + ${childPax} Children.`)}
                    className="btn-primary-gold"
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                  >
                    Save Pax Configuration
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: LINK ROOM (CORPORATE BILLING) */}
            {selectedAction === 'link-room' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Link Room to Corporate Master Account
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Combine multiple rooms under a master corporate credit ledger (e.g. Linde India Ltd, JK Paper, Ashok Leyland).
                </p>

                <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Master Corporate Partner</label>
                    <select
                      className="form-select"
                      value={masterCorporate}
                      onChange={(e) => setMasterCorporate(e.target.value)}
                    >
                      {CORPORATE_PARTNERS.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.gstin})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => showFeedback(`✓ Room ${room.roomNumber} linked to corporate account!`)}
                    className="btn-primary-gold"
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                  >
                    Link to Corporate Ledger
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: PAID OUT (DRAWER CASH) */}
            {selectedAction === 'paid-out' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Paid Out (Guest Cash Disbursement)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Disburse cash from the front desk drawer on behalf of the guest (taxi, medicine, parcel) and debit the room folio.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!paidOutAmount) return;
                  const amt = Number(paidOutAmount);
                  const paidOutTx = {
                    id: `PO-${Date.now().toString().slice(-4)}`,
                    date: new Date().toLocaleDateString('en-IN'),
                    type: 'PAID_OUT',
                    desc: `Paid Out: ${paidOutPurpose} (Paid to ${paidOutReceiver})`,
                    sac: '000000',
                    debit: amt,
                    credit: 0,
                    operator: 'Duty Manager'
                  };
                  setFolioTransactions([paidOutTx, ...folioTransactions]);
                  showFeedback(`✓ Paid Out ₹${amt.toFixed(2)} disbursed from Front Desk Drawer.`);
                  setPaidOutAmount('');
                }} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Cash Amount Disbursed (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 500.00"
                        value={paidOutAmount}
                        onChange={(e) => setPaidOutAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Receiver Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={paidOutReceiver}
                        onChange={(e) => setPaidOutReceiver(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Disbursement Purpose</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paidOutPurpose}
                      onChange={(e) => setPaidOutPurpose(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Disburse Cash &amp; Debit Folio
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: ALLOWANCE (RATE DISCOUNT) */}
            {selectedAction === 'allowance' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Rate Allowance / Courtesy Adjustment
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Apply an authorized credit allowance to adjust tariff or compensate for service recovery.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!allowanceAmount) return;
                  const amt = Number(allowanceAmount);
                  const allowTx = {
                    id: `ALW-${Date.now().toString().slice(-4)}`,
                    date: new Date().toLocaleDateString('en-IN'),
                    type: 'ALLOWANCE',
                    desc: `Credit Allowance (${allowanceReason})`,
                    sac: '996311',
                    debit: 0,
                    credit: amt,
                    operator: 'General Manager'
                  };
                  setFolioTransactions([allowTx, ...folioTransactions]);
                  showFeedback(`✓ Credit Allowance of ₹${amt.toFixed(2)} applied.`);
                  setAllowanceAmount('');
                }} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Allowance Amount to Credit (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 500.00"
                      value={allowanceAmount}
                      onChange={(e) => setAllowanceAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manager Approval &amp; Reason</label>
                    <input
                      type="text"
                      className="form-input"
                      value={allowanceReason}
                      onChange={(e) => setAllowanceReason(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-gold" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                    Apply Credit Allowance
                  </button>
                </form>
              </div>
            )}

            {/* ACTION: EDIT GUEST INFO */}
            {selectedAction === 'edit-guest' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Edit In-House Guest Profile
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Update guest details, GSTIN, phone, and corporate designation post check-in.
                </p>

                <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Guest Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Company / Organisation</label>
                      <input
                        type="text"
                        className="form-input"
                        value={guestCompany}
                        onChange={(e) => setGuestCompany(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Corporate GSTIN</label>
                      <input
                        type="text"
                        className="form-input"
                        value={guestGstin}
                        onChange={(e) => setGuestGstin(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={() => showFeedback(`✓ Guest profile updated for ${guestName} (${guestCompany})!`)}
                    className="btn-primary-gold"
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: SPLIT FOLIO (ROOM VS F&B) */}
            {selectedAction === 'split-folio' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Corporate Split Billing (Room vs Food Invoices)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Pages 2 &amp; 3 of hotel_documents.pdf: Automatically splits Room Tariff (SAC 996311) to Corporate BTC and Fenugreek Restaurant Dining (SAC 996331) to Guest Direct settlement.
                </p>

                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  maxWidth: 620,
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
                    Folio Split Schedule for Room {room.roomNumber} ({guestName} - {guestCompany}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem' }}>
                      <span>Invoice A (Bill #01499): Room Tariff (SAC 996311)</span>
                      <strong style={{ color: '#fff' }}>₹12,596.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem' }}>
                      <span>Invoice B (Bill #01500): Fenugreek Restaurant Dining (SAC 996331)</span>
                      <strong style={{ color: '#34d399' }}>₹962.00</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      if (onOpenSplitInvoice) onOpenSplitInvoice('room');
                    }}
                    className="btn-primary-gold"
                  >
                    View / Print Room Invoice (₹12,596)
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenSplitInvoice) onOpenSplitInvoice('food');
                    }}
                    className="btn-secondary-sapphire"
                  >
                    View / Print Food Invoice (₹962)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
