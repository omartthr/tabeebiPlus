import React, { useState, useEffect, createContext, useContext } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import DoctorListScreen from '../screens/doctors/DoctorListScreen';
import DoctorDetailScreen from '../screens/doctors/DoctorDetailScreen';
import BookingScreen from '../screens/appointments/BookingScreen';
import ConfirmedScreen from '../screens/appointments/ConfirmedScreen';
import HelpScreen from '../screens/support/HelpScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import { UserData } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabeebiAPI } from '../lib/api';

interface AuthContextValue {
  user: UserData | null;
  signIn: (u: UserData) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<UserData>) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: async () => false,
  signOut: async () => { },
  updateUser: async () => false,
});

export const useAuth = () => useContext(AuthContext);

const Stack = createNativeStackNavigator<MainStackParamList>();

function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="DoctorList" component={DoctorListScreen} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Confirmed" component={ConfirmedScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Uygulama açılınca mevcut oturumu kontrol et
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const { data, error } = await TabeebiAPI.getMe(token);
        if (data?.user) {
          setUser(data.user);
        } else {
          await AsyncStorage.removeItem('auth_token');
        }
      }
    } catch (e) {
      console.error('Oturum kontrol hatası:', e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (u: UserData): Promise<boolean> => {
    try {
      if (u.isLogin) {
        // GİRİŞ YAP (Login) Flow
        const { data, error } = await TabeebiAPI.login(u.phone);
        
        if (error || !data) {
          Alert.alert('Giriş Hatası', 'Bu numaraya ait bir hesap bulunamadı veya hatalı.');
          return false;
        }

        await AsyncStorage.setItem('auth_token', data.token);
        setUser(data.user);
        return true;
      }

      // KAYIT OL (Register) Flow
      const { data, error } = await TabeebiAPI.register(u.phone, u.name || '');
      
      if (error || !data) {
        Alert.alert('Kayıt Hatası', 'Bu telefon numarası başka bir hesap tarafından kullanılıyor olabilir.');
        return false;
      }
      
      await AsyncStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return true;

    } catch (e) {
      console.error('Beklenmedik hata:', e);
      Alert.alert('Hata', 'Sunucu ile bağlantı kurulamadı.');
      return false;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateUser = async (updates: Partial<UserData>): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      // NOTE: Profil güncellemeleri de yakında Python API'ye taşınacak.
      // Şimdilik sadece state güncelliyoruz.
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (e) {
      console.error('Update user error:', e);
      return false;
    }
  };

  // Oturum kontrolü yapılıyor
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateUser }}>
      <NavigationContainer>
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
