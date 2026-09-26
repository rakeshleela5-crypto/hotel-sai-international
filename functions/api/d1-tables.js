// Cloudflare Pages Function: /api/d1-tables
// Live Cloudflare D1 Database Explorer & Tabular Schema Inspector
// Connected to Cloudflare D1 Database binding "DB"

const ALLOWED_ORIGINS = [
  "https://hotel-sai-international.pages.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

function getSecurityHeaders(originHeader = null) {
  const isAllowed = originHeader && (ALLOWED_ORIGINS.includes(originHeader) || originHeader.endsWith(".hotel-sai-international.pages.dev"));
  const allowOrigin = isAllowed ? originHeader : "https://hotel-sai-international.pages.dev";

  return {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Vary": "Origin"
  };
}

function jsonResponse(data, status = 200, request = null) {
  const origin = request?.headers?.get("Origin") || null;
  return new Response(JSON.stringify(data), {
    status,
    headers: getSecurityHeaders(origin)
  });
}

export async function onRequestOptions({ request }) {
  const origin = request?.headers?.get("Origin") || null;
  return new Response(null, {
    status: 204,
    headers: {
      ...getSecurityHeaders(origin),
      "Access-Control-Max-Age": "86400"
    }
  });
}

// Master list of known schema tables for categorization and fallback
const KNOWN_TABLE_CATEGORIES = {
  rooms: { category: "Front Desk & Rooms", label: "Rooms Master Inventory", icon: "🏨" },
  bookings: { category: "Front Desk & Rooms", label: "Guest Bookings & Stays", icon: "📋" },
  digital_keycards: { category: "Front Desk & Rooms", label: "Digital Keycards & Access", icon: "🔑" },
  room_holds: { category: "Front Desk & Rooms", label: "Temporary Room Holds", icon: "⏳" },
  folio_transactions: { category: "Billing & Accounts", label: "Folio Transactions & Charges", icon: "📄" },
  split_payments: { category: "Billing & Accounts", label: "Split Tender Receipts", icon: "💳" },
  cashier_shift_handovers: { category: "Billing & Accounts", label: "Cashier Shift Handovers", icon: "💼" },
  night_audits: { category: "Billing & Accounts", label: "Night Audit Records", icon: "🌙" },
  night_audit_log: { category: "Billing & Accounts", label: "Night Audit Event Log", icon: "📜" },
  expenses: { category: "Billing & Accounts", label: "Petty Cash & Expenses", icon: "💸" },
  corporate_ledger: { category: "Billing & Accounts", label: "Corporate Credit Ledger", icon: "🏢" },
  corporate_partners: { category: "Billing & Accounts", label: "B2B Corporate Partners", icon: "🤝" },
  corporate_b2b_invoices: { category: "Billing & Accounts", label: "Corporate Tax Invoices", icon: "🧾" },
  food_orders: { category: "F&B & Restaurant", label: "KOT Food & Beverage Orders", icon: "🍽️" },
  restaurant_tables: { category: "F&B & Restaurant", label: "Dining Tables Layout", icon: "🪑" },
  menu_items: { category: "F&B & Restaurant", label: "Restaurant Menu Catalog", icon: "📖" },
  daily_item_sales: { category: "F&B & Restaurant", label: "Daily F&B Item Sales", icon: "📊" },
  restaurant_kot_voids: { category: "F&B & Restaurant", label: "KOT Voids & Cancellations", icon: "🚫" },
  linen_inventory: { category: "Housekeeping & Ops", label: "Linen & Towel Par Stock", icon: "🧺" },
  checkout_inspections: { category: "Housekeeping & Ops", label: "Room Turnover Inspections", icon: "🔍" },
  maintenance_work_orders: { category: "Housekeeping & Ops", label: "Maintenance Defect Orders", icon: "🔧" },
  police_guest_entries: { category: "Statutory & Compliance", label: "Sarai Act Police Register", icon: "👮" },
  police_register_dispatches: { category: "Statutory & Compliance", label: "Police Daily Email Dispatches", icon: "📨" },
  dpdp_access_logs: { category: "Statutory & Compliance", label: "DPDP 2023 Data Access Logs", icon: "🛡️" },
  consent_records: { category: "Statutory & Compliance", label: "Guest Data Consent Records", icon: "📝" },
  staff: { category: "HR & Staff", label: "Staff Roster & Biometrics", icon: "👥" },
  attendance: { category: "HR & Staff", label: "Daily Staff Attendance", icon: "⏱️" },
  salary_advances: { category: "HR & Staff", label: "Salary Advances & Loans", icon: "💵" },
  payroll_history: { category: "HR & Staff", label: "Monthly Payroll Records", icon: "📑" },
  hotel_config: { category: "Configuration", label: "Hotel Settings & Parameters", icon: "⚙️" }
};

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const tableName = url.searchParams.get("table");
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "100", 10), 1), 500);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);
    const searchQuery = (url.searchParams.get("search") || "").trim();

    const db = env.DB;
    if (!db) {
      return jsonResponse({
        success: false,
        error: "Cloudflare D1 database binding 'DB' not configured on Worker environment."
      }, 500, request);
    }

    // 1. If no specific table requested, return table directory with counts and schema summaries
    if (!tableName) {
      const tablesMasterRes = await db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name ASC"
      ).all();

      const tableNames = (tablesMasterRes.results || []).map(r => r.name);
      const directory = [];

      for (const tName of tableNames) {
        try {
          const [countRes, columnsRes] = await Promise.all([
            db.prepare(`SELECT COUNT(*) as cnt FROM "${tName}"`).first(),
            db.prepare(`PRAGMA table_info("${tName}")`).all()
          ]);

          const meta = KNOWN_TABLE_CATEGORIES[tName] || {
            category: "General System Tables",
            label: tName.replace(/_/g, " ").toUpperCase(),
            icon: "🗃️"
          };

          directory.push({
            name: tName,
            label: meta.label,
            category: meta.category,
            icon: meta.icon,
            rowCount: countRes ? countRes.cnt : 0,
            columnCount: columnsRes.results ? columnsRes.results.length : 0,
            columns: (columnsRes.results || []).map(c => ({
              cid: c.cid,
              name: c.name,
              type: c.type || 'TEXT',
              notnull: Boolean(c.notnull),
              dflt_value: c.dflt_value,
              pk: Boolean(c.pk)
            }))
          });
        } catch (err) {
          console.warn(`Could not inspect table ${tName}:`, err);
        }
      }

      return jsonResponse({
        success: true,
        database: "hotel-sai-international-db",
        environment: "Cloudflare D1 Production",
        syncedAt: new Date().toISOString(),
        totalTables: directory.length,
        tables: directory
      }, 200, request);
    }

    // 2. Specific Table Query with Validation
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return jsonResponse({ success: false, error: "Invalid table name format" }, 400, request);
    }

    // Verify table exists
    const tableExists = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name = ?"
    ).bind(tableName).first();

    if (!tableExists) {
      return jsonResponse({ success: false, error: `Table '${tableName}' not found in D1 database` }, 404, request);
    }

    // Fetch column definitions
    const columnsRes = await db.prepare(`PRAGMA table_info("${tableName}")`).all();
    const columns = (columnsRes.results || []).map(c => ({
      name: c.name,
      type: c.type || 'TEXT',
      notnull: Boolean(c.notnull),
      pk: Boolean(c.pk)
    }));

    // Build Query
    let totalRows = 0;
    let rows = [];

    if (searchQuery && columns.length > 0) {
      // Safe multi-column search across text columns
      const textColumns = columns.filter(c => 
        !c.type.toUpperCase().includes('BLOB')
      ).map(c => `"${c.name}" LIKE ?`).join(" OR ");

      const countSql = `SELECT COUNT(*) as cnt FROM "${tableName}" WHERE ${textColumns}`;
      const searchPattern = `%${searchQuery}%`;
      const searchBindings = columns.filter(c => !c.type.toUpperCase().includes('BLOB')).map(() => searchPattern);

      const countRes = await db.prepare(countSql).bind(...searchBindings).first();
      totalRows = countRes ? countRes.cnt : 0;

      const dataSql = `SELECT * FROM "${tableName}" WHERE ${textColumns} LIMIT ? OFFSET ?`;
      const dataRes = await db.prepare(dataSql).bind(...searchBindings, limit, offset).all();
      rows = dataRes.results || [];
    } else {
      const countRes = await db.prepare(`SELECT COUNT(*) as cnt FROM "${tableName}"`).first();
      totalRows = countRes ? countRes.cnt : 0;

      const dataRes = await db.prepare(`SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`).bind(limit, offset).all();
      rows = dataRes.results || [];
    }

    return jsonResponse({
      success: true,
      database: "hotel-sai-international-db",
      tableName,
      meta: KNOWN_TABLE_CATEGORIES[tableName] || {
        category: "General System Tables",
        label: tableName.replace(/_/g, " ").toUpperCase(),
        icon: "🗃️"
      },
      columns,
      totalRows,
      limit,
      offset,
      rowsCount: rows.length,
      syncedAt: new Date().toISOString(),
      rows
    }, 200, request);

  } catch (error) {
    console.error("D1 Tables Explorer API Error:", error);
    return jsonResponse({
      success: false,
      error: error.message || "Failed to inspect Cloudflare D1 tables"
    }, 500, request);
  }
}
