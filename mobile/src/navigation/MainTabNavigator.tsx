import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
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
import GlassSurface from '../components/GlassSurface';

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
      tabBar={({ state, descriptors, navigation }) => {
        return (
          <View style={{
            position: 'absolute',
            bottom: 14,
            left: 20,
            right: 20,
            height: tabH,
            borderRadius: 28,
            overflow: 'hidden',
            backgroundColor: 'transparent',
            shadowColor: '#1a7a73',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.14,
            shadowRadius: 20,
            elevation: 14,
          }}>
            <GlassSurface
              width="100%"
              height="100%"
              borderRadius={28}
              intensity={55}
              style={{
                borderWidth: 0,
                borderColor: 'transparent',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
              }}
            >
              <View style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingBottom: isIOS ? 10 : 0,
              }}>
                {state.routes.map((route, index) => {
                  const { options } = descriptors[route.key];
                  const label = options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                      ? options.title
                      : route.name;

                  const isFocused = state.index === index;

                  const onPress = () => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  };

                  // Render center AI button differently (Flat, centered circle)
                  if (route.name === 'AIChat') {
                    return (
                      <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        activeOpacity={0.8}
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20%',
                          height: '100%',
                        }}
                      >
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: isFocused ? 'rgba(26, 122, 115, 0.65)' : 'rgba(153, 225, 217, 0.45)',
                            backgroundColor: isFocused ? 'rgba(26, 122, 115, 0.12)' : 'rgba(255, 255, 255, 0.55)',
                          }}
                        >
                          <Sparkles size={20} color={colors.teal700} strokeWidth={2.2} />
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  const iconSize = 18;
                  const activeColor = colors.teal700;
                  const inactiveColor = colors.ink300;

                  const iconMap: Record<string, React.ReactNode> = {
                    Home: <Home size={iconSize} color={isFocused ? activeColor : inactiveColor} strokeWidth={isFocused ? 2.5 : 1.7} />,
                    Appointments: <Calendar size={iconSize} color={isFocused ? activeColor : inactiveColor} strokeWidth={isFocused ? 2.5 : 1.7} />,
                    Results: <FlaskConical size={iconSize} color={isFocused ? activeColor : inactiveColor} strokeWidth={isFocused ? 2.5 : 1.7} />,
                    Profile: <User size={iconSize} color={isFocused ? activeColor : inactiveColor} strokeWidth={isFocused ? 2.5 : 1.7} />,
                  };

                  return (
                    <TouchableOpacity
                      key={route.key}
                      onPress={onPress}
                      activeOpacity={0.7}
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20%',
                        height: '100%',
                      }}
                    >
                      <View style={{ height: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
                        {isFocused ? (
                          <View 
                            style={{ 
                              width: 36, 
                              height: 28, 
                              borderRadius: 9, 
                              borderWidth: 1,
                              borderColor: 'rgba(153, 225, 217, 0.55)',
                              backgroundColor: 'rgba(26, 122, 115, 0.08)',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {iconMap[route.name]}
                          </View>
                        ) : (
                          iconMap[route.name]
                        )}
                      </View>
                      <Text style={{
                        fontSize: 9,
                        fontWeight: '700',
                        color: isFocused ? colors.teal700 : colors.ink400,
                      }}>
                        {label as string}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </GlassSurface>
          </View>
        );
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal700,
        tabBarInactiveTintColor: colors.ink400,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
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
                <GlassSurface
                  width={48}
                  height={48}
                  borderRadius={18}
                  intensity={45}
                  style={{
                    borderColor: 'rgba(153, 225, 217, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.55)',
                    shadowColor: '#1a7a73',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.18,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  <Sparkles size={20} color={colors.teal700} strokeWidth={2.2} />
                </GlassSurface>
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
            return (
              <GlassSurface 
                width={36} 
                height={28} 
                borderRadius={9} 
                intensity={30} 
                style={{ 
                  borderColor: 'rgba(153, 225, 217, 0.55)',
                  backgroundColor: 'rgba(26, 122, 115, 0.12)' 
                }}
              >
                {iconMap[route.name]}
              </GlassSurface>
            );
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
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
