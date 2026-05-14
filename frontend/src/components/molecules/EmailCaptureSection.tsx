import { useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { ctaBarShadow } from '../../styles/layout';
import { useAppTheme } from '../../state/ThemeContext';
import { AppButton } from '../atoms/AppButton';
import { ThemedText } from '../atoms/ThemedText';

export function EmailCaptureSection() {
  const [email, setEmail] = useState('');
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <ThemedText variant="headlineLg" center style={{ marginBottom: spacing.stackSm }}>
        Ready to enhance your focus?
      </ThemedText>
      <ThemedText variant="bodyMd" center style={{ marginBottom: spacing.stackLg, maxWidth: 520, alignSelf: 'center' }}>
        Join 10,000+ professionals who have transformed their digital workflow with our intelligent partner.
      </ThemedText>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.surfaceContainerHigh,
          },
          ctaBarShadow,
        ]}
      >
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your work email"
          placeholderTextColor={colors.onSurfaceVariant}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { color: colors.onBackground, fontFamily: theme.fonts.sansRegular }]}
        />
        <AppButton
          variant="primary"
          label="Get Access"
          compact
          textVariant="labelMd"
          containerStyle={{ flexShrink: 0 }}
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.unit * 14,
    alignItems: 'center',
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 448,
    borderRadius: radius.full,
    borderWidth: 1,
    padding: spacing.unit * 2,
    gap: spacing.stackSm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.unit * 4,
    fontSize: 16,
    lineHeight: 22,
  },
});
