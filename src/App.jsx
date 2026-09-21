import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RoomCatalog from './components/RoomCatalog';
import FloorExplorer3DModal from './components/FloorExplorer3DModal';
import BookingModal from './components/BookingModal';
import BookingReceiptModal from './components/BookingReceiptModal';
import ReceptionAdmin from './components/ReceptionAdmin';
import FinancialAnalytics from './components/FinancialAnalytics';
import AutonomousBotFleetModal from './components/AutonomousBotFleetModal';
import SatvikDining from './components/SatvikDining';
import FoodOrderModal from './components/FoodOrderModal';
import DarshanAdvisorModal from './components/DarshanAdvisorModal';
import AiConciergeModal from './components/AiConciergeModal';
import CorporatePortalModal from './components/CorporatePortalModal';
import Footer from './components/Footer';

import { INITIAL_ROOMS_INVENTORY, ROOM_TIERS } from './data/hotelData';

export default function App() {
  const [currentView, setCurrentView] = useState('guest'); // 'guest' or 'pms'
  const [rooms, setRooms] = useState(INITIAL_ROOMS_INVENTORY);
  const [bookings, setBookings] = useState([
    {
      bookingId: 'HSI-202609-0001',
      roomNumber: '104',
      tier: 'Standard Deluxe',
      guestName: 'Santosh Patra',
      guestPhone: '+91 94371 22334',
      idProofType: 'Aadhaar',
      idProofMasked: 'XXXX-XXXX-8821',
      stateOfOrigin: 'Odisha',
      isInterstate: false,
      checkInDate: '2026-09-20',
      checkOutDate: '2026-09-22',
      nights: 2,
      adults: 2,
      children: 0,
      tariffPerNight: 1699,
      baseTotal: 3398,
      cgst: 84.95,
      sgst: 84.95,
      totalAmount: 3567.90,
      advanceDeposit: 3567.90,
      balanceDue: 0,
      paymentMode: 'UPI',
      paymentStatus: 'Paid',
      bookingStatus: 'Checked In',
      isB2b: false
    },
    {
      bookingId: 'HSI-202609-0002',
      roomNumber: '301',
      tier: 'Executive Room',
      guestName: 'Vikram Singhania (JK Paper)',
      guestPhone: '+91 98101 55667',
      idProofType: 'Passport',
      idProofMasked: 'XXXX-XXXX-9901',
      stateOfOrigin: 'Maharashtra',
      isInterstate: true,
      checkInDate: '2026-09-21',
      checkOutDate: '2026-09-24',
      nights: 3,
      adults: 1,
      children: 0,
      tariffPerNight: 2464, // 15% corporate discount on ₹2,899
      baseTotal: 7392,
      cgst: 184.80,
      sgst: 184.80,
      totalAmount: 7761.60,
      advanceDeposit: 0,
      balanceDue: 7761.60,
      paymentMode: 'Corporate B2B',
      paymentStatus: 'Pending Payment at Check-Out',
      bookingStatus: 'Checked In',
      isB2b: true,
      corporateGstin: '21AAACJ1288P1ZZ'
    }
  ]);

  const [adminPinVerified, setAdminPinVerified] = useState(false);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTierForBooking, setSelectedTierForBooking] = useState(null);
  const [selectedRoomNumForBooking, setSelectedRoomNumForBooking] = useState(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentReceiptBooking, setCurrentReceiptBooking] = useState(null);

  const [floorExplorerOpen, setFloorExplorerOpen] = useState(false);
  const [diningModalOpen, setDiningModalOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [darshanModalOpen, setDarshanModalOpen] = useState(false);
  const [aiConciergeOpen, setAiConciergeOpen] = useState(false);
  const [botFleetOpen, setBotFleetOpen] = useState(false);
  const [corporateModalOpen, setCorporateModalOpen] = useState(false);

  const [searchDates, setSearchDates] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: '2'
  });

  // Sync with Cloudflare Edge on mount
  useEffect(() => {
    fetch('/api/sync')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.rooms && data.data.rooms.length > 0) {
          setRooms(data.data.rooms);
        }
        if (data && data.data && data.data.bookings && data.data.bookings.length > 0) {
          setBookings(data.data.bookings);
        }
      })
      .catch(err => {
        console.debug("Edge sync offline, initialized with 40-inventory state:", err);
      });
  }, []);

  const handleOpenBooking = (tier, roomNumber = null) => {
    setSelectedTierForBooking(tier || ROOM_TIERS[0]);
    setSelectedRoomNumForBooking(roomNumber);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (newBooking) => {
    setBookings(prev => [newBooking, ...prev]);
    // Update room status
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === newBooking.roomNumber) {
        return {
          ...r,
          status: 'Occupied',
          currentGuestName: newBooking.guestName,
          currentBookingId: newBooking.bookingId
        };
      }
      return r;
    }));
    setCurrentReceiptBooking(newBooking);
    setReceiptModalOpen(true);
  };

  const handleUpdateRoomStatus = (roomNumber, status, guestName = null, bookingId = null) => {
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === roomNumber) {
        return {
          ...r,
          status,
          currentGuestName: status === 'Available' ? null : (guestName !== undefined ? guestName : r.currentGuestName),
          currentBookingId: status === 'Available' ? null : (bookingId !== undefined ? bookingId : r.currentBookingId)
        };
      }
      return r;
    }));

    // Send update to Edge
    const adminPin = localStorage.getItem('hsi_admin_pin') || '7650';
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'update_room_status',
        payload: { roomNumber, status, guestName, bookingId }
      })
    }).catch(() => {});
  };

  const handleRunNightAudit = () => {
    const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
    const totalRev = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    alert(`✓ Night Audit executed! Current Occupancy: ${occupiedCount}/40 rooms (${((occupiedCount/40)*100).toFixed(1)}%). Total ledger revenue: ₹${totalRev.toLocaleString()}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar with 40-room counter & view switcher */}
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpen3DExplorer={() => setFloorExplorerOpen(true)}
        onOpenDining={() => setDiningModalOpen(true)}
        onOpenDarshan={() => setDarshanModalOpen(true)}
        onOpenAiConcierge={() => setAiConciergeOpen(true)}
        onOpenBotFleet={() => setBotFleetOpen(true)}
        onOpenCorporate={() => setCorporateModalOpen(true)}
        rooms={rooms}
        adminPinVerified={adminPinVerified}
        setAdminPinVerified={setAdminPinVerified}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'guest' ? (
          <>
            <Hero 
              rooms={rooms}
              onOpenBooking={handleOpenBooking}
              onOpen3DExplorer={() => setFloorExplorerOpen(true)}
              onOpenAiConcierge={() => setAiConciergeOpen(true)}
              searchDates={searchDates}
              setSearchDates={setSearchDates}
            />

            <div id="inventory">
              <RoomCatalog 
                rooms={rooms}
                onSelectTier={handleOpenBooking}
                onOpen3DExplorer={() => setFloorExplorerOpen(true)}
              />
            </div>

            <SatvikDining 
              onOpenOrderModal={(item) => {
                setSelectedFoodItem(item);
                setDiningModalOpen(true);
              }}
            />

            <FinancialAnalytics bookings={bookings} />
          </>
        ) : (
          <>
            <ReceptionAdmin 
              rooms={rooms}
              bookings={bookings}
              onUpdateRoomStatus={handleUpdateRoomStatus}
              onNewBooking={handleBookingSuccess}
              onRunNightAudit={handleRunNightAudit}
            />

            <FinancialAnalytics bookings={bookings} />
          </>
        )}
      </main>

      {/* Modals */}
      <FloorExplorer3DModal 
        isOpen={floorExplorerOpen}
        onClose={() => setFloorExplorerOpen(false)}
        rooms={rooms}
        onBookRoom={(tier, roomNumber) => handleOpenBooking(tier, roomNumber)}
      />

      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialTier={selectedTierForBooking}
        initialRoomNumber={selectedRoomNumForBooking}
        rooms={rooms}
        bookings={bookings}
        onBookingSuccess={handleBookingSuccess}
      />

      <BookingReceiptModal 
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        booking={currentReceiptBooking}
      />

      <FoodOrderModal 
        isOpen={diningModalOpen}
        onClose={() => {
          setDiningModalOpen(false);
          setSelectedFoodItem(null);
        }}
        initialItem={selectedFoodItem}
        rooms={rooms}
      />

      <DarshanAdvisorModal 
        isOpen={darshanModalOpen}
        onClose={() => setDarshanModalOpen(false)}
      />

      <AiConciergeModal 
        isOpen={aiConciergeOpen}
        onClose={() => setAiConciergeOpen(false)}
      />

      <AutonomousBotFleetModal 
        isOpen={botFleetOpen}
        onClose={() => setBotFleetOpen(false)}
      />

      <CorporatePortalModal 
        isOpen={corporateModalOpen}
        onClose={() => setCorporateModalOpen(false)}
      />

      <Footer 
        onOpenDarshan={() => setDarshanModalOpen(true)}
        onOpenDining={() => setDiningModalOpen(true)}
        onOpenCorporate={() => setCorporateModalOpen(true)}
        onOpenBotFleet={() => setBotFleetOpen(true)}
      />
    </div>
  );
}
