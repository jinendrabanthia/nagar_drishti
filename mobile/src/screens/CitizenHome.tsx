import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, Platform, Image } from 'react-native';
import { MapPin, Plus, AlertTriangle, Droplets, Trash2, Clock, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

// Mock Data based on our Supabase seed
const mockIssues = [
  {
    id: '1',
    category: 'Infrastructure',
    severity: 4,
    summary: 'Large pothole causing traffic slowdown.',
    status: 'open',
    distance: '0.2 miles away',
    icon: AlertTriangle,
    color: '#0ea5e9'
  },
  {
    id: '2',
    category: 'Waste Management',
    severity: 3,
    summary: 'Garbage bin overflowing near AG Square.',
    status: 'in_progress',
    distance: '0.5 miles away',
    icon: Trash2,
    color: '#D97706'
  },
  {
    id: '3',
    category: 'Water Supply',
    severity: 5,
    summary: 'Major pipe burst flooding the road.',
    status: 'open',
    distance: '1.1 miles away',
    icon: Droplets,
    color: '#C2410C'
  }
];

export default function CitizenHome({ navigation }: any) {
  const renderIssueCard = (issue: any) => {
    const Icon = issue.icon;
    return (
      <View key={issue.id} style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.iconContainer, { backgroundColor: issue.color + '15' }]}>
              <Icon size={16} color={issue.color} />
            </View>
            <Text style={styles.categoryText}>{issue.category}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: issue.severity >= 4 ? theme.colors.error + '15' : theme.colors.warning + '15' }]}>
            <Text style={[styles.severityText, { color: issue.severity >= 4 ? theme.colors.error : theme.colors.warning }]}>
              Sev {issue.severity}/5
            </Text>
          </View>
        </View>
        <Text style={styles.summaryText} numberOfLines={2}>{issue.summary}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.statusBadge}>
            {issue.status === 'open' ? (
              <Clock size={12} color={theme.colors.info} />
            ) : (
              <CheckCircle2 size={12} color={theme.colors.success} />
            )}
            <Text style={[styles.statusText, { color: issue.status === 'open' ? theme.colors.info : theme.colors.success }]}>
              {issue.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.distanceText}>{issue.distance}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Nagar Drishti</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={theme.colors.primary} />
              <Text style={styles.headerSubtitle}>Bhubaneswar</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: 'https://ui-avatars.com/api/?name=Ramesh+Kumar&background=0D8ABC&color=fff' }} style={styles.profileImg} />
        </TouchableOpacity>
      </View>

      {/* Map View Placeholder */}
      <View style={styles.mapContainer}>
        {/* Replace with actual MapView */}
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color={theme.colors.primary} opacity={0.5} />
          <Text style={styles.mapPlaceholderText}>Live City Map</Text>
          <Text style={styles.mapPlaceholderSub}>3 active issues in your vicinity</Text>
        </View>
      </View>

      {/* Feed */}
      <View style={styles.feedContainer}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Local Reports</Text>
          <TouchableOpacity>
            <Text style={styles.feedAction}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {mockIssues.map(renderIssueCard)}
        </ScrollView>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Report')}
      >
        <Plus size={32} color={theme.colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.lg + 10 : 10,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 24,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  mapPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  mapPlaceholderSub: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },
  feedContainer: {
    height: 250,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    marginTop: -20,
    paddingTop: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  feedTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  feedAction: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
  },
  cardContainer: {
    width: width * 0.75,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  distanceText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 270,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
