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
import MasterFolioModal from './components/MasterFolioModal';
import CommercialProposalModal from './components/CommercialProposalModal';
import CannonKitchenPOS from './components/CannonKitchenPOS';
import AccountsLedgerModal from './components/AccountsLedgerModal';
import NightAuditModal from './components/NightAuditModal';
import StoreInventoryModal from './components/StoreInventoryModal';
import DirectorPortal from './components/DirectorPortal';
import RevenueManagementModal from './components/RevenueManagementModal';
import Footer from './components/Footer';

import { INITIAL_ROOMS_INVENTORY, ROOM_TIERS, INITIAL_FOLIO_TRANSACTIONS } from './data/hotelData';
import { calculateAllTierMicroRates } from './utils/g3RmsEngine';
import { FloatingDock } from '@/components/ui/floating-dock';
import { Hotel, Layers, Compass, Utensils, ShieldCheck, Sparkles, Scale, FileText } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('guest'); // 'guest' or 'pms'
  const [rooms, setRooms] = useState(INITIAL_ROOMS_INVENTORY);
  const [transactions, setTransactions] = useState(INITIAL_FOLIO_TRANSACTIONS);
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
    },
    {
      bookingId: 'HSI-202609-0004',
      roomNumber: '402',
      tier: 'Premium Suite',
      guestName: 'Anil Sharma (GAIL Regional Project Team)',
      guestPhone: '+91 98210 44556',
      idProofType: 'Aadhaar',
      idProofMasked: 'XXXX-XXXX-4491',
      stateOfOrigin: 'Delhi',
      isInterstate: true,
      checkInDate: '2026-09-20',
      checkOutDate: '2026-09-22',
      nights: 2,
      adults: 2,
      children: 0,
      tariffPerNight: 3999,
      baseTotal: 7998,
      cgst: 479.88,
      sgst: 479.88,
      totalAmount: 13588.00, // Exact demonstration total (Room + F&B + Laundry)
      advanceDeposit: 5000.00,
      balanceDue: 8588.00,
      paymentMode: 'Split Tender (UPI + Cash)',
      paymentStatus: 'Pending Final Settlement',
      bookingStatus: 'Checked In',
      isB2b: true,
      corporateGstin: '07AAACG1509J1ZQ'
    }
  ]);

  const [adminPinVerified, setAdminPinVerified] = useState(false);

  // Core Modals state
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

  // IDS Next Operational Modules State
  const [folioModalOpen, setFolioModalOpen] = useState(false);
  const [commercialProposalOpen, setCommercialProposalOpen] = useState(false);
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [accountsModalOpen, setAccountsModalOpen] = useState(false);
  const [nightAuditModalOpen, setNightAuditModalOpen] = useState(false);
  const [storeInventoryModalOpen, setStoreInventoryModalOpen] = useState(false);
  const [directorPortalOpen, setDirectorPortalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [dynamicRates, setDynamicRates] = useState(() => calculateAllTierMicroRates({ occupancyRate: 68, daysToArrival: 3, pickupVelocity48h: 4 }));

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
    setNightAuditModalOpen(true);
  };

  const handleAddTransaction = (newTxn) => {
    setTransactions(prev => [newTxn, ...prev]);
  };

  const handleBillToRoomFromPOS = (payload) => {
    const newTxn = {
      transactionId: `TXN-${payload.roomNumber}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${payload.roomNumber}`,
      bookingId: `BOOK-${payload.roomNumber}`,
      roomNumber: payload.roomNumber,
      transactionType: 'Food & Beverage',
      outlet: payload.outlet,
      itemCode: payload.kotId,
      description: payload.description,
      debitAmount: payload.totalAmount,
      creditAmount: 0,
      taxableBase: payload.subtotal,
      gstRate: 5,
      cgst: payload.gst / 2,
      sgst: payload.gst / 2,
      sacCode: '996331',
      invoiceCategory: 'Food',
      isLocked: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setTransactions(prev => [newTxn, ...prev]);
    alert(`✓ KOT #${payload.kotId} (${payload.outlet}) of ₹${payload.totalAmount.toFixed(2)} debited directly to Room ${payload.roomNumber} Master Folio!`);
  };

  const handleSettleFolio = (roomNumber, tenderRows) => {
    handleUpdateRoomStatus(roomNumber, 'Cleaning');
    setTransactions(prev => prev.map(t => t.roomNumber === roomNumber ? { ...t, isLocked: 1 } : t));
    alert(`✓ Room ${roomNumber} folio settled via ${tenderRows.length} tenders! Room status changed to 'Cleaning'.`);
  };

  const handleExecuteNightAudit = (auditPayload) => {
    setTransactions(prev => prev.map(t => ({ ...t, isLocked: 1 })));
    alert(`✓ Night Audit for ${auditPayload.businessDate} executed! All transactions locked (is_locked = 1). Business date rolled.`);
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
        onOpenMasterFolio={() => setFolioModalOpen(true)}
        onOpenCannonKitchenPOS={() => setPosModalOpen(true)}
        onOpenAccountsLedger={() => setAccountsModalOpen(true)}
        onOpenNightAudit={() => setNightAuditModalOpen(true)}
        onOpenStoreInventory={() => setStoreInventoryModalOpen(true)}
        onOpenDirectorPortal={() => setDirectorPortalOpen(true)}
        onOpenRevenueManagement={() => setRevenueModalOpen(true)}
        onOpenCommercialProposal={() => setCommercialProposalOpen(true)}
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
                dynamicRates={dynamicRates}
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
        dynamicRates={dynamicRates}
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

      <CommercialProposalModal
        isOpen={commercialProposalOpen}
        onClose={() => setCommercialProposalOpen(false)}
      />

      {/* IDS Next Enterprise Operational Modals */}
      <MasterFolioModal 
        isOpen={folioModalOpen}
        onClose={() => setFolioModalOpen(false)}
        rooms={rooms}
        bookings={bookings}
        transactions={transactions}
        onAddTransaction={handleAddTransaction}
        onSettleFolio={handleSettleFolio}
      />

      <CannonKitchenPOS 
        isOpen={posModalOpen}
        onClose={() => setPosModalOpen(false)}
        rooms={rooms}
        onBillToRoom={handleBillToRoomFromPOS}
      />

      <AccountsLedgerModal 
        isOpen={accountsModalOpen}
        onClose={() => setAccountsModalOpen(false)}
        bookings={bookings}
      />

      <NightAuditModal 
        isOpen={nightAuditModalOpen}
        onClose={() => setNightAuditModalOpen(false)}
        rooms={rooms}
        bookings={bookings}
        transactions={transactions}
        onExecuteNightAudit={handleExecuteNightAudit}
      />

      <StoreInventoryModal 
        isOpen={storeInventoryModalOpen}
        onClose={() => setStoreInventoryModalOpen(false)}
      />

      <DirectorPortal 
        isOpen={directorPortalOpen}
        onClose={() => setDirectorPortalOpen(false)}
        rooms={rooms}
        bookings={bookings}
        onOpenRevenueManagement={() => {
          setDirectorPortalOpen(false);
          setRevenueModalOpen(true);
        }}
      />

      {/* IDeaS SAS G3 RMS Platform Revenue Director's Console */}
      <RevenueManagementModal 
        isOpen={revenueModalOpen}
        onClose={() => setRevenueModalOpen(false)}
        currentOccupancy={Math.round((rooms.filter(r => r.status === 'Occupied').length / (rooms.length || 40)) * 100)}
        activeRates={dynamicRates}
        onPublishRates={(newRates) => {
          setDynamicRates(newRates);
          setRooms(prev => prev.map(r => {
            const tierId = r.tier === 'Standard Deluxe' ? 'standard-deluxe' :
                           r.tier === 'Deluxe Room' ? 'deluxe-room' :
                           r.tier === 'Executive Room' ? 'executive-room' : 'premium-suite';
            if (newRates[tierId]) {
              return { ...r, tariff: newRates[tierId].recommendedRate };
            }
            return r;
          }));
          alert("⚡ IDeaS G3 RMS: Continuous dynamic micro-rates published to live booking engine, room catalog, and front desk reception!");
        }}
      />

      <Footer 
        onOpenDarshan={() => setDarshanModalOpen(true)}
        onOpenDining={() => setDiningModalOpen(true)}
        onOpenCorporate={() => setCorporateModalOpen(true)}
        onOpenBotFleet={() => setBotFleetOpen(true)}
      />

      {/* 21st.dev / Magic UI Floating Luxury Navigation Dock */}
      <FloatingDock 
        items={[
          {
            title: "Reserve Luxury Room",
            icon: <Hotel className="h-5 w-5" />,
            onClick: () => handleOpenBooking(ROOM_TIERS[0])
          },
          {
            title: "3D Isometric Tour",
            icon: <Layers className="h-5 w-5" />,
            onClick: () => setFloorExplorerOpen(true)
          },
          {
            title: "Audit Reconciler (Proof)",
            icon: <Scale className="h-5 w-5" />,
            onClick: () => setAccountsModalOpen(true)
          },
          {
            title: "Cannon Kitchen POS",
            icon: <Utensils className="h-5 w-5" />,
            onClick: () => setPosModalOpen(true)
          },
          {
            title: "Commercial Proposal",
            icon: <FileText className="h-5 w-5" />,
            onClick: () => setCommercialProposalOpen(true)
          },
          {
            title: currentView === 'pms' ? "Guest Portal" : "Reception PMS",
            icon: <ShieldCheck className="h-5 w-5" />,
            onClick: () => setCurrentView(currentView === 'pms' ? 'guest' : 'pms')
          }
        ]}
      />
    </div>
  );
}
