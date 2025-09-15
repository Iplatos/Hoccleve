import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";

import {Alert, Platform} from "react-native";
import { EventSubscription } from "expo-notifications";

export interface PushNotificationState {
    expoPushToken?: string;
    notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();

    const notificationListener = useRef<EventSubscription | null>(null);
    const responseListener = useRef<EventSubscription | null>(null);

    // Настройка поведения уведомлений
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    async function registerForPushNotificationsAsync(): Promise<string | undefined> {
        if (!Device.isDevice) {
            Alert.alert('Push-уведомления работают только на реальном устройстве');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Alert.alert('Не получены разрешения на push-уведомления');
            return;
        }

        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

        if (!projectId) {
            Alert.alert('Project ID не найден. Убедитесь, что он указан в app.config.js');
            return;
        }

        const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
        return tokenResponse.data;
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => {
            setExpoPushToken(token);
        });

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current?.remove()
               // Notifications.removeNotificationSubscription(notificationListener.current);
            }

            if (responseListener.current) {
                responseListener.current?.remove();
               // Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    // Настройка канала для Android
    useEffect(() => {
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    }, []);

    return {
        expoPushToken,
        notification,
    };
};