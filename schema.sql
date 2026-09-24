-- ============================================================================
-- HOTEL SAI INTERNATIONAL - RAYAGADA, ODISHA (PIN: 765001)
-- CLOUDFLARE D1 RELATIONAL SQL DATABASE SCHEMA (39 PRODUCTION TABLES)
-- ============================================================================

-- 1. ROOMS (40 ROOM INVENTORY ACROSS 4 FLOORS)
CREATE TABLE IF NOT EXISTS rooms (
  room_number TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('Standard Deluxe', 'Deluxe Room', 'Executive Room', 'Premium Suite')),
  room_type TEXT NOT NULL DEFAULT 'EXEDEL',
  floor INTEGER NOT NULL CHECK (floor BETWEEN 1 AND 4),
  tariff REAL NOT NULL,
  outstanding_balance REAL NOT NULL DEFAULT 0,
  capacity_adults INTEGER NOT NULL,
  capacity_children INTEGER NOT NULL DEFAULT 1,
  bed_type TEXT NOT NULL,
  pax TEXT NOT NULL DEFAULT '1 Pax',
  amenities TEXT NOT NULL, -- JSON array string
  status TEXT NOT NULL CHECK (status IN ('Available', 'Occupied', 'Cleaning', 'Maintenance', 'VIP Hold')) DEFAULT 'Available',
  current_guest_name TEXT,
  current_booking_id TEXT,
  last_cleaned_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  booking_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  id_proof_type TEXT NOT NULL, -- Aadhaar, Passport, Voter ID, Driving License
  id_proof_masked TEXT NOT NULL, -- XXXX-XXXX-1234
  state_of_origin TEXT NOT NULL DEFAULT 'Odisha',
  is_interstate INTEGER NOT NULL DEFAULT 0,
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  nights INTEGER NOT NULL DEFAULT 1,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  tariff_per_night REAL NOT NULL,
  base_total REAL NOT NULL,
  cgst REAL NOT NULL,
  sgst REAL NOT NULL,
  total_amount REAL NOT NULL,
  advance_deposit REAL NOT NULL DEFAULT 0,
  balance_due REAL NOT NULL,
  payment_mode TEXT NOT NULL, -- UPI, Cash, Card, NetBanking, Corporate B2B
  payment_status TEXT NOT NULL DEFAULT 'Pending Gateway Verification',
  booking_status TEXT NOT NULL DEFAULT 'Confirmed', -- Confirmed, Checked In, Checked Out, Cancelled
  is_b2b INTEGER NOT NULL DEFAULT 0,
  corporate_id TEXT,
  corporate_gstin TEXT,
  company_name TEXT,
  bill_no TEXT,
  consent_dpdp INTEGER NOT NULL DEFAULT 1,
  special_requests TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

-- 3. FOOD ORDERS
CREATE TABLE IF NOT EXISTS food_orders (
  order_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  outlet TEXT NOT NULL DEFAULT 'Cannon Kitchen',
  items_json TEXT NOT NULL, -- JSON array of items
  subtotal REAL NOT NULL,
  discount REAL NOT NULL DEFAULT 0,
  discount_reason TEXT,
  gst REAL NOT NULL,
  total_amount REAL NOT NULL,
  is_non_commercial INTEGER NOT NULL DEFAULT 0,
  nc_reason TEXT,
  captain_name TEXT,
  is_jain_satvik INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Received', -- Received, Preparing, Out for Delivery, Delivered, Billed to Room
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. ROOM SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS room_service_requests (
  request_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  service_type TEXT NOT NULL, -- Housekeeping, Linen Change, Extra Water, Toiletries, Luggage Assistance
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Normal', -- Low, Normal, High, Urgent
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending, In Progress, Completed
  assigned_staff TEXT,
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

-- 5. STAFF
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- Manager, Receptionist, Chef, Housekeeping, Security, Driver
  phone TEXT NOT NULL,
  shift TEXT NOT NULL DEFAULT 'Morning', -- Morning, Evening, Night
  monthly_salary REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  joined_date TEXT NOT NULL
);

-- 6. SALARY ADVANCES
CREATE TABLE IF NOT EXISTS salary_advances (
  advance_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  purpose TEXT,
  approved_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Approved',
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 7. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  expense_id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- Vegetables & Groceries, Linen & Laundry, Electricity & Utilities, Maintenance, Diesel Generator
  amount REAL NOT NULL,
  vendor_name TEXT,
  paid_by TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT
);

-- 8. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  record_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  date TEXT NOT NULL,
  shift TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Half Day', 'Leave')),
  check_in_time TEXT,
  check_out_time TEXT,
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 9. LINEN INVENTORY
CREATE TABLE IF NOT EXISTS linen_inventory (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL, -- King Bed Sheet, Pillow Covers, Bath Towels, Duvet Covers, Hand Towels
  total_stock INTEGER NOT NULL,
  in_rooms INTEGER NOT NULL,
  in_laundry INTEGER NOT NULL,
  buffer_stock INTEGER NOT NULL,
  par_level INTEGER NOT NULL,
  last_audited TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 10. CHECKOUT INSPECTIONS
CREATE TABLE IF NOT EXISTS checkout_inspections (
  inspection_id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  inspector_name TEXT NOT NULL,
  key_returned INTEGER NOT NULL DEFAULT 1,
  minibar_consumed REAL NOT NULL DEFAULT 0,
  linen_damage REAL NOT NULL DEFAULT 0,
  room_damage REAL NOT NULL DEFAULT 0,
  notes TEXT,
  cleared_for_cleaning INTEGER NOT NULL DEFAULT 1,
  inspected_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 11. HOTEL CONFIG
CREATE TABLE IF NOT EXISTS hotel_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 12. PAYROLL HISTORY
CREATE TABLE IF NOT EXISTS payroll_history (
  payroll_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  month_year TEXT NOT NULL, -- e.g. 2026-09
  gross_salary REAL NOT NULL,
  advances_deducted REAL NOT NULL DEFAULT 0,
  net_paid REAL NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'Bank Transfer',
  transaction_ref TEXT,
  paid_on TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 13. NIGHT AUDITS
CREATE TABLE IF NOT EXISTS night_audits (
  audit_id TEXT PRIMARY KEY,
  audit_date TEXT NOT NULL UNIQUE,
  total_rooms INTEGER NOT NULL DEFAULT 40,
  occupied_rooms INTEGER NOT NULL,
  occupancy_rate REAL NOT NULL,
  room_revenue REAL NOT NULL,
  pos_fnb_revenue REAL NOT NULL,
  other_revenue REAL NOT NULL,
  total_revenue REAL NOT NULL,
  cash_collected REAL NOT NULL,
  upi_collected REAL NOT NULL,
  card_collected REAL NOT NULL,
  corporate_billed REAL NOT NULL,
  discrepancy_amount REAL NOT NULL DEFAULT 0,
  auditor_name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 14. CONSENT RECORDS (DPDP ACT 2023)
CREATE TABLE IF NOT EXISTS consent_records (
  consent_id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  phone_or_email TEXT NOT NULL,
  purpose TEXT NOT NULL, -- Accommodation Registration & Police Register
  ip_address TEXT,
  user_agent TEXT,
  consent_granted INTEGER NOT NULL DEFAULT 1,
  consented_at TEXT NOT NULL DEFAULT (datetime('now')),
  purge_scheduled_at TEXT NOT NULL
);

-- 15. DATA RIGHTS REQUESTS (DPDP ACT 2023)
CREATE TABLE IF NOT EXISTS data_rights_requests (
  request_id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('Access', 'Correction', 'Erasure', 'Grievance')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'Received', -- Received, Under Review, Completed, Rejected
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

-- 16. LOST AND FOUND
CREATE TABLE IF NOT EXISTS lost_and_found (
  item_id TEXT PRIMARY KEY,
  room_number TEXT,
  item_name TEXT NOT NULL,
  description TEXT,
  found_by TEXT NOT NULL,
  found_date TEXT NOT NULL DEFAULT (date('now')),
  status TEXT NOT NULL DEFAULT 'In Custody', -- In Custody, Claimed & Returned, Auctioned/Disposed
  claimed_by TEXT,
  claim_date TEXT
);

-- 17. CASHIER SHIFT HANDOVERS (FRONT DESK & POS CASH DRAWER BALANCING)
CREATE TABLE IF NOT EXISTS cashier_shift_handovers (
  handover_id TEXT PRIMARY KEY,
  shift_date TEXT NOT NULL,
  shift_type TEXT NOT NULL, -- Morning (07:00-15:00), Evening (15:00-23:00), Night (23:00-07:00), General Shift
  outgoing_cashier TEXT NOT NULL,
  incoming_cashier TEXT NOT NULL,
  opening_float REAL NOT NULL DEFAULT 5000,
  cash_sales REAL NOT NULL DEFAULT 0,
  petty_cash_paid REAL NOT NULL DEFAULT 0,
  cash_collected REAL NOT NULL DEFAULT 0,
  upi_collected REAL NOT NULL DEFAULT 0,
  card_collected REAL NOT NULL DEFAULT 0,
  corporate_credit REAL NOT NULL DEFAULT 0,
  total_revenue REAL NOT NULL DEFAULT 0,
  expected_drawer_cash REAL NOT NULL DEFAULT 0,
  actual_drawer_cash REAL NOT NULL DEFAULT 0,
  closing_cash_expected REAL NOT NULL DEFAULT 0,
  closing_cash_actual REAL NOT NULL DEFAULT 0,
  variance_amount REAL NOT NULL DEFAULT 0,
  variance REAL NOT NULL DEFAULT 0,
  discrepancy_reason TEXT,
  status TEXT NOT NULL DEFAULT 'BALANCED', -- 'BALANCED', 'SURPLUS', 'DEFICIT', 'Balanced', 'Discrepancy'
  verified_by TEXT NOT NULL DEFAULT 'Duty Manager',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 18. STAFF ADJUSTMENTS
CREATE TABLE IF NOT EXISTS staff_adjustments (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Bonus', 'Incentive', 'Penalty', 'Overtime')),
  amount REAL NOT NULL,
  reason TEXT NOT NULL,
  month_year TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 19. FESTIVE PRICING RULES
CREATE TABLE IF NOT EXISTS festive_pricing_rules (
  rule_id TEXT PRIMARY KEY,
  festival_name TEXT NOT NULL, -- Chaiti Festival, Rath Yatra, Durga Puja, New Year, Shivaratri
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  multiplier REAL NOT NULL DEFAULT 1.25,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- 20. POLICE REGISTER DISPATCHES (SARAI ACT 1867)
CREATE TABLE IF NOT EXISTS police_register_dispatches (
  dispatch_id TEXT PRIMARY KEY,
  dispatch_date TEXT NOT NULL,
  police_station TEXT NOT NULL DEFAULT 'Rayagada Town PS',
  total_entries INTEGER NOT NULL,
  interstate_entries INTEGER NOT NULL,
  foreign_entries INTEGER NOT NULL DEFAULT 0,
  dispatched_by TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'WhatsApp & Official Email',
  dispatch_status TEXT NOT NULL DEFAULT 'Dispatched',
  payload_preview TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 21. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('Percentage', 'Fixed')),
  discount_value REAL NOT NULL,
  min_booking_amount REAL NOT NULL DEFAULT 0,
  max_discount REAL,
  valid_until TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- 22. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  item_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Breakfast, Odia Delicacies, Starters, Main Course, Satvik & Jain, Beverages
  price REAL NOT NULL,
  is_veg INTEGER NOT NULL DEFAULT 1,
  is_jain INTEGER NOT NULL DEFAULT 0,
  is_special INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_available INTEGER NOT NULL DEFAULT 1
);

-- 23. SPIRITUAL SERVICES
CREATE TABLE IF NOT EXISTS spiritual_services (
  service_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km REAL NOT NULL,
  timing_info TEXT NOT NULL,
  description TEXT NOT NULL,
  transport_tariff REAL NOT NULL
);

-- 24. GUEST REVIEWS
CREATE TABLE IF NOT EXISTS guest_reviews (
  review_id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_city TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  verified_stay INTEGER NOT NULL DEFAULT 1,
  room_tier TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 25. BIOMETRIC LOGS
CREATE TABLE IF NOT EXISTS biometric_logs (
  log_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('IN', 'OUT')),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  terminal_id TEXT NOT NULL DEFAULT 'TERM-FRONT-01'
);

-- 26. EXPENSE CATEGORIES
CREATE TABLE IF NOT EXISTS expense_categories (
  id TEXT PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  monthly_budget REAL NOT NULL DEFAULT 50000
);

-- 27. CORPORATE PARTNERS
CREATE TABLE IF NOT EXISTS corporate_partners (
  corporate_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  gstin TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contracted_discount_percent REAL NOT NULL DEFAULT 15,
  preferred_tier TEXT NOT NULL DEFAULT 'Executive Room',
  credit_days INTEGER NOT NULL DEFAULT 30,
  credit_limit REAL NOT NULL DEFAULT 200000,
  opening_balance REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active'
);

-- 28. ROOM SERVICE CATALOG
CREATE TABLE IF NOT EXISTS room_service_catalog (
  service_code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- Amenities, Housekeeping, Station Transit, Laundry
  chargeable REAL NOT NULL DEFAULT 0,
  turnaround_minutes INTEGER NOT NULL DEFAULT 20
);

-- 29. SECURITY INCIDENTS
CREATE TABLE IF NOT EXISTS security_incidents (
  incident_id TEXT PRIMARY KEY,
  incident_date TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  resolution_status TEXT NOT NULL DEFAULT 'Logged'
);

-- 30. ROOM HOLDS (RATE-LIMIT PROTECTED WITH 10-MIN EXPIRY)
CREATE TABLE IF NOT EXISTS room_holds (
  hold_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  client_ip TEXT NOT NULL,
  session_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 31. DEVOTEE LEADS
CREATE TABLE IF NOT EXISTS devotee_leads (
  lead_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pilgrimage_group_size INTEGER NOT NULL DEFAULT 2,
  planned_darshan_date TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 32. WHATSAPP DISPATCH LOGS
CREATE TABLE IF NOT EXISTS whatsapp_dispatch_logs (
  log_id TEXT PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  template_type TEXT NOT NULL, -- PoliceRegister, BookingConfirmation, Invoice, ShiftHandover
  message_preview TEXT NOT NULL,
  dispatch_status TEXT NOT NULL DEFAULT 'Sent',
  dispatched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 33. CRON EXECUTION LOGS
CREATE TABLE IF NOT EXISTS cron_execution_logs (
  log_id TEXT PRIMARY KEY,
  bot_name TEXT NOT NULL,
  status TEXT NOT NULL, -- SUCCESS, FAILED, SKIPPED
  summary TEXT NOT NULL,
  executed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 34. AI CONCIERGE INTERACTIONS
CREATE TABLE IF NOT EXISTS ai_concierge_interactions (
  interaction_id TEXT PRIMARY KEY,
  user_prompt TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 35. ROOM ALLOCATION MUTEX LOGS
CREATE TABLE IF NOT EXISTS room_allocation_mutex_logs (
  mutex_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  status TEXT NOT NULL, -- ACQUIRED, RELEASED, COLLISION_DETECTED
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 36. POLICE GUEST ENTRIES (LOCAL SARAI REGISTER)
CREATE TABLE IF NOT EXISTS police_guest_entries (
  entry_id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_number_masked TEXT NOT NULL,
  state_origin TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  purpose_of_visit TEXT NOT NULL DEFAULT 'Business / Pilgrimage',
  dispatch_status TEXT NOT NULL DEFAULT 'Pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 37. DPDP ACCESS LOGS
CREATE TABLE IF NOT EXISTS dpdp_access_logs (
  log_id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL, -- VIEW_PII, EXPORT_REGISTER, PURGE_CONSENT, LOG_GRIEVANCE
  resource_id TEXT,
  details TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 38. CORPORATE B2B INVOICES
CREATE TABLE IF NOT EXISTS corporate_b2b_invoices (
  invoice_number TEXT PRIMARY KEY,
  corporate_id TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  sac_code TEXT NOT NULL DEFAULT '996311',
  taxable_value REAL NOT NULL,
  cgst_rate REAL NOT NULL DEFAULT 2.5,
  cgst_amount REAL NOT NULL,
  sgst_rate REAL NOT NULL DEFAULT 2.5,
  sgst_amount REAL NOT NULL,
  total_invoice_value REAL NOT NULL,
  payment_terms TEXT NOT NULL DEFAULT 'Net 30 Days',
  status TEXT NOT NULL DEFAULT 'Issued',
  issued_date TEXT NOT NULL,
  due_date TEXT NOT NULL
);

-- 39. QR STANDEE TELEMETRY
CREATE TABLE IF NOT EXISTS qr_standee_telemetry (
  telemetry_id TEXT PRIMARY KEY,
  standee_location TEXT NOT NULL, -- Reception Standee, Dining Table Standee, 3D Map Standee, Elevator Lobbies
  scans_count INTEGER NOT NULL DEFAULT 1,
  last_scan_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 40. FOLIO TRANSACTIONS (IDS NEXT IMMUTABLE DOUBLE-ENTRY MASTER LEDGER)
CREATE TABLE IF NOT EXISTS folio_transactions (
  transaction_id TEXT PRIMARY KEY,
  folio_id TEXT NOT NULL,
  booking_id TEXT,
  room_number TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Room Charge', 'Food & Beverage', 'Bar', 'Room Service', 'Laundry', 'Minibar', 'Extra Bed', 'Payment', 'Discount', 'Allowance')),
  outlet TEXT NOT NULL DEFAULT 'Front Desk', -- Front Desk, Cannon Kitchen, Bar Outlet, Room Service, Laundry Dept
  item_code TEXT,
  description TEXT NOT NULL,
  debit_amount REAL NOT NULL DEFAULT 0,  -- Charges to guest account
  credit_amount REAL NOT NULL DEFAULT 0, -- Payments / deposits / allowances
  taxable_base REAL NOT NULL DEFAULT 0,
  gst_rate REAL NOT NULL DEFAULT 0, -- 0, 5, 12, 18
  cgst REAL NOT NULL DEFAULT 0,
  sgst REAL NOT NULL DEFAULT 0,
  sac_code TEXT NOT NULL DEFAULT '996311', -- 996311 (Accommodation 12%), 996331 (Restaurant F&B 5%)
  invoice_id TEXT, -- Target split invoice: e.g. INV-ROOM-402 or INV-FOOD-402
  is_locked INTEGER NOT NULL DEFAULT 0, -- 1 = Frozen by 12:00 AM Night Audit
  created_by TEXT NOT NULL DEFAULT 'Reception Cashier',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

-- 41. SPLIT PAYMENTS (MULTI-TENDER SINGLE INVOICE SETTLEMENT)
CREATE TABLE IF NOT EXISTS split_payments (
  payment_id TEXT PRIMARY KEY,
  folio_id TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Card', 'Corporate Credit', 'Cheque', 'Bank Transfer NEFT')),
  amount REAL NOT NULL,
  reference_utr TEXT, -- UTR/Cheque/POS Approval Code
  cashier_name TEXT NOT NULL,
  shift_type TEXT NOT NULL DEFAULT 'Morning',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 42. CORPORATE LEDGER (STATEMENT OF ACCOUNT WITH TDS SECTION 194C / 194I)
CREATE TABLE IF NOT EXISTS corporate_ledger (
  entry_id TEXT PRIMARY KEY,
  corporate_id TEXT NOT NULL,
  entry_date TEXT NOT NULL DEFAULT (date('now')),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('Invoice Debit', 'Bank NEFT Credit', 'Cheque Credit', 'TDS Deduction Credit', 'Credit Note')),
  invoice_id TEXT,
  description TEXT NOT NULL,
  debit_amount REAL NOT NULL DEFAULT 0,   -- Bill to Company transfers
  credit_amount REAL NOT NULL DEFAULT 0,  -- Payments received / TDS
  tds_section TEXT, -- 194C (Contractor 1-2%), 194I (Rent/Hotel 2-10%)
  tds_amount REAL NOT NULL DEFAULT 0,
  running_balance REAL NOT NULL,
  bank_ref TEXT,
  cleared_status TEXT NOT NULL DEFAULT 'Cleared',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (corporate_id) REFERENCES corporate_partners(corporate_id)
);

-- 43. NIGHT AUDIT LOG (12:00 AM HARD-LOCK & BUSINESS DATE ROLLOVER)
CREATE TABLE IF NOT EXISTS night_audit_log (
  audit_id TEXT PRIMARY KEY,
  business_date TEXT NOT NULL UNIQUE,
  closed_at TEXT NOT NULL DEFAULT (datetime('now')),
  total_rooms INTEGER NOT NULL DEFAULT 40,
  occupied_rooms INTEGER NOT NULL,
  occupancy_pct REAL NOT NULL,
  adr REAL NOT NULL,
  revpar REAL NOT NULL,
  room_revenue REAL NOT NULL,
  fnb_revenue REAL NOT NULL,
  other_revenue REAL NOT NULL,
  gross_revenue REAL NOT NULL,
  cash_collected REAL NOT NULL,
  upi_collected REAL NOT NULL,
  card_collected REAL NOT NULL,
  company_billed REAL NOT NULL,
  cash_opening_float REAL NOT NULL,
  cash_expected REAL NOT NULL,
  cash_physical_drawer REAL NOT NULL,
  cash_variance REAL NOT NULL DEFAULT 0,
  is_locked INTEGER NOT NULL DEFAULT 1,
  auditor_name TEXT NOT NULL,
  notes TEXT
);

-- 44. STORE PURCHASES (MANDI RAW MATERIALS INWARD & VENDOR CREDIT)
CREATE TABLE IF NOT EXISTS store_purchases (
  purchase_id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL, -- Rayagada Mandi Traders, Maa Majhighariani Dairy, Utkal Poultry
  invoice_no TEXT,
  purchase_date TEXT NOT NULL DEFAULT (date('now')),
  category TEXT NOT NULL CHECK (category IN ('Vegetables', 'Poultry & Meat', 'Dairy & Paneer', 'Groceries & Rice', 'Spices & Oils', 'Packaging & Disposables')),
  items_summary TEXT NOT NULL,
  total_amount REAL NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Cash Paid', 'UPI Paid', 'Credit Payable')),
  received_by TEXT NOT NULL DEFAULT 'Kitchen Store Incharge',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 45. KITCHEN REQUISITIONS (STORE TO CANNON KITCHEN ISSUE VOUCHER)
CREATE TABLE IF NOT EXISTS kitchen_requisitions (
  requisition_id TEXT PRIMARY KEY,
  issue_date TEXT NOT NULL DEFAULT (date('now')),
  target_outlet TEXT NOT NULL DEFAULT 'Cannon Kitchen',
  item_name TEXT NOT NULL,
  quantity_issued REAL NOT NULL,
  unit TEXT NOT NULL, -- kg, liters, packets, crates
  approx_cost REAL NOT NULL,
  issued_to TEXT NOT NULL, -- Head Chef
  issued_by TEXT NOT NULL DEFAULT 'Store Manager',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- HOTEL CONFIG
INSERT OR IGNORE INTO hotel_config (key, value, description) VALUES
('hotel_name', 'Hotel Sai International', 'Official Legal Hotel Name'),
('hotel_address', 'Sai Priya Nagar, Rayagada, Odisha - 765001', 'Official Address'),
('phone', '+91 6856 225555', 'Primary Reception Switchboard'),
('landline', '06856 225 555', 'Reception Landline Desk'),
('email', 'reservations@hotelsaiinternational.com', 'Official Reservations Email'),
('gstin', '21AABCH9821K1Z2', 'Odisha State GST Identification Number'),
('ownerPin', '7650', 'Back-office Admin Verification PIN'),
('upi_id', 'hotelsaiinternational@sbi', 'Official SBI Merchant VPA'),
('check_in_time', '12:00 PM', 'Standard Daily Check-in'),
('check_out_time', '12:00 PM', 'Standard Daily Check-out (24-Hr Cycle)');

-- 40 ROOMS INVENTORY (10 PER TIER ACROSS 4 FLOORS)
-- Floor 1: Standard Deluxe (101 - 110)
INSERT OR IGNORE INTO rooms (room_number, tier, floor, tariff, capacity_adults, capacity_children, bed_type, amenities, status) VALUES
('101', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('102', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('103', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('104', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Occupied'),
('105', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('106', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Cleaning'),
('107', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('108', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('109', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),
('110', 'Standard Deluxe', 1, 1699.00, 2, 1, 'King Bed', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV"]', 'Available'),

-- Floor 2: Deluxe Room (201 - 210)
('201', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('202', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('203', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('204', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('205', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Cleaning'),
('206', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('207', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('208', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('209', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('210', 'Deluxe Room', 2, 2199.00, 2, 1, 'Queen Orthopedic', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),

-- Floor 3: Executive Room (301 - 310)
('301', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('302', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('303', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('304', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('305', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Maintenance'),
('306', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('307', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('308', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'VIP Hold'),
('309', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('310', 'Executive Room', 3, 2899.00, 3, 1, 'King Enterprise', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),

-- Floor 4: Premium Suite (401 - 410)
('401', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('402', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('403', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('404', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('405', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('406', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Cleaning'),
('407', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('408', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('409', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('410', 'Premium Suite', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'VIP Hold');

-- CORPORATE PARTNERS (RAYAGADA MAJOR INDUSTRIAL HUBS - 12 REGISTERED CLIENTS)
INSERT OR IGNORE INTO corporate_partners (
  corporate_id, company_name, gstin, location, contact_person,
  contact_email, contact_phone, contracted_discount_percent, preferred_tier,
  credit_days, credit_limit, opening_balance, status
) VALUES
('CORP-01', 'JK Paper Mills Ltd.', '21AAACJ1288P1ZZ', 'Jaykaypur, Rayagada', 'Subrat Panda (Admin GM)', 'admin.jk@jkpaper.com', '+91 6856 222000', 15, 'Executive Room', 30, 500000, 142500, 'Active'),
('CORP-02', 'GAIL (India) Limited', '07AAACG1509J1ZQ', 'Pipeline Regional Office, Rayagada', 'Rajeshwar Rao', 'travel.gail@gail.co.in', '+91 6856 228811', 15, 'Executive Room', 30, 400000, 86400, 'Active'),
('CORP-03', 'Mahindra & Mahindra Ltd.', '27AAACM1545A1Z4', 'Automotive Logistics, Rayagada', 'Sunil K. Verma', 'verma.sunil@mahindra.com', '+91 6856 229944', 12, 'Deluxe Room', 30, 300000, 48200, 'Active'),
('CORP-04', 'Hindustan Coca-Cola Beverages', '21AAACH1123P1Z9', 'South Odisha Distribution Hub', 'Amitabh Sen', 'traveldesk@hccb.co.in', '+91 6856 231122', 10, 'Executive Room', 30, 250000, 32000, 'Active'),
('CORP-05', 'IMFA (Indian Metals & Ferro Alloys)', '21AAACI0981M1Z5', 'Therubali, Rayagada', 'D. K. Mohapatra (VP HR)', 'traveldesk@imfa.in', '+91 6856 233444', 15, 'Executive Room', 30, 600000, 118000, 'Active'),
('CORP-06', 'Utkal Alumina International Ltd.', '21AABCU5544N1ZV', 'Doraguda, Rayagada', 'Manish Agrawal (Corporate Logistics)', 'logistics@utkalalumina.adityabirla.com', '+91 6856 244555', 20, 'Premium Suite', 45, 800000, 215000, 'Active'),
('CORP-07', 'East Coast Railway (ECoR) Rayagada Div.', '21AAAGR0022E1Z8', 'Station Road, Rayagada', 'P. K. Nayak (Sr. DSTE)', 'travel.rgda@ecor.railnet.gov.in', '+91 6856 223311', 12, 'Executive Room', 30, 450000, 65400, 'Active'),
('CORP-08', 'PRADAN', '21AAATP0912K1Z3', 'J K Pur, Rayagada', 'Bijay Paswan', 'rayagada@pradan.net', '+91 7209347755', 15, 'Executive Room', 30, 350000, 48900, 'Active'),
('CORP-09', 'Ashok Leyland Limited', '33AAACA0779M1ZT', 'Commercial Vehicle Service Division, Rayagada', 'Malay Panda', 'service.odisha@ashokleyland.com', '+91 6856 226688', 18, 'Executive Room', 45, 500000, 214487, 'Active'),
('CORP-10', 'Easy Note Stationary Pvt Ltd', '21AABCE9876R1Z2', 'Rayagada Industrial Area', 'Mriganka Dasgupta', 'accounts@easynote.in', '+91 94370 55441', 10, 'Executive Room', 30, 200000, 28400, 'Active'),
('CORP-11', 'Incredible Dreams Hotels & Resorts', '21AACCI7788P1Z5', 'Regional Hospitality Partner', 'Prabhu Prasad Padhy', 'travel@incredibledreams.co.in', '+91 98610 33221', 15, 'Executive Room', 30, 250000, 36200, 'Active'),
('CORP-12', 'Linde India Ltd', '21AAACB2528H1ZA', 'J.K. Paper Mill Plant Site, Jaykaypur, Rayagada', 'P. Ashok', 'p.ashok@linde.com', '+91 6305202068', 15, 'Executive Room', 30, 400000, 13558, 'Active');

-- SPIRITUAL & REGIONAL SERVICES
INSERT OR IGNORE INTO spiritual_services (service_id, title, destination, distance_km, timing_info, description, transport_tariff) VALUES
('SPIRIT-01', 'Maa Majhighariani Temple Darshan', 'Maa Majhighariani Mandir, Rayagada', 2.0, '05:00 AM - 01:00 PM & 04:00 PM - 09:00 PM (Wed/Fri Special)', 'Famous shrine where Goddess Majhighariani fulfills wishes. Priority pickup and darshan guide.', 350.00),
('SPIRIT-02', 'Maa Kali Mandir & Devagiri Cave Excursion', 'Devagiri Hill, Kalyansinghpur', 38.0, '07:00 AM - 05:00 PM', 'Sacred cave atop 120m hill with ancient Shivalinga and water perennial spring.', 1800.00),
('SPIRIT-03', 'Jagannath Temple Darshan', 'Raniguda Farm, Rayagada', 3.5, '06:00 AM - 12:00 PM & 05:00 PM - 08:30 PM', 'Magnificent temple replicating Puri Jagannath traditions in South Odisha.', 450.00);

-- LINEN INVENTORY
INSERT OR IGNORE INTO linen_inventory (id, item_name, total_stock, in_rooms, in_laundry, buffer_stock, par_level) VALUES
('LIN-01', 'King Bed Sheets (300 TC)', 160, 48, 42, 70, 120),
('LIN-02', 'Pillow Covers (Percale)', 200, 80, 50, 70, 160),
('LIN-03', 'Premium Bath Towels (650 GSM)', 140, 50, 35, 55, 100),
('LIN-04', 'Hand & Face Towels', 150, 45, 40, 65, 110),
('LIN-05', 'Microfiber Duvet Covers', 80, 40, 18, 22, 60);

-- MENU ITEMS (ODIA DELICACIES & SATVIK JAIN SPECIALS)
INSERT OR IGNORE INTO menu_items (item_id, name, category, price, is_veg, is_jain, is_special, description) VALUES
('MENU-01', 'Chhena Poda Supreme', 'Odia Delicacies', 180.00, 1, 1, 1, 'Traditional Odisha caramelized baked cottage cheese dessert made with Rayagada dairy.'),
('MENU-02', 'Pakhala Thali Deluxe', 'Odia Delicacies', 220.00, 1, 0, 1, 'Fermented rice served with Badi Chura, saga bhaja, aloo chakata, and roasted papad.'),
('MENU-03', 'Dalma with Jeera Rice', 'Odia Delicacies', 240.00, 1, 1, 1, 'Lentils cooked with raw papaya, pumpkin, eggplant and tempered with ghee cumin panch phoron.'),
('MENU-04', 'Satvik Shahi Paneer (No Onion/Garlic)', 'Satvik & Jain', 290.00, 1, 1, 0, 'Creamy cashewnut and tomato reduction with pure desi ghee.'),
('MENU-05', 'Executive Breakfast Buffet (Complimentary in Room)', 'Breakfast', 350.00, 1, 0, 1, 'Idli, Vada, Puri Sabzi, Upma, Masala Chai, Fresh Fruits and Odia Sweets.'),
('MENU-06', 'Mushroom Besara', 'Main Course', 260.00, 1, 0, 0, 'Fresh buttons simmered in traditional Rayagada mustard and dry mango gravy.'),
('MENU-07', 'Filter Coffee / Spiced Masala Chai', 'Beverages', 60.00, 1, 1, 0, 'Freshly brewed decoction with cardamom and ginger.');

-- ============================================================================
-- IDEAS SAS G3 RMS ENGINE TABLES (TABLES 46 - 49)
-- ============================================================================

-- 46. RMS RATE GUARDRAILS & PEGS
CREATE TABLE IF NOT EXISTS rms_rate_guardrails (
  tier_id TEXT PRIMARY KEY,
  tier_name TEXT NOT NULL,
  floor_tariff REAL NOT NULL,
  ceiling_tariff REAL NOT NULL,
  comp_peg_percent REAL NOT NULL DEFAULT 8.0,
  automation_mode TEXT NOT NULL DEFAULT 'exception',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pre-seed Guardrails
INSERT OR IGNORE INTO rms_rate_guardrails (tier_id, tier_name, floor_tariff, ceiling_tariff, comp_peg_percent, automation_mode) VALUES
('standard-deluxe', 'Standard Deluxe', 1499.00, 3200.00, 8.0, 'exception'),
('deluxe-room', 'Deluxe Room', 1899.00, 3900.00, 8.0, 'exception'),
('executive-room', 'Executive Room', 2499.00, 5200.00, 8.0, 'exception'),
('premium-suite', 'Premium Suite', 3499.00, 7999.00, 8.0, 'exception');

-- 47. RMS HURDLE RATES & STAY PATTERN RESTRICTIONS (SHADOW BID PRICES)
CREATE TABLE IF NOT EXISTS rms_hurdle_rates (
  id TEXT PRIMARY KEY,
  target_date TEXT NOT NULL,
  tier_id TEXT NOT NULL,
  hurdle_rate REAL NOT NULL,
  min_los INTEGER NOT NULL DEFAULT 1,
  max_los INTEGER NOT NULL DEFAULT 30,
  cta INTEGER NOT NULL DEFAULT 0, -- Closed to Arrival
  ctd INTEGER NOT NULL DEFAULT 0, -- Closed to Departure
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 48. RMS CORPORATE GROUP DISPLACEMENT RFPS
CREATE TABLE IF NOT EXISTS rms_displacement_rfps (
  rfp_id TEXT PRIMARY KEY,
  corporate_name TEXT NOT NULL,
  rooms_requested INTEGER NOT NULL,
  stay_nights INTEGER NOT NULL,
  offered_rate REAL NOT NULL,
  calculated_mar REAL NOT NULL,
  net_gain_loss REAL NOT NULL,
  verdict TEXT NOT NULL,
  ancillary_spend REAL NOT NULL DEFAULT 0,
  evaluated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 49. RMS AUDIT LOG (UNALTERABLE REVENUE OVERRIDE REGISTER)
CREATE TABLE IF NOT EXISTS rms_audit_log (
  log_id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL, -- RATE_PUBLISH, GUARDRAIL_OVERRIDE, MODE_CHANGE, RFP_EVALUATED
  details TEXT NOT NULL,
  performed_by TEXT NOT NULL DEFAULT 'Revenue Director',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 50. CENTRAL GUEST CRM & LOYALTY (REPEAT VISITORS & VIP PROFILES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS guest_profiles (
  guest_id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  id_proof_type TEXT NOT NULL DEFAULT 'Aadhaar',
  id_proof_masked TEXT NOT NULL,
  city TEXT,
  state_of_origin TEXT NOT NULL DEFAULT 'Odisha',
  is_vip INTEGER NOT NULL DEFAULT 0,
  dietary_preference TEXT DEFAULT 'Regular', -- 'Satvik / Jain', 'Vegetarian', 'Regular'
  preferred_room_tier TEXT,
  vehicle_number TEXT,
  total_visits INTEGER NOT NULL DEFAULT 1,
  lifetime_spend REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 51. RESTAURANT KOT VOIDS (ANTI-THEFT CANNON KITCHEN CANCEL LOG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_kot_voids (
  void_id TEXT PRIMARY KEY,
  kot_id TEXT NOT NULL,
  room_or_table TEXT NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  item_amount REAL NOT NULL,
  reason TEXT NOT NULL, -- 'Guest Changed Mind', 'Captain Mistake', 'Food Burnt', 'Item Unavailable'
  custom_note TEXT,
  voided_by TEXT NOT NULL DEFAULT 'Captain',
  authorized_by TEXT NOT NULL DEFAULT 'F&B Manager',
  voided_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 52. INBOUND CORPORATE INQUIRIES (B2B PORTAL LEADS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS corporate_inquiries (
  inquiry_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  gstin TEXT,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  estimated_monthly_rooms TEXT DEFAULT '5-10 rooms/month',
  status TEXT NOT NULL DEFAULT 'Pending Review', -- 'Pending Review', 'Contacted', 'Agreement Sent', 'Onboarded'
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 53. RESTAURANT TABLES MASTER (CANNON KITCHEN LIVE FLOOR LAYOUT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
  table_number TEXT PRIMARY KEY,
  section TEXT NOT NULL DEFAULT 'AC Dining', -- 'AC Dining', 'Family Section', 'Express Counter', 'Executive Lounge'
  capacity INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'Vacant', -- 'Vacant', 'Occupied', 'Billed', 'Reserved'
  current_kot_id TEXT,
  captain_name TEXT,
  last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 54. DIGITAL KEYCARDS (ENCRYPTED NFC / WEB ACCESS PASSES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS digital_keycards (
  card_id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  access_pin TEXT NOT NULL,
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

-- ============================================================================
-- 55. MAINTENANCE WORK ORDERS (FRONT DESK & ENGINEERING TICKETS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_work_orders (
  ticket_id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  issue TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('AC & HVAC', 'Plumbing & Geyser', 'Electrical & TV', 'Carpentry', 'Painting', 'General Maintenance')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')) DEFAULT 'Normal',
  technician TEXT NOT NULL,
  target_eta TEXT NOT NULL DEFAULT 'Within 2 Hours',
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Cancelled')) DEFAULT 'Open',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);

-- Pre-seed 12 Restaurant Tables
INSERT OR IGNORE INTO restaurant_tables (table_number, section, capacity, status) VALUES
('1', 'AC Dining', 4, 'Vacant'),
('2', 'AC Dining', 4, 'Vacant'),
('3', 'AC Dining', 2, 'Vacant'),
('4', 'AC Dining', 6, 'Vacant'),
('5', 'AC Dining', 4, 'Vacant'),
('6', 'Family Section', 8, 'Vacant'),
('7', 'Family Section', 6, 'Vacant'),
('8', 'Family Section', 4, 'Vacant'),
('9', 'Express Counter', 2, 'Vacant'),
('10', 'Express Counter', 2, 'Vacant'),
('11', 'Executive Lounge', 4, 'Vacant'),
('12', 'Executive Lounge', 6, 'Vacant');

-- ============================================================================
-- HIGH-PERFORMANCE PRODUCTION DATABASE INDEXES
-- ============================================================================

-- 1. Mutex & Booking Date Collision Index (High Frequency Reservation Check)
CREATE INDEX IF NOT EXISTS idx_bookings_conflict 
  ON bookings (room_number, check_in_date, check_out_date, booking_status);

-- 2. GSTR-1, Police Register & Chronological Lookup Index
CREATE INDEX IF NOT EXISTS idx_bookings_created 
  ON bookings (created_at DESC);

-- 3. Repeat Guest Lookup by Phone
CREATE INDEX IF NOT EXISTS idx_bookings_phone 
  ON bookings (guest_phone);

-- 4. Double-Entry Master Folio Transactions Index (Instant Folio Modal Load)
CREATE INDEX IF NOT EXISTS idx_folio_txns_folio 
  ON folio_transactions (folio_id);

-- 5. Night Audit Hard-Lock Batch & Room Audit Index
CREATE INDEX IF NOT EXISTS idx_folio_txns_room_lock 
  ON folio_transactions (room_number, is_locked);

-- 6. Multi-Tender Split Payment by Folio
CREATE INDEX IF NOT EXISTS idx_split_payments_folio 
  ON split_payments (folio_id);

-- 7. Corporate Statement of Account & TDS Index
CREATE INDEX IF NOT EXISTS idx_corporate_ledger_corp 
  ON corporate_ledger (corporate_id, entry_date DESC);

-- 8. 10-Minute Cart Abandonment & Hold Expiry Cleanup Index
CREATE INDEX IF NOT EXISTS idx_room_holds_expiry 
  ON room_holds (expires_at, client_ip);

-- 9. DPDP Act 2023 30-Day Auto-Purge Cron Index
CREATE INDEX IF NOT EXISTS idx_consent_records_purge 
  ON consent_records (purge_scheduled_at);

-- 10. Live Kitchen Order Display Index
CREATE INDEX IF NOT EXISTS idx_food_orders_room 
  ON food_orders (room_number, status);

-- 11. Staff Biometric Attendance Index
CREATE INDEX IF NOT EXISTS idx_attendance_staff_date 
  ON attendance (staff_id, date);


