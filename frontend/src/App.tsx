import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ConfigProviderProps } from 'antd/es/config-provider';
import { ThemeProvider, useTheme, themePresets } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import './styles/global.css';
import './pages/personnel';
import './pages/role';
import './pages/oncall';
import './pages/version-track';
import './pages/initiative-track';
import './pages/dashboard';
import './pages/system';
import './pages/system/access-log-index';
import { createRouter } from './router';
import { useMemo, useState, useEffect } from 'react';

function ThemedApp() {
  const { current } = useTheme();
  const preset = themePresets[current];
  const [router] = useState(() => createRouter());

  useEffect(() => {
    document.body.setAttribute('data-theme', current);
    return () => { document.body.removeAttribute('data-theme'); };
  }, [current]);

  const configProps: ConfigProviderProps = useMemo(
    () => ({ theme: preset.config, ...(preset.components ? { components: preset.components } : {}) }),
    [current],
  );

  return (
    <ConfigProvider locale={zhCN} {...configProps}>
      <AntApp>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
