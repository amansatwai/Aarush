import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import useNativeBackground from '../hooks/useNativeBackground';
import {
  createNotificationChannel,
  scheduleLocalNotification,
  showSilentNotification,
} from '../utils/nativeNotificationEngine';

function ActionButton({
  title,
  description,
  onPress,
  disabled = false,
}) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.actionTitle}>
        {title}
      </Text>
      <Text style={styles.actionDescription}>
        {description}
      </Text>
    </Pressable>
  );
}

function StatusRow({ label, value }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>
        {label}
      </Text>
      <Text style={styles.statusValue}>
        {value}
      </Text>
    </View>
  );
}

export default function NativeBackgroundCenter() {
  const {
    backgroundReady,
    notificationsReady,
    pushToken,
    permissionStatus,
    backgroundRunning,
    background,
    notifications,
    loading,
    error,
    startBackground,
    stopBackground,
    runSync,
    showNotification,
    requestPermissions,
    refreshBackgroundState,
  } = useNativeBackground();

  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const run = async (action, message) => {
    try {
      setActionError('');
      await action();
      setNotice(message);
    } catch (runError) {
      setActionError(
        runError?.message ||
          'Background action failed.'
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#9d8aff"
        />
        <Text style={styles.loadingText}>
          Preparing background services…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            Native services
          </Text>

          <Text style={styles.title}>
            Native Background Center
          </Text>

          <Text style={styles.subtitle}>
            Background sync, notifications, widgets,
            shortcuts, and deep-link preparation.
          </Text>
        </View>

        {error || actionError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error || actionError}
            </Text>
          </View>
        ) : null}

        {notice ? (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              {notice}
            </Text>
          </View>
        ) : null}

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>
              {backgroundReady &&
              notificationsReady
                ? '✓'
                : '!'}
            </Text>
          </View>

          <View style={styles.statusCopy}>
            <Text style={styles.cardLabel}>
              Background status
            </Text>

            <Text style={styles.statusTitle}>
              {backgroundRunning
                ? 'Service running'
                : 'Service ready'}
            </Text>

            <Text style={styles.cardDescription}>
              {Platform.OS}
              {' · '}
              {permissionStatus}
            </Text>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              run(
                refreshBackgroundState,
                'Background state refreshed.'
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Background services
        </Text>

        <View style={styles.card}>
          <StatusRow
            label="Service"
            value={
              backgroundRunning
                ? 'Running'
                : 'Stopped'
            }
          />

          <StatusRow
            label="Native module"
            value={
              background?.native_module_ready
                ? 'Installed'
                : 'Preparation mode'
            }
          />

          <StatusRow
            label="App state"
            value={
              background?.app_state || 'Unknown'
            }
          />

          <ActionButton
            title="Start background service"
            description="Prepare Android foreground service and iOS background tasks."
            onPress={() =>
              run(
                startBackground,
                'Background service started.'
              )
            }
            disabled={backgroundRunning}
          />

          <ActionButton
            title="Stop background service"
            description="Stop scheduled native background work."
            onPress={() =>
              run(
                stopBackground,
                'Background service stopped.'
              )
            }
            disabled={!backgroundRunning}
          />

          <ActionButton
            title="Run background sync"
            description="Process sync, backup, security, and offline queue work."
            onPress={() =>
              run(
                runSync,
                'Background sync completed.'
              )
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Push notifications
        </Text>

        <View style={styles.card}>
          <StatusRow
            label="Permission"
            value={permissionStatus}
          />

          <StatusRow
            label="Push token"
            value={
              pushToken ? 'Registered' : 'Not registered'
            }
          />

          <ActionButton
            title="Request notification permission"
            description="Prepare FCM and APNs permission flow."
            onPress={() =>
              run(
                requestPermissions,
                'Notification permission checked.'
              )
            }
          />

          <ActionButton
            title="Show test notification"
            description="Display a local native notification."
            onPress={() =>
              run(
                () =>
                  showNotification({
                    title: 'Aarush test notification',
                    body: 'Native notifications are ready.',
                  }),
                'Test notification shown.'
              )
            }
          />

          <ActionButton
            title="Schedule notification"
            description="Prepare a delayed local notification."
            onPress={() =>
              run(
                () =>
                  scheduleLocalNotification({
                    title: 'Aarush reminder',
                    body: 'Scheduled notification foundation.',
                    delay: 60000,
                  }),
                'Notification scheduled.'
              )
            }
          />

          <ActionButton
            title="Create notification channel"
            description="Prepare Android notification channels and iOS groups."
            onPress={() =>
              run(
                () =>
                  createNotificationChannel({
                    id: 'aarush-security',
                    name: 'Aarush Security',
                    importance: 'high',
                  }),
                'Notification channel created.'
              )
            }
          />

          <ActionButton
            title="Test silent notification"
            description="Prepare background notification processing."
            onPress={() =>
              run(
                () =>
                  showSilentNotification({
                    event: 'background_sync',
                  }),
                'Silent notification checked.'
              )
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Widgets and deep links
        </Text>

        <View style={styles.capabilityGrid}>
          {[
            'Home screen widgets',
            'Lock screen widgets',
            'Quick stats',
            'Recent chats',
            'Security status',
            'Backup status',
            'aarush://home',
            'aarush://profile',
            'aarush://chat/:id',
            'aarush://post/:id',
            'Android App Links',
            'iOS Universal Links',
          ].map((item) => (
            <View
              style={styles.capability}
              key={item}
            >
              <Text style={styles.capabilityMark}>
                ✓
              </Text>
              <Text style={styles.capabilityText}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          Quick actions
        </Text>

        <View style={styles.card}>
          {[
            'Open Camera',
            'Open Chats',
            'Open AI Assistant',
            'Open Security Center',
            'Open Marketplace',
            'Start Live Stream',
            'Create Post',
            'Emergency Privacy',
          ].map((item) => (
            <View
              style={styles.quickAction}
              key={item}
            >
              <Text style={styles.quickMark}>
                ✓
              </Text>
              <Text style={styles.quickText}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Background services and notifications use a
          native-module bridge. Production builds should
          connect Expo or platform-specific implementations
          for permissions, tokens, scheduling, and secure
          background execution.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080b13',
  },

  content: {
    padding: 16,
    paddingBottom: 48,
  },

  header: {
    marginBottom: 16,
  },

  eyebrow: {
    color: '#8d9abb',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  title: {
    marginTop: 4,
    color: '#f4f7ff',
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 6,
    color: '#8491ad',
    fontSize: 13,
    lineHeight: 19,
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    backgroundColor: 'rgba(17,22,36,0.86)',
  },

  statusIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#765cff',
  },

  statusIconText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '800',
  },

  statusCopy: {
    flex: 1,
  },

  cardLabel: {
    color: '#8491ad',
    fontSize: 11,
  },

  statusTitle: {
    marginTop: 3,
    color: '#f4f7ff',
    fontSize: 16,
    fontWeight: '800',
  },

  cardDescription: {
    marginTop: 3,
    color: '#98a5c2',
    fontSize: 11,
  },

  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#765cff',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  sectionTitle: {
    marginTop: 22,
    marginBottom: 9,
    color: '#eaf0ff',
    fontSize: 15,
    fontWeight: '800',
  },

  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 18,
    backgroundColor: 'rgba(17,22,36,0.76)',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },

  statusLabel: {
    color: '#8491ad',
    fontSize: 12,
  },

  statusValue: {
    maxWidth: '55%',
    color: '#c9f9ff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },

  actionButton: {
    minHeight: 68,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },

  actionTitle: {
    color: '#edf2ff',
    fontSize: 13,
    fontWeight: '700',
  },

  actionDescription: {
    marginTop: 4,
    color: '#8491ad',
    fontSize: 11,
    lineHeight: 16,
  },

  disabled: {
    opacity: 0.5,
  },

  capabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  capability: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    padding: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 12,
    backgroundColor: 'rgba(17,22,36,0.72)',
  },

  capabilityMark: {
    color: '#55e6a5',
    fontSize: 13,
    fontWeight: '800',
  },

  capabilityText: {
    color: '#dce5f7',
    fontSize: 11,
  },

  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 43,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },

  quickMark: {
    color: '#9d8aff',
    fontSize: 13,
    fontWeight: '800',
  },

  quickText: {
    color: '#dce5f7',
    fontSize: 12,
  },

  errorBox: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,91,132,0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,91,132,0.1)',
  },

  errorText: {
    color: '#ffc2d0',
    fontSize: 12,
  },

  noticeBox: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(77,215,255,0.25)',
    borderRadius: 12,
    backgroundColor: 'rgba(77,215,255,0.1)',
  },

  noticeText: {
    color: '#c9f9ff',
    fontSize: 12,
  },

  loadingText: {
    marginTop: 12,
    color: '#98a5c2',
    fontSize: 13,
    textAlign: 'center',
  },

  footer: {
    marginTop: 24,
    color: '#697691',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});