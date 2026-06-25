import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { ShieldCheck, ArrowRight, LayoutDashboard, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../theme';

export default function OfficialDashboard() {
  const stats = [
    { label: 'Open Issues', count: '14', icon: AlertCircle, color: theme.colors.error },
    { label: 'In Progress', count: '5', icon: LayoutDashboard, color: theme.colors.warning },
    { label: 'Resolved Today', count: '8', icon: CheckCircle2, color: theme.colors.success },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.iconBox}>
            <ShieldCheck size={24} color={theme.colors.surface} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Command Center</Text>
            <Text style={styles.headerSubtitle}>Inspector Das (Central)</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsContainer}>
          {stats.map((stat, idx) => (
            <View key={idx} style={[styles.statCard, { borderTopColor: stat.color }]}>
              <stat.icon size={24} color={stat.color} style={{ marginBottom: 8 }} />
              <Text style={styles.statCount}>{stat.count}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Urgent Escalations</Text>
        </View>

        <View style={styles.urgentCard}>
          <View style={styles.urgentHeader}>
            <Text style={styles.urgentTag}>SEV 5</Text>
            <Text style={styles.urgentTime}>10m ago</Text>
          </View>
          <Text style={styles.urgentTitle}>Major pipe burst flooding the road</Text>
          <Text style={styles.urgentDesc}>Water Supply • Secretariat, PIN 751001</Text>
          <View style={styles.urgentFooter}>
            <Text style={styles.dispatchText}>Dispatch Crew</Text>
            <ArrowRight size={16} color={theme.colors.error} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.lg + 10 : 10,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F766E', // civic-teal
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    padding: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderTopWidth: 4,
    ...theme.shadows.sm,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  urgentCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  urgentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentTag: {
    backgroundColor: '#DC2626',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '800',
  },
  urgentTime: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  urgentTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: '#7F1D1D',
    marginBottom: 4,
  },
  urgentDesc: {
    fontSize: theme.typography.sizes.sm,
    color: '#991B1B',
    marginBottom: 16,
  },
  urgentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dispatchText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.error,
  }
});
