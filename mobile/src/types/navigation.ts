import { Doctor, Specialty } from '../data';

export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  OTP: { name?: string; phone: string; isLogin?: boolean };
};

export type MainStackParamList = {
  MainTabs: undefined;
  DoctorList: { specialty: Specialty };
  DoctorDetail: { doctor: Doctor };
  Booking: { doctor: Doctor };
  Confirmed: { booking: BookingData };
  Help: undefined;
  Privacy: undefined;
};

export type TabParamList = {
  Home: undefined;
  Appointments: undefined;
  AIChat: undefined;
  Results: undefined;
  Profile: undefined;
};

export interface BookingData {
  doctor: Doctor;
  day: string;
  time: string;
  payment: string;
}

export interface UserData {
  id?: string;
  name?: string;
  phone: string;
  isLogin?: boolean;
  patient_code?: string | null;
  token?: string;
  avatar_hue?: number;
  is_registered?: boolean;
}
