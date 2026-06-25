import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform } from 'react-native';
import { User, Settings, ShieldAlert, LogOut, FileText, Bell } from 'lucide-react-native';
import { theme } from '../theme';

export default function Profile({ navigation }: any) {
  const menuItems = [
    { icon: FileText, label: 'My Reports', count: '3' },
    { icon: ShieldAlert, label: 'Emergency Contacts', count: '' },
    { icon: Bell, label: 'Notifications', count: '2' },
    { icon: Settings, label: 'Account Settings', count: '' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=Ramesh+Kumar&background=0D8ABC&color=fff&size=128' }} 
            style={styles.avatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Ramesh Kumar</Text>
            <Text style={styles.aadhar}>Aadhar: XXXX XXXX 1234</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Verified Citizen</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconBox}>
                  <item.icon size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              {item.count ? (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{item.count}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.lg + 10 : 10,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: theme.spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  aadhar: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
    textTransform: 'uppercase',
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  badgeCount: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeCountText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  logoutText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.error,
  }
});
