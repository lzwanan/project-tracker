import { useEffect, useState, useMemo } from 'react';
import { Card, Button, Space, Tag, Typography, Segmented, Popover, Badge, Empty } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { dashboardApi, type DashboardEvent } from '@/services/dashboard';
import { personnelApi } from '@/services/personnel';
import { useAuth, guestProps } from '@/context/AuthContext';

dayjs.extend(isoWeek);

const { Text } = Typography;

const TYPE_LABELS: Record<string, string> = { version: '版本', oncall: 'Oncall', initiative: '专项' };

export default function DashboardPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [personnelNames, setPersonnelNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(['version', 'oncall', 'initiative', 'milestone']));
  const { isGuest } = useAuth();

  const toggleType = (key: string) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (e.subtype === 'milestone') return visibleTypes.has('milestone');
      if (e.type === 'version') return visibleTypes.has('version');
      if (e.type === 'oncall') return visibleTypes.has('oncall');
      if (e.type === 'initiative') return visibleTypes.has('initiative');
      return true;
    });
  }, [events, visibleTypes]);

  const year = currentDate.year();
  const month = currentDate.month() + 1;

  useEffect(() => {
    setLoading(true);
    dashboardApi.events(year).then((res: any) => setEvents(res.data || [])).finally(() => setLoading(false));
  }, [year]);

  useEffect(() => {
    personnelApi.all().then((res: any) => {
      const map: Record<number, string> = {};
      (res.data || []).forEach((p: any) => { map[p.id] = p.name; });
      setPersonnelNames(map);
    });
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, DashboardEvent[]> = {};
    filteredEvents.forEach((e) => {
      if (!e.startDate) return;
      const start = dayjs(e.startDate);
      const end = e.endDate ? dayjs(e.endDate) : start;
      let d = start;
      while (d.isBefore(end.add(1, 'day'))) {
        const key = d.format('YYYY-MM-DD');
        if (!map[key]) map[key] = [];
        map[key].push(e);
        d = d.add(1, 'day');
      }
    });
    return map;
  }, [filteredEvents]);

  const goToday = () => { setCurrentDate(dayjs()); };
  const goPrev = () => { setCurrentDate(currentDate.subtract(1, viewMode === 'year' ? 'year' : 'month')); };
  const goNext = () => { setCurrentDate(currentDate.add(1, viewMode === 'year' ? 'year' : 'month')); };

  /* ---- Year View ---- */
  const yearView = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const m = dayjs().year(year).month(i).startOf('month');
        const monthPrefix = String(year) + '-' + String(i + 1).padStart(2, '0');
        const monthEvents = filteredEvents.filter((e) => e.startDate?.startsWith(monthPrefix));
        const smallDots = monthEvents.slice(0, 6);
        return (
          <div key={i} onClick={() => { setCurrentDate(dayjs().year(year).month(i)); setViewMode('month'); }}
            style={{ padding: '14px 16px', borderRadius: 14, border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.15s',
              background: i + 1 === month && viewMode === 'year' ? '#f0f4ff' : '#fff',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = i + 1 === month ? '#f0f4ff' : '#fff'; }}>
            <Text style={{ fontSize: 13, fontWeight: 700, color: i + 1 === month ? '#2563eb' : '#94a3b8' }}>{i + 1}月</Text>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              {smallDots.map((e, j) => (
                <div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: e.color }} />
              ))}
              {monthEvents.length > 0 && <Text style={{ fontSize: 11, color: '#94a3b8' }}>{monthEvents.length}项</Text>}
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ---- Month View ---- */
  const monthStart = currentDate.startOf('month');
  const monthEnd = currentDate.endOf('month');
  const startDay = monthStart.isoWeekday();
  const daysInMonth = monthEnd.date();
  const totalCells = startDay + daysInMonth - 1;
  const rows = Math.ceil((totalCells + 1) / 7);

  const monthView = (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
          <Text key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '4px 0' }}>{d}</Text>
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: row > 0 ? '1px solid #f1f5f9' : 'none' }}>
          {Array.from({ length: 7 }, (_, col) => {
            const dayNum = row * 7 + col - startDay + 2;
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
            const date = isCurrentMonth ? monthStart.date(dayNum) : null;
            const dateKey = date?.format('YYYY-MM-DD') || '';
            const dayEvents = dateKey ? (eventsByDate[dateKey] || []) : [];
            const isToday = date?.isSame(dayjs(), 'day');
            return (
              <div key={col} style={{
                minHeight: 82, padding: '3px 4px', borderRight: col < 6 ? '1px solid #f1f5f9' : 'none',
                background: !isCurrentMonth ? '#fafafa' : isToday ? '#f0f4ff' : '#fff',
                cursor: isCurrentMonth ? 'pointer' : 'default',
              }}>
                {isCurrentMonth && (
                  <>
                    <Text style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? '#2563eb' : '#64748b' }}>{dayNum}</Text>
                    <div style={{ marginTop: 2 }}>
                      {dayEvents.slice(0, 3).map((e, i) => (
                        <div key={i} onClick={(ev) => { ev.stopPropagation(); navigate(e.link); }}
                          style={{ fontSize: 10, fontWeight: 600, padding: '0 4px', borderRadius: 3, marginBottom: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer', background: e.color + '20', color: e.color }}>
                          {e.type === 'oncall' ? (personnelNames[Number(e.owner)] || e.title) : e.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <Text style={{ fontSize: 9, color: '#94a3b8' }}>+{dayEvents.length - 3}</Text>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  /* ---- Legend ---- */
  const types = [
    { key: 'version', color: '#3b82f6', label: '版本' },
    { key: 'oncall', color: '#10b981', label: 'Oncall' },
    { key: 'initiative', color: '#7c3aed', label: '专项' },
    { key: 'milestone', color: '#f59e0b', label: '里程碑' },
  ];

  const legend = (
    <Space size={8} style={{ marginLeft: 12 }}>
      {types.map((t) => {
        const active = visibleTypes.has(t.key);
        return (
          <div key={t.key} onClick={() => toggleType(t.key)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 8, transition: 'all 0.15s', opacity: active ? 1 : 0.35 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ width: 10, height: 10, borderRadius: active ? 3 : '50%', background: t.color, transition: 'all 0.15s' }} />
            <Text style={{ fontSize: 11, color: active ? '#374151' : '#94a3b8', fontWeight: active ? 600 : 400 }}>{t.label}</Text>
          </div>
        );
      })}
    </Space>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '20px 24px' } }}
        title={
          <Space size={12}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>项目看板</span>
            <Segmented size="small" value={viewMode} onChange={(v) => setViewMode(v as 'month' | 'year')}
              options={[{ value: 'month', label: '月' }, { value: 'year', label: '年' }]} />
          </Space>
        }
        extra={
          <Space>
            {legend}
            <Button size="small" onClick={goPrev} icon={<LeftOutlined />} style={{ borderRadius: 8 }} {...guestProps(isGuest)} />
            <Text strong style={{ fontSize: 15, minWidth: 100, textAlign: 'center', fontFamily: 'Consolas,monospace' }}>
              {viewMode === 'year' ? `${year} 年` : currentDate.format('YYYY 年 M 月')}
            </Text>
            <Button size="small" onClick={goNext} icon={<RightOutlined />} style={{ borderRadius: 8 }} {...guestProps(isGuest)} />
            <Button size="small" onClick={goToday} style={{ borderRadius: 8 }} {...guestProps(isGuest)}>今天</Button>
          </Space>
        }>
        {viewMode === 'year' ? yearView : monthView}
      </Card>
    </motion.div>
  );
}
