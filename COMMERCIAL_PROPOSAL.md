# COMMERCIAL PROPOSAL & ENTERPRISE SOFTWARE QUOTATION

**DOCUMENT REFERENCE:** `PROP-SAI-2026-SEP-01`  
**DATE OF ISSUANCE:** September 22, 2026  
**PROPOSAL VALIDITY:** Until October 15, 2026 (Post-September 25th Decision Window)

---

### PRESENTED TO:
* **Managing Director Eswara**  
  *Managing Director & Primary Shareholder*  
  Hotel Sai International Pvt Ltd, J.K. Road, Rayagada, Odisha – 765001  
  GSTIN: `21AABCH7663L1ZG`

* **Mr. Shravan Patnaik**  
  *Senior Hospitality & Operations Consultant*  
  Hotel Sai International

### PRESENTED BY:
* **Rakesh (Lead Developer & Edge Solutions Architect)**  
  *Antigravity Edge Cloud Systems*

---

## 1. Executive Summary & Problem Resolution

Following our comprehensive on-site meeting and live software demonstration on **September 21, 2026**, this proposal provides an enterprise-tier replacement for your legacy Windows-based hotel software (**MySoft**).

### A. Resolution of Critical Flaws in Current Software (MySoft)
1. **The ₹17,000 Unreconciled Reporting Discrepancy:**
   * *Problem:* In your live demonstration, the Sales Flash report showed **₹5,06,000.00**, while the Sales Summary showed **₹4,89,000.00**—leaving a ₹17,000 discrepancy that paralyzes your CA and prevents GST filing.
   * *Resolution:* Our solution operates on strict double-entry ledgering where `Gross Billed (Accrual) === Realized Collections (Cash + UPI + Card + BTC Ledger) + Outstanding`. Every night audit certifies an audit variance of **₹0.00**.
2. **The ₹0.00 Food & Beverage Checkout Bug:**
   * *Problem:* In MySoft (`reports/checkout/sales_summary.php`), dining charges posted to room folios routinely drop to zero, corrupting food revenue statements.
   * *Resolution:* Room dining lines posted from Cannon Kitchen remain permanently linked to the master folio under SAC `996331` (5% GST) without loss or corruption.
3. **Multi-Director Remote Visibility:**
   * *Problem:* Directors residing in Visakhapatnam and Bhubaneswar have zero remote visibility without asking staff for scanned thermal printouts.
   * *Resolution:* Cloudflare Edge architecture allows directors to view real-time occupancy, collections by payment mode, and revenue projections securely from any smartphone or tablet.

---

## 2. Operational Scope of Deliverables

| Module | Operational Scope & Features |
| :--- | :--- |
| **1. Front Desk & 39 Keys** | • Authentic 39-room physical inventory (`201-208`, `301-316`, `401-416`).<br>• Visual Tape Chart view with color-coded occupancy and maintenance blocks (`309 AC PRBLM`).<br>• 5-stage housekeeping room turnover lifecycle (`Vacant Clean`, `Vacant Dirty`, `Occupied Clean`, `Occupied Dirty`, `OOO`). |
| **2. Split Invoicing & Multi-Tender** | • **Split Tax Invoicing Mode (Room 402 Standard):** Instant generation of Bill A (Room Tariff, SAC 996311, 12% GST to Company GSTIN) & Bill B (Cannon Kitchen Food, SAC 996331, 5% GST to Guest Personal).<br>• **Multi-Tender Checkout:** Seamless split settlement across Cash, PhonePe/UPI, Card Swipe, and Corporate Credit (BTC).<br>• Cashier Drawer Handover with ₹500, ₹200, ₹100 note denomination counting. |
| **3. Cannon Kitchen POS** | • Numpad speed ordering with authentic shortcodes (Code `214` Mushroom Masala, `307` Plain Rice).<br>• **Dynamic Channel Pricing:** Swiggy/Zomato (+25% Surge), Drop In Bar (+5%), 24x7 Room Service (+10%).<br>• MyPOS Table Grid: Dining (`1-13`), Terrace (`1A-13A`), Bar (`1B-5B`), PDRs, and Banquets.<br>• Direct "Bill to Room" Folio posting with waiter sign-off. |
| **4. Accounts & B2B GST Compliance** | • **1-Click Audit Reconciler Statement:** Side-by-side verification proving ₹0.00 discrepancy.<br>• **Monthly GSTR-1 Corporate B2B Statement:** Ready for ITC claim (JK Paper, GAIL, Mahindra, Ashok Leyland, PRADAN).<br>• Corporate Running Ledger with Credit Limits (Ashok Leyland ₹2,14,487 balance statement).<br>• Item-wise & category food sales analysis (Chicken, Mutton, Veg, Rice, Breads, Bar) for kitchen costing. |
| **5. Night Audit (12:00 Midnight)** | • Manager-triggered 12:00 Midnight daily closing.<br>• Locks past calendar day transactions against backdating or unauthorized edits.<br>• Automatically posts room night tariffs and advances business date ($N \to N+1$).<br>• Produces Manager's Flash Report with Occupancy %, ARR (₹2,618), and RevPAR (₹1,248). |
| **6. Mandi Store & Vendor Ledger** | • Rayagada daily sabzi mandi and poultry/mutton purchases tracking.<br>• Kitchen issue requisitions.<br>• Local Vendor Credit Ledger tracking outstanding balances to local suppliers (Total ₹48,650). |
| **7. Remote Director VIP Portal** | • Secure web portal for out-of-town directors (Vizag / Bhubaneswar).<br>• Real-time occupancy, collections by tender (Cash/UPI/Card/Credit), and cloud sync telemetry. |

---

## 3. Commercial Investment Options

### Option A: Enterprise Lifetime License (Recommended)
* **One-Time Investment:** **₹65,000.00** (Sixty-Five Thousand Rupees Only)
* **Includes:**
  1. Full perpetual deployment on Hotel Sai International's dedicated Cloudflare Edge infrastructure.
  2. Unlimited user accounts across Front Desk, Cannon Kitchen POS, Store, and Directors.
  3. Complete on-site data migration from MySoft (39 active room balances, guest histories, and Ashok Leyland ₹2.14L corporate ledger).
  4. 3 Full Days of on-site staff training (Sudhakar Reddy, front office, cashiers, stewards).
  5. Dedicated hands-on audit walkthrough with Consultant **Shravan Patnaik**.
  6. First year Cloudflare serverless edge hosting & daily automated database backups included.
  7. Optional Annual Maintenance & Support Contract (AMC) from Year 2: ₹12,000 / year (₹1,000/month).

### Option B: Managed Cloud SaaS Tier
* **Monthly Subscription:** **₹3,500.00 / month** (billed quarterly)
* **One-Time Setup & Onboarding:** **₹15,000.00**
* **Includes:**
  1. Cloud hosting, continuous feature updates, and daily automated backups.
  2. Remote technical support during business hours (9:00 AM – 9:00 PM).

---

## 4. Implementation Schedule & Decision Milestones

* **Now to September 25, 2026:**
  * Property completes Fire Safety inspection, GAIL audit, and Congress party rally hosting.
  * System remains staged in sandbox mode with live 39-room data.
* **Post-September 25, 2026 (Target: September 26–29, 2026):**
  * Formal operational audit walkthrough with **Consultant Shravan Patnaik** and **Sudhakar Reddy**.
  * Validation of double-entry ledger balancing and statutory invoice printing.
* **October 1, 2026:**
  * Go-live cutover from MySoft at 12:00 Midnight Night Audit.
  * Full deployment of Hotel Sai International Cloud ERP.

---

### SIGNATURE & ACCEPTANCE MEMO:

**For Hotel Sai International Pvt Ltd:**

_______________________________________  
**Managing Director Eswara**  
Managing Director, Hotel Sai International  

_______________________________________  
**Mr. Shravan Patnaik**  
Operations Consultant  

**For Antigravity Edge Cloud Systems:**

_______________________________________  
**Rakesh**  
Lead Developer & System Architect  
