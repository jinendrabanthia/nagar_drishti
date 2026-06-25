import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppNavigator />
      <StatusBar style="auto" />
    </View>
  );
}
