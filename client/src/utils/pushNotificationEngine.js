const DEFAULT_ICON = '/icons/icon-192.png';
const DEFAULT_BADGE = '/icons/badge-72.png';
const SERVICE_WORKER_PATH = '/sw.js';

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

function isGuestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) ===
      'true' &&
    window.localStorage.getItem(
      GUEST_KEYS.guestSession
    ) !== null
  );
}

function assertBrowserNotifications() {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window)
  ) {
    throw new Error(
      'Browser notifications are not supported.'
    );
  }
}

async function getAuthenticatedUser() {
  if (isGuestMode()) {
    throw new Error(
      'Push notifications are unavailable in Guest Mode.'
    );
  }

  const { supabase } = await import('../lib/supabase');

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      'Sign in to enable push notifications.'
    );
  }

  return user;
}

function getVapidKey() {
  if (typeof import.meta !== 'undefined') {
    return import.meta.env?.VITE_PUSH_VAPID_PUBLIC_KEY || '';
  }

  return '';
}

function normalizeNotificationOptions(options = {}) {
  return {
    body: options.body || '',
    icon: options.icon || DEFAULT_ICON,
    badge: options.badge || DEFAULT_BADGE,
    image: options.image || undefined,
    tag: options.tag || 'aarush-notification',
    data: options.data || {},
    vibrate:
      options.vibration === false
        ? undefined
        : options.vibrate || [120, 60, 120],
    renotify: Boolean(options.renotify),
    requireInteraction: Boolean(
      options.requireInteraction
    ),
    silent: Boolean(options.silent),
    timestamp: Date.now(),
    actions: options.actions || [],
  };
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window
  );
}

export function getNotificationPermission() {
  if (!isPushSupported()) {
    return 'unsupported';
  }

  return Notification.permission;
}

export async function requestNotificationPermission() {
  assertBrowserNotifications();

  if (isGuestMode()) {
    throw new Error(
      'Sign in to enable push notifications.'
    );
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return Notification.requestPermission();
}

export async function initializePushNotifications({
  serviceWorkerPath = SERVICE_WORKER_PATH,
} = {}) {
  if (!isPushSupported()) {
    return {
      supported: false,
      permission: 'unsupported',
      registration: null,
      subscription: null,
    };
  }

  const permission = getNotificationPermission();

  if (permission !== 'granted') {
    return {
      supported: true,
      permission,
      registration: null,
      subscription: null,
    };
  }

  let registration = null;

  if ('serviceWorker' in navigator) {
    try {
      registration =
        await navigator.serviceWorker.register(
          serviceWorkerPath
        );
    } catch {
      registration = null;
    }
  }

  let subscription = null;

  if (
    registration?.pushManager &&
    'PushManager' in window
  ) {
    subscription =
      await registration.pushManager.getSubscription();
  }

  return {
    supported: true,
    permission,
    registration,
    subscription,
  };
}

export async function registerDevice({
  vapidPublicKey = getVapidKey(),
  serviceWorkerPath = SERVICE_WORKER_PATH,
} = {}) {
  await getAuthenticatedUser();

  const initialized =
    await initializePushNotifications({
      serviceWorkerPath,
    });

  if (
    !initialized.registration?.pushManager ||
    !('PushManager' in window)
  ) {
    return initialized;
  }

  let subscription = initialized.subscription;

  if (!subscription && vapidPublicKey) {
    const applicationServerKey =
      Uint8Array.from(
        atob(
          vapidPublicKey
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        ),
        (character) => character.charCodeAt(0)
      );

    subscription =
      await initialized.registration.pushManager.subscribe(
        {
          userVisibleOnly: true,
          applicationServerKey,
        }
      );
  }

  return {
    ...initialized,
    subscription,
    deviceReady: Boolean(subscription),
  };
}

export async function unregisterDevice({
  serviceWorkerPath = SERVICE_WORKER_PATH,
} = {}) {
  await getAuthenticatedUser();

  const initialized =
    await initializePushNotifications({
      serviceWorkerPath,
    });

  if (!initialized.subscription) {
    return true;
  }

  return initialized.subscription.unsubscribe();
}

export async function showLocalNotification(
  title,
  options = {}
) {
  assertBrowserNotifications();

  if (isGuestMode()) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    throw new Error(
      'Notification permission has not been granted.'
    );
  }

  const normalizedOptions =
    normalizeNotificationOptions(options);

  if (
    'serviceWorker' in navigator &&
    options.useServiceWorker !== false
  ) {
    const registration =
      await navigator.serviceWorker.ready.catch(
        () => null
      );

    if (registration?.showNotification) {
      await registration.showNotification(
        title,
        normalizedOptions
      );

      return {
        type: 'service-worker',
        title,
        options: normalizedOptions,
      };
    }
  }

  const notification = new Notification(
    title,
    normalizedOptions
  );

  if (typeof options.onClick === 'function') {
    notification.onclick = options.onClick;
  }

  if (typeof options.onClose === 'function') {
    notification.onclose = options.onClose;
  }

  return notification;
}

export function showMessageNotification({
  senderName = 'New message',
  body = 'You received a new message.',
  conversationId,
  ...options
} = {}) {
  return showLocalNotification(
    senderName,
    {
      ...options,
      body,
      tag: `aarush-message-${conversationId || 'general'}`,
      data: {
        type: 'message',
        conversationId,
        ...(options.data || {}),
      },
    }
  );
}

export function showLikeNotification({
  actorName = 'Someone',
  postId,
  ...options
} = {}) {
  return showLocalNotification(
    'New like',
    {
      ...options,
      body: `${actorName} liked your post.`,
      tag: `aarush-like-${postId || 'general'}`,
      data: {
        type: 'like',
        postId,
        ...(options.data || {}),
      },
    }
  );
}

export function showCommentNotification({
  actorName = 'Someone',
  postId,
  comment,
  ...options
} = {}) {
  return showLocalNotification(
    'New comment',
    {
      ...options,
      body:
        comment ||
        `${actorName} commented on your post.`,
      tag: `aarush-comment-${postId || 'general'}`,
      data: {
        type: 'comment',
        postId,
        ...(options.data || {}),
      },
    }
  );
}

export function showFollowNotification({
  actorName = 'Someone',
  profileId,
  ...options
} = {}) {
  return showLocalNotification(
    'New follower',
    {
      ...options,
      body: `${actorName} started following you.`,
      tag: `aarush-follow-${profileId || 'general'}`,
      data: {
        type: 'follow',
        profileId,
        ...(options.data || {}),
      },
    }
  );
}

export function showStoryNotification({
  actorName = 'Someone',
  storyId,
  reply = false,
  ...options
} = {}) {
  return showLocalNotification(
    reply ? 'Story reply' : 'Story activity',
    {
      ...options,
      body: reply
        ? `${actorName} replied to your story.`
        : `${actorName} viewed your story.`,
      tag: `aarush-story-${storyId || 'general'}`,
      data: {
        type: reply ? 'story_reply' : 'story_view',
        storyId,
        ...(options.data || {}),
      },
    }
  );
}

export function showSecurityNotification({
  body = 'Review your Aarush security activity.',
  ...options
} = {}) {
  return showLocalNotification(
    'Security alert',
    {
      ...options,
      body,
      tag: 'aarush-security',
      requireInteraction: true,
      data: {
        type: 'security',
        ...(options.data || {}),
      },
    }
  );
}

export async function handleNotificationClick(
  event
) {
  const data = event?.notification?.data || {};
  const action = event?.action || '';

  if (action === 'dismiss') {
    event.notification?.close?.();
    return;
  }

  if (
    typeof clients === 'undefined' ||
    !clients.openWindow
  ) {
    return;
  }

  let target = '/notification-center';

  if (data.type === 'message' && data.conversationId) {
    target = `/chat/${data.conversationId}`;
  }

  if (data.type === 'like' && data.postId) {
    target = `/post/${data.postId}`;
  }

  if (data.type === 'comment' && data.postId) {
    target = `/post/${data.postId}`;
  }

  if (
    (data.type === 'story_view' ||
      data.type === 'story_reply') &&
    data.storyId
  ) {
    target = `/story/${data.storyId}`;
  }

  if (data.type === 'follow' && data.profileId) {
    target = `/profile/${data.profileId}`;
  }

  if (data.type === 'security') {
    target = '/security-center';
  }

  const windowClient = await clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  const existingClient = windowClient.find(
    (client) => 'focus' in client
  );

  if (existingClient) {
    await existingClient.focus();
    await existingClient.navigate(target);
    return;
  }

  await clients.openWindow(target);
}