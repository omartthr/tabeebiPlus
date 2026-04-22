import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, FlaskConical, Bell, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import { TabParamList } from '../types/navigation';
import HomeScreen from '../screens/home/HomeScreen';
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import ResultsScreen from '../screens/results/ResultsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export default function MainTabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal700,
        tabBarInactiveTintColor: colors.ink400,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.ink100,
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, React.ReactNode> = {
            Home:          <Home size={24} color={color} />,
            Appointments:  <Calendar size={24} color={color} />,
            Results:       <FlaskConical size={24} color={color} />,
            Notifications: <Bell size={24} color={color} />,
            Profile:       <User size={24} color={color} />,
          };
          return icons[route.name] ?? null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ tabBarLabel: t('bookings') }} />
      <Tab.Screen name="Results" component={ResultsScreen} options={{ tabBarLabel: t('results') }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: t('alerts') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('profile') }} />
    </Tab.Navigator>
  );
}
