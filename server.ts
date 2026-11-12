import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import ExcelJS from 'exceljs';
import { Pool } from '@neondatabase/serverless';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Static files in /public
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// In-memory / file-synced data backup
const DATA_DIR = path.join(__dirname, 'data');
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch {}
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PROGRAM_FILE = path.join(DATA_DIR, 'program.json');

// Default initial official program from PDF
const defaultProgram = [
  {
    id: 1,
    time_slot: '09.30-10.00',
    location: 'Фойе',
    title: 'Қатысушыларды тіркеу',
    speakers: 'Колледж оқытушылары',
    sort_order: 1
  },
  {
    id: 2,
    time_slot: '10.00-10.10',
    location: 'Мәжіліс залы',
    title: 'Алғы сөз',
    speakers: '1. Исабаева Айнұр Сергалиевна, «Облыстық инновациялық-әдістемелік орталығы» КММ директоры\n2. Нурашева Эльмира Нурашқызы, техникалық және кәсіптік білім беру ұйымдарын әдістемелік сүйемелдеу бөлімінің әдіскері',
    sort_order: 2
  },
  {
    id: 3,
    time_slot: '10.10-10.25',
    location: 'Мәжіліс залы',
    title: 'Smart Library: колледж кітапханасын цифрландыру жүйесі',
    speakers: 'Шаймарданов Қуаныш Нұрланұлы, «Қайнар» жоғары колледжі ЖШС арнайы пәндер оқытушысы',
    sort_order: 3
  },
  {
    id: 4,
    time_slot: '10.25-10.40',
    location: 'Мәжіліс залы',
    title: '«Оқитын ұлт қалыптастырудағы колледж кітапханасының рөлі: оқу мәдениеті мен жасанды интеллект мүмкіндіктері»',
    speakers: 'Жексенаева Нургуль Марденовна, «Абай колледжі» КММ кітапханашысы',
    sort_order: 4
  },
  {
    id: 5,
    time_slot: '10.40-10.55',
    location: 'Мәжіліс залы',
    title: 'Кітапхана 360°: оқырман, технология, тәжірибе',
    speakers: 'Самыкова Кымбат Ахатаевна, «М.О.Әуезов атындағы педагогикалық колледжі» кітапханашысы',
    sort_order: 5
  },
  {
    id: 6,
    time_slot: '10.55-11.10',
    location: 'Мәжіліс залы',
    title: 'Культура чтений и искусственный интеллект',
    speakers: 'Чемесова Фатима Наиловна, «Геодезия, картография және құрылыс жоғары колледжі» КМҚК кітапханашысы',
    sort_order: 6
  },
  {
    id: 7,
    time_slot: '11.10-11.25',
    location: 'Мәжіліс залы',
    title: 'Жасанды интеллект – оқырманның жаңа көмекшісі',
    speakers: 'Адильбекова Молдир Бектемисовна, «Қайнар жоғары колледжі» ЖШС кітапхана меңгерушісі',
    sort_order: 7
  },
  {
    id: 8,
    time_slot: '11.25-11.55',
    location: 'Мәжіліс залы',
    title: '«Кітап оқитын ұлт» жобасының мақсат-міндеттері, жүзеге асыру жолдары',
    speakers: 'Аукишева Мейрамгуль Маулитовна, Астана қаласы әкімдігінің «Әдістемелік орталығының» техникалық және кәсіптік білім беру бөлімінің әдіскері, Астана қаласы бойынша «Кітап оқитын ұлт» жобасының үйлестірушісі',
    sort_order: 8
  },
  {
    id: 9,
    time_slot: '11.55-12.10',
    location: 'Мәжіліс залы',
    title: 'Презентация учебного пособия «Дактилоскопия»',
    speakers: 'Балко Владимир Иванович, ардагер-ұстаз',
    sort_order: 9
  },
  {
    id: 10,
    time_slot: '12.10-12.25',
    location: 'Мәжіліс залы',
    title: 'Рефлексия',
    speakers: 'Зарпканова Меруерт Абаевна, «Қайнар жоғары колледжі» директордың орынбасары;\nСмаилова Айман Жұмашевна, колледж директорының тәрбие ісі жөніндегі орынбасары',
    sort_order: 10
  },
  {
    id: 11,
    time_slot: '12.25-12.40',
    location: 'Мәжіліс залы',
    title: 'Қорытынды сөз',
    speakers: 'Бижуменова Ғайни Кабдрашовна, облыстық колледж кітапханашылары әдістемелік бірлестігінің жетекшісі',
    sort_order: 11
  }
];

const defaultSettings = {
  registration_enabled: true,
  robot_speech_text: 'Құрметті семинарға қатысушылар, бүгінгі облыстық семинарымызға қош келдіңіздер! Кітап оқу мәдениеті мен жасанды интеллектті ұштастыру жолындағы жұмыстарыңызға сәттілік тілейміз! Семинарымыз сәтті өтсін!',
  robot_enabled: true,
  seminar_date: '20 қараша 2026 жыл',
  seminar_time: '09:00 – 13:00',
  seminar_place: '«Қайнар» жоғары колледжі ЖШС, Семей қ.',
  pdf_url: '/assets/aistudio/__________58c2dc9d.pdf',
  audio_url: '/assets/robot_speech.mp3'
};

// Helper load / save for local persistence
function loadLocalData<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error loading ${file}:`, err);
  }
  return fallback;
}

function saveLocalData<T>(file: string, data: T) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving ${file}:`, err);
  }
}

// Memory stores
let localParticipants: any[] = loadLocalData(PARTICIPANTS_FILE, []);
let localSettings = loadLocalData(SETTINGS_FILE, defaultSettings);
let localProgram = loadLocalData(PROGRAM_FILE, defaultProgram);

// Neon PostgreSQL Pool
let neonPool: Pool | null = null;
let isNeonConnected = false;

async function initNeonDb() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('username:password@ep-sample-pooler.neon.tech')) {
    console.log('[Database] Neon DATABASE_URL not configured. Running with persistent file-backed store.');
    return;
  }

  try {
    neonPool = new Pool({ connectionString: dbUrl });
    // Test query
    const res = await neonPool.query('SELECT NOW()');
    console.log('[Database] Neon PostgreSQL connected successfully at:', res.rows[0].now);
    isNeonConnected = true;

    // Create tables
    await neonPool.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        reg_number VARCHAR(64) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        attendance_status VARCHAR(64) NOT NULL DEFAULT 'Тіркелді',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_participants_full_name ON participants (full_name);
      CREATE INDEX IF NOT EXISTS idx_participants_org ON participants (organization);
      CREATE INDEX IF NOT EXISTS idx_participants_created ON participants (created_at DESC);
    `);
  } catch (err: any) {
    console.error('[Database] Failed to connect to Neon PostgreSQL:', err.message);
    isNeonConnected = false;
  }
}

initNeonDb();

// Rate limiter helper for public endpoints
const ipRequestHistory = new Map<string, number[]>();
function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const timestamps = ipRequestHistory.get(ip) || [];
    const recent = timestamps.filter(t => now - t < windowMs);
    if (recent.length >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Тым көп өтініш жіберілді. Сәлден соң қайталаңыз. / Too many requests.'
      });
    }
    recent.push(now);
    ipRequestHistory.set(ip, recent);
    next();
  };
}

// Admin Auth Helper
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qaynar2026';
const ADMIN_TOKEN = 'qaynar_admin_token_2026_secured';

function isAdmin(req: Request): boolean {
  const cookieToken = req.cookies?.admin_session;
  const headerToken = req.headers.authorization?.replace('Bearer ', '');
  return cookieToken === ADMIN_TOKEN || headerToken === ADMIN_TOKEN;
}

// --- API ROUTES ---

// 1. Status & Database info
app.get('/api/status', async (req: Request, res: Response) => {
  let count = localParticipants.length;
  if (neonPool && isNeonConnected) {
    try {
      const q = await neonPool.query('SELECT COUNT(*) FROM participants');
      count = parseInt(q.rows[0].count, 10);
    } catch {
      // fallback
    }
  }

  res.json({
    status: 'ok',
    neonConnected: isNeonConnected,
    storageType: isNeonConnected ? 'neon_postgresql' : 'file_store',
    totalParticipants: count,
    seminar: '«Оқитын колледжден – зияткер ұлтқа»',
    college: 'Высший колледж «Қайнар»',
    year: 2026
  });
});

// 2. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(localSettings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Рұқсат жоқ / Unauthorized' });
  }
  localSettings = { ...localSettings, ...req.body };
  saveLocalData(SETTINGS_FILE, localSettings);
  res.json({ success: true, settings: localSettings });
});

// Admin MP3 Audio Upload
app.post('/api/admin/upload/audio', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Рұқсат жоқ / Unauthorized' });
  }
  const { base64 } = req.body;
  if (!base64 || typeof base64 !== 'string') {
    return res.status(400).json({ success: false, message: 'MP3 аудио деректері табылмады' });
  }
  try {
    const rawData = base64.replace(/^data:audio\/[a-z0-9]+;base64,/, '').replace(/^data:application\/octet-stream;base64,/, '');
    const buffer = Buffer.from(rawData, 'base64');
    const targetFile = path.join(__dirname, 'public/assets/robot_speech.mp3');
    fs.writeFileSync(targetFile, buffer);

    localSettings.audio_url = `/assets/robot_speech.mp3?v=${Date.now()}`;
    saveLocalData(SETTINGS_FILE, localSettings);

    res.json({
      success: true,
      audio_url: localSettings.audio_url,
      message: 'MP3 аудио файлы сәтті жүктелді!'
    });
  } catch (err: any) {
    console.error('Audio upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Program
app.get('/api/program', (req: Request, res: Response) => {
  res.json(localProgram);
});

app.put('/api/program', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Рұқсат жоқ / Unauthorized' });
  }
  if (Array.isArray(req.body)) {
    localProgram = req.body;
    saveLocalData(PROGRAM_FILE, localProgram);
    return res.json({ success: true, program: localProgram });
  }
  res.status(400).json({ success: false, message: 'Invalid program array' });
});

// 4. Participant Registration
app.post('/api/participants', rateLimit(15, 60000), async (req: Request, res: Response) => {
  if (!localSettings.registration_enabled) {
    return res.status(400).json({
      success: false,
      message: 'Семинарға тіркелу уақытша тоқтатылды / Registration is closed'
    });
  }

  const { full_name, organization } = req.body;

  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Аты-жөніңізді енгізіңіз / Full name is required'
    });
  }

  if (!organization || typeof organization !== 'string' || !organization.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Ұйым атауын енгізіңіз / Organization is required'
    });
  }

  const cleanName = full_name.trim();
  const cleanOrg = organization.trim();
  const regTimestamp = new Date().toISOString();

  // Try Neon PostgreSQL first
  if (neonPool && isNeonConnected) {
    try {
      // Get next sequence or count
      const countRes = await neonPool.query('SELECT COUNT(*) FROM participants');
      const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
      const regNumber = `QNR-2026-${String(nextNum).padStart(4, '0')}`;

      const insertRes = await neonPool.query(
        `INSERT INTO participants (reg_number, full_name, organization, attendance_status, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, reg_number, full_name, organization, attendance_status, created_at`,
        [regNumber, cleanName, cleanOrg, 'Тіркелді', regTimestamp]
      );

      const savedParticipant = insertRes.rows[0];
      // Keep local in sync
      localParticipants.unshift(savedParticipant);
      saveLocalData(PARTICIPANTS_FILE, localParticipants);

      return res.status(201).json({
        success: true,
        participant: savedParticipant,
        database: 'neon_postgresql',
        message: 'Сіз семинарға сәтті тіркелдіңіз!'
      });
    } catch (err: any) {
      console.error('[Database] Neon insert error:', err);
      // Fallback below
    }
  }

  // Persistent File / Memory fallback
  const nextNum = localParticipants.length + 1;
  const regNumber = `QNR-2026-${String(nextNum).padStart(4, '0')}`;
  const newParticipant = {
    id: nextNum,
    reg_number: regNumber,
    full_name: cleanName,
    organization: cleanOrg,
    attendance_status: 'Тіркелді',
    created_at: regTimestamp
  };

  localParticipants.unshift(newParticipant);
  saveLocalData(PARTICIPANTS_FILE, localParticipants);

  return res.status(201).json({
    success: true,
    participant: newParticipant,
    database: isNeonConnected ? 'neon_postgresql' : 'file_store',
    message: 'Сіз семинарға сәтті тіркелдіңіз!'
  });
});

// 5. Admin Authentication
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Қате құпиясөз / Invalid password'
    });
  }

  res.cookie('admin_session', ADMIN_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    token: ADMIN_TOKEN,
    message: 'Авторизация сәтті өтті'
  });
});

app.get('/api/admin/check', (req: Request, res: Response) => {
  if (isAdmin(req)) {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ authenticated: false });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  res.clearCookie('admin_session');
  res.json({ success: true });
});

// 6. Admin Participants Management
app.get('/api/admin/participants', async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Рұқсат жоқ / Unauthorized' });
  }

  let list = localParticipants;

  if (neonPool && isNeonConnected) {
    try {
      const q = await neonPool.query('SELECT * FROM participants ORDER BY created_at DESC');
      list = q.rows;
      localParticipants = list;
    } catch (err: any) {
      console.error('[Database] Failed to fetch participants from Neon:', err);
    }
  }

  const { search, organization, status } = req.query;
  let filtered = [...list];

  if (typeof search === 'string' && search.trim()) {
    const s = search.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.full_name?.toLowerCase().includes(s) ||
      p.reg_number?.toLowerCase().includes(s)
    );
  }

  if (typeof organization === 'string' && organization.trim()) {
    const org = organization.toLowerCase().trim();
    filtered = filtered.filter(p => p.organization?.toLowerCase().includes(org));
  }

  if (typeof status === 'string' && status.trim() && status !== 'Барлығы') {
    filtered = filtered.filter(p => p.attendance_status === status);
  }

  const stats = {
    total: list.length,
    attended: list.filter(p => p.attendance_status === 'Қатысты').length,
    absent: list.filter(p => p.attendance_status === 'Қатыспады').length,
    registered: list.filter(p => p.attendance_status === 'Тіркелді').length
  };

  res.json({
    participants: filtered,
    stats,
    database: isNeonConnected ? 'neon_postgresql' : 'file_store'
  });
});

// Add participant manually by admin
app.post('/api/admin/participants', async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Рұқсат жоқ / Unauthorized' });
  }

  const { full_name, organization, attendance_status } = req.body;
  if (!full_name?.trim() || !organization?.trim()) {
    return res.status(400).json({ success: false, message: 'Барлық жолдарды толтырыңыз' });
  }

  const regTimestamp = new Date().toISOString();
  const nextNum = localParticipants.length + 1;
  const regNumber = `QNR-2026-${String(nextNum).padStart(4, '0')}`;
  const status = attendance_status || 'Тіркелді';

  if (neonPool && isNeonConnected) {
    try {
      const insertRes = await neonPool.query(
        `INSERT INTO participants (reg_number, full_name, organization, attendance_status, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [regNumber, full_name.trim(), organization.trim(), status, regTimestamp]
      );
      const saved = insertRes.rows[0];
      localParticipants.unshift(saved);
      saveLocalData(PARTICIPANTS_FILE, localParticipants);
      return res.status(201).json({ success: true, participant: saved });
    } catch (err: any) {
      console.error('[Database] Neon admin insert error:', err);
    }
  }

  const newP = {
    id: nextNum,
    reg_number: regNumber,
    full_name: full_name.trim(),
    organization: organization.trim(),
    attendance_status: status,
    created_at: regTimestamp
  };
  localParticipants.unshift(newP);
  saveLocalData(PARTICIPANTS_FILE, localParticipants);
  res.status(201).json({ success: true, participant: newP });
});

// Update participant
app.patch('/api/admin/participants/:id', async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Рұқсат жоқ / Unauthorized' });
  }

  const id = parseInt(req.params.id, 10);
  const { full_name, organization, attendance_status } = req.body;

  if (neonPool && isNeonConnected) {
    try {
      const q = await neonPool.query(
        `UPDATE participants 
         SET full_name = COALESCE($1, full_name),
             organization = COALESCE($2, organization),
             attendance_status = COALESCE($3, attendance_status)
         WHERE id = $4
         RETURNING *`,
        [full_name?.trim() || null, organization?.trim() || null, attendance_status || null, id]
      );
      if (q.rows.length > 0) {
        const updated = q.rows[0];
        const idx = localParticipants.findIndex(p => p.id === id);
        if (idx !== -1) localParticipants[idx] = updated;
        saveLocalData(PARTICIPANTS_FILE, localParticipants);
        return res.json({ success: true, participant: updated });
      }
    } catch (err: any) {
      console.error('[Database] Neon update error:', err);
    }
  }

  const idx = localParticipants.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Қатысушы табылмады' });
  }

  localParticipants[idx] = {
    ...localParticipants[idx],
    ...(full_name && { full_name: full_name.trim() }),
    ...(organization && { organization: organization.trim() }),
    ...(attendance_status && { attendance_status })
  };
  saveLocalData(PARTICIPANTS_FILE, localParticipants);

  res.json({ success: true, participant: localParticipants[idx] });
});

// Delete participant
app.delete('/api/admin/participants/:id', async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Рұқсат жоқ / Unauthorized' });
  }

  const id = parseInt(req.params.id, 10);

  if (neonPool && isNeonConnected) {
    try {
      await neonPool.query('DELETE FROM participants WHERE id = $1', [id]);
    } catch (err: any) {
      console.error('[Database] Neon delete error:', err);
    }
  }

  localParticipants = localParticipants.filter(p => p.id !== id);
  saveLocalData(PARTICIPANTS_FILE, localParticipants);

  res.json({ success: true });
});

// 7. Excel XLSX Export using ExcelJS
app.get('/api/admin/export/excel', async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Рұқсат жоқ / Unauthorized' });
  }

  let list = [...localParticipants];
  if (neonPool && isNeonConnected) {
    try {
      const q = await neonPool.query('SELECT * FROM participants ORDER BY id ASC');
      list = q.rows;
    } catch {
      // fallback
    }
  }

  const { status, search } = req.query;
  if (status && status !== 'Барлығы') {
    list = list.filter(p => p.attendance_status === status);
  }
  if (typeof search === 'string' && search.trim()) {
    const s = search.toLowerCase().trim();
    list = list.filter(p => p.full_name?.toLowerCase().includes(s) || p.organization?.toLowerCase().includes(s));
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Высший колледж «Қайнар»';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Қатысушылар тізімі', {
    views: [{ state: 'frozen', ySplit: 3 }]
  });

  // Title block
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'ВЫСШИЙ КОЛЛЕДЖ «ҚАЙНАР» — «ОҚИТЫН КОЛЛЕДЖДЕН – ЗИЯТКЕР ҰЛТҚА» ОБЛЫСТЫҚ СЕМИНАРЫ (2026 ж.)';
  titleCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 36;

  // Subtitle / Date row
  worksheet.mergeCells('A2:F2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Экспорт күні: ${new Date().toLocaleString('kk-KZ')} | Қатысушылар саны: ${list.length}`;
  subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF94A3B8' } };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 22;

  // Column Headers
  worksheet.getRow(3).values = [
    '№',
    'Тіркеу нөмірі',
    'Аты-жөні (ФИО)',
    'Ұйым атауы (Организация)',
    'Тіркелген уақыты',
    'Қатысу мәртебесі'
  ];
  worksheet.getRow(3).height = 28;

  worksheet.getRow(3).eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0284C7' } // Sky blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF38BDF8' } },
      left: { style: 'thin', color: { argb: 'FF38BDF8' } },
      bottom: { style: 'medium', color: { argb: 'FF0369A1' } },
      right: { style: 'thin', color: { argb: 'FF38BDF8' } }
    };
  });

  // Data rows
  list.forEach((p, idx) => {
    const rowNumber = idx + 4;
    const formattedDate = new Date(p.created_at).toLocaleString('kk-KZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const row = worksheet.addRow([
      idx + 1,
      p.reg_number || `QNR-2026-${String(idx + 1).padStart(4, '0')}`,
      p.full_name,
      p.organization,
      formattedDate,
      p.attendance_status || 'Тіркелді'
    ]);

    row.height = 24;
    const isEven = idx % 2 === 0;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      if (colNumber === 1 || colNumber === 2 || colNumber === 5 || colNumber === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Status coloring
      if (colNumber === 6) {
        if (p.attendance_status === 'Қатысты') {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF16A34A' } };
        } else if (p.attendance_status === 'Қатыспады') {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFDC2626' } };
        } else {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0284C7' } };
        }
      }
    });
  });

  // Column Widths
  worksheet.columns = [
    { width: 8 },  // №
    { width: 18 }, // Reg number
    { width: 34 }, // Full name
    { width: 42 }, // Organization
    { width: 22 }, // Date
    { width: 20 }  // Status
  ];

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Qaynar_Seminar_2026_Participants.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
});

// Vite Integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Production static serving
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

export default app;
