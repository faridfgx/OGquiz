// ════════════════════════════════════════════════════════════════════════
// gameTimer.js — Event timer for all game modes
//
// HOW TO INTEGRATE:
//  1. Add <script src="gameTimer.js"></script> BEFORE guessGame.js in index.html
//  2. Add timer UI inside each setup panel (see PASTE BLOCKS below)
//  3. Add ends_at to each publish function (see PUBLISH PATCHES below)
//  4. Add startGameTimer() call after each publish (see PUBLISH PATCHES below)
//  5. Add timer resume in initAdminSetup() (see ADMIN INIT PATCH below)
//  6. Add player countdown in loadPlayerView() (see PLAYER PATCH below)
// ════════════════════════════════════════════════════════════════════════

// ── State ────────────────────────────────────────────────────────────────
let selectedDurationHrs = 1;      // admin's chosen duration
let gameTimerInterval   = null;   // setInterval handle for admin countdown
let playerTimerInterval = null;   // setInterval handle for player countdown

const TIMER_OPTIONS = [
  { hrs: 0.5,  label: '30 min' },
  { hrs: 1,    label: '1 hr'   },
  { hrs: 2,    label: '2 hrs'  },
  { hrs: 3,    label: '3 hrs'  },
  { hrs: 6,    label: '6 hrs'  },
  { hrs: 12,   label: '12 hrs' },
  { hrs: 24,   label: '24 hrs' },
];

// ════════════════════════════════════════════════════════════════════════
// PUBLIC HELPERS — called by index.html publish functions
// ════════════════════════════════════════════════════════════════════════

/** Returns the ISO timestamp when the game should end, based on admin selection. */
function getSelectedEndsAt() {
  const ms = selectedDurationHrs * 60 * 60 * 1000;
  return new Date(Date.now() + ms).toISOString();
}

/**
 * Starts the admin-side countdown after a game is published.
 * Auto-calls clearGame() when the timer expires.
 * @param {string|null} endsAt  ISO timestamp
 * @param {string}      gameId  The active game id
 */
function startGameTimer(endsAt, gameId) {
  stopGameTimer();
  if (!endsAt) return;

  const endMs = new Date(endsAt).getTime();

  function tick() {
    const remaining = endMs - Date.now();
    const el = document.getElementById('gameTimerCountdown');
    if (remaining <= 0) {
      stopGameTimer();
      if (el) el.textContent = 'ENDED';
      // Auto-end the game
      if (typeof clearGame === 'function') clearGame(true);
      return;
    }
    if (el) el.textContent = formatCountdown(remaining);
  }

  tick();
  gameTimerInterval = setInterval(tick, 1000);
  showAdminTimerBar(endsAt);
}

/** Stops the admin countdown (called on logout / clearGame). */
function stopGameTimer() {
  if (gameTimerInterval) { clearInterval(gameTimerInterval); gameTimerInterval = null; }
}

/** Stops the player countdown. */
function stopPlayerTimer() {
  if (playerTimerInterval) { clearInterval(playerTimerInterval); playerTimerInterval = null; }
}

// ════════════════════════════════════════════════════════════════════════
// ADMIN TIMER UI
// ════════════════════════════════════════════════════════════════════════

/**
 * Renders the duration picker HTML.
 * Call this in each setup panel where you want the timer selector to appear.
 * Returns an HTML string to inject.
 */
function renderTimerPickerHtml(accentColor) {
  const accent = accentColor || 'var(--accent)';
  const btnColor = accentColor ? accentColor + '33' : 'rgba(0,212,255,0.15)';
  const btns = TIMER_OPTIONS.map(opt => {
    const active = opt.hrs === selectedDurationHrs;
    return `<button
      class="count-btn timer-dur-btn${active ? ' active' : ''}"
      data-hrs="${opt.hrs}"
      onclick="selectTimerDuration(${opt.hrs})"
      style="${active ? `border-color:${accent};color:${accent};background:${btnColor};` : ''}"
    >${opt.label}</button>`;
  }).join('');

  return `
    <div class="timer-picker-row" style="display:flex;align-items:center;gap:12px;margin-bottom:18px;padding:12px 14px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:4px;">
      <span style="font-size:9px;letter-spacing:2px;color:var(--text2);white-space:nowrap;">⏱ DURATION</span>
      <div class="count-btns" id="timerDurBtns" style="display:flex;gap:6px;flex-wrap:wrap;">${btns}</div>
      <span style="font-size:9px;color:var(--text3);margin-left:auto;white-space:nowrap;">Game ends automatically</span>
    </div>`;
}

/** Called by each duration button. Updates selection and refreshes all pickers. */
function selectTimerDuration(hrs) {
  selectedDurationHrs = hrs;
  // Refresh every timer picker on the page
  document.querySelectorAll('.timer-dur-btn').forEach(btn => {
    const isActive = parseFloat(btn.dataset.hrs) === hrs;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.style.background = '';
    } else {
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.style.background = '';
    }
  });
}

/**
 * Shows the live countdown bar in the admin status row.
 * Injects a countdown element next to the existing game status info.
 */
function showAdminTimerBar(endsAt) {
  const row = document.getElementById('gameStatusRow');
  if (!row) return;

  // Remove any existing timer display
  const existing = document.getElementById('adminTimerWrap');
  if (existing) existing.remove();

  const endMs   = new Date(endsAt).getTime();
  const remaining = endMs - Date.now();
  if (remaining <= 0) return;

  const wrap = document.createElement('div');
  wrap.id = 'adminTimerWrap';
  wrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin-left:10px;';
  wrap.innerHTML = `
    <span style="font-size:8px;letter-spacing:2px;color:var(--text2);">ENDS IN</span>
    <span id="gameTimerCountdown" style="font-family:'Orbitron',monospace;font-size:12px;color:var(--accent);min-width:72px;">${formatCountdown(remaining)}</span>
    <div id="adminTimerBar" style="width:80px;height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;display:inline-block;vertical-align:middle;">
      <div id="adminTimerFill" style="height:100%;background:var(--accent);border-radius:2px;transition:width 1s linear;"></div>
    </div>`;

  // Insert before the END GAME button
  const endBtn = row.querySelector('.btn-danger');
  if (endBtn) row.insertBefore(wrap, endBtn);
  else row.appendChild(wrap);

  // Keep bar fill updated
  const totalMs = selectedDurationHrs * 3600000;
  function updateBar() {
    const fill = document.getElementById('adminTimerFill');
    if (!fill) return;
    const pct = Math.max(0, Math.min(100, ((endMs - Date.now()) / totalMs) * 100));
    fill.style.width = pct + '%';
    fill.style.background = pct < 10 ? 'var(--danger)' : pct < 25 ? 'var(--gold)' : 'var(--accent)';
  }
  updateBar();
  setInterval(updateBar, 2000);
}

// ════════════════════════════════════════════════════════════════════════
// PLAYER TIMER UI
// ════════════════════════════════════════════════════════════════════════

/**
 * Starts the player-side countdown shown in the panel badge.
 * Pass the badge element ID and the endsAt ISO string.
 * When expired, calls the provided onExpire callback.
 */
function startPlayerTimer(badgeEl, endsAt, onExpire) {
  stopPlayerTimer();
  if (!endsAt || !badgeEl) return;

  const endMs = new Date(endsAt).getTime();

  function tick() {
    const remaining = endMs - Date.now();
    if (remaining <= 0) {
      stopPlayerTimer();
      badgeEl.textContent = 'Game ended';
      badgeEl.style.color = 'var(--danger)';
      if (typeof onExpire === 'function') onExpire();
      return;
    }
    badgeEl.textContent = '⏱ ' + formatCountdown(remaining);
  }

  tick();
  playerTimerInterval = setInterval(tick, 1000);
}

// ════════════════════════════════════════════════════════════════════════
// SHARED UTILITY
// ════════════════════════════════════════════════════════════════════════

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}
function pad(n) { return String(n).padStart(2, '0'); }

// ════════════════════════════════════════════════════════════════════════
// AUTO-EXPIRE CHECK — call on page load to end games that expired offline
// ════════════════════════════════════════════════════════════════════════

/**
 * Called from initAdminSetup() after loading the active game.
 * If ends_at has passed, immediately calls clearGame().
 */
async function checkAndResumeTimer(gameData, gameId) {
  const endsAt = gameData?.ends_at;
  if (!endsAt) return;

  const remaining = new Date(endsAt).getTime() - Date.now();

  if (remaining <= 0) {
    // Already expired — end it now
    console.log('[Timer] Game expired while offline — ending now');
    if (typeof clearGame === 'function') await clearGame(true);
    return;
  }

  // Still running — resume countdown
  // Reconstruct selectedDurationHrs from created_at → ends_at so bar looks right
  if (gameData.created_at) {
    const totalMs = new Date(endsAt).getTime() - new Date(gameData.created_at).getTime();
    selectedDurationHrs = totalMs / 3600000;
  }

  startGameTimer(endsAt, gameId);
}

