import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Alert } from 'react-native';

export async function registerForPushNotificationsAsync() {

    let token;
    let token1
  
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
        Alert.alert('Required','Allow notificatoins from device settings');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      token1 = (await Notifications.getDevicePushTokenAsync()).data
    } else {
      Alert.alert('Error','Must use physical device for Push Notifications');
    }
  
    return token;
  }