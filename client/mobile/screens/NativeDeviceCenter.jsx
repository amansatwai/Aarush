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

import useNativeDevice from '../hooks/useNativeDevice';
import {
  invokeBiometricModule,
  invokeCameraModule,
  invokeFileModule,
  invokeNotificationModule,
  invokeSecureModule,
} from '../utils/nativeBridgeEngine';

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>
        {label}
      </Text>
      <Text style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  title,
  description,
  onPress,
  disabled,
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

export default function NativeDeviceCenter() {
  const {
    device,
    bridge,
    loading,
    error,
    refresh,
  } = useNativeDevice();

  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const runNativeAction = async (
    action,
    message
  ) => {
    try {
      setActionError('');
      await action();
      setNotice(message);
    } catch (nativeError) {
      setActionError(
        nativeError?.message ||
          'Native module is not available.'
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
          Preparing native device information…
        </Text>
      </SafeAreaView>
    );
  }

  const info = device?.info || {};
  const battery = info.battery || {};
  const network = info.network || {};
  const storage = info.storage || {};
  const memory = info.memory || {};
  const performance = info.performance || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            Native foundation
          </Text>
          <Text style={styles.title}>
            Native Device Center
          </Text>
          <Text style={styles.subtitle}>
            React Native and Expo-compatible device
            integration foundation.
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
              ✓
            </Text>
          </View>

          <View style={styles.statusCopy}>
            <Text style={styles.cardLabel}>
              Device status
            </Text>
            <Text style={styles.statusTitle}>
              Native bridge ready
            </Text>
            <Text style={styles.cardDescription}>
              {device?.platform || Platform.OS}
              {' · '}
              {device?.model || 'Unknown device'}
            </Text>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={refresh}
          >
            <Text style={styles.primaryButtonText}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Hardware information
        </Text>

        <View style={styles.grid}>
          <MetricCard
            label="Platform"
            value={device?.platform || Platform.OS}
          />
          <MetricCard
            label="OS version"
            value={device?.os_version || 'Unknown'}
          />
          <MetricCard
            label="App version"
            value={
              info.app_version?.version || '1.0.0'
            }
          />
          <MetricCard
            label="Screen"
            value={`${info.performance?.screen?.width || 0}×${info.performance?.screen?.height || 0}`}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Battery and network
        </Text>

        <View style={styles.grid}>
          <MetricCard
            label="Battery"
            value={
              battery.level === null ||
              battery.level === undefined
                ? 'Native API ready'
                : `${Math.round(battery.level * 100)}%`
            }
          />
          <MetricCard
            label="Charging"
            value={
              battery.charging === null
                ? 'Unknown'
                : battery.charging
                  ? 'Yes'
                  : 'No'
            }
          />
          <MetricCard
            label="Network"
            value={network.type || 'Unknown'}
          />
          <MetricCard
            label="Connection"
            value={
              network.connected === null
                ? 'Native API ready'
                : network.connected
                  ? 'Online'
                  : 'Offline'
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Storage, memory, and performance
        </Text>

        <View style={styles.grid}>
          <MetricCard
            label="Storage"
            value={
              storage.free === null
                ? 'Native API ready'
                : `${storage.free} free`
            }
          />
          <MetricCard
            label="Memory"
            value={
              memory.available === null
                ? 'Native API ready'
                : `${memory.available} available`
            }
          />
          <MetricCard
            label="Frame rate"
            value={
              performance.frame_rate || 'Placeholder'
            }
          />
          <MetricCard
            label="Thermal state"
            value={
              performance.thermal_state || 'Unknown'
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Native APIs
        </Text>

        <View style={styles.card}>
          <ActionButton
            title="Test secure storage"
            description="Prepare device-specific secure storage."
            onPress={() =>
              runNativeAction(
                () =>
                  invokeSecureModule(
                    'getStatus'
                  ),
                'Secure storage module checked.'
              )
            }
          />

          <ActionButton
            title="Test biometrics"
            description="Prepare biometric authentication."
            onPress={() =>
              runNativeAction(
                () =>
                  invokeBiometricModule(
                    'getStatus'
                  ),
                'Biometric module checked.'
              )
            }
          />

          <ActionButton
            title="Test camera"
            description="Prepare native camera integration."
            onPress={() =>
              runNativeAction(
                () =>
                  invokeCameraModule(
                    'getStatus'
                  ),
                'Camera module checked.'
              )
            }
          />

          <ActionButton
            title="Test file system"
            description="Prepare native file and media access."
            onPress={() =>
              runNativeAction(
                () =>
                  invokeFileModule('getStatus'),
                'File module checked.'
              )
            }
          />

          <ActionButton
            title="Test notifications"
            description="Prepare native push notification APIs."
            onPress={() =>
              runNativeAction(
                () =>
                  invokeNotificationModule(
                    'getStatus'
                  ),
                'Notification module checked.'
              )
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Native capabilities
        </Text>

        <View style={styles.capabilityGrid}>
          {[
            'Android APIs',
            'iOS APIs',
            'Biometrics',
            'Camera',
            'Microphone',
            'Secure storage',
            'Background services',
            'Notifications',
            'Location',
            'Battery optimization',
          ].map((capability) => (
            <View
              style={styles.capability}
              key={capability}
            >
              <Text style={styles.capabilityMark}>
                ✓
              </Text>
              <Text style={styles.capabilityText}>
                {capability}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Native device APIs are represented through an
          Expo-compatible bridge. Protected actions should
          require platform permissions and native security
          checks before production use.
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

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  metricCard: {
    width: '48%',
    minHeight: 82,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 14,
    backgroundColor: 'rgba(17,22,36,0.76)',
  },

  metricLabel: {
    color: '#8491ad',
    fontSize: 11,
  },

  metricValue: {
    marginTop: 10,
    color: '#dcd5ff',
    fontSize: 14,
    fontWeight: '700',
  },

  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 18,
    backgroundColor: 'rgba(17,22,36,0.76)',
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