import { Doctor, Specialty } from '../data';

export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  OTP: { name: string; phone: string };
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
  name: string;
  phone: string;
}
