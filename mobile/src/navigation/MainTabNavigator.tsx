import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, FlaskConical, Sparkles, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import { TabParamList } from '../types/navigation';
import { useRTL } from '../context/RTLContext';
import HomeScreen from '../screens/home/HomeScreen';
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import AIChatScreen from '../screens/ai/AIChatScreen';
import ResultsScreen from '../screens/results/ResultsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const isIOS = Platform.OS === 'ios';

export default function MainTabNavigator() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  // useWindowDimensions is reactive — changes take effect on every render/reload
  const { width: screenW } = useWindowDimensions();

  const barW = Math.min(240, screenW * 0.65);   // max 240dp, at most 65% of screen
  const margin = (screenW - barW) / 2;             // equal left & right margin
  const tabH = isIOS ? 68 : 58;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal700,
        tabBarInactiveTintColor: colors.ink400,
        tabBarStyle: {
          position: 'absolute',
          bottom: 14,
          left: 0,
          right: 0,
          marginHorizontal: 20,
          height: tabH,
          borderTopWidth: 0,
          borderRadius: 28,
          backgroundColor: 'rgba(232, 248, 246, 0.88)',
          borderWidth: 1,
          borderColor: 'rgba(153, 225, 217, 0.5)',
          paddingBottom: isIOS ? 14 : 6,
          paddingTop: 6,
          paddingHorizontal: 0,
          shadowColor: '#1a7a73',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 20,
          elevation: 14,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        // Remove the default full-width background behind the pill bar
        tabBarBackground: () => <View style={{ backgroundColor: 'transparent', flex: 1 }} />,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          marginTop: 1,
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        tabBarIcon: ({ focused }) => {
          const iconSize = 18;
          const activeColor = colors.teal700;
          const inactiveColor = colors.ink300;

          /* ——— CENTER AI BUTTON ——— */
          if (route.name === 'AIChat') {
            return (
              <View style={tabStyles.aiOuter}>
                <View style={tabStyles.aiInner}>
                  <View style={tabStyles.aiRing} />
                  <Sparkles size={19} color="#fff" strokeWidth={1.8} />
                </View>
              </View>
            );
          }

          const iconMap: Record<string, React.ReactNode> = {
            Home: <Home size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.5 : 1.7} />,
            Appointments: <Calendar size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.5 : 1.7} />,
            Results: <FlaskConical size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.5 : 1.7} />,
            Profile: <User size={iconSize} color={focused ? activeColor : inactiveColor} strokeWidth={focused ? 2.5 : 1.7} />,
          };

          if (focused) {
            return <View style={tabStyles.activePill}>{iconMap[route.name]}</View>;
          }
          return <View style={tabStyles.iconWrap}>{iconMap[route.name]}</View>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ tabBarLabel: t('bookings') }} />
      <Tab.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          tabBarLabel: t('ai_tab'),
          tabBarLabelStyle: { fontSize: 9, fontWeight: '800', color: colors.teal700, marginTop: 1 },
        }}
      />
      <Tab.Screen name="Results" component={ResultsScreen} options={{ tabBarLabel: t('results') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('profile') }} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    width: 30,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    width: 36,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.teal50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ——— Premium AI button ——— */
  aiOuter: {
    marginTop: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiInner: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.teal700,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#1a7a73',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 14,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  aiRing: {
    position: 'absolute',
    top: -18,
    left: -18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
});
