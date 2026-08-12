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

import useNativeMedia from '../hooks/useNativeMedia';

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

export default function NativeMediaCenter() {
  const {
    cameraReady,
    storageReady,
    selectedMedia,
    recording,
    camera,
    storage,
    loading,
    error,
    openCamera,
    capturePhoto,
    recordVideo,
    stopRecording,
    pickImage,
    pickVideo,
    pickDocument,
    scanQRCode,
    scanBarcode,
    refreshMedia,
  } = useNativeMedia();

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
          'Native media action failed.'
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
          Preparing native media…
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
            Native media foundation
          </Text>

          <Text style={styles.title}>
            Native Media Center
          </Text>

          <Text style={styles.subtitle}>
            Camera, gallery, file system, scanning, and
            sensor integration for Android and iOS.
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
              {cameraReady && storageReady ? '✓' : '!'}
            </Text>
          </View>

          <View style={styles.statusCopy}>
            <Text style={styles.cardLabel}>
              Media status
            </Text>

            <Text style={styles.statusTitle}>
              {cameraReady && storageReady
                ? 'Native media ready'
                : 'Preparation mode'}
            </Text>

            <Text style={styles.cardDescription}>
              {Platform.OS}
              {' · '}
              {recording ? 'Recording' : 'Idle'}
            </Text>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              run(
                refreshMedia,
                'Native media refreshed.'
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Camera and capture
        </Text>

        <View style={styles.card}>
          <ActionButton
            title="Open camera"
            description="Prepare front and rear camera capture."
            onPress={() =>
              run(
                () => openCamera(),
                'Camera prepared.'
              )
            }
          />

          <ActionButton
            title="Capture photo"
            description="Capture a high-quality local photo."
            onPress={() =>
              run(
                () => capturePhoto({
                  quality: 'high',
                }),
                'Photo capture completed.'
              )
            }
          />

          <ActionButton
            title={
              recording
                ? 'Stop recording'
                : 'Record video'
            }
            description="Prepare high-quality video recording."
            onPress={() =>
              run(
                recording
                  ? stopRecording
                  : () =>
                      recordVideo({
                        quality: 'high',
                      }),
                recording
                  ? 'Video recording stopped.'
                  : 'Video recording prepared.'
              )
            }
          />

          <ActionButton
            title="Switch camera"
            description="Prepare front and rear camera switching."
            onPress={() =>
              run(
                () => openCamera({
                  facing: 'front',
                }),
                'Camera switching prepared.'
              )
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Gallery and file system
        </Text>

        <View style={styles.card}>
          <ActionButton
            title="Pick image"
            description="Select a photo from the native gallery."
            onPress={() =>
              run(
                pickImage,
                'Image picker opened.'
              )
            }
          />

          <ActionButton
            title="Pick video"
            description="Select a video from the native gallery."
            onPress={() =>
              run(
                pickVideo,
                'Video picker opened.'
              )
            }
          />

          <ActionButton
            title="Pick document"
            description="Select a document from the native file system."
            onPress={() =>
              run(
                pickDocument,
                'Document picker opened.'
              )
            }
          />

          <ActionButton
            title="Refresh media library"
            description="Prepare local media indexing and cache refresh."
            onPress={() =>
              run(
                refreshMedia,
                'Media library refreshed.'
              )
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          QR and barcode scanning
        </Text>

        <View style={styles.card}>
          <ActionButton
            title="Scan QR code"
            description="Prepare native QR scanner integration."
            onPress={() =>
              run(
                scanQRCode,
                'QR scanner checked.'
              )
            }
          />

          <ActionButton
            title="Scan barcode"
            description="Prepare native barcode scanner integration."
            onPress={() =>
              run(
                scanBarcode,
                'Barcode scanner checked.'
              )
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Storage usage
        </Text>

        <View style={styles.grid}>
          <Metric
            label="Storage status"
            value={
              storage?.ready ? 'Ready' : 'Unknown'
            }
          />

          <Metric
            label="Cached files"
            value={String(
              storage?.cached_files || 0
            )}
          />

          <Metric
            label="Media library"
            value={
              storage?.media_library_ready
                ? 'Ready'
                : 'Prepared'
            }
          />

          <Metric
            label="Secure media"
            value={
              storage?.encrypted_files_ready
                ? 'Ready'
                : 'Prepared'
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Device sensors
        </Text>

        <View style={styles.capabilityGrid}>
          {[
            'Accelerometer',
            'Gyroscope',
            'Magnetometer',
            'Ambient light',
            'Proximity',
            'Orientation',
            'Motion detection',
            'Stabilization',
          ].map((sensor) => (
            <View
              style={styles.capability}
              key={sensor}
            >
              <Text style={styles.capabilityMark}>
                ✓
              </Text>
              <Text style={styles.capabilityText}>
                {sensor}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          Selected media
        </Text>

        <View style={styles.selectedCard}>
          <Text style={styles.selectedLabel}>
            {selectedMedia
              ? selectedMedia.type ||
                'Media selected'
              : 'No media selected'}
          </Text>

          <Text style={styles.selectedDescription}>
            {selectedMedia?.uri ||
              'Local capture and file selection are prepared for native modules.'}
          </Text>
        </View>

        <Text style={styles.footer}>
          Camera, gallery, file-system, scanner, and sensor
          actions are local-first. Cloud upload and protected
          media operations require later authorization and
          native module integration.
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

  selectedCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,0.25)',
    borderRadius: 16,
    backgroundColor: 'rgba(124,92,255,0.1)',
  },

  selectedLabel: {
    color: '#c9f9ff',
    fontSize: 13,
    fontWeight: '800',
  },

  selectedDescription: {
    marginTop: 6,
    color: '#8491ad',
    fontSize: 11,
    lineHeight: 16,
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