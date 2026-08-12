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

import useNativePerformance from '../hooks/useNativePerformance';

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

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>
        {label}
      </Text>
      <Text style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

export default function NativeDeploymentCenter() {
  const {
    performanceReady,
    deploymentReady,
    performanceMetrics,
    currentVersion,
    updateAvailable,
    performance,
    deployment,
    loading,
    error,
    optimizeMemory,
    optimizeCache,
    optimizeStartup,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    refreshPerformance,
  } = useNativePerformance();

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
          'Deployment action failed.'
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
          Preparing native deployment…
        </Text>
      </SafeAreaView>
    );
  }

  const memory = performanceMetrics?.memory || {};
  const battery = performanceMetrics?.battery || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            Native production
          </Text>

          <Text style={styles.title}>
            Native Deployment Center
          </Text>

          <Text style={styles.subtitle}>
            Performance, offline readiness, updates,
            diagnostics, and release preparation.
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
              {performanceReady &&
              deploymentReady
                ? '✓'
                : '!'}
            </Text>
          </View>

          <View style={styles.statusCopy}>
            <Text style={styles.cardLabel}>
              Production status
            </Text>

            <Text style={styles.statusTitle}>
              {performanceReady &&
              deploymentReady
                ? 'Native foundation ready'
                : 'Preparation mode'}
            </Text>

            <Text style={styles.cardDescription}>
              {Platform.OS}
              {' · '}
              v{currentVersion}
              {' · '}
              {deployment?.channel || 'Development'}
            </Text>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              run(
                refreshPerformance,
                'Native performance refreshed.'
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Performance metrics
        </Text>

        <View style={styles.grid}>
          <Metric
            label="Memory"
            value={
              memory.used === null ||
              memory.used === undefined
                ? 'Native API ready'
                : String(memory.used)
            }
          />

          <Metric
            label="CPU"
            value={
              performanceMetrics?.cpu?.usage ??
              'Placeholder'
            }
          />

          <Metric
            label="Battery impact"
            value={
              battery.impact || 'Unknown'
            }
          />

          <Metric
            label="Frame rate"
            value={
              performanceMetrics?.frame_rate ||
              'Placeholder'
            }
          />

          <Metric
            label="Startup time"
            value={
              performanceMetrics?.startup_time ||
              'Placeholder'
            }
          />

          <Metric
            label="Storage"
            value={
              performanceMetrics?.storage_usage ||
              'Native API ready'
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Performance optimization
        </Text>

        <View style={styles.card}>
          <ActionButton
            title="Optimize memory"
            description="Prepare native memory cleanup and pressure handling."
            onPress={() =>
              run(
                optimizeMemory,
                'Memory optimization completed.'
              )
            }
          />

          <ActionButton
            title="Optimize cache"
            description="Prepare media and application cache optimization."
            onPress={() =>
              run(
                optimizeCache,
                'Cache optimization completed.'
              )
            }
          />

          <ActionButton
            title="Optimize startup"
            description="Prepare startup and initialization optimization."
            onPress={() =>
              run(
                optimizeStartup,
                'Startup optimization completed.'
              )
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          App updates
        </Text>

        <View style={styles.card}>
          <ActionButton
            title="Check for updates"
            description="Check Expo OTA and store update providers."
            onPress={() =>
              run(
                checkForUpdates,
                updateAvailable
                  ? 'Update information refreshed.'
                  : 'No update is currently available.'
              )
            }
          />

          <ActionButton
            title="Download update"
            description="Prepare an available OTA or store update."
            onPress={() =>
              run(
                downloadUpdate,
                'Update download prepared.'
              )
            }
            disabled={!updateAvailable}
          />

          <ActionButton
            title="Install update"
            description="Prepare safe installation and rollback support."
            onPress={() =>
              run(
                installUpdate,
                'Update installation prepared.'
              )
            }
            disabled={!updateAvailable}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Release channels
        </Text>

        <View style={styles.capabilityGrid}>
          {[
            'Development',
            'Internal',
            'Alpha',
            'Beta',
            'Release Candidate',
            'Production',
          ].map((channel) => (
            <View
              style={styles.capability}
              key={channel}
            >
              <Text style={styles.capabilityMark}>
                ✓
              </Text>
              <Text style={styles.capabilityText}>
                {channel}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          Offline synchronization
        </Text>

        <View style={styles.card}>
          {[
            'Offline posts',
            'Offline stories',
            'Offline chats',
            'Offline uploads',
            'Background synchronization',
            'Retry queue',
            'Conflict handling',
            'Encrypted offline data',
          ].map((item) => (
            <View
              style={styles.actionScope}
              key={item}
            >
              <Text style={styles.scopeMark}>
                ✓
              </Text>
              <Text style={styles.scopeText}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          Crash monitoring and diagnostics
        </Text>

        <View style={styles.grid}>
          <Metric
            label="Native crashes"
            value={
              deployment?.crashes?.native_crashes ??
              0
            }
          />

          <Metric
            label="JavaScript crashes"
            value={
              deployment?.crashes?.javascript_crashes ??
              0
            }
          />

          <Metric
            label="ANR"
            value={
              deployment?.crashes?.anr_placeholder ??
              'Placeholder'
            }
          />

          <Metric
            label="Performance anomalies"
            value={
              deployment?.crashes
                ?.performance_anomalies ??
              0
            }
          />
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={() =>
            run(
              refreshPerformance,
              'Diagnostics refreshed.'
            )
          }
        >
          <Text style={styles.refreshText}>
            Refresh diagnostics
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          OTA updates, store releases, crash reporting,
          background execution, and performance metrics
          require the appropriate Expo or native modules
          before production deployment.
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

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  metric: {
    width: '48%',
    minHeight: 78,
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
    color: '#c9f9ff',
    fontSize: 14,
    fontWeight: '700',
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

  actionScope: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 43,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },

  scopeMark: {
    color: '#9d8aff',
    fontSize: 13,
    fontWeight: '800',
  },

  scopeText: {
    color: '#dce5f7',
    fontSize: 12,
  },

  refreshButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: '#765cff',
  },

  refreshText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
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