import React, { useState } from 'react';
import { 
  X, Printer, CheckCircle2, Download, ShieldCheck, Hotel, 
  Calendar, User, FileText, Receipt, Sparkles, Building2 
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function BookingReceiptModal({ isOpen, onClose, booking }) {
  const [invoiceType, setInvoiceType] = useState('a4'); // 'a4' (Corporate GST Tax Invoice) or 'pos' (80mm Thermal Slip)

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const calculateTaxes = () => {
    const base = Number(booking.baseTotal || booking.totalAmount / 1.05 || 0);
    const cgst = Number(booking.cgst || (base * 0.025));
    const sgst = Number(booking.sgst || (base * 0.025));
    const total = Number(booking.totalAmount || (base + cgst + sgst));
    return { base, cgst, sgst, total };
  };

  const { base, cgst, sgst, total } = calculateTaxes();

  return (
    <div className="official-invoice-overlay">
      <div className="official-invoice-modal-content">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="invoice-action-bar no-print">
          <div className="action-bar-title">
            <FileText size={18} color="var(--gold-glow)" />
            <span>Rule 46 GST Invoicing &amp; Guest Billing Folio</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View Mode Toggle Buttons */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(6, 14, 26, 0.8)',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <button
                onClick={() => setInvoiceType('a4')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: invoiceType === 'a4' ? 'var(--gold-glow)' : 'transparent',
                  color: invoiceType === 'a4' ? '#060e1a' : '#94a3b8'
                }}
              >
                A4 Official Tax Invoice
              </button>
              <button
                onClick={() => setInvoiceType('pos')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: invoiceType === 'pos' ? 'var(--gold-glow)' : 'transparent',
                  color: invoiceType === 'pos' ? '#060e1a' : '#94a3b8'
                }}
              >
                80mm Thermal Slip
              </button>
            </div>

            <button onClick={handlePrint} className="btn-primary-gold" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
              <Printer size={15} /> Print Document
            </button>

            <button onClick={onClose} className="modal-close-btn" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View 1: Official Corporate A4 GST Tax Invoice */}
        {invoiceType === 'a4' && (
          <div className="tax-invoice-sheet">
            {/* Sheet Header */}
            <div className="sheet-header">
              <div className="header-left">
                <span className="page-mark">ORIGINAL FOR RECIPIENT / GUEST COPY</span>
                <h1 className="tax-invoice-title">TAX INVOICE</h1>
                <div className="copy-type">Rule 46 of CGST / OGST Rules, 2017</div>
              </div>
              <div className="header-right">
                <div className="hotel-brand-block">
                  <div className="hotel-trade-name">{HOTEL_CONFIG.name.toUpperCase()}</div>
                  <div className="proprietor-line">Proprietor: Paidisetty Manmadha Rao</div>
                  <div className="address-line">Sai Priya Nagar, Rayagada, Odisha - 765001</div>
                  <div className="contact-line">
                    GSTIN: <span className="text-bold-gstin">{HOTEL_CONFIG.gstin}</span> | State Code: 21 (Odisha)
                  </div>
                  <div className="contact-line">
                    Phone: {HOTEL_CONFIG.phone} | Landline: {HOTEL_CONFIG.landline}
                  </div>
                </div>
              </div>
            </div>

            {/* Particulars Grid */}
            <div className="particulars-grid">
              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Invoice / Folio No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>{booking.bookingId || 'HSI-2026-INV'}</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Invoice Date</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div className="field-row">
                  <span className="field-label">SAC Code</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>996311</strong> (Hotel Accommodation Services)</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Room Number</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>Room {booking.roomNumber}</strong> ({booking.tier})</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Place of Supply</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">21 - Odisha (Intrastate)</span>
                </div>
              </div>

              <div className="particulars-col">
                <div className="field-row">
                  <span className="field-label">Guest / Billed To</span>
                  <span className="field-colon">:</span>
                  <span className="field-value"><strong>{booking.guestName}</strong></span>
                </div>
                <div className="field-row">
                  <span className="field-label">Contact Mobile</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{booking.guestPhone}</span>
                </div>
                <div className="field-row">
                  <span className="field-label">ID Proof (DPDP)</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{booking.idProofType} ({booking.idProofMasked || 'XXXX-XXXX-XXXX'})</span>
                </div>
                <div className="field-row">
                  <span className="field-label">State of Origin</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{booking.stateOfOrigin || 'Odisha'}</span>
                </div>
                {booking.corporateGstin && (
                  <div className="field-row">
                    <span className="field-label">Corporate GSTIN</span>
                    <span className="field-colon">:</span>
                    <span className="field-value text-bold-gstin">{booking.corporateGstin}</span>
                  </div>
                )}
                <div className="field-row">
                  <span className="field-label">Check-In / Out</span>
                  <span className="field-colon">:</span>
                  <span className="field-value">{booking.checkInDate} (12:00 PM) to {booking.checkOutDate} (11:00 AM)</span>
                </div>
              </div>
            </div>

            {/* Itemized Ledger Table */}
            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Sr.</th>
                  <th>Service Description</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>SAC</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Qty/Nts</th>
                  <th className="th-amount" style={{ width: '100px' }}>Rate (₹)</th>
                  <th className="th-amount" style={{ width: '110px' }}>Taxable Amt (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    <strong>Accommodation Stay - {booking.tier}</strong>
                    <div style={{ fontSize: '9px', color: '#444' }}>
                      Room {booking.roomNumber} • High-speed Wi-Fi, 24/7 Power Backup, Pilgrim Care
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>996311</td>
                  <td style={{ textAlign: 'center' }}>{booking.nights || 1}</td>
                  <td className="text-right">₹{(booking.tariffPerNight || base / (booking.nights || 1)).toFixed(2)}</td>
                  <td className="text-right">₹{base.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>Subtotal (Taxable Value):</td>
                  <td className="text-right" style={{ fontWeight: 'bold' }}>₹{base.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="5" style={{ textAlign: 'right' }}>Central GST (CGST @ 2.5%):</td>
                  <td className="text-right">₹{cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="5" style={{ textAlign: 'right' }}>Odisha State GST (SGST @ 2.5%):</td>
                  <td className="text-right">₹{sgst.toFixed(2)}</td>
                </tr>
                <tr className="tfoot-round">
                  <td colSpan="5" style={{ textAlign: 'right', fontWeight: 900, fontSize: '12px' }}>GRAND TOTAL (INR):</td>
                  <td className="text-right text-net-amount">₹{total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            {/* In Words Row */}
            <div className="in-words-row">
              <span className="in-words-label">Invoice Amount in Words:</span>
              <span className="in-words-value">
                Indian Rupees {Math.round(total).toLocaleString('en-IN')} Only
              </span>
            </div>

            {/* Tax Summary Block */}
            <div className="tax-summary-block">
              <div className="tax-summary-title">GST Tax Calculation Summary</div>
              <table className="tax-summary-table">
                <thead>
                  <tr>
                    <th>SAC</th>
                    <th style={{ textAlign: 'right' }}>Taxable (₹)</th>
                    <th style={{ textAlign: 'center' }}>CGST %</th>
                    <th style={{ textAlign: 'right' }}>CGST (₹)</th>
                    <th style={{ textAlign: 'center' }}>SGST %</th>
                    <th style={{ textAlign: 'right' }}>SGST (₹)</th>
                    <th style={{ textAlign: 'right' }}>Total Tax (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="tax-summary-total-row">
                    <td>996311</td>
                    <td style={{ textAlign: 'right' }}>{base.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>2.5%</td>
                    <td style={{ textAlign: 'right' }}>{cgst.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>2.5%</td>
                    <td style={{ textAlign: 'right' }}>{sgst.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{(cgst + sgst).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms and Conditions */}
            <div className="invoice-terms-box">
              <div className="invoice-terms-header">Statutory Terms &amp; Conditions:</div>
              <ol className="invoice-terms-list">
                <li>Check-In time is 12:00 PM and Check-Out time is 11:00 AM sharp. Late checkout subject to half-day tariff.</li>
                <li>Hotel Sai International is 100% compliant with the Sarai Act of 1867 and Digital Personal Data Protection Act 2023.</li>
                <li>Disputes are subject to Rayagada, Odisha jurisdiction only. E. &amp; O.E.</li>
                <li>Pure Satvik and vegetarian culinary principles strictly upheld on hotel premises.</li>
              </ol>
            </div>

            {/* Dual Signature Block */}
            <div className="signature-grid">
              <div className="sig-col">
                <div className="sig-line"></div>
                <span className="sig-title">Guest Signature</span>
                <span className="sig-disclaimer">Verified room condition &amp; amenities received</span>
              </div>
              <div className="sig-col">
                <div className="sig-line"></div>
                <span className="sig-title">For Hotel Sai International</span>
                <span className="sig-disclaimer">Authorized Signatory (PMS Automated Seal)</span>
              </div>
            </div>

            {/* Sheet Footer Strip */}
            <div className="sheet-footer-strip">
              Hotel Sai International • Sai Priya Nagar, Rayagada, Odisha - 765001 • Corporate GSTIN: 21AEKPP8689J1ZS • Thank You For Staying!
            </div>
          </div>
        )}

        {/* View 2: 80mm Thermal Receipt Format */}
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
                {HOTEL_CONFIG.name.toUpperCase()}
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>
                {HOTEL_CONFIG.address}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.35rem' }}>
                GSTIN: {HOTEL_CONFIG.gstin} • SAC: 996311
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>
                Rule 46 POS Counter Slip
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', lineHeight: 1.5, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div><strong>INVOICE:</strong> {booking.bookingId}</div>
              <div><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN')}</div>
              <div><strong>GUEST:</strong> {booking.guestName}</div>
              <div><strong>PHONE:</strong> {booking.guestPhone}</div>
              <div><strong>ROOM:</strong> {booking.roomNumber} ({booking.tier})</div>
              <div><strong>CHECK-IN:</strong> {booking.checkInDate} (12 PM)</div>
              <div><strong>CHECK-OUT:</strong> {booking.checkOutDate} (11 AM)</div>
            </div>

            <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', marginBottom: '0.85rem' }}>
              <tbody>
                <tr>
                  <td>Room Tariff ({booking.nights} Nts)</td>
                  <td style={{ textAlign: 'right' }}>₹{base.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>CGST (2.5%)</td>
                  <td style={{ textAlign: 'right' }}>₹{cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST (2.5%)</td>
                  <td style={{ textAlign: 'right' }}>₹{sgst.toFixed(2)}</td>
                </tr>
                <tr style={{ borderTop: '2px dashed #0f172a', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  <td style={{ paddingTop: '0.4rem' }}>NET TOTAL</td>
                  <td style={{ textAlign: 'right', paddingTop: '0.4rem' }}>₹{total.toFixed(2)}</td>
                </tr>
                <tr style={{ fontSize: '0.75rem', color: '#475569' }}>
                  <td>Payment Mode:</td>
                  <td style={{ textAlign: 'right' }}>{booking.paymentMode || 'UPI'}</td>
                </tr>
                <tr style={{ fontSize: '0.75rem', color: '#475569' }}>
                  <td>Payment Status:</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{booking.paymentStatus || 'Paid'}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.65rem', color: '#64748b' }}>
              <div>* Sarai Act 1867 &amp; DPDP Act 2023 Verified *</div>
              <div>Rayagada, Odisha - 765001</div>
              <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>Thank you for your patronage!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
