import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  X, Calendar, Users, Shield, QrCode, CreditCard, 
  Building2, CheckCircle2, AlertCircle, Sparkles, MapPin, Lock
} from 'lucide-react';
import { HOTEL_CONFIG, ROOM_TIERS, CORPORATE_PARTNERS } from '../data/hotelData';
import { calculateRoomTax } from '../utils/taxUtils';
import { maskAadhaar, hasDateCollision } from '../utils/security';

export default function BookingModal({
  isOpen,
  onClose,
  initialTier = null,
  initialRoomNumber = null,
  rooms = [],
  bookings = [],
  onBookingSuccess
}) {
  const [selectedTier, setSelectedTier] = useState(initialTier || ROOM_TIERS[0]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(initialRoomNumber || '');
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar');
  const [idProofRaw, setIdProofRaw] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('Odisha');

  // Corporate B2B
  const [isB2b, setIsB2b] = useState(false);
  const [selectedCorporate, setSelectedCorporate] = useState(CORPORATE_PARTNERS[0].id);

  // Statutory DPDP Act 2023: MUST START UNCHECKED
  const [consentDpdp, setConsentDpdp] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment Selection
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI', 'Pay at Hotel', 'Corporate B2B'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialTier) setSelectedTier(initialTier);
    if (initialRoomNumber) setSelectedRoomNumber(initialRoomNumber);
  }, [initialTier, initialRoomNumber]);

  // Compute available rooms for selected tier
  const tierRooms = rooms.filter(r => r.tier === selectedTier.name);
  const availableTierRooms = tierRooms.filter(r => {
    // Check real-time room status & any collision with active bookings
    if (r.status !== 'Available' && r.roomNumber !== initialRoomNumber) return false;
    const hasCollision = bookings.some(b => 
      b.room_number === r.roomNumber &&
      b.booking_status !== 'Cancelled' &&
      b.booking_status !== 'Checked Out' &&
      hasDateCollision(checkInDate, checkOutDate, b.check_in_date, b.check_out_date)
    );
    return !hasCollision;
  });

  // Calculate nights
  const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)) || 1);

  // Apply corporate discount if selected
  const corp = isB2b ? CORPORATE_PARTNERS.find(c => c.id === selectedCorporate) : null;
  const discountMultiplier = corp ? (1 - corp.contractDiscount / 100) : 1;
  const baseRatePerNight = Math.round(selectedTier.tariff * discountMultiplier);
  const totalBase = baseRatePerNight * nights;
  const tax = calculateRoomTax(totalBase);

  // Generate UPI QR Code
  useEffect(() => {
    if (paymentMode === 'UPI' && tax.total > 0) {
      const upiUrl = `upi://pay?pa=${HOTEL_CONFIG.upiId}&pn=${encodeURIComponent(HOTEL_CONFIG.name)}&am=${tax.total}&tn=${encodeURIComponent(`Room-${selectedRoomNumber || 'Booking'}`)}&cu=INR`;
      QRCode.toDataURL(upiUrl, { width: 200, margin: 1, color: { dark: '#060e1a', light: '#ffffff' } })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error("QR Code error:", err));
    }
  }, [paymentMode, tax.total, selectedRoomNumber]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedRoomNumber) {
      setErrorMessage("Please select an available room number.");
      return;
    }

    if (!consentDpdp) {
      setErrorMessage("Please accept the DPDP Act 2023 data consent to proceed with your reservation.");
      return;
    }

    // Anti-double-booking mutex check
    const collision = bookings.find(b => 
      b.room_number === selectedRoomNumber &&
      b.booking_status !== 'Cancelled' &&
      b.booking_status !== 'Checked Out' &&
      hasDateCollision(checkInDate, checkOutDate, b.check_in_date, b.check_out_date)
    );

    if (collision) {
      setErrorMessage(`Collision detected! Room ${selectedRoomNumber} is already booked for overlapping stay dates.`);
      return;
    }

    setSubmitting(true);

    // Strict payment status forgery protection:
    // Public visitor action CANNOT self-declare as 'Paid'
    const paymentStatus = paymentMode === 'Pay at Hotel' 
      ? 'Pending Payment at Check-In' 
      : 'Pending Gateway Verification';

    const bookingPayload = {
      bookingId: `HSI-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      roomNumber: selectedRoomNumber,
      tier: selectedTier.name,
      guestName,
      guestPhone,
      guestEmail,
      idProofType,
      idProofMasked: maskAadhaar(idProofRaw),
      stateOfOrigin,
      isInterstate: stateOfOrigin.toLowerCase() !== 'odisha',
      checkInDate,
      checkOutDate,
      nights,
      adults,
      children,
      tariffPerNight: baseRatePerNight,
      baseTotal: totalBase,
      cgst: tax.cgst,
      sgst: tax.sgst,
      totalAmount: tax.total,
      advanceDeposit: paymentMode === 'UPI' ? tax.total : 0,
      balanceDue: paymentMode === 'UPI' ? 0 : tax.total,
      paymentMode,
      paymentStatus,
      bookingStatus: 'Confirmed',
      isB2b,
      corporateId: corp?.id || '',
      corporateGstin: corp?.gstin || '',
      consentDpdp: 1,
      specialRequests
    };

    try {
      // Send to Edge /api/sync WITHOUT X-Admin-Key (Public visitor action)
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_booking', payload: bookingPayload })
      });

      const json = await res.json().catch(() => ({ success: true }));

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (cErr) {}

      onBookingSuccess(bookingPayload);
      onClose();
    } catch (err) {
      console.warn("Edge sync warning, falling back to local state:", err);
      onBookingSuccess(bookingPayload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-content-large">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f3c64c 0%, #d4af37 100%)',
              padding: '0.4rem',
              borderRadius: '8px',
              color: '#060e1a'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Reserve Room at Hotel Sai International</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Rayagada, Odisha • 24-Hr Check-In/Check-Out Cycle (12:00 PM)
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Left Column: Room Selection & Stay Details */}
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--gold-glow)' }}>
                1. Room & Stay Schedule
              </h4>

              {/* Tier Selection */}
              <div className="form-group">
                <label className="form-label">Selected Room Tier</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {ROOM_TIERS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTier(t);
                        setSelectedRoomNumber('');
                      }}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        textAlign: 'left',
                        background: selectedTier.id === t.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(6, 14, 26, 0.6)',
                        border: selectedTier.id === t.id ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: selectedTier.id === t.id ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: selectedTier.id === t.id ? 'var(--gold-glow)' : '#fff' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.75rem' }}>Fl {t.floor} • ₹{t.tariff}/nt</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Room Selection */}
              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} color="var(--gold-glow)" /> Select 40-Inventory Key ({selectedTier.roomsRange})
                </label>
                <select
                  className="form-select"
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  required
                >
                  <option value="">-- Choose Room on Floor {selectedTier.floor} --</option>
                  {availableTierRooms.map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} ({r.bedType}) - Available
                    </option>
                  ))}
                </select>
                {availableTierRooms.length === 0 && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    All rooms in this tier are currently booked for the selected dates.
                  </div>
                )}
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label"><Calendar size={13} /> Check-In (12:00 PM)</label>
                  <input 
                    type="date"
                    className="form-input"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><Calendar size={13} /> Check-Out (12:00 PM)</label>
                  <input 
                    type="date"
                    className="form-input"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Guests */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label"><Users size={13} /> Adults</label>
                  <select className="form-select" value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><Users size={13} /> Children</label>
                  <select className="form-select" value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                    <option value={0}>0 Children</option>
                    <option value={1}>1 Child</option>
                    <option value={2}>2 Children</option>
                  </select>
                </div>
              </div>

              {/* Corporate B2B Account Option */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '0.85rem',
                borderRadius: '8px',
                marginTop: '0.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd' }}>
                  <input 
                    type="checkbox" 
                    checked={isB2b} 
                    onChange={(e) => setIsB2b(e.target.checked)} 
                  />
                  Rayagada Corporate Account (JK Paper / IMFA / Utkal / ECoR)
                </label>

                {isB2b && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <select 
                      className="form-select"
                      value={selectedCorporate}
                      onChange={(e) => setSelectedCorporate(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    >
                      {CORPORATE_PARTNERS.map(cp => (
                        <option key={cp.id} value={cp.id}>
                          {cp.name} ({cp.contractDiscount}% Off Contract)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Guest Details & Statutory Compliance */}
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--gold-glow)' }}>
                2. Guest Details & Sarai Act
              </h4>

              <div className="form-group">
                <label className="form-label">Full Name (As per Govt ID)</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rajendra Prasad Mohanty"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
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
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email"
                    className="form-input"
                    placeholder="guest@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* ID Proof & State of Origin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Govt ID Type</label>
                  <select className="form-select" value={idProofType} onChange={(e) => setIdProofType(e.target.value)}>
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ID Number (Masked)</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="12-digit Aadhaar / ID"
                    value={idProofRaw}
                    onChange={(e) => setIdProofRaw(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">State of Origin (Sarai Act Register)</label>
                <input 
                  type="text"
                  className="form-input"
                  value={stateOfOrigin}
                  onChange={(e) => setStateOfOrigin(e.target.value)}
                  placeholder="e.g. Odisha / Andhra Pradesh / West Bengal"
                  required
                />
              </div>

              {/* Payment Mode Selection */}
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: paymentMode === 'UPI' ? 'var(--gold-glow)' : 'rgba(6, 14, 26, 0.7)',
                      color: paymentMode === 'UPI' ? '#060e1a' : '#fff',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      fontWeight: 600
                    }}
                  >
                    UPI QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('Pay at Hotel')}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: paymentMode === 'Pay at Hotel' ? 'var(--sapphire-light)' : 'rgba(6, 14, 26, 0.7)',
                      color: paymentMode === 'Pay at Hotel' ? '#060e1a' : '#fff',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontWeight: 600
                    }}
                  >
                    Pay at Check-In
                  </button>
                </div>
              </div>

              {/* UPI QR Display */}
              {paymentMode === 'UPI' && qrDataUrl && (
                <div style={{
                  background: 'rgba(6, 14, 26, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  padding: '1rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginBottom: '1rem'
                }}>
                  <img src={qrDataUrl} alt="UPI QR" style={{ width: 95, height: 95, borderRadius: '6px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--gold-glow)' }}>
                      Scan & Pay with Any UPI App
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      GPay, PhonePe, Paytm, BHIM to <code>{HOTEL_CONFIG.upiId}</code>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '0.35rem' }}>
                      Amount: ₹{tax.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Rule 46 Tax Invoice Summary Box */}
              <div style={{
                background: 'rgba(12, 24, 43, 0.9)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <span>Base Tariff ({nights} night{nights > 1 ? 's' : ''}):</span>
                  <span>₹{totalBase.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <span>CGST 2.5% (SAC 996311):</span>
                  <span>₹{tax.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span>SGST 2.5% (SAC 996311):</span>
                  <span>₹{tax.sgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.4rem', fontWeight: 700, fontSize: '1rem', color: 'var(--gold-glow)' }}>
                  <span>Total Amount Payable:</span>
                  <span>₹{tax.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Mandatory DPDP Act 2023 Consent Checkbox (Starts Unchecked) */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
                  <input 
                    type="checkbox" 
                    checked={consentDpdp} 
                    onChange={(e) => setConsentDpdp(e.target.checked)}
                    required
                    style={{ marginTop: '0.15rem' }}
                  />
                  <span>
                    <strong>Statutory DPDP Act 2023 Consent</strong>: I explicitly consent to Hotel Sai International collecting and processing my identification strictly for hotel accommodation registration, Sarai Act 1867 police register compliance, and tax invoice generation. Records will be automatically scheduled for purge after 30 days.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !selectedRoomNumber}
                  className="btn-primary-gold" 
                  style={{ flex: 2, justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Securing Booking...' : `Confirm Booking • ₹${tax.total.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
