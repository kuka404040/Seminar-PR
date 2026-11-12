import { Participant, ProgramEvent, SeminarSettings, RegistrationResponse } from '../types';

export const api = {
  // Check system status
  async getStatus(): Promise<{
    status: string;
    neonConnected: boolean;
    storageType: string;
    totalParticipants: number;
  }> {
    try {
      const res = await fetch('/api/status');
      return await res.json();
    } catch {
      return { status: 'error', neonConnected: false, storageType: 'file_store', totalParticipants: 0 };
    }
  },

  // Get seminar settings
  async getSettings(): Promise<SeminarSettings> {
    const res = await fetch('/api/settings');
    return await res.json();
  },

  // Update seminar settings (Admin)
  async updateSettings(settings: Partial<SeminarSettings>, token?: string): Promise<any> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(settings)
    });
  },

  // Upload MP3 audio file for robot speech (Admin)
  async uploadAudio(base64: string, token: string): Promise<{ success: boolean; audio_url?: string; message?: string }> {
    const res = await fetch('/api/admin/upload/audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ base64 })
    });
    return await res.json();
  },

  // Get official program
  async getProgram(): Promise<ProgramEvent[]> {
    const res = await fetch('/api/program');
    return await res.json();
  },

  // Update official program (Admin)
  async updateProgram(program: ProgramEvent[], token?: string): Promise<any> {
    const res = await fetch('/api/program', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(program)
    });
    return await res.json();
  },

  // Register participant (2 fields only)
  async register(fullName: string, organization: string): Promise<RegistrationResponse> {
    const res = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        organization: organization
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Тіркелу кезінде қате орын алды');
    }
    return data;
  },

  // Admin Auth
  async adminLogin(password: string): Promise<{ success: boolean; token?: string; message?: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return await res.json();
  },

  async checkAdminAuth(token?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/check', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      return !!data.authenticated;
    } catch {
      return false;
    }
  },

  async adminLogout(): Promise<void> {
    await fetch('/api/admin/logout', { method: 'POST' });
  },

  // Admin Participants
  async getAdminParticipants(params?: {
    search?: string;
    organization?: string;
    status?: string;
    token?: string;
  }): Promise<{
    participants: Participant[];
    stats: { total: number; attended: number; absent: number; registered: number };
    database: string;
  }> {
    const url = new URL('/api/admin/participants', window.location.origin);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.organization) url.searchParams.set('organization', params.organization);
    if (params?.status) url.searchParams.set('status', params.status);

    const res = await fetch(url.toString(), {
      headers: params?.token ? { Authorization: `Bearer ${params.token}` } : {}
    });
    return await res.json();
  },

  async addParticipantAdmin(participant: {
    full_name: string;
    organization: string;
    attendance_status: string;
  }, token?: string): Promise<any> {
    const res = await fetch('/api/admin/participants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(participant)
    });
    return await res.json();
  },

  async updateParticipantAdmin(id: number, updates: Partial<Participant>, token?: string): Promise<any> {
    const res = await fetch(`/api/admin/participants/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  async deleteParticipantAdmin(id: number, token?: string): Promise<any> {
    const res = await fetch(`/api/admin/participants/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return await res.json();
  }
};
