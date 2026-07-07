import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, FlaskConical, Bell, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import { TabParamList } from '../types/navigation';
import { useRTL } from '../context/RTLContext';
import HomeScreen from '../screens/home/HomeScreen';
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import ResultsScreen from '../screens/results/ResultsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export default function MainTabNavigator() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();

  const isIOS = Platform.OS === 'ios';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal700,
        tabBarInactiveTintColor: colors.ink400,
        tabBarStyle: {
          position: 'absolute',
          bottom: isIOS ? 28 : 16,
          left: 16,
          right: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 24,
          height: isIOS ? 80 : 70,
          borderTopWidth: 0,
          // Spacing and alignment
          paddingBottom: isIOS ? 24 : 10,
          paddingTop: 10,
          // Premium shadow matching mockup
          shadowColor: '#0b1f22',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 10,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        tabBarIcon: ({ focused }) => {
          const iconSize = 20;
          const activeColor = colors.teal700;
          const inactiveColor = colors.ink400;

          const iconMap: Record<string, React.ReactNode> = {
            Home:          <Home size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.4 : 1.8} />,
            Appointments:  <Calendar size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.4 : 1.8} />,
            Results:       <FlaskConical size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.4 : 1.8} />,
            Notifications: <Bell size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.4 : 1.8} />,
            Profile:       <User size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.4 : 1.8} />,
          };

          if (focused) {
            return (
              <View style={tabStyles.activeIconBg}>
                {iconMap[route.name]}
              </View>
            );
          }

          return (
            <View style={tabStyles.inactiveIconBg}>
              {iconMap[route.name]}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home"          component={HomeScreen}          options={{ tabBarLabel: t('home') }} />
      <Tab.Screen name="Appointments"  component={AppointmentsScreen}  options={{ tabBarLabel: t('bookings') }} />
      <Tab.Screen name="Results"       component={ResultsScreen}       options={{ tabBarLabel: t('results') }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: t('alerts') }} />
      <Tab.Screen name="Profile"       component={ProfileScreen}       options={{ tabBarLabel: t('profile') }} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  activeIconBg: {
    width: 44,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#E6F9F0', // Soft mint green from mockup
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconBg: {
    width: 44,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
