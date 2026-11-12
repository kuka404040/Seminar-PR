import React, { useEffect, useState, useCallback } from 'react';
import { Participant, ProgramEvent, SeminarSettings, Language } from '../types';
import { translations } from '../translations/translations';
import { api } from '../services/api';
import {
  Users, CheckCircle, XCircle, Clock, Download, Plus, Search,
  Trash2, Edit, Save, X, Database, Bot, Calendar, LogOut,
  RefreshCw, Check, AlertCircle, ArrowLeft, Upload, Volume2
} from 'lucide-react';

interface AdminDashboardProps {
  language: Language;
  token: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  token,
  onLogout,
}) => {
  const t = translations[language];

  // Active sub-view
  const [activeTab, setActiveTab] = useState<'participants' | 'program' | 'robot' | 'database'>('participants');

  // Participants State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState({ total: 0, attended: 0, absent: 0, registered: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Барлығы');
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Participant Edit / Add Modal
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newStatus, setNewStatus] = useState('Тіркелді');

  // Program State
  const [programList, setProgramList] = useState<ProgramEvent[]>([]);
  const [editingProgramEvent, setEditingProgramEvent] = useState<ProgramEvent | null>(null);
  const [isSavingProgram, setIsSavingProgram] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<SeminarSettings | null>(null);
  const [robotSpeechText, setRobotSpeechText] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadMsg, setAudioUploadMsg] = useState<{ text: string; success: boolean } | null>(null);

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setAudioUploadMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadAudio(base64, token);
        if (res.success && res.audio_url) {
          setAudioUploadMsg({ text: 'MP3 аудио файлы сәтті жүктелді! Робот енді осы аудионы ойнатады.', success: true });
          if (settings) {
            setSettings({ ...settings, audio_url: res.audio_url });
          }
        } else {
          setAudioUploadMsg({ text: res.message || 'Жүктеу қатесі', success: false });
        }
      } catch (err: any) {
        setAudioUploadMsg({ text: err.message || 'Файлды жүктеу кезінде қате орын алды', success: false });
      } finally {
        setIsUploadingAudio(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fetch Participants
  const fetchParticipants = useCallback(async () => {
    setIsLoadingParticipants(true);
    try {
      const data = await api.getAdminParticipants({
        search: searchQuery,
        status: statusFilter,
        token
      });
      setParticipants(data.participants || []);
      setStats(data.stats || { total: 0, attended: 0, absent: 0, registered: 0 });
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [searchQuery, statusFilter, token]);

  // Fetch Initial Data
  useEffect(() => {
    fetchParticipants();
    api.getStatus().then(setDbStatus).catch(() => {});
    api.getProgram().then(setProgramList).catch(() => {});
    api.getSettings().then((s) => {
      setSettings(s);
      setRobotSpeechText(s.robot_speech_text || '');
    }).catch(() => {});
  }, [fetchParticipants]);

  // Attendance Toggle
  const handleToggleAttendance = async (participant: Participant, newStatusVal: 'Тіркелді' | 'Қатысты' | 'Қатыспады') => {
    try {
      await api.updateParticipantAdmin(participant.id, { attendance_status: newStatusVal }, token);
      fetchParticipants();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete Participant
  const handleDeleteParticipant = async (id: number) => {
    if (!window.confirm('Бұл қатысушыны тізімнен өшіруді растайсыз ба?')) return;
    try {
      await api.deleteParticipantAdmin(id, token);
      fetchParticipants();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Save Participant Edit
  const handleSaveParticipantEdit = async () => {
    if (!editingParticipant) return;
    try {
      await api.updateParticipantAdmin(editingParticipant.id, editingParticipant, token);
      setEditingParticipant(null);
      fetchParticipants();
    } catch (err) {
      console.error('Failed to save edit:', err);
    }
  };

  // Add Participant
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newOrg.trim()) return;
    try {
      await api.addParticipantAdmin({
        full_name: newFullName.trim(),
        organization: newOrg.trim(),
        attendance_status: newStatus
      }, token);
      setIsAddModalOpen(false);
      setNewFullName('');
      setNewOrg('');
      setNewStatus('Тіркелді');
      fetchParticipants();
    } catch (err) {
      console.error('Failed to add participant:', err);
    }
  };

  // Program Management Handlers
  const handleSaveProgram = async (updatedList: ProgramEvent[]) => {
    setIsSavingProgram(true);
    try {
      await api.updateProgram(updatedList, token);
      setProgramList(updatedList);
    } catch (err) {
      console.error('Failed to update program:', err);
    } finally {
      setIsSavingProgram(false);
    }
  };

  const handleAddNewEvent = () => {
    const newEv: ProgramEvent = {
      id: Date.now(),
      time_slot: '12.40-13.00',
      location: 'Мәжіліс залы',
      title: 'Жаңа іс-шара атауы',
      speakers: 'Баяндамашы аты-жөні мен ұйымы',
      sort_order: programList.length + 1
    };
    const updated = [...programList, newEv];
    handleSaveProgram(updated);
  };

  const handleDeleteEvent = (id: number) => {
    if (!window.confirm('Іс-шараны өшіруді растайсыз ба?')) return;
    const updated = programList.filter(e => e.id !== id);
    handleSaveProgram(updated);
  };

  // Save Settings Handlers
  const handleSaveRobotSpeech = async () => {
    setIsSavingSettings(true);
    try {
      await api.updateSettings({ robot_speech_text: robotSpeechText }, token);
      alert('Робот сөзі сәтті жаңартылды!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleRegistration = async () => {
    if (!settings) return;
    const updatedVal = !settings.registration_enabled;
    try {
      await api.updateSettings({ registration_enabled: updatedVal }, token);
      setSettings({ ...settings, registration_enabled: updatedVal });
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  // Excel Export URL
  const getExcelExportUrl = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'Барлығы') params.set('status', statusFilter);
    if (searchQuery) params.set('search', searchQuery);
    return `/api/admin/export/excel?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Top Header Bar */}
      <header className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/image_7c0c0c14.png"
            alt="Қайнар"
            className="w-10 h-10 object-contain drop-shadow"
          />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {t.adminPortal}
            </h1>
            <p className="text-xs text-slate-400">
              «Оқитын колледжден – зияткер ұлтқа» · Высший колледж «Қайнар»
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Сайтқа қайту</span>
          </a>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.adminLogout}</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'participants'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Қатысушылар ({stats.total})</span>
          </button>

          <button
            onClick={() => setActiveTab('program')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'program'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.adminProgramMgmt}</span>
          </button>

          <button
            onClick={() => setActiveTab('robot')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'robot'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t.adminRobotMgmt}</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'database'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Neon DB Мәртебесі</span>
          </button>
        </div>

        {/* TAB 1: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="space-y-6">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs">{t.adminTotal}</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono-numbers text-white">{stats.total}</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs">{t.adminAttended}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono-numbers text-emerald-400">{stats.attended}</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs">{t.adminAbsent}</span>
                  <XCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold font-mono-numbers text-rose-400">{stats.absent}</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs">Тіркелді (Күтілуде)</span>
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold font-mono-numbers text-sky-400">{stats.registered}</div>
              </div>
            </div>

            {/* Filter & Action Controls Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.adminSearchName}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Барлығы">Барлық мәртебе</option>
                  <option value="Тіркелді">Тіркелді</option>
                  <option value="Қатысты">Қатысты</option>
                  <option value="Қатыспады">Қатыспады</option>
                </select>

                <button
                  onClick={() => fetchParticipants()}
                  className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
                  title="Жаңарту"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingParticipants ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Action Buttons: Add & Excel Export */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>{t.adminAddParticipant}</span>
                </button>

                <a
                  href={getExcelExportUrl()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition"
                  download
                >
                  <Download className="w-4 h-4" />
                  <span>{statusFilter !== 'Барлығы' ? t.adminExportFiltered : t.adminExportExcel}</span>
                </a>
              </div>
            </div>

            {/* Participants Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">№</th>
                      <th className="py-3 px-4">Тіркеу нөмірі</th>
                      <th className="py-3 px-4">Аты-жөні</th>
                      <th className="py-3 px-4">Ұйым атауы</th>
                      <th className="py-3 px-4">Уақыты</th>
                      <th className="py-3 px-4">Мәртебесі</th>
                      <th className="py-3 px-4 text-right">Әрекеттер</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          {isLoadingParticipants ? 'Жүктелуде...' : 'Қатысушылар табылмады'}
                        </td>
                      </tr>
                    ) : (
                      participants.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3 px-4 font-mono-numbers text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono-numbers font-semibold text-cyan-400">{p.reg_number}</td>
                          <td className="py-3 px-4 font-semibold text-white">{p.full_name}</td>
                          <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{p.organization}</td>
                          <td className="py-3 px-4 font-mono-numbers text-slate-400 text-xs">
                            {new Date(p.created_at).toLocaleString('kk-KZ', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              p.attendance_status === 'Қатысты'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : p.attendance_status === 'Қатыспады'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                            }`}>
                              {p.attendance_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Status toggles */}
                              {p.attendance_status !== 'Қатысты' && (
                                <button
                                  onClick={() => handleToggleAttendance(p, 'Қатысты')}
                                  title="Қатысты деп белгілеу"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {p.attendance_status !== 'Қатыспады' && (
                                <button
                                  onClick={() => handleToggleAttendance(p, 'Қатыспады')}
                                  title="Қатыспады деп белгілеу"
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit */}
                              <button
                                onClick={() => setEditingParticipant(p)}
                                title="Өңдеу"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteParticipant(p.id)}
                                title="Өшіру"
                                className="p-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-800/50 text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROGRAM SCHEDULE MANAGEMENT */}
        {activeTab === 'program' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Семинар бағдарламасын өңдеу</h3>
                <p className="text-xs text-slate-400">Ресми кесте мен баяндамашыларды басқару</p>
              </div>

              <button
                onClick={handleAddNewEvent}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Жаңа іс-шара қосу</span>
              </button>
            </div>

            <div className="space-y-4">
              {programList.map((ev, idx) => (
                <div key={ev.id} className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers text-xs font-bold text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                        {ev.time_slot}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {ev.location}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base">{ev.title}</h4>
                    <p className="text-xs text-slate-300 whitespace-pre-line">{ev.speakers}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingProgramEvent(ev)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Өңдеу</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-800/50 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ROBOT MANAGEMENT */}
        {activeTab === 'robot' && (
          <div className="max-w-2xl space-y-6">
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span>Робот сөйлеу мәтіні</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Ресми бекітілген мәтін (3 сөйлемнен тұрады):
              </p>

              <textarea
                value={robotSpeechText}
                onChange={(e) => setRobotSpeechText(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400"
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveRobotSpeech}
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Сақталуда...' : 'Мәтінді сақтау'}</span>
                </button>
              </div>
            </div>

            {/* MP3 Audio Upload & Preview Card */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                    <span>Роботтың MP3 аудиофайлы</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Қазіргі уақытта стандартты заглушка аудиосы белсенді. Өз аудиоңызды осы жерден жүктей аласыз.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono-numbers">
                  MP3 Audio
                </span>
              </div>

              {/* Current Audio Player */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Ағымдағы аудиофайл:</span>
                  <span className="font-mono text-cyan-300 text-[11px] truncate max-w-[200px]">
                    {settings?.audio_url || '/assets/robot_speech.mp3'}
                  </span>
                </div>
                <audio
                  controls
                  key={settings?.audio_url}
                  src={settings?.audio_url || '/assets/robot_speech.mp3'}
                  className="w-full h-10 rounded-lg outline-none"
                />
              </div>

              {/* Upload Input */}
              <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-400/50 rounded-2xl p-6 text-center transition">
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/*"
                  onChange={handleAudioFileUpload}
                  disabled={isUploadingAudio}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {isUploadingAudio ? 'Аудио жүктелуде...' : 'Жаңа MP3 файлды таңдаңыз немесе осында сүйреңіз'}
                  </div>
                  <div className="text-xs text-slate-500">
                    Қолдау көрсетілетін формат: .mp3 (максимум 20 МБ)
                  </div>
                </div>
              </div>

              {/* Upload Feedback */}
              {audioUploadMsg && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  audioUploadMsg.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}>
                  {audioUploadMsg.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{audioUploadMsg.text}</span>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Тіркелу формасын қосу / өшіру</h4>
                <p className="text-xs text-slate-400">Сайтта қатысушыларды тіркеу күйі</p>
              </div>

              <button
                onClick={handleToggleRegistration}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  settings?.registration_enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {settings?.registration_enabled ? 'Қосулы (Белсенді)' : 'Өшірулі (Жабық)'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE CONNECTION DIAGNOSTICS */}
        {activeTab === 'database' && (
          <div className="max-w-2xl space-y-6">
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  dbStatus?.neonConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Neon PostgreSQL Байланысы</h3>
                  <div className="text-xs text-slate-400">
                    Күйі: {dbStatus?.neonConnected ? 'Байланыс орнатылған (Real Neon DB)' : 'Жергілікті сақтау қоры белсенді'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Сақтау типі:</span>
                  <span className="font-mono-numbers text-cyan-400 font-semibold">{dbStatus?.storageType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Тіркелген жазбалар:</span>
                  <span className="font-mono-numbers text-white font-bold">{dbStatus?.totalParticipants}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">Neon PostgreSQL қалай қосылады:</h4>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                  <li><span className="text-cyan-400 font-semibold">Neon.tech</span> консолінен жаңа жоба ашыңыз немесе бар жобаны таңдаңыз.</li>
                  <li>Жобаның <span className="font-mono text-cyan-300">DATABASE_URL</span> байланыс жолын көшіріңіз.</li>
                  <li>Сервердің <span className="font-mono text-cyan-300">.env</span> файлындағы немесе Vercel Environment Variables бөліміндегі <span className="font-mono text-cyan-300">DATABASE_URL</span> айнымалысына қойыңыз.</li>
                  <li>Серверді қайта іске қосыңыз. Кестелер автоматты түрде жасалады!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD PARTICIPANT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Қатысушыны қолмен қосу</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Аты-жөні</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Толық аты-жөнін енгізіңіз"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ұйым атауы</label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  placeholder="Колледж немесе ұйым атауы"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Қатысу мәртебесі</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Тіркелді">Тіркелді</option>
                  <option value="Қатысты">Қатысты</option>
                  <option value="Қатыспады">Қатыспады</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
                >
                  Қосу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PARTICIPANT */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Қатысушыны өңдеу</h3>
              <button onClick={() => setEditingParticipant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Тіркеу нөмірі</label>
                <input
                  type="text"
                  value={editingParticipant.reg_number}
                  disabled
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Аты-жөні</label>
                <input
                  type="text"
                  value={editingParticipant.full_name}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ұйым атауы</label>
                <input
                  type="text"
                  value={editingParticipant.organization}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Қатысу мәртебесі</label>
                <select
                  value={editingParticipant.attendance_status}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, attendance_status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Тіркелді">Тіркелді</option>
                  <option value="Қатысты">Қатысты</option>
                  <option value="Қатыспады">Қатыспады</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingParticipant(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Болдырмау
                </button>
                <button
                  type="button"
                  onClick={handleSaveParticipantEdit}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
                >
                  Сақтау
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROGRAM EVENT */}
      {editingProgramEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Іс-шараны өңдеу</h3>
              <button onClick={() => setEditingProgramEvent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Уақыты</label>
                  <input
                    type="text"
                    value={editingProgramEvent.time_slot}
                    onChange={(e) => setEditingProgramEvent({ ...editingProgramEvent, time_slot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Өткізу орны</label>
                  <input
                    type="text"
                    value={editingProgramEvent.location}
                    onChange={(e) => setEditingProgramEvent({ ...editingProgramEvent, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Іс-шара атауы</label>
                <input
                  type="text"
                  value={editingProgramEvent.title}
                  onChange={(e) => setEditingProgramEvent({ ...editingProgramEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Жауаптылар / Баяндамашылар</label>
                <textarea
                  value={editingProgramEvent.speakers}
                  onChange={(e) => setEditingProgramEvent({ ...editingProgramEvent, speakers: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProgramEvent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Болдырмау
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = programList.map(e => e.id === editingProgramEvent.id ? editingProgramEvent : e);
                    handleSaveProgram(updated);
                    setEditingProgramEvent(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
                >
                  Сақтау
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
