// ══════════════════════════════════════════════════════
// gridBattle.js — COMMANDER GRID BATTLE
// Blind simultaneous placement + attack mini-game for Constellation Hub
// Requires globals from index.html: sb, currentUser, PALETTES, commandersList
// Requires gameTimer.js: renderTimerPickerHtml, startGameTimer, stopGameTimer,
//                        getSelectedEndsAt, startPlayerTimer, stopPlayerTimer
// ══════════════════════════════════════════════════════

const BATTLE_GRID = 10;
const BATTLE_TOP_N = 5;
const BATTLE_CARD_ORDER = ['tank', 'glass', 'reflector'];
const BATTLE_CARDS = {
  tank:      { label: 'TANK',          value: 1,  color: '#00d4ff', commander: 'Erebus Errants', image: 'commanders/Command90.jpg' },
  glass:     { label: 'GLASS CANNON',  value: 3,  color: '#ff6b35', commander: 'Feral Raptors',   image: 'commanders/Command71.jpg' },
  reflector: { label: 'REFLECTOR',     value: -1, color: '#bf5fff', commander: 'Dune Enforcers',  image: 'commanders/Command106.jpg' }
};

// ── Admin state ──
let battleGameId = null;
let battlePrizes = Array(BATTLE_TOP_N).fill('');
let battleConsolation = '';
let battleChannel = null;

// ── Player state ──
let battlePlacement = {};   // { tank: anchorIdx, glass: anchorIdx, reflector: anchorIdx }
let battleSelectedCard = 'tank';
let battleHoverAnchor = null;
let battleAttacks = [];     // [idx, idx, idx]
let battlePhase = 'placement'; // 'placement' | 'attack' | 'submitted'
let battlePlayerTimerEl = null;

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════
function battleCommanderImg(cardType) {
  return BATTLE_CARDS[cardType] ? BATTLE_CARDS[cardType].image : '';
}
function battleRC(idx) { return [Math.floor(idx / BATTLE_GRID), idx % BATTLE_GRID]; }
function battleIdx(r, c) { return r * BATTLE_GRID + c; }
function battleIsValidAnchor(anchor) {
  const [r, c] = battleRC(anchor);
  return r <= BATTLE_GRID - 2 && c <= BATTLE_GRID - 2;
}
function battleCellsForAnchor(anchor) {
  if (!battleIsValidAnchor(anchor)) return null;
  const [r, c] = battleRC(anchor);
  return [battleIdx(r,c), battleIdx(r,c+1), battleIdx(r+1,c), battleIdx(r+1,c+1)];
}
function battleOwnOccupiedCells() {
  const cells = new Set();
  BATTLE_CARD_ORDER.forEach(type => {
    if (battlePlacement[type] != null) {
      (battleCellsForAnchor(battlePlacement[type]) || []).forEach(c => cells.add(c));
    }
  });
  return cells;
}
function battleStorageKey() {
  return `battle_session_${battleGameId}_${currentUser.gameId}`;
}
function saveBattleSession() {
  const session = { startTime: battleStartTime, placement: battlePlacement, attacks: battleAttacks, phase: battlePhase };
  try { localStorage.setItem(battleStorageKey(), JSON.stringify(session)); } catch (e) {}
}
function loadBattleSession() {
  try { const raw = localStorage.getItem(battleStorageKey()); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function clearBattleSession() {
  try { localStorage.removeItem(battleStorageKey()); } catch (e) {}
}

function battleInjectStyles() {
  if (document.getElementById('battleStyles')) return;
  const style = document.createElement('style');
  style.id = 'battleStyles';
  style.textContent = `
    .battle-grid-wrap { position:relative; max-width:480px; margin:0 auto; aspect-ratio:1/1; }
    .battle-grid { position:absolute; inset:0; display:grid; grid-template-columns:repeat(${BATTLE_GRID},1fr); gap:3px; }
    .battle-cell { position:relative; border:1px solid var(--border2); border-radius:2px; background:var(--bg3); cursor:pointer; transition:all .12s ease; }
    .battle-cell:hover { border-color:var(--accent); }
    .battle-cell.disabled { cursor:not-allowed; opacity:.35; }
    .battle-cell.preview { background:rgba(0,212,255,0.22); border-color:var(--accent); }
    .battle-cell.preview-invalid { background:rgba(255,51,68,0.22); border-color:var(--danger); }
    .battle-cell.own-occupied { cursor:not-allowed; }
    .battle-cell.drag-over { border-color:var(--accent3) !important; box-shadow:0 0 8px var(--accent3); }
    .battle-cell.attack-selected { background:rgba(255,107,53,0.35) !important; border-color:var(--orange) !important; box-shadow:0 0 10px rgba(255,107,53,0.4); }
    .battle-cell.attack-selected::after { content:'✕'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#ff6b35; font-size:14px; font-weight:bold; z-index:2; }
    .battle-piece-layer { position:absolute; inset:0; display:grid; grid-template-columns:repeat(${BATTLE_GRID},1fr); grid-template-rows:repeat(${BATTLE_GRID},1fr); gap:3px; pointer-events:none; }
    .battle-piece { grid-row: var(--r) / span 2; grid-column: var(--c) / span 2; position:relative; padding:2px; }
    .battle-piece img { width:100%; height:100%; object-fit:cover; border-radius:5px; border:2px solid currentColor; box-shadow:0 0 8px currentColor; display:block; }
    .battle-piece.draggable-piece { pointer-events:auto; cursor:grab; }
    .battle-piece.draggable-piece:active { cursor:grabbing; }
    .battle-piece .bp-label { position:absolute; bottom:3px; right:3px; background:rgba(0,0,0,.65); color:#fff; font-size:8px; padding:1px 4px; border-radius:2px; font-family:'Orbitron',monospace; letter-spacing:1px; }
    .battle-piece.dimmed { opacity:.6; filter:grayscale(.25); }
    .battle-card-tab { flex:1; padding:10px 8px; border-radius:4px; border:1px solid var(--border2); background:var(--bg3); cursor:grab; text-align:center; transition:all .15s ease; }
    .battle-card-tab:active { cursor:grabbing; }
    .battle-card-tab.active { box-shadow:0 0 14px currentColor; }
    .battle-card-tab img { width:38px; height:38px; object-fit:cover; border-radius:50%; margin-bottom:6px; border:2px solid currentColor; pointer-events:none; }
    .battle-card-tab .bct-label { font-family:'Orbitron',monospace; font-size:9px; letter-spacing:1px; }
    .battle-card-tab .bct-val { font-size:9px; opacity:.7; margin-top:2px; }
    .battle-card-tab .bct-drag-hint { font-size:8px; opacity:.5; margin-top:2px; }
    .battle-card-tab.placed { opacity:.55; }
  `;
  document.head.appendChild(style);
}

// ══════════════════════════════════════════════════════
// ADMIN — SETUP
// ══════════════════════════════════════════════════════
function initBattleSetup() {
  battleInjectStyles();
  battlePrizes = Array(BATTLE_TOP_N).fill('');
  battleConsolation = '';
  document.getElementById('battleSetup').innerHTML = battleSetupHtml();
  document.getElementById('battleTimerPicker').innerHTML = renderTimerPickerHtml('var(--accent3)');
}

function battleSetupHtml() {
  return `
  <div class="panel">
    <div class="panel-hd">
      <div class="ph-dot" style="background:var(--accent3);box-shadow:0 0 14px var(--accent3);"></div>
      <div class="ph-title">Commander Grid Battle Setup</div>
      <div class="ph-badge" style="border-color:var(--accent3);color:var(--accent3);">10×10 GRID · TOP 5 WIN</div>
    </div>
    <div class="panel-body">
      <div style="font-size:10px;color:var(--text2);line-height:1.8;padding:12px;background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.15);border-radius:3px;margin-bottom:16px;">
        ▶ Each player blind-places 1 Tank, 1 Glass Cannon and 1 Reflector (2×2 each) on a 10×10 grid — drag a card onto the grid, or tap it then tap a cell — then picks 3 cells to attack.<br>
        ▶ Everything resolves at once when you end the game. Tank hit = +1pt to attacker · Glass Cannon hit = +3pt to attacker · Reflector hit = −1pt to attacker. Values stack when cards overlap the same cell.<br>
        ▶ Reflector rule (simple): if a player's Reflector is hit, that Reflector's owner gets a flat +1 bonus point. That's the only condition — no overlap or other requirement.<br>
        ▶ Top 5 final scores win prizes. Tiebreaker: who locked in their attack first.
      </div>

      <div style="font-size:9px;letter-spacing:2px;color:var(--accent3);margin-bottom:10px;">✦ TOP 5 PRIZES</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:16px;" id="battlePrizeGrid"></div>

      <div class="consolation-box" style="margin-bottom:16px;">
        <div class="consolation-label" style="color:var(--accent3);">⬡ CONSOLATION PRIZE — EVERYONE OUTSIDE TOP 5</div>
        <input class="cc-input" id="battle-consolation-prize" type="text" placeholder="Enter consolation prize (optional)…"
          oninput="battleConsolation=this.value.trim()" style="border-color:rgba(0,212,255,0.3);font-size:11px;" />
      </div>

      <div class="prog-row" style="margin-bottom:16px;">
        <span class="prog-label">PRIZES SET</span>
        <div class="prog-bar"><div class="prog-fill" id="battleProgFill" style="width:0%;background:linear-gradient(90deg,#00d4ff,#bf5fff);"></div></div>
        <span class="prog-count" id="battleProgCount" style="color:var(--accent3);">0/5</span>
      </div>

      <div id="battleSetupWarn" class="warn">⚠ SET ALL 5 PRIZES BEFORE PUBLISHING</div>
      <div id="battleTimerPicker"></div>
      <div class="btn-row">
        <button class="btn btn-sm" style="color:var(--text2);border-color:var(--border2);" onclick="clearBattlePrizes()">✕ CLEAR PRIZES</button>
        <button class="btn" style="border-color:var(--accent3);color:var(--accent3);" onclick="publishBattleGame()">⬡ PUBLISH GRID BATTLE</button>
      </div>
    </div>
  </div>

  <div class="panel" id="battleDashPanel" style="display:none;">
    <div class="panel-hd">
      <div class="rt-dot"></div>
      <div class="ph-title">Grid Battle — Live Status</div>
      <div class="ph-badge" style="border-color:var(--accent3);color:var(--accent3);">LIVE — BLIND</div>
    </div>
    <div class="panel-body" id="battleDashBody"><div class="loading-msg">WAITING FOR PLAYERS...</div></div>
  </div>`;
}

function renderBattlePrizeGrid() {
  const grid = document.getElementById('battlePrizeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < BATTLE_TOP_N; i++) {
    const rankLabel = i === 0 ? '🥇 1ST' : i === 1 ? '🥈 2ND' : i === 2 ? '🥉 3RD' : `#${i+1}`;
    const div = document.createElement('div');
    div.style.cssText = `background:var(--bg3);border:1px solid rgba(0,212,255,0.2);border-radius:4px;padding:10px;`;
    div.innerHTML = `
      <div style="font-size:9px;color:var(--accent3);letter-spacing:2px;margin-bottom:6px;">${rankLabel} PLACE PRIZE</div>
      <input class="cc-input" id="battleprize-${i}" type="text" placeholder="Enter prize…" value="${battlePrizes[i]||''}"
        oninput="onBattlePrizeInput(${i},this.value)"
        style="border-color:rgba(0,212,255,0.25);font-size:11px;${battlePrizes[i]?'border-color:rgba(57,255,20,0.35);color:var(--green);':''}" />`;
    grid.appendChild(div);
  }
  updateBattleProgress();
}
function onBattlePrizeInput(i, val) {
  battlePrizes[i] = val.trim();
  updateBattleProgress();
  const inp = document.getElementById('battleprize-' + i);
  if (inp) { if (battlePrizes[i]) inp.classList.add('filled'); else inp.classList.remove('filled'); }
}
function updateBattleProgress() {
  const filled = battlePrizes.filter(p => p).length;
  const fill = document.getElementById('battleProgFill');
  const count = document.getElementById('battleProgCount');
  if (fill) fill.style.width = (filled / BATTLE_TOP_N * 100) + '%';
  if (count) count.textContent = filled + '/' + BATTLE_TOP_N;
}
function clearBattlePrizes() {
  battlePrizes = Array(BATTLE_TOP_N).fill('');
  renderBattlePrizeGrid();
  const inp = document.getElementById('battle-consolation-prize');
  if (inp) inp.value = '';
  battleConsolation = '';
}

async function publishBattleGame() {
  const missing = battlePrizes.filter(p => !p).length;
  const warn = document.getElementById('battleSetupWarn');
  if (missing > 0) { warn.style.display = 'block'; setTimeout(() => warn.style.display = 'none', 3000); return; }
  warn.style.display = 'none';

  const gameId = 'BTL_' + Date.now();
  const endsAt = getSelectedEndsAt();
  const gameData = {
    id: gameId, mode: 'battle',
    grid_size: BATTLE_GRID,
    prizes: battlePrizes,
    consolation_prize: battleConsolation || '',
    active: true, revealed: false,
    ends_at: endsAt,
    created_at: new Date().toISOString()
  };
  const { error } = await sb.from('constellation_games').upsert({ id: gameId, data: gameData });
  if (error) { alert('Error publishing: ' + error.message); return; }

  battleGameId = gameId;
  document.getElementById('activeGameId').textContent = gameId;
  document.getElementById('activeGameType').textContent = 'BATTLE';
  document.getElementById('gameStatusRow').style.display = 'flex';
  document.getElementById('battleDashPanel').style.display = 'block';
  document.getElementById('gameStatusChip').innerHTML = '<span class="status-chip status-active">LIVE</span>';
  loadBattleDashboard(); subscribeToBattleAdmin(); loadHistory();
  startGameTimer(endsAt, gameId);
  alert('✓ Grid Battle published! Share the URL with players.');
}

// ══════════════════════════════════════════════════════
// ADMIN — LIVE DASHBOARD (blind — no placements shown until ended)
// ══════════════════════════════════════════════════════
async function loadBattleDashboard() {
  if (!battleGameId) return;
  const { data, error } = await sb.from('constellation_claims').select('*').eq('game_id', battleGameId).order('claimed_at', { ascending: true });
  const body = document.getElementById('battleDashBody');
  if (error) { body.innerHTML = `<div class="warn" style="display:block;">Error: ${error.message}</div>`; return; }
  const claims = data || [];
  document.getElementById('activePlayers').textContent = claims.length;
  let html = `<div style="font-size:10px;color:var(--text2);letter-spacing:1px;margin-bottom:12px;">▶ ${claims.length} player(s) locked in. Placements stay blind until you end the game.</div>`;
  html += '<div style="background:var(--bg3);border:1px solid var(--border2);border-radius:4px;overflow:hidden;">';
  if (!claims.length) {
    html += '<div class="loading-msg">WAITING FOR PLAYERS...</div>';
  } else {
    claims.forEach(c => {
      html += `<div style="display:flex;gap:10px;padding:8px 14px;border-bottom:1px solid var(--border2);font-size:11px;align-items:center;">
        <span style="color:var(--green);">✓</span>
        <span style="color:var(--text);flex:1;">${c.username}</span>
        <span style="color:var(--text3);font-size:9px;">ID: ${c.game_user_id}</span>
        <span style="color:var(--text3);font-size:9px;">${c.claimed_at ? new Date(c.claimed_at).toLocaleTimeString() : ''}</span>
      </div>`;
    });
  }
  html += '</div>';
  body.innerHTML = html;
}
function subscribeToBattleAdmin() {
  if (!battleGameId) return;
  if (battleChannel) sb.removeChannel(battleChannel);
  battleChannel = sb.channel('battle-admin-' + battleGameId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'constellation_claims', filter: `game_id=eq.${battleGameId}` }, () => loadBattleDashboard())
    .subscribe();
}

// ══════════════════════════════════════════════════════
// ADMIN — SCORE CALCULATION (run once when game ends)
// ══════════════════════════════════════════════════════
// cell -> [{owner, username, cardType}]
function battleBuildOccupancy(claims) {
  const occupancy = {};
  claims.forEach(c => {
    const placement = c.battle_placement || {};
    Object.keys(placement).forEach(cardType => {
      if (!BATTLE_CARDS[cardType]) return;
      const cells = battleCellsForAnchor(placement[cardType]);
      if (!cells) return;
      cells.forEach(cell => {
        if (!occupancy[cell]) occupancy[cell] = [];
        occupancy[cell].push({ owner: c.game_user_id, username: c.username, cardType });
      });
    });
  });
  return occupancy;
}

function battleCoordLabel(anchor) {
  const [r, c] = battleRC(anchor);
  return `R${r+1}-${r+2}, C${c+1}-${c+2}`;
}
function battleCellLabel(cell) {
  const [r, c] = battleRC(cell);
  return `R${r+1},C${c+1}`;
}

// Full per-player breakdown (placement, attacks, incoming hits) — used both to
// calculate scores and to give the admin a verifiable audit trail after the game ends.
function battleComputeDetails(claims) {
  const occupancy = battleBuildOccupancy(claims);
  return claims.map(c => {
    const attacksDetail = (c.battle_attacks || []).map(cell => {
      const occupants = occupancy[cell] || [];
      const subtotal = occupants.reduce((s, o) => s + BATTLE_CARDS[o.cardType].value, 0);
      return { cell, occupants, subtotal };
    });
    const attackScore = attacksDetail.reduce((s, a) => s + a.subtotal, 0);

    const incomingHits = [];
    claims.forEach(other => {
      if (other.game_user_id === c.game_user_id) return;
      (other.battle_attacks || []).forEach(cell => {
        (occupancy[cell] || []).filter(o => o.owner === c.game_user_id).forEach(o => {
          incomingHits.push({ cell, cardType: o.cardType, attacker: other.username, attackerId: other.game_user_id });
        });
      });
    });
    // The only Reflector rule: every hit landed on this player's Reflector is worth +1 to them.
    const reflectorBonus = incomingHits.filter(h => h.cardType === 'reflector').length;

    return { claim: c, occupancy, attacksDetail, attackScore, incomingHits, reflectorBonus, score: attackScore + reflectorBonus };
  });
}

async function battleCalculateScores(gameId) {
  const { data: claims, error } = await sb.from('constellation_claims').select('*').eq('game_id', gameId);
  if (error || !claims || !claims.length) return [];

  const details = battleComputeDetails(claims);

  const results = details.map(d => ({
    ...d.claim,
    battle_attack_score: d.attackScore,
    battle_bonus: d.reflectorBonus,
    score: d.score
  }));

  for (const r of results) {
    await sb.from('constellation_claims').update({
      score: r.score, battle_attack_score: r.battle_attack_score, battle_bonus: r.battle_bonus
    }).eq('id', r.id);
  }
  return results;
}

// Called from clearGame() in index.html when a battle game is ended
async function battleOnGameEnd(gameId) {
  await battleCalculateScores(gameId);
}

// ══════════════════════════════════════════════════════
// PLAYER — ENTRY
// ══════════════════════════════════════════════════════
async function loadPlayerBattle(gd) {
  battleInjectStyles();
  document.getElementById('playerBattlePanel').style.display = 'block';
  const badge = document.getElementById('battleStatusBadge');
  if (badge) badge.textContent = 'GAME: ' + battleGameId;

  const { data: existing } = await sb.from('constellation_claims').select('*').eq('game_id', battleGameId).eq('game_user_id', currentUser.gameId);
  if (existing && existing.length) {
    clearBattleSession();
    renderBattleWaiting(gd, existing[0]);
    return;
  }

  const session = loadBattleSession();
  if (session) {
    battleStartTime = session.startTime || Date.now();
    battlePlacement = session.placement || {};
    battleAttacks   = session.attacks   || [];
    battlePhase     = session.phase     || 'placement';
  } else {
    battleStartTime = Date.now();
    battlePlacement = {};
    battleAttacks = [];
    battlePhase = 'placement';
    saveBattleSession();
  }
  battleSelectedCard = BATTLE_CARD_ORDER.find(t => battlePlacement[t] == null) || 'tank';

  if (battlePhase === 'attack') renderBattleAttackUI();
  else renderBattlePlacementUI();

  if (gd.ends_at) {
    const lbl = document.getElementById('battleStatusBadge');
    if (lbl) startPlayerTimer(lbl, gd.ends_at, () => loadPlayerView());
  }
}

// ══════════════════════════════════════════════════════
// PLAYER — SHARED RULES BOX (always visible during play)
// ══════════════════════════════════════════════════════
function battleRulesBox() {
  return `<div style="font-size:10px;color:var(--text2);line-height:1.7;margin-bottom:12px;padding:10px 12px;background:rgba(191,95,255,0.05);border-left:2px solid var(--purple);">
    <div style="letter-spacing:1px;color:var(--purple);font-size:9px;margin-bottom:4px;">📜 HOW SCORING WORKS</div>
    ▶ Hitting a <b style="color:${BATTLE_CARDS.tank.color};">Tank</b> = +1 pt · a <b style="color:${BATTLE_CARDS.glass.color};">Glass Cannon</b> = +3 pt · a <b style="color:${BATTLE_CARDS.reflector.color};">Reflector</b> = −1 pt — all credited to <u>you</u>, the attacker. Values stack if cards overlap the same cell.<br>
    ▶ Reflector rule (that's it, nothing else): if a player's Reflector gets hit — by anyone — that Reflector's <b>owner</b> gets a flat <b style="color:var(--green);">+1 bonus</b> point.<br>
    ▶ Top 5 total scores win prizes.
  </div>`;
}

// ══════════════════════════════════════════════════════
// PLAYER — PLACEMENT PHASE
// ══════════════════════════════════════════════════════
function renderBattlePlacementUI() {
  const body = document.getElementById('battlePlayerBody');
  if (!body) return;
  const allPlaced = BATTLE_CARD_ORDER.every(t => battlePlacement[t] != null);

  let tabsHtml = '<div style="display:flex;gap:8px;margin-bottom:14px;">';
  BATTLE_CARD_ORDER.forEach(type => {
    const card = BATTLE_CARDS[type];
    const placed = battlePlacement[type] != null;
    const active = battleSelectedCard === type;
    const img = battleCommanderImg(type);
    tabsHtml += `<div class="battle-card-tab${active?' active':''}${placed?' placed':''}" style="color:${card.color};${active?`border-color:${card.color};`:''}"
      draggable="true" ondragstart="battleDragStart(event,'${type}')" onclick="selectBattleCard('${type}')">
      ${img ? `<img src="${img}" alt="${card.label}">` : ''}
      <div class="bct-label">${card.label}${placed?' ✓':''}</div>
      <div class="bct-val">${card.value > 0 ? '+' : ''}${card.value} pt</div>
      <div class="bct-drag-hint">drag onto grid</div>
    </div>`;
  });
  tabsHtml += '</div>';

  const instructions = battleRulesBox() + `<div style="font-size:10px;color:var(--text2);line-height:1.7;margin-bottom:12px;padding:10px 12px;background:rgba(0,212,255,0.04);border-left:2px solid var(--accent);">
    ▶ Drag a commander card onto the grid — or tap a card, then tap a cell — to place its 2×2 footprint. Your placement stays hidden from everyone else until the admin ends the game.<br>
    ▶ Cards can't overlap each other or go off the grid. Click/drag a placed card's footprint to pick it up and move it.
  </div>`;

  const gridHtml = `<div class="battle-grid-wrap"><div class="battle-grid" id="battlePlacementGrid"></div><div class="battle-piece-layer" id="battlePlacementPieces"></div></div>`;

  const btnHtml = `<div class="btn-row" style="margin-top:16px;">
    <button class="btn btn-sm" style="color:var(--text2);border-color:var(--border2);" onclick="clearBattlePlacementCard()">✕ CLEAR SELECTED CARD</button>
    <button class="btn" style="border-color:var(--accent3);color:var(--accent3);${allPlaced?'':'opacity:.4;pointer-events:none;'}" onclick="proceedToBattleAttack()">→ PROCEED TO ATTACK PHASE</button>
  </div>`;

  body.innerHTML = tabsHtml + instructions + gridHtml + btnHtml;
  renderBattlePlacementGrid();
}

function selectBattleCard(type) {
  battleSelectedCard = type;
  renderBattlePlacementUI();
}
function clearBattlePlacementCard() {
  delete battlePlacement[battleSelectedCard];
  renderBattlePlacementUI();
}

function renderBattlePlacementGrid() {
  const grid = document.getElementById('battlePlacementGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const occupiedBy = {}; // cell -> cardType (own placements)
  BATTLE_CARD_ORDER.forEach(type => {
    if (battlePlacement[type] != null) {
      (battleCellsForAnchor(battlePlacement[type]) || []).forEach(c => occupiedBy[c] = type);
    }
  });

  for (let i = 0; i < BATTLE_GRID * BATTLE_GRID; i++) {
    const cell = document.createElement('div');
    cell.className = 'battle-cell';
    if (occupiedBy[i] != null) {
      const card = BATTLE_CARDS[occupiedBy[i]];
      cell.style.background = card.color + '33';
      cell.style.borderColor = card.color;
    }
    cell.onclick = () => battlePlacementCellClick(i);
    cell.onmouseenter = () => battlePlacementPreview(i, true);
    cell.onmouseleave = () => battlePlacementPreview(i, false);
    cell.ondragover = (e) => { e.preventDefault(); battlePlacementPreview(i, true); cell.classList.add('drag-over'); };
    cell.ondragleave = () => { battlePlacementPreview(i, false); cell.classList.remove('drag-over'); };
    cell.ondrop = (e) => { e.preventDefault(); cell.classList.remove('drag-over'); battlePlacementPreview(i, false); battleDropPlace(i, e); };
    grid.appendChild(cell);
  }
  battleRenderPieceLayer('battlePlacementPieces', battlePlacement, { draggable: true });
}

// ── Piece layer: keeps commander images visible on the grid at all times ──
function battleRenderPieceLayer(layerId, placements, opts = {}) {
  const layer = document.getElementById(layerId);
  if (!layer) return;
  layer.innerHTML = '';
  BATTLE_CARD_ORDER.forEach(type => {
    const anchor = placements[type];
    if (anchor == null) return;
    const [r, c] = battleRC(anchor);
    const card = BATTLE_CARDS[type];
    const piece = document.createElement('div');
    piece.className = 'battle-piece' + (opts.dimmed ? ' dimmed' : '') + (opts.draggable ? ' draggable-piece' : '');
    piece.style.setProperty('--r', r + 1);
    piece.style.setProperty('--c', c + 1);
    piece.style.color = card.color;
    piece.title = card.label + (opts.dimmed ? ' (yours — cannot be targeted)' : '');
    piece.innerHTML = `<img src="${card.image}" alt="${card.label}"><span class="bp-label">${card.label[0]}</span>`;
    if (opts.draggable) {
      piece.draggable = true;
      piece.ondragstart = (e) => battleDragStart(e, type);
    }
    layer.appendChild(piece);
  });
}

// ── Drag and drop placement ──
let battleDragType = null;
function battleDragStart(e, type) {
  battleDragType = type;
  battleSelectedCard = type;
  try { e.dataTransfer.setData('text/plain', type); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
}
function battleDropPlace(anchor, e) {
  let type = battleDragType;
  try { type = (e && e.dataTransfer && e.dataTransfer.getData('text/plain')) || type; } catch (err) {}
  battleDragType = null;
  if (!type || !BATTLE_CARDS[type]) return;
  if (!battlePlaceCardAt(type, anchor)) return;
  battleSelectedCard = BATTLE_CARD_ORDER.find(t => battlePlacement[t] == null) || type;
  saveBattleSession();
  renderBattlePlacementUI();
}

function battlePlacementValidAt(anchor) {
  const cells = battleCellsForAnchor(anchor);
  if (!cells) return false;
  const own = battleOwnOccupiedCells();
  // exclude cells currently belonging to the card being (re)placed
  const currentCells = battlePlacement[battleSelectedCard] != null
    ? new Set(battleCellsForAnchor(battlePlacement[battleSelectedCard]))
    : new Set();
  return cells.every(c => !own.has(c) || currentCells.has(c));
}

// Validates and places `type` at `anchor`, excluding that same card's current
// footprint from the overlap check (so moving a card over its own old spot works).
function battlePlaceCardAt(type, anchor) {
  const cells = battleCellsForAnchor(anchor);
  if (!cells) return false;
  const own = battleOwnOccupiedCells();
  const currentCells = battlePlacement[type] != null
    ? new Set(battleCellsForAnchor(battlePlacement[type]))
    : new Set();
  const valid = cells.every(c => !own.has(c) || currentCells.has(c));
  if (!valid) return false;
  battlePlacement[type] = anchor;
  return true;
}

function battlePlacementPreview(anchor, show) {
  const grid = document.getElementById('battlePlacementGrid');
  if (!grid) return;
  const cells = battleCellsForAnchor(anchor);
  if (!cells) return;
  const valid = battlePlacementValidAt(anchor);
  cells.forEach(c => {
    const el = grid.children[c];
    if (!el) return;
    el.classList.remove('preview', 'preview-invalid');
    if (show) el.classList.add(valid ? 'preview' : 'preview-invalid');
  });
}

function battlePlacementCellClick(cell) {
  // if clicking an occupied cell of the currently selected card type, remove it
  if (battlePlacement[battleSelectedCard] != null) {
    const cur = new Set(battleCellsForAnchor(battlePlacement[battleSelectedCard]));
    if (cur.has(cell)) { delete battlePlacement[battleSelectedCard]; saveBattleSession(); renderBattlePlacementUI(); return; }
  }
  if (!battlePlaceCardAt(battleSelectedCard, cell)) return;
  // auto-advance to next un-placed card
  const next = BATTLE_CARD_ORDER.find(t => battlePlacement[t] == null);
  if (next) battleSelectedCard = next;
  saveBattleSession();
  renderBattlePlacementUI();
}

// ══════════════════════════════════════════════════════
// PLAYER — ATTACK PHASE
// ══════════════════════════════════════════════════════
function proceedToBattleAttack() {
  if (!BATTLE_CARD_ORDER.every(t => battlePlacement[t] != null)) return;
  battlePhase = 'attack';
  battleAttacks = [];
  saveBattleSession();
  renderBattleAttackUI();
}

function renderBattleAttackUI() {
  const body = document.getElementById('battlePlayerBody');
  if (!body) return;
  const instructions = battleRulesBox() + `<div style="font-size:10px;color:var(--text2);line-height:1.7;margin-bottom:12px;padding:10px 12px;background:rgba(255,107,53,0.05);border-left:2px solid var(--orange);">
    ▶ Select exactly 3 cells to attack. Your own placed commanders stay visible on the grid (greyed out) so you remember where they are — but you can't target your own cells.<br>
    ▶ Once locked in, your placement and attacks are final.
  </div>`;
  const counter = `<div style="font-size:11px;color:var(--orange);margin-bottom:10px;">SELECTED: <span id="battleAttackCount">${battleAttacks.length}</span>/3</div>`;
  const gridHtml = `<div class="battle-grid-wrap"><div class="battle-grid" id="battleAttackGrid"></div><div class="battle-piece-layer" id="battleAttackPieces"></div></div>`;
  const btnHtml = `<div class="btn-row" style="margin-top:16px;">
    <button class="btn btn-sm" style="color:var(--text2);border-color:var(--border2);" onclick="backToBattlePlacement()">← BACK TO PLACEMENT</button>
    <button class="btn" id="battleSubmitBtn" style="border-color:var(--green);color:var(--green);${battleAttacks.length===3?'':'opacity:.4;pointer-events:none;'}" onclick="submitBattleClaim()">⬡ LOCK IN ATTACK</button>
  </div>`;
  body.innerHTML = instructions + counter + gridHtml + btnHtml;
  renderBattleAttackGrid();
}

function backToBattlePlacement() {
  battlePhase = 'placement';
  saveBattleSession();
  renderBattlePlacementUI();
}

function renderBattleAttackGrid() {
  const grid = document.getElementById('battleAttackGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const own = battleOwnOccupiedCells();
  for (let i = 0; i < BATTLE_GRID * BATTLE_GRID; i++) {
    const cell = document.createElement('div');
    cell.className = 'battle-cell';
    if (own.has(i)) {
      cell.classList.add('own-occupied', 'disabled');
      cell.style.background = 'rgba(255,255,255,0.03)';
    } else {
      if (battleAttacks.includes(i)) cell.classList.add('attack-selected');
      cell.onclick = () => toggleBattleAttackCell(i);
    }
    grid.appendChild(cell);
  }
  battleRenderPieceLayer('battleAttackPieces', battlePlacement, { dimmed: true });
}

function toggleBattleAttackCell(cell) {
  const idx = battleAttacks.indexOf(cell);
  if (idx >= 0) {
    battleAttacks.splice(idx, 1);
  } else {
    if (battleAttacks.length >= 3) return;
    battleAttacks.push(cell);
  }
  saveBattleSession();
  renderBattleAttackGrid();
  const counter = document.getElementById('battleAttackCount');
  if (counter) counter.textContent = battleAttacks.length;
  const btn = document.getElementById('battleSubmitBtn');
  if (btn) btn.style.pointerEvents = battleAttacks.length === 3 ? 'auto' : 'none';
  if (btn) btn.style.opacity = battleAttacks.length === 3 ? '1' : '.4';
}

async function submitBattleClaim() {
  if (battleAttacks.length !== 3) return;
  const btn = document.getElementById('battleSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'SUBMITTING...'; }

  const timeTaken = battleStartTime ? (Date.now() - battleStartTime) : null;

  const { error } = await sb.from('constellation_claims').insert({
    game_id: battleGameId,
    game_user_id: currentUser.gameId,
    username: currentUser.username,
    battle_placement: battlePlacement,
    battle_attacks: battleAttacks,
    time_taken: timeTaken
  });

  if (error && !error.message.includes('duplicate')) {
    alert('Error submitting: ' + error.message);
    if (btn) { btn.disabled = false; btn.textContent = '⬡ LOCK IN ATTACK'; }
    return;
  }

  clearBattleSession();
  const { data: gameRow } = await sb.from('constellation_games').select('data').eq('id', battleGameId).single();
  const { data: claim } = await sb.from('constellation_claims').select('*').eq('game_id', battleGameId).eq('game_user_id', currentUser.gameId).single();
  renderBattleWaiting(gameRow?.data, claim);
  loadPlayerHistory();
}

// ══════════════════════════════════════════════════════
// PLAYER — WAITING / RESULTS
// ══════════════════════════════════════════════════════
function renderBattleWaiting(gd, claim) {
  const body = document.getElementById('battlePlayerBody');
  if (!body) return;
  const revealed = gd?.revealed === true;
  if (!revealed) {
    body.innerHTML = `<div style="text-align:center;padding:30px 10px;">
      <div style="font-size:28px;margin-bottom:10px;">🛰️</div>
      <div style="font-family:'Orbitron',monospace;font-size:12px;letter-spacing:2px;color:var(--accent3);margin-bottom:8px;">STANDING BY</div>
      <div style="font-size:11px;color:var(--text2);">Your fleet is deployed and your strike order is locked in.<br>Results will appear here once the admin ends the battle.</div>
    </div>`;
    return;
  }
  battleRenderResultsPlayer(gd, claim);
}

async function battleRenderResultsPlayer(gd, claim) {
  const body = document.getElementById('battlePlayerBody');
  if (!body) return;
  const { data: allClaims } = await sb.from('constellation_claims').select('*').eq('game_id', battleGameId);
  const ranked = (allClaims || []).slice().sort((a, b) => (b.score - a.score) || ((a.time_taken||Infinity) - (b.time_taken||Infinity)));
  const myRank = ranked.findIndex(c => c.game_user_id === currentUser.gameId) + 1;
  const prizes = gd?.prizes || battlePrizes;
  const consol = gd?.consolation_prize || '';
  const myPrize = myRank > 0 && myRank <= prizes.length ? prizes[myRank - 1] : null;

  let html = `<div style="text-align:center;padding:14px 10px;margin-bottom:16px;border:1px solid var(--accent3);border-radius:4px;background:rgba(0,212,255,0.05);">
    <div style="font-size:9px;letter-spacing:2px;color:var(--text2);margin-bottom:6px;">FINAL SCORE</div>
    <div style="font-family:'Orbitron',monospace;font-size:30px;color:var(--accent3);">${claim.score ?? 0}</div>
    <div style="font-size:10px;color:var(--text2);margin-top:4px;">Attack: ${claim.battle_attack_score ?? 0} · Reflector bonus: +${claim.battle_bonus ?? 0}${claim.time_taken ? ' · Time: ' + Math.round(claim.time_taken/1000) + 's' : ''}</div>
    <div style="font-size:11px;color:var(--gold);margin-top:8px;">RANK #${myRank || '?'} / ${ranked.length}</div>
    ${myPrize ? `<div style="margin-top:10px;font-size:12px;color:var(--gold);">🏆 ${myPrize}</div>` : consol ? `<div style="margin-top:10px;font-size:12px;color:var(--orange);">${consol}</div>` : ''}
  </div>`;

  html += `<div style="font-family:'Orbitron',monospace;font-size:9px;color:var(--text2);letter-spacing:2px;margin-bottom:10px;">▶ LEADERBOARD</div>
  <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:4px;overflow:hidden;">`;
  ranked.forEach((c, i) => {
    const isMe = c.game_user_id === currentUser.gameId;
    const rl = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
    html += `<div style="display:flex;gap:10px;padding:8px 14px;border-bottom:1px solid var(--border2);font-size:11px;${isMe?'background:rgba(0,212,255,0.08);':''}">
      <span style="min-width:28px;color:var(--accent3);">${rl}</span>
      <span style="flex:1;color:var(--text);">${c.username}${isMe?' (you)':''}</span>
      <span style="color:var(--accent3);">${c.score ?? 0} pts</span>
    </div>`;
  });
  html += '</div>';
  body.innerHTML = html;
}

console.log('gridBattle.js loaded');