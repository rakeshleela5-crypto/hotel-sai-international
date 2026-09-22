// Hotel Sai International - Core Property Data & 40-Room Inventory Specification
// Location: Sai Priya Nagar, Rayagada, Odisha - 765001
// Switchboard: +91 6856 225555 | Landline: 06856 225 555

export const HOTEL_CONFIG = {
  name: "Hotel Sai International Pvt Ltd",
  tagline: "Premier 39-Room International Executive & Pilgrim Hotel",
  address: "J.K. Road, Rayagada, Rayagada - 765001, India",
  landline: "06856 225 555",
  phone: "+91 8895225555",
  altPhone: "+91 8249258377",
  email: "hotelsaiinternational2010@gmail.com",
  adminEmail: "admin@hotelsaiinternational.com",
  travelDeskEmail: "traveldesk@hotelsaiinternational.com",
  website: "hotelsaiinternationalrayagada.com",
  gstin: "21AABCH7663L1ZG",
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

// 39 Authentic Physical Inventory Keys (MySoft Live Property Layout)
export const INITIAL_ROOMS_INVENTORY = [
  // Floor 2 (7 Rooms: 201 - 208)
  { roomNumber: '201', tier: 'Deluxe Room', roomType: 'EXEDEL', floor: 2, tariff: 2199, status: 'Occupied', currentGuestName: 'LAVAKANTA', balanceDue: 4410.00, pax: '1 Pax', coordinates3D: { x: -6, y: 4.5, z: -2 } },
  { roomNumber: '202', tier: 'Deluxe Room', roomType: 'EXEDEL', floor: 2, tariff: 2199, status: 'Occupied', currentGuestName: 'SATYARANJAN', balanceDue: 39060.00, pax: '2 Pax', coordinates3D: { x: -3, y: 4.5, z: -2 } },
  { roomNumber: '203', tier: 'Premium Suite', roomType: 'PRSUITE', floor: 2, tariff: 3999, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Suite', coordinates3D: { x: 0, y: 4.5, z: -2 } },
  { roomNumber: '205', tier: 'Deluxe Room', roomType: 'EXEDEL', floor: 2, tariff: 2199, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: 3, y: 4.5, z: -2 } },
  { roomNumber: '206', tier: 'Deluxe Room', roomType: 'EXEDEL', floor: 2, tariff: 2199, status: 'Occupied', currentGuestName: 'S S HAMEED', balanceDue: 7560.00, pax: '1 Pax', coordinates3D: { x: 6, y: 4.5, z: -2 } },
  { roomNumber: '207', tier: 'Deluxe Room', roomType: 'EXEDEL', floor: 2, tariff: 2199, status: 'Occupied', currentGuestName: 'SAHANAWAZ', balanceDue: 35910.00, pax: '1 Pax', coordinates3D: { x: -6, y: 4.5, z: 2 } },
  { roomNumber: '208', tier: 'Deluxe Room', roomType: 'EXEDEL', floor: 2, tariff: 2199, status: 'Occupied', currentGuestName: 'S SURESH', balanceDue: 35910.00, pax: '1 Pax', coordinates3D: { x: -3, y: 4.5, z: 2 } },

  // Floor 3 (15 Rooms: 301 - 316)
  { roomNumber: '301', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Occupied', currentGuestName: 'UTKARSH SR', balanceDue: 5670.00, pax: '1 Pax', coordinates3D: { x: -6, y: 7.5, z: -2 } },
  { roomNumber: '302', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: -3, y: 7.5, z: -2 } },
  { roomNumber: '303', tier: 'Premium Suite', roomType: 'SUITE', floor: 3, tariff: 3999, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Suite', coordinates3D: { x: 0, y: 7.5, z: -2 } },
  { roomNumber: '304', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Occupied', currentGuestName: 'SUPHAL CHA', balanceDue: 4410.00, pax: '2 Pax', coordinates3D: { x: 3, y: 7.5, z: -2 } },
  { roomNumber: '305', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Occupied', currentGuestName: 'K RAJESH K', balanceDue: 5670.00, pax: '1 Pax', coordinates3D: { x: 6, y: 7.5, z: -2 } },
  { roomNumber: '306', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: -6, y: 7.5, z: 0 } },
  { roomNumber: '307', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: -3, y: 7.5, z: 0 } },
  { roomNumber: '308', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Occupied', currentGuestName: 'JAGANNAT', balanceDue: 5670.00, pax: '1 Pax', coordinates3D: { x: 0, y: 7.5, z: 0 } },
  { roomNumber: '309', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Maintenance', currentGuestName: 'AC PRBLM', balanceDue: 0, pax: 'OOO', coordinates3D: { x: 3, y: 7.5, z: 0 } },
  { roomNumber: '310', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: 6, y: 7.5, z: 0 } },
  { roomNumber: '311', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: -6, y: 7.5, z: 2 } },
  { roomNumber: '312', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: -3, y: 7.5, z: 2 } },
  { roomNumber: '314', tier: 'Premium Suite', roomType: 'SUITE', floor: 3, tariff: 3999, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Suite', coordinates3D: { x: 0, y: 7.5, z: 2 } },
  { roomNumber: '315', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: 3, y: 7.5, z: 2 } },
  { roomNumber: '316', tier: 'Executive Room', roomType: 'EXEDEL', floor: 3, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: 6, y: 7.5, z: 2 } },

  // Floor 4 (16 Rooms: 401 - 416)
  { roomNumber: '401', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: -6, y: 10.5, z: -2 } },
  { roomNumber: '402', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'PASHOK', balanceDue: 10084.38, pax: '1 Pax', coordinates3D: { x: -3, y: 10.5, z: -2 } },
  { roomNumber: '403', tier: 'Premium Suite', roomType: 'SUITE', floor: 4, tariff: 3999, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Suite', coordinates3D: { x: 0, y: 10.5, z: -2 } },
  { roomNumber: '404', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: 3, y: 10.5, z: -2 } },
  { roomNumber: '405', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: 6, y: 10.5, z: -2 } },
  { roomNumber: '406', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: -6, y: 10.5, z: 0 } },
  { roomNumber: '407', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Available', coordinates3D: { x: -3, y: 10.5, z: 0 } },
  { roomNumber: '408', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'SARATH CHA', balanceDue: 5670.00, pax: '1 Pax', coordinates3D: { x: 0, y: 10.5, z: 0 } },
  { roomNumber: '409', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'SAILENDRA', balanceDue: 35910.00, pax: '1 Pax', coordinates3D: { x: 3, y: 10.5, z: 0 } },
  { roomNumber: '410', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'BIJAY PASWAN (PRADAN)', balanceDue: 5544.00, pax: '1 Pax', coordinates3D: { x: 6, y: 10.5, z: 0 } },
  { roomNumber: '411', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'AVINAV', balanceDue: 41895.00, pax: '2 Pax', coordinates3D: { x: -6, y: 10.5, z: 2 } },
  { roomNumber: '412', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'RAVI VERMA', balanceDue: 23310.00, pax: '2 Pax', coordinates3D: { x: -3, y: 10.5, z: 2 } },
  { roomNumber: '413', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'RITWIK BHA (PRADAN)', balanceDue: 4890.00, pax: '1 Pax', coordinates3D: { x: 0, y: 10.5, z: 2 } },
  { roomNumber: '414', tier: 'Premium Suite', roomType: 'SUITE', floor: 4, tariff: 3999, status: 'Available', currentGuestName: null, balanceDue: 0, pax: 'Suite', coordinates3D: { x: 3, y: 10.5, z: 2 } },
  { roomNumber: '415', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'VAMSHI KRL', balanceDue: 7899.00, pax: '2 Pax', coordinates3D: { x: 6, y: 10.5, z: 2 } },
  { roomNumber: '416', tier: 'Executive Room', roomType: 'EXEDEL', floor: 4, tariff: 2899, status: 'Occupied', currentGuestName: 'SUMER KUMA', balanceDue: 41895.00, pax: '2 Pax', coordinates3D: { x: 0, y: 10.5, z: 3 } }
];

// Rayagada Corporate Partners (Anchor Accounts)
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
    creditDays: 30,
    creditLimit: 500000,
    openingBalance: 142500
  },
  {
    id: "CORP-02",
    name: "GAIL (India) Limited",
    location: "Pipeline Regional Office, Rayagada",
    gstin: "07AAACG1509J1ZQ",
    contactPerson: "Rajeshwar Rao (Project Incharge)",
    contactPhone: "+91 6856 228811",
    contactEmail: "travel.gail@gail.co.in",
    contractDiscount: 15,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 400000,
    openingBalance: 86400
  },
  {
    id: "CORP-03",
    name: "Mahindra & Mahindra Ltd.",
    location: "Automotive Logistics, Rayagada",
    gstin: "27AAACM1545A1Z4",
    contactPerson: "Sunil K. Verma (Area Manager)",
    contactPhone: "+91 6856 229944",
    contactEmail: "verma.sunil@mahindra.com",
    contractDiscount: 12,
    preferredTier: "Deluxe Room",
    creditDays: 30,
    creditLimit: 300000,
    openingBalance: 48200
  },
  {
    id: "CORP-04",
    name: "Hindustan Coca-Cola Beverages",
    location: "South Odisha Distribution Hub",
    gstin: "21AAACH1123P1Z9",
    contactPerson: "Amitabh Sen (Logistics Head)",
    contactPhone: "+91 6856 231122",
    contactEmail: "traveldesk@hccb.co.in",
    contractDiscount: 10,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 250000,
    openingBalance: 32000
  },
  {
    id: "CORP-05",
    name: "IMFA (Indian Metals & Ferro Alloys)",
    location: "Therubali, Rayagada (18 km)",
    gstin: "21AAACI0981M1Z5",
    contactPerson: "D. K. Mohapatra (VP HR)",
    contactPhone: "+91 6856 233444",
    contactEmail: "traveldesk@imfa.in",
    contractDiscount: 15,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 600000,
    openingBalance: 118000
  },
  {
    id: "CORP-06",
    name: "Utkal Alumina International Ltd.",
    location: "Doraguda, Rayagada (70 km)",
    gstin: "21AABCU5544N1ZV",
    contactPerson: "Manish Agrawal (Corporate Logistics)",
    contactPhone: "+91 6856 244555",
    contactEmail: "logistics@utkalalumina.adityabirla.com",
    contractDiscount: 20,
    preferredTier: "Premium Suite",
    creditDays: 45,
    creditLimit: 800000,
    openingBalance: 215000
  },
  {
    id: "CORP-07",
    name: "East Coast Railway (ECoR) Rayagada Div.",
    location: "Station Road, Rayagada (1.5 km)",
    gstin: "21AAAGR0022E1Z8",
    contactPerson: "P. K. Nayak (Sr. DSTE)",
    contactPhone: "+91 6856 223311",
    contactEmail: "travel.rgda@ecor.railnet.gov.in",
    contractDiscount: 12,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 450000,
    openingBalance: 65400
  },
  {
    id: "CORP-08",
    name: "PRADAN (Professional Assistance for Dev Action)",
    location: "J K Pur, Rayagada",
    gstin: "21AAATP0912K1Z3",
    contactPerson: "Bijay Paswan / Sameer Tendulkar",
    contactPhone: "+91 7209347755",
    contactEmail: "rayagada@pradan.net",
    contractDiscount: 15,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 350000,
    openingBalance: 48900
  },
  {
    id: "CORP-09",
    name: "Ashok Leyland Limited",
    location: "Commercial Vehicle Service Division, Rayagada",
    gstin: "33AAACA0779M1ZT",
    contactPerson: "Malay Panda / Nirupam Roy",
    contactPhone: "+91 6856 226688",
    contactEmail: "service.odisha@ashokleyland.com",
    contractDiscount: 18,
    preferredTier: "Executive Room",
    creditDays: 45,
    creditLimit: 500000,
    openingBalance: 214487 // Exact figure from Screenshot 15!
  },
  {
    id: "CORP-10",
    name: "Easy Note Stationary Pvt Ltd",
    location: "Rayagada Industrial Area",
    gstin: "21AABCE9876R1Z2",
    contactPerson: "Mriganka Dasgupta",
    contactPhone: "+91 94370 55441",
    contactEmail: "accounts@easynote.in",
    contractDiscount: 10,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 200000,
    openingBalance: 28400
  },
  {
    id: "CORP-11",
    name: "Incredible Dreams Hotels & Resorts",
    location: "Regional Hospitality Partner",
    gstin: "21AACCI7788P1Z5",
    contactPerson: "Prabhu Prasad Padhy",
    contactPhone: "+91 98610 33221",
    contactEmail: "travel@incredibledreams.co.in",
    contractDiscount: 15,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 250000,
    openingBalance: 36200
  },
  {
    id: "CORP-12",
    name: "Linde India Ltd",
    location: "J.K. Paper Mill Plant Site, Jaykaypur, Rayagada",
    gstin: "21AAACB2528H1ZA",
    contactPerson: "P. Ashok (Mech Engineer)",
    contactPhone: "+91 6305202068",
    contactEmail: "ashok.p@linde.com",
    contractDiscount: 15,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 400000,
    openingBalance: 13558 // Room 402 stay from hotel_documents.pdf
  },
  {
    id: "CORP-13",
    name: "Akchem Chemicals Pvt Ltd",
    location: "Rayagada Chemicals Processing Zone",
    gstin: "21AABCA8841F1ZB",
    contactPerson: "Lavkanta Ojha / Bijay",
    contactPhone: "+91 94371 88440",
    contactEmail: "procurement@akchem.co.in",
    contractDiscount: 12,
    preferredTier: "Executive Room",
    creditDays: 30,
    creditLimit: 300000,
    openingBalance: 6615 // Room 201 stay from hotel_documents.pdf
  }
];

// Official F&B Outlets of Hotel Sai International (Screenshot 10 of hotel_documents.pdf & Owner Video)
export const HOTEL_OUTLETS = [
  { 
    id: 'fenugreek', 
    code: 'F', 
    name: 'Fenugreek Restaurant', 
    type: 'Signature Vegetarian & Multi-Cuisine Dining', 
    timings: '07:00 AM - 11:00 PM', 
    sacCode: '996331', 
    gstRate: 5,
    description: 'Fine dining family restaurant serving authentic Odia, North Indian, Tandoor and Chinese delicacies.'
  },
  { 
    id: 'dropinbar', 
    code: 'D', 
    name: 'Drop In Bar', 
    type: 'Licensed Bar & Executive Lounge', 
    timings: '11:00 AM - 11:30 PM', 
    sacCode: '996331', 
    gstRate: 5,
    description: 'Relaxing beverage and cocktail lounge for industrial delegates and hotel residents.'
  },
  { 
    id: 'roomservice', 
    code: 'H', 
    name: 'Room Service', 
    type: '24x7 In-Room Guest Dining', 
    timings: '24 Hours', 
    sacCode: '996331', 
    gstRate: 5,
    description: 'Direct in-room service serving fresh meals from Fenugreek Restaurant to all 39 rooms.'
  },
  { 
    id: 'swiggy', 
    code: 'S', 
    name: 'Swiggy Cloud Delivery', 
    type: 'Online Food Delivery Channel', 
    timings: '08:00 AM - 10:30 PM', 
    sacCode: '996331', 
    gstRate: 5,
    description: 'Integrated digital delivery for Rayagada town orders.'
  },
  { 
    id: 'zomato', 
    code: 'Z', 
    name: 'Zomato Cloud Delivery', 
    type: 'Online Food Delivery Channel', 
    timings: '08:00 AM - 10:30 PM', 
    sacCode: '996331', 
    gstRate: 5,
    description: 'Digital ordering partner for Rayagada station transit customers.'
  }
];

// Standard MySoft Post Charge Categories (Exact Dropdown from Timestamp 1:27 in Owner Video)
export const POST_CHARGE_CATEGORIES = [
  { id: 'EXTRA_PERSON', name: 'EXTRA PERSON', desc: 'Additional Adult Guest Occupancy Fee', sac: '996311', taxRate: 5 },
  { id: 'EXTRA_CHILD', name: 'EXTRA CHILD', desc: 'Child Stay / Rollaway Bed', sac: '996311', taxRate: 5 },
  { id: 'ROOM_SERVICE', name: 'ROOM SERVICE', desc: 'In-Room Food & Beverage Orders', sac: '996331', taxRate: 5 },
  { id: 'BANQUETS', name: 'BANQUETS', desc: 'Conference & Event Hall Charges', sac: '996311', taxRate: 18 },
  { id: 'ROUND_OFF', name: 'ROUND OFF', desc: 'Folio Decimal Rounding (+/-)', sac: '000000', taxRate: 0 },
  { id: 'ALLOWANCE', name: 'ALLOWANCE', desc: 'Commercial Courtesy Rate Adjustment', sac: '996311', taxRate: 5 },
  { id: 'DISCOUNT', name: 'DISCOUNT', desc: 'Special Managerial Discount', sac: '996311', taxRate: 5 },
  { id: 'EXP_PLAN', name: 'EXP. PLAN', desc: 'Extended Meal Plan Upgrade (CP/MAP/AP)', sac: '996311', taxRate: 5 },
  { id: 'LAUNDRY', name: 'LAUNDRY', desc: 'Guest Dry Cleaning & Pressing Services', sac: '999799', taxRate: 18 },
  { id: 'MISCELLANEOUS', name: 'MISCELLANEOUS', desc: 'Front Desk Incidental Services', sac: '996311', taxRate: 5 },
  { id: 'FENUGREEK_RESTAURANT', name: 'FENUGREEK RESTAURANT', desc: 'Restaurant Dining Charges (KOT)', sac: '996331', taxRate: 5 }
];


// Authentic MySoft Table Layout for Cannon Kitchen & Banquets (Screenshot 20)
export const MYPOS_CANNON_KITCHEN_LAYOUT = {
  tables: [
    // Main Restaurant Dining
    ...Array.from({ length: 13 }, (_, i) => ({ id: `${i + 1}`, label: `Table ${i + 1}`, section: 'Main Dining', pax: 4 })),
    // Upper / Window Terrace Section
    ...Array.from({ length: 13 }, (_, i) => ({ id: `${i + 1}A`, label: `Table ${i + 1}A`, section: 'Terrace Dining', pax: 4 })),
    // Bar & Lounge Section
    ...Array.from({ length: 5 }, (_, i) => ({ id: `${i + 1}B`, label: `Bar ${i + 1}B`, section: 'Bar Lounge', pax: 2 })),
    // Private Dining Rooms (PDR)
    { id: 'PDR1', label: 'Private Dining 1', section: 'PDR', pax: 8 },
    { id: 'PDR', label: 'Private Dining Executive', section: 'PDR', pax: 12 },
    // Conference & Party Halls
    { id: 'A/C CONFERE', label: 'A/C Conference Hall', section: 'Banquet', pax: 50 },
    { id: 'PAR3', label: 'Party Hall 3', section: 'Banquet', pax: 25 },
    { id: 'PAR5', label: 'Party Hall 5', section: 'Banquet', pax: 25 },
    { id: 'PAR6', label: 'Party Hall 6', section: 'Banquet', pax: 30 },
    { id: 'PAR15', label: 'Party Hall 15', section: 'Banquet', pax: 40 },
    { id: 'PAR16', label: 'Party Hall 16', section: 'Banquet', pax: 40 },
    { id: 'G.M. OFFICE', label: 'GM Executive Suite', section: 'Admin', pax: 4 }
  ],
  stewards: ['SADANANDA', 'KOTI', 'DEEPAK', 'BIJAY', 'RAMESH', 'SANTOSH'],
  activeKotOrders: [
    { tableId: 'B', orderId: 'F2627-7515', steward: 'SADANANDA', amount: 850, status: 'Preparing' },
    { tableId: '6', orderId: 'F2627-7514', steward: 'KOTI', amount: 1190, status: 'Billed' },
    { tableId: 'LOBBY', orderId: '90614', steward: 'DEEPAK', amount: 460, status: 'Delivered' }
  ]
};

// Multi-Outlet F&B Menu with Fast Item Codes (Cannon Kitchen, Bar, Room Service, Swiggy)
export const RESTAURANT_MENU = [
  {
    id: "m1",
    itemCode: "101",
    name: "Chhena Poda Supreme",
    category: "Odia Delicacies",
    price: 180,
    dineInPrice: 180,
    roomServicePrice: 200,
    swiggyPrice: 240,
    barPrice: 190,
    isVeg: true,
    isJain: true,
    isSpecial: true,
    description: "Traditional Odisha caramelized baked cottage cheese dessert prepared fresh with Rayagada dairy milk and cardamom."
  },
  {
    id: "m2",
    itemCode: "102",
    name: "Pakhala Thali Deluxe",
    category: "Odia Delicacies",
    price: 220,
    dineInPrice: 220,
    roomServicePrice: 245,
    swiggyPrice: 299,
    barPrice: 230,
    isVeg: true,
    isJain: false,
    isSpecial: true,
    description: "Refreshing fermented rice served with Badi Chura, seasonal Saag Bhaja, roasted papad, curd, and lemon."
  },
  {
    id: "m3",
    itemCode: "103",
    name: "Dalma with Steamed Jeera Rice",
    category: "Odia Delicacies",
    price: 240,
    dineInPrice: 240,
    roomServicePrice: 265,
    swiggyPrice: 320,
    barPrice: 250,
    isVeg: true,
    isJain: true,
    isSpecial: true,
    description: "Nutritious toor dal cooked with raw papaya, pumpkin, brinjal, tempered in pure desi ghee with panch phoron."
  },
  {
    id: "m4",
    itemCode: "201",
    name: "Satvik Shahi Paneer",
    category: "Satvik & Jain",
    price: 290,
    dineInPrice: 290,
    roomServicePrice: 320,
    swiggyPrice: 390,
    barPrice: 310,
    isVeg: true,
    isJain: true,
    isSpecial: false,
    description: "Cottage cheese simmered in a rich tomato, melon seed, and cashew velvety gravy with fragrant saffron."
  },
  {
    id: "m5",
    itemCode: "214",
    name: "Mushroom Masala / Besara",
    category: "Main Course",
    price: 260,
    dineInPrice: 260,
    roomServicePrice: 285,
    swiggyPrice: 350,
    barPrice: 275,
    isVeg: true,
    isJain: false,
    isSpecial: true,
    description: "Local Rayagada buttons simmered in traditional ground yellow mustard and dried mango ambula gravy."
  },
  {
    id: "m6",
    itemCode: "215",
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 280,
    dineInPrice: 280,
    roomServicePrice: 310,
    swiggyPrice: 375,
    barPrice: 295,
    isVeg: true,
    isJain: false,
    isSpecial: false,
    description: "Fresh cottage cheese in mildly spiced butter cream tomato reduction."
  },
  {
    id: "m7",
    itemCode: "216",
    name: "Cannon Desi Chicken Curry",
    category: "Main Course",
    price: 340,
    dineInPrice: 340,
    roomServicePrice: 375,
    swiggyPrice: 440,
    barPrice: 360,
    isVeg: false,
    isJain: false,
    isSpecial: true,
    description: "Tender country chicken simmered in traditional South Odisha slow-cooked onion-ginger-garlic masala."
  },
  {
    id: "m8",
    itemCode: "307",
    name: "Plain Steamed Basmati Rice",
    category: "Main Course",
    price: 120,
    dineInPrice: 120,
    roomServicePrice: 135,
    swiggyPrice: 160,
    barPrice: 130,
    isVeg: true,
    isJain: true,
    isSpecial: false,
    description: "Long grain aromatic basmati steamed to perfection."
  },
  {
    id: "m9",
    itemCode: "308",
    name: "Butter Tandoori Naan / Roti (2 Pcs)",
    category: "Main Course",
    price: 80,
    dineInPrice: 80,
    roomServicePrice: 90,
    swiggyPrice: 110,
    barPrice: 85,
    isVeg: true,
    isJain: false,
    isSpecial: false,
    description: "Clay oven charred bread glazed with Amul butter."
  },
  {
    id: "m10",
    itemCode: "401",
    name: "Rayagada Spiced Masala Chai",
    category: "Beverages",
    price: 60,
    dineInPrice: 60,
    roomServicePrice: 70,
    swiggyPrice: 85,
    barPrice: 65,
    isVeg: true,
    isJain: true,
    isSpecial: false,
    description: "Aromatic Assam leaf brewed with fresh crushed ginger, green cardamom, and fresh whole milk."
  },
  {
    id: "m11",
    itemCode: "402",
    name: "Crispy Chilli Chicken (Bar Special)",
    category: "Starters",
    price: 310,
    dineInPrice: 310,
    roomServicePrice: 340,
    swiggyPrice: 399,
    barPrice: 320,
    isVeg: false,
    isJain: false,
    isSpecial: true,
    description: "Wok-tossed boneless chicken cubes with bell peppers, green chillies, and dark soy."
  },
  {
    id: "m12",
    itemCode: "403",
    name: "Crispy Corn Pepper Salt",
    category: "Starters",
    price: 220,
    dineInPrice: 220,
    roomServicePrice: 245,
    swiggyPrice: 290,
    barPrice: 230,
    isVeg: true,
    isJain: false,
    isSpecial: false,
    description: "Golden fried sweet corn kernels tossed with freshly crushed black pepper and scallions."
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

// ============================================================================
// IDS NEXT-GRADE IMMUTABLE MASTER FOLIO TRANSACTIONS (PRE-SEEDED REAL SCENARIOS)
// ============================================================================

export const INITIAL_FOLIO_TRANSACTIONS = [
  // -------------------------------------------------------------
  // ROOM 402: THE EXACT ₹13,588 CORPORATE STAY (GAIL / CORPORATE GUEST)
  // -------------------------------------------------------------
  {
    transactionId: "TXN-402-001",
    folioId: "FOLIO-402",
    bookingId: "HSI-202609-0004",
    roomNumber: "402",
    transactionType: "Room Charge",
    outlet: "Front Desk",
    itemCode: "ROOM-T4",
    description: "Premium Suite Tariff - Night 1 (2026-09-20)",
    debitAmount: 3999.00,
    creditAmount: 0,
    taxableBase: 3999.00,
    gstRate: 12,
    cgst: 239.94,
    sgst: 239.94,
    sacCode: "996311",
    invoiceCategory: "Room",
    isLocked: 1,
    createdAt: "2026-09-20 23:59:00"
  },
  {
    transactionId: "TXN-402-002",
    folioId: "FOLIO-402",
    bookingId: "HSI-202609-0004",
    roomNumber: "402",
    transactionType: "Room Charge",
    outlet: "Front Desk",
    itemCode: "ROOM-T4",
    description: "Premium Suite Tariff - Night 2 (2026-09-21)",
    debitAmount: 3999.00,
    creditAmount: 0,
    taxableBase: 3999.00,
    gstRate: 12,
    cgst: 239.94,
    sgst: 239.94,
    sacCode: "996311",
    invoiceCategory: "Room",
    isLocked: 0,
    createdAt: "2026-09-21 23:59:00"
  },
  {
    transactionId: "TXN-402-003",
    folioId: "FOLIO-402",
    bookingId: "HSI-202609-0004",
    roomNumber: "402",
    transactionType: "Food & Beverage",
    outlet: "Cannon Kitchen",
    itemCode: "CK-KOT-1048",
    description: "Cannon Kitchen Dinner (Desi Chicken, Dalma, Naan, Rice)",
    debitAmount: 2450.00,
    creditAmount: 0,
    taxableBase: 2333.33,
    gstRate: 5,
    cgst: 58.33,
    sgst: 58.33,
    sacCode: "996331",
    invoiceCategory: "Food",
    isLocked: 0,
    createdAt: "2026-09-21 21:15:00"
  },
  {
    transactionId: "TXN-402-004",
    folioId: "FOLIO-402",
    bookingId: "HSI-202609-0004",
    roomNumber: "402",
    transactionType: "Room Service",
    outlet: "Room Service",
    itemCode: "RS-KOT-2011",
    description: "In-Room Breakfast Buffet & High-Grade Spiced Masala Chai",
    debitAmount: 1550.00,
    creditAmount: 0,
    taxableBase: 1476.19,
    gstRate: 5,
    cgst: 36.90,
    sgst: 36.90,
    sacCode: "996331",
    invoiceCategory: "Food",
    isLocked: 0,
    createdAt: "2026-09-22 08:30:00"
  },
  {
    transactionId: "TXN-402-005",
    folioId: "FOLIO-402",
    bookingId: "HSI-202609-0004",
    roomNumber: "402",
    transactionType: "Laundry",
    outlet: "Laundry Dept",
    itemCode: "LAUND-01",
    description: "Executive Express Laundry & Ironing (4 Suits)",
    debitAmount: 800.00,
    creditAmount: 0,
    taxableBase: 677.97,
    gstRate: 18,
    cgst: 61.02,
    sgst: 61.02,
    sacCode: "999799",
    invoiceCategory: "Room",
    isLocked: 0,
    createdAt: "2026-09-21 16:45:00"
  },
  {
    transactionId: "TXN-402-006",
    folioId: "FOLIO-402",
    bookingId: "HSI-202609-0004",
    roomNumber: "402",
    transactionType: "Payment",
    outlet: "Front Desk",
    itemCode: "ADV-DEP",
    description: "Advance Check-In Deposit via SBI UPI QR (Ref: 4291840192)",
    debitAmount: 0,
    creditAmount: 5000.00,
    taxableBase: 0,
    gstRate: 0,
    cgst: 0,
    sgst: 0,
    sacCode: "000000",
    invoiceCategory: "Payment",
    isLocked: 1,
    createdAt: "2026-09-20 14:10:00"
  },

  // -------------------------------------------------------------
  // ROOM 301: JK PAPER MILLS CORPORATE GUEST (VIKRAM SINGHANIA)
  // -------------------------------------------------------------
  {
    transactionId: "TXN-301-001",
    folioId: "FOLIO-301",
    bookingId: "HSI-202609-0002",
    roomNumber: "301",
    transactionType: "Room Charge",
    outlet: "Front Desk",
    itemCode: "ROOM-T3",
    description: "Executive Room Tariff (15% JK Paper Corporate Discount) - Night 1",
    debitAmount: 2464.00,
    creditAmount: 0,
    taxableBase: 2464.00,
    gstRate: 12,
    cgst: 147.84,
    sgst: 147.84,
    sacCode: "996311",
    invoiceCategory: "Room",
    isLocked: 1,
    createdAt: "2026-09-21 23:59:00"
  },
  {
    transactionId: "TXN-301-002",
    folioId: "FOLIO-301",
    bookingId: "HSI-202609-0002",
    roomNumber: "301",
    transactionType: "Food & Beverage",
    outlet: "Cannon Kitchen",
    itemCode: "CK-KOT-1049",
    description: "Cannon Kitchen Corporate Executive Dinner",
    debitAmount: 890.00,
    creditAmount: 0,
    taxableBase: 847.62,
    gstRate: 5,
    cgst: 21.19,
    sgst: 21.19,
    sacCode: "996331",
    invoiceCategory: "Food",
    isLocked: 0,
    createdAt: "2026-09-21 20:30:00"
  },

  // -------------------------------------------------------------
  // ROOM 104: SANTOSH PATRA (PILGRIMAGE GUEST - MAA MAJHIGHARIANI)
  // -------------------------------------------------------------
  {
    transactionId: "TXN-104-001",
    folioId: "FOLIO-104",
    bookingId: "HSI-202609-0001",
    roomNumber: "104",
    transactionType: "Room Charge",
    outlet: "Front Desk",
    itemCode: "ROOM-T1",
    description: "Standard Deluxe Room Tariff - Night 1",
    debitAmount: 1699.00,
    creditAmount: 0,
    taxableBase: 1699.00,
    gstRate: 12,
    cgst: 101.94,
    sgst: 101.94,
    sacCode: "996311",
    invoiceCategory: "Room",
    isLocked: 1,
    createdAt: "2026-09-20 23:59:00"
  },
  {
    transactionId: "TXN-104-002",
    folioId: "FOLIO-104",
    bookingId: "HSI-202609-0001",
    roomNumber: "104",
    transactionType: "Food & Beverage",
    outlet: "Cannon Kitchen",
    itemCode: "CK-KOT-1035",
    description: "Cannon Kitchen Satvik Lunch (Dalma, Pakhala Thali, Chhena Poda)",
    debitAmount: 640.00,
    creditAmount: 0,
    taxableBase: 609.52,
    gstRate: 5,
    cgst: 15.24,
    sgst: 15.24,
    sacCode: "996331",
    invoiceCategory: "Food",
    isLocked: 1,
    createdAt: "2026-09-21 13:20:00"
  },
  {
    transactionId: "TXN-104-003",
    folioId: "FOLIO-104",
    bookingId: "HSI-202609-0001",
    roomNumber: "104",
    transactionType: "Payment",
    outlet: "Front Desk",
    itemCode: "PAY-UPI",
    description: "Direct Booking Full UPI Settlement (GPay/SBI)",
    debitAmount: 0,
    creditAmount: 2339.00,
    taxableBase: 0,
    gstRate: 0,
    cgst: 0,
    sgst: 0,
    sacCode: "000000",
    invoiceCategory: "Payment",
    isLocked: 1,
    createdAt: "2026-09-20 12:45:00"
  }
];

// ============================================================================
// CORPORATE LEDGER (STATEMENT OF ACCOUNTS WITH TDS SEC 194C / 194I)
// ============================================================================

export const INITIAL_CORPORATE_LEDGER = [
  // JK PAPER MILLS
  {
    entryId: "LED-JKP-001",
    corporateId: "CORP-01",
    date: "2026-09-01",
    type: "Opening Balance",
    invoiceNo: "-",
    description: "Opening Balance B/F for September 2026",
    debit: 142500,
    credit: 0,
    tdsSection: null,
    tdsAmount: 0,
    balance: 142500,
    bankRef: "-"
  },
  {
    entryId: "LED-JKP-002",
    corporateId: "CORP-01",
    date: "2026-09-08",
    type: "Bank NEFT Receipt",
    invoiceNo: "INV-B2B-202608-11",
    description: "NEFT Payment from JK Paper Mills Finance Desk",
    debit: 0,
    credit: 100000,
    tdsSection: "194C (2%)",
    tdsAmount: 2040,
    balance: 40460,
    bankRef: "AXISR20260908771234"
  },
  {
    entryId: "LED-JKP-003",
    corporateId: "CORP-01",
    date: "2026-09-15",
    type: "Stay Invoice Debit",
    invoiceNo: "INV-B2B-202609-01",
    description: "Auditors Accommodation (5 Exec Rooms, 3 Nights)",
    debit: 41395,
    credit: 0,
    tdsSection: null,
    tdsAmount: 0,
    balance: 81855,
    bankRef: "-"
  },

  // GAIL (INDIA) LIMITED
  {
    entryId: "LED-GAIL-001",
    corporateId: "CORP-02",
    date: "2026-09-01",
    type: "Opening Balance",
    invoiceNo: "-",
    description: "Opening Balance B/F for September 2026",
    debit: 86400,
    credit: 0,
    tdsSection: null,
    tdsAmount: 0,
    balance: 86400,
    bankRef: "-"
  },
  {
    entryId: "LED-GAIL-002",
    corporateId: "CORP-02",
    date: "2026-09-12",
    type: "Bank RTGS Receipt",
    invoiceNo: "INV-GAIL-202608-04",
    description: "Corporate RTGS Settlement for August Pipeline Surveyors",
    debit: 0,
    credit: 84672,
    tdsSection: "194I (2%)",
    tdsAmount: 1728,
    balance: 0,
    bankRef: "SBINR520260912998811"
  },
  {
    entryId: "LED-GAIL-003",
    corporateId: "CORP-02",
    date: "2026-09-20",
    type: "Stay Invoice Debit",
    invoiceNo: "INV-GAIL-202609-08",
    description: "Technical Delegation Stay (Room 402 + 2 Deluxe)",
    debit: 28450,
    credit: 0,
    tdsSection: null,
    tdsAmount: 0,
    balance: 28450,
    bankRef: "-"
  },

  // MAHINDRA & MAHINDRA
  {
    entryId: "LED-MAH-001",
    corporateId: "CORP-03",
    date: "2026-09-01",
    type: "Opening Balance",
    invoiceNo: "-",
    description: "Opening Balance B/F for September 2026",
    debit: 48200,
    credit: 0,
    tdsSection: null,
    tdsAmount: 0,
    balance: 48200,
    bankRef: "-"
  },
  {
    entryId: "LED-MAH-002",
    corporateId: "CORP-03",
    date: "2026-09-18",
    type: "Stay Invoice Debit",
    invoiceNo: "INV-MAH-202609-02",
    description: "Regional Dealer Conference & Suite Bookings",
    debit: 34100,
    credit: 0,
    tdsSection: null,
    tdsAmount: 0,
    balance: 82300,
    bankRef: "-"
  }
];

// ============================================================================
// STORE PURCHASES (LOCAL RAYAGADA MANDI RAW MATERIALS & VENDOR CREDIT)
// ============================================================================

export const INITIAL_STORE_PURCHASES = [
  {
    purchaseId: "PUR-202609-001",
    vendorName: "Rayagada Daily Sabzi Mandi Traders",
    invoiceNo: "MND-781",
    date: "2026-09-21",
    category: "Vegetables",
    itemsSummary: "Potatoes (50kg), Onions (40kg), Tomatoes (30kg), Ginger & Garlic (10kg)",
    totalAmount: 4850.00,
    paymentStatus: "Cash Paid",
    receivedBy: "Chef Jagabandhu Sahu"
  },
  {
    purchaseId: "PUR-202609-002",
    vendorName: "Maa Majhighariani Dairy Cooperative",
    invoiceNo: "MMD-1092",
    date: "2026-09-21",
    category: "Dairy & Paneer",
    itemsSummary: "Fresh Cow Milk (60 Ltrs), Fresh Malai Paneer (15 kg), Desi Curd (20 kg)",
    totalAmount: 6420.00,
    paymentStatus: "Credit Payable",
    receivedBy: "Store Incharge Niranjan"
  },
  {
    purchaseId: "PUR-202609-003",
    vendorName: "Utkal Poultry & Country Chicken Hub",
    invoiceNo: "UPC-445",
    date: "2026-09-21",
    category: "Poultry & Meat",
    itemsSummary: "Country Chicken dressed (25 kg), Broiler Chicken (20 kg)",
    totalAmount: 9800.00,
    paymentStatus: "UPI Paid",
    receivedBy: "Chef Jagabandhu Sahu"
  },
  {
    purchaseId: "PUR-202609-004",
    vendorName: "Jaykaypur Wholesale Grocery Mart",
    invoiceNo: "JKP-902",
    date: "2026-09-20",
    category: "Groceries & Rice",
    itemsSummary: "Premium Basmati Rice (100 kg), Mustard Oil (30 Ltrs), Toor Dal (50 kg)",
    totalAmount: 18400.00,
    paymentStatus: "Credit Payable",
    receivedBy: "Store Incharge Niranjan"
  }
];

// ============================================================================
// KITCHEN REQUISITIONS (STORE TO CANNON KITCHEN ISSUE VOUCHER)
// ============================================================================

export const INITIAL_KITCHEN_REQUISITIONS = [
  {
    requisitionId: "REQ-202609-01",
    date: "2026-09-21",
    targetOutlet: "Cannon Kitchen",
    itemName: "Fresh Malai Paneer",
    quantity: 8,
    unit: "kg",
    approxCost: 2560,
    issuedTo: "Chef Jagabandhu Sahu",
    issuedBy: "Store Manager"
  },
  {
    requisitionId: "REQ-202609-02",
    date: "2026-09-21",
    targetOutlet: "Cannon Kitchen",
    itemName: "Country Chicken dressed",
    quantity: 12,
    unit: "kg",
    approxCost: 3360,
    issuedTo: "Chef Jagabandhu Sahu",
    issuedBy: "Store Manager"
  },
  {
    requisitionId: "REQ-202609-03",
    date: "2026-09-21",
    targetOutlet: "Cannon Kitchen",
    itemName: "Premium Basmati Rice",
    quantity: 25,
    unit: "kg",
    approxCost: 2250,
    issuedTo: "Asst Chef Kailash",
    issuedBy: "Store Manager"
  }
];

// ============================================================================
// NIGHT AUDIT LOGS (TAMPER-PROOF 12:00 AM CLOSINGS)
// ============================================================================

export const INITIAL_NIGHT_AUDITS = [
  {
    auditId: "NA-2026-09-20",
    businessDate: "2026-09-20",
    closedAt: "2026-09-21 00:05:12",
    totalRooms: 40,
    occupiedRooms: 31,
    occupancyPct: 77.5,
    adr: 2420.00,
    revpar: 1875.50,
    roomRevenue: 75020.00,
    fnbRevenue: 24800.00,
    otherRevenue: 3400.00,
    grossRevenue: 103220.00,
    cashCollected: 28500.00,
    upiCollected: 49200.00,
    cardCollected: 11400.00,
    companyBilled: 14120.00,
    cashOpeningFloat: 5000.00,
    cashExpected: 33500.00,
    cashPhysicalDrawer: 33500.00,
    cashVariance: 0.00,
    isLocked: 1,
    auditorName: "Sudhakar Reddy (Front Office Lead)",
    notes: "Day successfully balanced. Zero cash discrepancy. All 31 occupied room charges and GST posted."
  },
  {
    auditId: "NA-2026-09-19",
    businessDate: "2026-09-19",
    closedAt: "2026-09-20 00:03:45",
    totalRooms: 40,
    occupiedRooms: 28,
    occupancyPct: 70.0,
    adr: 2350.00,
    revpar: 1645.00,
    roomRevenue: 65800.00,
    fnbRevenue: 21400.00,
    otherRevenue: 2800.00,
    grossRevenue: 90000.00,
    cashCollected: 24000.00,
    upiCollected: 44000.00,
    cardCollected: 12000.00,
    companyBilled: 10000.00,
    cashOpeningFloat: 5000.00,
    cashExpected: 29000.00,
    cashPhysicalDrawer: 29000.00,
    cashVariance: 0.00,
    isLocked: 1,
    auditorName: "Sudhakar Reddy (Front Office Lead)",
    notes: "Maa Majhighariani Wednesday pilgrimage rush handled smoothly."
  }
];

