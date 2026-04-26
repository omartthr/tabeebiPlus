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
};

export type TabParamList = {
  Home: undefined;
  Appointments: undefined;
  Results: undefined;
  Notifications: undefined;
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
}
