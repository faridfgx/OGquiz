// ══════════════════════════════════════════════════════
// MEMORY MATCH — memoryGame.js
// ══════════════════════════════════════════════════════
// Images expected at: ./commanders/Command0.jpg  (cover)
//                     ./commanders/Command1.jpg … Command113.jpg
// Grid: 5×5 = 25 cards = 12 pairs + 1 lone wild card
// ══════════════════════════════════════════════════════

const MEMORY_GRID_SIZE  = 25;   // 5×5
const MEMORY_PAIR_COUNT = 12;   // 12 pairs = 24 cards
const MEMORY_TOTAL_COMMANDERS = 113;
const MEMORY_COVER_IMG = './commanders/Command0.jpg';

// ── Seeded shuffle (Fisher-Yates with mulberry32) ─────
function memShuffle(arr, seed) {
  const a = [...arr];
  const rng = mulberry32(seed); // reuse from main script
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Pick 12 random commander IDs + build 25-card deck ──
function buildMemoryDeck(seed) {
  const all = Array.from({ length: MEMORY_TOTAL_COMMANDERS }, (_, i) => i + 1);
  const shuffled = memShuffle(all, seed);
  const picked = shuffled.slice(0, MEMORY_PAIR_COUNT); // 12 commanders

  // 12 pairs = 24 cards, then 1 wild (first extra commander)
  const wild = shuffled[MEMORY_PAIR_COUNT]; // commander #13 in shuffle
  const cards = [...picked, ...picked, wild]; // 25 cards
  return memShuffle(cards, seed + 1); // shuffle the deck
}

// ════════════════════════════════════════════════════════
// ADMIN — Publish
// ════════════════════════════════════════════════════════
async function publishMemoryGame() {
  const missing = memPrizes.filter(p => !p).length;
  const warn = document.getElementById('memSetupWarn');
  if (missing > 0) {
    warn.style.display = 'block';
    setTimeout(() => warn.style.display = 'none', 3000);
    return;
  }
  warn.style.display = 'none';

  const seed = Date.now() % 999983;
  const deck = buildMemoryDeck(seed);
  const gameId = 'MEM_' + Date.now();

  const gameData = {
    id: gameId,
    mode: 'memory',
    deck,
    seed,
    prizes: memPrizes,
    consolation_prize: memConsolationPrize || '',
    active: true,
    revealed: false,
    created_at: new Date().toISOString()
  };

  const { error } = await sb.from('constellation_games').upsert({ id: gameId, data: gameData });
  if (error) { alert('Error publishing memory game: ' + error.message); return; }

  activeMemoryId = gameId;
  document.getElementById('activeGameId').textContent  = gameId;
  document.getElementById('activeGameType').textContent = 'MEMORY';
  document.getElementById('gameStatusRow').style.display = 'flex';
  document.getElementById('memoryDashPanel').style.display = 'block';
  document.getElementById('gameStatusChip').innerHTML = '<span class="status-chip status-active">LIVE</span>';

  loadMemoryDashboard();
  subscribeToMemoryAdmin();
  loadHistory();
  alert(`✓ Memory Match published with ${MEM_TOP_N} prizes! Share the URL with players.`);
}

// ════════════════════════════════════════════════════════
// ADMIN — Live Dashboard
// ════════════════════════════════════════════════════════


function renderMemoryDashboard(scores) {
  document.getElementById('activePlayers').textContent = scores.length;
  const body = document.getElementById('memoryDashBody');
  if (!scores.length) {
    body.innerHTML = '<div class="loading-msg" style="color:var(--text2);">WAITING FOR PLAYERS TO COMPLETE THE GAME...</div>';
    return;
  }

  scores.sort((a, b) => (b.score - a.score) || (a.time_taken - b.time_taken));

  let html = `<div style="margin-bottom:14px;font-size:10px;color:var(--text2);letter-spacing:2px;">
    ▶ ${scores.length} PLAYER(S) COMPLETED · RANKED BY PAIRS FOUND THEN SPEED
  </div>
  <div style="background:var(--bg3);border:1px solid rgba(0,255,204,0.2);border-radius:4px;overflow:hidden;">`;

  scores.forEach((s, i) => {
    const rankLabel = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
    const timeSec = s.time_taken ? Math.round(s.time_taken / 1000) : '?';
    html += `
      <div class="leaderboard-row" style="border-bottom:1px solid rgba(0,255,204,0.08);">
        <div class="lb-rank" style="font-size:16px;">${rankLabel}</div>
        <div>
          <div class="lb-name">${s.username}</div>
          <div class="lb-time">ID: ${s.game_user_id} · ${timeSec}s</div>
        </div>
        <div style="text-align:right;">
          <div class="lb-score" style="color:#00ffcc;">${s.score} pairs</div>
        </div>
      </div>`;
  });
  html += '</div>';
  body.innerHTML = html;
}

function subscribeToMemoryAdmin() {
  if (!activeMemoryId) return;
  if (memoryChannel) sb.removeChannel(memoryChannel);
  memoryChannel = sb.channel('memory-admin-' + activeMemoryId)
    .on('postgres_changes', {
      event: '*', schema: 'public',
      table: 'constellation_claims',
      filter: `game_id=eq.${activeMemoryId}`
    }, () => loadMemoryDashboard())
    .subscribe();
}

// ════════════════════════════════════════════════════════
// PLAYER — Load
// ════════════════════════════════════════════════════════
async function loadPlayerMemory(gd) {
  // Already submitted?
  const { data: existing } = await sb
    .from('constellation_claims')
    .select('*')
    .eq('game_id', activeMemoryId)
    .eq('game_user_id', currentUser.gameId);

  if (existing && existing.length) {
    showMemoryResults(existing[0], gd);
    return;
  }

document.getElementById('memoryStatusBadge').textContent = 'ACTIVE · 5×5 GRID';
showMemoryPrizeTable(gd);
initMemoryBoard(gd);
}

function showMemoryPrizeTable(gd) {
  const prizes = gd.prizes || [];
  const consolation = gd.consolation_prize || '';
  const panel = document.getElementById('memoryPrizePanel');
  const body = document.getElementById('memoryPrizeBody');
  if (!panel || !body || !prizes.length) return;

  let html = `<div style="margin-bottom:10px;font-size:10px;color:var(--text2);">
    Find the most pairs fastest to climb the leaderboard. Top ${prizes.length} players each win a prize!
  </div>
  <div style="background:var(--bg3);border:1px solid rgba(0,255,204,0.2);border-radius:4px;overflow:hidden;">`;

  prizes.forEach((prize, i) => {
    const rl = i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `#${i+1}`;
    html += `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;border-bottom:1px solid rgba(0,255,204,0.08);">
      <div style="font-family:'Orbitron',monospace;font-size:13px;min-width:44px;color:#00ffcc;">${rl}</div>
      <div style="flex:1;font-size:12px;color:#ffe8aa;">${prize}</div>
    </div>`;
  });
  if (consolation) {
    html += `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;background:rgba(255,107,53,0.04);">
      <div style="font-size:13px;min-width:44px;color:var(--orange);">rest</div>
      <div style="flex:1;font-size:12px;color:#ffe8aa;">${consolation}</div>
    </div>`;
  }
  html += '</div>';
  body.innerHTML = html;
  panel.style.display = 'block';
}
// ════════════════════════════════════════════════════════
// PLAYER — Board
// ════════════════════════════════════════════════════════
let memDeck       = [];   // array of 25 commander IDs
let memFlipped    = [];   // indices of currently face-up (unmatched) cards
let memMatched    = new Set();
let memLocked     = false;
let memPairs      = 0;
let memStartTime  = null;
let memMoves      = 0;
let memWild       = null; // the lone card index (deck value that appears once)

function initMemoryBoard(gd) {
  memDeck    = gd.deck;      // 25 ints
  memFlipped = [];
  memMatched = new Set();
  memLocked  = false;
  memPairs   = 0;
  memMoves   = 0;
  memStartTime = null;

  // Find the wild card: the commander ID that appears only once
  const freq = {};
  memDeck.forEach(id => freq[id] = (freq[id] || 0) + 1);
  memWild = parseInt(Object.keys(freq).find(k => freq[k] === 1));

  renderMemoryBoard();
}

function renderMemoryBoard() {
  const body = document.getElementById('memoryPlayerBody');

  body.innerHTML = `
    <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px;padding:10px 14px;background:rgba(0,255,204,0.04);border:1px solid rgba(0,255,204,0.15);border-radius:3px;">
      <div style="font-size:9px;color:var(--text2);letter-spacing:2px;">PAIRS FOUND</div>
      <div id="memPairsCount" style="font-family:'Orbitron',monospace;font-size:22px;color:#00ffcc;text-shadow:0 0 14px rgba(0,255,204,0.4);">0/${MEMORY_PAIR_COUNT}</div>
      <div style="flex:1;"></div>
      <div style="font-size:9px;color:var(--text2);letter-spacing:2px;">MOVES</div>
      <div id="memMovesCount" style="font-family:'Orbitron',monospace;font-size:16px;color:var(--text);">0</div>
      <div style="margin-left:12px;font-size:9px;color:var(--text2);letter-spacing:2px;">TIME</div>
      <div id="memTimer" style="font-family:'Orbitron',monospace;font-size:16px;color:var(--text2);">0s</div>
    </div>

    <div style="font-size:9px;color:var(--text3);letter-spacing:1px;margin-bottom:12px;padding:0 2px;">
      ▶ Flip two cards — matching commanders stay revealed. Find all ${MEMORY_PAIR_COUNT} pairs to win!
      ${memWild ? `<span style="color:rgba(255,215,0,0.8);margin-left:8px;">⚠ One ODD card has no pair — flipping it resets ALL your progress!</span>` : ''}
    </div>

    <div id="memGrid" style="
      display:grid;
      grid-template-columns:repeat(5,1fr);
      gap:8px;
      max-width:520px;
      margin:0 auto;
    "></div>

    <div id="memMessage" style="
      display:none;
      margin-top:16px;
      padding:12px 16px;
      border-radius:3px;
      font-family:'Share Tech Mono',monospace;
      font-size:12px;
      text-align:center;
      letter-spacing:1px;
    "></div>`;

  buildMemGrid();
  startMemTimer();
}

let memTimerInterval = null;
function startMemTimer() {
  if (memTimerInterval) clearInterval(memTimerInterval);
  memStartTime = Date.now();
  memTimerInterval = setInterval(() => {
    const el = document.getElementById('memTimer');
    if (el) el.textContent = Math.floor((Date.now() - memStartTime) / 1000) + 's';
  }, 1000);
}

function buildMemGrid() {
  const grid = document.getElementById('memGrid');
  grid.innerHTML = '';

  memDeck.forEach((cmdId, idx) => {
    const card = document.createElement('div');
    card.id = `mcard-${idx}`;
    card.style.cssText = `
      position:relative;
      width:100%;
      padding-bottom:100%;
      cursor:pointer;
      perspective:600px;
    `;
    card.innerHTML = `
      <div id="minner-${idx}" style="
        position:absolute;inset:0;
        transform-style:preserve-3d;
        transition:transform 0.35s cubic-bezier(.4,0,.2,1);
        border-radius:5px;
      ">
        <!-- BACK (cover) -->
        <div style="
          position:absolute;inset:0;
          backface-visibility:hidden;
          -webkit-backface-visibility:hidden;
          border-radius:5px;
          overflow:hidden;
          border:2px solid rgba(0,255,204,0.25);
          background:#060a0e;
        ">
          <img src="${MEMORY_COVER_IMG}" style="width:100%;height:100%;object-fit:cover;display:block;" draggable="false"
               onerror="this.style.display='none';this.parentElement.style.background='rgba(0,255,204,0.08)';" />
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
                      font-size:18px;opacity:0.15;pointer-events:none;">◈</div>
        </div>
        <!-- FRONT (commander) -->
        <div style="
          position:absolute;inset:0;
          backface-visibility:hidden;
          -webkit-backface-visibility:hidden;
          transform:rotateY(180deg);
          border-radius:5px;
          overflow:hidden;
          border:2px solid rgba(0,255,204,0.5);
          background:#060a0e;
        ">
          <img src="./commanders/Command${cmdId}.jpg"
               style="width:100%;height:100%;object-fit:cover;display:block;"
               draggable="false"
               onerror="this.style.display='none';this.parentElement.innerHTML+='<div style=\'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:rgba(0,255,204,0.4);font-family:monospace;\'>CMD ${cmdId}</div>';" />
        </div>
      </div>`;

    card.onclick = () => flipCard(idx);
    grid.appendChild(card);
  });
}

// ════════════════════════════════════════════════════════
// SOUNDS (Web Audio API — no external files needed)
// ════════════════════════════════════════════════════════
let memAudioCtx = null;
function getAudioCtx() {
  if (!memAudioCtx) memAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return memAudioCtx;
}
function playMemSound(type) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'flip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);

    } else if (type === 'match') {
      // Two-note chime
      [0, 0.12].forEach((delay, i) => {
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(i === 0 ? 660 : 880, ctx.currentTime + delay);
        g2.gain.setValueAtTime(0.22, ctx.currentTime + delay);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        o2.start(ctx.currentTime + delay);
        o2.stop(ctx.currentTime + delay + 0.3);
      });

    } else if (type === 'win') {
      // Victory fanfare — ascending arpeggio
      [0, 0.12, 0.24, 0.38].forEach((delay, i) => {
        const freqs = [523, 659, 784, 1047];
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(freqs[i], ctx.currentTime + delay);
        g2.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
        o2.start(ctx.currentTime + delay);
        o2.stop(ctx.currentTime + delay + 0.4);
      });

    } else if (type === 'wild') {
      // Descending "oops" tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);

    } else if (type === 'nomatch') {
      // Low double-blip
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch(e) { /* audio not supported — silent fallback */ }
}

function triggerWildReset(wildIdx) {
  // Lock immediately so nothing else can be clicked
  memLocked = true;
  memMoves++;
  document.getElementById('memMovesCount').textContent = memMoves;

  glowCard(wildIdx, '#ffd700');
  playMemSound('wild');
  showMemMsg(`★ ODD CARD! Commander #${memDeck[wildIdx]} has no pair — all cards reset! Progress lost!`, 'wild');

  // Visual effect: red flash + shake on the whole grid
  const grid = document.getElementById('memGrid');
  if (grid) {
    // Inject keyframes once
    if (!document.getElementById('memWildStyles')) {
      const style = document.createElement('style');
      style.id = 'memWildStyles';
      style.textContent = `
        @keyframes memShake {
          0%,100%{ transform:translateX(0) }
          15%     { transform:translateX(-10px) }
          30%     { transform:translateX(10px) }
          45%     { transform:translateX(-8px) }
          60%     { transform:translateX(8px) }
          75%     { transform:translateX(-4px) }
          90%     { transform:translateX(4px) }
        }
        @keyframes memRedFlash {
          0%,100%{ background:transparent }
          20%,60%{ background:rgba(255,30,30,0.18) }
          40%,80%{ background:rgba(255,30,30,0.08) }
        }
        .mem-wild-shake {
          animation: memShake 0.55s ease, memRedFlash 0.55s ease;
          border-radius:6px;
        }
      `;
      document.head.appendChild(style);
    }
    grid.classList.add('mem-wild-shake');
    setTimeout(() => grid.classList.remove('mem-wild-shake'), 600);
  }

  // Also flash the odd card itself gold then red
  const wildCard = document.getElementById(`mcard-${wildIdx}`);
  if (wildCard) {
    wildCard.style.transition = 'filter 0.2s';
    wildCard.style.filter = 'drop-shadow(0 0 18px #ffd700) brightness(1.4)';
    setTimeout(() => {
      wildCard.style.filter = 'drop-shadow(0 0 18px rgba(255,40,40,0.9)) brightness(1.1)';
    }, 300);
    setTimeout(() => {
      wildCard.style.filter = '';
      wildCard.style.transition = '';
    }, 700);
  }

  setTimeout(() => {
    // Clear matched set FIRST so hideCard doesn't skip them
    memMatched.clear();
    memPairs = 0;
    memFlipped = [];
    // Now flip every card back face-down
    for (let i = 0; i < memDeck.length; i++) {
      hideCard(i);
    }
    memLocked = false;
    document.getElementById('memPairsCount').textContent = `0/${MEMORY_PAIR_COUNT}`;
    // Remove all glows
    for (let i = 0; i < memDeck.length; i++) {
      const card = document.getElementById(`mcard-${i}`);
      if (card) {
        const fronts = card.querySelectorAll('div');
        fronts.forEach(f => { if (f.style.transform === 'rotateY(180deg)') f.style.borderColor = 'rgba(0,255,204,0.5)'; });
      }
    }
    showMemMsg(`★ PROGRESS RESET — Find pairs again, avoid the odd card!`, 'wild');
  }, 2200);
}

function flipCard(idx) {
  if (memLocked) return;
  if (memMatched.has(idx)) return;
  if (memFlipped.includes(idx)) return;

  // Start timer on first flip
  if (!memStartTime) startMemTimer();

  playMemSound('flip');
  revealCard(idx);

  // ── Check for odd card immediately on first flip ──
  if (isWildCard(idx)) {
    memFlipped = [idx];
    triggerWildReset(idx);
    return;
  }

  memFlipped.push(idx);

  if (memFlipped.length === 1) return; // wait for second card

  // Two normal cards flipped
  memLocked = true;
  memMoves++;
  document.getElementById('memMovesCount').textContent = memMoves;

  const [a, b] = memFlipped;
  const idA = memDeck[a], idB = memDeck[b];

  if (idA === idB) {
    // ✓ MATCH
    memMatched.add(a);
    memMatched.add(b);
    memPairs++;
    memFlipped = [];

    glowCard(a, '#00ffcc');
    glowCard(b, '#00ffcc');

    document.getElementById('memPairsCount').textContent = `${memPairs}/${MEMORY_PAIR_COUNT}`;

    if (memPairs === MEMORY_PAIR_COUNT) {
      // Final pair — show it, then celebrate
      playMemSound('win');
      showMemMsg(`🏆 FINAL PAIR! COMMANDER #${idA} — YOU CLEARED THE BOARD!`, 'success');
      setTimeout(() => {
        showMemWinBanner(() => finishMemory());
      }, 900);
    } else {
      playMemSound('match');
      showMemMsg(`✓ MATCH FOUND! — COMMANDER #${idA}`, 'success');
      memLocked = false;
    }

  } else {
    // ✗ NO MATCH (second card was the odd card — still possible)
    if (isWildCard(b)) {
      triggerWildReset(b);
    } else {
      playMemSound('nomatch');
      showMemMsg(`✗ NO MATCH — try again`, 'fail');
      setTimeout(() => {
        hideCard(a);
        hideCard(b);
        memFlipped = [];
        memLocked = false;
      }, 1200);
    }
  }
}

// ── Win banner shown before jumping to score screen ──
function showMemWinBanner(onDone) {
  const body = document.getElementById('memoryPlayerBody');
  // Overlay a celebration panel ON TOP of the board
  const overlay = document.createElement('div');
  overlay.id = 'memWinOverlay';
  overlay.style.cssText = `
    position:fixed;inset:0;
    display:flex;align-items:center;justify-content:center;
    background:rgba(4,8,16,0.82);
    z-index:9999;
    animation:memFadeIn 0.35s ease;
  `;
  overlay.innerHTML = `
    <style>
      @keyframes memFadeIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
      @keyframes memPulse  { 0%,100%{text-shadow:0 0 30px rgba(0,255,204,0.6)} 50%{text-shadow:0 0 60px rgba(0,255,204,1)} }
    </style>
    <div style="
      background:linear-gradient(135deg,rgba(0,255,204,0.08),rgba(0,212,255,0.04));
      border:2px solid rgba(0,255,204,0.5);
      border-radius:8px;
      padding:40px 48px;
      text-align:center;
      max-width:340px;
      width:90%;
    ">
      <div style="font-size:48px;margin-bottom:12px;">🏆</div>
      <div style="font-family:'Orbitron',monospace;font-size:13px;letter-spacing:4px;color:#00ffcc;margin-bottom:8px;animation:memPulse 1.2s infinite;">
        YOU WIN!
      </div>
      <div style="font-family:'Orbitron',monospace;font-size:36px;color:#00ffcc;text-shadow:0 0 30px rgba(0,255,204,0.6);margin-bottom:4px;">
        ${memPairs}/${MEMORY_PAIR_COUNT}
      </div>
      <div style="font-size:11px;color:var(--text2);letter-spacing:2px;margin-bottom:20px;">
        ALL PAIRS FOUND
      </div>
      <div style="font-size:12px;color:rgba(0,255,204,0.6);margin-bottom:6px;">
        ⏱ ${Math.round((Date.now() - memStartTime)/1000)}s &nbsp;·&nbsp; ${memMoves} moves
      </div>
      <div style="margin-top:22px;font-size:10px;color:var(--text2);letter-spacing:1px;">
        Saving your score…
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // After player has had a moment to read it, proceed to results
  setTimeout(() => {
    overlay.remove();
    onDone();
  }, 2800);
}

function isWildCard(idx) {
  return memDeck[idx] === memWild;
}

function revealCard(idx) {
  const inner = document.getElementById(`minner-${idx}`);
  if (inner) inner.style.transform = 'rotateY(180deg)';
}

function hideCard(idx) {
  if (memMatched.has(idx)) return;
  const inner = document.getElementById(`minner-${idx}`);
  if (inner) inner.style.transform = 'rotateY(0deg)';
}

function glowCard(idx, color) {
  const card = document.getElementById(`mcard-${idx}`);
  if (!card) return;
  const front = card.querySelector('[style*="rotateY(180deg)"]');
  if (front) front.style.borderColor = color;
}

function showMemMsg(text, type) {
  const el = document.getElementById('memMessage');
  if (!el) return;
  el.style.display = 'block';
  el.style.background   = type === 'success' ? 'rgba(0,255,204,0.08)'  : type === 'wild' ? 'rgba(255,215,0,0.08)' : 'rgba(255,51,68,0.08)';
  el.style.borderColor  = type === 'success' ? 'rgba(0,255,204,0.3)'   : type === 'wild' ? 'rgba(255,215,0,0.3)'  : 'rgba(255,51,68,0.25)';
  el.style.border       = '1px solid';
  el.style.color        = type === 'success' ? '#00ffcc' : type === 'wild' ? '#ffd700' : 'rgba(255,100,100,0.8)';
  el.textContent = text;
}

// ════════════════════════════════════════════════════════
// PLAYER — Finish & Submit
// ════════════════════════════════════════════════════════
async function finishMemory() {
  if (memTimerInterval) clearInterval(memTimerInterval);
  const timeTaken = Date.now() - memStartTime;
  const totalQ = MEMORY_PAIR_COUNT;

  const body = document.getElementById('memoryPlayerBody');
  body.innerHTML = `
    <div class="quiz-score-display" style="border-color:rgba(0,255,204,0.3);">
      <div style="font-size:10px;letter-spacing:3px;color:#00ffcc;margin-bottom:12px;">MEMORY MATCH COMPLETE!</div>
      <div class="quiz-score-num" style="color:#00ffcc;text-shadow:0 0 30px rgba(0,255,204,0.5);">${memPairs}/${totalQ}</div>
      <div class="quiz-score-label">PAIRS FOUND</div>
      <div style="font-size:10px;color:var(--text2);margin-top:10px;">Time: ${Math.round(timeTaken/1000)}s · Moves: ${memMoves}</div>
      <div style="margin-top:16px;font-size:11px;color:var(--text2);">Submitting result...</div>
    </div>`;

  const { error } = await sb.from('constellation_claims').insert({
    game_id: activeMemoryId,
    constellation_index: 0,
    username: currentUser.username,
    game_user_id: currentUser.gameId,
    score: memPairs,
    time_taken: timeTaken
  });

  if (error && !error.message.includes('duplicate')) {
    body.innerHTML += `<div style="color:var(--danger);font-size:10px;margin-top:8px;">⚠ Error saving result: ${error.message}</div>`;
    return;
  }

  // Fetch leaderboard and show results
  const { data: gameRow } = await sb.from('constellation_games').select('*').eq('id', activeMemoryId).single();
  const { data: scores }  = await sb.from('constellation_claims').select('*').eq('game_id', activeMemoryId).order('score', { ascending: false });

  body.innerHTML = `
    <div class="quiz-score-display" style="border-color:rgba(0,255,204,0.3);">
      <div style="font-size:10px;letter-spacing:3px;color:#00ffcc;margin-bottom:12px;">MEMORY MATCH COMPLETE!</div>
      <div class="quiz-score-num" style="color:#00ffcc;text-shadow:0 0 30px rgba(0,255,204,0.5);">${memPairs}/${totalQ}</div>
      <div class="quiz-score-label">YOUR PAIRS FOUND</div>
      <div style="font-size:10px;color:var(--text2);margin-top:10px;">Time: ${Math.round(timeTaken/1000)}s · Moves: ${memMoves} · Score submitted!</div>
    </div>`;

  showMemoryResults({ score: memPairs, time_taken: timeTaken }, gameRow?.data, scores || []);
}

// ════════════════════════════════════════════════════════
// PLAYER — Results + Leaderboard
// ════════════════════════════════════════════════════════
async function showMemoryResults(myResult, gd, allScores) {
  if (!allScores) {
    const { data: scores } = await sb.from('constellation_claims').select('*').eq('game_id', activeMemoryId).order('score', { ascending: false });
    allScores = scores || [];
    if (!gd) {
      const { data: gameRow } = await sb.from('constellation_games').select('*').eq('id', activeMemoryId).single();
      gd = gameRow?.data;
    }
  }

  allScores.sort((a, b) => (b.score - a.score) || (a.time_taken - b.time_taken));
  const myRank = allScores.findIndex(s => s.game_user_id === currentUser.gameId) + 1;
  const prizes = gd?.prizes || memPrizes || [];
  const consolation = gd?.consolation_prize || memConsolationPrize || '';
  const myPrize = myRank > 0 && myRank <= prizes.length ? prizes[myRank - 1] : null;

  document.getElementById('memoryStatusBadge').textContent = `RANK #${myRank || '?'} · ${myResult.score || 0} PAIRS`;

  // Show prize table panel
  if (gd) showMemoryPrizeTable(gd);

  const body = document.getElementById('memoryPlayerBody');

  let myResultCard = '';
  if (myPrize) {
    myResultCard = `<div class="player-reward-win" style="margin-bottom:18px;border-color:rgba(0,255,204,0.4);">
      <div class="prw-title" style="color:#00ffcc;">🏆 TOP ${prizes.length} — YOU WIN A PRIZE!</div>
      <div class="prw-reward">${myPrize}</div>
      <div class="prw-rank" style="margin-top:8px;">
        <span style="color:#00ffcc;font-family:'Orbitron',monospace;">RANK #${myRank}</span>
        <span style="color:rgba(255,255,255,0.3);margin:0 8px;">·</span>
        ${myResult.score || 0}/${MEMORY_PAIR_COUNT} pairs
        <span style="color:rgba(255,255,255,0.3);margin:0 8px;">·</span>
        ${myResult.time_taken ? Math.round(myResult.time_taken/1000) : '?'}s
      </div>
    </div>`;
  } else {
    myResultCard = `<div style="padding:16px;background:rgba(0,255,204,0.04);border:1px solid rgba(0,255,204,0.15);border-radius:4px;margin-bottom:18px;text-align:center;">
      <div style="font-size:9px;letter-spacing:2px;color:#00ffcc;margin-bottom:6px;">YOUR RESULT</div>
      <div style="font-family:'Orbitron',monospace;font-size:24px;color:#00ffcc;">${myRank > 0 ? `Rank #${myRank}` : '—'}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:4px;">${myResult.score||0}/${MEMORY_PAIR_COUNT} pairs · ${myResult.time_taken ? Math.round(myResult.time_taken/1000) : '?'}s</div>
      ${myRank > prizes.length && myRank > 0 ? `<div style="font-size:10px;color:rgba(255,51,68,0.7);margin-top:6px;">Not in top ${prizes.length}</div>` : ''}
      ${consolation ? `<div style="margin-top:10px;padding:8px 14px;background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.25);border-radius:3px;display:inline-block;">
        <div style="font-size:9px;color:var(--orange);letter-spacing:1px;margin-bottom:4px;">⬡ CONSOLATION PRIZE</div>
        <div style="font-size:14px;color:#ffe8aa;">${consolation}</div>
      </div>` : ''}
    </div>`;
  }

  const leaderboard = `
    <div style="font-family:'Orbitron',monospace;font-size:9px;color:var(--text2);letter-spacing:2px;margin-bottom:10px;">
      ▶ LEADERBOARD (${allScores.length} player${allScores.length !== 1 ? 's' : ''})
    </div>
    <div style="background:var(--bg3);border:1px solid rgba(0,255,204,0.2);border-radius:4px;overflow:hidden;">
      ${allScores.map((s, i) => {
        const isMe = s.game_user_id === currentUser.gameId;
        const rankLabel = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
        const timeSec = s.time_taken ? Math.round(s.time_taken / 1000) : '?';
        const prize = i < prizes.length ? prizes[i] : null;
        return `<div class="leaderboard-row" style="${isMe ? 'background:rgba(0,255,204,0.07);' : ''}${i < prizes.length ? '' : 'opacity:0.6;'}border-bottom:1px solid rgba(0,255,204,0.08);">
          <div class="lb-rank" style="font-size:16px;">${rankLabel}</div>
          <div>
            <div class="lb-name" style="${isMe ? 'color:#00ffcc;' : ''}">${s.username}${isMe ? ' ◀ YOU' : ''}</div>
            <div class="lb-time">${timeSec}s · ${s.score} pairs</div>
          </div>
          <div style="text-align:right;">
            <div class="lb-score" style="color:#00ffcc;">${s.score}/${MEMORY_PAIR_COUNT}</div>
            ${prize ? `<div class="reward-pill" style="border-color:rgba(0,255,204,0.4);color:#00ffcc;">${prize}</div>` : '<div style="font-size:10px;color:var(--text3);margin-top:2px;">no prize</div>'}
          </div>
        </div>`;
      }).join('')}
    </div>`;

  body.innerHTML = myResultCard + leaderboard;
}

async function loadMemoryDashboard() {
  if (!activeMemoryId) return;
  
  // Fetch all completed player claims for the active memory game
  const { data: scores, error } = await sb
    .from('constellation_claims')
    .select('*')
    .eq('game_id', activeMemoryId);
    
  if (error) {
    console.error('Error loading memory dashboard data:', error.message);
    return;
  }
  
  // Render the data into the UI
  renderMemoryDashboard(scores || []);
}