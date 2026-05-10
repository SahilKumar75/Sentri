import { useEffect, useState } from 'react';

const HOME_TAB = ['home'];

export function useMountedTabs(activeTab) {
  const [mountedTabs, setMountedTabs] = useState(HOME_TAB);

  useEffect(() => {
    setMountedTabs((current) => (current.includes(activeTab) ? current : [...current, activeTab]));
  }, [activeTab]);

  return mountedTabs;
}
