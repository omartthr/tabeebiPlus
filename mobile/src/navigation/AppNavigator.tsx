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
import { UserData } from '../types/navigation';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: UserData | null;
  signIn: (u: UserData) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: async () => false,
  signOut: async () => { },
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
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Uygulama açılınca mevcut oturumu kontrol et
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Oturum kontrol hatası:', error);
      if (data?.session) {
        loadPatient(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase'den hasta bilgilerini çek
  const loadPatient = async (authId: string) => {
    const { data } = await supabase
      .from('patients')
      .select('name, phone')
      .eq('auth_id', authId)
      .single();

    if (data) setUser({ name: data.name, phone: data.phone });
    setLoading(false);
  };

  const signIn = async (u: UserData): Promise<boolean> => {
    try {
      const fakeEmail = `user${u.phone.replace(/[^0-9]/g, '')}@tabeebi.com`;
      const fakePassword = process.env.EXPO_PUBLIC_DUMMY_PASSWORD || 'Fallback-Secret-123!';

      if (u.isLogin) {
        // GİRİŞ YAP (Login) Flow
        let { data, error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: fakePassword,
        });

        if (error) {
          Alert.alert('Giriş Hatası', 'Bu numaraya ait bir hesap bulunamadı veya hatalı.');
          return false;
        }

        if (data?.session) {
          // Fetch real name from database
          const { data: existing } = await supabase
            .from('patients')
            .select('name, phone')
            .eq('auth_id', data.session.user.id)
            .maybeSingle();

          if (existing) {
            setUser({ name: existing.name, phone: existing.phone });
          } else {
            setUser({ name: 'Bilinmeyen Kullanıcı', phone: u.phone });
          }
        }
        return true;
      }

      // KAYIT OL (Register) Flow
      // First check if user already exists
      let { error: checkError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: fakePassword,
      });

      if (!checkError) {
        // Sign in succeeded, meaning account already exists!
        Alert.alert('Kayıt Hatası', 'Bu telefon numarası zaten kayıtlı. Lütfen giriş yap sayfasını kullanın.');
        await supabase.auth.signOut();
        return false;
      }

      // Account doesn't exist, proceed with signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: fakePassword,
      });

      if (signUpError) {
        Alert.alert('Kayıt Hatası', signUpError.message);
        return false;
      }

      if (signUpData?.session) {
        // Yeni hasta → veritabanına kaydet
        const { error: insertError } = await supabase.from('patients').insert({
          auth_id: signUpData.session.user.id,
          phone: u.phone,
          name: u.name,
        });

        if (insertError) {
          if (insertError.code === '23505') {
            Alert.alert('Kayıt Hatası', 'Bu telefon numarası başka bir hesap tarafından kullanılıyor.');
            await supabase.auth.signOut();
            return false;
          }
          console.error('Veritabanı Kayıt Hatası:', insertError.message);
          Alert.alert('Veri Kayıt Hatası', insertError.message);
          return false;
        }
      } else {
        Alert.alert('Hata', 'Supabase ayarlarından Confirm Email tam kapanmamış olabilir.');
        return false;
      }

      setUser({ name: u.name || '', phone: u.phone });
      return true;

    } catch (e) {
      console.error('Beklenmedik hata:', e);
      Alert.alert('Hata', 'Supabase ile bağlantı kurulamadı.');
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => { });
    setUser(null);
  };

  // Oturum kontrolü yapılıyor
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      <NavigationContainer>
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
