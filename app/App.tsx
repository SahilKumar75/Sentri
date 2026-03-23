import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { AvatarButton, CapsuleTabBar, DrawerSheet } from './src/components/sentri-ui';
import { theme, type TabKey } from './src/design/tokens';
import CalorieScreen from './src/screens/CalorieScreen';
import HangoutScreen from './src/screens/HangoutScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyspaceScreen from './src/screens/MyspaceScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.shell}>
        <View style={styles.topChrome}>
          <AvatarButton label="SK" onPress={() => setDrawerOpen(true)} />
        </View>

        <View style={styles.screenWrap}>{renderActiveScreen(activeTab)}</View>

        <CapsuleTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSentriPress={() => {
            // Reserved for the future assistant surface.
          }}
        />
      </View>

      <DrawerSheet visible={drawerOpen} onClose={() => setDrawerOpen(false)} userName="Sahil Kumar" />
    </SafeAreaView>
  );
}

function renderActiveScreen(activeTab: TabKey) {
  switch (activeTab) {
    case 'home':
      return <HomeScreen />;
    case 'myspace':
      return <MyspaceScreen />;
    case 'calorie':
      return <CalorieScreen />;
    case 'hangout':
      return <HangoutScreen />;
    default:
      return <HomeScreen />;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  shell: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topChrome: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    alignItems: 'flex-start',
  },
  screenWrap: {
    flex: 1,
  },
});
