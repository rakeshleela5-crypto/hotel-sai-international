import React, { useState } from 'react';
import { 
  Building2, FileText, CheckCircle2, ShieldCheck, Download, 
  Printer, DollarSign, Calendar, Clock, Star, Zap, Award, 
  ChevronRight, X, ArrowUpRight, Check, Users, Server, Globe
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';

export default function CommercialProposalModal({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('executive-summary'); // 'executive-summary', 'scope', 'pricing', 'timeline'

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
        maxWidth: 1100,
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
        overflow: 'hidden',
        background: '#070b14'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(90deg, rgba(19, 34, 61, 0.95), rgba(12, 24, 43, 0.98))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-glow)', border: '1px solid rgba(212, 175, 55, 0.4)', fontSize: '0.75rem' }}>
                FORMAL COMMERCIAL PROPOSAL
              </span>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                REF: PROP-SAI-2026-SEP-01
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              Hotel Sai International — <span className="gold-gradient-text">Next-Gen Cloud ERP &amp; PMS</span>
            </h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Prepared for: <strong>Managing Director Eswara</strong> &amp; Operations Consultant <strong>Shravan Patnaik</strong> • Rayagada, Odisha
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              onClick={() => alert('Printing Official Commercial Quotation & Proposal for Managing Director Eswara')}
              className="btn-primary-gold"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={15} /> Print Proposal
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.65rem 1.75rem',
          background: 'rgba(10, 14, 25, 0.7)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {[
            { id: 'executive-summary', label: '📋 Executive Summary & Benchmark' },
            { id: 'scope', label: '🛠️ Deliverables & Operational Scope' },
            { id: 'pricing', label: '💰 Commercial Investment & Tiers' },
            { id: 'timeline', label: '📅 Consultant Review & Go-Live (Post-25th)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === tab.id ? 'var(--gold-primary)' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'var(--text-muted)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'executive-summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--gold-glow)', margin: '0 0 0.75rem', fontSize: '1.15rem' }}>
                  1. The Strategic Opportunity &amp; Why Replace MySoft
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.88rem', margin: 0 }}>
                  During our in-depth meeting on September 21, 2026, with <strong>Managing Director Eswara</strong> and <strong>Mr. Sudhakar Reddy</strong>, the limitations of your current on-premise system (<strong>MySoft</strong>) were clearly laid bare:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      ❌ The ₹17,000 Unreconciled Gap
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      In MySoft, the Day Sales Flash showed ₹5,06,000 while the Sales Summary showed ₹4,89,000. Your accounts department cannot file GST or pass external audits due to conflicting reports.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      ❌ The ₹0 F&amp;B Checkout Bug
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      Food charges charged to guest room folios frequently drop to ₹0.00 in consolidated checkout reports, corrupting food revenue statements.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      ❌ Server Freezes &amp; Crash Risk
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      Local Windows desktop server hangs during month-end reports, and directors living in Vizag or Bhubaneswar cannot access live figures.
                    </div>
                  </div>
                </div>
              </div>

              {/* Solution Architecture */}
              <div style={{ background: 'rgba(52, 211, 153, 0.04)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ color: '#34d399', margin: '0 0 0.75rem', fontSize: '1.15rem' }}>
                  2. The Proposed Solution: Cloudflare Edge Hospitality ERP
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.88rem', margin: 0 }}>
                  We provide a state-of-the-art Hospitality Operating System matching the rock-solid operational discipline of <strong>IDS Next</strong> (your pre-COVID standard) combined with cloud serverless speed:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: 'var(--gold-glow)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Zap size={15} /> 0.00s Latency &amp; Zero Freezes
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                      Powered by Cloudflare Workers &amp; D1 globally distributed database. Instant report generation with 0 server maintenance.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={15} /> Watertight Double-Entry Audit
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                      Every rupee is dual-logged: Billed === Collected + Pending. Variance is guaranteed at ₹0.00 every single day.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Globe size={15} /> Multi-Director Remote Access
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                      Directors can log in securely from smartphone or laptop anywhere in India to view live collections and room status.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIONAL SCOPE */}
          {activeTab === 'scope' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ color: 'var(--gold-glow)', margin: '0 0 0.5rem', fontSize: '1rem' }}>
                    🏨 1. Front Desk &amp; Room Folio Management
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.8 }}>
                    <li>Authentic 39-room physical inventory (`201-208`, `301-316`, `401-416`).</li>
                    <li>Interactive Tape Chart view with color-coded occupancy and maintenance blocks.</li>
                    <li>Split Billing: Separate Room Tariff Invoice (12% GST) and Food Invoice (5% GST).</li>
                    <li>Multi-Tender Checkout: Cash, PhonePe/UPI, Card Swipe, Corporate Credit (BTC).</li>
                    <li>Cashier Drawer Handover with ₹500, ₹200, ₹100 note denomination counter.</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 0.5rem', fontSize: '1rem' }}>
                    🍳 2. Cannon Kitchen Multi-Outlet POS
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.8 }}>
                    <li>High-speed numpad item codes (Code `214` Mushroom Masala, `307` Plain Rice).</li>
                    <li>Dynamic Channel Pricing: Swiggy/Zomato (+25% Surge), Drop In Bar (+5%), Room Service (+10%).</li>
                    <li>Full Table Grid matching MyPOS: Dining (1-13), Terrace (1A-13A), Bar (1B-5B), PDRs, Banquets.</li>
                    <li>Seamless 1-click "Bill to Room" Folio posting with waiter/captain sign-off.</li>
                    <li>Item-level void with mandatory audit reason logging.</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ color: '#34d399', margin: '0 0 0.5rem', fontSize: '1rem' }}>
                    ⚖️ 3. Watertight Accounts &amp; Corporate B2B GST
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.8 }}>
                    <li>Daily Audit Reconciler proving ₹0.00 discrepancy across all reports.</li>
                    <li>Statutory GSTR-1 Corporate Statement export for JK Paper, GAIL, Mahindra, Ashok Leyland.</li>
                    <li>Corporate Running Ledger with Credit Limits (Ashok Leyland ₹2,14,487 balance).</li>
                    <li>Item-wise &amp; category food sales report for kitchen yield and cost analysis.</li>
                    <li>Outstanding aging summary across all credit companies.</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ color: '#c084fc', margin: '0 0 0.5rem', fontSize: '1rem' }}>
                    🌙 4. Night Audit, Housekeeping &amp; Mandi Store
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.8 }}>
                    <li>12:00 Midnight Night Audit Protocol: Locks transactions against backdating and rolls business date.</li>
                    <li>Manager Flash Report with Occupancy %, ARR (₹2,618), and RevPAR (₹1,248).</li>
                    <li>Housekeeping 5-stage room turnover lifecycle with floor attendant allocation.</li>
                    <li>Rayagada Mandi Store &amp; Local Vendor Credit Ledger (Poultry, vegetables, dairy).</li>
                    <li>Remote Director Portal for 3-4 directors across Vizag and Bhubaneswar.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & TIERS */}
          {activeTab === 'pricing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.25rem' }}>
                  Commercial Investment &amp; Cloud Deployment Options
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                  Tailored for Hotel Sai International (39 Physical Rooms + Cannon Kitchen POS + Mandi Store)
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* OPTION 1: PROFESSIONAL CLOUD TIER */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      STANDARD DEPLOYMENT
                    </span>
                    <h4 style={{ color: '#fff', margin: '0.5rem 0', fontSize: '1.2rem' }}>Managed SaaS Cloud</h4>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                      ₹3,500 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gold-glow)', marginTop: '0.2rem' }}>
                      + One-time Onboarding &amp; Staff Training: ₹15,000
                    </div>

                    <ul style={{ margin: '1.25rem 0 0', paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.8 }}>
                      <li>Full 39-room PMS &amp; Reception Tape Chart</li>
                      <li>Cannon Kitchen POS (Dine-in, Bar, Room Service)</li>
                      <li>Double-entry accounts &amp; GSTR-1 Corporate Reports</li>
                      <li>Cloudflare Serverless Hosting &amp; Daily Cloud Backups</li>
                      <li>Standard Email &amp; Phone Support (9 AM - 9 PM)</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => alert('Selected Managed SaaS Cloud proposal tier. Proceeding with quotation memo.')}
                    className="btn-outline"
                    style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem', textAlign: 'center', borderColor: '#38bdf8', color: '#38bdf8' }}
                  >
                    Select SaaS Cloud Tier
                  </button>
                </div>

                {/* OPTION 2: ENTERPRISE VIP TIER (RECOMMENDED) */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(19, 34, 61, 0.8))',
                  border: '2px solid var(--gold-glow)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 30px rgba(212, 175, 55, 0.15)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge" style={{ background: 'var(--gold-glow)', color: '#060e1a', fontWeight: 800 }}>
                        RECOMMENDED BY DEVELOPER
                      </span>
                      <Star size={18} color="var(--gold-glow)" fill="var(--gold-glow)" />
                    </div>
                    <h4 style={{ color: '#fff', margin: '0.5rem 0', fontSize: '1.2rem' }}>Enterprise Lifetime License</h4>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                      ₹65,000 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>one-time</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '0.2rem' }}>
                      Includes Annual Cloudflare D1 Edge Hosting &amp; Updates
                    </div>

                    <ul style={{ margin: '1.25rem 0 0', paddingLeft: '1.2rem', color: '#fff', fontSize: '0.82rem', lineHeight: 1.8 }}>
                      <li><strong>Everything in Standard Tier</strong></li>
                      <li>Watertight Audit Reconciler Proof for Eswara &amp; Shravan Patnaik</li>
                      <li>Split Invoicing Mode (Separate Room 12% &amp; Food 5% Bills)</li>
                      <li>Swiggy / Zomato dynamic channel markup engine</li>
                      <li>Local Rayagada Mandi Store &amp; Vendor Credit Ledger</li>
                      <li>Remote Director VIP Portal (Vizag / Bhubaneswar Access)</li>
                      <li><strong>Dedicated 24/7 Priority Emergency Phone Support</strong></li>
                      <li>Full on-site handover with Consultant Shravan Patnaik</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => alert('Selected Enterprise Lifetime License. Ready for agreement execution after September 25th.')}
                    className="btn-primary-gold"
                    style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem', textAlign: 'center', fontWeight: 800 }}
                  >
                    Select Enterprise License (Recommended)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE & CONSULTANT REVIEW */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--gold-glow)', margin: '0 0 1rem', fontSize: '1.15rem' }}>
                  Implementation Roadmap &amp; Decision Milestones
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                  {[
                    {
                      phase: 'Phase 1: Present to September 25, 2026',
                      title: 'Internal Property Clearances & System Staging',
                      desc: 'Hotel Sai International completes Fire Safety inspection, GAIL corporate audit, and hosting of the Congress political rally (15-20 rooms). Cloud software is staged and live-tested in sandbox.'
                    },
                    {
                      phase: 'Phase 2: Post-September 25, 2026 (Thursday/Friday or Mon/Tue)',
                      title: 'Operations Consultant Walkthrough (Shravan Patnaik)',
                      desc: 'Rakesh sits down with Consultant Shravan Patnaik and Front Office Lead Sudhakar Reddy. Side-by-side verification of double-entry reconciliation, split billing, POS shortcodes, and night audit locking.'
                    },
                    {
                      phase: 'Phase 3: Formal Agreement & Contract Execution',
                      title: 'Managing Director Eswara Sign-Off',
                      desc: 'Execution of formal commercial contract and commercial invoice handover as requested by Managing Director Eswara.'
                    },
                    {
                      phase: 'Phase 4: Full Cutover from MySoft',
                      title: 'Zero-Downtime Data Migration & Go-Live',
                      desc: 'Import 39 active room balances, corporate ledgers (Ashok Leyland ₹2.14L balance), and switch front desk & POS terminals to Hotel Sai Cloud OS.'
                    }
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(212, 175, 55, 0.2)',
                        border: '1px solid var(--gold-glow)',
                        color: 'var(--gold-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>{step.phase}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '0.15rem' }}>{step.title}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 14, 25, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Prepared by Developer Rakesh • Hotel Sai International Pvt Ltd, Rayagada - 765001
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onClose} className="btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
              Close
            </button>
            <button
              onClick={() => {
                alert('Official Proposal PDF / Print view generated. Ready to deliver to Managing Director Eswara and Shravan Patnaik.');
              }}
              className="btn-primary-gold"
              style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem', fontWeight: 700 }}
            >
              Deliver Proposal to Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
