/* ============================================================
   SIGNS DATA
============================================================ */
const SIGNS = [
  { name: 'Bélier',      symbol: '♈', color: '#ff6b6b', dates: '21 mars – 19 avr' },
  { name: 'Taureau',     symbol: '♉', color: '#ffd93d', dates: '20 avr – 20 mai' },
  { name: 'Gémeaux',     symbol: '♊', color: '#fff07c', dates: '21 mai – 20 juin' },
  { name: 'Cancer',      symbol: '♋', color: '#74b9ff', dates: '21 juin – 22 juil' },
  { name: 'Lion',        symbol: '♌', color: '#fdcb6e', dates: '23 juil – 22 aoû' },
  { name: 'Vierge',      symbol: '♍', color: '#55efc4', dates: '23 aoû – 22 sep' },
  { name: 'Balance',     symbol: '♎', color: '#fd79a8', dates: '23 sep – 22 oct' },
  { name: 'Scorpion',    symbol: '♏', color: '#a29bfe', dates: '23 oct – 21 nov' },
  { name: 'Sagittaire',  symbol: '♐', color: '#e17055', dates: '22 nov – 21 déc' },
  { name: 'Capricorne',  symbol: '♑', color: '#81ecec', dates: '22 déc – 19 jan' },
  { name: 'Verseau',     symbol: '♒', color: '#b48cff', dates: '20 jan – 18 fév' },
  { name: 'Poissons',    symbol: '♓', color: '#0984e3', dates: '19 fév – 20 mar' },
];

/* ============================================================
   DATABASE (localStorage)
============================================================ */
const DB = {
  getParticipants() {
    return JSON.parse(localStorage.getItem('astro_participants') || '[]');
  },
  addParticipant(p) {
    const list = this.getParticipants();
    list.push(p);
    localStorage.setItem('astro_participants', JSON.stringify(list));
  },
  getGuesses() {
    return JSON.parse(localStorage.getItem('astro_guesses') || '[]');
  },
  addGuess(g) {
    const list = this.getGuesses();
    list.push(g);
    localStorage.setItem('astro_guesses', JSON.stringify(list));
  },
  hasGuessed(guesserId, targetId) {
    return this.getGuesses().some(g => g.guesserId === guesserId && g.targetId === targetId);
  },
  playerScore(playerId) {
    return this.getGuesses().filter(g => g.guesserId === playerId && g.correct).length * 10;
  },
  leaderboard() {
    const guesses = this.getGuesses();
    return this.getParticipants().map(p => {
      const mine = guesses.filter(g => g.guesserId === p.id);
      const correct = mine.filter(g => g.correct).length;
      return { ...p, score: correct * 10, correct, total: mine.length };
    }).sort((a, b) => b.score - a.score || b.correct - a.correct);
  },
};

/* ============================================================
   UTILITIES
============================================================ */
function signFor(birthDate) {
  const d  = new Date(birthDate + 'T00:00:00Z');
  const m  = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Bélier';
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Taureau';
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'Gémeaux';
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'Cancer';
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Lion';
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Vierge';
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'Balance';
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'Scorpion';
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'Sagittaire';
  if ((m === 12 && day >= 22) || (m === 1  && day <= 19)) return 'Capricorne';
  if ((m === 1  && day >= 20) || (m === 2  && day <= 18)) return 'Verseau';
  return 'Poissons';
}

function signData(name) { return SIGNS.find(s => s.name === name); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function initial(name) { return name.charAt(0).toUpperCase(); }

/* ============================================================
   STATE
============================================================ */
const state = {
  view: 'home',
  player: null,
  target: null,
  result: null,
  registered: null,
};

function go(view, patch = {}) {
  Object.assign(state, { view }, patch);
  render();
}

/* ============================================================
   VIEWS
============================================================ */

function renderHome() {
  const count = DB.getParticipants().length;
  return `
    <div class="view view-home">
      <div class="home-content">
        <span class="logo">🔮</span>
        <h1 class="home-title">Astro Quiz</h1>
        <p class="home-subtitle">Devinez les signes astrologiques de vos amis !</p>
        ${count > 0 ? `<span class="participant-badge">✨ ${count} participant${count > 1 ? 's' : ''} inscrit${count > 1 ? 's' : ''}</span>` : ''}
        <div class="home-actions">
          <button class="btn btn-primary btn-large" onclick="go('register')">✍️ M'inscrire</button>
          <button class="btn btn-secondary btn-large" onclick="go('select-player')"
            ${count < 2 ? 'disabled title="Il faut au moins 2 participants"' : ''}>
            🎮 Jouer
          </button>
          <button class="btn btn-ghost btn-large" onclick="go('leaderboard')"
            ${count === 0 ? 'disabled' : ''}>
            🏆 Classement
          </button>
        </div>
      </div>
    </div>`;
}

function renderRegister() {
  return `
    <div class="view">
      <div class="view-header">
        <button class="btn-back" onclick="go('home')">← Retour</button>
        <h2>Inscription</h2>
      </div>
      <div class="form-card">
        <div class="form-icon">🌟</div>
        <h3>Qui êtes-vous ?</h3>
        <form id="reg-form" onsubmit="handleRegister(event)">
          <div class="form-group">
            <label for="reg-name">Votre prénom</label>
            <input type="text" id="reg-name" placeholder="Ex : Marie" required maxlength="30" autocomplete="off">
          </div>
          <div class="form-group">
            <label for="reg-birth">Date de naissance</label>
            <input type="date" id="reg-birth" required max="${new Date().toISOString().split('T')[0]}">
          </div>
          <div id="sign-preview" class="sign-preview hidden"></div>
          <div id="reg-error" class="error-msg hidden"></div>
          <button type="submit" class="btn btn-primary btn-full">Découvrir mon signe ✨</button>
        </form>
      </div>
    </div>`;
}

function renderRegisterSuccess() {
  const p = state.registered;
  const s = signData(p.sign);
  return `
    <div class="view view-success">
      <div class="success-card">
        <div class="success-icon">🎉</div>
        <h2>Bienvenue, ${p.name} !</h2>
        <p class="success-sub">Votre signe astrologique est…</p>
        <div class="sign-reveal" style="border-color:${s.color}; --reveal-glow:${s.color}40">
          <span class="sign-reveal-symbol">${s.symbol}</span>
          <div class="sign-reveal-name" style="color:${s.color}">${s.name}</div>
          <div class="sign-reveal-dates">${s.dates}</div>
        </div>
        <p class="success-note">Votre signe est caché aux autres participants 🤫</p>
        <div class="success-actions">
          <button class="btn btn-primary" onclick="startAs('${p.id}')">🎮 Jouer maintenant</button>
          <button class="btn btn-ghost" onclick="go('home')">Retour à l'accueil</button>
        </div>
      </div>
    </div>`;
}

function renderSelectPlayer() {
  const participants = DB.getParticipants();
  if (participants.length === 0) {
    return `
      <div class="view">
        <div class="view-header">
          <button class="btn-back" onclick="go('home')">← Retour</button>
          <h2>Jouer</h2>
        </div>
        <div class="empty-state">
          <p>Aucun participant inscrit pour l'instant.</p>
          <button class="btn btn-primary" onclick="go('register')">S'inscrire</button>
        </div>
      </div>`;
  }
  return `
    <div class="view">
      <div class="view-header">
        <button class="btn-back" onclick="go('home')">← Retour</button>
        <h2>Qui êtes-vous ?</h2>
      </div>
      <p class="view-subtitle">Sélectionnez votre profil pour commencer</p>
      <div class="participants-grid">
        ${participants.map(p => {
          const s = signData(p.sign);
          return `
            <div class="participant-card" onclick="startAs('${p.id}')">
              <div class="p-avatar" style="background:${s.color}18; border-color:${s.color}40">
                ${initial(p.name)}
              </div>
              <div class="p-name">${p.name}</div>
              <div class="p-score">${DB.playerScore(p.id)} pts</div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function renderGuessList() {
  const player = state.player;
  const all = DB.getParticipants();
  const score = DB.playerScore(player.id);

  const available = all.filter(p => p.id !== player.id && !DB.hasGuessed(player.id, p.id));
  const done      = all.filter(p => p.id !== player.id &&  DB.hasGuessed(player.id, p.id));

  return `
    <div class="view">
      <div class="view-header">
        <button class="btn-back" onclick="go('home')">← Accueil</button>
        <h2>Devinez !</h2>
      </div>
      <div class="player-banner">
        <span>🌟 ${player.name}</span>
        <span class="score-badge">${score} pts</span>
        <button class="btn-lb" onclick="go('leaderboard')" title="Classement">🏆</button>
      </div>

      ${available.length === 0 && done.length === 0 ? `
        <div class="empty-state">
          <p>Pas encore d'autres participants.</p>
          <p style="font-size:.875rem">Attendez que d'autres personnes s'inscrivent.</p>
        </div>` : ''}

      ${available.length > 0 ? `
        <div class="section">
          <div class="section-title">À deviner — ${available.length}</div>
          <div class="target-list">
            ${available.map(p => `
              <div class="target-card" onclick="selectTarget('${p.id}')">
                <div class="t-avatar">${initial(p.name)}</div>
                <div class="t-info">
                  <div class="t-name">${p.name}</div>
                  <div class="t-sub">Quel est son signe ? 🔮</div>
                </div>
                <span class="chevron">›</span>
              </div>`).join('')}
          </div>
        </div>` : ''}

      ${done.length > 0 ? `
        <div class="section">
          <div class="section-title done">Déjà devinés — ${done.length}</div>
          <div class="target-list">
            ${done.map(p => {
              const g = DB.getGuesses().find(g => g.guesserId === player.id && g.targetId === p.id);
              const s = signData(p.sign);
              return `
                <div class="target-card done">
                  <div class="t-avatar faded">${initial(p.name)}</div>
                  <div class="t-info">
                    <div class="t-name">${p.name}</div>
                    <div class="t-sub ${g.correct ? 'correct' : 'wrong'}">
                      ${g.correct ? '✅ Correct !' : `❌ C'était ${s.symbol} ${s.name}`}
                    </div>
                  </div>
                  <span class="pts-tag ${g.correct ? 'ok' : 'nope'}">${g.correct ? '+10' : '0'}</span>
                </div>`;
            }).join('')}
          </div>
        </div>` : ''}
    </div>`;
}

function renderGuess() {
  const t = state.target;
  return `
    <div class="view">
      <div class="view-header">
        <button class="btn-back" onclick="go('guess-list')">← Retour</button>
        <h2>Deviner</h2>
      </div>
      <div class="guess-header">
        <div class="guess-avatar">${initial(t.name)}</div>
        <h3>Quel est le signe de <strong>${t.name}</strong> ?</h3>
        <p class="guess-hint">Choisissez parmi les 12 signes du zodiaque</p>
      </div>
      <div class="signs-grid">
        ${SIGNS.map(s => `
          <button class="sign-btn" onclick="handleGuess('${s.name}')"
            style="--sign-color:${s.color}">
            <span class="sym">${s.symbol}</span>
            <span class="sname">${s.name}</span>
            <span class="sdates">${s.dates}</span>
          </button>`).join('')}
      </div>
    </div>`;
}

function renderResult() {
  const r  = state.result;
  const ts = signData(r.targetSign);
  const gs = signData(r.guessedSign);
  const totalScore = DB.playerScore(state.player.id);

  return `
    <div class="view view-result">
      <div class="result-card ${r.correct ? 'correct' : 'wrong'}">
        <div class="result-icon">${r.correct ? '🎉' : '😕'}</div>
        <h2>${r.correct ? 'Bravo !' : 'Pas cette fois…'}</h2>
        <div class="result-table">
          <div class="result-row">
            <span class="result-label">Votre réponse</span>
            <span class="result-sign" style="color:${gs.color}">${gs.symbol} ${gs.name}</span>
          </div>
          <div class="result-row">
            <span class="result-label">Vrai signe de ${r.targetName}</span>
            <span class="result-sign" style="color:${ts.color}">${ts.symbol} ${ts.name}</span>
          </div>
        </div>
        <div class="pts-earned ${r.correct ? 'pos' : 'zero'}">${r.correct ? '+10 points !' : '+0 point'}</div>
        <div class="result-total">Score total : <strong>${totalScore} pts</strong></div>
        <div class="result-actions">
          <button class="btn btn-primary" onclick="go('guess-list')">Continuer à jouer</button>
          <button class="btn btn-ghost" onclick="go('leaderboard')">🏆 Classement</button>
        </div>
      </div>
    </div>`;
}

function renderLeaderboard() {
  const lb = DB.leaderboard();
  const medals = ['🥇', '🥈', '🥉'];
  const playerId = state.player?.id;

  return `
    <div class="view">
      <div class="view-header">
        <button class="btn-back" onclick="go(${playerId ? "'guess-list'" : "'home'"})">← Retour</button>
        <h2>🏆 Classement</h2>
      </div>
      ${lb.length === 0 ? '<div class="empty-state"><p>Aucun participant encore.</p></div>' : `
      <div class="lb-list">
        ${lb.map((p, i) => {
          const s    = signData(p.sign);
          const isMe = p.id === playerId;
          const rank = medals[i] ?? (i + 1);
          const acc  = p.total > 0 ? Math.round(p.correct / p.total * 100) : 0;
          return `
            <div class="lb-row ${isMe ? 'me' : ''}">
              <span class="lb-rank">${rank}</span>
              <div class="lb-avatar" style="background:${s.color}18; border-color:${s.color}55">
                ${initial(p.name)}
              </div>
              <div class="lb-info">
                <div class="lb-name">${p.name}${isMe ? ' <span style="color:var(--accent);font-size:.75rem">(vous)</span>' : ''}</div>
                <div class="lb-meta">
                  <span style="color:${s.color}">${s.symbol} ${s.name}</span>
                  <span>${p.correct}/${p.total} correct${p.correct > 1 ? 's' : ''} · ${acc}%</span>
                </div>
              </div>
              <div class="lb-score-col">
                <span class="lb-pts">${p.score}</span>
                <span class="lb-pts-label">pts</span>
              </div>
            </div>`;
        }).join('')}
      </div>`}
      <div class="lb-footer">
        <button class="btn btn-ghost" onclick="go('register')">+ Inscrire un participant</button>
      </div>
    </div>`;
}

/* ============================================================
   EVENT HANDLERS
============================================================ */

function setupRegisterListeners() {
  const birthInput = document.getElementById('reg-birth');
  if (!birthInput) return;

  birthInput.addEventListener('change', () => {
    const preview = document.getElementById('sign-preview');
    if (!birthInput.value) { preview.classList.add('hidden'); return; }
    const s = signData(signFor(birthInput.value));
    preview.innerHTML = `
      <div class="sign-preview-inner" style="border-color:${s.color}55; background:${s.color}0d">
        <span class="sign-preview-symbol">${s.symbol}</span>
        <div>
          <div class="sign-preview-name" style="color:${s.color}">${s.name}</div>
          <div class="sign-preview-dates">${s.dates}</div>
        </div>
      </div>`;
    preview.classList.remove('hidden');
  });
}

function handleRegister(event) {
  event.preventDefault();
  const name      = document.getElementById('reg-name').value.trim();
  const birthDate = document.getElementById('reg-birth').value;
  const errorEl   = document.getElementById('reg-error');

  const duplicate = DB.getParticipants().find(p => p.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    errorEl.textContent = `Un participant nommé "${name}" existe déjà. Choisissez un autre prénom.`;
    errorEl.classList.remove('hidden');
    return;
  }

  const participant = { id: uid(), name, birthDate, sign: signFor(birthDate), createdAt: new Date().toISOString() };
  DB.addParticipant(participant);
  go('register-success', { registered: participant });
}

function startAs(playerId) {
  const p = DB.getParticipants().find(p => p.id === playerId);
  if (!p) return;
  go('guess-list', { player: p });
}

function selectTarget(targetId) {
  const t = DB.getParticipants().find(p => p.id === targetId);
  if (!t) return;
  go('guess', { target: t });
}

function handleGuess(guessedSign) {
  const player = state.player;
  const target = state.target;
  const correct = guessedSign === target.sign;

  DB.addGuess({
    id: uid(),
    guesserId: player.id,
    targetId:  target.id,
    guessedSign,
    correct,
    ts: new Date().toISOString(),
  });

  if (correct) confetti();

  go('result', {
    result: { correct, guessedSign, targetSign: target.sign, targetName: target.name },
  });
}

/* ============================================================
   ANIMATIONS
============================================================ */

function initStars() {
  const bg = document.getElementById('stars-bg');
  if (!bg) return;
  for (let i = 0; i < 160; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    el.style.cssText = [
      `left:${Math.random() * 100}%`,
      `top:${Math.random() * 100}%`,
      `width:${size}px`,
      `height:${size}px`,
      `--dur:${(Math.random() * 3 + 2).toFixed(1)}s`,
      `--delay:${(Math.random() * 5).toFixed(1)}s`,
    ].join(';');
    bg.appendChild(el);
  }
}

function confetti() {
  const palette = ['#f0c040','#9b59ff','#ff6bff','#55efc4','#fd79a8','#74b9ff'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 8 + 4;
    el.style.cssText = [
      'position:fixed',
      `width:${size}px`,
      `height:${size}px`,
      `background:${palette[Math.floor(Math.random() * palette.length)]}`,
      `left:${Math.random() * 100}vw`,
      'top:-12px',
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
      `animation:confettifall ${(Math.random() * 1.5 + 1.2).toFixed(1)}s linear forwards`,
      `animation-delay:${(Math.random() * 0.5).toFixed(2)}s`,
      'z-index:9999',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ============================================================
   ROUTER / RENDER
============================================================ */
function render() {
  const app = document.getElementById('app');

  if (state.view === 'guess-list' && !state.player) {
    state.view = 'select-player';
  }

  switch (state.view) {
    case 'home':             app.innerHTML = renderHome();            break;
    case 'register':         app.innerHTML = renderRegister();        setupRegisterListeners(); break;
    case 'register-success': app.innerHTML = renderRegisterSuccess(); break;
    case 'select-player':    app.innerHTML = renderSelectPlayer();    break;
    case 'guess-list':       app.innerHTML = renderGuessList();       break;
    case 'guess':            app.innerHTML = renderGuess();           break;
    case 'result':           app.innerHTML = renderResult();          break;
    case 'leaderboard':      app.innerHTML = renderLeaderboard();     break;
    default: state.view = 'home'; render(); return;
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ============================================================
   INIT
============================================================ */
initStars();
render();
