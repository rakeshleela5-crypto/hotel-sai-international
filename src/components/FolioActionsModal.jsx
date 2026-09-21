import React, { useState } from 'react';
import { 
  X, Check, DollarSign, ArrowRightLeft, Users, Link2, 
  RefreshCw, MinusCircle, PlusCircle, FileText, UserCheck, 
  Split, Building2, Calendar, ShieldCheck, AlertCircle, 
  CreditCard, CheckCircle2, ChevronRight, Tag
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

  // Selected Action Tab (The 12 options from Page 5 of hotel_documents.pdf)
  const [selectedAction, setSelectedAction] = useState('charges'); // 'advance', 'change-room', 'pax-change', 'link-room', 'swap-room', 'paid-out', 'charges', 'allowance', 'remove-tariff', 'edit-guest', 'split-folio'
  const [actionSuccess, setActionSuccess] = useState('');

  // 1. Room Advance Form State
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceMode, setAdvanceMode] = useState('UPI');
  const [advanceRef, setAdvanceRef] = useState('');

  // 2. Change Room Form State
  const [targetRoomNo, setTargetRoomNo] = useState('');
  const [shiftReason, setShiftReason] = useState('Guest Requested Upgrade / Quiet Wing');

  // 3. Pax Change Form State
  const [adultPax, setAdultPax] = useState(room.pax ? parseInt(room.pax) || 1 : 1);
  const [childPax, setChildPax] = useState(0);

  // 4. Link Room Form State
  const [masterCorporate, setMasterCorporate] = useState('CORP-12'); // Linde India Ltd default
  const [linkedRooms, setLinkedRooms] = useState([]);

  // 5. Swap Room Form State
  const [swapTargetRoom, setSwapTargetRoom] = useState('');

  // 6. Paid Out Form State
  const [paidOutAmount, setPaidOutAmount] = useState('');
  const [paidOutPurpose, setPaidOutPurpose] = useState('Taxi Fare to Rayagada Station');
  const [paidOutReceiver, setPaidOutReceiver] = useState('Local Auto/Taxi Driver');

  // 7. Post Charges Form State (Page 4 charges.php)
  const [chargeCategory, setChargeCategory] = useState('FENUGREEK_RESTAURANT');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeRemarks, setChargeRemarks] = useState('');

  // 8. Allowance Form State
  const [allowanceAmount, setAllowanceAmount] = useState('');
  const [allowanceReason, setAllowanceReason] = useState('Commercial Courtesy Discount by GM');

  // 9. Edit Guest Info Form State
  const [guestName, setGuestName] = useState(room.currentGuestName || '');
  const [guestCompany, setGuestCompany] = useState('Linde India Ltd');
  const [guestGstin, setGuestGstin] = useState('21AAACB2528H1ZA');
  const [guestPhone, setGuestPhone] = useState('+91 6305202068');

  // Available vacant rooms for shift
  const vacantRooms = rooms.filter(r => r.status === 'Available');
  // Other occupied rooms for swap
  const otherOccupiedRooms = rooms.filter(r => r.status === 'Occupied' && r.roomNumber !== room.roomNumber);

  const showFeedback = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const handlePostCharge = (e) => {
    e.preventDefault();
    if (!chargeAmount) return;
    const cat = POST_CHARGE_CATEGORIES.find(c => c.id === chargeCategory);
    const amount = Number(chargeAmount);
    showFeedback(`✓ Posted ₹${amount.toFixed(2)} [${cat?.name || chargeCategory}] to Room ${room.roomNumber} folio!`);
    if (onUpdateFolio) {
      onUpdateFolio(room.roomNumber, {
        type: 'CHARGE',
        category: cat?.name || chargeCategory,
        sac: cat?.sac || '996331',
        amount,
        remarks: chargeRemarks
      });
    }
    setChargeAmount('');
    setChargeRemarks('');
  };

  const handleRecordAdvance = (e) => {
    e.preventDefault();
    if (!advanceAmount) return;
    const amount = Number(advanceAmount);
    showFeedback(`✓ Recorded Advance of ₹${amount.toFixed(2)} via ${advanceMode} (Ref: ${advanceRef || 'ADV-' + Date.now().toString().slice(-4)})`);
    if (onUpdateFolio) {
      onUpdateFolio(room.roomNumber, {
        type: 'ADVANCE',
        amount,
        mode: advanceMode,
        ref: advanceRef
      });
    }
    setAdvanceAmount('');
    setAdvanceRef('');
  };

  const handleShiftRoom = (e) => {
    e.preventDefault();
    if (!targetRoomNo) return;
    showFeedback(`✓ Shifted Guest from Room ${room.roomNumber} to Room ${targetRoomNo}. Folio balance transferred.`);
    if (onShiftRoom) {
      onShiftRoom(room.roomNumber, targetRoomNo, shiftReason);
    }
  };

  const handlePaidOut = (e) => {
    e.preventDefault();
    if (!paidOutAmount) return;
    const amount = Number(paidOutAmount);
    showFeedback(`✓ Paid Out ₹${amount.toFixed(2)} disbursed from Front Desk Drawer for ${paidOutPurpose}. Debited to Room ${room.roomNumber}.`);
    if (onUpdateFolio) {
      onUpdateFolio(room.roomNumber, {
        type: 'PAID_OUT',
        amount,
        purpose: paidOutPurpose,
        receiver: paidOutReceiver
      });
    }
    setPaidOutAmount('');
  };

  const handleApplyAllowance = (e) => {
    e.preventDefault();
    if (!allowanceAmount) return;
    const amount = Number(allowanceAmount);
    showFeedback(`✓ Credit Allowance of ₹${amount.toFixed(2)} applied. Approved: ${allowanceReason}.`);
    if (onUpdateFolio) {
      onUpdateFolio(room.roomNumber, {
        type: 'ALLOWANCE',
        amount,
        reason: allowanceReason
      });
    }
    setAllowanceAmount('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.92)',
      backdropFilter: 'blur(10px)',
      zIndex: 2200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1100,
        height: '90vh',
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
                MYSOFT FOLIO CONTROLS (PAGE 5)
              </span>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Room {room.roomNumber} Folio Operations &amp; Edit Actions
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              In-House Guest: <strong style={{ color: '#fff' }}>{room.currentGuestName || 'Guest'}</strong> • Plan: <strong style={{ color: '#fbbf24' }}>CP</strong> • Current Outstanding: <strong style={{ color: '#f87171' }}>₹{(room.balanceDue || room.tariff || 0).toLocaleString('en-IN')}</strong>
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

        {/* Main Body: 2 Columns (Left: 12 MySoft Action Buttons | Right: Active Operation Workspace) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar: The 12 Exact Actions from Page 5 */}
          <div style={{
            width: 260,
            background: 'rgba(8, 12, 22, 0.9)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: '0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.35rem 0.5rem', fontWeight: 700 }}>
              MySoft Operational Actions
            </div>

            {[
              { id: 'charges', label: 'Charges (Post Debit)', icon: PlusCircle, color: '#38bdf8' },
              { id: 'advance', label: 'Room Advance (Deposit)', icon: DollarSign, color: '#34d399' },
              { id: 'change-room', label: 'Change Room (Shift)', icon: ArrowRightLeft, color: '#fbbf24' },
              { id: 'pax-change', label: 'Pax Change', icon: Users, color: '#a78bfa' },
              { id: 'link-room', label: 'Link Room (Corporate)', icon: Link2, color: '#60a5fa' },
              { id: 'swap-room', label: 'Swap Room', icon: RefreshCw, color: '#f472b6' },
              { id: 'paid-out', label: 'Paid Out (Disbursement)', icon: MinusCircle, color: '#f87171' },
              { id: 'allowance', label: 'Allowance (Discount)', icon: Tag, color: '#fb923c' },
              { id: 'remove-tariff', label: 'Remove Tariff (Waiver)', icon: AlertCircle, color: '#cbd5e1' },
              { id: 'edit-guest', label: 'Edit Guest Info', icon: UserCheck, color: '#38bdf8' },
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

          {/* Right Workspace: Selected Action Form */}
          <div style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto' }}>
            {/* ACTION 1: CHARGES (POST DEBIT - Page 4 charges.php) */}
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

            {/* ACTION 2: ROOM ADVANCE (DEPOSIT) */}
            {selectedAction === 'advance' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Record Advance Deposit
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Collect partial payment or security deposit against Room {room.roomNumber} folio.
                </p>

                <form onSubmit={handleRecordAdvance} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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

            {/* ACTION 3: CHANGE ROOM (SHIFT) */}
            {selectedAction === 'change-room' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Change Room (Room Shift)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Seamlessly shift {room.currentGuestName} from Room {room.roomNumber} to another vacant room key.
                </p>

                <form onSubmit={handleShiftRoom} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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

            {/* ACTION 4: PAX CHANGE */}
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

            {/* ACTION 5: LINK ROOM (CORPORATE BILLING) */}
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

                  <div className="form-group">
                    <label className="form-label">Billing Instructions</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue="All room tariffs billed to Company BTC. Meals & extras settled directly by guest."
                    />
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

            {/* ACTION 6: PAID OUT (DISBURSEMENT) */}
            {selectedAction === 'paid-out' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Paid Out (Guest Cash Disbursement)
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Disburse cash from the front desk drawer on behalf of the guest (taxi, medicine, parcel) and debit the room folio.
                </p>

                <form onSubmit={handlePaidOut} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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

            {/* ACTION 7: ALLOWANCE (RATE DISCOUNT / WAIVER) */}
            {selectedAction === 'allowance' && (
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  Rate Allowance / Courtesy Adjustment
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Apply an authorized credit allowance to adjust tariff or compensate for service recovery.
                </p>

                <form onSubmit={handleApplyAllowance} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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

            {/* ACTION 8: EDIT GUEST INFO */}
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

            {/* ACTION 9: SPLIT FOLIO (ROOM VS F&B - Pages 2 & 3) */}
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
                    Folio Split Schedule for Room {room.roomNumber} ({room.currentGuestName || 'P. Ashok'} - Linde India Ltd):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem' }}>
                      <span>Invoice A (Bill #01499): Room Tariff (4 Nights @ ₹2,999)</span>
                      <strong style={{ color: '#fff' }}>₹12,596.00 (SAC 996311)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem' }}>
                      <span>Invoice B (Bill #01500): Fenugreek Restaurant Dining</span>
                      <strong style={{ color: '#34d399' }}>₹962.00 (SAC 996331)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem', fontWeight: 700 }}>
                      <span>Total Consolidated Billing:</span>
                      <strong style={{ color: 'var(--gold-glow)' }}>₹13,558.00</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      if (onOpenSplitInvoice) {
                        onOpenSplitInvoice('room');
                      }
                    }}
                    className="btn-primary-gold"
                  >
                    View / Print Room Invoice (₹12,596)
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenSplitInvoice) {
                        onOpenSplitInvoice('food');
                      }
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
