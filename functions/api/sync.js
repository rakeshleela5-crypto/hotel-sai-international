// Cloudflare Pages Function: /api/sync
// Connected to Cloudflare D1 Database binding "DB"

const SECURITY_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: SECURITY_HEADERS
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Whitelisted config keys for save_config
const ALLOWED_CONFIG_KEYS = new Set([
  'hotel_name',
  'hotel_address',
  'phone',
  'landline',
  'email',
  'gstin',
  'ownerPin',
  'upi_id',
  'check_in_time',
  'check_out_time',
  'surge_multiplier',
  'maintenance_mode'
]);

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// Verification of Admin PIN or SECRET
async function verifyAdminAuth(request, env, db) {
  const adminKey = request.headers.get("X-Admin-Key");
  if (!adminKey) return false;

  // 1. Check against Environment Secret if defined
  if (env.ADMIN_SECRET && adminKey === env.ADMIN_SECRET) {
    return true;
  }

  // 2. Check strictly against D1 hotel_config ownerPin (NO hardcoded defaults)
  try {
    const pinRow = await db.prepare("SELECT value FROM hotel_config WHERE key = 'ownerPin'").first();
    if (pinRow && pinRow.value && adminKey === pinRow.value) {
      return true;
    }
  } catch (err) {
    console.error("Auth DB check failed:", err);
  }

  return false;
}

// GET: Synchronize all operational tables
export async function onRequestGet({ env }) {
  try {
    const db = env.DB;
    if (!db) {
      return jsonResponse({ error: "D1 database binding 'DB' not configured" }, 500);
    }

    // Parallel fetch of core operational tables
    const [
      roomsRes,
      bookingsRes,
      foodOrdersRes,
      staffRes,
      advancesRes,
      expensesRes,
      attendanceRes,
      linenRes,
      inspectionsRes,
      configRes,
      payrollRes,
      nightAuditsRes,
      consentRes,
      dataRightsRes,
      roomServicesRes,
      corporatesRes,
      menuRes,
      handoversRes
    ] = await Promise.all([
      db.prepare("SELECT * FROM rooms ORDER BY floor ASC, room_number ASC").all(),
      db.prepare("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100").all(),
      db.prepare("SELECT * FROM food_orders ORDER BY created_at DESC LIMIT 50").all(),
      db.prepare("SELECT * FROM staff ORDER BY id ASC").all(),
      db.prepare("SELECT * FROM salary_advances ORDER BY date DESC LIMIT 50").all(),
      db.prepare("SELECT * FROM expenses ORDER BY date DESC LIMIT 100").all(),
      db.prepare("SELECT * FROM attendance ORDER BY date DESC LIMIT 100").all(),
      db.prepare("SELECT * FROM linen_inventory ORDER BY id ASC").all(),
      db.prepare("SELECT * FROM checkout_inspections ORDER BY inspected_at DESC LIMIT 50").all(),
      db.prepare("SELECT * FROM hotel_config").all(),
      db.prepare("SELECT * FROM payroll_history ORDER BY paid_on DESC LIMIT 50").all(),
      db.prepare("SELECT * FROM night_audits ORDER BY audit_date DESC LIMIT 30").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM consent_records ORDER BY consented_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM data_rights_requests ORDER BY submitted_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM room_service_requests ORDER BY requested_at DESC LIMIT 50").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM corporate_partners ORDER BY corporate_id ASC").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM menu_items ORDER BY category ASC").all().catch(() => ({ results: [] })),
      db.prepare("SELECT * FROM cashier_shift_handovers ORDER BY created_at DESC LIMIT 30").all().catch(() => ({ results: [] }))
    ]);

    // Parse food order items JSON
    const foodOrders = (foodOrdersRes.results || []).map(o => {
      let items = [];
      try {
        items = JSON.parse(o.items_json || "[]");
      } catch {
        items = [];
      }
      return { ...o, items };
    });

    // Parse rooms amenities JSON
    const rooms = (roomsRes.results || []).map(r => {
      let amenities = [];
      try {
        amenities = JSON.parse(r.amenities || "[]");
      } catch {
        amenities = [];
      }
      return { ...r, amenities };
    });

    const configRows = configRes.results || [];
    const configObj = {};
    configRows.forEach(r => {
      // Never expose raw ownerPin over public sync GET
      if (r.key !== 'ownerPin') {
        configObj[r.key] = r.value;
      }
    });

    return jsonResponse({
      success: true,
      data: {
        rooms,
        bookings: bookingsRes.results || [],
        foodOrders,
        staff: staffRes.results || [],
        salaryAdvances: advancesRes.results || [],
        expenses: expensesRes.results || [],
        attendance: attendanceRes.results || [],
        linenInventory: linenRes.results || [],
        checkoutInspections: inspectionsRes.results || [],
        hotelConfig: configObj,
        payrollHistory: payrollRes.results || [],
        nightAudits: nightAuditsRes.results || [],
        consentRecords: consentRes.results || [],
        dataRightsRequests: dataRightsRes.results || [],
        roomServiceRequests: roomServicesRes.results || [],
        corporatePartners: corporatesRes.results || [],
        menuItems: menuRes.results || [],
        cashierHandovers: handoversRes.results || []
      }
    });
  } catch (error) {
    console.error("Sync GET Error:", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

// POST: Action Dispatcher
export async function onRequestPost({ request, env }) {
  try {
    const db = env.DB;
    if (!db) {
      return jsonResponse({ error: "D1 database binding 'DB' not configured" }, 500);
    }

    const body = await request.json();
    const { action, payload } = body;

    // 1. PUBLIC GUEST ACTION: Save Booking
    if (action === 'save_booking') {
      const b = payload;
      if (!b.roomNumber || !b.checkInDate || !b.checkOutDate || !b.guestName || !b.guestPhone) {
        return jsonResponse({ error: "Missing required booking fields" }, 400);
      }

      // Mutex collision check: verify room is not booked on conflicting dates
      const collision = await db.prepare(`
        SELECT booking_id FROM bookings 
        WHERE room_number = ? 
          AND booking_status NOT IN ('Cancelled', 'Checked Out')
          AND NOT (check_out_date <= ? OR check_in_date >= ?)
      `).bind(b.roomNumber, b.checkInDate, b.checkOutDate).first();

      if (collision) {
        return jsonResponse({
          error: `Room ${b.roomNumber} is already booked for the selected dates. Please select another room.`,
          collisionId: collision.booking_id
        }, 409);
      }

      // PAYMENT STATUS FORGERY PROTECTION
      // Public submissions can NEVER self-verify as 'Paid'
      const isAdmin = await verifyAdminAuth(request, env, db);
      let calculatedPaymentStatus = 'Pending Gateway Verification';
      if (isAdmin && b.paymentStatus) {
        calculatedPaymentStatus = b.paymentStatus;
      } else if (b.paymentMode === 'Pay at Hotel') {
        calculatedPaymentStatus = 'Pending Payment at Check-In';
      }

      const bookingId = b.bookingId || `HSI-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const maskedId = b.idProofMasked || `XXXX-XXXX-${String(b.guestPhone).slice(-4)}`;

      // Interstate classification for Sarai Act
      const isInterstate = (b.stateOfOrigin && b.stateOfOrigin.toLowerCase() !== 'odisha') ? 1 : 0;

      await db.prepare(`
        INSERT INTO bookings (
          booking_id, room_number, guest_name, guest_phone, guest_email,
          id_proof_type, id_proof_masked, state_of_origin, is_interstate,
          check_in_date, check_out_date, nights, adults, children,
          tariff_per_night, base_total, cgst, sgst, total_amount,
          advance_deposit, balance_due, payment_mode, payment_status,
          booking_status, is_b2b, corporate_id, corporate_gstin,
          consent_dpdp, special_requests, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, datetime('now'), datetime('now')
        )
      `).bind(
        bookingId, b.roomNumber, b.guestName, b.guestPhone, b.guestEmail || '',
        b.idProofType || 'Aadhaar', maskedId, b.stateOfOrigin || 'Odisha', isInterstate,
        b.checkInDate, b.checkOutDate, b.nights || 1, b.adults || 1, b.children || 0,
        b.tariffPerNight || 1699, b.baseTotal || 1699, b.cgst || 42.48, b.sgst || 42.48, b.totalAmount || 1783.96,
        b.advanceDeposit || 0, b.balanceDue || (b.totalAmount || 1783.96), b.paymentMode || 'UPI',
        calculatedPaymentStatus, b.bookingStatus || 'Confirmed',
        b.isB2b ? 1 : 0, b.corporateId || '', b.corporateGstin || '',
        b.consentDpdp ? 1 : 1, b.specialRequests || ''
      ).run();

      // Also record DPDP consent
      await db.prepare(`
        INSERT INTO consent_records (
          consent_id, guest_name, phone_or_email, purpose,
          ip_address, consent_granted, consented_at, purge_scheduled_at
        ) VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now', '+30 days'))
      `).bind(
        `CONS-${Date.now()}`, b.guestName, b.guestPhone,
        'Accommodation Registration & Sarai Act Compliance',
        request.headers.get("cf-connecting-ip") || '127.0.0.1'
      ).run().catch(e => console.error("DPDP consent record error:", e));

      return jsonResponse({ success: true, bookingId, paymentStatus: calculatedPaymentStatus });
    }

    // 2. PUBLIC GUEST ACTION: Create Room Hold (Rate-limited, Max 2 per IP, 10 min TTL)
    if (action === 'create_room_hold') {
      const { roomNumber, sessionToken } = payload;
      const clientIp = request.headers.get("cf-connecting-ip") || '127.0.0.1';

      // Purge expired holds first
      await db.prepare("DELETE FROM room_holds WHERE expires_at <= datetime('now')").run();

      // Check existing active holds for this IP
      const activeCount = await db.prepare(
        "SELECT COUNT(*) as cnt FROM room_holds WHERE client_ip = ? AND expires_at > datetime('now')"
      ).bind(clientIp).first();

      if (activeCount && activeCount.cnt >= 2) {
        return jsonResponse({
          error: "Maximum room hold limit reached (2 concurrent holds per visitor). Please complete or wait for previous hold to expire."
        }, 429);
      }

      const holdId = `HOLD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await db.prepare(`
        INSERT INTO room_holds (hold_id, room_number, client_ip, session_token, expires_at, created_at)
        VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'), datetime('now'))
      `).bind(holdId, roomNumber, clientIp, sessionToken || holdId).run();

      return jsonResponse({ success: true, holdId, expiresInMinutes: 10 });
    }

    // 3. PUBLIC GUEST ACTION: Place Food Order
    if (action === 'place_food_order') {
      const order = payload;
      const orderId = `FOOD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await db.prepare(`
        INSERT INTO food_orders (
          order_id, room_number, guest_name, items_json,
          subtotal, gst, total_amount, is_jain_satvik, status, payment_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Received', 'Pending', datetime('now'))
      `).bind(
        orderId, order.roomNumber, order.guestName || `Room ${order.roomNumber}`,
        JSON.stringify(order.items || []), order.subtotal || 0, order.gst || 0,
        order.totalAmount || 0, order.isJain ? 1 : 0
      ).run();

      return jsonResponse({ success: true, orderId });
    }

    // 4. PUBLIC GUEST ACTION: Room Service Request
    if (action === 'place_room_service') {
      const req = payload;
      const requestId = `SRV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await db.prepare(`
        INSERT INTO room_service_requests (
          request_id, room_number, service_type, description, priority, status, requested_at
        ) VALUES (?, ?, ?, ?, ?, 'Pending', datetime('now'))
      `).bind(
        requestId, req.roomNumber, req.serviceType, req.description || '', req.priority || 'Normal'
      ).run();

      return jsonResponse({ success: true, requestId });
    }

    // 5. PUBLIC GUEST ACTION: DPDP Data Rights Request Intake
    if (action === 'submit_data_rights') {
      const req = payload;
      const reqId = `DPDP-${Date.now()}`;
      await db.prepare(`
        INSERT INTO data_rights_requests (
          request_id, guest_name, contact, request_type, details, status, submitted_at
        ) VALUES (?, ?, ?, ?, ?, 'Received', datetime('now'))
      `).bind(
        reqId, req.guestName, req.contact, req.requestType || 'Access', req.details || ''
      ).run();

      return jsonResponse({ success: true, requestId: reqId });
    }

    // --- PROTECTED ADMINISTRATIVE ACTIONS ---
    // Strict authentication required for all back-office mutations
    const isAuthorized = await verifyAdminAuth(request, env, db);
    if (!isAuthorized) {
      return jsonResponse({ error: "Unauthorized. Valid administrative session required." }, 401);
    }

    // 6. ADMIN: Save Hotel Config (Strict Whitelist + Validation)
    if (action === 'save_config') {
      const { key, value } = payload;
      if (!ALLOWED_CONFIG_KEYS.has(key)) {
        return jsonResponse({ error: `Config key '${key}' is not editable.` }, 400);
      }

      // Validation for UPI and PIN
      if (key === 'upi_id' && !/^[\w.-]+@[\w.-]+$/.test(value)) {
        return jsonResponse({ error: "Invalid UPI format. Must be like 'name@bank'." }, 400);
      }
      if (key === 'ownerPin' && !/^\d{4,6}$/.test(value)) {
        return jsonResponse({ error: "Owner PIN must be a 4 to 6-digit numeric code." }, 400);
      }

      await db.prepare(`
        INSERT INTO hotel_config (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
      `).bind(key, value).run();

      return jsonResponse({ success: true, key, updated: true });
    }

    // 7. ADMIN: Update Room Status
    if (action === 'update_room_status') {
      const { roomNumber, status, guestName, bookingId } = payload;
      await db.prepare(`
        UPDATE rooms 
        SET status = ?, current_guest_name = ?, current_booking_id = ?,
            last_cleaned_at = CASE WHEN ? = 'Available' THEN datetime('now') ELSE last_cleaned_at END
        WHERE room_number = ?
      `).bind(status, guestName || null, bookingId || null, status, roomNumber).run();

      return jsonResponse({ success: true, roomNumber, status });
    }

    // 8. ADMIN: Record Cashier Shift Handover
    if (action === 'record_shift_handover') {
      const h = payload;
      const handoverId = `SFT-${Date.now()}`;
      const variance = (h.closingCashActual || 0) - (h.closingCashExpected || 0);
      const status = Math.abs(variance) < 1 ? 'Balanced' : 'Discrepancy';

      await db.prepare(`
        INSERT INTO cashier_shift_handovers (
          handover_id, shift_date, shift_type, outgoing_cashier, incoming_cashier,
          opening_float, cash_sales, petty_cash_paid, closing_cash_actual, closing_cash_expected,
          variance, status, notes, created_at
        ) VALUES (?, date('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        handoverId, h.shiftType || 'Evening', h.outgoingCashier, h.incomingCashier,
        h.openingFloat || 5000, h.cashSales || 0, h.pettyCashPaid || 0,
        h.closingCashActual || 0, h.closingCashExpected || 0,
        variance, status, h.notes || ''
      ).run();

      return jsonResponse({ success: true, handoverId, status, variance });
    }

    // 9. ADMIN: Perform Night Audit Run
    if (action === 'run_night_audit') {
      const audit = payload;
      const auditId = `AUD-${Date.now()}`;
      await db.prepare(`
        INSERT INTO night_audits (
          audit_id, audit_date, total_rooms, occupied_rooms, occupancy_rate,
          room_revenue, pos_fnb_revenue, other_revenue, total_revenue,
          cash_collected, upi_collected, card_collected, corporate_billed,
          discrepancy_amount, auditor_name, notes, created_at
        ) VALUES (?, date('now'), 40, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(audit_date) DO UPDATE SET
          occupied_rooms = excluded.occupied_rooms,
          occupancy_rate = excluded.occupancy_rate,
          total_revenue = excluded.total_revenue,
          created_at = datetime('now')
      `).bind(
        auditId, audit.occupiedRooms || 0, audit.occupancyRate || 0,
        audit.roomRevenue || 0, audit.posFnbRevenue || 0, audit.otherRevenue || 0, audit.totalRevenue || 0,
        audit.cashCollected || 0, audit.upiCollected || 0, audit.cardCollected || 0, audit.corporateBilled || 0,
        audit.discrepancyAmount || 0, audit.auditorName || 'Duty Manager', audit.notes || ''
      ).run();

      return jsonResponse({ success: true, auditId });
    }

    // 10. ADMIN: Log Police Register Dispatch
    if (action === 'dispatch_police_register') {
      const p = payload;
      const dispatchId = `SARAI-${Date.now()}`;
      await db.prepare(`
        INSERT INTO police_register_dispatches (
          dispatch_id, dispatch_date, police_station, total_entries,
          interstate_entries, foreign_entries, dispatched_by, channel,
          dispatch_status, payload_preview, created_at
        ) VALUES (?, date('now'), 'Rayagada Town PS', ?, ?, 0, ?, 'WhatsApp & Email', 'Dispatched', ?, datetime('now'))
      `).bind(
        dispatchId, p.totalEntries || 0, p.interstateEntries || 0,
        p.dispatchedBy || 'Front Desk', escapeHtml(p.preview || '')
      ).run();

      return jsonResponse({ success: true, dispatchId });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);

  } catch (error) {
    console.error("Sync POST Error:", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
