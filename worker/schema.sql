-- Delivery Sem Taxa — D1 Schema V2.0
-- Duas tabelas: leads (contato) + diagnostics (respostas + score)

DROP TABLE IF EXISTS diagnostics;
DROP TABLE IF EXISTS leads;

CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  source TEXT DEFAULT 'landing',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  business_name TEXT,
  owner_name TEXT,
  phone TEXT,
  city TEXT,
  neighborhood TEXT,
  instagram TEXT,
  consent INTEGER DEFAULT 0,
  ip_hash TEXT,
  user_agent TEXT
);

CREATE TABLE diagnostics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  business_type TEXT,
  has_app TEXT,
  platforms TEXT,
  orders_per_day TEXT,
  avg_ticket TEXT,
  fee_percent TEXT,
  biggest_pain TEXT,
  delivery_mode TEXT,
  score INTEGER DEFAULT 0,
  est_fee_monthly REAL DEFAULT 0,
  recommended_plan TEXT,
  respostas_json TEXT,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_diagnostics_lead_id ON diagnostics(lead_id);
