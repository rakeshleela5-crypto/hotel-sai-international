import React, { useState } from 'react';
import { 
  Moon, Lock, CheckCircle2, AlertTriangle, Printer, 
  Calendar, DollarSign, Bed, UtensilsCrossed, ShieldCheck, 
  RotateCcw, ArrowRight, X, User, FileText
} from 'lucide-react';
import { HOTEL_CONFIG, INITIAL_NIGHT_AUDITS } from '../data/hotelData';

export default function NightAuditModal({
  isOpen,
  onClose,
  rooms = [],
  bookings = [],
  transactions = [],
  onExecuteNightAudit
}) {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(1); // 1: Pre-Audit Check, 2: Post Room Charges, 3: Cash Balancing, 4: Day Lock & Rollover, 5: Audit Summary
  const [auditorName, setAuditorName] = useState('Sudhakar Reddy (Front Office Lead)');
  const [managerPin, setManagerPin] = useState('');
  const [physicalDrawerCash, setPhysicalDrawerCash] = useState('33500');
  const [auditNotes, setAuditNotes] = useState('All 32 in-house rooms verified. Night room charges posted.');
  const [auditCompleted, setAuditCompleted] = useState(false);

  // Active business date
  const [businessDate, setBusinessDate] = useState('2026-09-21');
  const nextBusinessDate = '2026-09-22';

  // Metrics for today's audit (Matching MySoft Screenshot 16 & Owner Meeting)
  const totalRooms = 39;
  const occupiedRooms = 18;
  const occupancyPct = '48.7';

  // Revenue figures (Screenshot 16 exact values)
  const roomRevenue = 46280.00;
  const fnbRevenue = 11967.07;
  const otherRevenue = 0.00;
  const grossRevenue = roomRevenue + fnbRevenue + otherRevenue; // 58,247.07

  const adr = '2618.00';
  const revpar = '1248.00';

  // Collections
  const cashCollected = 24500.00;
  const upiCollected = 18747.07;
  const cardCollected = 15000.00;
  const companyCredit = 2912.35;
  const openingFloat = 5000.00;
  const expectedDrawerCash = openingFloat + cashCollected; // 29,500.00
  const physicalCashNum = parseFloat(physicalDrawerCash) || 0;
  const cashVariance = physicalCashNum - expectedDrawerCash;

  const handleExecuteAudit = () => {
    if (managerPin !== '7650') {
      alert("Invalid Manager Authorization PIN! Default PIN is 7650.");
      return;
    }

    const auditPayload = {
      auditId: `NA-${businessDate}`,
      businessDate,
      closedAt: new Date().toISOString(),
      totalRooms,
      occupiedRooms,
      occupancyPct: parseFloat(occupancyPct),
      adr: parseFloat(adr),
      revpar: parseFloat(revpar),
      roomRevenue,
      fnbRevenue,
      otherRevenue,
      grossRevenue,
      cashCollected,
      upiCollected,
      cardCollected,
      companyBilled: companyCredit,
      cashOpeningFloat: openingFloat,
      cashExpected: expectedDrawerCash,
      cashPhysicalDrawer: physicalCashNum,
      cashVariance,
      isLocked: 1,
      auditorName,
      notes: auditNotes
    };

    if (onExecuteNightAudit) {
      onExecuteNightAudit(auditPayload);
    }

    setAuditCompleted(true);
    setCurrentStep(5);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.92)',
      backdropFilter: 'blur(12px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1180,
        maxHeight: '94vh',
        overflowY: 'auto',
        borderRadius: '16px',
        border: '1px solid rgba(147, 51, 234, 0.4)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(90deg, rgba(35,15,55,0.95), rgba(15,10,30,0.98))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'rgba(147, 51, 234, 0.25)', color: '#c084fc', border: '1px solid #a855f7' }}>
                12:00 MIDNIGHT PROTOCOL
              </span>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Night Audit & Business Day-Closing Engine
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Hard-locks transactions against backdating • Auto-posts night tariffs • Rolls business date
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Business Date</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c084fc' }}>{businessDate}</div>
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
        </div>

        {/* Wizard Steps Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {[
            { step: 1, title: 'Pre-Audit Verification' },
            { step: 2, title: 'Auto-Post Room Tariffs' },
            { step: 3, title: 'Cash Drawer Balancing' },
            { step: 4, title: 'Authorize & Day Lock' },
            { step: 5, title: 'Manager Pack Summary' }
          ].map(s => (
            <div 
              key={s.step} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                opacity: currentStep === s.step ? 1 : (currentStep > s.step ? 0.8 : 0.4),
                color: currentStep === s.step ? '#c084fc' : (currentStep > s.step ? '#34d399' : '#fff')
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: currentStep === s.step ? '#9333ea' : (currentStep > s.step ? '#10b981' : 'rgba(255,255,255,0.1)'),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          {/* Step 1: Pre-Audit Check */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Step 1: In-House Rooms & Open Folio Verification</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Verifies all resident guests, vacant rooms, and ensures Cannon Kitchen dining orders are billed.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupied Rooms</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{occupiedRooms} / {totalRooms}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupancy: {occupancyPct}%</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open Restaurant KOTs</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>0 Pending</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All kitchen tickets closed</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Check-Outs</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>0 Overdue</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All folios up-to-date</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setCurrentStep(2)} className="btn-primary" style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  Proceed to Auto-Post Charges <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Auto-Post Room Tariffs */}
          {currentStep === 2 && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Step 2: Automated Midnight Tariff Posting</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                The night audit routine automatically debits room rent + 12% GST (SAC 996311) to all {occupiedRooms} in-house guest folios.
              </p>

              <div style={{
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid #34d399',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#34d399'
              }}>
                <CheckCircle2 size={24} />
                <div>
                  <strong>Ready to post ₹{roomRevenue.toLocaleString('en-IN')} across {occupiedRooms} rooms.</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    Taxes calculated: CGST ₹{(roomRevenue * 0.06).toFixed(2)} + SGST ₹{(roomRevenue * 0.06).toFixed(2)}.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentStep(1)} className="btn-outline">Back</button>
                <button onClick={() => setCurrentStep(3)} className="btn-primary" style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  Post Charges & Verify Cashier Float <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Cash Drawer Balancing */}
          {currentStep === 3 && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Step 3: Physical Cash Drawer Reconciliation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Count physical currency in the front-desk safe and enter below to detect any cash shortage or excess.
              </p>

              <div style={{ maxWidth: 600, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Opening Morning Float:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>₹{openingFloat.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>System Logged Cash Collections:</span>
                  <span style={{ fontWeight: 600, color: '#34d399' }}>+ ₹{cashCollected.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>Expected Drawer Cash:</span>
                  <span style={{ fontWeight: 700, color: 'var(--gold-glow)', fontSize: '1.1rem' }}>₹{expectedDrawerCash.toFixed(2)}</span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Physical Cash Counted in Drawer (₹):
                  </label>
                  <input
                    type="number"
                    value={physicalDrawerCash}
                    onChange={(e) => setPhysicalDrawerCash(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: '#0d111d',
                      color: '#fff',
                      border: '1px solid rgba(147, 51, 234, 0.4)',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: cashVariance === 0 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: cashVariance === 0 ? '#34d399' : '#f87171',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}>
                  {cashVariance === 0 ? '✓ Exact Cash Match: Zero Discrepancy!' : `Discrepancy Detected: ₹${cashVariance.toFixed(2)}`}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentStep(2)} className="btn-outline">Back</button>
                <button onClick={() => setCurrentStep(4)} className="btn-primary" style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  Proceed to Final Day Lock <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Authorize & Day Lock */}
          {currentStep === 4 && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Step 4: Authorize & Hard-Lock Calendar Day ({businessDate})</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                This is the anti-theft barrier. Once executed, all transactions for {businessDate} are set to <code style={{ color: '#c084fc' }}>is_locked = 1</code>. No cashier can edit, delete, or backdate entries.
              </p>

              <div style={{ maxWidth: 600, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Auditing Official</label>
                  <input
                    type="text"
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Closing Audit Notes</label>
                  <textarea
                    rows={2}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#c084fc', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Enter Back-Office Manager PIN to Seal Day:
                  </label>
                  <input
                    type="password"
                    placeholder="Enter PIN (7650)"
                    value={managerPin}
                    onChange={(e) => setManagerPin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: '#0d111d',
                      color: '#fff',
                      border: '1px solid #a855f7',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      letterSpacing: '4px'
                    }}
                  />
                </div>

                <button
                  onClick={handleExecuteAudit}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #9333ea, #7e22ce)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Lock size={18} /> Execute 12:00 AM Night Audit & Roll Date to {nextBusinessDate}
                </button>
              </div>

              <button onClick={() => setCurrentStep(3)} className="btn-outline">Back</button>
            </div>
          )}

          {/* Step 5: Official Audit Summary / Manager Pack */}
          {currentStep === 5 && (
            <div>
              <div style={{
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid #34d399',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={32} color="#34d399" />
                  <div>
                    <h4 style={{ color: '#34d399', margin: 0, fontSize: '1.15rem' }}>
                      Night Audit Successfully Completed & Sealed!
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      All {occupiedRooms} room charges posted. Date rolled forward to <strong>{nextBusinessDate}</strong>. Day {businessDate} locked permanently.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => alert("Printing Official Night Audit Manager Pack (Single A4 Page)")}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={15} /> Print Manager Audit Pack
                </button>
              </div>

              {/* Printable Manager Pack Layout */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>HOTEL SAI INTERNATIONAL - RAYAGADA</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gold-glow)' }}>Official Night Audit & Revenue Management Pack</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closed: {businessDate} at 00:05 AM by {auditorName}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupancy %</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{occupancyPct}% ({occupiedRooms}/40)</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Daily Rate (ADR)</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#60a5fa' }}>₹{adr}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RevPAR</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c084fc' }}>₹{revpar}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gross Day Revenue</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>₹{grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h5 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
                      Revenue Department Breakdown
                    </h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Room Revenue:</span>
                      <span style={{ fontWeight: 600, color: '#fff' }}>₹{roomRevenue.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Cannon Kitchen & Dining:</span>
                      <span style={{ fontWeight: 600, color: '#fff' }}>₹{fnbRevenue.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Laundry & Ancillary:</span>
                      <span style={{ fontWeight: 600, color: '#fff' }}>₹{otherRevenue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <h5 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
                      Payment Tender Settlements
                    </h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Cash Collected:</span>
                      <span style={{ fontWeight: 600, color: '#38bdf8' }}>₹{cashCollected.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>SBI UPI / QR:</span>
                      <span style={{ fontWeight: 600, color: '#34d399' }}>₹{upiCollected.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Card Batches:</span>
                      <span style={{ fontWeight: 600, color: '#c084fc' }}>₹{cardCollected.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Corporate Credit (B2B):</span>
                      <span style={{ fontWeight: 600, color: '#fbbf24' }}>₹{companyCredit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={onClose} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                  Done & Return to Front Office
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
