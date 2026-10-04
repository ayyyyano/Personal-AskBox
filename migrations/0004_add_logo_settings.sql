ALTER TABLE site_settings ADD COLUMN logo_key TEXT;
ALTER TABLE site_settings ADD COLUMN logo_type TEXT;
ALTER TABLE site_settings ADD COLUMN brand_mode TEXT NOT NULL DEFAULT 'logo' CHECK (brand_mode IN ('logo', 'avatar'));
