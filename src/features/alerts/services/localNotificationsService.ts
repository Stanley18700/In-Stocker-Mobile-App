import { Platform } from 'react-native';
import { Product } from '../../../shared/types/product';

let configured = false;
let notificationsModule: typeof import('expo-notifications') | null = null;
let notificationsUnavailableLogged = false;

async function getNotificationsModule(): Promise<typeof import('expo-notifications') | null> {
    if (Platform.OS === 'web') return null;
    if (notificationsModule) return notificationsModule;

    try {
        notificationsModule = await import('expo-notifications');
        return notificationsModule;
    } catch (error) {
        if (!notificationsUnavailableLogged) {
            notificationsUnavailableLogged = true;
            console.warn('expo-notifications is unavailable in this runtime. Notification alerts are disabled.', error);
        }
        return null;
    }
}

function buildNamesList(products: Product[]): string {
    const names = products.map((p) => p.name);
    if (names.length <= 3) return names.join(', ');
    const head = names.slice(0, 3).join(', ');
    return `${head} +${names.length - 3} more`;
}

export async function initializeLocalNotifications(): Promise<boolean> {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return false;

    if (!configured) {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowBanner: true,
                shouldShowList: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('stock-alerts', {
                name: 'Stock Alerts',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 200, 150, 200],
            });
        }

        configured = true;
    }

    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
}

export async function notifyStockThresholdChanges(params: {
    newlyLowStock: Product[];
    newlyOutOfStock: Product[];
}): Promise<void> {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    const hasPermission = await initializeLocalNotifications();
    if (!hasPermission) return;

    const { newlyLowStock, newlyOutOfStock } = params;

    if (newlyOutOfStock.length > 0) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: newlyOutOfStock.length === 1 ? 'Out of stock' : `${newlyOutOfStock.length} items are out of stock`,
                body: buildNamesList(newlyOutOfStock),
            },
            trigger: null,
        });
    }

    const lowOnly = newlyLowStock.filter(
        (p) => !newlyOutOfStock.some((o) => o.id === p.id)
    );

    if (lowOnly.length > 0) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: lowOnly.length === 1 ? 'Low stock warning' : `${lowOnly.length} items reached low stock`,
                body: buildNamesList(lowOnly),
            },
            trigger: null,
        });
    }
}
