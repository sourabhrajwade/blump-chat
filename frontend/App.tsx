import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { ClimateCrisis_400Regular } from '@expo-google-fonts/climate-crisis';

import { AppRoot } from './src/common/components/AppRoot';
import { ChatScreen } from './src/screens/ChatScreen';
import { LandingScreen } from './src/screens/LandingScreen';
import { ThreadsHomeScreen } from './src/screens/ThreadsHomeScreen';
import { useAppNavigation } from './src/state/NavigationContext';
import { lightTheme } from './src/theme';

function AppShell() {
  const { route } = useAppNavigation();
  switch (route.name) {
    case 'landing':
      return <LandingScreen />;
    case 'threads':
      return <ThreadsHomeScreen />;
    case 'chat':
      return <ChatScreen chatId={route.chatId} threadTitle={route.threadTitle} />;
  }
}

export default function App() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    BebasNeue_400Regular,
    ClimateCrisis_400Regular,
  });

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: lightTheme.colors.background,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AppRoot>
      <AppShell />
    </AppRoot>
  );
}
