import React from 'react';
import { X, Printer, CheckCircle2, Download, ShieldCheck, Hotel, Calendar, User } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function BookingReceiptModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 620 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem' }}>Booking Confirmation & Rule 46 Receipt</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Printable Receipt Area */}
        <div className="modal-body">
          <div className="printable-receipt" style={{
            background: '#ffffff',
            color: '#060e1a',
            padding: '1.75rem',
            borderRadius: '10px',
            fontFamily: 'monospace',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            marginBottom: '1.5rem'
          }}>
            {/* Receipt Brand Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #94a3b8', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <h2 style={{ color: '#0c182b', fontSize: '1.3rem', margin: 0, fontWeight: 900 }}>
                {HOTEL_CONFIG.name.toUpperCase()}
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem' }}>
                {HOTEL_CONFIG.address}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                Phone: {HOTEL_CONFIG.landline} | {HOTEL_CONFIG.phone}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.35rem' }}>
                GSTIN: {HOTEL_CONFIG.gstin} • SAC: {HOTEL_CONFIG.sacCode}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rule 46 Statutory Tax Invoice
              </div>
            </div>

            {/* Folio & Guest Details */}
            <div style={{ fontSize: '0.8rem', lineHeight: 1.5, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>INVOICE NO:</strong> {booking.bookingId}</span>
                <span><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>GUEST:</strong> {booking.guestName}</span>
                <span><strong>PHONE:</strong> {booking.guestPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>ID PROOF:</strong> {booking.idProofType} ({booking.idProofMasked})</span>
                <span><strong>ORIGIN:</strong> {booking.stateOfOrigin}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>ROOM ASSIGNED:</strong> ROOM {booking.roomNumber}</span>
                <span><strong>TIER:</strong> {booking.tier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>CHECK-IN:</strong> {booking.checkInDate} (12 PM)</span>
                <span><strong>CHECK-OUT:</strong> {booking.checkOutDate} (12 PM)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>NIGHTS:</strong> {booking.nights}</span>
                <span><strong>OCCUPANTS:</strong> {booking.adults}A, {booking.children}C</span>
              </div>
            </div>

            {/* Financial Ledger */}
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', marginBottom: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.35rem 0' }}>DESCRIPTION</th>
                  <th style={{ textAlign: 'center' }}>SAC</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.4rem 0' }}>Room Tariff ({booking.nights} Nts @ ₹{booking.tariffPerNight})</td>
                  <td style={{ textAlign: 'center' }}>996311</td>
                  <td style={{ textAlign: 'right' }}>₹{(booking.baseTotal || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.2rem 0' }}>CGST (2.5%)</td>
                  <td style={{ textAlign: 'center' }}>996311</td>
                  <td style={{ textAlign: 'right' }}>₹{(booking.cgst || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.2rem 0' }}>SGST (2.5%)</td>
                  <td style={{ textAlign: 'center' }}>996311</td>
                  <td style={{ textAlign: 'right' }}>₹{(booking.sgst || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ borderTop: '2px dashed #0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <td style={{ padding: '0.5rem 0' }}>TOTAL AMOUNT</td>
                  <td></td>
                  <td style={{ textAlign: 'right' }}>₹{(booking.totalAmount || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <td style={{ padding: '0.2rem 0' }}>Payment Mode:</td>
                  <td></td>
                  <td style={{ textAlign: 'right' }}>{booking.paymentMode}</td>
                </tr>
                <tr style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <td style={{ padding: '0.2rem 0' }}>Status:</td>
                  <td></td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{booking.paymentStatus}</td>
                </tr>
              </tbody>
            </table>

            {/* Statutory Compliance Footer */}
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.65rem', textAlign: 'center', fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4 }}>
              <div>* Sarai Act 1867 & DPDP Act 2023 Verified Registration *</div>
              <div>Standard 24-Hr Cycle Check-In / Check-Out: 12:00 PM Sharp</div>
              <div>Subhash Nagar / Sai Priya Nagar, Rayagada, Odisha - 765001</div>
              <div style={{ marginTop: '0.35rem', fontWeight: 600, color: '#334155' }}>Thank you for choosing Hotel Sai International!</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn-outline-gold">
              Close
            </button>
            <button onClick={handlePrint} className="btn-primary-gold">
              <Printer size={16} /> Print Receipt / Tax Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
