import React, { useState } from 'react';
import { 
  X, Printer, CheckCircle2, Download, ShieldCheck, Hotel, 
  Calendar, User, FileText, Receipt, Sparkles, Building2,
  CreditCard, Split, UtensilsCrossed, BedDouble, UserCheck, Key
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { DigitalKeycard } from '@/components/ui/digital-keycard';

export default function BookingReceiptModal({ isOpen, onClose, booking }) {
  // View mode: 'a4' (Consolidated), 'room-split' (Page 3), 'food-split' (Page 2), 'grc' (Page 1), 'pos' (Thermal)
  const [invoiceType, setInvoiceType] = useState('a4');

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const calculateTaxes = () => {
    const base = Number(booking.baseTotal || booking.totalAmount / 1.05 || 0);
    const cgst = Number(booking.cgst || (base * 0.025));
    const sgst = Number(booking.sgst || (base * 0.025));
    const total = Number(booking.totalAmount || (base + cgst + sgst));
    const advance = Number(booking.advancePaid || 0);
    const balanceDue = total - advance;
    return { base, cgst, sgst, total, advance, balanceDue };
  };

  const { base, cgst, sgst, total, advance, balanceDue } = calculateTaxes();

  const billNo = booking.billNo || `FMBIL2627-${String(booking.roomNumber || '1499').padStart(5, '0')}`;
  const foodBillNo = `FMBIL2627-${String(Number(booking.roomNumber || 1499) + 1).padStart(5, '0')}`;
  const planCode = booking.mealPlan || booking.plan || 'CP';
  const grcNo = booking.grcNo || '684';

  // Calculations for Split Views (Pages 2 & 3 from hotel_documents.pdf)
  const roomTariffBase = 11996.00; // 4 nights @ ₹2,999.00
  const roomCgst = 299.92;
  const roomSgst = 299.92;
  const roomTotal = 12595.84;

  const foodBase = 900.00; // 3 meals from Fenugreek Restaurant
  const foodCgst = 21.00;
  const foodSgst = 21.00;
  const foodTotal = 962.00;

  return (
    <div className="official-invoice-overlay">
      <div className="official-invoice-modal-content" style={{ maxWidth: 1040 }}>
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="invoice-action-bar no-print" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="action-bar-title">
            <FileText size={18} color="var(--gold-glow)" />
            <span>Corporate Documents &amp; Split Folio Suite (hotel_documents.pdf)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle Buttons */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(6, 14, 26, 0.8)',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setInvoiceType('a4')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: invoiceType === 'a4' ? 'var(--gold-glow)' : 'transparent',
                  color: invoiceType === 'a4' ? '#060e1a' : '#94a3b8',
                  border: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Consolidated Tax Invoice
              </button>

              <button
                onClick={() => setInvoiceType('room-split')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: invoiceType === 'room-split' ? '#38bdf8' : 'transparent',
                  color: invoiceType === 'room-split' ? '#060e1a' : '#94a3b8',
                  border: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Room Bill #01499 (Page 3)
              </button>

              <button
                onClick={() => setInvoiceType('food-split')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: invoiceType === 'food-split' ? '#34d399' : 'transparent',
                  color: invoiceType === 'food-split' ? '#060e1a' : '#94a3b8',
                  border: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Fenugreek Food Bill #01500 (Page 2)
              </button>

              <button
                onClick={() => setInvoiceType('grc')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: invoiceType === 'grc' ? '#fbbf24' : 'transparent',
                  color: invoiceType === 'grc' ? '#060e1a' : '#94a3b8',
                  border: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Official GRC Form (Page 1)
              </button>

              <button
                onClick={() => setInvoiceType('pos')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: invoiceType === 'pos' ? '#a78bfa' : 'transparent',
                  color: invoiceType === 'pos' ? '#060e1a' : '#94a3b8',
                  border: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                80mm Slip
              </button>

              <button
                onClick={() => setInvoiceType('keycard')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: invoiceType === 'keycard' ? 'linear-gradient(135deg, #f3c64c, #d4af37)' : 'transparent',
                  color: invoiceType === 'keycard' ? '#060e1a' : '#f3c64c',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Key size={13} /> 3D Smart Keycard
              </button>
            </div>

            {invoiceType !== 'keycard' && (
              <button onClick={handlePrint} className="btn-primary-gold" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Printer size={15} /> Print
              </button>
            )}

            <button onClick={onClose} className="modal-close-btn" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* VIEW 0: 3D HOLOGRAPHIC DIGITAL SMART KEYCARD (Uiverse.io / 21st.dev) */}
        {invoiceType === 'keycard' && (
          <div style={{
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(6, 14, 26, 0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--gold-glow)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.4rem'
              }}>
                <Sparkles size={14} /> Interactive 3D Digital RFID Card
              </div>
              <h3 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }} className="font-serif">
                Guest Room Access Key
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Move your cursor to experience the dynamic holographic glare and realistic perspective tilt.
              </p>
            </div>

            <DigitalKeycard 
              guestName={booking.guestName || "Distinguished Guest"}
              roomNumber={booking.roomNumber || "301"}
              tierName={booking.tier || "Executive Room"}
              checkInDate={booking.checkInDate || "2026-09-22"}
              checkOutDate={booking.checkOutDate || "2026-09-24"}
              bookingId={booking.bookingId || "HSI-202609-001"}
            />

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <div>✓ Instant 24-Hr Check-In Token</div>
              <div>✓ Active Wi-Fi SSID: <code>HotelSai_Executive</code></div>
              <div>✓ In-Room Dining Extension: <code>Dial 9</code></div>
            </div>
          </div>
        )}

        {/* VIEW 1: CONSOLIDATED A4 TAX INVOICE */}
        {invoiceType === 'a4' && (
          <div className="tax-invoice-sheet">
            <div className="sheet-header">
              <div className="header-left">
                <span className="page-mark">ORIGINAL FOR RECIPIENT / GUEST COPY</span>
                <h1 className="tax-invoice-title" style={{ letterSpacing: '1px' }}>TAX INVOICE / GUEST FOLIO</h1>
                <div className="copy-type">Rule 46 of CGST / OGST Rules, 2017</div>
              </div>
              <div className="header-right">
                <div className="hotel-brand-block">
                  <div className="hotel-trade-name" style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                    {HOTEL_CONFIG.legalName.toUpperCase()}
                  </div>
                  <div className="address-line">{HOTEL_CONFIG.address}</div>
                  <div className="contact-line">
                    GSTIN: <span className="text-bold-gstin">{HOTEL_CONFIG.gstin}</span> | State Code: {HOTEL_CONFIG.stateCode} ({HOTEL_CONFIG.state})
                  </div>
                  <div className="contact-line">
                    Ph: {HOTEL_CONFIG.phones.join(', ')} | Tel: {HOTEL_CONFIG.landline}
                  </div>
                  <div className="contact-line" style={{ fontSize: '9px', color: '#64748b' }}>
                    Web: {HOTEL_CONFIG.website} | Email: {HOTEL_CONFIG.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="particulars-grid">
              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Bill / Invoice No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong style={{ color: '#0f172a' }}>{billNo}</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Bill Date &amp; Time</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{new Date().toLocaleDateString('en-IN')} 14:15:47</span>
                </div>
                <div className="field-row">
                  <span className="field-label">GRC Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>G.Regn.No. {grcNo}</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Room Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>Room {booking.roomNumber}</strong> ({booking.tier})</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Meal Plan</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>{planCode} (Continental Plan)</strong></span>
                </div>
              </div>

              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Guest / Billed To</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong style={{ textTransform: 'uppercase' }}>{booking.guestName}</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Contact Mobile</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{booking.guestPhone || '+91 6305202068'}</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Company / Account</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{booking.company || 'LINDE INDIA LTD'}</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Corporate GSTIN</span>
                  <span className="field-colon">:</span>
                  <span className="field-value text-bold-gstin">{booking.corporateGstin || '21AAACB2528H1ZA'}</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Check-In / Check-Out</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{booking.checkInDate || '17-Sep-2026 20:44'} to {booking.checkOutDate || '21-Sep-2026 14:15'}</span>
                </div>
              </div>
            </div>

            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '35px' }}>#</th>
                  <th>Date &amp; Service Particulars</th>
                  <th style={{ width: '75px', textAlign: 'center' }}>SAC</th>
                  <th style={{ width: '55px', textAlign: 'center' }}>Qty</th>
                  <th className="th-amount" style={{ width: '95px' }}>Rate (₹)</th>
                  <th className="th-amount" style={{ width: '85px' }}>Disc (₹)</th>
                  <th className="th-amount" style={{ width: '105px' }}>Taxable Val (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    <strong>Accommodation Stay - {booking.tier} (Room {booking.roomNumber})</strong>
                    <div style={{ fontSize: '9px', color: '#444' }}>
                      Plan: {planCode} • 4 Nights Stay (17-Sep to 21-Sep-2026)
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>996311</td>
                  <td style={{ textAlign: 'center' }}>4</td>
                  <td className="text-right">₹2,999.00</td>
                  <td className="text-right">₹0.00</td>
                  <td className="text-right">₹11,996.00</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>
                    <strong>Fenugreek Restaurant - Food &amp; Dining (KOT F2627-18346)</strong>
                    <div style={{ fontSize: '9px', color: '#444' }}>
                      18-Sep (₹280) + 19-Sep (₹310) + 20-Sep (₹310) Dining Orders
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>996331</td>
                  <td style={{ textAlign: 'center' }}>3</td>
                  <td className="text-right">₹300.00 avg</td>
                  <td className="text-right">₹0.00</td>
                  <td className="text-right">₹900.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Taxable Base:</td>
                  <td className="text-right" style={{ fontWeight: 'bold' }}>₹12,896.00</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>Central GST (CGST @ 2.5%):</td>
                  <td className="text-right">₹320.92</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>Odisha State GST (SGST @ 2.5%):</td>
                  <td className="text-right">₹320.92</td>
                </tr>
                <tr className="tfoot-round">
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 900, fontSize: '12px' }}>CONSOLIDATED TOTAL (INR):</td>
                  <td className="text-right text-net-amount">₹13,537.84</td>
                </tr>
              </tfoot>
            </table>

            <div className="in-words-row">
              <span className="in-words-label">Amount in Words:</span>
              <span className="in-words-value">
                Indian Rupees Thirteen Thousand Five Hundred Thirty-Eight Only
              </span>
            </div>

            {/* Audited Multi-Tender Settlement & Folio Reversals Transparency (Zero Leakage Protocol) */}
            {(() => {
              const tenders = booking.tenders || {
                cash: booking.paymentMode === 'Cash' ? (booking.totalAmount || 13538) : (booking.advanceDeposit && booking.paymentMode?.includes('Cash') ? booking.advanceDeposit : 500),
                upi: booking.paymentMode?.includes('UPI') ? (booking.advanceDeposit || 1000) : 1000,
                card: booking.paymentMode?.includes('Card') ? (booking.totalAmount || 13538) : 0,
                btc: booking.isB2b ? (booking.balanceDue || Math.max(0, (booking.totalAmount || 13538) - 1500)) : (booking.billingType === 'BTC' ? booking.totalAmount : 0),
                btcCompany: booking.company || 'Linde India Ltd'
              };

              const reversalsList = booking.reversals || [
                { memoId: 'REV-103', desc: 'Fenugreek Restaurant KOT #18346 duplicate punch credit memo', sac: '996331', amount: 294.00, operator: 'S. Patnaik (Auditor)' }
              ];

              const upiLabel = tenders.upiProvider ? `${tenders.upiProvider} (UPI)` : 'UPI';
              const tenderSummaryText = [
                tenders.cash > 0 && `Cash ₹${tenders.cash.toLocaleString('en-IN')}`,
                tenders.upi > 0 && `${upiLabel} ₹${tenders.upi.toLocaleString('en-IN')}${tenders.upiRef ? ` [${tenders.upiRef}]` : ''}`,
                tenders.card > 0 && `Card ₹${tenders.card.toLocaleString('en-IN')}`,
                tenders.btc > 0 && `Billed to ${tenders.btcCompany} ₹${tenders.btc.toLocaleString('en-IN')}`
              ].filter(Boolean).join(' + ');

              return (
                <div style={{
                  margin: '12px 0',
                  border: '1px solid #0f172a',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  fontSize: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px' }}>
                    <strong style={{ textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.5px' }}>
                      Audited Settlement &amp; Multi-Tender Split Breakdown
                    </strong>
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>
                      ✓ STATUS: FULLY SETTLED / NIL BALANCE
                    </span>
                  </div>

                  {/* Multi-Tender Summary Pill */}
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '3px', marginBottom: '8px', fontSize: '9.5px', color: '#065f46' }}>
                    <strong>Multi-Tender Breakdown: </strong>
                    <span>Paid: {tenderSummaryText || `Direct Settlement (${booking.paymentMode || 'Paid'})`}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div style={{ background: '#fff', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Cash Tender</span>
                      <strong style={{ color: '#0f172a', fontSize: '11px' }}>₹{tenders.cash.toLocaleString('en-IN')}</strong>
                      <span style={{ display: 'block', fontSize: '8px', color: '#94a3b8' }}>Front Desk Drawer</span>
                    </div>
                    <div style={{ background: '#fff', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>{tenders.upiProvider || 'UPI'} (Merchant QR)</span>
                      <strong style={{ color: '#0f172a', fontSize: '11px' }}>₹{tenders.upi.toLocaleString('en-IN')}</strong>
                      {tenders.upiRef && <span style={{ display: 'block', fontSize: '8px', color: '#0284c7', fontFamily: 'monospace' }}>{tenders.upiRef}</span>}
                    </div>
                    <div style={{ background: '#fff', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Card / POS Swipe</span>
                      <strong style={{ color: '#0f172a', fontSize: '11px' }}>₹{tenders.card.toLocaleString('en-IN')}</strong>
                      {tenders.cardAuth && <span style={{ display: 'block', fontSize: '8px', color: '#9333ea', fontFamily: 'monospace' }}>{tenders.cardAuth}</span>}
                    </div>
                    <div style={{ background: '#fff', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Corporate BTC ({tenders.btcCompany})</span>
                      <strong style={{ color: '#0f172a', fontSize: '11px' }}>₹{tenders.btc.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Audited Credit Memos / Reversals Transparency Note */}
                  {reversalsList.length > 0 && (
                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '9px' }}>
                          ↩️ Section 34 CGST Act Balancing Credit Memos / Reversals:
                        </span>
                        <span style={{ color: '#64748b', fontSize: '9px' }}>
                          Audited by: {reversalsList[0].operator}
                        </span>
                      </div>
                      {reversalsList.map((rev, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff1f2', padding: '3px 6px', borderRadius: '3px', marginBottom: '2px', fontSize: '8.5px', color: '#9f1239' }}>
                          <span>[{rev.memoId}] {rev.desc} (SAC {rev.sac})</span>
                          <strong style={{ color: '#dc2626' }}>-₹{rev.amount.toFixed(2)} Credit Memo</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '9px' }}>
                    <span>Folio Cashier / Duty Manager: <strong>Sudhakar Reddy (Shift A)</strong></span>
                    <span>Net Reconciled Drawer Remittance: <strong>₹{(booking.totalAmount || 13537.84).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                  </div>
                </div>
              );
            })()}

            <div className="sheet-footer-strip">
              Hotel Sai International Pvt Ltd • J.K. Road, Rayagada - 765001 • GSTIN: 21AABCH7663L1ZG • Thank You For Staying!
            </div>
          </div>
        )}

        {/* VIEW 2: ROOM TARIFF INVOICE (Page 3 of hotel_documents.pdf - Bill #01499) */}
        {invoiceType === 'room-split' && (
          <div className="tax-invoice-sheet">
            <div className="sheet-header">
              <div className="header-left">
                <span className="page-mark" style={{ background: '#0284c7' }}>CORPORATE LODGING REIMBURSEMENT COPY</span>
                <h1 className="tax-invoice-title" style={{ letterSpacing: '1px' }}>ROOM TARIFF TAX INVOICE</h1>
                <div className="copy-type">SAC 996311 (Hotel Accommodation Services)</div>
              </div>
              <div className="header-right">
                <div className="hotel-brand-block">
                  <div className="hotel-trade-name" style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                    {HOTEL_CONFIG.legalName.toUpperCase()}
                  </div>
                  <div className="address-line">{HOTEL_CONFIG.address}</div>
                  <div className="contact-line">
                    GSTIN: <span className="text-bold-gstin">{HOTEL_CONFIG.gstin}</span> | State: 21 (Odisha)
                  </div>
                </div>
              </div>
            </div>

            <div className="particulars-grid">
              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Bill No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>FMBIL2627-01499</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Bill Date</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">21-Sep-2026 14:15:47</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Room Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>Room 402</strong> (Executive Room)</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Plan Code</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>CP</strong></span>
                </div>
              </div>

              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Guest Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>MR. P ASHOK</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Company Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>LINDE INDIA LTD</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">GSTIN No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value text-bold-gstin">21AAACB2528H1ZA</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Check In / Out</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">17-Sep-2026 to 21-Sep-2026 (4 Nights)</span>
                </div>
              </div>
            </div>

            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Date</th>
                  <th>Description</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>SAC</th>
                  <th className="th-amount" style={{ width: '110px' }}>Tax Amount (₹)</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>GST %</th>
                  <th className="th-amount" style={{ width: '100px' }}>GST Amount</th>
                  <th className="th-amount" style={{ width: '110px' }}>Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '17-Sep-2026', desc: 'Tariff', taxVal: 2999.00, gstPct: 5, gstVal: 149.96, tot: 3148.96 },
                  { date: '18-Sep-2026', desc: 'Tariff', taxVal: 2999.00, gstPct: 5, gstVal: 149.96, tot: 3148.96 },
                  { date: '19-Sep-2026', desc: 'Tariff', taxVal: 2999.00, gstPct: 5, gstVal: 149.96, tot: 3148.96 },
                  { date: '20-Sep-2026', desc: 'Tariff', taxVal: 2999.00, gstPct: 5, gstVal: 149.96, tot: 3148.96 }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td><strong>{row.desc}</strong></td>
                    <td style={{ textAlign: 'center' }}>996311</td>
                    <td className="text-right">₹{row.taxVal.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{row.gstPct}%</td>
                    <td className="text-right">₹{row.gstVal.toFixed(2)}</td>
                    <td className="text-right">₹{row.tot.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Day Total (Taxable Value):</td>
                  <td className="text-right" style={{ fontWeight: 'bold' }}>₹{roomTariffBase.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>SGST 2.5%:</td>
                  <td className="text-right">₹{roomSgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>CGST 2.5%:</td>
                  <td className="text-right">₹{roomCgst.toFixed(2)}</td>
                </tr>
                <tr className="tfoot-round">
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 900, fontSize: '12px' }}>NET PAYABLE (INR):</td>
                  <td className="text-right text-net-amount">₹{roomTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="in-words-row">
              <span className="in-words-label">Amount in Words:</span>
              <span className="in-words-value">
                INR Twelve thousand five hundred ninety-six only
              </span>
            </div>

            <div style={{ marginTop: '15px', fontSize: '9px', color: '#64748b', textAlign: 'center' }}>
              I agree that I am personally liable for the full payment of the bill in the event it is not paid by the company or person indicated. All disputes subject to Odisha jurisdiction.
            </div>
          </div>
        )}

        {/* VIEW 3: FENUGREEK RESTAURANT FOOD INVOICE (Page 2 of hotel_documents.pdf - Bill #01500) */}
        {invoiceType === 'food-split' && (
          <div className="tax-invoice-sheet">
            <div className="sheet-header">
              <div className="header-left">
                <span className="page-mark" style={{ background: '#059669' }}>F&amp;B DINING MEAL REIMBURSEMENT COPY</span>
                <h1 className="tax-invoice-title" style={{ letterSpacing: '1px' }}>FENUGREEK RESTAURANT INVOICE</h1>
                <div className="copy-type">SAC 996331 (Restaurant &amp; In-Room Dining Services)</div>
              </div>
              <div className="header-right">
                <div className="hotel-brand-block">
                  <div className="hotel-trade-name" style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                    {HOTEL_CONFIG.legalName.toUpperCase()}
                  </div>
                  <div className="address-line">FENUGREEK RESTAURANT • Rayagada, Odisha - 765001</div>
                  <div className="contact-line">
                    GSTIN: <span className="text-bold-gstin">{HOTEL_CONFIG.gstin}</span> | State: 21 (Odisha)
                  </div>
                </div>
              </div>
            </div>

            <div className="particulars-grid">
              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Bill No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>FMBIL2627-01500</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Bill Date</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">21-Sep-2026 14:15:47</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Room Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>Room 402</strong></span>
                </div>
              </div>

              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Guest Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>MR. P ASHOK</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Company Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>LINDE INDIA LTD</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Corporate GSTIN</span>
                  <span className="field-colon">:</span>
                  <span className="field-value text-bold-gstin">21AAACB2528H1ZA</span>
                </div>
              </div>
            </div>

            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Date</th>
                  <th>Description</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>SAC</th>
                  <th className="th-amount" style={{ width: '110px' }}>Tax Amount (₹)</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>GST %</th>
                  <th className="th-amount" style={{ width: '100px' }}>GST Amount</th>
                  <th className="th-amount" style={{ width: '110px' }}>Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '18-Sep-2026', desc: 'FENUGREEK RESTAURANT', taxVal: 280.00, gstPct: 5, gstVal: 14.00, tot: 294.00 },
                  { date: '19-Sep-2026', desc: 'FENUGREEK RESTAURANT', taxVal: 310.00, gstPct: 5, gstVal: 15.50, tot: 325.50 },
                  { date: '20-Sep-2026', desc: 'FENUGREEK RESTAURANT', taxVal: 310.00, gstPct: 5, gstVal: 15.50, tot: 325.50 }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td><strong>{row.desc}</strong></td>
                    <td style={{ textAlign: 'center' }}>996331</td>
                    <td className="text-right">₹{row.taxVal.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{row.gstPct}%</td>
                    <td className="text-right">₹{row.gstVal.toFixed(2)}</td>
                    <td className="text-right">₹{row.tot.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Day Total (Taxable Dining):</td>
                  <td className="text-right" style={{ fontWeight: 'bold' }}>₹{foodBase.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>SGST 2.5%:</td>
                  <td className="text-right">₹{foodSgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right' }}>CGST 2.5%:</td>
                  <td className="text-right">₹{foodCgst.toFixed(2)}</td>
                </tr>
                <tr className="tfoot-round">
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: 900, fontSize: '12px' }}>NET PAYABLE (INR):</td>
                  <td className="text-right text-net-amount" style={{ color: '#059669' }}>₹{foodTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="in-words-row">
              <span className="in-words-label">Amount in Words:</span>
              <span className="in-words-value">
                INR Nine hundred sixty-two only
              </span>
            </div>

            <div style={{ marginTop: '15px', fontSize: '9px', color: '#64748b', textAlign: 'center' }}>
              Fenugreek Restaurant • Hotel Sai International Pvt Ltd • FSSAI Lic &amp; Satvik Hygiene Certified
            </div>
          </div>
        )}

        {/* VIEW 4: OFFICIAL GUEST REGISTRATION CARD (Page 1 of hotel_documents.pdf - G.Regn.No. 684) */}
        {invoiceType === 'grc' && (
          <div className="tax-invoice-sheet" style={{ background: '#ffffff', color: '#0f172a', border: '2px solid #0f172a' }}>
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
                  HOTEL SAI INTERNATIONAL (PVT.) LTD.
                </h1>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  J.K. Road, RAYAGADA - 765 001. Odisha
                </div>
                <div style={{ fontSize: '10px', color: '#334155' }}>
                  Ph: No. 226554, 225655, Mobile: 8895225555 | Email: hotelsaiinternational2010@gmail.com
                </div>
                <div style={{ fontSize: '10px', color: '#334155' }}>
                  Web: www.saiinternationalhotel.com
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#dc2626' }}>
                  G.Regn.No. {grcNo}
                </div>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  Bill No: <strong>FMBIL2627-01499</strong>
                </div>
              </div>
            </div>

            {/* GRC Form Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', borderBottom: '1px solid #0f172a', fontSize: '11px' }}>
              {/* Left Column: Guest Particulars */}
              <div style={{ padding: '10px', borderRight: '1px solid #0f172a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Name:</strong> MR. P ASHOK</div>
                <div><strong>Designation:</strong> Mech Engineer</div>
                <div><strong>Company / Organisation:</strong> Linde India Ltd</div>
                <div><strong>Address:</strong> J.K. Paper mill site, Jaykaypur, Rayagada</div>
                <div><strong>Phone No:</strong> +91 6305202068</div>
                <div><strong>No. of Persons:</strong> 1 Male | 0 Female | 0 Children</div>
                <div><strong>Arrived from:</strong> Delhi</div>
                <div><strong>Arrived Date &amp; Time:</strong> 17/09/2026 &amp; Time: 9 PM</div>
                <div><strong>Departure Date:</strong> 21/09/2026 (14:15)</div>
                <div><strong>Purpose of visit:</strong> [ ✓ ] Company | [ ] Work Own Business | [ ] Conference | [ ] Holidays</div>
              </div>

              {/* Right Column: Office Use & Billing Instructions */}
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc' }}>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>
                  FOR OFFICE USE ONLY
                </div>
                <div><strong>ROOM NO.:</strong> 402</div>
                <div><strong>ROOM TYPE:</strong> Executive (Exce)</div>
                <div><strong>ROOM RATE:</strong> ₹2,999.00 / night</div>
                <div><strong>BOOKED BY:</strong> Online / Corporate BTC</div>
                <div><strong>BILLING INSTRUCTION:</strong> 4-night (Room to Company, Food Direct)</div>
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  <strong>Receptionist's Signature:</strong> <em>Sudhakar Reddy</em>
                </div>
              </div>
            </div>

            {/* 24-Hour Policy Notice */}
            <div style={{ padding: '8px 10px', background: '#fffbeb', borderBottom: '1px solid #0f172a', fontSize: '10px', fontWeight: 600, color: '#92400e' }}>
              CHECK-IN and CHECK-OUT time is 24 hours and extension of stay must be re-confirmed with the duty manager.
            </div>

            {/* Guest Signature & Declaration */}
            <div style={{ padding: '12px 10px', fontSize: '10px', color: '#334155' }}>
              <p style={{ margin: '0 0 10px', lineHeight: 1.4 }}>
                I agree that I am personally liable for the full payment of the bill in the event it is not paid by the company of person indicated. May we request you to return the Room Key. All disputes subject to Odisha jurisdiction.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                <div>
                  <div style={{ borderBottom: '1px solid #0f172a', width: '200px', marginBottom: '4px' }}></div>
                  <strong>Guest's Signature</strong>
                </div>
                <div>
                  <div style={{ borderBottom: '1px solid #0f172a', width: '200px', marginBottom: '4px' }}></div>
                  <strong>Authorized Duty Manager</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: 80MM THERMAL SLIP */}
        {invoiceType === 'pos' && (
          <div className="printable-receipt" style={{
            background: '#ffffff',
            color: '#060e1a',
            padding: '1.5rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            maxWidth: '380px',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #94a3b8', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <h2 style={{ color: '#0c182b', fontSize: '1.25rem', margin: 0, fontWeight: 900 }}>
                {HOTEL_CONFIG.legalName.toUpperCase()}
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>
                {HOTEL_CONFIG.address}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.35rem' }}>
                GSTIN: {HOTEL_CONFIG.gstin} • SAC: 996311 / 996331
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', lineHeight: 1.5, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div><strong>BILL NO:</strong> {billNo}</div>
              <div><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN')}</div>
              <div><strong>GUEST:</strong> {booking.guestName}</div>
              <div><strong>COMPANY:</strong> {booking.company || 'LINDE INDIA LTD'}</div>
              <div><strong>ROOM:</strong> {booking.roomNumber} ({booking.tier})</div>
              <div><strong>CHECK-IN:</strong> 17-Sep-2026 (20:44)</div>
              <div><strong>CHECK-OUT:</strong> 21-Sep-2026 (14:15)</div>
            </div>

            <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', marginBottom: '0.85rem' }}>
              <tbody>
                <tr>
                  <td>Room Tariff (4 Nts)</td>
                  <td style={{ textAlign: 'right' }}>₹11,996.00</td>
                </tr>
                <tr>
                  <td>Fenugreek Dining</td>
                  <td style={{ textAlign: 'right' }}>₹900.00</td>
                </tr>
                <tr>
                  <td>CGST (2.5%)</td>
                  <td style={{ textAlign: 'right' }}>₹320.92</td>
                </tr>
                <tr>
                  <td>SGST (2.5%)</td>
                  <td style={{ textAlign: 'right' }}>₹320.92</td>
                </tr>
                <tr style={{ borderTop: '2px dashed #0f172a', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  <td style={{ paddingTop: '0.4rem' }}>NET TOTAL</td>
                  <td style={{ textAlign: 'right', paddingTop: '0.4rem' }}>₹13,537.84</td>
                </tr>
                <tr style={{ fontSize: '0.72rem', color: '#475569' }}>
                  <td style={{ paddingTop: '0.3rem' }}>UPI (SBI Merchant QR):</td>
                  <td style={{ textAlign: 'right', paddingTop: '0.3rem' }}>₹5,000.00</td>
                </tr>
                <tr style={{ fontSize: '0.72rem', color: '#475569' }}>
                  <td>BTC (Linde India Ltd):</td>
                  <td style={{ textAlign: 'right' }}>₹8,537.84</td>
                </tr>
                <tr style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 'bold' }}>
                  <td>Balance Due:</td>
                  <td style={{ textAlign: 'right' }}>₹0.00 (PAID)</td>
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.65rem', color: '#64748b' }}>
              <div>* Sarai Act 1867 &amp; DPDP Act 2023 Verified *</div>
              <div>Thank you for staying at Hotel Sai International!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
