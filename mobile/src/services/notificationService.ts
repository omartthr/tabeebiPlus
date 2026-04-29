import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // User will need to set this if they have one
      })).data;
      console.log('Expo Push Token:', token);
    } catch (error: any) {
      console.log('Push notification is not supported in Expo Go on this SDK. Use a development build.', error?.message);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (token && userId) {
    // Update patient's push token in Supabase
    const { error } = await supabase
      .from('patients')
      .update({ push_token: token })
      .eq('id', userId);
    
    if (error) console.error('Error saving push token:', error.message);
  }

  return token;
}

export async function sendLocalNotification(title: string, body: string, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // immediate
  });
}
