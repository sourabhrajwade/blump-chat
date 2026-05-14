import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../theme';
import { useAppTheme } from '../state/ThemeContext';
import { BentoGrid } from '../components/molecules/BentoGrid';
import { EmailCaptureSection } from '../components/molecules/EmailCaptureSection';
import { HeroBlock } from '../components/molecules/HeroBlock';
import { LandingFooter } from '../components/molecules/LandingFooter';
import { StatsBand } from '../components/molecules/StatsBand';
import { TopNavBar } from '../components/molecules/TopNavBar';

export function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { theme } = useAppTheme();
  const topPad = insets.top + spacing.navHeight + spacing.stackLg;

  return (
    <>
      <StatusBar style={theme.id === 'dark' ? 'light' : 'dark'} />
      <TopNavBar />
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: insets.bottom + spacing.stackLg }]}
        showsVerticalScrollIndicator={false}
      >
        <HeroBlock />
        <BentoGrid isWide={isWide} />
        <StatsBand />
        <EmailCaptureSection />
        <LandingFooter />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
});
