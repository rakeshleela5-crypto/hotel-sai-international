import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Columns3, Grid, Calendar as CalendarIcon, Users, MapPin, 
  Clock, Building, Award, CheckCircle2, ChevronRight, X, 
  Coffee, Utensils, Monitor, Volume2, DollarSign, Filter, Sparkles
} from 'lucide-react';

export type CalendarEventType = {
  id: string;
  day: string; // '01', '02', ..., '30'
  dateStr: string; // 'Tue, 22 Sep 2026'
  time: string;
  title: string;
  category: 'banquet' | 'room' | 'corporate';
  venue: string; // 'A/C Conference Hall', 'Mandapam Banquet', 'Room 402', etc.
  organizer: string;
  contactPerson?: string;
  pax: string;
  setup?: string; // 'Theater Style', 'U-Shape', 'Cluster', 'King Bed Executive'
  billing: string; // 'Bill to Company (BTC)', 'Direct / Cash', 'Company Account'
  status: 'In-Progress' | 'Confirmed' | 'In-House' | 'Completed' | 'Upcoming';
  amount?: number;
  beoDetails?: {
    setupStyle: string;
    avEquipments: string[];
    fbSchedule: { time: string; item: string }[];
    billingAccount: string;
    coordinator: string;
  };
};

export type DayType = {
  day: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  events?: CalendarEventType[];
};

// Seed authentic Hotel Sai International bookings and Rayagada corporate conventions for September 2026
const DEFAULT_SEPTEMBER_EVENTS: CalendarEventType[] = [
  {
    id: 'EVT-SEP-01',
    day: '01',
    dateStr: 'Tue, 01 Sep 2026',
    time: '10:30 AM - 01:30 PM',
    title: 'JK Paper Mills - Quarterly Pulp Procurement Review',
    category: 'banquet',
    venue: 'Executive Board Room (2nd Floor)',
    organizer: 'JK Paper Mills Ltd. (Jaykaypur)',
    contactPerson: 'Subrat Panda (Admin GM)',
    pax: '16 Delegates',
    setup: 'U-Shape Conference Table',
    billing: 'BTC (CORP-01 - JK Paper Mills)',
    status: 'Completed',
    amount: 14500,
    beoDetails: {
      setupStyle: 'Executive U-Shape with executive leather swivel chairs',
      avEquipments: ['85" 4K Presentation Display', 'Polycom Conference Speakerphone', 'Wi-Fi 6 Dedicated SSID'],
      fbSchedule: [
        { time: '10:30 AM', item: 'South Indian Filter Coffee & Cashew Biscuits' },
        { time: '01:00 PM', item: 'Executive Thali Lunch at Cannon Kitchen' }
      ],
      billingAccount: 'JK Paper Mills Ltd. Corp Account #CORP-01',
      coordinator: 'K. Simhachalam (Front Office)'
    }
  },
  {
    id: 'EVT-SEP-04',
    day: '04',
    dateStr: 'Fri, 04 Sep 2026',
    time: '02:00 PM - 06:00 PM',
    title: 'GAIL India - Pipeline Safety Audit Team Check-in',
    category: 'room',
    venue: 'Rooms 301, 304 & 305 (Executive Tier)',
    organizer: 'GAIL (India) Limited - Rayagada Pipeline Div',
    contactPerson: 'Rajeshwar Rao (Project Incharge)',
    pax: '4 Senior Engineers',
    setup: '3 Executive AC Single/Double Occupancy',
    billing: 'BTC (CORP-02 - GAIL India)',
    status: 'Completed',
    amount: 28990,
    beoDetails: {
      setupStyle: 'Room Block with High-Speed Work Desks',
      avEquipments: ['In-room Ergonomic Workstations', 'Direct High-Speed LAN Ports'],
      fbSchedule: [
        { time: '07:30 AM', item: 'Complimentary Buffet Breakfast (CP Plan)' },
        { time: '08:30 PM', item: 'Room Service Dinner from Cannon Kitchen' }
      ],
      billingAccount: 'GAIL India Limited #CORP-02',
      coordinator: 'S. Patnaik (Shift Lead)'
    }
  },
  {
    id: 'EVT-SEP-08',
    day: '08',
    dateStr: 'Tue, 08 Sep 2026',
    time: '09:30 AM - 05:00 PM',
    title: 'IMFA Therubali - Annual Transporters & Vendors Conclave',
    category: 'banquet',
    venue: 'A/C Conference Hall (Ground Floor)',
    organizer: 'Indian Metals & Ferro Alloys (IMFA)',
    contactPerson: 'D. K. Mohapatra (VP HR & Logistics)',
    pax: '48 Delegates',
    setup: 'Theater Style + Podium & Head Table',
    billing: 'BTC (CORP-05 - IMFA Therubali)',
    status: 'Completed',
    amount: 42000,
    beoDetails: {
      setupStyle: 'Theater Seating with Central Aisle and Dual Registration Desks',
      avEquipments: ['Laser Projector 5000 Lumens', 'Dual Cordless UHF Handheld Mics', 'Podium Goose-neck Mic'],
      fbSchedule: [
        { time: '09:30 AM', item: 'Morning Welcome Tea & Assorted Bakery Cookies' },
        { time: '01:15 PM', item: 'Grand Regional Odia Buffet (Dalma, Paneer Butter, Sweet Rice)' },
        { time: '04:30 PM', item: 'High-Tea with Fresh Rayagada Samosas & Green Tea' }
      ],
      billingAccount: 'IMFA Therubali Ledger #CORP-05',
      coordinator: 'B. Sadananda (Banquet Supervisor)'
    }
  },
  {
    id: 'EVT-SEP-11',
    day: '11',
    dateStr: 'Fri, 11 Sep 2026',
    time: '12:00 PM Check-in',
    title: 'Vedanta Lanjigarh Alumina Refinery - Technical Audit Delegation',
    category: 'room',
    venue: 'Rooms 408, 409 & 411 (Floor 4 Executive)',
    organizer: 'Vedanta Limited (Transit Group)',
    contactPerson: 'Arunav Sengupta (Lead Auditor)',
    pax: '5 Executives',
    setup: '3 King Executive Suites',
    billing: 'Direct Corporate Card / BTC',
    status: 'Completed',
    amount: 34500
  },
  {
    id: 'EVT-SEP-14',
    day: '14',
    dateStr: 'Mon, 14 Sep 2026',
    time: '10:00 AM - 04:00 PM',
    title: 'Utkal Alumina - Sustainable CSR Livelihoods Workshop',
    category: 'banquet',
    venue: 'Executive Board Room (2nd Floor)',
    organizer: 'Utkal Alumina International Ltd. (Aditya Birla Group)',
    contactPerson: 'Manish Agrawal (Corporate Logistics)',
    pax: '18 Participants',
    setup: 'Hollow Square Interactive Setup',
    billing: 'BTC (CORP-06 - Utkal Alumina)',
    status: 'Completed',
    amount: 19800,
    beoDetails: {
      setupStyle: 'Hollow Square with Note Pads, Pencils and Bottled Mineral Water',
      avEquipments: ['Interactive Smart Board', 'Clip-on Collar Wireless Mic', 'Ceiling Surround Sound'],
      fbSchedule: [
        { time: '10:00 AM', item: 'Ginger Tea & Finger Sandwiches' },
        { time: '01:30 PM', item: 'Satvik Pure Veg Lunch Buffet (Jain Prepared Available)' }
      ],
      billingAccount: 'Utkal Alumina Int. Ltd. #CORP-06',
      coordinator: 'K. Deepak (F&B Lead)'
    }
  },
  {
    id: 'EVT-SEP-17',
    day: '17',
    dateStr: 'Thu, 17 Sep 2026',
    time: '06:00 PM - 09:30 PM',
    title: 'East Coast Railway (ECoR) - Safety Inspection Team Dinner',
    category: 'corporate',
    venue: 'Party Hall 15 (Banquet Section)',
    organizer: 'East Coast Railway Rayagada Division',
    contactPerson: 'P. K. Nayak (Sr. DSTE)',
    pax: '30 Railway Officers',
    setup: 'Round Banquet Tables with Centerpieces',
    billing: 'Government Official PO / Direct Settlement',
    status: 'Completed',
    amount: 22500
  },
  {
    id: 'EVT-SEP-20',
    day: '20',
    dateStr: 'Sun, 20 Sep 2026',
    time: '09:00 AM - 03:30 PM',
    title: 'Rayagada District Youth Leadership & Social Service Conclave',
    category: 'banquet',
    venue: 'Mandapam Grand Banquet Hall',
    organizer: 'Rayagada Rotary & Social Welfare Trust',
    contactPerson: 'Dr. B. K. Rath (President)',
    pax: '95 Attendees',
    setup: 'Cluster Banquet Seating (10 per table)',
    billing: 'Advance Paid + Direct UPI Settlement',
    status: 'Completed',
    amount: 55000,
    beoDetails: {
      setupStyle: 'Cluster Dining and Lecture Hall Hybrid with VIP Stage Backdrop',
      avEquipments: ['Dual 120" Screen Projection', 'JBL Line-Array Audio System', 'Stage Lighting & Podiums'],
      fbSchedule: [
        { time: '09:00 AM', item: 'Breakfast Buffet: Puri Bhaji, Idli Sambar, Masala Chai' },
        { time: '01:30 PM', item: 'Grand Feast Buffet with Rayagada Chhena Poda' }
      ],
      billingAccount: 'Rotary Trust Direct Folio #B-8831',
      coordinator: 'S. Ramesh (Banquet Lead)'
    }
  },
  // TODAY: 22 SEPTEMBER 2026
  {
    id: 'EVT-SEP-22-1',
    day: '22',
    dateStr: 'Tue, 22 Sep 2026 (TODAY)',
    time: '10:00 AM - 04:30 PM',
    title: 'Linde India Ltd - Cryogenic Plant Engineering Review (LIVE)',
    category: 'banquet',
    venue: 'A/C Conference Hall (Ground Floor)',
    organizer: 'Linde India Ltd (Industrial Gases Div)',
    contactPerson: 'Anirudh Roy (Chief Project Engineer)',
    pax: '35 Delegates',
    setup: 'Classroom / Theater Hybrid Setup',
    billing: 'BTC (Corporate Approved Linde Account)',
    status: 'In-Progress',
    amount: 38500,
    beoDetails: {
      setupStyle: 'Tiered classroom tables with individual power strips and A4 writing pads',
      avEquipments: [
        'Full HD 1080p Ultra-short Throw Projector',
        '3 Wireless Gooseneck Mics + 2 Handheld UHF Mics',
        'High-Speed Dedicated 100Mbps Wi-Fi VLAN'
      ],
      fbSchedule: [
        { time: '10:00 AM', item: 'Arrival Refreshments: Darjeeling Tea, Nescafé Coffee & Dry Fruit Cake' },
        { time: '01:15 PM', item: 'Executive Hot Buffet: Paneer Lababdar, Dal Makhani, Jeera Pulao, Gulab Jamun' },
        { time: '04:00 PM', item: 'Evening High Tea: Masala Chai, Crispy Veg Cutlets & Cookies' }
      ],
      billingAccount: 'Linde India Ltd Corp Ledger #LND-9921',
      coordinator: 'K. Simhachalam & Consultant S. Patnaik'
    }
  },
  {
    id: 'EVT-SEP-22-2',
    day: '22',
    dateStr: 'Tue, 22 Sep 2026 (TODAY)',
    time: 'In-House Stay (Check-out 24-Sep)',
    title: 'Mr. P. Ashok - JK Paper Mills Technical Consultant',
    category: 'room',
    venue: 'Room 402 (Floor 4 Executive Room)',
    organizer: 'JK Paper Mills Corporate Account',
    contactPerson: 'P. Ashok (+91 94371 88201)',
    pax: '1 Guest (Occupied)',
    setup: 'Executive Room AC with King Bed',
    billing: 'BTC (CORP-01) • Current Folio Balance: ₹10,084.38',
    status: 'In-House',
    amount: 10084.38
  },
  {
    id: 'EVT-SEP-22-3',
    day: '22',
    dateStr: 'Tue, 22 Sep 2026 (TODAY)',
    time: 'In-House Stay (Check-out 23-Sep)',
    title: 'Mr. Bijay Paswan - PRADAN Livelihood Project Field Lead',
    category: 'corporate',
    venue: 'Room 410 (Floor 4 Executive Room)',
    organizer: 'PRADAN Rayagada Office',
    contactPerson: 'Bijay Paswan (+91 88950 11422)',
    pax: '1 Guest (Occupied)',
    setup: 'Executive Room AC Single',
    billing: 'Direct Settlement • Balance Due: ₹5,544.00',
    status: 'In-House',
    amount: 5544.00
  },
  {
    id: 'EVT-SEP-24',
    day: '24',
    dateStr: 'Thu, 24 Sep 2026',
    time: '11:00 AM - 05:30 PM',
    title: 'HCCB (Coca-Cola) - Regional Distribution & Supply Chain Meet',
    category: 'banquet',
    venue: 'Party Hall 16 (Banquet Section)',
    organizer: 'Hindustan Coca-Cola Beverages Pvt. Ltd.',
    contactPerson: 'Amitabh Sen (Logistics Head)',
    pax: '28 Regional Distributors',
    setup: 'Cluster Tables with Product Displays',
    billing: 'BTC (CORP-04 - HCCB)',
    status: 'Confirmed',
    amount: 24000,
    beoDetails: {
      setupStyle: '6 Round Tables with Product Demonstration Counter',
      avEquipments: ['Portable High-Contrast LED Screen', 'Wireless Mic', 'PA Speaker Setup'],
      fbSchedule: [
        { time: '11:00 AM', item: 'Beverage Welcome Bar & Light Snacks' },
        { time: '01:30 PM', item: 'Special South Odisha Buffet Lunch' },
        { time: '04:45 PM', item: 'High Tea & Snack Boxes' }
      ],
      billingAccount: 'HCCB South Odisha Hub #CORP-04',
      coordinator: 'B. Bijay (Banquet Ops)'
    }
  },
  {
    id: 'EVT-SEP-27',
    day: '27',
    dateStr: 'Sun, 27 Sep 2026',
    time: '10:00 AM - 04:00 PM',
    title: 'Odisha Tourism - Koraput & Rayagada Tribal Heritage Symposium',
    category: 'banquet',
    venue: 'Mandapam Grand Banquet Hall',
    organizer: 'District Tourism Promotion Council & OTDC',
    contactPerson: 'District Tourism Officer (Rayagada)',
    pax: '110 Guests & Delegates',
    setup: 'Auditorium Theater Seating with Exhibition Booths',
    billing: 'OTDC Government Direct Billing',
    status: 'Confirmed',
    amount: 68000,
    beoDetails: {
      setupStyle: 'Grand Auditorium Seating with Tribal Artifacts Exhibition Area',
      avEquipments: ['Dual Heavy-Duty Projectors', 'Multi-Mic Digital Sound Console', 'Video Recording Setup'],
      fbSchedule: [
        { time: '10:00 AM', item: 'Welcome Drinks: Bela Pana & Coconut Water' },
        { time: '01:00 PM', item: 'Traditional 14-Item Odia Bhoji Buffet' },
        { time: '03:45 PM', item: 'Chhena Jhili, Chenna Poda & Spiced Milk Tea' }
      ],
      billingAccount: 'OTDC Rayagada District Voucher',
      coordinator: 'K. Simhachalam & S. Patnaik'
    }
  },
  {
    id: 'EVT-SEP-29',
    day: '29',
    dateStr: 'Tue, 29 Sep 2026',
    time: '07:00 PM - 10:30 PM',
    title: 'Utkal Alumina & Hindalco - Senior Leadership Gala Dinner',
    category: 'corporate',
    venue: 'A/C Conference Hall & Cannon Kitchen Terrace',
    organizer: 'Utkal Alumina International (Aditya Birla Group)',
    contactPerson: 'Manish Agrawal',
    pax: '32 Senior Executives',
    setup: 'Fine Dining Candlelit Banquet Layout',
    billing: 'BTC (CORP-06)',
    status: 'Confirmed',
    amount: 36000
  },
  {
    id: 'EVT-SEP-30',
    day: '30',
    dateStr: 'Wed, 30 Sep 2026',
    time: '04:00 PM - 07:00 PM',
    title: 'End of Month Revenue & Statutory Night Audit Review',
    category: 'corporate',
    venue: 'GM Executive Suite & Admin Board',
    organizer: 'Hotel Sai International Management',
    contactPerson: 'General Manager & Financial Controller',
    pax: '8 Department Heads',
    setup: 'Round Executive Table',
    billing: 'Internal Management Review',
    status: 'Confirmed',
    amount: 0
  }
];

// September 2026 Grid Construction:
// 01-Sep-2026 is Tuesday.
// In Sunday-based calendar:
// Sun (Aug 30) = -2, Mon (Aug 31) = -1
// Days 01 .. 30
// 30-Sep-2026 is Wednesday.
// Thu (Oct 01) = +1, Fri (Oct 02) = +2, Sat (Oct 03) = +3
// Total 35 days (5 full weeks).
const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const generateSeptember2026Grid = (eventsList: CalendarEventType[]): DayType[] => {
  const grid: DayType[] = [];

  // August filler days (Sunday 30 Aug, Monday 31 Aug)
  grid.push({ day: '30', isCurrentMonth: false, isToday: false });
  grid.push({ day: '31', isCurrentMonth: false, isToday: false });

  // Days 1 through 30 of September 2026
  for (let i = 1; i <= 30; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    const dayEvents = eventsList.filter((e) => e.day === dayStr);
    grid.push({
      day: dayStr,
      isCurrentMonth: true,
      isToday: dayStr === '22', // Today is 22-Sep-2026
      events: dayEvents.length > 0 ? dayEvents : undefined
    });
  }

  // October filler days (Thursday 1 Oct, Friday 2 Oct, Saturday 3 Oct)
  grid.push({ day: '01', isCurrentMonth: false, isToday: false });
  grid.push({ day: '02', isCurrentMonth: false, isToday: false });
  grid.push({ day: '03', isCurrentMonth: false, isToday: false });

  return grid;
};

interface DayProps {
  day: DayType;
  isSelected: boolean;
  onSelect: (day: DayType) => void;
  onHover: (dayStr: string | null) => void;
}

const DayCell: React.FC<DayProps> = ({ day, isSelected, onSelect, onHover }) => {
  const hasEvents = !!day.events && day.events.length > 0;
  const isBanquet = hasEvents && day.events?.some((e) => e.category === 'banquet');
  const isCorporate = hasEvents && day.events?.some((e) => e.category === 'corporate');
  const isRoom = hasEvents && day.events?.some((e) => e.category === 'room');

  return (
    <motion.div
      onClick={() => day.isCurrentMonth && onSelect(day)}
      onMouseEnter={() => day.isCurrentMonth && onHover(day.day)}
      onMouseLeave={() => onHover(null)}
      whileHover={day.isCurrentMonth ? { scale: 1.04, y: -2 } : {}}
      whileTap={day.isCurrentMonth ? { scale: 0.96 } : {}}
      transition={{ duration: 0.15 }}
      className={`relative flex flex-col items-center justify-between p-1.5 transition-all duration-200 ${
        !day.isCurrentMonth
          ? 'cursor-not-allowed bg-slate-900/30 opacity-30 text-slate-600'
          : isSelected
          ? 'cursor-pointer bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
          : day.isToday
          ? 'cursor-pointer bg-gradient-to-b from-emerald-950/50 to-slate-900 border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
          : hasEvents
          ? 'cursor-pointer bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/50'
          : 'cursor-pointer bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/60 text-slate-400'
      }`}
      style={{ height: '4.8rem', borderRadius: 12 }}
    >
      {/* Top Header in Day Cell: Date Number + Today Tag */}
      <div className="flex w-full items-center justify-between px-1">
        <span
          className={`text-xs font-bold ${
            day.isToday
              ? 'text-emerald-400 font-extrabold text-sm'
              : isSelected
              ? 'text-amber-300 font-extrabold'
              : day.isCurrentMonth
              ? 'text-slate-200'
              : 'text-slate-600'
          }`}
        >
          {day.day}
        </span>

        {day.isToday && (
          <span className="flex items-center gap-0.5 rounded bg-emerald-500/30 px-1 py-0.2 text-[9px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/50 animate-pulse">
            Today
          </span>
        )}

        {hasEvents && !day.isToday && (
          <span className="flex size-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-300 border border-amber-500/40">
            {day.events?.length}
          </span>
        )}
      </div>

      {/* Visual Indicator Dots / Badges */}
      {hasEvents && (
        <div className="flex w-full flex-col gap-0.5 px-0.5">
          {day.events?.slice(0, 2).map((ev) => (
            <div
              key={ev.id}
              className={`truncate rounded px-1 py-0.5 text-[9px] font-medium leading-none ${
                ev.category === 'banquet'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/30'
                  : ev.category === 'corporate'
                  ? 'bg-purple-500/25 text-purple-200 border border-purple-500/30'
                  : 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/30'
              }`}
            >
              {ev.title.split(' - ')[0]}
            </div>
          ))}
          {(day.events?.length || 0) > 2 && (
            <span className="text-[8px] font-semibold text-slate-400 pl-1">
              +{(day.events?.length || 0) - 2} more
            </span>
          )}
        </div>
      )}

      {/* Empty Cell Bottom Spacer */}
      {!hasEvents && <div className="h-2" />}
    </motion.div>
  );
};

export interface InteractiveCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  rooms?: any[];
  bookings?: any[];
  onSelectBooking?: (booking: any) => void;
}

const InteractiveCalendar = React.forwardRef<HTMLDivElement, InteractiveCalendarProps>(
  ({ className, rooms = [], bookings = [], onSelectBooking, ...props }, ref) => {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>('22'); // Default to Today (22 Sep)
    const [activeFilter, setActiveFilter] = useState<'all' | 'banquet' | 'room' | 'corporate'>('all');
    const [selectedBeoEvent, setSelectedBeoEvent] = useState<CalendarEventType | null>(null);

    // Merge static seeded conventions with any dynamic active bookings passed from PMS
    const mergedEvents = useMemo(() => {
      const list = [...DEFAULT_SEPTEMBER_EVENTS];

      // Convert dynamic PMS bookings if present
      if (Array.isArray(bookings) && bookings.length > 0) {
        bookings.forEach((b, idx) => {
          // Check if already represented
          const exists = list.some((e) => e.title.includes(b.guestName || b.roomNumber));
          if (!exists && b.guestName) {
            list.push({
              id: `PMS-BK-${b.id || idx}`,
              day: '22', // Current live day
              dateStr: 'Tue, 22 Sep 2026',
              time: `${b.checkInTime || '12:00 PM'} Check-in`,
              title: `${b.guestName} (${b.roomNumber ? `Room ${b.roomNumber}` : 'Stay'})`,
              category: b.company ? 'corporate' : 'room',
              venue: b.roomNumber ? `Room ${b.roomNumber}` : 'Standard Stay',
              organizer: b.company || b.guestName,
              pax: `${b.pax || 1} Guest(s)`,
              setup: 'In-House PMS Guest',
              billing: b.billingType === 'BTC' ? `BTC (${b.company || 'Corporate'})` : 'Direct / Cash',
              status: b.status === 'Checked-In' ? 'In-House' : 'Confirmed',
              amount: b.totalAmount || b.tariff || 2199
            });
          }
        });
      }

      return list;
    }, [bookings]);

    const calendarGrid = useMemo(() => generateSeptember2026Grid(mergedEvents), [mergedEvents]);

    // Filtered events based on active category and selected day
    const displayedEvents = useMemo(() => {
      let list = mergedEvents;

      if (activeFilter !== 'all') {
        list = list.filter((e) => e.category === activeFilter);
      }

      if (selectedDay) {
        list = list.filter((e) => e.day === selectedDay);
      }

      return list;
    }, [mergedEvents, activeFilter, selectedDay]);

    const handleSelectDay = (day: DayType) => {
      if (selectedDay === day.day) {
        // Toggle off to show all
        setSelectedDay(null);
      } else {
        setSelectedDay(day.day);
      }
    };

    return (
      <div ref={ref} className={`w-full flex flex-col gap-6 ${className || ''}`} {...props}>
        {/* TOP STATUS BAR & HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <Sparkles className="size-3.5 text-amber-400" />
                Hotel Sai International • Rayagada
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                Live Date: Tuesday, 22 Sep 2026
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-wide text-white">
              SEPTEMBER <span className="text-amber-400">2026</span> CONVENTION &amp; BOOKINGS
            </h2>
            <p className="text-slate-400 text-xs lg:text-sm mt-0.5">
              Comprehensive interactive timeline for A/C Conference Hall, Mandapam Banquet, Party Halls &amp; Corporate Room Stays.
            </p>
          </div>

          {/* Controls: Filter Pills & View Toggle */}
          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                All ({mergedEvents.length})
              </button>
              <button
                onClick={() => setActiveFilter('banquet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  activeFilter === 'banquet'
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🏛️ Banquets
              </button>
              <button
                onClick={() => setActiveFilter('room')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  activeFilter === 'room'
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🏨 Room Stays
              </button>
              <button
                onClick={() => setActiveFilter('corporate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  activeFilter === 'corporate'
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🏭 Corporate
              </button>
            </div>

            {/* Toggle Drawer / Split Mode */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              title={drawerOpen ? 'Hide Events Drawer' : 'Show Events Drawer'}
            >
              {drawerOpen ? <Columns3 className="size-4 text-amber-400" /> : <Grid className="size-4 text-amber-400" />}
              <span>{drawerOpen ? 'Side-by-Side' : 'Grid Only'}</span>
            </button>
          </div>
        </div>

        {/* MAIN BODY: CALENDAR GRID + EVENT DRAWER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CALENDAR COLUMN */}
          <div className={`${drawerOpen ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-xl">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-2 mb-2.5">
                {DAYS_OF_WEEK.map((d, i) => (
                  <div
                    key={d}
                    className={`text-center text-[11px] font-bold py-1.5 rounded-lg uppercase tracking-wider ${
                      i === 0 || i === 6
                        ? 'bg-slate-800/80 text-amber-400 border border-amber-400/20'
                        : 'bg-slate-800/40 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* 35-Day Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarGrid.map((dayObj, index) => (
                  <DayCell
                    key={`${dayObj.day}-${index}`}
                    day={dayObj}
                    isSelected={selectedDay === dayObj.day && dayObj.isCurrentMonth}
                    onSelect={handleSelectDay}
                    onHover={() => {}}
                  />
                ))}
              </div>

              {/* Calendar Legend */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-emerald-500 border border-emerald-400" />
                    <span className="text-slate-300">Today (22 Sep)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-amber-500 border border-amber-400" />
                    <span className="text-slate-300">Banquet / Hall</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-cyan-500 border border-cyan-400" />
                    <span className="text-slate-300">Room Stay</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-purple-500 border border-purple-400" />
                    <span className="text-slate-300">Corporate Acct</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Click on any day to inspect scheduled functions &amp; room folios
                </div>
              </div>
            </div>
          </div>

          {/* EVENT DRAWER COLUMN */}
          {drawerOpen && (
            <motion.div
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="lg:col-span-5 xl:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-xl flex flex-col gap-4"
            >
              {/* Drawer Top Subheader */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="size-4 text-amber-400" />
                    {selectedDay ? `Scheduled: ${selectedDay} Sep 2026` : 'All September Events'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {displayedEvents.length} event{displayedEvents.length === 1 ? '' : 's'} registered in system
                  </p>
                </div>

                {selectedDay && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    View All Month
                  </button>
                )}
              </div>

              {/* Event Cards Scrollable Container */}
              <div className="flex flex-col gap-3.5 max-h-[640px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {displayedEvents.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 px-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800"
                    >
                      <CalendarIcon className="size-10 text-slate-600 mx-auto mb-2" />
                      <h4 className="text-sm font-semibold text-slate-300">No events scheduled</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        No banquet functions or corporate blocks recorded for this date.
                      </p>
                      <button
                        onClick={() => setSelectedDay(null)}
                        className="mt-3 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold"
                      >
                        Browse All September Events
                      </button>
                    </motion.div>
                  ) : (
                    displayedEvents.map((evt) => (
                      <motion.div
                        key={evt.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-xl border transition-all ${
                          evt.day === '22'
                            ? 'bg-gradient-to-br from-slate-900 to-emerald-950/30 border-emerald-500/40 shadow-md'
                            : 'bg-slate-950/80 hover:bg-slate-950 border-slate-800 hover:border-amber-400/40'
                        }`}
                      >
                        {/* Event Card Header */}
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              evt.category === 'banquet'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : evt.category === 'corporate'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            {evt.category === 'banquet'
                              ? '🏛️ Conference / Banquet'
                              : evt.category === 'corporate'
                              ? '🏭 Corporate Account'
                              : '🏨 Room Stay'}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              evt.status === 'In-Progress'
                                ? 'bg-emerald-500 text-black animate-pulse font-black'
                                : evt.status === 'In-House'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : evt.status === 'Confirmed'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {evt.status}
                          </span>
                        </div>

                        {/* Event Title */}
                        <h4 className="text-sm font-bold text-white leading-tight mb-1.5">
                          {evt.title}
                        </h4>

                        {/* Meta: Venue & Time */}
                        <div className="grid grid-cols-1 gap-1 text-xs text-slate-300 mb-3">
                          <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                            <MapPin className="size-3.5 shrink-0 text-amber-400" />
                            <span>{evt.venue}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="size-3.5 shrink-0 text-slate-500" />
                            <span>{evt.time} ({evt.dateStr})</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Users className="size-3.5 shrink-0 text-slate-500" />
                            <span>{evt.pax} • {evt.setup || 'Standard'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Building className="size-3.5 shrink-0 text-slate-500" />
                            <span>{evt.organizer}</span>
                          </div>
                        </div>

                        {/* Billing Badge & Action Trigger */}
                        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-[11px] text-slate-400 font-mono">
                            <span className="text-slate-500">Billing: </span>
                            <span className="text-emerald-400 font-semibold">{evt.billing}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {evt.beoDetails && (
                              <button
                                onClick={() => setSelectedBeoEvent(evt)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Coffee className="size-3" />
                                <span>Inspect BEO</span>
                              </button>
                            )}

                            {onSelectBooking && (
                              <button
                                onClick={() => onSelectBooking(evt)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <span>Folio</span>
                                <ChevronRight className="size-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* BEO (BANQUET EVENT ORDER) / FUNCTION SHEET MODAL */}
        <AnimatePresence>
          {selectedBeoEvent && selectedBeoEvent.beoDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* BEO Modal Header */}
                <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 p-5 border-b border-amber-500/30 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                        HOTEL SAI INTERNATIONAL BEO
                      </span>
                      <span className="text-amber-300 font-mono text-xs">
                        BEO #{selectedBeoEvent.id}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white">
                      {selectedBeoEvent.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Banquet Event Order &amp; Function Sheet • Rayagada Operations
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBeoEvent(null)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* BEO Content Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-sm">
                  {/* Top Key Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Date &amp; Day</span>
                      <span className="font-bold text-white">{selectedBeoEvent.dateStr}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Venue</span>
                      <span className="font-bold text-amber-400">{selectedBeoEvent.venue}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Guaranteed Pax</span>
                      <span className="font-bold text-white">{selectedBeoEvent.pax}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Coordinator</span>
                      <span className="font-bold text-emerald-400">{selectedBeoEvent.beoDetails.coordinator}</span>
                    </div>
                  </div>

                  {/* Hall Setup Specifications */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                      <Building className="size-3.5" />
                      Hall &amp; Seating Setup
                    </h4>
                    <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-slate-300 text-xs">
                      {selectedBeoEvent.beoDetails.setupStyle}
                    </div>
                  </div>

                  {/* Audio Visual & Tech Equipment */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                      <Monitor className="size-3.5" />
                      Audio / Visual &amp; Conference Tech
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {selectedBeoEvent.beoDetails.avEquipments.map((av, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                        >
                          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                          <span>{av}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* F&B Service Schedule */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                      <Utensils className="size-3.5" />
                      F&amp;B Catering Schedule (Cannon Kitchen Banquets)
                    </h4>
                    <div className="space-y-2">
                      {selectedBeoEvent.beoDetails.fbSchedule.map((fb, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                        >
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold shrink-0">
                            {fb.time}
                          </span>
                          <span className="text-slate-200 font-medium">{fb.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial & Corporate Settlement */}
                  <div className="bg-gradient-to-r from-slate-950 via-slate-950 to-amber-950/20 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-mono">Settlement Account</span>
                      <span className="font-bold text-white text-xs">{selectedBeoEvent.beoDetails.billingAccount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-mono">Contract Value</span>
                      <span className="text-lg font-black text-amber-400">₹{selectedBeoEvent.amount?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* BEO Modal Footer */}
                <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Approved by Hotel General Manager &amp; Corporate Representative
                  </span>
                  <button
                    onClick={() => setSelectedBeoEvent(null)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-colors"
                  >
                    Close Function Sheet
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

InteractiveCalendar.displayName = 'InteractiveCalendar';

export default InteractiveCalendar;
