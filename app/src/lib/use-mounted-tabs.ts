import { useEffect, useState } from 'react';
import type { TabKey } from '../design/tokens';

const HOME_TAB: TabKey[] = ['home'];

export function useMountedTabs(activeTab: TabKey) {
  const [mountedTabs, setMountedTabs] = useState<TabKey[]>(HOME_TAB);

  useEffect(() => {
    setMountedTabs((current) => (current.includes(activeTab) ? current : [...current, activeTab]));
  }, [activeTab]);

  return mountedTabs;
}
