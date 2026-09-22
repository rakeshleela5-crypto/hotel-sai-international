import React, { useState } from 'react';
import { 
  Package, ShoppingCart, Plus, CheckCircle2, Clock, 
  DollarSign, FileText, X, AlertTriangle, Truck
} from 'lucide-react';
import { INITIAL_STORE_PURCHASES, INITIAL_KITCHEN_REQUISITIONS } from '../data/hotelData';

export default function StoreInventoryModal({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases', 'requisitions', 'vendor-payables'
  const [purchases, setPurchases] = useState(INITIAL_STORE_PURCHASES);
  const [requisitions, setRequisitions] = useState(INITIAL_KITCHEN_REQUISITIONS);

  // New Purchase State
  const [newPurchaseOpen, setNewPurchaseOpen] = useState(false);
  const [vendorName, setVendorName] = useState('Rayagada Daily Sabzi Mandi');
  const [category, setCategory] = useState('Vegetables');
  const [itemsSummary, setItemsSummary] = useState('');
  const [amount, setAmount] = useState('');
  const [payStatus, setPayStatus] = useState('Cash Paid');

  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const creditPayables = purchases.filter(p => p.paymentStatus === 'Credit Payable').reduce((sum, p) => sum + p.totalAmount, 0);

  const handleAddPurchase = (e) => {
    e.preventDefault();
    if (!itemsSummary || !amount) return;

    const newP = {
      purchaseId: `PUR-202609-00${purchases.length + 1}`,
      vendorName,
      invoiceNo: `MND-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      category,
      itemsSummary,
      totalAmount: parseFloat(amount),
      paymentStatus: payStatus,
      receivedBy: "Chef Jagabandhu Sahu"
    };

    setPurchases([newP, ...purchases]);
    setNewPurchaseOpen(false);
    setItemsSummary('');
    setAmount('');
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
        maxWidth: 1150,
        height: '88vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(90deg, rgba(15,30,25,0.95), rgba(10,20,15,0.98))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981' }}>
                FOOD COST CONTROL
              </span>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Store Inventory & Mandi Raw Material Purchases
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Daily local vegetable, dairy & poultry inward register • Kitchen consumption requisition vouchers
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
            onClick={() => setActiveTab('purchases')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'purchases' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'purchases' ? '#34d399' : 'var(--text-muted)',
              border: activeTab === 'purchases' ? '1px solid #34d399' : '1px solid transparent'
            }}
          >
            <ShoppingCart size={15} /> Inward Purchases Register ({purchases.length})
          </button>

          <button
            onClick={() => setActiveTab('requisitions')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'requisitions' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'requisitions' ? '#38bdf8' : 'var(--text-muted)',
              border: activeTab === 'requisitions' ? '1px solid #38bdf8' : '1px solid transparent'
            }}
          >
            <Package size={15} /> Kitchen Issue Requisitions ({requisitions.length})
          </button>

          <button
            onClick={() => setActiveTab('vendor-payables')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'vendor-payables' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'vendor-payables' ? '#fbbf24' : 'var(--text-muted)',
              border: activeTab === 'vendor-payables' ? '1px solid #fbbf24' : '1px solid transparent'
            }}
          >
            <DollarSign size={15} /> 🏪 Rayagada Vendor Credit Ledger (₹48,650)
          </button>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {activeTab === 'purchases' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Purchases Recorded:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>₹{totalPurchases.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendor Credit Payables:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>₹{creditPayables.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <button
                  onClick={() => setNewPurchaseOpen(true)}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#10b981', color: '#000' }}
                >
                  <Plus size={16} /> Record Mandi Inward Purchase
                </button>
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Date / Purchase ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Vendor Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Items Summary</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Payment Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(p => (
                    <tr key={p.purchaseId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{p.purchaseId}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.date} • {p.invoiceNo}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.vendorName}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}>{p.itemsSummary}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                        ₹{p.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span className="badge" style={{
                          background: p.paymentStatus === 'Credit Payable' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                          color: p.paymentStatus === 'Credit Payable' ? '#f87171' : '#34d399',
                          fontSize: '0.75rem'
                        }}>
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Local Rayagada Vendor Credit Ledger */}
          {activeTab === 'vendor-payables' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>Rayagada Local Vendor &amp; Supplier Credit Ledger</h4>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Tracks purchases, payments, and outstanding balances to local vegetable, poultry, dairy &amp; grocery suppliers.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => alert('Printing Consolidated Vendor Payment Sheet for Managing Director Eswara')}
                    className="btn-outline"
                    style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderColor: '#fbbf24', color: '#fbbf24' }}
                  >
                    <FileText size={15} /> Print Vendor Sheet
                  </button>
                </div>
              </div>

              {/* Vendor KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Inward Purchases (Sep 2026)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>₹1,38,050.00</div>
                </div>

                <div style={{ background: 'rgba(52, 211, 153, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Total Paid to Vendors (Bank/Cash)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>₹89,400.00</div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Total Net Vendor Payables</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171' }}>₹48,650.00</div>
                </div>
              </div>

              {/* Vendor Table */}
              <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Vendor Name</th>
                      <th style={{ padding: '0.75rem' }}>Category</th>
                      <th style={{ padding: '0.75rem' }}>Contact Person</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Supplies (₹)</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Paid Amount (₹)</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Outstanding Due (₹)</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Maa Majhighariani Daily Sabzi Mandi', cat: 'Fresh Vegetables & Herbs', contact: 'Kishore Sahu (+91 94371 88201)', supplies: 24800, paid: 18000, due: 6800 },
                      { name: 'Rayagada Broiler & Mutton Center', cat: 'Poultry, Chicken & Mutton Cuts', contact: 'M. Ramesh (+91 98612 44902)', supplies: 46500, paid: 32000, due: 14500 },
                      { name: 'Om Sai Dairy & Milk Cooperative', cat: 'Pure Milk, Paneer, Curd, Butter', contact: 'G. Patnaik (+91 82490 33811)', supplies: 18400, paid: 12000, due: 6400 },
                      { name: 'Pooja Grocery & Spices Wholesale', cat: 'Basmati Rice, Dal, Edible Oil, Spices', contact: 'Suresh Agarwal (+91 94370 22105)', supplies: 35900, paid: 20000, due: 15900 },
                      { name: 'Rayagada Commercial Gas Agency', cat: 'Commercial 19kg LPG Cylinders', contact: 'Delivery Desk (+91 06856 22214)', supplies: 12450, paid: 7400, due: 5050 }
                    ].map((v, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.7rem 0.75rem', fontWeight: 600, color: '#fff' }}>{v.name}</td>
                        <td style={{ padding: '0.7rem 0.75rem', color: '#cbd5e1' }}>{v.cat}</td>
                        <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-muted)' }}>{v.contact}</td>
                        <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', color: '#38bdf8' }}>₹{v.supplies.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', color: '#34d399' }}>₹{v.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#f87171' }}>₹{v.due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>
                          <button
                            onClick={() => alert(`Recording Cash/Cheque Payment Voucher for ${v.name}`)}
                            className="btn-outline-gold"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Pay Voucher
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 800 }}>
                      <td colSpan={3} style={{ padding: '0.75rem', color: 'var(--gold-glow)' }}>TOTAL VENDOR OUTSTANDING</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#38bdf8' }}>₹1,38,050.00</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399' }}>₹89,400.00</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171' }}>₹48,650.00</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requisitions' && (
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Cannon Kitchen Consumption Logs</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Stock transferred from Main Store to Head Chef Jagabandhu Sahu to prevent raw material pilferage.
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Requisition #</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Raw Material Item</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Quantity Issued</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Est. Cost (₹)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Issued To</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions.map(r => (
                    <tr key={r.requisitionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fbbf24' }}>{r.requisitionId}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{r.date}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>{r.itemName}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#38bdf8', fontWeight: 600 }}>
                        {r.quantity} {r.unit}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>
                        ₹{r.approxCost.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{r.issuedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: New Purchase */}
        {newPurchaseOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', margin: 0 }}>Record Mandi Inward Purchase</h4>
                <button onClick={() => setNewPurchaseOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddPurchase}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Local Vendor</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="Vegetables">Vegetables & Mandi Produce</option>
                    <option value="Poultry & Meat">Poultry & Fresh Country Chicken</option>
                    <option value="Dairy & Paneer">Dairy, Milk & Fresh Paneer</option>
                    <option value="Groceries & Rice">Groceries, Basmati Rice & Spices</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Items Summary & Quantities</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Tomatoes (25kg), Potatoes (40kg), Fresh Coriander"
                    value={itemsSummary}
                    onChange={(e) => setItemsSummary(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Total Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 3500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Payment Status</label>
                    <select
                      value={payStatus}
                      onChange={(e) => setPayStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', background: '#0d111d', color: '#fff', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <option value="Cash Paid">Cash Paid</option>
                      <option value="UPI Paid">UPI Paid</option>
                      <option value="Credit Payable">Credit Payable (Vendor Ledger)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setNewPurchaseOpen(false)} className="btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', background: '#10b981', color: '#000' }}>
                    Save Inward Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
