import React, { useState } from 'react';
import { Calendar, Download, Printer, FileSpreadsheet, RefreshCw, FileText } from 'lucide-react';

/**
 * UniversalDateFilterBar
 * Authentic MysoftIndia enterprise Date Range Controller
 * "From : [ Date ]   To : [ Date ]   [ Display ]"
 */
export default function UniversalDateFilterBar({
  fromDate,
  toDate,
  onDateChange,
  onDisplay,
  title = '',
  totalCount = null,
  totalAmount = null,
  onExportCSV = null,
  onExportExcel = null,
  onPrint = null,
  showPresets = true,
  compact = false
}) {
  const [internalFrom, setInternalFrom] = useState(fromDate || new Date().toISOString().slice(0, 10));
  const [internalTo, setInternalTo] = useState(toDate || new Date().toISOString().slice(0, 10));

  const formatMysoftDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleApply = () => {
    if (onDateChange) {
      onDateChange(internalFrom, internalTo);
    }
    if (onDisplay) {
      onDisplay(internalFrom, internalTo);
    }
  };

  const setPreset = (type) => {
    const today = new Date();
    let f = today.toISOString().slice(0, 10);
    let t = today.toISOString().slice(0, 10);

    if (type === 'today') {
      // today to today
    } else if (type === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      f = y.toISOString().slice(0, 10);
      t = y.toISOString().slice(0, 10);
    } else if (type === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 6);
      f = past.toISOString().slice(0, 10);
    } else if (type === 'thisMonth') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      f = first.toISOString().slice(0, 10);
    } else if (type === 'lastMonth') {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      f = first.toISOString().slice(0, 10);
      t = last.toISOString().slice(0, 10);
    } else if (type === 'year') {
      const first = new Date(today.getFullYear(), 3, 1); // Indian FY starting April
      if (today.getMonth() < 3) first.setFullYear(today.getFullYear() - 1);
      f = first.toISOString().slice(0, 10);
    }

    setInternalFrom(f);
    setInternalTo(t);
    if (onDateChange) onDateChange(f, t);
    if (onDisplay) onDisplay(f, t);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      background: 'linear-gradient(135deg, #091322 0%, #0d1e35 100%)',
      border: '1.5px solid rgba(56, 189, 248, 0.4)',
      borderRadius: '8px',
      padding: compact ? '8px 12px' : '10px 16px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
      marginBottom: '1rem',
      width: '100%'
    }}>
      {/* Top Line: Date Pickers & Display Green Button (Authentic Mysoft Screenshot Style) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', fontWeight: 800 }}>From :</span>
            <input
              type="date"
              value={internalFrom}
              onChange={(e) => {
                setInternalFrom(e.target.value);
                if (onDateChange) onDateChange(e.target.value, internalTo);
              }}
              style={{
                background: '#030812',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--gold-glow)', fontWeight: 800 }}>To :</span>
            <input
              type="date"
              value={internalTo}
              onChange={(e) => {
                setInternalTo(e.target.value);
                if (onDateChange) onDateChange(internalFrom, e.target.value);
              }}
              style={{
                background: '#030812',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          {/* Authentic Mysoft Green Display Button */}
          <button
            type="button"
            onClick={handleApply}
            style={{
              background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
              border: '1px solid #4ade80',
              borderRadius: '5px',
              color: '#ffffff',
              padding: '4px 18px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(22, 101, 52, 0.45)',
              transition: 'all 0.15s ease'
            }}
            title="Filter records between selected dates"
          >
            Display
          </button>

          {/* Quick Presets */}
          {showPresets && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: 'thisMonth', label: 'This Month' },
                { id: 'year', label: 'FY Year' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    color: '#94a3b8',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Tools: CSV, Excel, Print, PDF as shown in Mysoft Photo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {onExportCSV && (
            <button
              type="button"
              onClick={onExportCSV}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#cbd5e1',
                borderRadius: '4px',
                padding: '3px 9px',
                fontSize: '0.73rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Export filtered records to CSV"
            >
              CSV
            </button>
          )}

          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#cbd5e1',
                borderRadius: '4px',
                padding: '3px 9px',
                fontSize: '0.73rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Export to Excel Spreadsheet"
            >
              Excel
            </button>
          )}

          <button
            type="button"
            onClick={onPrint || (() => window.print())}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#cbd5e1',
              borderRadius: '4px',
              padding: '3px 9px',
              fontSize: '0.73rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Print Current Filtered View"
          >
            Print
          </button>
        </div>
      </div>

      {/* Dynamic Report Header Banner matching Mysoft screenshot */}
      {title && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '5px'
        }}>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#fbbf24',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            {title} FROM {formatMysoftDate(internalFrom)} TO {formatMysoftDate(internalTo)}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {totalCount !== null && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Records: <strong style={{ color: '#fff' }}>{totalCount}</strong>
              </span>
            )}
            {totalAmount !== null && (
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>
                Total: ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
