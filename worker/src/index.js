/* ============================================
   Cloudflare Worker — Diag Leads API V2.0
   Binding: env.diag_leads (D1)
   ============================================ */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        if (method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        try {
            // ---- POST /leads ----
            if (method === 'POST' && path === '/leads') {
                return await handleCreateLead(request, env, corsHeaders);
            }

            // ---- Admin routes ----
            if (path.startsWith('/admin')) {
                const authError = checkAuth(request, env);
                if (authError) return authError;

                if (method === 'GET' && path === '/admin/leads') {
                    return await handleListLeads(url, env, corsHeaders);
                }

                if (method === 'GET' && path === '/admin/export.csv') {
                    return await handleExportCSV(env, corsHeaders);
                }

                const match = path.match(/^\/admin\/leads\/(\d+)$/);
                if (method === 'GET' && match) {
                    return await handleGetLead(match[1], env, corsHeaders);
                }
            }

            return json({ error: 'Not found' }, 404, corsHeaders);
        } catch (err) {
            console.error('Worker error:', err);
            return json({ error: 'Internal server error', detail: err.message }, 500, corsHeaders);
        }
    },
};

// ---------- Auth ----------
function checkAuth(request, env) {
    const auth = request.headers.get('Authorization');
    const token = env.ADMIN_TOKEN || 'admin-token-secret';

    if (!auth || auth !== `Bearer ${token}`) {
        return json({ error: 'Unauthorized' }, 401, {
            'Access-Control-Allow-Origin': '*',
        });
    }
    return null;
}

// ---------- POST /leads ----------
async function handleCreateLead(request, env, corsHeaders) {
    const body = await request.json();
    const db = env.diag_leads;

    const {
        owner_name, phone, city, neighborhood, business_name, instagram,
        consent, source, utm_source, utm_medium, utm_campaign,
        // Diagnostic data
        business_type, has_app, platforms, orders_per_day, avg_ticket,
        fee_percent, biggest_pain, delivery_mode,
        score, est_fee_monthly, recommended_plan, respostas,
    } = body;

    // Get IP hash and user agent
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const ua = request.headers.get('User-Agent') || '';
    const ipHash = await hashIP(ip);

    // 1) Insert lead
    const leadResult = await db.prepare(`
    INSERT INTO leads (
      source, utm_source, utm_medium, utm_campaign,
      business_name, owner_name, phone, city, neighborhood,
      instagram, consent, ip_hash, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
        source || 'landing', utm_source || '', utm_medium || '', utm_campaign || '',
        business_name || '', owner_name || '', phone || '',
        city || '', neighborhood || '', instagram || '',
        consent ? 1 : 0, ipHash, ua
    ).run();

    const leadId = leadResult.meta?.last_row_id;

    // 2) Insert diagnostic
    await db.prepare(`
    INSERT INTO diagnostics (
      lead_id, business_type, has_app, platforms,
      orders_per_day, avg_ticket, fee_percent,
      biggest_pain, delivery_mode,
      score, est_fee_monthly, recommended_plan, respostas_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
        leadId,
        business_type || '', has_app || '', platforms || '',
        orders_per_day || '', avg_ticket || '', fee_percent || '',
        biggest_pain || '', delivery_mode || '',
        score || 0, est_fee_monthly || 0, recommended_plan || '',
        JSON.stringify(respostas || {})
    ).run();

    return json({
        success: true,
        lead_id: leadId,
        score,
        est_fee_monthly,
        recommended_plan,
    }, 201, corsHeaders);
}

// ---------- GET /admin/leads ----------
async function handleListLeads(url, env, corsHeaders) {
    const db = env.diag_leads;

    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '50')));
    const query = url.searchParams.get('query') || '';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';

    let where = [];
    let params = [];

    if (query) {
        where.push(`(l.owner_name LIKE ? OR l.phone LIKE ? OR l.city LIKE ? OR l.business_name LIKE ?)`);
        const q = `%${query}%`;
        params.push(q, q, q, q);
    }

    if (from) {
        where.push(`l.created_at >= ?`);
        params.push(from);
    }

    if (to) {
        where.push(`l.created_at <= ?`);
        params.push(to + ' 23:59:59');
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    // Count
    const countResult = await db.prepare(
        `SELECT COUNT(*) as total FROM leads l ${whereClause}`
    ).bind(...params).first();

    // List with diagnostic join
    const { results } = await db.prepare(`
    SELECT l.*, d.business_type, d.has_app, d.orders_per_day, d.avg_ticket,
           d.fee_percent, d.biggest_pain, d.delivery_mode,
           d.score, d.est_fee_monthly, d.recommended_plan
    FROM leads l
    LEFT JOIN diagnostics d ON d.lead_id = l.id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, pageSize, offset).all();

    return json({
        leads: results,
        total: countResult?.total || 0,
        page,
        pageSize,
        totalPages: Math.ceil((countResult?.total || 0) / pageSize),
    }, 200, corsHeaders);
}

// ---------- GET /admin/leads/:id ----------
async function handleGetLead(id, env, corsHeaders) {
    const db = env.diag_leads;

    const lead = await db.prepare(
        `SELECT l.*, d.business_type, d.has_app, d.platforms,
            d.orders_per_day, d.avg_ticket, d.fee_percent,
            d.biggest_pain, d.delivery_mode,
            d.score, d.est_fee_monthly, d.recommended_plan, d.respostas_json
     FROM leads l
     LEFT JOIN diagnostics d ON d.lead_id = l.id
     WHERE l.id = ?`
    ).bind(Number(id)).first();

    if (!lead) {
        return json({ error: 'Lead not found' }, 404, corsHeaders);
    }

    return json({ lead }, 200, corsHeaders);
}

// ---------- GET /admin/export.csv ----------
async function handleExportCSV(env, corsHeaders) {
    const db = env.diag_leads;

    const { results } = await db.prepare(`
    SELECT l.id, l.created_at, l.owner_name, l.phone, l.city, l.neighborhood,
           l.business_name, l.instagram, l.source,
           d.business_type, d.has_app, d.orders_per_day, d.avg_ticket,
           d.fee_percent, d.biggest_pain, d.delivery_mode,
           d.score, d.est_fee_monthly, d.recommended_plan
    FROM leads l
    LEFT JOIN diagnostics d ON d.lead_id = l.id
    ORDER BY l.created_at DESC
  `).all();

    const headers = [
        'id', 'created_at', 'owner_name', 'phone', 'city', 'neighborhood',
        'business_name', 'instagram', 'source',
        'business_type', 'has_app', 'orders_per_day', 'avg_ticket',
        'fee_percent', 'biggest_pain', 'delivery_mode',
        'score', 'est_fee_monthly', 'recommended_plan'
    ];

    const csvRows = [headers.join(',')];

    for (const row of results) {
        const values = headers.map((h) => {
            const val = row[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }

    return new Response(csvRows.join('\n'), {
        status: 200,
        headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="leads.csv"',
        },
    });
}

// ---------- Helpers ----------
function json(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...extraHeaders,
        },
    });
}

async function hashIP(ip) {
    if (!ip) return '';
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + '-diag-salt');
    const hash = await crypto.subtle.digest('SHA-256', data);
    const arr = Array.from(new Uint8Array(hash));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}
