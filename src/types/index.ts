export type Language = 'kk' | 'ru' | 'en';

export type AttendanceStatus = 'Тіркелді' | 'Қатысты' | 'Қатыспады';

export interface Participant {
  id: number;
  reg_number: string;
  full_name: string;
  organization: string;
  attendance_status: AttendanceStatus;
  created_at: string;
}

export interface ProgramEvent {
  id: number;
  time_slot: string;
  location: string;
  title: string;
  speakers: string;
  sort_order: number;
}

export interface SeminarSettings {
  registration_enabled: boolean;
  robot_speech_text: string;
  robot_enabled: boolean;
  seminar_date: string;
  seminar_time: string;
  seminar_place: string;
  pdf_url?: string;
  audio_url?: string;
}

export interface RegistrationResponse {
  success: boolean;
  participant?: Participant;
  message?: string;
  database?: 'neon_postgresql' | 'local_storage';
}
