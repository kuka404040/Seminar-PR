-- Neon PostgreSQL Schema for Higher College «Qaynar» Seminar 2026
-- «Оқитын колледжден – зияткер ұлтқа: оқу мәдениеті мен жасанды интеллект үндестігі»

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    reg_number VARCHAR(64) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    attendance_status VARCHAR(64) NOT NULL DEFAULT 'Тіркелді',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast queries and searches
CREATE INDEX IF NOT EXISTS idx_participants_full_name ON participants (full_name);
CREATE INDEX IF NOT EXISTS idx_participants_organization ON participants (organization);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants (attendance_status);

-- Seminar Settings Table (Key-Value)
CREATE TABLE IF NOT EXISTS seminar_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Official Program Table
CREATE TABLE IF NOT EXISTS seminar_program (
    id SERIAL PRIMARY KEY,
    time_slot VARCHAR(64) NOT NULL,
    location VARCHAR(128) NOT NULL,
    title TEXT NOT NULL,
    speakers TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial default settings if empty
INSERT INTO seminar_settings (setting_key, setting_value)
VALUES 
    ('registration_enabled', 'true'),
    ('robot_speech_text', 'Құрметті семинарға қатысушылар, бүгінгі облыстық семинарымызға қош келдіңіздер! Кітап оқу мәдениеті мен жасанды интеллектті ұштастыру жолындағы жұмыстарыңызға сәттілік тілейміз! Семинарымыз сәтті өтсін!'),
    ('robot_enabled', 'true'),
    ('seminar_date', '20 қараша 2026 жыл'),
    ('seminar_time', '09:00 - 13:00'),
    ('seminar_place', '«Қайнар» жоғары колледжі ЖШС, Семей қ.')
ON CONFLICT (setting_key) DO NOTHING;
