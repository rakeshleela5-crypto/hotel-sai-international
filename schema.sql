-- ============================================================================
-- HOTEL SAI INTERNATIONAL - RAYAGADA, ODISHA (PIN: 765001)
-- CLOUDFLARE D1 RELATIONAL SQL DATABASE SCHEMA (39 PRODUCTION TABLES)
-- ============================================================================

-- 1. ROOMS (40 ROOM INVENTORY ACROSS 4 FLOORS)
CREATE TABLE IF NOT EXISTS rooms (
  room_number TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('Standard Deluxe', 'Deluxe Room', 'Executive Room', 'Premium Suite')),
  floor INTEGER NOT NULL CHECK (floor BETWEEN 1 AND 4),
  tariff REAL NOT NULL,
  capacity_adults INTEGER NOT NULL,
  capacity_children INTEGER NOT NULL DEFAULT 1,
  bed_type TEXT NOT NULL,
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
  items_json TEXT NOT NULL, -- JSON array of items
  subtotal REAL NOT NULL,
  gst REAL NOT NULL,
  total_amount REAL NOT NULL,
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

-- 17. CASHIER SHIFT HANDOVERS
CREATE TABLE IF NOT EXISTS cashier_shift_handovers (
  handover_id TEXT PRIMARY KEY,
  shift_date TEXT NOT NULL,
  shift_type TEXT NOT NULL, -- Morning (07:00-15:00), Evening (15:00-23:00), Night (23:00-07:00)
  outgoing_cashier TEXT NOT NULL,
  incoming_cashier TEXT NOT NULL,
  opening_float REAL NOT NULL,
  cash_sales REAL NOT NULL,
  petty_cash_paid REAL NOT NULL,
  closing_cash_actual REAL NOT NULL,
  closing_cash_expected REAL NOT NULL,
  variance REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Balanced', 'Discrepancy')),
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
  credit_days INTEGER NOT NULL DEFAULT 30,
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

-- CORPORATE PARTNERS (RAYAGADA MAJOR HUBS)
INSERT OR IGNORE INTO corporate_partners (corporate_id, company_name, gstin, location, contact_person, contact_email, contact_phone, contracted_discount_percent) VALUES
('CORP-01', 'JK Paper Mills Ltd.', '21AAACJ1288P1ZZ', 'Jaykaypur, Rayagada', 'Subrat Panda (Admin GM)', 'admin.jk@jkpaper.com', '+91 6856 222000', 15),
('CORP-02', 'IMFA (Indian Metals & Ferro Alloys)', '21AAACI0981M1Z5', 'Therubali, Rayagada', 'D. K. Mohapatra (VP HR)', 'traveldesk@imfa.in', '+91 6856 233444', 15),
('CORP-03', 'Utkal Alumina International Ltd.', '21AABCU5544N1ZV', 'Doraguda, Rayagada', 'Manish Agrawal (Corporate Logistics)', 'logistics@utkalalumina.adityabirla.com', '+91 6856 244555', 20),
('CORP-04', 'East Coast Railway (ECoR) Rayagada Div.', '21AAAGR0022E1Z8', 'Station Road, Rayagada', 'P. K. Nayak (Sr. DSTE)', 'travel.rgda@ecor.railnet.gov.in', '+91 6856 223311', 12);

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
