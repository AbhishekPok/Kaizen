// ── TASK MAP ──────────────────────────────────────────────────────────────
const TASK_MAP = {
  c1: 'Study 1 AWS / cloud concept (30 min)',
  c2: 'Read 1 DevOps article or documentation',
  c3: 'Hands-on lab — spin up something new',
  c4: 'Watch 1 DevOps deep-dive video or talk',
  p1: 'Read 1 system design concept',
  p2: 'Draw / diagram 1 architecture',
  p3: 'Work on portfolio section',
  p4: 'Push at least 1 commit to GitHub',
  h1: 'Morning — wake before 7:00 AM',
  h2: 'Exercise — walk / workout (20+ min)',
  h3: 'No phone for first 30 min after waking',
  h4: 'Drink 8 glasses of water',
  h5: 'Sleep before midnight',
  s1: 'Study 1 chapter / topic from syllabus',
  s2: 'Solve past questions or practice problems',
  s3: 'Review & summarise notes from today'
};

const CATS = {
  career:    { ids: ['c1','c2','c3','c4'],      total: 4 },
  portfolio: { ids: ['p1','p2','p3','p4'],      total: 4 },
  health:    { ids: ['h1','h2','h3','h4','h5'], total: 5 },
  study:     { ids: ['s1','s2','s3'],           total: 3 }
};
const TOTAL_ALL = 16;

// ── QUOTES / PRINCIPLES ───────────────────────────────────────────────────
const quotes = [
  "一日一善 — One good deed each day",
  "七転び八起き — Fall seven times, rise eight",
  "継続は力なり — Continuity is power",
  "小さな一歩が大きな変化を生む — Small steps create great change",
  "今日の自分は昨日の自分より優れている — Be better than yesterday",
  "努力は必ず報われる — Effort is always rewarded",
  "始めることが半分終わること — Starting is half done"
];

const principles = [
  "Improve by 1% every day. Not 100% once. 1% daily.",
  "Remove waste. Every action should move you forward.",
  "Standardize what works. Make good habits automatic.",
  "Reflect daily. No growth without honest review.",
  "Focus on process, not outcome. Results follow discipline.",
  "Eliminate the unnecessary. Simplicity is mastery.",
  "Small discomfort today prevents large regret tomorrow."
];

// ── INIT ──────────────────────────────────────────────────────────────────
const dayIndex = new Date().getDay();
document.getElementById('daily-quote').textContent = quotes[dayIndex];
document.getElementById('principle-text').textContent = principles[dayIndex];

const now = new Date();
document.getElementById('date-display').textContent =
  now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

document.getElementById('streak-num').textContent = getStreak();
updateLogCount();

// ── STREAK ────────────────────────────────────────────────────────────────
function getStreak() {
  try {
    const s = localStorage.getItem('kaizen_streak');
    const d = localStorage.getItem('kaizen_last_date');
    const today = new Date().toDateString();
    if (!s) return 0;
    if (d === today) return parseInt(s);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d === yesterday.toDateString()) return parseInt(s);
    return 0;
  } catch (e) { return 0; }
}

function saveStreak() {
  try {
    const done = document.querySelectorAll('.task.done').length;
    if (done >= 9) {
      const today = new Date().toDateString();
      const cur = getStreak();
      const last = localStorage.getItem('kaizen_last_date');
      if (last !== today) {
        localStorage.setItem('kaizen_streak', cur + 1);
        localStorage.setItem('kaizen_last_date', today);
        document.getElementById('streak-num').textContent = cur + 1;
      }
    }
  } catch (e) {}
}

// ── TOGGLE ────────────────────────────────────────────────────────────────
function toggle(el) {
  el.classList.toggle('done');
  el.classList.add('just-done');
  setTimeout(() => el.classList.remove('just-done'), 300);
  updateProgress();
  saveStreak();
}

// ── PROGRESS ──────────────────────────────────────────────────────────────
function updateProgress() {
  let totalDone = 0;
  for (const [cat, cfg] of Object.entries(CATS)) {
    const done = cfg.ids.filter(id =>
      document.querySelector(`[data-id="${id}"]`)?.classList.contains('done')
    ).length;
    totalDone += done;
    document.getElementById(`bar-${cat}`).style.width = Math.round((done / cfg.total) * 100) + '%';
    document.getElementById(`count-${cat}`).textContent = `${done}/${cfg.total}`;
  }
  document.getElementById('main-bar').style.width = Math.round((totalDone / TOTAL_ALL) * 100) + '%';
  document.getElementById('progress-text').textContent = `${totalDone} / ${TOTAL_ALL}`;
}

// ── LOG STORAGE ───────────────────────────────────────────────────────────
function getLog() {
  try {
    return JSON.parse(localStorage.getItem('kaizen_log') || '[]');
  } catch (e) { return []; }
}

function saveLog(log) {
  localStorage.setItem('kaizen_log', JSON.stringify(log));
}

function updateLogCount() {
  const el = document.getElementById('log-count');
  if (el) el.textContent = getLog().length;
}

// ── SAVE TODAY → LOG + EXPORT CSV ────────────────────────────────────────
function saveRecordAndExport() {
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const log = getLog();

  // Build today's record
  const record = { date: dateStr, tasks: {}, totals: {} };
  let totalDone = 0;

  for (const [cat, cfg] of Object.entries(CATS)) {
    let catDone = 0;
    cfg.ids.forEach(id => {
      const done = document.querySelector(`[data-id="${id}"]`)?.classList.contains('done') ? 1 : 0;
      record.tasks[id] = done;
      if (done) catDone++;
    });
    record.totals[cat] = `${catDone}/${cfg.total}`;
    totalDone += catDone;
  }
  record.overall = `${totalDone}/${TOTAL_ALL}`;
  record.streak  = getStreak();

  // Upsert — replace today if already exists
  const idx = log.findIndex(r => r.date === dateStr);
  if (idx >= 0) log[idx] = record; else log.push(record);
  log.sort((a, b) => a.date.localeCompare(b.date));
  saveLog(log);
  updateLogCount();

  // Build CSV
  const taskIds = Object.keys(TASK_MAP);
  const header = [
    'Date',
    ...taskIds.map(id => `"${TASK_MAP[id]}"`),
    'DevOps (4)', 'Portfolio (4)', 'Health (5)', 'Study (3)',
    'Overall (16)', 'Streak'
  ].join(',');

  const rows = log.map(r => {
    const cells = [
      r.date,
      ...taskIds.map(id => r.tasks[id] ?? 0),
      r.totals.career    ?? '',
      r.totals.portfolio ?? '',
      r.totals.health    ?? '',
      r.totals.study     ?? '',
      r.overall ?? '',
      r.streak  ?? ''
    ];
    return cells.join(',');
  });

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `kaizen-log-${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── VIEW LOG TABLE ────────────────────────────────────────────────────────
function viewLog() {
  const log  = getLog();
  const wrap = document.getElementById('log-table-wrap');
  const inner = document.getElementById('log-table-inner');

  if (!log.length) {
    inner.innerHTML = '<p style="color:var(--text-dim);font-size:11px;padding:12px 0">// no records yet — complete tasks and export first</p>';
    wrap.style.display = 'block';
    return;
  }

  const taskIds = Object.keys(TASK_MAP);

  // Summary table
  let html = '<div style="overflow-x:auto"><table class="log-tbl">';
  html += '<thead><tr><th>Date</th><th>DevOps</th><th>Portfolio</th><th>Health</th><th>Study</th><th>Overall</th><th>Streak</th></tr></thead><tbody>';

  [...log].reverse().forEach(r => {
    const pct = parseInt(r.overall) / TOTAL_ALL * 100;
    const color = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';
    html += `<tr>
      <td style="color:var(--green-dim)">${r.date}</td>
      <td>${r.totals.career    ?? '-'}</td>
      <td style="color:var(--blue)">${r.totals.portfolio ?? '-'}</td>
      <td style="color:var(--red)">${r.totals.health    ?? '-'}</td>
      <td style="color:var(--amber)">${r.totals.study     ?? '-'}</td>
      <td style="color:${color};font-weight:700">${r.overall ?? '-'}</td>
      <td style="color:var(--green)">${r.streak ?? '-'} 🔥</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  inner.innerHTML = html;
  wrap.style.display = 'block';
}

// ── RESET ─────────────────────────────────────────────────────────────────
function resetAll() {
  if (!confirm('Save today\'s record and reset for a new day?')) return;
  // Auto-save before reset
  saveRecordAndExport();
  setTimeout(() => {
    document.querySelectorAll('.task').forEach(t => t.classList.remove('done'));
    updateProgress();
  }, 300);
}
