const { useState, useMemo, useCallback } = React;
const {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine, Area, AreaChart,
  BarChart, Bar, Legend
} = Recharts;

// ─── Habit Data ───────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'health',
    name: 'Health',
    color: '#00B894',
    habits: [
      { id: 'water', name: 'Water (64oz+)', goal: 30 },
      { id: 'exercise', name: 'Exercise', goal: 30 },
      { id: 'sleep', name: 'Sleep (7h+)', goal: 30 },
      { id: 'eating', name: 'Healthy Eating', goal: 30 },
      { id: 'no-alcohol', name: 'No Alcohol', goal: 30 },
    ],
  },
  {
    id: 'growth',
    name: 'Personal Growth',
    color: '#FFD700',
    habits: [
      { id: 'read', name: 'Read (30min+)', goal: 30 },
      { id: 'journal', name: 'Journal / Reflect', goal: 30 },
      { id: 'meditate', name: 'Meditate', goal: 30 },
      { id: 'learn', name: 'Learn Something New', goal: 30 },
    ],
  },
  {
    id: 'business',
    name: 'Content & Business',
    color: '#E94560',
    habits: [
      { id: 'prospect', name: 'Prospecting / Outreach', goal: 30 },
      { id: 'youtube', name: 'YouTube Script / Record', goal: 30 },
      { id: 'linkedin', name: 'Post on LinkedIn', goal: 30 },
      { id: 'skool', name: 'Engage Skool', goal: 30 },
      { id: 'financials', name: 'Review Financials', goal: 4 },
    ],
  },
];

const ALL_HABITS = CATEGORIES.flatMap(c =>
  c.habits.map(h => ({ ...h, categoryId: c.id, categoryColor: c.color, categoryName: c.name }))
);

// ─── Helpers ──────────────────────────────────────────────────
function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthName(month) {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][month];
}

function checkKey(habitId, day) {
  return `${habitId}-${day}`;
}

// ─── Header ───────────────────────────────────────────────────
function Header({ month, year, setMonth, setYear, overallPct }) {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const years = [2025, 2026, 2027];

  const pieData = [
    { name: 'Done', value: overallPct },
    { name: 'Left', value: 100 - overallPct },
  ];

  return (
    <div style={{ background: '#1A1F35', borderRadius: 16, padding: '24px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>Daily Disciplines</h1>
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Track your habits. Build your future.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          style={{ background: '#252B45', color: '#E2E8F0', border: '1px solid #374151', borderRadius: 8, padding: '8px 12px', fontSize: 14, cursor: 'pointer', outline: 'none' }}
        >
          {months.map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ background: '#252B45', color: '#E2E8F0', border: '1px solid #374151', borderRadius: 8, padding: '8px 12px', fontSize: 14, cursor: 'pointer', outline: 'none' }}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={38} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              <Cell fill="#3B82F6" />
              <Cell fill="#252B45" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#3B82F6' }}>{overallPct}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Cards ──────────────────────────────────────────
function DashboardCards({ totalDone, totalPossible, bestStreak, todayScore, todayTotal }) {
  const cards = [
    {
      title: 'Monthly Progress',
      value: `${totalDone} / ${totalPossible}`,
      sub: `${totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0}% complete`,
      color: '#3B82F6',
      icon: '📊',
    },
    {
      title: 'Best Streak',
      value: bestStreak.count > 0 ? `${bestStreak.count} days` : '—',
      sub: bestStreak.count > 0 ? bestStreak.habit : 'No streaks yet',
      color: '#00B894',
      icon: '🔥',
    },
    {
      title: "Today's Score",
      value: `${todayScore} / ${todayTotal}`,
      sub: `${todayTotal > 0 ? Math.round((todayScore / todayTotal) * 100) : 0}%`,
      color: '#FFD700',
      icon: '⭐',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
      {cards.map(card => (
        <div key={card.title} style={{ background: '#1A1F35', borderRadius: 12, padding: '20px 24px', borderLeft: `4px solid ${card.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
            <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>{card.title}</span>
            <span style={{ fontSize: 20 }}>{card.icon}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>{card.value}</div>
          <div style={{ color: '#94A3B8', fontSize: 12 }}>{card.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Daily Chart ──────────────────────────────────────────────
function DailyChart({ dailyData }) {
  return (
    <div style={{ background: '#1A1F35', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 }}>Daily Completion Rate</h2>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={dailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#252B45" />
          <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: '#1A1F35', border: '1px solid #252B45', borderRadius: 8, color: '#E2E8F0' }}
            labelFormatter={v => `Day ${v}`}
            formatter={v => [`${v}%`, 'Completion']}
          />
          <ReferenceLine y={80} stroke="#FFD700" strokeDasharray="5 5" label={{ value: '80% goal', fill: '#FFD700', fontSize: 11, position: 'right' }} />
          <Area type="monotone" dataKey="pct" stroke="#3B82F6" strokeWidth={2} fill="url(#colorPct)" dot={{ fill: '#3B82F6', r: 3 }} activeDot={{ r: 5, fill: '#3B82F6' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Habit Grid ───────────────────────────────────────────────
function HabitGrid({ checks, toggleCheck, collapsed, toggleCollapse, daysInMonth, habitStats }) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div style={{ background: '#1A1F35', borderRadius: 12, padding: 24, marginBottom: 24, overflowX: 'auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 }}>Habit Grid</h2>
      <div style={{ minWidth: daysInMonth * 36 + 380 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, minHeight: 24 }}>
          <div style={{ width: 180, minWidth: 180, position: 'sticky', left: 0, background: '#1A1F35', zIndex: 10, paddingRight: 8, display: 'flex', alignItems: 'center', alignSelf: 'stretch', boxShadow: '-24px 0 0 0 #1A1F35' }}>
            <span style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>HABIT</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {days.map(d => (
              <div key={d} style={{ width: 32, textAlign: 'center', color: '#94A3B8', fontSize: 11, fontWeight: 500 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 12, minWidth: 180 }}>
            <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, width: 60, textAlign: 'center' }}>PROGRESS</span>
            <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, width: 40, textAlign: 'center' }}>%</span>
            <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, width: 36, textAlign: 'center' }}>LEFT</span>
          </div>
        </div>

        {CATEGORIES.map(cat => {
          const isCollapsed = collapsed.has(cat.id);
          return (
            <div key={cat.id}>
              {/* Category header */}
              <div
                onClick={() => toggleCollapse(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', minHeight: 36, cursor: 'pointer',
                  borderBottom: `2px solid ${cat.color}20`, marginBottom: 2, userSelect: 'none',
                }}
              >
                <div style={{ width: 180, minWidth: 180, position: 'sticky', left: 0, background: '#1A1F35', zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'stretch', boxShadow: '-24px 0 0 0 #1A1F35' }}>
                  <span style={{ color: cat.color, fontSize: 10, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 200ms', display: 'inline-block' }}>▼</span>
                  <span style={{ color: cat.color, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{cat.name}</span>
                </div>
              </div>

              {/* Habit rows */}
              {!isCollapsed && cat.habits.map(habit => {
                const stats = habitStats[habit.id] || { done: 0, pct: 0, remaining: 0, streak: 0 };
                return (
                  <div
                    key={habit.id}
                    className="habit-row"
                    style={{
                      display: 'flex', alignItems: 'center', minHeight: 36,
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#252B4540'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 180, minWidth: 180, position: 'sticky', left: 0, background: '#1A1F35', zIndex: 10, paddingRight: 8, display: 'flex', alignItems: 'center', alignSelf: 'stretch', boxShadow: '-24px 0 0 0 #1A1F35' }}>
                      <span style={{ color: '#E2E8F0', fontSize: 13 }}>{habit.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {days.map(d => {
                        const key = checkKey(habit.id, d);
                        const checked = !!checks[key];
                        return (
                          <div
                            key={d}
                            onClick={() => toggleCheck(key)}
                            style={{
                              width: 32, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', borderRadius: 4,
                              background: checked ? `${cat.color}25` : '#252B45',
                              boxShadow: `inset 0 0 0 1px ${checked ? cat.color : '#374151'}`,
                              transition: 'all 150ms',
                            }}
                          >
                            {checked && <span style={{ color: cat.color, fontSize: 14, fontWeight: 700 }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginLeft: 12, alignItems: 'center', minWidth: 180 }}>
                      <div style={{ width: 60, height: 8, background: '#252B45', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4, background: cat.color,
                          width: `${stats.pct}%`, transition: 'width 300ms ease',
                        }} />
                      </div>
                      <span style={{ color: '#E2E8F0', fontSize: 12, fontWeight: 600, width: 40, textAlign: 'center' }}>{stats.pct}%</span>
                      <span style={{ color: '#94A3B8', fontSize: 11, width: 36, textAlign: 'center' }}>{stats.remaining}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Weekly Summary ───────────────────────────────────────────
function WeeklySummary({ weeklyData }) {
  return (
    <div style={{ background: '#1A1F35', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 }}>Weekly Summary</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252B45" />
          <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: '#1A1F35', border: '1px solid #252B45', borderRadius: 8, color: '#E2E8F0' }}
            formatter={v => [`${v}%`, 'Avg Completion']}
          />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
            {weeklyData.map((entry, idx) => (
              <Cell key={idx} fill={entry.pct >= 80 ? '#00B894' : entry.pct >= 50 ? '#FFD700' : '#E94560'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────
function Leaderboard({ habitStats }) {
  const sorted = ALL_HABITS
    .map(h => ({ ...h, ...(habitStats[h.id] || { done: 0, pct: 0 }) }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div style={{ background: '#1A1F35', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 }}>Leaderboard</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.map((h, idx) => (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: idx < 3 ? '#252B4540' : 'transparent' }}>
            <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, width: 24 }}>#{idx + 1}</span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: h.categoryColor, flexShrink: 0 }} />
            <span style={{ color: '#E2E8F0', fontSize: 13, flex: 1 }}>{h.name}</span>
            <div style={{ width: 80, height: 6, background: '#252B45', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: h.categoryColor, width: `${h.pct}%`, transition: 'width 300ms ease' }} />
            </div>
            <span style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, width: 40, textAlign: 'right' }}>{h.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notes ────────────────────────────────────────────────────
function Notes({ notes, setNotes }) {
  return (
    <div style={{ background: '#1A1F35', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 }}>Weekly Reflections</h2>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="What went well this week? What can you improve?"
        style={{
          width: '100%', minHeight: 120, background: '#252B45', color: '#E2E8F0', border: '1px solid #374151',
          borderRadius: 8, padding: 16, fontSize: 14, lineHeight: 1.6, resize: 'vertical', outline: 'none',
          fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderColor = '#3B82F6'}
        onBlur={e => e.target.style.borderColor = '#374151'}
      />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────
function App() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [checks, setChecks] = useState({});
  const [collapsed, setCollapsed] = useState(new Set());
  const [notes, setNotes] = useState('');

  const daysInMonth = useMemo(() => getDaysInMonth(month, year), [month, year]);

  const handleMonthChange = useCallback((m) => {
    setMonth(m);
    setChecks({});
    setNotes('');
  }, []);

  const handleYearChange = useCallback((y) => {
    setYear(y);
    setChecks({});
    setNotes('');
  }, []);

  const toggleCheck = useCallback((key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleCollapse = useCallback((catId) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  // ── Per-habit stats ──
  const habitStats = useMemo(() => {
    const stats = {};
    ALL_HABITS.forEach(h => {
      let done = 0;
      let streak = 0;
      let maxStreak = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        if (checks[checkKey(h.id, d)]) {
          done++;
          streak++;
          if (streak > maxStreak) maxStreak = streak;
        } else {
          streak = 0;
        }
      }
      const goal = h.goal <= daysInMonth ? h.goal : daysInMonth;
      const pct = goal > 0 ? Math.round((done / goal) * 100) : 0;
      const remaining = Math.max(0, goal - done);
      stats[h.id] = { done, pct: Math.min(pct, 100), remaining, streak: maxStreak, goal };
    });
    return stats;
  }, [checks, daysInMonth]);

  // ── Daily stats ──
  const dailyData = useMemo(() => {
    const data = [];
    for (let d = 1; d <= daysInMonth; d++) {
      let count = 0;
      ALL_HABITS.forEach(h => {
        if (checks[checkKey(h.id, d)]) count++;
      });
      const hasSome = count > 0;
      data.push({ day: d, pct: hasSome ? Math.round((count / ALL_HABITS.length) * 100) : 0, count });
    }
    return data;
  }, [checks, daysInMonth]);

  // ── Global stats ──
  const { totalDone, totalPossible, overallPct, bestStreak, todayScore, todayTotal } = useMemo(() => {
    let totalDone = 0;
    let totalPossible = 0;
    let bestStreak = { habit: '', count: 0 };

    ALL_HABITS.forEach(h => {
      const s = habitStats[h.id];
      totalDone += s.done;
      totalPossible += s.goal;
      if (s.streak > bestStreak.count) {
        bestStreak = { habit: h.name, count: s.streak };
      }
    });

    const today = now.getDate();
    let todayScore = 0;
    ALL_HABITS.forEach(h => {
      if (checks[checkKey(h.id, today)]) todayScore++;
    });

    return {
      totalDone,
      totalPossible,
      overallPct: totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0,
      bestStreak,
      todayScore,
      todayTotal: ALL_HABITS.length,
    };
  }, [habitStats, checks]);

  // ── Weekly summaries ──
  const weeklyData = useMemo(() => {
    const weeks = [];
    let weekNum = 1;
    for (let start = 1; start <= daysInMonth; start += 7) {
      const end = Math.min(start + 6, daysInMonth);
      let done = 0;
      let possible = 0;
      for (let d = start; d <= end; d++) {
        ALL_HABITS.forEach(h => {
          possible++;
          if (checks[checkKey(h.id, d)]) done++;
        });
      }
      weeks.push({
        week: `Wk ${weekNum}`,
        pct: possible > 0 ? Math.round((done / possible) * 100) : 0,
        days: `${start}-${end}`,
      });
      weekNum++;
    }
    return weeks;
  }, [checks, daysInMonth]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Header month={month} year={year} setMonth={handleMonthChange} setYear={handleYearChange} overallPct={overallPct} />
      <DashboardCards totalDone={totalDone} totalPossible={totalPossible} bestStreak={bestStreak} todayScore={todayScore} todayTotal={todayTotal} />
      <DailyChart dailyData={dailyData} />
      <HabitGrid checks={checks} toggleCheck={toggleCheck} collapsed={collapsed} toggleCollapse={toggleCollapse} daysInMonth={daysInMonth} habitStats={habitStats} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <WeeklySummary weeklyData={weeklyData} />
        <Notes notes={notes} setNotes={setNotes} />
      </div>
      <Leaderboard habitStats={habitStats} />
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 12 }}>
        Daily Disciplines — Built for consistency, not perfection.
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
