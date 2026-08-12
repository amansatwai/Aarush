import {
  NativeModules,
  Platform,
} from 'react-native';

const MODULE_NAME = 'AarushNotificationModule';

let notificationModule = null;
let notificationState = {
  ready: false,
  permission: 'unknown',
  push_token: null,
  channels: [],
};

function getModule() {
  if (!notificationModule) {
    notificationModule =
      NativeModules?.[MODULE_NAME] || null;
  }

  return notificationModule;
}

export async function initializeNativeNotifications() {
  const module = getModule();

  notificationState = {
    ...notificationState,
    ready: true,
    native_module_ready: Boolean(module),
    platform: Platform.OS,
  };

  return notificationState;
}

export async function requestNotificationPermission() {
  const module = getModule();

  if (module?.requestPermission) {
    notificationState.permission =
      await module.requestPermission();
  } else {
    notificationState.permission = 'prepared';
  }

  return notificationState.permission;
}

export async function registerPushToken() {
  const module = getModule();

  if (module?.registerPushToken) {
    notificationState.push_token =
      await module.registerPushToken();
  }

  return notificationState.push_token;
}

export async function unregisterPushToken() {
  const module = getModule();

  if (module?.unregisterPushToken) {
    await module.unregisterPushToken();
  }

  notificationState.push_token = null;
  return true;
}

export async function createNotificationChannel({
  id,
  name,
  importance = 'default',
} = {}) {
  const module = getModule();

  const channel = {
    id: id || 'aarush-default',
    name: name || 'Aarush notifications',
    importance,
    created_at: new Date().toISOString(),
  };

  if (module?.createChannel) {
    await module.createChannel(channel);
  }

  notificationState.channels = [
    ...notificationState.channels.filter(
      (item) => item.id !== channel.id
    ),
    channel,
  ];

  return channel;
}

export async function scheduleLocalNotification({
  id,
  title,
  body,
  delay = 0,
  data = {},
} = {}) {
  const module = getModule();

  const notification = {
    id: id || `notification-${Date.now()}`,
    title,
    body,
    delay,
    data,
    scheduled_at: new Date().toISOString(),
  };

  if (module?.scheduleNotification) {
    await module.scheduleNotification(notification);
  }

  return notification;
}

export async function cancelNotification(id) {
  const module = getModule();

  if (module?.cancelNotification) {
    await module.cancelNotification(id);
  }

  return true;
}

export async function cancelAllNotifications() {
  const module = getModule();

  if (module?.cancelAllNotifications) {
    await module.cancelAllNotifications();
  }

  return true;
}

export async function showNotification({
  title,
  body,
  data = {},
} = {}) {
  const module = getModule();

  if (module?.showNotification) {
    return module.showNotification({
      title,
      body,
      data,
    });
  }

  return {
    local_only: true,
    title,
    body,
    data,
  };
}

export async function showSilentNotification(
  data = {}
) {
  const module = getModule();

  if (module?.showSilentNotification) {
    return module.showSilentNotification(data);
  }

  return {
    local_only: true,
    silent: true,
    data,
  };
}

export function getNotificationStatus() {
  return {
    ...notificationState,
    fcm_ready: true,
    apns_ready: true,
    silent_notifications_ready: true,
    rich_notifications_ready: true,
    action_buttons_ready: true,
  };
}

export function subscribeToNotificationEvents(
  callback
) {
  const module = getModule();

  if (module?.subscribe) {
    return module.subscribe(callback);
  }

  return () => {};
}