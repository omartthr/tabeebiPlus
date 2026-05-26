import axios from 'axios';
import { Platform } from 'react-native';

// Geliştirme ortamında, Android emülatör 10.0.2.2 üzerinden localhost'a bağlanır
// Fiziksel cihaz kullanıyorsan buraya bilgisayarının yerel IP adresini (örn: 192.168.1.5) yazmalısın.
const BASE_URL = 'https://tabeebi-plus-backend.vercel.app';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const TabeebiAPI = {
  getPatient: async (phone: string) => {
    try {
      const response = await api.get(`/patients/${phone}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: null, error: null }; // Hasta bulunamadı
      }
      return { data: null, error: error.message };
    }
  },

  sendOtp: async (phone: string) => {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  verifyOtp: async (phone: string, code: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { phone, code });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  login: async (phone: string) => {
    try {
      const response = await api.post('/auth/login', { phone });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  register: async (phone: string, name: string) => {
    try {
      const response = await api.post('/auth/register', { phone, name });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getMe: async (token: string) => {
    try {
      const response = await api.get(`/auth/me?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getDoctorSchedule: async (doctorId: string) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/schedule`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getBookedTimes: async (doctorId: string, date: string) => {
    try {
      const response = await api.get(`/appointments/booked-times?doctor_id=${doctorId}&date=${date}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  createAppointment: async (appointment: any) => {
    try {
      const response = await api.post('/appointments', appointment);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getMyAppointments: async (token: string) => {
    try {
      const response = await api.get(`/appointments/me?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateAppointment: async (id: string, updates: any) => {
    try {
      const response = await api.patch(`/appointments/${id}`, updates);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getNextAppointment: async (token: string) => {
    try {
      const response = await api.get(`/appointments/next?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getRecommendedDoctors: async (token: string) => {
    try {
      const response = await api.get(`/doctors/recommended?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getDoctorScheduleByRegId: async (regId: string) => {
    try {
      const response = await api.get(`/doctor_schedules/${regId}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getPatientCounts: async (token: string) => {
    try {
      const response = await api.get(`/patient/counts?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getNotifications: async (token: string) => {
    try {
      const response = await api.get(`/notifications?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  markNotificationsRead: async (token: string, id?: string) => {
    try {
      const response = await api.patch(`/notifications/mark-read?token=${token}`, id ? { id } : {});
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getPatientResults: async (token: string) => {
    try {
      const response = await api.get(`/results?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getDoctors: async () => {
    try {
      const response = await api.get('/doctors');
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getSupportTickets: async (token: string) => {
    try {
      const response = await api.get(`/support_tickets?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  createSupportTicket: async (token: string, ticket: any) => {
    try {
      const response = await api.post(`/support_tickets?token=${token}`, ticket);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  deleteAccount: async (token: string) => {
    try {
      const response = await api.delete(`/account?token=${token}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
};
