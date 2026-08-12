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

import useNativeSecurity from '../hooks/useNativeSecurity';

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

export default function NativeSecurityCenter() {
  const {
    biometricAvailable,
    biometricType,
    authenticated,
    secureStorageReady,
    biometric,
    storage,
    loading,
    error,
    authenticate,
    authenticateSensitive,
    authenticatePayments,
    authenticateForSecurityCenter,
    authenticateForPrivacyCenter,
    authenticateForBackupRestore,
    saveSecure,
    readSecure,
    clearSecureStorage,
    refreshNativeSecurity,
  } = useNativeSecurity();

  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [storedValue, setStoredValue] =
    useState(null);

  const run = async (action, message) => {
    try {
      setActionError('');
      const result = await action();

      if (result?.authenticated === false) {
        setActionError(
          'Native authentication was not completed.'
        );
        return result;
      }

      setNotice(message);
      return result;
    } catch (runError) {
      setActionError(
        runError?.message ||
          'Native security action failed.'
      );
      return null;
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
          Preparing native security…
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
            Native protection
          </Text>
          <Text style={styles.title}>
            Native Security Center
          </Text>
          <Text style={styles.subtitle}>
            Biometrics, secure storage, and protected
            native actions for Android and iOS.
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
              {biometricAvailable ? '✓' : '!'}
            </Text>
          </View>

          <View style={styles.statusCopy}>
            <Text style={styles.cardLabel}>
              Native security status
            </Text>
            <Text style={styles.statusTitle}>
              {biometricAvailable
                ? 'Biometric ready'
                : 'PIN fallback ready'}
            </Text>
            <Text style={styles.cardDescription}>
              {biometricType}
              {' · '}
              {Platform.OS}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Biometric authentication
        </Text>

        <View style={styles.card}>
          <StatusRow
            label="Biometric availability"
            value={
              biometricAvailable
                ? 'Available'
                : 'Fallback'
            }
          />

          <StatusRow
            label="Biometric type"
            value={biometricType}
          />

          <StatusRow
            label="Authenticated"
            value={
              authenticated ? 'Yes' : 'No'
            }
          />

          <ActionButton
            title="Test biometrics"
            description="Authenticate using Face ID, Touch ID, fingerprint, or device PIN."
            onPress={() =>
              run(
                () =>
                  authenticate(
                    'Verify your Aarush identity'
                  ),
                'Native authentication completed.'
              )
            }
          />

          <ActionButton
            title="Verify sensitive action"
            description="Prepare step-up authentication for protected actions."
            onPress={() =>
              run(
                () =>
                  authenticateSensitive(
                    'performing a sensitive action'
                  ),
                'Sensitive action verified.'
              )
            }
          />

          <ActionButton
            title="Verify payment"
            description="Protect wallet and payment approvals."
            onPress={() =>
              run(
                authenticatePayments,
                'Payment verification completed.'
              )
            }
          />

          <ActionButton
            title="Verify Security Center"
            description="Require biometric or PIN verification before security controls."
            onPress={() =>
              run(
                authenticateForSecurityCenter,
                'Security Center verified.'
              )
            }
          />

          <ActionButton
            title="Verify Privacy Center"
            description="Protect sensitive privacy and account settings."
            onPress={() =>
              run(
                authenticateForPrivacyCenter,
                'Privacy Center verified.'
              )
            }
          />

          <ActionButton
            title="Verify backup restore"
            description="Protect encrypted backup restoration."
            onPress={() =>
              run(
                authenticateForBackupRestore,
                'Backup restore verified.'
              )
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Secure storage
        </Text>

        <View style={styles.card}>
          <StatusRow
            label="Storage status"
            value={
              secureStorageReady
                ? 'Ready'
                : 'Unavailable'
            }
          />

          <StatusRow
            label="Backend"
            value={
              storage?.backend ||
              'Secure storage preparation'
            }
          />

          <StatusRow
            label="Native module"
            value={
              storage?.native_module_ready
                ? 'Installed'
                : 'Preparation mode'
            }
          />

          <ActionButton
            title="Test secure storage"
            description="Store and read a protected test value."
            onPress={() =>
              run(async () => {
                await saveSecure(
                  'native_security_test',
                  {
                    created_at:
                      new Date().toISOString(),
                  }
                );

                const value = await readSecure(
                  'native_security_test'
                );

                setStoredValue(value);
                return {
                  authenticated: true,
                };
              }, 'Secure storage test completed.')
            }
          />

          <ActionButton
            title="Clear secure storage"
            description="Remove local secure values from this device."
            onPress={() =>
              run(
                clearSecureStorage,
                'Secure storage cleared.'
              )
            }
          />

          {storedValue ? (
            <Text style={styles.storedText}>
              Secure test value verified locally.
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>
          Push and background security
        </Text>

        <View style={styles.capabilityGrid}>
          {[
            'Notification permissions',
            'Secure notification delivery',
            'Silent notifications',
            'Background sync',
            'Offline queue processing',
            'Backup synchronization',
            'Security monitoring',
            'Foreground services',
            'iOS background fetch',
            'Encrypted notifications',
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
          Sensitive action protection
        </Text>

        <View style={styles.card}>
          {[
            'Account deletion',
            'Password and email changes',
            'Encryption key access',
            'Wallet access',
            'Payment approval',
            'Backup restore',
            'Device trust changes',
            'Zero Trust operations',
            'Recovery operations',
            'Enterprise actions',
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

        <Pressable
          style={styles.refreshButton}
          onPress={() =>
            run(
              refreshNativeSecurity,
              'Native security refreshed.'
            )
          }
        >
          <Text style={styles.refreshText}>
            Refresh security
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          Native biometric and secure-storage behavior
          requires the corresponding Expo or native
          modules in production. Fallback mode must not be
          used for production secrets.
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

  storedText: {
    padding: 14,
    color: '#55e6a5',
    fontSize: 11,
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