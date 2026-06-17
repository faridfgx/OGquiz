// ════════════════════════════════════════════════════════════════════════
// guessGame.js — Commander Guess Game
// Integrates with index.html exactly like memoryGame.js / quiz
//
// HOW TO INTEGRATE:
//  1. Add <script src="guessGame.js"></script> after mcqdb.js in index.html
//  2. Add the HTML blocks (search "PASTE IN index.html" below)
//  3. Add the 4 hook lines into index.html functions (see bottom of file)
// ════════════════════════════════════════════════════════════════════════

// ── State ────────────────────────────────────────────────────────────────
let guessGameId       = null;
let guessChannel      = null;
const GUESS_TOP_N     = 5;    // top N scorers win a prize
let guessPrizes       = Array(GUESS_TOP_N).fill('');
let guessConsolation  = '';
let guessCount        = 10;   // how many commanders admin chose (10/15/20/25/30)

// Player state
let guessCommanders   = [];   // array of {name, image, skillName} shuffled by admin
let guessAnswers      = {};   // { index: {name: string, skill: string} } — the option text the player picked
let guessChoices      = [];   // { index: {nameOptions:[3 strings], skillOptions:[3 strings]} } — generated once per game
let guessStartTime    = null;
let guessSubmitted    = false;
let guessTimerHandle  = null;

// ════════════════════════════════════════════════════════════════════════
// ADMIN — SETUP
// ════════════════════════════════════════════════════════════════════════
function initGuessSetup() {
  guessPrizes      = Array(GUESS_TOP_N).fill('');
  guessConsolation = '';
  const inp = document.getElementById('guess-consolation-prize');
  if (inp) inp.value = '';
  renderGuessPrizeGrid();
  // set default count button active
  document.querySelectorAll('.guess-count-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.n) === guessCount);
  });
}

function setGuessCount(n, btn) {
  guessCount = n;
  document.querySelectorAll('.guess-count-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function renderGuessPrizeGrid() {
  const grid = document.getElementById('guessPrizeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < GUESS_TOP_N; i++) {
    const rankLabel = i === 0 ? '🥇 1ST' : i === 1 ? '🥈 2ND' : i === 2 ? '🥉 3RD' : `#${i+1}`;
    const pal = ['#00d4ff','#ff6b35','#bf5fff','#39ff14','#ffd700','#ff3378','#00ffcc','#ff9500','#4fc3f7','#e040fb'][i] || '#00d4ff';
    const div = document.createElement('div');
    div.style.cssText = `background:var(--bg3);border:1px solid ${pal}33;border-radius:4px;padding:10px;`;
    div.innerHTML = `
      <div style="font-size:9px;color:${pal};letter-spacing:2px;margin-bottom:6px;">${rankLabel} PLACE PRIZE</div>
      <div class="cc-input-wrap" id="gsug-wrap-${i}" style="overflow:visible;">
        <input class="cc-input" id="guessprize-${i}" type="text" placeholder="Enter prize…" value="${guessPrizes[i]||''}"
          oninput="onGuessPrizeInput(${i},this.value)"
          onfocus="openGuessPrizeSug(${i})"
          onblur="closeGuessPrizeSug(${i})"
          style="border-color:${pal}33;font-size:11px;${guessPrizes[i]?'border-color:rgba(57,255,20,0.35);color:var(--green);':''}" />
        <div class="reward-suggestions" id="gsug-dd-${i}" style="z-index:9999;"></div>
      </div>`;
    grid.appendChild(div);
  }
  updateGuessProgress();
}

function onGuessPrizeInput(i, val) {
  guessPrizes[i] = val.trim();
  updateGuessProgress();
  const dd = document.getElementById('gsug-dd-' + i);
  if (dd && dd.classList.contains('open')) {
    dd.innerHTML = buildGuessSugHtml(val);
    attachGuessSugClicks(dd, i);
  }
}
function openGuessPrizeSug(i) {
  const inp = document.getElementById('guessprize-' + i);
  const dd  = document.getElementById('gsug-dd-' + i);
  if (!dd || !inp) return;
  dd.innerHTML = buildGuessSugHtml(inp.value || '');
  attachGuessSugClicks(dd, i);
  dd.classList.add('open');
}
function closeGuessPrizeSug(i) {
  const dd = document.getElementById('gsug-dd-' + i);
  if (dd) dd.classList.remove('open');
}
function buildGuessSugHtml(filter) {
  // reuse quiz suggestion builder if available, else build simple list
  if (typeof buildQuizSuggestionsHtml === 'function') return buildQuizSuggestionsHtml(filter, 'guess');
  const q = filter.toLowerCase();
  const items = (window.ALL_SUGGESTIONS_FLAT || []).filter(s => s.toLowerCase().includes(q)).slice(0, 8);
  if (!items.length) return '';
  return items.map(s => `<div class="sug-item">${s}</div>`).join('');
}
function attachGuessSugClicks(dd, i) {
  dd.querySelectorAll('.sug-item').forEach(el => {
    el.onmousedown = null;
    el.onmousedown = () => {
      guessPrizes[i] = el.textContent.trim();
      const inp = document.getElementById('guessprize-' + i);
      if (inp) inp.value = guessPrizes[i];
      closeGuessPrizeSug(i);
      updateGuessProgress();
    };
  });
}
function updateGuessProgress() {
  const filled = guessPrizes.filter(p => p).length;
  const fill  = document.getElementById('guessProgFill');
  const count = document.getElementById('guessProgCount');
  if (fill)  fill.style.width  = (filled / GUESS_TOP_N * 100) + '%';
  if (count) count.textContent = filled + '/' + GUESS_TOP_N;
}
function clearGuessPrizes() {
  guessPrizes = Array(GUESS_TOP_N).fill('');
  renderGuessPrizeGrid();
  const inp = document.getElementById('guess-consolation-prize');
  if (inp) inp.value = '';
  guessConsolation = '';
}

async function publishGuessGame() {
  const missing = guessPrizes.filter(p => !p).length;
  const warn = document.getElementById('guessSetupWarn');
  if (missing > 0) {
    warn.textContent = `⚠ SET ALL ${GUESS_TOP_N} PRIZES BEFORE PUBLISHING`;
    warn.style.display = 'block'; setTimeout(() => warn.style.display = 'none', 3000); return;
  }
  warn.style.display = 'none';

  // Pick random commanders
  const pool = [...(window.commandersList || [])];
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, guessCount);

  const gameId = 'GUE_' + Date.now();
  const gameData = {
    id: gameId, mode: 'guess',
    commanders: shuffled,
    count: guessCount,
    prizes: guessPrizes,
    consolation_prize: guessConsolation || '',
    active: true, revealed: false,
    created_at: new Date().toISOString()
  };

  const { error } = await sb.from('constellation_games').upsert({ id: gameId, data: gameData });
  if (error) { alert('Error publishing: ' + error.message); return; }

  guessGameId = gameId;
  document.getElementById('activeGameId').textContent = gameId;
  document.getElementById('activeGameType').textContent = 'GUESS';
  document.getElementById('gameStatusRow').style.display = 'flex';
  document.getElementById('guessDashPanel').style.display = 'block';
  document.getElementById('gameStatusChip').innerHTML = '<span class="status-chip status-active">LIVE</span>';
  loadGuessDashboard(); subscribeToGuessAdmin();
  if (typeof loadHistory === 'function') loadHistory();
  alert(`✓ Guess game published! ${guessCount} commanders selected. Share the URL with players.`);
}

// ── Admin Dashboard ──────────────────────────────────────────────────────
async function loadGuessDashboard() {
  if (!guessGameId) return;
  const { data, error } = await sb.from('constellation_claims').select('*').eq('game_id', guessGameId);
  if (error) { document.getElementById('guessDashBody').innerHTML = `<div class="warn" style="display:block;">Error: ${error.message}</div>`; return; }
  renderGuessDashboard(data || []);
}

function renderGuessDashboard(scores) {
  document.getElementById('activePlayers').textContent = scores.length;
  const body = document.getElementById('guessDashBody');
  if (!scores.length) {
    body.innerHTML = '<div class="loading-msg" style="color:var(--text2);">WAITING FOR PLAYERS TO SUBMIT...</div>'; return;
  }

  // Sort: highest score first, then fastest time
  scores.sort((a, b) => (b.score - a.score) || (a.time_taken - b.time_taken));

  let html = `<div style="margin-bottom:16px;font-size:10px;color:var(--text2);letter-spacing:2px;">
    ▶ TOP ${GUESS_TOP_N} SCORERS WIN · ${scores.length} PLAYER(S) SUBMITTED · ${guessCount} COMMANDERS
  </div>`;
  html += '<div style="background:var(--bg3);border:1px solid rgba(255,165,0,0.2);border-radius:4px;overflow:hidden;">';

  scores.forEach((s, i) => {
    const rankLabel = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
    const prize = i < guessPrizes.length ? guessPrizes[i] : null;
    const timeSec = s.time_taken ? Math.round(s.time_taken / 1000) : '?';
    const inTop = i < GUESS_TOP_N;
    html += `
      <div class="leaderboard-row" style="border-color:${inTop ? 'rgba(255,165,0,0.15)' : 'rgba(255,255,255,0.04)'}">
        <div class="lb-rank" style="color:${inTop ? '#ffa500' : 'var(--text2)'}; font-size:${i < 3 ? '20px' : '13px'};">${rankLabel}</div>
        <div>
          <div class="lb-name">${s.username}</div>
          <div class="lb-time" style="color:var(--text2);">ID: ${s.game_user_id} · ⏱ ${timeSec}s</div>
        </div>
        <div style="text-align:right;">
          <div class="lb-score" style="color:#ffa500;">${s.score} pts</div>
          ${prize ? `<div class="reward-pill" style="border-color:rgba(255,165,0,0.3);color:#ffa500;">${prize}</div>` : ''}
        </div>
      </div>`;
  });
  html += '</div>';
  body.innerHTML = html;
}

function subscribeToGuessAdmin() {
  if (!guessGameId) return;
  if (guessChannel) sb.removeChannel(guessChannel);
  guessChannel = sb.channel('guess-admin-' + guessGameId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'constellation_claims', filter: `game_id=eq.${guessGameId}` }, () => loadGuessDashboard())
    .subscribe();
}

// ════════════════════════════════════════════════════════════════════════
// PLAYER — GUESS GAME
// ════════════════════════════════════════════════════════════════════════
async function loadPlayerGuess(gd) {
  guessCommanders = gd.commanders || [];
  guessCount      = gd.count || guessCommanders.length;
  guessSubmitted  = false;
  guessAnswers    = {};
  guessChoices    = [];

  document.getElementById('guessStatusBadge').textContent = `ACTIVE · ${guessCount} COMMANDERS`;

  // Check if already submitted
  const { data: existing } = await sb.from('constellation_claims')
    .select('*').eq('game_id', guessGameId).eq('game_user_id', currentUser.gameId);
  if (existing && existing.length) {
    showGuessResults(existing[0], gd);
    return;
  }

  // Show prize table and start button
  showGuessPrizeTable(gd);

  // Subscribe to game end
  if (guessChannel) sb.removeChannel(guessChannel);
  guessChannel = sb.channel('guess-player-' + guessGameId)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'constellation_games', filter: `id=eq.${guessGameId}` }, async (payload) => {
      const gd2 = payload.new?.data;
      if (gd2 && !gd2.active && !guessSubmitted) {
        // Game ended — auto-submit whatever they have
        await submitGuessGame(gd2);
      }
    })
    .subscribe();
}

function showGuessPrizeTable(gd) {
  const body = document.getElementById('guessPlayerBody');
  const prizes = gd.prizes || [];
  const consolation = gd.consolation_prize || '';

  body.innerHTML = `
    <div style="margin-bottom:20px;padding:14px;background:rgba(255,165,0,0.05);border:1px solid rgba(255,165,0,0.2);border-radius:4px;">
      <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:3px;color:#ffa500;margin-bottom:12px;">◈ HOW TO PLAY</div>
      <div style="font-size:11px;color:var(--text);line-height:1.9;">
        ▶ You will see <strong style="color:#ffa500;">${guessCount} commander images</strong> one by one.<br>
        ▶ For each: pick the correct <strong style="color:#00ffcc;">commander name</strong> from 3 choices, and their <strong style="color:#bf5fff;">special ability</strong> from 3 choices.<br>
        ▶ Skip any you don't know — move to the next.<br>
        ▶ Score = <strong style="color:#ffa500;">1 point per correct name + 1 point per correct ability</strong> (max ${guessCount * 2} pts).<br>
        ▶ Tiebreaker: <strong>fastest time</strong>. Your timer starts when you click Start.
      </div>
    </div>

    ${prizes.length ? `
    <div style="font-size:9px;letter-spacing:2px;color:#ffa500;margin-bottom:8px;">✦ PRIZE POOL — TOP ${GUESS_TOP_N} WIN</div>
    <div style="background:var(--bg3);border:1px solid rgba(255,165,0,0.15);border-radius:4px;overflow:hidden;margin-bottom:20px;">
      ${prizes.map((p, i) => {
        const rl = i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;
        return `<div style="display:flex;gap:10px;padding:7px 12px;border-bottom:1px solid rgba(255,165,0,0.08);font-size:10px;">
          <span style="min-width:32px;color:#ffa500;">${rl}</span>
          <span style="color:#ffe8aa;">${p}</span>
        </div>`;
      }).join('')}
      ${consolation ? `<div style="display:flex;gap:10px;padding:7px 12px;font-size:10px;background:rgba(255,107,53,0.04);">
        <span style="min-width:32px;color:var(--orange);">rest</span>
        <span style="color:#ffe8aa;">${consolation}</span>
      </div>` : ''}
    </div>` : ''}

    <div style="text-align:center;padding:10px 0;">
      <button class="btn" style="border-color:rgba(255,165,0,0.5);color:#ffa500;font-size:14px;padding:14px 40px;letter-spacing:3px;"
        onclick="startGuessGame()">▶ START GAME</button>
    </div>`;
}

function startGuessGame() {
  guessStartTime = Date.now();
  guessAnswers   = {};
  buildGuessChoices();
  renderGuessCard(0);
}

// ── Multiple-choice generation ───────────────────────────────────────────
function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds a 3-option multiple choice list containing `correct` plus 2 distractors
// pulled from `pool` (falls back gracefully if the pool is small).
function buildChoiceOptions(correct, pool) {
  const candidates = [...new Set(pool.filter(v => v && v !== correct))];
  const distractors = shuffleArr(candidates).slice(0, 2);
  return shuffleArr([correct, ...distractors]);
}

function buildGuessChoices() {
  const fullPool = (window.commandersList && window.commandersList.length) ? window.commandersList : guessCommanders;
  const namePool  = fullPool.map(c => c.name);
  const skillPool = fullPool.map(c => c.skillName);
  guessChoices = guessCommanders.map(cmd => ({
    nameOptions:  buildChoiceOptions(cmd.name, namePool),
    skillOptions: buildChoiceOptions(cmd.skillName, skillPool)
  }));
}

function renderGuessCard(idx) {
  const body = document.getElementById('guessPlayerBody');
  if (idx >= guessCommanders.length) {
    // All done — show review then submit
    renderGuessSummary();
    return;
  }

  const cmd      = guessCommanders[idx];
  const total    = guessCommanders.length;
  const progress = Math.round((idx / total) * 100);
  const saved    = guessAnswers[idx] || {};
  const opts     = guessChoices[idx] || { nameOptions: [cmd.name], skillOptions: [cmd.skillName] };

  const imgSrc = guessImageUrl(cmd);

  const renderOptions = (options, kind, selectedVal) => options.map((opt, i) => `
    <button type="button" class="guess-opt-btn ${selectedVal === opt ? 'selected' : ''}"
      onclick="${kind === 'name' ? 'chooseGuessName' : 'chooseGuessSkill'}(${idx}, ${i})">${opt}</button>
  `).join('');

  body.innerHTML = `
    <style>
      .guess-img-wrap { position:relative;width:100%;max-width:200px;margin:0 auto 20px;border-radius:6px;overflow:hidden;border:2px solid rgba(255,165,0,0.3);box-shadow:0 0 30px rgba(255,165,0,0.1); }
      .guess-img-wrap img { width:100%;display:block;object-fit:cover;background:#1a1a2e;min-height:200px; }
      .guess-counter { position:absolute;top:10px;right:10px;background:rgba(4,8,16,0.85);border:1px solid rgba(255,165,0,0.4);border-radius:4px;padding:4px 10px;font-family:'Orbitron',monospace;font-size:10px;color:#ffa500; }
      .guess-field label { font-size:9px;letter-spacing:2px;color:var(--text2);display:block;margin-bottom:8px; }
      .guess-options { display:flex;flex-direction:column;gap:8px; }
      .guess-opt-btn { width:100%;text-align:left;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:'Share Tech Mono',monospace;font-size:13px;padding:11px 14px;box-sizing:border-box;cursor:pointer;transition:border-color .15s,background .15s; }
      .guess-opt-btn:hover { border-color:rgba(255,165,0,0.4); }
      .guess-opt-btn.selected { border-color:#ffa500;background:rgba(255,165,0,0.12);color:#ffa500; }
      .guess-nav { display:flex;gap:10px;margin-top:18px; }
      .guess-prog-bar { height:3px;background:var(--bg3);border-radius:2px;margin-bottom:20px;overflow:hidden; }
      .guess-prog-fill { height:100%;background:linear-gradient(90deg,#ffa500,#ff6b35);border-radius:2px;transition:width .3s; }
      .guess-timer { font-family:'Orbitron',monospace;font-size:11px;color:rgba(255,165,0,0.7);text-align:right;margin-bottom:12px;letter-spacing:2px; }
    </style>

    <div class="guess-prog-bar"><div class="guess-prog-fill" style="width:${progress}%"></div></div>
    <div class="guess-timer" id="guessTimerDisp">⏱ 00:00</div>

    <div class="guess-img-wrap">
     <img src="${imgSrc}" alt="Commander" data-base="commanders/${cmd.image}" data-exts="jpg" onerror="guessImgFallback(this)">
      <div class="guess-counter">${idx + 1} / ${total}</div>
    </div>

    <div style="display:flex;gap:18px;flex-direction:column;margin-bottom:4px;">
      <div class="guess-field">
        <label>WHO IS THIS COMMANDER?</label>
        <div class="guess-options">${renderOptions(opts.nameOptions, 'name', saved.name)}</div>
      </div>
      <div class="guess-field">
        <label>WHAT IS THEIR SPECIAL ABILITY?</label>
        <div class="guess-options">${renderOptions(opts.skillOptions, 'skill', saved.skill)}</div>
      </div>
    </div>

    <div class="guess-nav">
      ${idx > 0 ? `<button class="btn btn-sm" style="color:var(--text2);border-color:var(--border2);" onclick="renderGuessCard(${idx-1})">← PREV</button>` : '<div></div>'}
      <button class="btn btn-sm" style="color:var(--text2);border-color:var(--border2);margin-left:auto;" onclick="${idx < total - 1 ? `renderGuessCard(${idx+1})` : 'renderGuessSummary()'}">SKIP →</button>
      ${idx < total - 1
        ? `<button class="btn" style="border-color:rgba(255,165,0,0.4);color:#ffa500;" onclick="renderGuessCard(${idx+1})">NEXT →</button>`
        : `<button class="btn" style="border-color:rgba(57,255,20,0.5);color:var(--green);" onclick="renderGuessSummary()">✓ REVIEW & SUBMIT</button>`
      }
    </div>`;

  // Start/continue live timer
  startGuessTimerDisplay();
}

// ── Image URL helper (extension auto-detected at runtime) ──────────────
function guessImageUrl(cmd) {
  const firstExt = cmd.png ? 'png' : 'jpg';
  return `commanders/${cmd.image}.${firstExt}`;
}
function guessImgFallback(img) {
  const remaining = (img.dataset.exts || '').split(',').filter(Boolean);
  if (!remaining.length) { img.onerror = null; return; }
  const next = remaining.shift();
  img.dataset.exts = remaining.join(',');
  img.src = img.dataset.base + '.' + next;
}

// ── Choice selection — saved immediately, then card re-renders ─────────
function chooseGuessName(idx, optIdx) {
  const opt = guessChoices[idx]?.nameOptions[optIdx];
  guessAnswers[idx] = Object.assign({}, guessAnswers[idx], { name: opt });
  renderGuessCard(idx);
}
function chooseGuessSkill(idx, optIdx) {
  const opt = guessChoices[idx]?.skillOptions[optIdx];
  guessAnswers[idx] = Object.assign({}, guessAnswers[idx], { skill: opt });
  renderGuessCard(idx);
}

// ── Live Timer ──────────────────────────────────────────────────────────
function startGuessTimerDisplay() {
  if (guessTimerHandle) clearInterval(guessTimerHandle);
  guessTimerHandle = setInterval(() => {
    const el = document.getElementById('guessTimerDisp');
    if (!el) { clearInterval(guessTimerHandle); return; }
    const elapsed = Math.floor((Date.now() - guessStartTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    el.textContent = `⏱ ${m}:${s}`;
  }, 1000);
}

// ── Summary / Review screen ─────────────────────────────────────────────
function renderGuessSummary() {
  if (guessTimerHandle) clearInterval(guessTimerHandle);
  const body  = document.getElementById('guessPlayerBody');
  const total = guessCommanders.length;
  const elapsed = Math.floor((Date.now() - guessStartTime) / 1000);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');

  let rows = '';
  guessCommanders.forEach((cmd, i) => {
    const ans   = guessAnswers[i] || {};
    const filled = ans.name || ans.skill;
    rows += `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;" onclick="renderGuessCard(${i})">
        <img src="${guessImageUrl(cmd)}" style="width:40px;height:40px;object-fit:cover;border-radius:3px;border:1px solid rgba(255,165,0,0.25);flex-shrink:0;" data-base="commanders/${cmd.image}" data-exts="${cmd.png ? 'png,jpg,jpeg,webp' : 'jpg,png,jpeg,webp'}" onerror="guessImgFallback(this)">
        <div style="flex:1;min-width:0;">
          <div style="font-size:10px;color:${ans.name ? 'var(--text)' : 'var(--text3)'};margin-bottom:3px;">
            👤 ${ans.name || '<span style="color:rgba(255,255,255,0.2);">— skipped —</span>'}
          </div>
          <div style="font-size:10px;color:${ans.skill ? 'var(--text)' : 'var(--text3)'};">
            ⚡ ${ans.skill || '<span style="color:rgba(255,255,255,0.2);">— skipped —</span>'}
          </div>
        </div>
        <div style="font-size:9px;color:rgba(255,165,0,0.6);letter-spacing:1px;white-space:nowrap;">${i+1}/${total} ✎</div>
      </div>`;
  });

  const answered = Object.values(guessAnswers).filter(a => a.name || a.skill).length;

  body.innerHTML = `
    <div style="padding:14px;background:rgba(255,165,0,0.05);border:1px solid rgba(255,165,0,0.2);border-radius:4px;margin-bottom:16px;">
      <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:3px;color:#ffa500;margin-bottom:10px;">◈ REVIEW YOUR ANSWERS</div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="text-align:center;">
          <div style="font-family:'Orbitron',monospace;font-size:28px;color:#ffa500;">${answered}/${total}</div>
          <div style="font-size:9px;color:var(--text2);letter-spacing:1px;">ANSWERED</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:'Orbitron',monospace;font-size:22px;color:var(--text);">${m}:${s}</div>
          <div style="font-size:9px;color:var(--text2);letter-spacing:1px;">TIME ELAPSED</div>
        </div>
      </div>
      <div style="font-size:10px;color:var(--text2);margin-top:10px;">Click any row to go back and edit it.</div>
    </div>

    <div style="background:var(--bg3);border:1px solid rgba(255,165,0,0.1);border-radius:4px;overflow:hidden;margin-bottom:16px;">
      ${rows}
    </div>

    <div style="text-align:center;">
      <button class="btn" style="border-color:rgba(57,255,20,0.5);color:var(--green);font-size:13px;padding:12px 36px;letter-spacing:2px;"
        onclick="submitGuessGame()">⬡ SUBMIT ANSWERS</button>
    </div>`;
}

// ── Scoring & Submit ─────────────────────────────────────────────────────
function normalizeAnswer(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

async function submitGuessGame(forcedGd) {
  if (guessSubmitted) return;
  guessSubmitted = true;
  if (guessTimerHandle) clearInterval(guessTimerHandle);

  const timeTaken = Date.now() - guessStartTime;
  let nameHits = 0, skillHits = 0;

  guessCommanders.forEach((cmd, i) => {
    const ans = guessAnswers[i] || {};
    if (normalizeAnswer(ans.name)  === normalizeAnswer(cmd.name))      nameHits++;
    if (normalizeAnswer(ans.skill) === normalizeAnswer(cmd.skillName))  skillHits++;
  });

  const score = nameHits + skillHits;

  // Only insert the columns that exist in the shared constellation_claims table.
  // `meta` is not a column in this schema — omit it to avoid a 400 error.
  const baseClaim = {
    game_id:             guessGameId,
    constellation_index: 0,
    game_user_id:        currentUser.gameId,
    username:            currentUser.username,
    score:               score,
    time_taken:          timeTaken,
    claimed_at:          new Date().toISOString()
  };

  const { error } = await sb.from('constellation_claims').insert(baseClaim);

  if (error && !String(error.message).toLowerCase().includes('duplicate')) {
    alert('Error saving score: ' + error.message);
    guessSubmitted = false;
    return;
  }

  // Fetch fresh game data for results
  let gd = forcedGd;
  if (!gd) {
    const { data } = await sb.from('constellation_games').select('data').eq('id', guessGameId).single();
    gd = data?.data || {};
  }

  // Pull back the row we actually saved (covers both success and the
  // "already submitted / duplicate" case)
  const { data: savedRows } = await sb.from('constellation_claims')
    .select('*').eq('game_id', guessGameId).eq('game_user_id', currentUser.gameId);
  const claim = (savedRows && savedRows[0]) || baseClaim;

  showGuessResults(claim, gd);
}

// ── Results screen ──────────────────────────────────────────────────────
async function showGuessResults(claim, gd) {
  if (guessTimerHandle) clearInterval(guessTimerHandle);
  const body        = document.getElementById('guessPlayerBody');
  const prizes       = gd.prizes || [];
  const consolation  = gd.consolation_prize || '';
  const total        = gd.commanders?.length || guessCount;
  const timeSec      = claim.time_taken ? Math.round(claim.time_taken / 1000) : '?';

  // Fetch leaderboard to work out rank
  const { data: allScores } = await sb.from('constellation_claims').select('*').eq('game_id', guessGameId);
  const sorted  = (allScores || []).sort((a, b) => (b.score - a.score) || (a.time_taken - b.time_taken));
  const myRank  = sorted.findIndex(s => s.game_user_id === currentUser.gameId) + 1;
  const myPrize = myRank > 0 && myRank <= prizes.length ? prizes[myRank - 1] : null;

  document.getElementById('guessStatusBadge').textContent = `RANK #${myRank || '?'} · ${claim.score ?? 0}/${total * 2}`;

  let html = '';

  // ── MY RESULT CARD — rank + score, prize if won ──
  if (myPrize) {
    html += `<div style="padding:18px;background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.3);border-radius:4px;margin-bottom:18px;text-align:center;">
      <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:3px;color:var(--gold);margin-bottom:10px;">🏆 TOP ${prizes.length} — YOU WIN A PRIZE!</div>
      <div style="font-size:18px;color:var(--gold);margin-bottom:10px;">${myPrize}</div>
      <div style="font-size:11px;color:var(--text2);">
        <span style="color:#ffa500;font-family:'Orbitron',monospace;">RANK #${myRank}</span>
        <span style="color:rgba(255,255,255,0.3);margin:0 8px;">·</span>
        Score: ${claim.score ?? 0}/${total * 2}
        <span style="color:rgba(255,255,255,0.3);margin:0 8px;">·</span>
        Time: ${timeSec}s
      </div>
    </div>`;
  } else {
    html += `<div style="padding:18px;background:rgba(255,165,0,0.05);border:1px solid rgba(255,165,0,0.2);border-radius:4px;margin-bottom:18px;text-align:center;">
      <div style="font-size:9px;letter-spacing:2px;color:var(--text2);margin-bottom:8px;">YOUR RESULT</div>
      <div style="font-family:'Orbitron',monospace;font-size:28px;color:#ffa500;">${myRank > 0 ? `RANK #${myRank}` : '—'}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:6px;">Score: ${claim.score ?? 0}/${total * 2} · Time: ${timeSec}s</div>
      ${myRank > prizes.length ? `<div style="font-size:10px;color:rgba(255,51,68,0.7);margin-top:8px;">Not in top ${prizes.length}</div>` : ''}
      ${consolation ? `<div style="margin-top:12px;padding:8px 16px;background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.25);border-radius:3px;display:inline-block;">
        <div style="font-size:9px;color:var(--orange);letter-spacing:1px;margin-bottom:4px;">⬡ CONSOLATION PRIZE</div>
        <div style="font-size:14px;color:#ffe8aa;">${consolation}</div>
      </div>` : ''}
    </div>`;
  }

  // ── PRIZE TABLE — every rank's reward, mine highlighted ──
  html += `<div style="margin-bottom:18px;">
    <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;color:#ffa500;margin-bottom:8px;">✦ PRIZE TABLE — TOP ${prizes.length} WIN</div>
    <div style="background:var(--bg3);border:1px solid rgba(255,165,0,0.2);border-radius:4px;overflow:hidden;">`;
  prizes.forEach((prize, i) => {
    const rankLabel = i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `#${i+1}`;
    const isMyRank  = (i + 1) === myRank;
    html += `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;border-bottom:1px solid rgba(255,165,0,0.08);${isMyRank ? 'background:rgba(255,165,0,0.10);' : ''}">
      <div style="font-family:'Orbitron',monospace;font-size:12px;min-width:48px;${i===0?'color:var(--gold);':i===1?'color:#c0c0c0;':i===2?'color:#cd7f32;':'color:#ffa500;'}">${rankLabel}</div>
      <div style="flex:1;font-size:11px;color:#ffe8aa;">${prize}</div>
      ${isMyRank ? '<div style="font-size:10px;color:#ffa500;letter-spacing:1px;">◀ YOU</div>' : ''}
    </div>`;
  });
  if (consolation) {
    const isMyRank = myRank > prizes.length && myRank > 0;
    html += `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;background:rgba(255,107,53,0.04);${isMyRank ? 'background:rgba(255,107,53,0.10);' : ''}">
      <div style="font-size:12px;min-width:48px;color:var(--orange);">rest</div>
      <div style="flex:1;font-size:11px;color:#ffe8aa;">${consolation}</div>
      ${isMyRank ? '<div style="font-size:10px;color:var(--orange);">◀ YOU</div>' : ''}
    </div>`;
  }
  html += `</div></div>`;

  // ── LEADERBOARD — for context ──
  html += `<div style="font-family:'Orbitron',monospace;font-size:9px;color:var(--text2);letter-spacing:2px;margin-bottom:10px;">▶ LEADERBOARD (${sorted.length} player${sorted.length !== 1 ? 's' : ''})</div>`;
  html += '<div style="background:var(--bg3);border:1px solid rgba(255,165,0,0.2);border-radius:4px;overflow:hidden;">';
  sorted.slice(0, 25).forEach((s, i) => {
    const isMe = s.game_user_id === currentUser.gameId;
    const rl   = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
    const t    = s.time_taken ? Math.round(s.time_taken / 1000) + 's' : '?';
    html += `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid rgba(255,165,0,0.07);${isMe ? 'background:rgba(255,165,0,0.06);' : ''}">
      <div style="font-size:${i<3?'18px':'12px'};min-width:28px;">${rl}</div>
      <div style="flex:1;">
        <div style="font-size:11px;color:${isMe?'#ffa500':'var(--text)'};">${s.username}${isMe?' ◀ YOU':''}</div>
        <div style="font-size:9px;color:var(--text2);">⏱ ${t}</div>
      </div>
      <div style="font-family:'Orbitron',monospace;font-size:13px;color:#ffa500;">${s.score} pts</div>
    </div>`;
  });
  html += '</div>';

  body.innerHTML = html;
}

// ════════════════════════════════════════════════════════════════════════
// PLAYER HISTORY — add guess block  (called from existing loadPlayerHistory)
// ════════════════════════════════════════════════════════════════════════
function buildGuessHistoryBlock(gd, claim) {
  const prizes = gd?.prizes || [];
  const consolation = gd?.consolation_prize || '';
  const total   = gd?.count || gd?.commanders?.length || '?';
  const myScore = claim.score ?? '?';
  const myTime  = claim.time_taken ? Math.round(claim.time_taken / 1000) + 's' : '—';
  return `
    <div style="padding:14px;background:rgba(255,165,0,0.05);border:1px solid rgba(255,165,0,0.2);border-radius:3px;margin-bottom:10px;">
      <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;color:#ffa500;margin-bottom:10px;">◈ YOUR COMMANDER GUESS RESULT</div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;">
        <div style="text-align:center;">
          <div style="font-family:'Orbitron',monospace;font-size:28px;color:#ffa500;text-shadow:0 0 20px rgba(255,165,0,0.4);">${myScore}/${(typeof total === 'number' ? total * 2 : '?')}</div>
          <div style="font-size:9px;color:var(--text2);letter-spacing:1px;">SCORE</div>
        </div>
        <div style="text-align:center;">
          <div style="font-family:'Orbitron',monospace;font-size:22px;color:var(--text);">${myTime}</div>
          <div style="font-size:9px;color:var(--text2);">TIME</div>
        </div>
      </div>
    </div>
    ${prizes.length ? `
    <div style="font-size:9px;letter-spacing:2px;color:var(--text2);margin-bottom:8px;">PRIZE TABLE</div>
    <div style="background:var(--bg3);border:1px solid rgba(255,165,0,0.15);border-radius:3px;overflow:hidden;margin-bottom:8px;">
      ${prizes.map((p,i)=>{const rl=i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;return`<div style="display:flex;gap:10px;padding:7px 12px;border-bottom:1px solid rgba(255,165,0,0.08);font-size:10px;"><span style="min-width:32px;color:#ffa500;">${rl}</span><span style="color:#ffe8aa;">${p}</span></div>`;}).join('')}
      ${consolation?`<div style="display:flex;gap:10px;padding:7px 12px;font-size:10px;background:rgba(255,107,53,0.04);"><span style="min-width:32px;color:var(--orange);">rest</span><span style="color:#ffe8aa;">${consolation}</span></div>`:''}
    </div>` : ''}`;
}

// ════════════════════════════════════════════════════════════════════════
// SOUNDS
// ════════════════════════════════════════════════════════════════════════
let guessAudioCtx = null;
function guessSound(type) {
  try {
    if (!guessAudioCtx) guessAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = guessAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'next') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'submit') {
      [0, 0.1, 0.2].forEach((d, i) => {
        const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.type = 'triangle'; o2.frequency.setValueAtTime([523, 659, 784][i], ctx.currentTime + d);
        g2.gain.setValueAtTime(0.18, ctx.currentTime + d); g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.3);
        o2.start(ctx.currentTime + d); o2.stop(ctx.currentTime + d + 0.3);
      });
    }
  } catch(e) {}
}