import { useAuth } from '@/store/auth-context';
import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Settings() {
  const [preferences, setPreferences] = useState([]);
  const [error, setError] = useState('');
  const { authenticatedRequest, signOut } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const json = await authenticatedRequest('/settings');
        setPreferences(json.preferences || []);
      } catch (err) {
        setError('Unable to load your settings.');
      }
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>
            Configure your learning experience and app preferences.
          </Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {preferences.map((item) => (
            <View key={item.key} style={styles.preferenceRow}>
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>{item.title}</Text>
                <Text style={styles.preferenceSubtitle}>{item.description}</Text>
              </View>
              <Text style={styles.preferenceValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.preferenceRow} activeOpacity={0.8}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Privacy</Text>
              <Text style={styles.preferenceSubtitle}>Manage data and app permissions.</Text>
            </View>
            <Text style={styles.preferenceValue}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.preferenceRow} activeOpacity={0.8}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>App version</Text>
              <Text style={styles.preferenceSubtitle}>Current release details.</Text>
            </View>
            <Text style={styles.preferenceValue}>1.0.0</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} activeOpacity={0.8} onPress={signOut} accessibilityRole="button">
          <Text style={styles.signOutButtonText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  pageSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#58616E',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  preferenceText: {
    flex: 1,
    paddingRight: 10,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  preferenceSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  preferenceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    marginTop: 12,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  error: {
    color: '#B42318',
    marginBottom: 12,
  },
});