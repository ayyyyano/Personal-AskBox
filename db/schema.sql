CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  nickname TEXT,
  content TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  ip_hash TEXT,
  user_agent TEXT,
  attachment_key TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at TEXT,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_questions_status_created
ON questions (status, created_at DESC);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT '个人提问箱',
  ask_title TEXT NOT NULL DEFAULT '有什么想问的吗？',
  display_title TEXT NOT NULL DEFAULT '来看看回答吧。',
  admin_login_title TEXT NOT NULL DEFAULT '别来无恙啊！',
  primary_color TEXT NOT NULL DEFAULT '#DDAACC',
  favicon_key TEXT,
  favicon_type TEXT,
  background_key TEXT,
  background_type TEXT,
  copyright_name TEXT NOT NULL DEFAULT 'Nekro',
  revision INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (id) VALUES (1);
