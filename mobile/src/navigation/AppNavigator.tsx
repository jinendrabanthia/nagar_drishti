import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Camera, User, ShieldAlert } from 'lucide-react-native';

// Screens
import CitizenHome from '../screens/CitizenHome';
import ReportWizard from '../screens/ReportWizard';
import Profile from '../screens/Profile';
import OfficialDashboard from '../screens/OfficialDashboard';

import { theme } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CitizenTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Report') return <Camera color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
          if (route.name === 'Official') return <ShieldAlert color={color} size={size} />;
          return null;
        }
      })}
    >
      <Tab.Screen name="Home" component={CitizenHome} />
      <Tab.Screen name="Report" component={ReportWizard} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Official" component={OfficialDashboard} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={CitizenTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
