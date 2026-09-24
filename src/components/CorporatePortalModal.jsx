import React, { useState } from 'react';
import { X, Building2, ShieldCheck, CheckCircle2, FileText, Phone, Mail } from 'lucide-react';
import { CORPORATE_PARTNERS, HOTEL_CONFIG } from '../data/hotelData';

export default function CorporatePortalModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [estimatedRooms, setEstimatedRooms] = useState('5-10 rooms/month');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyName || !gstin) return;

    // Dispatch to Cloudflare D1
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'apply_corporate_account',
        payload: {
          corporateId: `CORP-${Date.now().toString().slice(-4)}`,
          companyName,
          gstin,
          contactPerson,
          contactEmail,
          contactPhone: phone,
          estimatedRooms
        }
      })
    }).catch(err => console.warn('Offline corporate account application:', err));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 4000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 650 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              padding: '0.45rem',
              borderRadius: '8px',
              color: '#fff'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Corporate B2B Account Portal</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Rule 46 GST Invoicing & Pre-Contracted Tariffs for Rayagada Industries
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
                Corporate Account Request Received!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Our corporate logistics desk will contact <strong>{contactEmail}</strong> within 2 hours with our Rule 46 corporate billing agreement and credit onboarding paperwork.
              </p>
            </div>
          ) : (
            <div>
              {/* Partner Badges */}
              <div style={{
                background: 'rgba(12, 24, 43, 0.8)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 600, marginBottom: '0.5rem' }}>
                  ACTIVE RAYAGADA CORPORATE PREFERRED PARTNERS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {CORPORATE_PARTNERS.map(c => (
                    <span 
                      key={c.id}
                      style={{
                        background: 'rgba(6, 14, 26, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#fff'
                      }}
                    >
                      {c.name} ({c.contractDiscount}% Off)
                    </span>
                  ))}
                </div>
              </div>

              {/* Onboarding Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Enterprise / Organization Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Vedanta / Larsen & Toubro"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Corporate GSTIN (For ITC Pass)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="15-character GSTIN"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Key Contact Person & Designation</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. S. Senapati (Admin Lead)"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Official Corporate Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="traveldesk@company.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Desk / Mobile Contact</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="+91 6856 ..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Monthly Room Nights</label>
                    <select 
                      className="form-select"
                      value={estimatedRooms}
                      onChange={(e) => setEstimatedRooms(e.target.value)}
                    >
                      <option value="5-10 rooms/month">5 - 10 rooms / month</option>
                      <option value="10-25 rooms/month">10 - 25 rooms / month</option>
                      <option value="25-50+ rooms/month">25 - 50+ rooms / month (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={onClose} className="btn-outline-gold" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-gold" style={{ flex: 2, justifyContent: 'center' }}>
                    Submit Corporate Application
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
