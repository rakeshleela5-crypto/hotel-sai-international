-- ============================================================================
-- HOTEL SAI INTERNATIONAL - RAYAGADA (RESTORE AUTHENTIC 40-ROOM INVENTORY)
-- 4 Tiers x 10 Rooms = 40 Rooms (101-110, 201-210, 301-310, 401-410)
-- ============================================================================

PRAGMA foreign_keys = OFF;

-- Remove legacy non-standard rooms if any
DELETE FROM rooms WHERE room_number IN ('311', '312', '314', '315', '316', '411', '412', '413', '414', '415', '416');

-- Floor 1: Standard Deluxe (10 Rooms: 101 - 110)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('101', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '2 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Available'),
('102', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '2 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Occupied'),
('103', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '2 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Available'),
('104', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '1 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Occupied'),
('105', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '2 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Available'),
('106', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '2 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Occupied'),
('107', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '2 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Available'),
('108', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '2 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Occupied'),
('109', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', 'OOO', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Maintenance'),
('110', 'Standard Deluxe', 'STDDEL', 1, 1699.00, 2, 1, 'King Bed', '2 Pax', '["Air Conditioning","High-speed Wi-Fi","King Bed","Free Breakfast Buffet","Smart TV","Hot Water 24/7","Daily Housekeeping"]', 'Available')
ON CONFLICT(room_number) DO UPDATE SET
  tier = excluded.tier,
  room_type = excluded.room_type,
  floor = excluded.floor,
  tariff = excluded.tariff,
  capacity_adults = excluded.capacity_adults,
  bed_type = excluded.bed_type;

-- Floor 2: Deluxe Room (10 Rooms: 201 - 210)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('201', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '1 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('202', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '2 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('203', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', 'Available', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('204', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', 'Available', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('205', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', 'Available', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('206', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '1 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('207', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '1 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('208', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '1 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('209', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', 'Available', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('210', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', 'Available', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available')
ON CONFLICT(room_number) DO UPDATE SET
  tier = excluded.tier,
  room_type = excluded.room_type,
  floor = excluded.floor,
  tariff = excluded.tariff,
  capacity_adults = excluded.capacity_adults,
  bed_type = excluded.bed_type;

-- Floor 3: Executive Room (10 Rooms: 301 - 310)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('301', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('302', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('303', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '2 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('304', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('305', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('306', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('307', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'OOO', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Maintenance'),
('308', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('309', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('310', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied')
ON CONFLICT(room_number) DO UPDATE SET
  tier = excluded.tier,
  room_type = excluded.room_type,
  floor = excluded.floor,
  tariff = excluded.tariff,
  capacity_adults = excluded.capacity_adults,
  bed_type = excluded.bed_type;

-- Floor 4: Premium Suite (10 Rooms: 401 - 410)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('401', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('402', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('403', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('404', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('405', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('406', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('407', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('408', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('409', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied'),
('410', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Occupied')
ON CONFLICT(room_number) DO UPDATE SET
  tier = excluded.tier,
  room_type = excluded.room_type,
  floor = excluded.floor,
  tariff = excluded.tariff,
  capacity_adults = excluded.capacity_adults,
  bed_type = excluded.bed_type;

PRAGMA foreign_keys = ON;
