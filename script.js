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

const dayIndex = new Date().getDay();

document.getElementById('daily-quote').textContent = quotes[dayIndex];
document.getElementById('principle-text').textContent = principles[dayIndex];

const now = new Date();
document.getElementById('date-display').textContent =
  now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

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

document.getElementById('streak-num').textContent = getStreak();

function toggle(el) {
  el.classList.toggle('done');
  el.classList.add('just-done');
  setTimeout(() => el.classList.remove('just-done'), 300);
  updateProgress();
  saveStreak();
}

function updateProgress() {
  const cats = {
    career:    { ids: ['c1','c2','c3','c4'],      total: 4 },
    portfolio: { ids: ['p1','p2','p3','p4'],      total: 4 },
    health:    { ids: ['h1','h2','h3','h4','h5'], total: 5 },
    study:     { ids: ['s1','s2','s3'],           total: 3 }
  };

  let totalDone = 0;
  const totalAll = 16;

  for (const [cat, cfg] of Object.entries(cats)) {
    const done = cfg.ids.filter(id =>
      document.querySelector(`[data-id="${id}"]`)?.classList.contains('done')
    ).length;
    totalDone += done;
    const pct = Math.round((done / cfg.total) * 100);
    document.getElementById(`bar-${cat}`).style.width = pct + '%';
    document.getElementById(`count-${cat}`).textContent = `${done}/${cfg.total}`;
  }

  document.getElementById('main-bar').style.width = Math.round((totalDone / totalAll) * 100) + '%';
  document.getElementById('progress-text').textContent = `${totalDone} / ${totalAll}`;
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

function resetAll() {
  if (!confirm('Reset all checkboxes for a new day?')) return;
  document.querySelectorAll('.task').forEach(t => t.classList.remove('done'));
  updateProgress();
}
