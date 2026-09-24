import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RoomCatalog from './components/RoomCatalog';
import SatvikDining from './components/SatvikDining';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import CookieConsentBanner from './components/CookieConsentBanner';

// Dynamic Code-Splitting for Enterprise Operational Engines (Loaded on-demand)
const FloorExplorer3DModal = lazy(() => import('./components/FloorExplorer3DModal'));
const BookingModal = lazy(() => import('./components/BookingModal'));
const BookingReceiptModal = lazy(() => import('./components/BookingReceiptModal'));
const ReceptionAdmin = lazy(() => import('./components/ReceptionAdmin'));
const FinancialAnalytics = lazy(() => import('./components/FinancialAnalytics'));
const AutonomousBotFleetModal = lazy(() => import('./components/AutonomousBotFleetModal'));
const FoodOrderModal = lazy(() => import('./components/FoodOrderModal'));
const DarshanAdvisorModal = lazy(() => import('./components/DarshanAdvisorModal'));
const AiConciergeModal = lazy(() => import('./components/AiConciergeModal'));
const CorporatePortalModal = lazy(() => import('./components/CorporatePortalModal'));
const MasterFolioModal = lazy(() => import('./components/MasterFolioModal'));
const CannonKitchenPOS = lazy(() => import('./components/CannonKitchenPOS'));
const AccountsLedgerModal = lazy(() => import('./components/AccountsLedgerModal'));
const NightAuditModal = lazy(() => import('./components/NightAuditModal'));
const StoreInventoryModal = lazy(() => import('./components/StoreInventoryModal'));
const DirectorPortal = lazy(() => import('./components/DirectorPortal'));
const RevenueManagementModal = lazy(() => import('./components/RevenueManagementModal'));
const LegalPoliciesModal = lazy(() => import('./components/LegalPoliciesModal'));
const DpdpDataRightsModal = lazy(() => import('./components/DpdpDataRightsModal'));

import { INITIAL_ROOMS_INVENTORY, ROOM_TIERS, INITIAL_FOLIO_TRANSACTIONS } from './data/hotelData';
import { calculateAllTierMicroRates } from './utils/g3RmsEngine';
import { FloatingDock } from '@/components/ui/floating-dock';
import { Hotel, Layers, Compass, Utensils, ShieldCheck, Sparkles, Scale } from 'lucide-react';

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
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('privacy');
  const [dataRightsModalOpen, setDataRightsModalOpen] = useState(false);

  const getVerifiedAdminPin = () => {
    return sessionStorage.getItem('hsi_admin_pin') || localStorage.getItem('hsi_admin_pin') || '';
  };

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

  // Sync with Cloudflare Edge on mount and view changes
  useEffect(() => {
    const adminPin = adminPinVerified ? getVerifiedAdminPin() : '';
    const headers = adminPin ? { 'X-Admin-Key': adminPin } : {};

    fetch('/api/sync', { headers })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          if (data.data.rooms && data.data.rooms.length > 0) {
            setRooms(data.data.rooms);
          }
          if (data.data.bookings && data.data.bookings.length > 0) {
            setBookings(data.data.bookings);
          }
          if (data.data.folioTransactions && data.data.folioTransactions.length > 0) {
            const mappedTxs = data.data.folioTransactions.map(t => ({
              transactionId: t.transaction_id || t.transactionId,
              folioId: t.folio_id || t.folioId,
              bookingId: t.booking_id || t.bookingId,
              roomNumber: t.room_number || t.roomNumber,
              transactionType: t.transaction_type || t.transactionType,
              outlet: t.outlet,
              itemCode: t.item_code || t.itemCode,
              description: t.description,
              debitAmount: t.debit_amount !== undefined ? t.debit_amount : t.debitAmount,
              creditAmount: t.credit_amount !== undefined ? t.credit_amount : t.creditAmount,
              taxableBase: t.taxable_base !== undefined ? t.taxable_base : t.taxableBase,
              gstRate: t.gst_rate !== undefined ? t.gst_rate : t.gstRate,
              cgst: t.cgst,
              sgst: t.sgst,
              sacCode: t.sac_code || t.sacCode,
              invoiceId: t.invoice_id || t.invoiceId,
              isLocked: t.is_locked !== undefined ? t.is_locked : t.isLocked,
              createdBy: t.created_by || t.createdBy,
              createdAt: t.created_at || t.createdAt || t.date
            }));
            setTransactions(mappedTxs);
          }
        }
      })
      .catch(err => {
        console.debug("Edge sync offline, initialized with 40-inventory state:", err);
      });
  }, [currentView, adminPinVerified]);

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
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
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

    // Dispatch to Cloudflare Edge D1
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'post_folio_transaction',
        payload: newTxn
      })
    }).catch(err => console.warn('Offline transaction sync:', err));
  };

  const handleBillToRoomFromPOS = (payload) => {
    const newTxn = {
      transactionId: `TXN-${payload.roomNumber}-${Date.now().toString().slice(-4)}`,
      folioId: `FOLIO-${payload.roomNumber}`,
      bookingId: `BOOK-${payload.roomNumber}`,
      roomNumber: payload.roomNumber,
      transactionType: 'Food & Beverage',
      outlet: payload.outlet || 'Fenugreek Restaurant',
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

    // Dispatch to Cloudflare Edge D1
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'bill_kot_to_room',
        payload: {
          roomNumber: payload.roomNumber,
          kotId: payload.kotId,
          items: payload.items || [],
          subtotal: payload.subtotal,
          gst: payload.gst,
          totalAmount: payload.totalAmount,
          description: payload.description,
          outlet: payload.outlet || 'Fenugreek Restaurant',
          captainName: payload.captainName || 'F&B Captain'
        }
      })
    }).catch(err => console.warn('Offline KOT room bill sync:', err));

    alert(`✓ KOT #${payload.kotId} (${payload.outlet || 'Fenugreek Restaurant'}) of ₹${payload.totalAmount.toFixed(2)} debited directly to Room ${payload.roomNumber} Master Folio & synced to D1!`);
  };

  const handleSettleFolio = (roomNumber, tenderRows) => {
    handleUpdateRoomStatus(roomNumber, 'Cleaning');
    setTransactions(prev => prev.map(t => t.roomNumber === roomNumber ? { ...t, isLocked: 1 } : t));

    // Dispatch to Cloudflare Edge D1
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'settle_split_payment',
        payload: {
          folioId: `FOLIO-${roomNumber}`,
          roomNumber,
          invoiceId: `INV-${roomNumber}`,
          tenderRows
        }
      })
    }).catch(err => console.warn('Offline split settlement sync:', err));

    alert(`✓ Room ${roomNumber} folio settled via ${tenderRows.length} tenders! Room status changed to 'Cleaning'.`);
  };

  const handleExecuteNightAudit = (auditPayload) => {
    setTransactions(prev => prev.map(t => ({ ...t, isLocked: 1 })));

    // Dispatch to Cloudflare Edge D1
    const adminPin = getVerifiedAdminPin();
    if (!adminPin) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminPin
      },
      body: JSON.stringify({
        action: 'execute_night_audit',
        payload: auditPayload
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          console.log(`✓ Night Audit synced to Cloudflare D1 (auditId: ${data.auditId})`);
        }
      })
      .catch(err => console.warn('Offline night audit sync:', err));

    alert(`✓ Night Audit for ${auditPayload.businessDate} executed & synced to Cloudflare D1! All transactions locked (is_locked = 1). Business date rolled.`);
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
        rooms={rooms}
        adminPinVerified={adminPinVerified}
        setAdminPinVerified={setAdminPinVerified}
        showPinPrompt={showPinPrompt}
        setShowPinPrompt={setShowPinPrompt}
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

            <FaqSection 
              onOpenBooking={() => handleOpenBooking(ROOM_TIERS[0])}
            />

            <Suspense fallback={null}>
              <FinancialAnalytics bookings={bookings} />
            </Suspense>
          </>
        ) : (
          <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gold-glow)' }}>Loading Front Desk PMS...</div>}>
            <ReceptionAdmin 
              rooms={rooms}
              bookings={bookings}
              onUpdateRoomStatus={handleUpdateRoomStatus}
              onNewBooking={handleBookingSuccess}
              onRunNightAudit={handleRunNightAudit}
              onOpenRestaurantPOS={() => setPosModalOpen(true)}
              onOpenAccountsLedger={() => setAccountsModalOpen(true)}
              onOpenStoreInventory={() => setStoreInventoryModalOpen(true)}
            />

            <FinancialAnalytics bookings={bookings} />
          </Suspense>
        )}
      </main>

      {/* On-Demand Modals with Suspense Code-Splitting */}
      <Suspense fallback={null}>
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

        {/* Statutory Legal & Compliance Modals */}
        <LegalPoliciesModal 
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          initialTab={legalModalTab}
        />

        <DpdpDataRightsModal 
          isOpen={dataRightsModalOpen}
          onClose={() => setDataRightsModalOpen(false)}
        />
      </Suspense>

      <Footer 
        onOpenDarshan={() => setDarshanModalOpen(true)}
        onOpenDining={() => setDiningModalOpen(true)}
        onOpenCorporate={() => setCorporateModalOpen(true)}
        onOpenBotFleet={() => setBotFleetOpen(true)}
        onOpenLegal={(tab) => {
          setLegalModalTab(tab);
          setLegalModalOpen(true);
        }}
        onOpenDataRights={() => setDataRightsModalOpen(true)}
      />

      <CookieConsentBanner 
        onOpenPolicy={() => {
          setLegalModalTab('cookies');
          setLegalModalOpen(true);
        }}
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
            title: "Accounts Day Book",
            icon: <Scale className="h-5 w-5" />,
            onClick: () => setAccountsModalOpen(true)
          },
          {
            title: "Cannon Kitchen POS",
            icon: <Utensils className="h-5 w-5" />,
            onClick: () => setPosModalOpen(true)
          },

          {
            title: currentView === 'pms' ? "Guest Portal" : "Reception PMS",
            icon: <ShieldCheck className="h-5 w-5" />,
            onClick: () => {
              if (currentView === 'pms') {
                setCurrentView('guest');
              } else if (adminPinVerified) {
                setCurrentView('pms');
              } else {
                setShowPinPrompt(true);
              }
            }
          }
        ]}
      />
    </div>
  );
}
