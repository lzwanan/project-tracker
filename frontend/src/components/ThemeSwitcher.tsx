import { Popover, Button } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { useTheme, themePresets, type ThemeKey } from '@/context/ThemeContext';

export default function ThemeSwitcher() {
  const { current, setTheme } = useTheme();
  const presets = Object.values(themePresets);
  const cp = themePresets[current];

  const content = (
    <div style={{ width: 296, padding: '4px 0' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 10, paddingLeft: 4 }}>
        选择主题风格
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {presets.map((p) => {
          const [primary, bg1, bg2] = p.preview;
          const active = current === p.key;
          return (
            <button
              key={p.key}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTheme(p.key);
              }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '10px 6px 8px', borderRadius: 12,
                border: active ? `2px solid ${primary}` : '2px solid transparent',
                background: active ? `${primary}0a` : '#f9fafb',
                cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f3f4f6'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = '#f9fafb'; }}
            >
              <div style={{ display: 'flex', gap: 3 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: primary, boxShadow: `0 2px 6px ${primary}60` }} />
                <div style={{ width: 18, height: 18, borderRadius: 6, background: bg1, border: '1px solid #e5e7eb' }} />
                <div style={{ width: 18, height: 18, borderRadius: 4, background: bg2, border: '1px solid #e5e7eb' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? primary : '#374151', lineHeight: 1.2 }}>{p.name}</span>
              <span style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1 }}>{p.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight" overlayInnerStyle={{ borderRadius: 14, padding: '12px 14px' }}>
      <Button type="text" icon={<BgColorsOutlined />} style={{ fontSize: 17, color: cp.preview[0] }} />
    </Popover>
  );
}
