/* ── 星座数据（中文）── */
const ZODIAC = [
  { name: '白羊座', symbol: '♈' },
  { name: '金牛座', symbol: '♉' },
  { name: '双子座', symbol: '♊' },
  { name: '巨蟹座', symbol: '♋' },
  { name: '狮子座', symbol: '♌' },
  { name: '处女座', symbol: '♍' },
  { name: '天秤座', symbol: '♎' },
  { name: '天蝎座', symbol: '♏' },
  { name: '射手座', symbol: '♐' },
  { name: '摩羯座', symbol: '♑' },
  { name: '水瓶座', symbol: '♒' },
  { name: '双鱼座', symbol: '♓' },
];

const zodiacByName = Object.fromEntries(ZODIAC.map(z => [z.name, z]));

/* ── 星空动画 ── */
(function initStars() {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.2,
      opacity: Math.random(),
      delta: (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.opacity += s.delta;
      if (s.opacity >= 1 || s.opacity <= 0) s.delta *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, s.opacity))})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ── Compteur visiteurs (décoration) ── */
(function visitorCounter() {
  const el = document.getElementById('visitor-count');
  if (!el) return;
  let n = 142;
  setInterval(() => {
    n += Math.floor(Math.random() * 3);
    el.textContent = String(n).padStart(5, '0');
  }, 8000);
})();

/* ── Throbber IE ── */
function setThrobber(loading) {
  const t = document.getElementById('ie-throbber');
  if (!t) return;
  t.classList.toggle('idle', !loading);
}

function setStatus(msg) {
  const s = document.getElementById('ie-status');
  if (s) s.textContent = msg;
}

/* ── État local ── */
let myId = null;
let myName = null;
let selectedSign = null;
let guesses = {};
let isReady = false;

/* ── Socket ── */
const socket = io();

/* ── Utils DOM ── */
const $ = id => document.getElementById(id);

function showScreen(name) {
  ['join', 'lobby', 'guess', 'reveal'].forEach(s => {
    $(`screen-${s}`).classList.toggle('hidden', s !== name);
  });
}

function showError(elId, msg) {
  const el = $(elId);
  el.textContent = '⚠️ ' + msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

function initials(name) {
  return name.slice(0, 2).toUpperCase();
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Construction du sélecteur de signe ── */
(function buildSignPicker() {
  const grid = $('sign-picker');
  ZODIAC.forEach(z => {
    const btn = document.createElement('button');
    btn.className = 'sign-btn';
    btn.dataset.sign = z.name;
    btn.type = 'button';
    btn.innerHTML = `<span class="sign-symbol">${z.symbol}</span><span class="sign-name">${z.name}</span>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sign-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSign = z.name;
      checkJoinReady();
    });
    grid.appendChild(btn);
  });
})();

function checkJoinReady() {
  $('btn-join').disabled = !($('input-name').value.trim() && selectedSign);
}

$('input-name').addEventListener('input', checkJoinReady);

$('btn-join').addEventListener('click', () => {
  const name = $('input-name').value.trim();
  if (!name || !selectedSign) return;
  myName = name;
  setThrobber(true);
  setStatus('正在连接...');
  socket.emit('join', { name, sign: selectedSign });
});

/* ── Lobby ── */
$('btn-start').addEventListener('click', () => {
  setThrobber(true);
  socket.emit('start');
});

function renderLobby(players) {
  const list = $('lobby-list');
  list.innerHTML = '';
  $('lobby-count').textContent = players.length;
  players.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="player-avatar">${initials(p.name)}</div>
      <span class="player-name">${esc(p.name)}${p.id === myId ? ' <b style="color:#000080">（您）</b>' : ''}</span>
      ${p.ready ? '<span style="color:#006600">✔ 已完成</span>' : ''}
    `;
    list.appendChild(li);
  });
}

/* ── Phase devinettes ── */
function buildGuessCards(players) {
  const container = $('guess-cards');
  container.innerHTML = '';
  guesses = {};
  isReady = false;
  $('btn-ready').disabled = false;
  $('btn-ready').textContent = '✅ 我已完成猜测！';

  players.filter(p => p.id !== myId).forEach(p => {
    const card = document.createElement('div');
    card.className = 'guess-card';
    card.id = `guess-card-${p.id}`;

    const miniGrid = ZODIAC.map(z => `
      <button class="mini-sign-btn" type="button" data-sign="${z.name}" data-target="${p.id}">
        <span class="s">${z.symbol}</span>${z.name}
      </button>
    `).join('');

    card.innerHTML = `
      <div class="guess-card-header">
        <div class="player-avatar">${initials(p.name)}</div>
        <span class="guess-card-name">${esc(p.name)}</span>
        <span class="guess-status" id="gstatus-${p.id}">❓</span>
      </div>
      <div class="mini-sign-grid">${miniGrid}</div>
    `;
    container.appendChild(card);
  });

  container.addEventListener('click', e => {
    const btn = e.target.closest('.mini-sign-btn');
    if (!btn || isReady) return;
    const targetId = btn.dataset.target;
    const sign = btn.dataset.sign;
    guesses[targetId] = sign;
    socket.emit('guess', { targetId, sign });

    container.querySelectorAll(`.mini-sign-btn[data-target="${targetId}"]`).forEach(b => {
      b.classList.toggle('selected', b.dataset.sign === sign);
    });

    const z = zodiacByName[sign];
    const statusEl = $(`gstatus-${targetId}`);
    if (statusEl && z) statusEl.textContent = z.symbol;

    const card = $(`guess-card-${targetId}`);
    if (card) card.classList.add('guessed');
  });
}

function updateReadyBar(players) {
  const ready = players.filter(p => p.ready).length;
  const total = players.length;
  const pct = total ? (ready / total) * 100 : 0;
  $('ready-fill').style.width = pct + '%';
  $('ready-label').textContent = `${ready} / ${total} 已完成`;
}

$('btn-ready').addEventListener('click', () => {
  socket.emit('ready');
  isReady = true;
  $('btn-ready').disabled = true;
  $('btn-ready').textContent = '⏳ 等待其他玩家...';
  setStatus('等待其他玩家...');
});

$('btn-force-reveal').addEventListener('click', () => {
  setThrobber(true);
  socket.emit('forceReveal');
});

/* ── Révélation ── */
function renderReveal(data) {
  const container = $('reveal-cards');
  container.innerHTML = '';

  data.forEach((entry, i) => {
    const z = zodiacByName[entry.sign] || { symbol: '?', name: entry.sign };
    const card = document.createElement('div');
    card.className = 'reveal-card';
    card.style.animationDelay = `${i * 0.1}s`;

    const correctCount = entry.guessers.filter(g => g.correct).length;
    const total = entry.guessers.length;

    const chips = entry.guessers.map(g => {
      if (!g.guess) return `<span class="guess-chip no-guess">😶 ${esc(g.name)} — 未猜测</span>`;
      const gz = zodiacByName[g.guess] || { symbol: '?' };
      const cls = g.correct ? 'correct' : 'wrong';
      const icon = g.correct ? '✅' : '❌';
      return `<span class="guess-chip ${cls}">${icon} ${esc(g.name)} → ${gz.symbol} ${esc(g.guess)}</span>`;
    }).join('');

    card.innerHTML = `
      <div class="reveal-card-header">
        <div class="reveal-sign-bubble">
          <span class="big">${z.symbol}</span>
          <span>${z.name}</span>
        </div>
        <div>
          <div class="reveal-name">${esc(entry.name)}</div>
          <div class="reveal-score">${correctCount} / ${total} 个正确答案</div>
        </div>
      </div>
      <div class="guesses-list">${chips || '<span style="color:#808080;font-size:10px">没有其他玩家</span>'}</div>
    `;
    container.appendChild(card);
  });

  renderPodium(data);
  setThrobber(false);
  setStatus('完成');
}

function renderPodium(data) {
  const scores = data.map(p => ({ name: p.name, score: p.myScore, id: p.id }));
  scores.sort((a, b) => b.score - a.score);
  const medals = ['🥇', '🥈', '🥉'];
  const total = data.length - 1;

  const items = scores.map((s, i) => {
    const medal = medals[i] || `${i + 1}.`;
    const you = s.id === myId ? ' <b style="color:#000080">（您）</b>' : '';
    return `
      <li class="podium-entry">
        <span class="podium-rank">${medal}</span>
        <span class="podium-name">${esc(s.name)}${you}</span>
        <span class="podium-points">${s.score} / ${total} ⭐</span>
      </li>
    `;
  }).join('');

  $('podium').innerHTML = `
    <div class="podium-titlebar">🏆 排行榜 — 谁猜得最准？</div>
    <div class="podium-body">
      <ul class="podium-list">${items}</ul>
    </div>
  `;
}

$('btn-reset').addEventListener('click', () => socket.emit('reset'));

/* ── Événements Socket ── */
socket.on('connect', () => {
  myId = socket.id;
  setStatus('已连接');
});

socket.on('state', ({ phase, players }) => {
  if (!myName) return;
  const me = players.find(p => p.id === myId);
  if (!me) return;

  if (phase === 'lobby') {
    showScreen('lobby');
    renderLobby(players);
    setThrobber(false);
    setStatus('等待玩家加入...');
  } else if (phase === 'guessing') {
    const onGuessScreen = !$('screen-guess').classList.contains('hidden');
    if (!onGuessScreen) {
      showScreen('guess');
      buildGuessCards(players);
      setThrobber(false);
      setStatus('游戏进行中...');
    }
    updateReadyBar(players);
    renderLobby(players); // mise à jour statut prêt dans lobby (caché mais cohérent)
  }
});

socket.on('reveal', data => {
  showScreen('reveal');
  renderReveal(data);
});

socket.on('reset', () => {
  myName = null;
  selectedSign = null;
  guesses = {};
  isReady = false;
  $('input-name').value = '';
  document.querySelectorAll('.sign-btn').forEach(b => b.classList.remove('selected'));
  $('btn-join').disabled = true;
  $('join-error').classList.add('hidden');
  setThrobber(false);
  setStatus('完成');
  showScreen('join');
});

socket.on('err', msg => {
  setThrobber(false);
  setStatus('错误');
  if (!$('screen-join').classList.contains('hidden')) showError('join-error', msg);
  else if (!$('screen-lobby').classList.contains('hidden')) showError('lobby-error', msg);
  else alert(msg);
});

socket.on('disconnect', () => setStatus('连接已断开'));
