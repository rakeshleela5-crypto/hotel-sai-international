import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, X, Printer, Download, Search, CheckCircle2, 
  AlertTriangle, Bed, User, Building, Phone, Clock, FileSpreadsheet,
  IndianRupee, ShieldCheck, ArrowRight, RefreshCw, Eye, Utensils,
  ShoppingBag, Wrench, FileText, Database, Layers, TrendingUp, CreditCard,
  Check, Filter
} from 'lucide-react';

/**
 * DateAuditSnapshotModal (Universal Context-Aware Pop View)
 * Enterprise-grade modal that pops up whenever [ Display ] is clicked
 * on the UniversalDateFilterBar across ANY module or tab in the project.
 * Automatically adapts its KPI cards, columns, and data tables to match
 * the exact context (Rooms, Police Register, Cashier Settlements, GST Tax,
 * Day Book, Mandi Store, Kitchen POS, Maintenance, Tally ERP, or D1 Database).
 */
export default function DateAuditSnapshotModal({
  isOpen,
  onClose,
  fromDate,
  toDate,
  title = "REAL-TIME AUDIT WINDOW SNAPSHOT",
  subtitle = "",
  moduleType = null,
  rooms = [],
  auditItems = null,
  columns = null,
  kpis = null,
  totalCount = null,
  totalAmount = null,
  onExportCSV = null,
  onExportExcel = null,
  onPrint = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Format date to Indian format DD/MM/YYYY
  const formatDisplayDate = (dStr) => {
    if (!dStr) return '';
    try {
      const [y, m, d] = dStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dStr;
    } catch {
      return dStr;
    }
  };

  // Compute duration
  const dateDuration = useMemo(() => {
    try {
      const d1 = new Date(fromDate + 'T00:00:00');
      const d2 = new Date(toDate + 'T00:00:00');
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return '1 Day Audit Snapshot (Same-Day View)';
      if (diffDays < 0) return 'Notice: To Date precedes From Date';
      return `${diffDays} Nights / ${diffDays + 1} Days Audit Range`;
    } catch {
      return 'Selected Audit Window';
    }
  }, [fromDate, toDate]);

  // Determine effective module type
  const effectiveModule = useMemo(() => {
    if (moduleType) return moduleType.toLowerCase();
    const t = (title || '').toLowerCase();
    if (t.includes('police')) return 'police';
    if (t.includes('cashier') || t.includes('settlement')) return 'cashier';
    if (t.includes('gst') || t.includes('tax')) return 'gst';
    if (t.includes('day-book') || t.includes('day book') || t.includes('petty cash')) return 'daybook';
    if (t.includes('corp') || t.includes('city ledger')) return 'corporate';
    if (t.includes('kitchen') || t.includes('kds') || t.includes('pos') || t.includes('food')) return 'pos';
    if (t.includes('store') || t.includes('purchase') || t.includes('requisition') || t.includes('inventory')) return 'store';
    if (t.includes('maintenance') || t.includes('ooo') || t.includes('work order')) return 'maintenance';
    if (t.includes('lost')) return 'lost-found';
    if (t.includes('transit') || t.includes('dayuse') || t.includes('day-use')) return 'transit';
    if (t.includes('tally')) return 'tally';
    if (t.includes('d1') || t.includes('database')) return 'd1';
    if (rooms && rooms.length > 0 && (!auditItems || auditItems.length === 0)) return 'rooms';
    if (auditItems && auditItems.length > 0) return 'generic';
    return 'rooms';
  }, [moduleType, title, rooms, auditItems]);

  // Active records array
  const rawItems = useMemo(() => {
    if (auditItems && Array.isArray(auditItems) && auditItems.length > 0) {
      return auditItems;
    }
    if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      return rooms;
    }
    return [];
  }, [auditItems, rooms]);

  // Dynamic search across all fields of any object
  const filteredItems = useMemo(() => {
    if (!rawItems || rawItems.length === 0) return [];
    let items = [...rawItems];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      items = items.filter(item => {
        if (!item || typeof item !== 'object') return false;
        return Object.values(item).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q);
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    if (statusFilter !== 'all') {
      items = items.filter(item => {
        const s = (item.status || item.effectiveStatus || item.paymentStatus || item.billStatus || '').toLowerCase();
        return s.includes(statusFilter.toLowerCase());
      });
    }

    return items;
  }, [rawItems, searchTerm, statusFilter]);

  // Specific KPI computations depending on module
  const computedStats = useMemo(() => {
    const count = filteredItems.length;

    if (effectiveModule === 'rooms') {
      const occupied = filteredItems.filter(r => (r.effectiveStatus || r.status || '').toLowerCase().includes('occupied')).length;
      const vacantClean = filteredItems.filter(r => (r.effectiveStatus || r.status) === 'Available' || (r.effectiveStatus || r.status) === 'Vacant Clean').length;
      const vacantDirty = filteredItems.filter(r => (r.effectiveStatus || r.status) === 'Vacant Dirty' || (r.effectiveStatus || r.status) === 'Cleaning').length;
      const ooo = filteredItems.filter(r => (r.effectiveStatus || r.status) === 'Maintenance' || (r.effectiveStatus || r.status) === 'OOO' || (r.effectiveStatus || r.status) === 'VIP Hold').length;
      const rev = filteredItems.reduce((sum, r) => {
        const isOcc = (r.effectiveStatus || r.status || '').toLowerCase().includes('occupied');
        return sum + (isOcc ? Number(r.effectiveTariff || r.tariff || 0) : 0);
      }, 0);
      const bal = filteredItems.reduce((sum, r) => sum + Number(r.effectiveBalanceDue || r.outstanding_balance || r.balanceDue || 0), 0);
      return [
        { label: 'Scope Keys', value: count, sub: 'Physical Inventory', color: '#38bdf8', icon: <Layers size={16} /> },
        { label: 'Occupied In-House', value: occupied, sub: `${count > 0 ? Math.round((occupied/count)*100) : 0}% Occupancy`, color: '#f59e0b', icon: <Bed size={16} /> },
        { label: 'Vacant Ready', value: vacantClean, sub: 'Clean & Inspected', color: '#10b981', icon: <CheckCircle2 size={16} /> },
        { label: 'Turnaround / OOO', value: vacantDirty + ooo, sub: `${vacantDirty} Dirty | ${ooo} OOO`, color: '#ec4899', icon: <AlertTriangle size={16} /> },
        { label: 'Tariff Revenue', value: `₹${(totalAmount || rev).toLocaleString('en-IN')}`, sub: 'Active Room Folios', color: '#60a5fa', icon: <TrendingUp size={16} /> },
        { label: 'Outstanding Balance', value: `₹${bal.toLocaleString('en-IN')}`, sub: 'Pending Check-out Due', color: bal > 0 ? '#ef4444' : '#10b981', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'police') {
      const interstate = filteredItems.filter(b => b.isInterstate || b.is_interstate || (b.stateOfOrigin && b.stateOfOrigin.toLowerCase() !== 'odisha')).length;
      const aadhaarVerified = filteredItems.filter(b => (b.idProofType || b.id_proof_type || '').toLowerCase().includes('aadhaar')).length;
      const totalRev = filteredItems.reduce((s, b) => s + Number(b.totalAmount || b.tariff || 0), 0);
      return [
        { label: 'Guest Registrations', value: count, sub: 'Audited Check-ins', color: '#38bdf8', icon: <User size={16} /> },
        { label: 'Interstate Guests', value: interstate, sub: `${count > 0 ? Math.round((interstate/count)*100) : 0}% Form-C Scope`, color: '#f59e0b', icon: <ShieldCheck size={16} /> },
        { label: 'Local / State Guests', value: count - interstate, sub: 'Odisha Residents', color: '#10b981', icon: <Building size={16} /> },
        { label: 'Aadhaar Verified', value: aadhaarVerified, sub: 'Masked UID / DigiLocker', color: '#a855f7', icon: <CheckCircle2 size={16} /> },
        { label: 'Registered Folio Sum', value: `₹${(totalAmount || totalRev).toLocaleString('en-IN')}`, sub: 'Total Stay Value', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'cashier') {
      const cashSum = filteredItems.reduce((s, c) => s + Number(c.cashTender || c.cash || 0), 0);
      const upiSum = filteredItems.reduce((s, c) => s + Number(c.upiTender || c.upi || 0), 0);
      const cardSum = filteredItems.reduce((s, c) => s + Number(c.cardTender || c.card || 0), 0);
      const gross = filteredItems.reduce((s, c) => s + Number(c.totalAmount || c.amount || 0), 0);
      return [
        { label: 'Settled Bills', value: count, sub: 'Front Desk Invoices', color: '#38bdf8', icon: <FileText size={16} /> },
        { label: 'Cash Drawer Collection', value: `₹${cashSum.toLocaleString('en-IN')}`, sub: 'Physical Cash Tender', color: '#10b981', icon: <IndianRupee size={16} /> },
        { label: 'UPI / QR Payments', value: `₹${upiSum.toLocaleString('en-IN')}`, sub: 'Direct Bank Settlement', color: '#8b5cf6', icon: <CreditCard size={16} /> },
        { label: 'Card & POS Swipes', value: `₹${cardSum.toLocaleString('en-IN')}`, sub: 'EDC Terminal Receipts', color: '#f59e0b', icon: <CreditCard size={16} /> },
        { label: 'Gross Net Realized', value: `₹${(totalAmount || gross).toLocaleString('en-IN')}`, sub: 'Shift Total Collection', color: '#34d399', icon: <TrendingUp size={16} /> }
      ];
    }

    if (effectiveModule === 'gst') {
      const taxable = filteredItems.reduce((s, g) => s + Number(g.taxableAmount || g.baseAmount || 0), 0);
      const cgst = filteredItems.reduce((s, g) => s + Number(g.cgst || (Number(g.taxableAmount || 0) * 0.025)), 0);
      const sgst = filteredItems.reduce((s, g) => s + Number(g.sgst || (Number(g.taxableAmount || 0) * 0.025)), 0);
      const gross = filteredItems.reduce((s, g) => s + Number(g.totalAmount || g.grandTotal || 0), 0);
      return [
        { label: 'B2B/B2C Invoices', value: count, sub: 'SAC 996311 (Accommodation)', color: '#38bdf8', icon: <FileText size={16} /> },
        { label: 'Taxable Turnover', value: `₹${taxable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Net Tariff Base', color: '#10b981', icon: <IndianRupee size={16} /> },
        { label: 'CGST 2.5%', value: `₹${cgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Central GST Output', color: '#f59e0b', icon: <TrendingUp size={16} /> },
        { label: 'SGST 2.5%', value: `₹${sgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Odisha State GST Output', color: '#ec4899', icon: <TrendingUp size={16} /> },
        { label: 'Total Invoiced Value', value: `₹${(totalAmount || gross).toLocaleString('en-IN')}`, sub: 'Inclusive of GST', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'daybook') {
      const debits = filteredItems.reduce((s, d) => s + (d.type === 'debit' || d.drCr === 'Dr' ? Number(d.amount || 0) : 0), 0);
      const credits = filteredItems.reduce((s, d) => s + (d.type === 'credit' || d.drCr === 'Cr' ? Number(d.amount || 0) : 0), 0);
      const net = credits - debits;
      return [
        { label: 'Audited Vouchers', value: count, sub: 'Day Book Entries', color: '#38bdf8', icon: <FileText size={16} /> },
        { label: 'Cash Inflows (Credits)', value: `₹${credits.toLocaleString('en-IN')}`, sub: 'Collections / Advances', color: '#10b981', icon: <TrendingUp size={16} /> },
        { label: 'Cash Outflows (Debits)', value: `₹${debits.toLocaleString('en-IN')}`, sub: 'Petty Expenses & Payouts', color: '#ef4444', icon: <AlertTriangle size={16} /> },
        { label: 'Net Cash Realization', value: `₹${net.toLocaleString('en-IN')}`, sub: 'Shift Cash Margin', color: net >= 0 ? '#34d399' : '#f87171', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'pos') {
      const gross = filteredItems.reduce((s, o) => {
        if (o.totalAmount) return s + Number(o.totalAmount);
        const itemSum = (o.items || []).reduce((sub, it) => sub + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
        return s + itemSum;
      }, 0);
      const tableOrders = filteredItems.filter(o => o.tableNumber || o.table_number || o.tableNo).length;
      return [
        { label: 'KOTs & Food Orders', value: count, sub: 'Restaurant & Room Service', color: '#38bdf8', icon: <Utensils size={16} /> },
        { label: 'Table Dining Orders', value: tableOrders, sub: 'Dine-In Operations', color: '#f59e0b', icon: <Building size={16} /> },
        { label: 'Room Service & Takeaway', value: count - tableOrders, sub: 'Direct In-Room Delivery', color: '#10b981', icon: <Bed size={16} /> },
        { label: 'Total Food Revenue', value: `₹${(totalAmount || gross).toLocaleString('en-IN')}`, sub: 'F&B Gross Sales', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'store') {
      const totalCost = filteredItems.reduce((s, p) => s + Number(p.totalAmount || p.amount || p.approxCost || 0), 0);
      const verified = filteredItems.filter(p => (p.paymentStatus || p.status || '').toLowerCase().includes('paid') || (p.status || '').toLowerCase().includes('approved')).length;
      return [
        { label: 'Stock Transactions', value: count, sub: 'Inward & Requisitions', color: '#38bdf8', icon: <ShoppingBag size={16} /> },
        { label: 'Approved & Settled', value: verified, sub: 'Inventory Verified', color: '#10b981', icon: <CheckCircle2 size={16} /> },
        { label: 'Pending / In-Transit', value: count - verified, sub: 'Pending Verification', color: '#f59e0b', icon: <Clock size={16} /> },
        { label: 'Total Inventory Spend', value: `₹${(totalAmount || totalCost).toLocaleString('en-IN')}`, sub: 'Mandi & Grocery Outflow', color: '#34d399', icon: <IndianRupee size={16} /> }
      ];
    }

    if (effectiveModule === 'maintenance') {
      const open = filteredItems.filter(m => (m.status || '').toLowerCase().includes('open') || (m.status || '').toLowerCase().includes('progress')).length;
      const resolved = filteredItems.filter(m => (m.status || '').toLowerCase().includes('resolved') || (m.status || '').toLowerCase().includes('completed')).length;
      return [
        { label: 'Work Orders', value: count, sub: 'Active Maintenance Logs', color: '#38bdf8', icon: <Wrench size={16} /> },
        { label: 'In Progress / Open', value: open, sub: 'Needs Engineering Attention', color: '#ef4444', icon: <AlertTriangle size={16} /> },
        { label: 'Resolved Tickets', value: resolved, sub: 'Verified & Fixed', color: '#10b981', icon: <CheckCircle2 size={16} /> }
      ];
    }

    // Generic Fallback KPIs
    const amt = totalAmount !== null ? totalAmount : filteredItems.reduce((s, it) => {
      const a = Number(it.amount || it.totalAmount || it.tariff || it.total || it.price || 0);
      return s + (isNaN(a) ? 0 : a);
    }, 0);

    return [
      { label: 'Total Audited Records', value: count, sub: 'Active Matching Rows', color: '#38bdf8', icon: <Database size={16} /> },
      { label: 'Audit Window Range', value: `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`, sub: dateDuration, color: '#f59e0b', icon: <Calendar size={16} /> },
      { label: 'Cumulative Valuation', value: amt > 0 ? `₹${amt.toLocaleString('en-IN')}` : `${count} Records Active`, sub: 'Transaction Metric', color: '#10b981', icon: <IndianRupee size={16} /> }
    ];
  }, [filteredItems, effectiveModule, fromDate, toDate, dateDuration, totalAmount]);

  // Dynamic CSV Export
  const handleUniversalCSVExport = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    if (!filteredItems || filteredItems.length === 0) return;

    let headers = [];
    let rows = [];

    if (effectiveModule === 'rooms') {
      headers = ["Room", "Floor", "Category", "Status", "Guest Name", "Phone", "Company", "Stay Period", "Tariff (Rs)", "Balance Due (Rs)"];
      rows = filteredItems.map(r => [
        r.roomNumber,
        r.floor,
        r.tier,
        r.effectiveStatus || r.status,
        `"${(r.effectiveGuestName || '').replace(/"/g, '""')}"`,
        `"${r.effectivePhone || ''}"`,
        `"${(r.effectiveCompany || '').replace(/"/g, '""')}"`,
        `"${r.effectiveStayPeriod || ''}"`,
        r.effectiveTariff || r.tariff || 0,
        r.effectiveBalanceDue || r.outstanding_balance || r.balanceDue || 0
      ]);
    } else if (effectiveModule === 'police') {
      headers = ["Room", "Guest Name", "Phone", "ID Proof", "Origin State", "Interstate", "Check In", "Check Out", "Tariff"];
      rows = filteredItems.map(b => [
        b.roomNumber || b.room_number,
        `"${(b.guestName || b.guest_name || '').replace(/"/g, '""')}"`,
        `"${b.guestPhone || b.guest_phone || ''}"`,
        `"${b.idProofMasked || b.id_proof_masked || b.idProofType || ''}"`,
        `"${b.stateOfOrigin || b.state_of_origin || 'Odisha'}"`,
        b.isInterstate || b.is_interstate ? "Yes" : "No",
        b.checkInDate || b.check_in_date,
        b.checkOutDate || b.check_out_date,
        b.totalAmount || b.tariff || 0
      ]);
    } else if (effectiveModule === 'cashier') {
      headers = ["Bill No", "Date", "Room", "Guest Name", "Total Bill", "Cash", "UPI", "Card", "Status", "Cashier"];
      rows = filteredItems.map(c => [
        c.billNumber || c.bill_number || c.id,
        c.date || c.settlement_date,
        c.roomNumber || c.room_number,
        `"${(c.guestName || c.guest_name || '').replace(/"/g, '""')}"`,
        c.totalAmount || c.amount || 0,
        c.cashTender || c.cash || 0,
        c.upiTender || c.upi || 0,
        c.cardTender || c.card || 0,
        c.status || c.paymentStatus,
        c.cashierName || c.cashier || ''
      ]);
    } else if (effectiveModule === 'gst') {
      headers = ["Invoice No", "Date", "Room", "Guest/Entity", "GSTIN", "Taxable Base", "CGST 2.5%", "SGST 2.5%", "Total Amount"];
      rows = filteredItems.map(g => [
        g.invoiceNo || g.invoice_number,
        g.date,
        g.roomNumber || g.room_number,
        `"${(g.guestName || g.companyName || '').replace(/"/g, '""')}"`,
        g.gstin || 'Unregistered',
        g.taxableAmount || 0,
        g.cgst || (Number(g.taxableAmount || 0) * 0.025),
        g.sgst || (Number(g.taxableAmount || 0) * 0.025),
        g.totalAmount || 0
      ]);
    } else {
      // Auto-extract headers from first record
      const sample = filteredItems[0];
      const keys = Object.keys(sample).filter(k => typeof sample[k] !== 'object');
      headers = keys.map(k => k.replace(/_/g, ' ').toUpperCase());
      rows = filteredItems.map(item => keys.map(k => `"${String(item[k] ?? '').replace(/"/g, '""')}"`));
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${fromDate}_to_${toDate}.csv`;
    link.click();
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        padding: '1.25rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '1380px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a101d',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 40px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* TOP MODAL HEADER */}
        <div 
          style={{
            padding: '1.1rem 1.6rem',
            background: 'linear-gradient(135deg, #071329 0%, #0d2347 100%)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {effectiveModule === 'rooms' ? <Bed size={22} /> :
               effectiveModule === 'police' ? <ShieldCheck size={22} /> :
               effectiveModule === 'cashier' ? <CreditCard size={22} /> :
               effectiveModule === 'gst' ? <FileText size={22} /> :
               effectiveModule === 'pos' ? <Utensils size={22} /> :
               effectiveModule === 'store' ? <ShoppingBag size={22} /> :
               effectiveModule === 'maintenance' ? <Wrench size={22} /> :
               <Database size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                  {title}
                </h2>
                <span 
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={11} /> LIVE D1 SYNCED
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                {subtitle || `Hotel Sai International, Balasore • Contextual Module Ledger: ${effectiveModule.toUpperCase()}`}
              </p>
            </div>
          </div>

          {/* DATE RANGE BADGE & ACTIONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#e2e8f0'
              }}
            >
              <Calendar size={14} style={{ color: '#38bdf8' }} />
              <span><strong>From:</strong> {formatDisplayDate(fromDate)}</span>
              <ArrowRight size={12} style={{ color: '#64748b' }} />
              <span><strong>To:</strong> {formatDisplayDate(toDate)}</span>
              <span 
                style={{
                  marginLeft: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {dateDuration}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <button
              onClick={handleUniversalCSVExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Download filtered dataset as CSV"
            >
              <Download size={14} /> CSV
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Print official audit ledger"
            >
              <Printer size={14} /> Print
            </button>

            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close Audit Window (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* STATS & KPI STRIP */}
        <div 
          style={{
            padding: '1rem 1.6rem',
            background: '#070d18',
            borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
            gap: '12px'
          }}
        >
          {computedStats.map((kpi, idx) => (
            <div 
              key={idx}
              style={{
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: `1px solid ${kpi.color}35`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }}
            >
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: `${kpi.color}20`,
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {kpi.icon}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '1px 0' }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.68rem', color: kpi.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {kpi.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div 
          style={{
            padding: '0.75rem 1.6rem',
            background: '#091222',
            borderBottom: '1px solid rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${effectiveModule.toUpperCase()} records by any keyword, party, room, amount, or ID...`}
              style={{
                width: '100%',
                padding: '7px 12px 7px 36px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <X 
                size={14} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
              Showing <strong style={{ color: '#38bdf8' }}>{filteredItems.length}</strong> of {rawItems.length} entries
            </span>
          </div>
        </div>

        {/* TABULAR CONTENT AREA */}
        <div style={{ flex: 1, overflow: 'auto', background: '#070d18' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
              <AlertTriangle size={36} style={{ margin: '0 auto 12px', color: '#f59e0b', opacity: 0.8 }} />
              <h4 style={{ margin: '0 0 6px', color: '#e2e8f0', fontSize: '1.05rem' }}>No Records Match Current Filter</h4>
              <p style={{ margin: 0, fontSize: '0.84rem' }}>
                No active data points found for module "{effectiveModule}" between {formatDisplayDate(fromDate)} and {formatDisplayDate(toDate)}.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#0b162c', color: '#94a3b8', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', position: 'sticky', top: 0, zIndex: 10 }}>
                  {effectiveModule === 'rooms' && (
                    <>
                      <th style={{ padding: '10px 14px', width: '80px' }}>ROOM #</th>
                      <th style={{ padding: '10px 14px', width: '80px' }}>FLOOR</th>
                      <th style={{ padding: '10px 14px' }}>CATEGORY</th>
                      <th style={{ padding: '10px 14px' }}>STATUS</th>
                      <th style={{ padding: '10px 14px' }}>IN-HOUSE GUEST</th>
                      <th style={{ padding: '10px 14px' }}>PHONE</th>
                      <th style={{ padding: '10px 14px' }}>STAY PERIOD</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>TARIFF</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>BALANCE DUE</th>
                    </>
                  )}

                  {effectiveModule === 'police' && (
                    <>
                      <th style={{ padding: '10px 14px', width: '80px' }}>ROOM #</th>
                      <th style={{ padding: '10px 14px' }}>GUEST FULL NAME</th>
                      <th style={{ padding: '10px 14px' }}>MOBILE</th>
                      <th style={{ padding: '10px 14px' }}>ID PROOF / AADHAAR</th>
                      <th style={{ padding: '10px 14px' }}>STATE OF ORIGIN</th>
                      <th style={{ padding: '10px 14px' }}>INTERSTATE?</th>
                      <th style={{ padding: '10px 14px' }}>CHECK-IN</th>
                      <th style={{ padding: '10px 14px' }}>CHECK-OUT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>FOLIO VALUE</th>
                    </>
                  )}

                  {effectiveModule === 'cashier' && (
                    <>
                      <th style={{ padding: '10px 14px' }}>BILL / FOLIO #</th>
                      <th style={{ padding: '10px 14px' }}>DATE / TIME</th>
                      <th style={{ padding: '10px 14px', width: '80px' }}>ROOM</th>
                      <th style={{ padding: '10px 14px' }}>GUEST NAME</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>CASH</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>UPI / DIGITAL</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>CARD / OTHER</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>TOTAL AMOUNT</th>
                      <th style={{ padding: '10px 14px' }}>CASHIER</th>
                    </>
                  )}

                  {effectiveModule === 'gst' && (
                    <>
                      <th style={{ padding: '10px 14px' }}>INVOICE #</th>
                      <th style={{ padding: '10px 14px' }}>DATE</th>
                      <th style={{ padding: '10px 14px', width: '80px' }}>ROOM</th>
                      <th style={{ padding: '10px 14px' }}>GUEST / CORPORATE ENTITY</th>
                      <th style={{ padding: '10px 14px' }}>GSTIN</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>TAXABLE BASE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>CGST (2.5%)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>SGST (2.5%)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>GROSS INVOICED</th>
                    </>
                  )}

                  {effectiveModule === 'daybook' && (
                    <>
                      <th style={{ padding: '10px 14px' }}>VOUCHER #</th>
                      <th style={{ padding: '10px 14px' }}>DATE / TIME</th>
                      <th style={{ padding: '10px 14px' }}>ACCOUNT HEAD</th>
                      <th style={{ padding: '10px 14px' }}>PARTICULARS</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>DEBIT (DR)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>CREDIT (CR)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>BALANCE</th>
                      <th style={{ padding: '10px 14px' }}>STATUS</th>
                    </>
                  )}

                  {effectiveModule === 'pos' && (
                    <>
                      <th style={{ padding: '10px 14px' }}>ORDER / KOT #</th>
                      <th style={{ padding: '10px 14px' }}>TABLE #</th>
                      <th style={{ padding: '10px 14px' }}>STEWARD</th>
                      <th style={{ padding: '10px 14px' }}>ITEMS SUMMARY</th>
                      <th style={{ padding: '10px 14px' }}>TYPE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>AMOUNT</th>
                      <th style={{ padding: '10px 14px' }}>STATUS</th>
                    </>
                  )}

                  {effectiveModule === 'store' && (
                    <>
                      <th style={{ padding: '10px 14px' }}>PO / REQ #</th>
                      <th style={{ padding: '10px 14px' }}>VENDOR / DEPT</th>
                      <th style={{ padding: '10px 14px' }}>CATEGORY</th>
                      <th style={{ padding: '10px 14px' }}>ITEMS / SPECIFICATION</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>TOTAL AMOUNT</th>
                      <th style={{ padding: '10px 14px' }}>STATUS</th>
                      <th style={{ padding: '10px 14px' }}>RECEIVED BY</th>
                    </>
                  )}

                  {effectiveModule === 'maintenance' && (
                    <>
                      <th style={{ padding: '10px 14px' }}>TICKET #</th>
                      <th style={{ padding: '10px 14px', width: '80px' }}>ROOM #</th>
                      <th style={{ padding: '10px 14px' }}>CATEGORY</th>
                      <th style={{ padding: '10px 14px' }}>ISSUE DESCRIPTION</th>
                      <th style={{ padding: '10px 14px' }}>TECHNICIAN</th>
                      <th style={{ padding: '10px 14px' }}>PRIORITY</th>
                      <th style={{ padding: '10px 14px' }}>STATUS</th>
                    </>
                  )}

                  {/* Fallback Dynamic Headers for other datasets */}
                  {!['rooms', 'police', 'cashier', 'gst', 'daybook', 'pos', 'store', 'maintenance'].includes(effectiveModule) && (
                    columns ? columns.map((col, idx) => (
                      <th key={idx} style={{ padding: '10px 14px', textAlign: col.align || 'left' }}>
                        {col.label || col.key}
                      </th>
                    )) : (
                      Object.keys(filteredItems[0] || {}).slice(0, 8).map((k, idx) => (
                        <th key={idx} style={{ padding: '10px 14px' }}>
                          {k.replace(/_/g, ' ').toUpperCase()}
                        </th>
                      ))
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  const rowBg = isEven ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.7)';

                  if (effectiveModule === 'rooms') {
                    const status = item.effectiveStatus || item.status || 'Available';
                    const isOcc = status.toLowerCase().includes('occupied');
                    const isClean = status === 'Available' || status === 'Vacant Clean';
                    const isOoo = status === 'Maintenance' || status === 'OOO';
                    const bal = Number(item.effectiveBalanceDue || item.outstanding_balance || item.balanceDue || 0);

                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#38bdf8' }}>{item.roomNumber}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>F{item.floor}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{item.tier}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span 
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isOcc ? 'rgba(245, 158, 11, 0.2)' : isClean ? 'rgba(16, 185, 129, 0.2)' : isOoo ? 'rgba(239, 68, 68, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                              color: isOcc ? '#fbbf24' : isClean ? '#34d399' : isOoo ? '#f87171' : '#f472b6',
                              border: `1px solid ${isOcc ? '#f59e0b44' : isClean ? '#10b98144' : '#ef444444'}`
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#ffffff', fontWeight: 600 }}>{item.effectiveGuestName || '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.effectivePhone || '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{item.effectiveStayPeriod || '—'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#e2e8f0' }}>
                          {item.effectiveTariff ? `₹${Number(item.effectiveTariff).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: bal > 0 ? '#f87171' : '#34d399' }}>
                          {bal > 0 ? `₹${bal.toLocaleString('en-IN')}` : '₹0'}
                        </td>
                      </tr>
                    );
                  }

                  if (effectiveModule === 'police') {
                    const isInter = item.isInterstate || item.is_interstate;
                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#38bdf8' }}>{item.roomNumber || item.room_number}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>{item.guestName || item.guest_name}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.guestPhone || item.guest_phone || '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>
                          <span style={{ padding: '2px 6px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '4px', color: '#38bdf8', fontSize: '0.72rem' }}>
                            {item.idProofMasked || item.id_proof_masked || item.idProofType || 'Aadhaar'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{item.stateOfOrigin || item.state_of_origin || 'Odisha'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
                            background: isInter ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isInter ? '#f87171' : '#34d399'
                          }}>
                            {isInter ? 'Interstate' : 'Local State'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.checkInDate || item.check_in_date}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.checkOutDate || item.check_out_date}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#e2e8f0' }}>
                          ₹{Number(item.totalAmount || item.tariff || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  }

                  if (effectiveModule === 'cashier') {
                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.billNumber || item.id || `BIL-${idx+101}`}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.date || item.settlement_date || fromDate}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{item.roomNumber || item.room_number || '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#ffffff', fontWeight: 600 }}>{item.guestName || item.guest_name || 'Guest'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#34d399' }}>₹{Number(item.cashTender || item.cash || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#818cf8' }}>₹{Number(item.upiTender || item.upi || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>₹{Number(item.cardTender || item.card || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#ffffff' }}>
                          ₹{Number(item.totalAmount || item.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.cashierName || item.cashier || 'Front Desk'}</td>
                      </tr>
                    );
                  }

                  if (effectiveModule === 'gst') {
                    const taxable = Number(item.taxableAmount || 0);
                    const cgst = Number(item.cgst || (taxable * 0.025));
                    const sgst = Number(item.sgst || (taxable * 0.025));
                    const tot = Number(item.totalAmount || (taxable + cgst + sgst));
                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.invoiceNo || item.invoice_number || `INV-${idx+1}`}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.date || fromDate}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{item.roomNumber || item.room_number || '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#ffffff', fontWeight: 600 }}>{item.guestName || item.companyName || 'Guest'}</td>
                        <td style={{ padding: '10px 14px', color: '#a78bfa' }}>{item.gstin || 'Unregistered'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e2e8f0' }}>₹{taxable.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>₹{cgst.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f472b6' }}>₹{sgst.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>₹{tot.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  }

                  if (effectiveModule === 'daybook') {
                    const isDr = item.type === 'debit' || item.drCr === 'Dr';
                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.voucherNo || item.voucher_no || item.id}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.date || item.timestamp}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1', fontWeight: 600 }}>{item.accountHead || item.category}</td>
                        <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{item.particulars || item.description || item.narration}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: isDr ? '#f87171' : '#64748b' }}>
                          {isDr ? `₹${Number(item.amount).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: !isDr ? '#34d399' : '#64748b' }}>
                          {!isDr ? `₹${Number(item.amount).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#e2e8f0' }}>
                          ₹{Number(item.balance || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                            Posted
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  if (effectiveModule === 'pos') {
                    const amt = item.totalAmount || (item.items || []).reduce((s, it) => s + (it.price * it.quantity), 0);
                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.orderId || item.kotId || item.id}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fbbf24' }}>{item.tableNumber || item.tableNo || 'Room Svc'}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{item.stewardName || item.waiter || 'Steward'}</td>
                        <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>
                          {item.itemsSummary || (item.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ') || 'F&B Items'}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.orderType || 'Dine-In'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                          ₹{Number(amt).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                            {item.status || 'Settled'}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  if (effectiveModule === 'store') {
                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.purchaseId || item.reqId || item.id}</td>
                        <td style={{ padding: '10px 14px', color: '#ffffff', fontWeight: 600 }}>{item.vendorName || item.department || 'Vendor'}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{item.category || 'Store'}</td>
                        <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{item.itemsSummary || item.itemName || 'Supplies'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                          ₹{Number(item.totalAmount || item.amount || item.approxCost || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                            {item.paymentStatus || item.status || 'Received'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.receivedBy || item.approvedBy || 'Store Manager'}</td>
                      </tr>
                    );
                  }

                  if (effectiveModule === 'maintenance') {
                    return (
                      <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>{item.ticketId || item.id || `WO-${idx+1}`}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#fbbf24' }}>{item.roomNumber || item.room_number || 'General'}</td>
                        <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{item.category || item.issueCategory}</td>
                        <td style={{ padding: '10px 14px', color: '#e2e8f0' }}>{item.description || item.issueDescription}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.technician || item.assignedTo || 'Duty Tech'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: item.priority === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: item.priority === 'High' ? '#f87171' : '#fbbf24' }}>
                            {item.priority || 'Normal'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                            {item.status || 'Open'}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  // Generic Fallback Row
                  return (
                    <tr key={idx} style={{ background: rowBg, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      {columns ? columns.map((col, cIdx) => (
                        <td key={cIdx} style={{ padding: '10px 14px', textAlign: col.align || 'left', color: '#e2e8f0' }}>
                          {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '—')}
                        </td>
                      )) : (
                        Object.keys(item).slice(0, 8).map((k, kIdx) => (
                          <td key={kIdx} style={{ padding: '10px 14px', color: '#e2e8f0' }}>
                            {typeof item[k] === 'object' ? JSON.stringify(item[k]) : String(item[k] ?? '—')}
                          </td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div 
          style={{
            padding: '0.85rem 1.6rem',
            background: '#07101f',
            borderTop: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Cryptographically Verified Audit Window • Hotel Sai International Management Console</span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px 18px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
            }}
          >
            Close Audit Snapshot
          </button>
        </div>
      </div>
    </div>
  );
}
