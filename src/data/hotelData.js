// Hotel Sai International - Core Property Data & 40-Room Inventory Specification
// Location: Sai Priya Nagar, Rayagada, Odisha - 765001
// Switchboard: +91 6856 225555 | Landline: 06856 225 555

export const HOTEL_CONFIG = {
  name: "Hotel Sai International",
  tagline: "Premier 40-Room International Executive & Pilgrim Hotel",
  address: "Sai Priya Nagar, Rayagada, Odisha - 765001",
  landline: "06856 225 555",
  phone: "+91 6856 225555",
  email: "reservations@hotelsaiinternational.com",
  adminEmail: "admin@hotelsaiinternational.com",
  travelDeskEmail: "traveldesk@hotelsaiinternational.com",
  gstin: "21AABCH9821K1Z2",
  sacCode: "996311",
  checkInTime: "12:00 PM",
  checkOutTime: "12:00 PM",
  cycle: "24-Hour Cycle",
  upiId: "hotelsaiinternational@sbi",
  distanceStation: "1.5 km from Rayagada Railway Junction (RGDA)",
  distanceTemple: "2.0 km from sacred Maa Majhighariani Temple",
  stateCode: "21",
  stateName: "Odisha"
};

// 4-Tier Room Catalog
export const ROOM_TIERS = [
  {
    id: "standard-deluxe",
    name: "Standard Deluxe",
    floor: 1,
    roomsRange: "101 - 110",
    tariff: 1699,
    capacityAdults: 2,
    capacityChildren: 1,
    bedType: "King Bed",
    areaSqFt: 280,
    tag: "Value & Pilgrim Choice",
    description: "Serene first-floor accommodation designed for comfort and peace of mind after divine darshan at Maa Majhighariani Temple.",
    amenities: ["Air Conditioning", "High-speed Wi-Fi", "King Bed", "Free Breakfast Buffet", "Smart TV", "Hot Water 24/7", "Daily Housekeeping"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "deluxe-room",
    name: "Deluxe Room",
    floor: 2,
    roomsRange: "201 - 210",
    tariff: 2199,
    capacityAdults: 2,
    capacityChildren: 1,
    bedType: "Queen Orthopedic",
    areaSqFt: 340,
    tag: "City Vista & Comfort",
    description: "Refined second-floor guestroom featuring a scenic city view balcony, sound-insulating glazed windows, and in-room Odia & Satvik dining service.",
    amenities: ["Premium AC", "City View Balcony", "Work Desk", "Free Breakfast", "In-Room Satvik/Multi-Cuisine Dining", "Electronic Safe", "Tea/Coffee Maker"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "executive-room",
    name: "Executive Room",
    floor: 3,
    roomsRange: "301 - 310",
    tariff: 2899,
    capacityAdults: 3,
    capacityChildren: 1,
    bedType: "King Enterprise",
    areaSqFt: 420,
    tag: "Corporate & Transit Suite",
    description: "Tailored for industrial consultants visiting JK Paper, IMFA, and Utkal Alumina. Equipped with ergonomic workstation and station transfer credit.",
    amenities: ["Ergonomic Workstation", "High-Speed Enterprise Wi-Fi", "Mini Bar", "Free Laundry service credit", "Station Transit Pickup", "Executive Lounge Access"],
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "premium-suite",
    name: "Premium Suite",
    floor: 4,
    roomsRange: "401 - 410",
    tariff: 3999,
    capacityAdults: 4,
    capacityChildren: 2,
    bedType: "Imperial King + Luxury Sofa Bed",
    areaSqFt: 580,
    tag: "Regal Penthouse & Family Suite",
    description: "Spacious top-floor presidential suite with separate living area, plush master bedroom, complimentary seasonal fruit basket, and priority butler service.",
    amenities: ["Living Area", "Master Bedroom", "Complimentary Fruit Basket", "Priority Room Service", "Free Local Shuttle", "Bathtub & Rain Shower", "Espresso Machine"],
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80"
  }
];

// 40 Authentic Rooms Inventory Array
export const INITIAL_ROOMS_INVENTORY = [
  // 1st Floor: Standard Deluxe (101 - 110)
  ...Array.from({ length: 10 }, (_, i) => {
    const num = 101 + i;
    const statuses = ['Available', 'Available', 'Occupied', 'Available', 'Cleaning', 'Available', 'Available', 'Available', 'Occupied', 'Available'];
    return {
      roomNumber: `${num}`,
      tier: 'Standard Deluxe',
      floor: 1,
      tariff: 1699,
      capacityAdults: 2,
      capacityChildren: 1,
      bedType: 'King Bed',
      status: statuses[i],
      amenities: ["Air Conditioning", "High-speed Wi-Fi", "King Bed", "Free Breakfast Buffet", "Smart TV"],
      currentGuestName: statuses[i] === 'Occupied' ? (i === 2 ? 'Rajendra Mohanty' : 'Santosh Patra') : null,
      doorFacing: i % 2 === 0 ? 'East' : 'West',
      coordinates3D: { x: (i % 5) * 3 - 6, y: 1.5, z: Math.floor(i / 5) * 4 - 2 }
    };
  }),

  // 2nd Floor: Deluxe Room (201 - 210)
  ...Array.from({ length: 10 }, (_, i) => {
    const num = 201 + i;
    const statuses = ['Available', 'Occupied', 'Available', 'Cleaning', 'Available', 'Available', 'Occupied', 'Available', 'Available', 'Available'];
    return {
      roomNumber: `${num}`,
      tier: 'Deluxe Room',
      floor: 2,
      tariff: 2199,
      capacityAdults: 2,
      capacityChildren: 1,
      bedType: 'Queen Orthopedic',
      status: statuses[i],
      amenities: ["Premium AC", "City View Balcony", "Work Desk", "Free Breakfast", "In-Room Satvik Dining"],
      currentGuestName: statuses[i] === 'Occupied' ? (i === 1 ? 'Prakash Tripathy' : 'Dr. B. K. Sahoo') : null,
      doorFacing: i % 2 === 0 ? 'East' : 'West',
      coordinates3D: { x: (i % 5) * 3 - 6, y: 4.5, z: Math.floor(i / 5) * 4 - 2 }
    };
  }),

  // 3rd Floor: Executive Room (301 - 310)
  ...Array.from({ length: 10 }, (_, i) => {
    const num = 301 + i;
    const statuses = ['Occupied', 'Available', 'Available', 'Available', 'Maintenance', 'Available', 'Available', 'VIP Hold', 'Available', 'Available'];
    return {
      roomNumber: `${num}`,
      tier: 'Executive Room',
      floor: 3,
      tariff: 2899,
      capacityAdults: 3,
      capacityChildren: 1,
      bedType: 'King Enterprise',
      status: statuses[i],
      amenities: ["Ergonomic Workstation", "High-Speed Enterprise Wi-Fi", "Mini Bar", "Free Laundry credit", "Station Transit"],
      currentGuestName: statuses[i] === 'Occupied' ? 'Vikram Singhania (JK Paper)' : (statuses[i] === 'VIP Hold' ? 'VIP ECoR General Manager' : null),
      doorFacing: i % 2 === 0 ? 'East' : 'West',
      coordinates3D: { x: (i % 5) * 3 - 6, y: 7.5, z: Math.floor(i / 5) * 4 - 2 }
    };
  }),

  // 4th Floor: Premium Suite (401 - 410)
  ...Array.from({ length: 10 }, (_, i) => {
    const num = 401 + i;
    const statuses = ['Available', 'Occupied', 'Available', 'Available', 'Available', 'Cleaning', 'Available', 'Available', 'Available', 'VIP Hold'];
    return {
      roomNumber: `${num}`,
      tier: 'Premium Suite',
      floor: 4,
      tariff: 3999,
      capacityAdults: 4,
      capacityChildren: 2,
      bedType: 'Imperial King + Luxury Sofa Bed',
      status: statuses[i],
      amenities: ["Living Area", "Master Bedroom", "Complimentary Fruit Basket", "Priority Room Service", "Free Local Shuttle"],
      currentGuestName: statuses[i] === 'Occupied' ? 'Anil Sharma & Family' : (statuses[i] === 'VIP Hold' ? 'Govt Dignitary Delegation' : null),
      doorFacing: i % 2 === 0 ? 'East' : 'West',
      coordinates3D: { x: (i % 5) * 3 - 6, y: 10.5, z: Math.floor(i / 5) * 4 - 2 }
    };
  })
];

// Rayagada Corporate Partners
export const CORPORATE_PARTNERS = [
  {
    id: "CORP-01",
    name: "JK Paper Mills Ltd.",
    location: "Jaykaypur, Rayagada (15 km)",
    gstin: "21AAACJ1288P1ZZ",
    contactPerson: "Subrat Panda (Admin GM)",
    contactPhone: "+91 6856 222000",
    contactEmail: "admin.jk@jkpaper.com",
    contractDiscount: 15,
    preferredTier: "Executive Room",
    creditDays: 30
  },
  {
    id: "CORP-02",
    name: "IMFA (Indian Metals & Ferro Alloys)",
    location: "Therubali, Rayagada (18 km)",
    gstin: "21AAACI0981M1Z5",
    contactPerson: "D. K. Mohapatra (VP HR)",
    contactPhone: "+91 6856 233444",
    contactEmail: "traveldesk@imfa.in",
    contractDiscount: 15,
    preferredTier: "Executive Room",
    creditDays: 30
  },
  {
    id: "CORP-03",
    name: "Utkal Alumina International Ltd.",
    location: "Doraguda, Rayagada (70 km)",
    gstin: "21AABCU5544N1ZV",
    contactPerson: "Manish Agrawal (Corporate Logistics)",
    contactPhone: "+91 6856 244555",
    contactEmail: "logistics@utkalalumina.adityabirla.com",
    contractDiscount: 20,
    preferredTier: "Premium Suite",
    creditDays: 45
  },
  {
    id: "CORP-04",
    name: "East Coast Railway (ECoR) Rayagada Div.",
    location: "Station Road, Rayagada (1.5 km)",
    gstin: "21AAAGR0022E1Z8",
    contactPerson: "P. K. Nayak (Sr. DSTE)",
    contactPhone: "+91 6856 223311",
    contactEmail: "travel.rgda@ecor.railnet.gov.in",
    contractDiscount: 12,
    preferredTier: "Executive Room",
    creditDays: 30
  }
];

// Authentic Odia Delicacies & Satvik In-Room Dining Menu
export const RESTAURANT_MENU = [
  {
    id: "m1",
    name: "Chhena Poda Supreme",
    category: "Odia Delicacies",
    price: 180,
    isVeg: true,
    isJain: true,
    isSpecial: true,
    description: "Traditional Odisha caramelized baked cottage cheese dessert prepared fresh with Rayagada dairy milk and cardamom."
  },
  {
    id: "m2",
    name: "Pakhala Thali Deluxe",
    category: "Odia Delicacies",
    price: 220,
    isVeg: true,
    isJain: false,
    isSpecial: true,
    description: "Refreshing fermented rice served with Badi Chura, seasonal Saag Bhaja, roasted papad, curd, and lemon."
  },
  {
    id: "m3",
    name: "Dalma with Steamed Jeera Rice",
    category: "Odia Delicacies",
    price: 240,
    isVeg: true,
    isJain: true,
    isSpecial: true,
    description: "Nutritious toor dal cooked with raw papaya, pumpkin, brinjal, tempered in pure desi ghee with panch phoron."
  },
  {
    id: "m4",
    name: "Satvik Shahi Paneer (No Onion/Garlic)",
    category: "Satvik & Jain",
    price: 290,
    isVeg: true,
    isJain: true,
    isSpecial: false,
    description: "Cottage cheese simmered in a rich tomato, melon seed, and cashew velvety gravy with fragrant saffron."
  },
  {
    id: "m5",
    name: "Executive Breakfast Buffet Spread",
    category: "Breakfast",
    price: 350,
    isVeg: true,
    isJain: false,
    isSpecial: true,
    description: "Complimentary for in-house guests. Fluffy Idlis, Crispy Medu Vada, Puri Bhaji, Upma, Seasonal Fruits, and Filter Coffee."
  },
  {
    id: "m6",
    name: "Mushroom Besara",
    category: "Main Course",
    price: 260,
    isVeg: true,
    isJain: false,
    isSpecial: false,
    description: "Local Rayagada mushrooms cooked in stone-ground yellow mustard paste, garlic, and dried mango ambula."
  },
  {
    id: "m7",
    name: "Rayagada Spiced Masala Chai",
    category: "Beverages",
    price: 60,
    isVeg: true,
    isJain: true,
    isSpecial: false,
    description: "Aromatic Assam leaf brewed with fresh crushed ginger, green cardamom, and fresh whole milk."
  }
];

// Spiritual & Darshan Timings
export const SPIRITUAL_SIGHTS = [
  {
    id: "darshan-majhighariani",
    name: "Maa Majhighariani Temple",
    distance: "2.0 km (7 mins drive)",
    timings: "05:00 AM - 01:00 PM & 04:00 PM - 09:00 PM",
    specialDays: "Wednesdays & Fridays (Chandi Patha & Special Pujas)",
    highlights: "Revered as the presiding deity of Southern Odisha. Devotees visit for fulfillments of desires and safe journey blessings.",
    shuttleTariff: "₹350 (Round-trip dedicated car drop & return)"
  },
  {
    id: "darshan-devagiri",
    name: "Devagiri Hill Cave Shrine",
    distance: "38 km (Kalyansinghpur)",
    timings: "07:00 AM - 05:00 PM",
    specialDays: "Maha Shivaratri & Mondays",
    highlights: "Ancient Shivalinga atop a 120-meter high rock hill with perennial fresh water kundas.",
    shuttleTariff: "₹1,800 (Full-day excursion with driver)"
  },
  {
    id: "darshan-jagannath",
    name: "Raniguda Jagannath Temple",
    distance: "3.5 km",
    timings: "06:00 AM - 12:00 PM & 05:00 PM - 08:30 PM",
    specialDays: "Rath Yatra & Ekadashi",
    highlights: "Architectural jewel showcasing Kalinga temple shikhara craftsmanship and evening Sandhya Aarti.",
    shuttleTariff: "₹450 (Dedicated auto/cab)"
  }
];

// 20-BOT AUTONOMOUS HOTEL FLEET SPECIFICATION
export const AUTONOMOUS_BOT_FLEET = [
  {
    id: "bot-01",
    code: "NIGHT_AUDIT_BOT",
    name: "09:00 PM Night Audit & Cash Drawer Slip Bot",
    schedule: "0 21 * * *",
    frequency: "Daily at 09:00 PM",
    category: "Financial & Cashier",
    channel: "WhatsApp & Desk Thermal Printer",
    status: "Active",
    description: "Reconciles cash, UPI, card, and corporate room revenue against opening drawer float. Auto-generates discrepancy variance alerts.",
    defaultParams: { openingFloat: 5000, varianceThreshold: 100, autoPrintSlip: true }
  },
  {
    id: "bot-02",
    code: "ROOM_REVENUE_BOT",
    name: "11:59 PM Auto Room Revenue Charge Bot",
    schedule: "59 23 * * *",
    frequency: "Daily at 11:59 PM",
    category: "Revenue Ledger",
    channel: "D1 Database Ledger",
    status: "Active",
    description: "Posts daily room tariff and GST (CGST 2.5% + SGST 2.5%) for all active checked-in rooms to guest folios.",
    defaultParams: { enforceRule46Gst: true, sacCode: "996311" }
  },
  {
    id: "bot-03",
    code: "MORNING_BRIEFING_BOT",
    name: "07:00 AM Executive Morning Briefing Bot",
    schedule: "0 7 * * *",
    frequency: "Daily at 07:00 AM",
    category: "Operations & Management",
    channel: "Telegram & Management WhatsApp",
    status: "Active",
    description: "Dispatches 40-room occupancy snapshot, VIP arrivals, expected corporate checkouts, and breakfast forecast to GM.",
    defaultParams: { notifyManagers: ["GM", "FrontDeskSupervisor"], includeBreakfastCount: true }
  },
  {
    id: "bot-04",
    code: "HOUSEKEEPING_DISPATCH_BOT",
    name: "11:00 AM Checkout Housekeeping Dispatch Bot",
    schedule: "0 11 * * *",
    frequency: "Daily at 11:00 AM",
    category: "Housekeeping",
    channel: "Staff Biometric Pager & Web PMS",
    status: "Active",
    description: "Queues rooms approaching 12:00 PM checkout into cleaning workflow. Dispatches linen turnover checklist to floor attendants.",
    defaultParams: { warningThresholdMinutes: 60, parCheckRequired: true }
  },
  {
    id: "bot-05",
    code: "INSTANT_BOOKING_ALERT_BOT",
    name: "Real-Time Telegram Instant Booking Alert Bot",
    schedule: "*/1 * * * *",
    frequency: "Real-time Event Hook",
    category: "Reservations",
    channel: "Telegram Secure Channel",
    status: "Active",
    description: "Broadcasts instant booking alerts with guest name, room number, arrival date, and advance payment proof to reception.",
    defaultParams: { soundChime: true, maskAadhaar: true }
  },
  {
    id: "bot-06",
    code: "KITCHEN_POS_BOT",
    name: "Satvik & In-Room Kitchen POS Order Bot",
    schedule: "*/1 * * * *",
    frequency: "Real-time Order Hook",
    category: "F&B POS",
    channel: "Kitchen Thermal Slip & Screen",
    status: "Active",
    description: "Routes Odia delicacies and Satvik orders directly to chef terminal with high-priority Jain dietary alerts.",
    defaultParams: { highlightJainDiet: true, printKOT: true }
  },
  {
    id: "bot-07",
    code: "FESTIVE_SURGE_BOT",
    name: "Dynamic Weekend & Festive Surge Bot",
    schedule: "0 0 * * 5",
    frequency: "Weekly & Festival Triggers",
    category: "Revenue & Pricing",
    channel: "Edge Pricing Engine",
    status: "Active",
    description: "Adjusts dynamic base tariffs ahead of Chaiti Festival, Rath Yatra, Durga Puja, or weekend surge when occupancy > 75%.",
    defaultParams: { weekendSurgePercent: 15, festivalSurgePercent: 25, autoApply: true }
  },
  {
    id: "bot-08",
    code: "HOLD_EXPIRY_BOT",
    name: "10-Minute Cart Abandonment & Hold Expiry Bot",
    schedule: "*/5 * * * *",
    frequency: "Every 5 Minutes",
    category: "Inventory Protection",
    channel: "Edge Mutex Cleaner",
    status: "Active",
    description: "Releases uncompleted room holds older than 10 minutes to protect inventory from denial-of-service lockouts.",
    defaultParams: { holdDurationMinutes: 10, maxHoldsPerIp: 2 }
  },
  {
    id: "bot-09",
    code: "POLICE_REGISTER_BOT",
    name: "08:00 PM Daily Rayagada Police Register Bot",
    schedule: "0 20 * * *",
    frequency: "Daily at 08:00 PM",
    category: "Statutory & Police (Sarai Act)",
    channel: "WhatsApp & Police Station Email",
    status: "Active",
    description: "Compiles statutory Sarai Act 1867 guest register for Rayagada Town Police Station with inter-state guest tags.",
    defaultParams: { destinationPs: "Rayagada Town PS", maskAadhaarExceptLast4: true }
  },
  {
    id: "bot-10",
    code: "REVIEW_BOOSTER_BOT",
    name: "10:00 AM Post-Stay Review Booster Bot",
    schedule: "0 10 * * *",
    frequency: "Daily at 10:00 AM",
    category: "Guest Relations",
    channel: "WhatsApp & SMS",
    status: "Active",
    description: "Sends personalized post-checkout thank you message with one-tap Google Review link to checked-out pilgrims.",
    defaultParams: { delayHoursAfterCheckout: 2, minRatingFilter: 4 }
  },
  {
    id: "bot-11",
    code: "PETTY_CASH_BOT",
    name: "Daily 11:30 PM Petty Cash & Expense Voucher Bot",
    schedule: "30 23 * * *",
    frequency: "Daily at 11:30 PM",
    category: "Financial & Audit",
    channel: "Accountant Telegram Slip",
    status: "Active",
    description: "Tallies daily grocery, diesel generator fuel, and laundry vouchers against verified receipts.",
    defaultParams: { maxSingleVoucherLimit: 5000, flagUnapprovedExpenses: true }
  },
  {
    id: "bot-12",
    code: "SALARY_LEDGER_BOT",
    name: "Monthly 1st Staff Salary & Advance Ledger Bot",
    schedule: "0 6 1 * *",
    frequency: "Monthly on 1st at 06:00 AM",
    category: "HR & Payroll",
    channel: "Admin Portal",
    status: "Active",
    description: "Computes monthly net salary payouts by deducting biometric absences and approved salary advances.",
    defaultParams: { autoDeductAdvances: true, salaryCycle: "Monthly" }
  },
  {
    id: "bot-13",
    code: "LINEN_PAR_STOCK_BOT",
    name: "Linen Laundry Turnover & Par-Stock Bot",
    schedule: "0 16 * * *",
    frequency: "Daily at 04:00 PM",
    category: "Housekeeping & Linen",
    channel: "Housekeeping Lead WhatsApp",
    status: "Active",
    description: "Monitors bedsheets, towels, and pillowcases. Fires alert if clean buffer stock drops below 100-piece par level.",
    defaultParams: { kingSheetPar: 120, bathTowelPar: 100 }
  },
  {
    id: "bot-14",
    code: "LOST_FOUND_BOT",
    name: "Lost & Found 48-Hour Return Bot",
    schedule: "0 12 * * *",
    frequency: "Daily at 12:00 PM",
    category: "Front Desk Operations",
    channel: "Guest WhatsApp & Desk Alert",
    status: "Active",
    description: "Tracks items left behind during checkout inspections. Sends secure claim notifications with verification token.",
    defaultParams: { autoClaimNoticeDays: 2, custodyRetentionDays: 90 }
  },
  {
    id: "bot-15",
    code: "TRAIN_TRANSIT_BOT",
    name: "Rayagada Railway Train Delay & Pickup Bot",
    schedule: "*/15 * * * *",
    frequency: "Every 15 Minutes",
    category: "Concierge & Logistics",
    channel: "Driver Pager & Guest WhatsApp",
    status: "Active",
    description: "Syncs with Rayagada Junction (RGDA) arrivals (Hirakhand, Samaleshwari) to dispatch station pickup drivers on schedule.",
    defaultParams: { pickupRadiusKm: 5, alertDriverBeforeMinutes: 25 }
  },
  {
    id: "bot-16",
    code: "B2B_INVOICE_BOT",
    name: "B2B Corporate Partner Invoice Generator Bot",
    schedule: "0 22 * * *",
    frequency: "Daily at 10:00 PM",
    category: "Corporate Billing",
    channel: "Partner Email & Cloudflare D1",
    status: "Active",
    description: "Generates Rule 46 GST tax invoices with SAC 996311 for JK Paper, IMFA, and Utkal Alumina corporate accounts.",
    defaultParams: { defaultCreditTerms: "Net 30", enforceGstinValidation: true }
  },
  {
    id: "bot-17",
    code: "DPDP_PURGE_BOT",
    name: "DPDP Act 30-Day Auto-Purge Privacy Bot",
    schedule: "0 2 * * *",
    frequency: "Daily at 02:00 AM",
    category: "Data Privacy & Legal",
    channel: "Audit Log & D1 DB",
    status: "Active",
    description: "Complies with statutory DPDP Act 2023 by hard-deleting expired guest PII and consent records past the 30-day retention window.",
    defaultParams: { retentionDays: 30, keepAnonymizedStats: true }
  },
  {
    id: "bot-18",
    code: "GRIEVANCE_ALERT_BOT",
    name: "Negative Feedback & Grievance Alert Bot",
    schedule: "*/2 * * * *",
    frequency: "Real-time Rating Hook",
    category: "Customer Experience",
    channel: "GM Immediate Call & SMS",
    status: "Active",
    description: "Immediately alerts general manager whenever a review or room service complaint rating is 3 stars or below.",
    defaultParams: { thresholdRating: 3, alertEscalationMinutes: 10 }
  },
  {
    id: "bot-19",
    code: "SHIFT_HANDOVER_BOT",
    name: "04:00 PM Afternoon Front Desk Shift Handover Bot",
    schedule: "0 16 * * *",
    frequency: "Daily at 04:00 PM",
    category: "Front Desk Reception",
    channel: "Desk Thermal Slip & Web PMS",
    status: "Active",
    description: "Coordinates cashier handover between morning and evening shifts, verifying key tags and pending guest folios.",
    defaultParams: { requireDualSignOff: true, verifyRoomKeys: true }
  },
  {
    id: "bot-20",
    code: "GSTR1_RECONCILE_BOT",
    name: "Monthly GSTR-1 ITC Reconciliation Bot",
    schedule: "0 4 1 * *",
    frequency: "Monthly on 1st at 04:00 AM",
    category: "Statutory Tax & GSTN",
    channel: "Government GSTN JSON Export",
    status: "Active",
    description: "Prepares official Government GSTN GSTR-1 JSON (Table 4A, Table 7, Table 12 HSN Summary, Table 13 Document Register).",
    defaultParams: { validateGstinChecksum: true, sacCode: "996311" }
  }
];
