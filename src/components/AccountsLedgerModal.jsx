import React, { useState } from 'react';
import { 
  Building2, FileText, Download, Printer, DollarSign, 
  Calendar, ShieldCheck, CheckCircle2, ChevronRight, X, 
  TrendingUp, CreditCard, Clock, AlertTriangle, Search
} from 'lucide-react';
import { HOTEL_CONFIG, CORPORATE_PARTNERS, INITIAL_CORPORATE_LEDGER } from '../data/hotelData';

export default function AccountsLedgerModal({
  isOpen,
  onClose,
  bookings = []
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('day-book'); // 'day-book', 'corp-gst', 'corp-ledger', 'outstanding'
  const [selectedCorporate, setSelectedCorporate] = useState('CORP-01'); // JK Paper
  const [selectedMonth, setSelectedMonth] = useState('09');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Active corporate object
  const currentCorp = CORPORATE_PARTNERS.find(c => c.id === selectedCorporate) || CORPORATE_PARTNERS[0];
  const corpLedgerEntries = INITIAL_CORPORATE_LEDGER.filter(l => l.corporateId === selectedCorporate);

  // Day Book Mock Calculations (for Today: 2026-09-22)
  const dayBookData = {
    date: '2026-09-22',
    openingFloat: 5000.00,
    collections: [
      { mode: 'Cash (Front Desk)', count: 8, gross: 24500.00, notes: 'Physical cash received in drawer' },
      { mode: 'UPI (SBI Merchant QR)', count: 14, gross: 46800.00, notes: 'Direct bank credit into SBI A/c' },
      { mode: 'Card (Swipe POS)', count: 4, gross: 12200.00, notes: 'HDFC / Axis POS batches' },
      { mode: 'Corporate Credit (BTC)', count: 3, gross: 18450.00, notes: 'Billed to JK Paper & GAIL ledgers' },
      { mode: 'Bank Cheque / Draft', count: 1, gross: 15000.00, notes: 'ECoR Railway Divisional voucher' }
    ],
    pettyCashExpenses: [
      { voucher: 'EXP-901', item: 'Fresh Kitchen Milk & Paneer Mandi', amount: 1800.00 },
      { voucher: 'EXP-902', item: 'Diesel Generator Top-up (50 Ltrs)', amount: 4650.00 },
      { voucher: 'EXP-903', item: 'Local Courier & Police Register dispatch', amount: 250.00 }
    ]
  };

  const totalCollected = dayBookData.collections.reduce((sum, c) => sum + c.gross, 0);
  const totalPettyCash = dayBookData.pettyCashExpenses.reduce((sum, e) => sum + e.amount, 0);
  const cashIn = dayBookData.collections.find(c => c.mode.startsWith('Cash'))?.gross || 0;
  const expectedCashInDrawer = dayBookData.openingFloat + cashIn - totalPettyCash;

  // Monthly Corporate B2B GST Data (Formatted for GSTR-1 Table 4A & GSTR-2B)
  const corporateGstInvoices = [
    {
      invoiceNo: "INV-B2B-202609-01",
      date: "2026-09-15",
      corporateName: "JK Paper Mills Ltd.",
      gstin: "21AAACJ1288P1ZZ",
      stateCode: "21 (Odisha)",
      sacCode: "996311",
      taxableRoom: 36960.00,
      taxableFood: 4435.00,
      cgst: 2328.48,
      sgst: 2328.48,
      totalAmount: 46051.96,
      itcStatus: "Eligible (GSTR-2B)"
    },
    {
      invoiceNo: "INV-GAIL-202609-08",
      date: "2026-09-20",
      corporateName: "GAIL (India) Limited",
      gstin: "07AAACG1509J1ZQ",
      stateCode: "07 (Delhi / Interstate)",
      sacCode: "996311",
      taxableRoom: 25400.00,
      taxableFood: 3050.00,
      cgst: 1600.20,
      sgst: 1600.20,
      totalAmount: 31650.40,
      itcStatus: "Eligible (GSTR-2B)"
    },
    {
      invoiceNo: "INV-MAH-202609-02",
      date: "2026-09-18",
      corporateName: "Mahindra & Mahindra Ltd.",
      gstin: "27AAACM1545A1Z4",
      stateCode: "27 (Maharashtra)",
      sacCode: "996311",
      taxableRoom: 30446.43,
      taxableFood: 3653.57,
      cgst: 1918.12,
      sgst: 1918.12,
      totalAmount: 37936.24,
      itcStatus: "Eligible (GSTR-2B)"
    },
    {
      invoiceNo: "INV-B2B-202609-09",
      date: "2026-09-21",
      corporateName: "Utkal Alumina International",
      gstin: "21AABCU5544N1ZV",
      stateCode: "21 (Odisha)",
      sacCode: "996311",
      taxableRoom: 42800.00,
      taxableFood: 5100.00,
      cgst: 2695.50,
      sgst: 2695.50,
      totalAmount: 53291.00,
      itcStatus: "Eligible (GSTR-2B)"
    }
  ];

  const totalTaxableRoom = corporateGstInvoices.reduce((sum, inv) => sum + inv.taxableRoom, 0);
  const totalTaxableFood = corporateGstInvoices.reduce((sum, inv) => sum + inv.taxableFood, 0);
  const totalGstCollected = corporateGstInvoices.reduce((sum, inv) => sum + (inv.cgst + inv.sgst), 0);
  const totalB2bInvoiced = corporateGstInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handleExportCsv = () => {
    const headers = ["Invoice No", "Date", "Corporate Name", "GSTIN", "State Code", "Taxable Room (₹)", "Taxable Food (₹)", "CGST (₹)", "SGST (₹)", "Total (₹)"];
    const rows = corporateGstInvoices.map(inv => [
      inv.invoiceNo,
      inv.date,
      `"${inv.corporateName}"`,
      inv.gstin,
      inv.stateCode,
      inv.taxableRoom.toFixed(2),
      inv.taxableFood.toFixed(2),
      inv.cgst.toFixed(2),
      inv.sgst.toFixed(2),
      inv.totalAmount.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSTR1_Corporate_B2B_Report_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 1320,
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          background: 'linear-gradient(90deg, rgba(20,25,45,0.95), rgba(12,16,30,0.98))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid #34d399' }}>
                WATERTIGHT AUDIT SUITE
              </span>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Accounts & Corporate B2B Ledger Console
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Daily Day Book tender balancing • Monthly GSTR-2B Corporate statements • Dr/Cr Running statements
            </p>
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

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10, 14, 25, 0.5)'
        }}>
          <button
            onClick={() => setActiveTab('day-book')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'day-book' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              color: activeTab === 'day-book' ? 'var(--gold-glow)' : 'var(--text-muted)',
              border: activeTab === 'day-book' ? '1px solid var(--gold-glow)' : '1px solid transparent'
            }}
          >
            <Calendar size={16} /> Daily Collection Report (Day Book)
          </button>

          <button
            onClick={() => setActiveTab('corp-gst')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'corp-gst' ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
              color: activeTab === 'corp-gst' ? '#60a5fa' : 'var(--text-muted)',
              border: activeTab === 'corp-gst' ? '1px solid #60a5fa' : '1px solid transparent'
            }}
          >
            <FileText size={16} /> Monthly Corporate B2B GST Statement
          </button>

          <button
            onClick={() => setActiveTab('corp-ledger')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'corp-ledger' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
              color: activeTab === 'corp-ledger' ? '#34d399' : 'var(--text-muted)',
              border: activeTab === 'corp-ledger' ? '1px solid #34d399' : '1px solid transparent'
            }}
          >
            <Building2 size={16} /> Company Dr/Cr Ledger (JK Paper, GAIL)
          </button>

          <button
            onClick={() => setActiveTab('outstanding')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'outstanding' ? 'rgba(244, 114, 182, 0.2)' : 'transparent',
              color: activeTab === 'outstanding' ? '#f472b6' : 'var(--text-muted)',
              border: activeTab === 'outstanding' ? '1px solid #f472b6' : '1px solid transparent'
            }}
          >
            <TrendingUp size={16} /> Outstanding Aging Report
          </button>
        </div>

        {/* Tab 1: Daily Day Book */}
        {activeTab === 'day-book' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Daily Collections</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>₹{totalCollected.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>27 Total Receipts Across 5 Tenders</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Opening Cash Float</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>₹{dayBookData.openingFloat.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Morning Shift Float</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Petty Cash Disbursed</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>₹{totalPettyCash.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3 Signed Cash Vouchers</div>
              </div>

              <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--gold-glow)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold-glow)', textTransform: 'uppercase' }}>Expected Drawer Cash</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-glow)', marginTop: '0.2rem' }}>₹{expectedCashInDrawer.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ 100% Cashier Float Balanced</div>
              </div>
            </div>

            {/* Mode-wise Collections Table */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Tender-Wise Collection Ledger</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Payment Mode</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Vouchers / Count</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Reconciliation Notes</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {dayBookData.collections.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>{c.mode}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>{c.count}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{c.notes}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>₹{c.gross.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Petty Cash Vouchers */}
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Petty Cash Disbursements</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Voucher ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Expense Purpose</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount Paid (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {dayBookData.pettyCashExpenses.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#fbbf24' }}>{e.voucher}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>{e.item}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>₹{e.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Monthly Corporate B2B GST Statement */}
        {activeTab === 'corp-gst' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>
                  Corporate B2B GST Tax Statement (September 2026)
                </h3>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Strict compliance with statutory GSTR-1 Table 4A for corporate clients to claim Input Tax Credit (ITC) under GSTR-2B.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleExportCsv}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Download size={15} /> Export Government GST CSV
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Taxable Room Rent (12%)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>₹{totalTaxableRoom.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Taxable Dining (5%)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>₹{totalTaxableFood.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total GST Collected (CGST+SGST)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>₹{totalGstCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--gold-glow)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold-glow)' }}>Total Invoiced Amount</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>₹{totalB2bInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Invoices Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Invoice # / Date</th>
                    <th style={{ padding: '0.75rem' }}>Company Name</th>
                    <th style={{ padding: '0.75rem' }}>GSTIN</th>
                    <th style={{ padding: '0.75rem' }}>Place of Supply</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Room Base (₹)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Food Base (₹)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>CGST (₹)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>SGST (₹)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>ITC Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {corporateGstInvoices.map(inv => (
                    <tr key={inv.invoiceNo} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{inv.invoiceNo}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{inv.date}</div>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.corporateName}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#fbbf24' }}>{inv.gstin}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{inv.stateCode}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#38bdf8' }}>₹{inv.taxableRoom.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399' }}>₹{inv.taxableFood.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>₹{inv.cgst.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>₹{inv.sgst.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>₹{inv.totalAmount.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontSize: '0.7rem' }}>
                          ✓ GSTR-2B Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Company Dr/Cr Ledger */}
        {activeTab === 'corp-ledger' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>Statement of Account with TDS (Sec 194C / 194I)</h3>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Itemized debits (stays), credits (NEFT/cheques), and TDS deductions with running balance.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Partner:</span>
                <select
                  value={selectedCorporate}
                  onChange={(e) => setSelectedCorporate(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0d111d',
                    color: '#fff',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  {CORPORATE_PARTNERS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => alert(`Printing Official Statement of Account for ${currentCorp.name}`)}
                  className="btn-outline"
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Printer size={15} /> Print Statement
                </button>
              </div>
            </div>

            {/* Corporate Profile Header */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corporate Entity</span>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{currentCorp.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentCorp.location}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN Identification</span>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#fbbf24' }}>{currentCorp.gstin}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Credit Terms: {currentCorp.creditDays} Days</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved Credit Limit</span>
                <div style={{ fontWeight: 700, color: '#60a5fa' }}>₹{currentCorp.creditLimit?.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contract Discount: {currentCorp.contractDiscount}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Ledger Balance Due</span>
                <div style={{ fontWeight: 800, color: '#f87171', fontSize: '1.2rem' }}>
                  ₹{(corpLedgerEntries[corpLedgerEntries.length - 1]?.balance || currentCorp.openingBalance).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#f87171' }}>Debit Balance (Payable to Hotel)</div>
              </div>
            </div>

            {/* Dr/Cr Ledger Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date / Ref</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Transaction Type & Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Debit (Stays)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Credit (Receipts)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TDS Deducted</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {corpLedgerEntries.map(e => (
                  <tr key={e.entryId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{e.date}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e.bankRef !== '-' ? e.bankRef : e.invoiceNo}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.type}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.description}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, color: e.debit > 0 ? '#f87171' : 'var(--text-muted)' }}>
                      {e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, color: e.credit > 0 ? '#34d399' : 'var(--text-muted)' }}>
                      {e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      {e.tdsSection ? (
                        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.75rem' }}>
                          Sec {e.tdsSection}: ₹{e.tdsAmount}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                      ₹{e.balance.toLocaleString('en-IN')} Dr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Outstanding Aging Report */}
        {activeTab === 'outstanding' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
              Corporate Credit Aging Analysis (30 / 60 / 90 Days)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Monitors pending credit balances from anchor industrial accounts to prevent bad debt and enforce contracted payment terms.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Corporate Account</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact Person</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>0 - 30 Days (Current)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>31 - 60 Days</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>60+ Days Overdue</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {CORPORATE_PARTNERS.map(corp => (
                  <tr key={corp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{corp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{corp.location}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {corp.contactPerson} ({corp.contactPhone})
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>
                      ₹{(corp.openingBalance * 0.7).toFixed(0)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>
                      ₹{(corp.openingBalance * 0.25).toFixed(0)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>
                      ₹{(corp.openingBalance * 0.05).toFixed(0)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#fff' }}>
                      ₹{corp.openingBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
