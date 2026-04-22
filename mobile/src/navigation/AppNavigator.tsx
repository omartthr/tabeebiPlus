import React, { useState, createContext, useContext } from 'react';
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

interface AuthContextValue {
  user: UserData | null;
  signIn: (u: UserData) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: () => {},
  signOut: () => {},
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

  const signIn = (u: UserData) => setUser(u);
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      <NavigationContainer>
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
