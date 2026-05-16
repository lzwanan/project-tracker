import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { theme as antTheme, type ThemeConfig } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = antTheme;

export type ThemeKey = 'default' | 'dark' | 'mui' | 'cute' | 'illustration' | 'minimal' | 'vibrant' | 'ocean' | 'nature';

export interface ThemePreset {
  key: ThemeKey;
  name: string;
  description: string;
  preview: string[];
  config: ThemeConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, any>;
}

/* ============ 通用样式常量 ============ */
const ILLUSTRATION_BORDER = '3px solid #2C2C2C';
const ILLUSTRATION_SHADOW = '5px 5px 0 #2C2C2C';
const ILLUSTRATION_SHADOW_SM = '3px 3px 0 #2C2C2C';
const ILLUSTRATION_BG = '#FFF9F0';

const CUTE_BG = '#FFF5F7';
const CUTE_SHADOW = '0 4px 20px rgba(236,72,153,0.12)';
const CUTE_BORDER = '2px solid #f9a8d4';

export const themePresets: Record<ThemeKey, ThemePreset> = {
  /* ========== 默认 ========== */
  default: {
    key: 'default', name: '默认', description: '清爽专业',
    preview: ['#2563eb', '#ffffff', '#f8fafc'],
    config: { algorithm: defaultAlgorithm, token: { colorPrimary: '#2563eb', borderRadius: 10 } },
  },

  /* ========== 暗黑 ========== */
  dark: {
    key: 'dark', name: '暗黑', description: '深邃沉浸',
    preview: ['#3b82f6', '#111827', '#1f2937'],
    config: { algorithm: darkAlgorithm, token: { colorPrimary: '#3b82f6', borderRadius: 10 } },
  },

  /* ========== MUI ========== */
  mui: {
    key: 'mui', name: 'MUI', description: '锐利硬朗',
    preview: ['#1976d2', '#fff', '#f5f5f5'],
    config: { algorithm: defaultAlgorithm, token: { colorPrimary: '#1976d2', borderRadius: 4, fontSize: 14 } },
  },

  /* ========== 可爱 ========== */
  cute: {
    key: 'cute', name: '可爱', description: '圆润柔和',
    preview: ['#ec4899', '#fdf2f8', '#fce7f3'],
    config: {
      algorithm: defaultAlgorithm,
      token: {
        colorPrimary: '#ec4899',
        borderRadius: 20,
        borderRadiusLG: 24,
        borderRadiusSM: 14,
        colorBorder: '#f9a8d4',
        colorBorderSecondary: '#fce7f3',
        colorBgBase: '#FFF5F7',
        colorBgContainer: '#ffffff',
        colorBgLayout: '#FFF5F7',
        fontSize: 15,
        fontWeightStrong: 700,
        controlHeight: 42,
        controlHeightLG: 50,
        controlHeightSM: 34,
        padding: 20,
        paddingLG: 28,
        paddingSM: 14,
      },
    },
    components: {
      Card: { style: { borderRadius: 24, boxShadow: CUTE_SHADOW, border: CUTE_BORDER } },
      Button: { style: { borderRadius: 24, fontWeight: 700 } },
      Input: { style: { borderRadius: 16, borderColor: '#f9a8d4' } },
      Select: { style: { borderRadius: 16 } },
      Tag: { style: { borderRadius: 20, fontWeight: 500 } },
      Modal: { style: { borderRadius: 28 } },
      Table: { style: { borderRadius: 24 } },
    },
  },

  /* ========== 插画 ========== */
  illustration: {
    key: 'illustration', name: '插画', description: '漫画风格',
    preview: ['#52C41A', '#FFF9F0', '#FFF3E0'],
    config: {
      algorithm: defaultAlgorithm,
      token: {
        colorText: '#2C2C2C',
        colorPrimary: '#52C41A',
        colorSuccess: '#51CF66',
        colorWarning: '#FFD93D',
        colorError: '#FA5252',
        colorInfo: '#4DABF7',
        colorBorder: '#2C2C2C',
        colorBorderSecondary: '#2C2C2C',
        lineWidth: 3,
        lineWidthBold: 3,
        borderRadius: 12,
        borderRadiusLG: 16,
        borderRadiusSM: 8,
        controlHeight: 40,
        controlHeightSM: 34,
        controlHeightLG: 50,
        fontSize: 15,
        fontWeightStrong: 700,
        colorBgBase: ILLUSTRATION_BG,
        colorBgContainer: '#FFFFFF',
        colorBgLayout: ILLUSTRATION_BG,
        padding: 16,
        paddingLG: 24,
        paddingSM: 12,
      },
    },
    components: {
      Card: {
        style: { border: ILLUSTRATION_BORDER, boxShadow: ILLUSTRATION_SHADOW, borderRadius: 16 },
      },
      Button: {
        style: {
          border: ILLUSTRATION_BORDER,
          boxShadow: ILLUSTRATION_SHADOW_SM,
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
          borderRadius: 12,
        },
      },
      Input: {
        style: { border: ILLUSTRATION_BORDER, boxShadow: 'none', borderRadius: 12 },
      },
      Select: {
        style: { border: ILLUSTRATION_BORDER, borderRadius: 12 },
      },
      Modal: {
        style: { border: ILLUSTRATION_BORDER, boxShadow: ILLUSTRATION_SHADOW, borderRadius: 20 },
      },
      Table: {
        style: { border: ILLUSTRATION_BORDER, borderRadius: 16 },
      },
      Tag: {
        style: {
          border: '2px solid #2C2C2C',
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          fontSize: 11,
        },
      },
      Progress: {
        style: { borderRadius: 8 },
      },
    },
  },

  /* ========== 极简 ========== */
  minimal: {
    key: 'minimal', name: '极简', description: '留白克制',
    preview: ['#374151', '#fff', '#fafafa'],
    config: { algorithm: defaultAlgorithm, token: { colorPrimary: '#374151', borderRadius: 6, fontSize: 13, colorBgLayout: '#fafafa' } },
  },

  /* ========== 活力 ========== */
  vibrant: {
    key: 'vibrant', name: '活力', description: '大胆跳跃',
    preview: ['#f43f5e', '#fff1f2', '#ffe4e6'],
    config: { algorithm: defaultAlgorithm, token: { colorPrimary: '#f43f5e', borderRadius: 12, colorSuccess: '#10b981', colorWarning: '#f59e0b', colorError: '#ef4444' } },
  },

  /* ========== 海洋 ========== */
  ocean: {
    key: 'ocean', name: '海洋', description: '清凉冷静',
    preview: ['#0891b2', '#ecfeff', '#cffafe'],
    config: { algorithm: defaultAlgorithm, token: { colorPrimary: '#0891b2', borderRadius: 10, colorBgLayout: '#f0f9ff' } },
  },

  /* ========== 自然 ========== */
  nature: {
    key: 'nature', name: '自然', description: '绿色舒适',
    preview: ['#16a34a', '#f0fdf4', '#dcfce7'],
    config: { algorithm: defaultAlgorithm, token: { colorPrimary: '#16a34a', borderRadius: 8, colorBgLayout: '#f7fee7' } },
  },
};

/* ========== Context ========== */
interface ThemeContextType {
  current: ThemeKey;
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function loadKey(): ThemeKey {
  try {
    const s = localStorage.getItem('tracker-theme-key');
    if (s && s in themePresets) return s as ThemeKey;
  } catch {}
  return 'default';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ThemeKey>(loadKey);

  const setTheme = useCallback((key: ThemeKey) => {
    setCurrent(key);
    localStorage.setItem('tracker-theme-key', key);
  }, []);

  return (
    <ThemeContext.Provider value={{ current, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
