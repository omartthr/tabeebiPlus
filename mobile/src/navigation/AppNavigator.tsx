import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
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
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabeebiAPI } from '../lib/api';

const Stack = createNativeStackNavigator<MainStackParamList>();

const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: 160,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
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
      const cachedUser = await AsyncStorage.getItem('tabeebi_user');

      if (token) {
        // Önce kaydedilmiş kullanıcıyı hemen göster (anında açılış)
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {}
        }

        // Arka planda doğrula
        const { data, error } = await TabeebiAPI.getMe(token);
        if (data?.user) {
          setUser(data.user);
          await AsyncStorage.setItem('tabeebi_user', JSON.stringify(data.user));
        } else if (!cachedUser) {
          // Hem cache yok hem backend reddetti → çıkış yap
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('tabeebi_user');
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
      // OTPScreen'den zaten doğrulanmış kullanıcı ve token geliyor
      setUser(u);
      if (u.token) {
        await AsyncStorage.setItem('auth_token', u.token);
      }
      // Kullanıcı verisini de kaydet (oturum kalıcılığı)
      await AsyncStorage.setItem('tabeebi_user', JSON.stringify(u));
      return true;
    } catch (e) {
      console.error('signIn error:', e);
      return false;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('tabeebi_user');
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
