// ══════════════════════════════════════════════════════
// battleReplay.js — Fog of War Grid Battle Replay Visualizer
// ══════════════════════════════════════════════════════
// Depends on globals already defined in gridBattle.js:
//   BATTLE_GRID, BATTLE_CARDS, BATTLE_CARD_ORDER,
//   battleRC, battleIdx, battleCellsForAnchor,
//   battleComputeDetails, battleCoordLabel, battleCellLabel
// ══════════════════════════════════════════════════════

let _brState = null;

// Commander translation helper mapping standard card type strings to custom names
function _brGetCommanderName(cardType) {
  const mapping = {
    'tank': 'Erebus Errants',
    'glass': 'Feral Raptors',
    'reflector': 'Dune Enforcers'
  };
  return mapping[cardType] || cardType;
}

function _brInjectStyles() {
  if (document.getElementById('battleReplayStyles')) return;
  const s = document.createElement('style');
  s.id = 'battleReplayStyles';
  s.textContent = `
  .br-overlay{position:fixed;inset:0;background:rgba(2,5,10,0.96);z-index:99999;display:flex;flex-direction:column;font-family:'Share Tech Mono',monospace;color:#d8e6f5;}
  .br-hd{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid rgba(0,212,255,0.2);flex-shrink:0;}
  .br-title{font-family:'Orbitron',monospace;font-size:13px;letter-spacing:3px;color:#00d4ff;}
  .br-phase{font-family:'Orbitron',monospace;font-size:10px;letter-spacing:2px;padding:4px 10px;border:1px solid rgba(255,255,255,0.15);border-radius:3px;color:#bbb;}
  .br-phase.attack{border-color:rgba(255,107,53,0.5);color:#ff6b35;}
  .br-phase.placement{border-color:rgba(0,212,255,0.5);color:#00d4ff;}
  .br-phase.done{border-color:rgba(57,255,20,0.5);color:#39ff14;}
  .br-close{margin-left:auto;background:transparent;border:1px solid rgba(255,255,255,0.15);color:#aaa;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:14px;}
  .br-close:hover{border-color:#ff3344;color:#ff3344;}
  .br-body{flex:1;display:flex;gap:24px;padding:24px;overflow:hidden;}
  
  .br-gridcol{flex:1;display:flex;align-items:center;justify-content:center;min-width:0;}
  .br-grid-outer{
    position:relative;
    width:min(66vh,580px);
    aspect-ratio:1/1;
    display:grid;
    grid-template-columns: 24px 1fr;
    grid-template-rows: 24px 1fr;
  }
  .br-corner-label{grid-column:1;grid-row:1;}
  .br-cols-labels{grid-column:2;grid-row:1;display:flex;justify-content:space-around;align-items:center;font-family:'Orbitron',monospace;font-size:11px;color:#5a6c7d;font-weight:700;}
  .br-rows-labels{grid-column:1;grid-row:2;display:flex;flex-direction:column;justify-content:space-around;align-items:center;font-family:'Orbitron',monospace;font-size:11px;color:#5a6c7d;font-weight:700;}
  .br-label-item{width:100%;text-align:center;}
  
  .br-gridwrap{grid-column:2;grid-row:2;position:relative;width:100%;height:100%;border:1px solid rgba(0,212,255,0.15);background:rgba(0,0,0,0.3);}
  
  .br-cells{position:absolute;inset:0;display:grid;grid-template-columns:repeat(${BATTLE_GRID},1fr);gap:3px;z-index:1;padding:3px;}
  .br-cell{border:1px solid rgba(255,255,255,0.06);border-radius:2px;background:rgba(255,255,255,0.01);transition:background .25s,border-color .25s,box-shadow .25s;}
  
  .br-pieces{position:absolute;inset:0;display:grid;grid-template-columns:repeat(${BATTLE_GRID},1fr);grid-template-rows:repeat(${BATTLE_GRID},1fr);gap:3px;pointer-events:none;z-index:10;padding:3px;}
  
  .br-piece{grid-row:var(--r)/span 2;grid-column:var(--c)/span 2;position:relative;padding:2px;opacity:0;transform:scale(.4);transition:opacity .35s ease,transform .35s ease,filter .35s ease;z-index:20;}
  .br-piece.show{opacity:.95;transform:scale(1);}
  .br-piece.hidden-fog{opacity:0 !important; transform:scale(.8); pointer-events:none;}
  
  .br-piece img{width:100%;height:100%;object-fit:cover;border-radius:5px;border:2px solid var(--pc);box-shadow:0 0 10px var(--pc);display:block;opacity:0.65;}
  
  .br-piece.hit-flash{z-index:1000 !important; opacity:0.95 !important; transform:scale(1) !important;}
  .br-piece.hit-flash img{opacity:1 !important;filter:brightness(1.8) saturate(1.5);animation:brCardHit 0.65s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;}
  
  .br-piece .br-tag{position:absolute;bottom:-14px;left:2px;right:2px;text-align:center;font-size:9px;font-weight:bold;letter-spacing:.5px;color:#fff;background:rgba(10,15,25,1);border:1px solid var(--pc);border-radius:3px;padding:1px 3px;box-shadow:0 2px 6px rgba(0,0,0,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:1 !important;z-index:1100;}
  
  @keyframes brCardHit {
    0% { transform: scale(1); box-shadow: 0 0 10px var(--pc); }
    30% { transform: scale(1.15) rotate(-1deg); box-shadow: 0 0 35px #ff3344, inset 0 0 15px rgba(255,51,68,0.4); border-color: #ff3344; }
    100% { transform: scale(1); box-shadow: 0 0 18px var(--pc); }
  }

  .br-global-fx-container{position:fixed;inset:0;pointer-events:none;z-index:999999999 !important;}
  .br-fxlabel{position:absolute;font-family:'Orbitron',monospace;font-weight:900;font-size:28px;transform:translate(-50%,-50%);animation:brfloat 1.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;text-shadow:0 0 14px #000, 0 0 7px #000, 0 0 4px currentColor;}
  @keyframes brfloat{0%{opacity:0;transform:translate(-50%,20%) scale(.4);}20%{opacity:1;transform:translate(-50%,-50%) scale(1.45);}75%{opacity:1;}100%{opacity:0;transform:translate(-50%,-160%) scale(0.8);}}
  
  .br-sidebar{width:300px;flex-shrink:0;display:flex;flex-direction:column;gap:14px;overflow:hidden;}
  .br-legend{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:5px;padding:12px;overflow-y:auto;max-height:45%;scroll-behavior:smooth;}
  .br-legend-title{font-size:9px;letter-spacing:2px;color:#789;margin-bottom:10px;font-family:'Orbitron',monospace;}
  #brLegendRows{display:flex;flex-direction:column;gap:6px;}
  .br-lrow{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid transparent;border-radius:4px;font-size:12px;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);background:rgba(255,255,255,0.01);}
  
  .br-lrow.active{
    background:rgba(0,212,255,0.08) !important;
    border-color:rgba(0,212,255,0.35) !important;
    transform:translateX(4px);
    box-shadow:0 0 12px rgba(0,212,255,0.1);
  }
  .br-lrow.active .br-lname{color:#fff;font-weight:bold;text-shadow:0 0 8px rgba(255,255,255,0.3);}
  .br-lrow.active .br-lscore{transform:scale(1.1);color:#fff;}

  .br-swatch{width:10px;height:10px;border-radius:50%;flex-shrink:0;box-shadow:0 0 6px currentColor;transition:transform .2s;}
  .br-lrow.active .br-swatch{transform:scale(1.2);box-shadow:0 0 10px currentColor;}
  .br-lname{flex:1;color:#a4b8cc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .br-lscore{font-family:'Orbitron',monospace;color:#ffd700;font-weight:700;transition:all .2s;}
  
  .br-log{flex:1;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:5px;padding:12px;overflow-y:auto;font-size:10px;line-height:1.9;display:flex;flex-direction:column-reverse;}
  .br-log-entry{opacity:0;animation:brfadein .3s ease forwards;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:5px;margin-bottom:5px;}
  .br-calc-details{font-size:9px;color:#8ab4f8;padding-left:14px;margin-top:2px;font-family:monospace;}
  @keyframes brfadein{to{opacity:1;}}
  
  .br-banner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Orbitron',monospace;font-size:18px;letter-spacing:3px;color:#fff;text-shadow:0 0 25px currentColor;background:rgba(2,5,10,0.92);padding:18px 32px;border:1px solid currentColor;border-radius:6px;z-index:50000;opacity:0;pointer-events:none;transition:opacity .25s ease;text-align:center;white-space:nowrap;}
  .br-banner.show{opacity:1;}
  
  .br-ft{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px;border-top:1px solid rgba(0,212,255,0.15);flex-shrink:0;flex-wrap:wrap;}
  .br-btn{background:transparent;border:1px solid rgba(0,212,255,0.4);color:#00d4ff;font-family:'Orbitron',monospace;font-size:10px;letter-spacing:2px;padding:9px 18px;border-radius:4px;cursor:pointer;transition:all .15s;}
  .br-btn:hover{background:rgba(0,212,255,0.1);}
  .br-btn.wide{min-width:110px;}
  .br-progress{font-size:9px;color:#789;letter-spacing:1px;min-width:90px;text-align:center;}
  @media (max-width:820px){.br-body{flex-direction:column;}.br-sidebar{width:100%;flex-direction:row;}.br-legend,.br-log{max-height:160px;}}
  `;
  document.head.appendChild(s);
}

function _brColors(n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(`hsl(${Math.round(i * (360 / Math.max(n, 1)))},85%,62%)`);
  return out;
}

function _brBuildTimeline(claimsSorted, details) {
  const events = [];
  events.push({ type: 'banner', text: '🛰️ PLACEMENT PHASE', phase: 'placement', duration: 1100 });
  claimsSorted.forEach((c, pi) => {
    BATTLE_CARD_ORDER.forEach(cardType => {
      const anchor = c.battle_placement ? c.battle_placement[cardType] : null;
      if (anchor == null) return;
      events.push({ type: 'place', phase: 'placement', duration: 500, playerIndex: pi, cardType, anchor, username: c.username });
    });
  });
  
  events.push({ type: 'hide-all-fog', phase: 'attack', text: '⚔️ ATTACK PHASE — INITIATING FOG OF WAR', duration: 1400 });
  
  details.forEach((d, pi) => {
    const attacks = d.attacksDetail || [];
    if (attacks.length === 0) return;

    events.push({
      type: 'turn-announcement', phase: 'attack', duration: 1100,
      playerIndex: pi, username: d.claim.username, playerColor: _brColors(claimsSorted.length)[pi]
    });

    attacks.forEach((a) => {
      const cardCount = (a.occupants && a.occupants.length) || 0;
      const baseDuration = 1500;
      const stepDelay = 1400; 
      const calculatedDuration = cardCount <= 1 ? baseDuration : baseDuration + ((cardCount - 1) * stepDelay);

      events.push({
        type: 'attack', phase: 'attack', duration: calculatedDuration,
        playerIndex: pi, username: d.claim.username, cell: a.cell,
        occupants: a.occupants, subtotal: a.subtotal
      });
    });
  });

  events.push({ type: 'banner', text: '🏁 BATTLE CONCLUDED', phase: 'done', duration: 300 });
  return events;
}

function openBattleReplay(claims) {
  if (!claims || !claims.length) { alert('No battle claims to replay.'); return; }
  _brInjectStyles();

  const claimsSorted = claims.slice().sort((a, b) => new Date(a.claimed_at || 0) - new Date(b.claimed_at || 0));
  const details = battleComputeDetails(claimsSorted);
  const colors = _brColors(claimsSorted.length);
  const events = _brBuildTimeline(claimsSorted, details);
  const scores = claimsSorted.map(() => 0);

  const overlay = document.createElement('div');
  overlay.className = 'br-overlay';
  
  overlay.innerHTML = `
    <div class="br-hd">
      <div class="br-title">⚔ GRID BATTLE — LIVE REPLAY</div>
      <div class="br-phase placement" id="brPhaseBadge">PLACEMENT</div>
      <button class="br-close" id="brCloseBtn">✕</button>
    </div>
    <div class="br-body">
      <div class="br-gridcol">
        <div class="br-grid-outer">
          <div class="br-corner-label"></div>
          <div class="br-cols-labels" id="brColsLabels"></div>
          <div class="br-rows-labels" id="brRowsLabels"></div>
          
          <div class="br-gridwrap" id="brGridWrap">
            <div class="br-cells" id="brCells"></div>
            <div class="br-pieces" id="brPieces"></div>
            <div class="br-banner" id="brBanner"></div>
          </div>
        </div>
      </div>
      <div class="br-sidebar">
        <div class="br-legend" id="brLegend">
          <div class="br-legend-title">▶ TARGET TRACKER / SCOREBOARD</div>
          <div id="brLegendRows"></div>
        </div>
        <div class="br-log" id="brLog"></div>
      </div>
    </div>
    <div class="br-ft">
      <button class="br-btn" id="brReplayBtn">↺ REPLAY</button>
      <button class="br-btn wide" id="brPlayBtn">⏸ PAUSE</button>
      <button class="br-btn" id="brSpeedBtn">1x SPEED</button>
      <div class="br-progress" id="brProgress">0 / ${events.length}</div>
    </div>`;
  document.body.appendChild(overlay);

  const colsLabelsContainer = document.getElementById('brColsLabels');
  for (let c = 0; c < BATTLE_GRID; c++) {
    const item = document.createElement('div');
    item.className = 'br-label-item';
    item.textContent = String.fromCharCode(65 + c);
    colsLabelsContainer.appendChild(item);
  }

  const rowsLabelsContainer = document.getElementById('brRowsLabels');
  for (let r = 0; r < BATTLE_GRID; r++) {
    const item = document.createElement('div');
    item.className = 'br-label-item';
    item.textContent = r + 1;
    rowsLabelsContainer.appendChild(item);
  }

  let globalFxWrap = document.getElementById('brGlobalFxContainer');
  if (!globalFxWrap) {
    globalFxWrap = document.createElement('div');
    globalFxWrap.id = 'brGlobalFxContainer';
    globalFxWrap.className = 'br-global-fx-container';
    document.body.appendChild(globalFxWrap);
  }

  const cellsEl = document.getElementById('brCells');
  for (let i = 0; i < BATTLE_GRID * BATTLE_GRID; i++) {
    const d = document.createElement('div');
    d.className = 'br-cell';
    cellsEl.appendChild(d);
  }

  const legendRows = document.getElementById('brLegendRows');
  claimsSorted.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'br-lrow';
    row.id = 'brLrow-' + i;
    row.setAttribute('data-pindex', i);
    row.innerHTML = `<span class="br-swatch" style="background:${colors[i]};color:${colors[i]};"></span>
      <span class="br-lname">${c.username}</span>
      <span class="br-lscore" id="brScore-${i}">0</span>`;
    legendRows.appendChild(row);
  });

  const state = { events, idx: 0, playing: true, speed: 1, timer: null, overlay };
  _brState = state;

  document.getElementById('brCloseBtn').onclick = () => _brClose();
  document.getElementById('brPlayBtn').onclick = () => _brTogglePlay();
  document.getElementById('brSpeedBtn').onclick = () => _brToggleSpeed();
  document.getElementById('brReplayBtn').onclick = () => _brReplay();

  function log(html) {
    const el = document.getElementById('brLog');
    if (!el) return;
    const line = document.createElement('div');
    line.className = 'br-log-entry';
    line.innerHTML = html;
    el.prepend(line);
    while (el.children.length > 60) el.removeChild(el.lastChild);
  }

  function setPhaseBadge(phase) {
    const b = document.getElementById('brPhaseBadge');
    if (!b) return;
    b.className = 'br-phase ' + phase;
    b.textContent = phase === 'placement' ? 'PLACEMENT' : phase === 'attack' ? 'ATTACK' : 'CONCLUDED';
  }

  function showBanner(text, customColor = '#fff') {
    const b = document.getElementById('brBanner');
    if (!b) return;
    b.style.color = customColor;
    b.innerHTML = text;
    b.classList.add('show');
    setTimeout(() => b.classList.remove('show'), 950 / state.speed);
  }

  function highlightActivePlayer(playerIndex) {
    document.querySelectorAll('.br-lrow').forEach(r => r.classList.remove('active'));
    if (playerIndex !== null && playerIndex !== undefined) {
      const targetRow = document.getElementById('brLrow-' + playerIndex);
      if (targetRow) {
        targetRow.classList.add('active');
        targetRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function placePiece(ev) {
    highlightActivePlayer(ev.playerIndex);
    const card = BATTLE_CARDS[ev.cardType];
    const commName = _brGetCommanderName(ev.cardType);
    const [r, c] = battleRC(ev.anchor);
    const wrap = document.getElementById('brPieces');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'br-piece';
    el.id = `brPiece-${ev.playerIndex}-${ev.cardType}`;
    
    // Aligns layout grid nodes using 1-based indexing matching top and left headers
    el.style.setProperty('--r', r + 1);
    el.style.setProperty('--c', c + 1);
    el.style.setProperty('--pc', colors[ev.playerIndex]);
    el.innerHTML = `<img src="${card.image}" alt="${commName}"><div class="br-tag" style="--pc:${colors[ev.playerIndex]}">${ev.username}</div>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    log(`🛰️ <b style="color:${colors[ev.playerIndex]}">${ev.username}</b> deploys <span style="color:${card.color}">${commName}</span> at ${battleCoordLabel(ev.anchor)}`);
  }

  function initiateFogOfWar() {
    document.querySelectorAll('.br-piece').forEach(p => {
      p.classList.add('hidden-fog');
    });
  }

  function spawnGlobalFloatingText(cellIndex, textValue, textColor, shiftStep) {
    const gridWrap = document.getElementById('brGridWrap');
    if (!gridWrap || !globalFxWrap) return;

    const rect = gridWrap.getBoundingClientRect();
    
    // Calculates coordinates precisely mapping to the grid system
    const targetRow = Math.floor(cellIndex / BATTLE_GRID);
    const targetCol = cellIndex % BATTLE_GRID;

    const pctX = (targetCol + 0.5) / BATTLE_GRID;
    const pctY = (targetRow + 0.5) / BATTLE_GRID;

    const absoluteX = rect.left + (rect.width * pctX) + (shiftStep * 14 - 14);
    const absoluteY = rect.top + (rect.height * pctY) + (shiftStep * -10);

    const lbl = document.createElement('div');
    lbl.className = 'br-fxlabel';
    lbl.style.left = absoluteX + 'px';
    lbl.style.top = absoluteY + 'px';
    lbl.style.color = textColor;
    lbl.textContent = textValue;

    globalFxWrap.appendChild(lbl);
    setTimeout(() => lbl.remove(), 1350);
  }

  function attackCell(ev) {
    highlightActivePlayer(ev.playerIndex);
    const cellEl = cellsEl.children[ev.cell];
    const col = colors[ev.playerIndex];
    
    if (cellEl) {
      cellEl.style.borderColor = col;
      cellEl.style.boxShadow = `0 0 22px ${col}, inset 0 0 10px ${col.replace('hsl(', 'hsla(').replace(')', ',0.4)')}`;
      cellEl.style.background = col.replace('hsl(', 'hsla(').replace(')', ',0.35)');
      
      setTimeout(() => {
        cellEl.style.borderColor = '';
        cellEl.style.boxShadow = '';
        cellEl.style.background = '';
      }, ev.duration / state.speed);
    }

    if (ev.occupants && ev.occupants.length > 0) {
      ev.occupants.forEach((o, stepIdx) => {
        const ownerIdx = claimsSorted.findIndex(c => c.game_user_id === o.owner);
        if (ownerIdx === -1) return;

        setTimeout(() => {
          const pieceEl = document.getElementById(`brPiece-${ownerIdx}-${o.cardType}`);
          if (pieceEl) {
            pieceEl.classList.remove('hidden-fog');
            pieceEl.classList.add('hit-flash');
            
            setTimeout(() => {
              pieceEl.classList.remove('hit-flash');
              pieceEl.classList.add('hidden-fog');
            }, 1200);
          }

          const cardDef = BATTLE_CARDS[o.cardType];
          const txt = `${cardDef.value > 0 ? '+' : ''}${cardDef.value}`;
          const clr = cardDef.value > 0 ? '#39ff14' : cardDef.value < 0 ? '#ff3344' : '#789';
          
          spawnGlobalFloatingText(ev.cell, txt, clr, stepIdx);
        }, stepIdx * 1300 / state.speed);
      });
    } else {
      spawnGlobalFloatingText(ev.cell, '·0·', '#789', 0);
    }

    scores[ev.playerIndex] += ev.subtotal;

    let mathTerms = ev.occupants.map(o => {
      const oc = BATTLE_CARDS[o.cardType];
      return `${oc.value > 0 ? '+' : ''}${oc.value} (${_brGetCommanderName(o.cardType)[0]})`;
    });
    let mathLogStr = mathTerms.length > 0 
      ? `<div class="br-calc-details">🧮 Calculation: ${mathTerms.join(' ')} = ${ev.subtotal >= 0 ? '+' : ''}${ev.subtotal} pts</div>`
      : `<div class="br-calc-details">🧮 Calculation: 0 (No targets hit)</div>`;

    const labels = ["first attack", "second attack", "third attack"];
    const desc = !ev.occupants.length
      ? 'empty cell — no effect'
      : ev.occupants.map((o, idx) => {
          const oc = BATTLE_CARDS[o.cardType];
          const commName = _brGetCommanderName(o.cardType);
          const strikeOrderTag = labels[idx] || `${idx + 1}th attack`;
          return `<span style="color:${oc.color}">${o.username}'s ${commName} (${strikeOrderTag})</span> (${oc.value > 0 ? '+' : ''}${oc.value})`;
        }).join(', ');
        
    log(`💥 <b style="color:${col}">${ev.username}</b> strikes ${battleCellLabel(ev.cell)} → ${desc} <b style="color:${ev.subtotal >= 0 ? '#39ff14' : '#ff3344'}">= ${ev.subtotal >= 0 ? '+' : ''}${ev.subtotal} pt</b>${mathLogStr}`);
    updateScoreUI(ev.playerIndex);

    ev.occupants.forEach(o => {
      if (o.cardType !== 'reflector') return;
      const ownerIdx = claimsSorted.findIndex(c => c.game_user_id === o.owner);
      if (ownerIdx === -1) return;
      scores[ownerIdx] += 1;
      log(`⚡ <b style="color:${colors[ownerIdx]}">${o.username}</b> gains <b style="color:#39ff14">+1</b> — their Dune Enforcers were hit<div class="br-calc-details">🧮 Calculation: Passive Dune Enforcers standard payout = +1 pt</div>`);
      updateScoreUI(ownerIdx);
    });
  }

  function reorderScoreboardList() {
    const rows = Array.from(legendRows.children);
    rows.sort((a, b) => {
      const idxA = parseInt(a.getAttribute('data-pindex'), 10);
      const idxB = parseInt(b.getAttribute('data-pindex'), 10);
      return scores[idxB] - scores[idxA];
    });
    rows.forEach(divElement => legendRows.appendChild(divElement));
  }

  function updateScoreUI(i) {
    const el = document.getElementById('brScore-' + i);
    if (el) el.textContent = scores[i];
    reorderScoreboardList();
  }

  function updateProgress() {
    const p = document.getElementById('brProgress');
    if (p) p.textContent = `${state.idx} / ${state.events.length}`;
  }

  function applyEvent(ev) {
    if (ev.type === 'banner') { 
      setPhaseBadge(ev.phase); 
      showBanner(ev.text); 
      highlightActivePlayer(null);
    }
    else if (ev.type === 'hide-all-fog') {
      setPhaseBadge(ev.phase);
      showBanner(ev.text, '#ff6b35');
      initiateFogOfWar();
      highlightActivePlayer(null);
    }
    else if (ev.type === 'turn-announcement') {
      showBanner(`🎯 ${ev.username}'s Turn`, ev.playerColor);
      highlightActivePlayer(ev.playerIndex);
    }
    else if (ev.type === 'place') { 
      setPhaseBadge('placement'); 
      placePiece(ev); 
    }
    else if (ev.type === 'attack') { 
      setPhaseBadge('attack'); 
      attackCell(ev); 
    }
  }

  function scheduleNext() {
    if (!state.playing) return;
    if (state.idx >= state.events.length) { 
      state.playing = false; 
      _brUpdatePlayUI(); 
      highlightActivePlayer(null);
      return; 
    }
    const ev = state.events[state.idx];
    applyEvent(ev);
    state.idx++;
    updateProgress();
    state.timer = setTimeout(scheduleNext, ev.duration / state.speed);
  }

  state.scheduleNext = scheduleNext;
  state.updateProgress = updateProgress;
  state.resetScores = () => { 
    for (let i = 0; i < scores.length; i++) scores[i] = 0; 
    reorderScoreboardList();
  };

  scheduleNext();
}

function _brTogglePlay() {
  const s = _brState; if (!s) return;
  s.playing = !s.playing;
  _brUpdatePlayUI();
  if (s.playing) s.scheduleNext();
  else if (s.timer) clearTimeout(s.timer);
}
function _brUpdatePlayUI() {
  const s = _brState; if (!s) return;
  const b = document.getElementById('brPlayBtn');
  if (b) b.textContent = s.playing ? '⏸ PAUSE' : '▶ PLAY';
}
function _brToggleSpeed() {
  const s = _brState; if (!s) return;
  s.speed = s.speed === 1 ? 2 : 1;
  const b = document.getElementById('brSpeedBtn');
  if (b) b.textContent = s.speed + 'x SPEED';
}
function _brReplay() {
  const s = _brState; if (!s) return;
  if (s.timer) clearTimeout(s.timer);
  s.idx = 0;
  s.playing = true;
  s.resetScores();
  document.getElementById('brPieces').innerHTML = '';
  const globalFxWrap = document.getElementById('brGlobalFxContainer');
  if (globalFxWrap) globalFxWrap.innerHTML = '';
  document.getElementById('brLog').innerHTML = '';
  document.querySelectorAll('.br-cell').forEach(c => { c.style.borderColor = ''; c.style.boxShadow = ''; c.style.background = ''; });
  document.querySelectorAll('.br-lscore').forEach(el => el.textContent = '0');
  document.querySelectorAll('.br-lrow').forEach(r => r.classList.remove('active'));
  _brUpdatePlayUI();
  s.updateProgress();
  s.scheduleNext();
}
function _brClose() {
  const s = _brState; if (!s) return;
  if (s.timer) clearTimeout(s.timer);
  if (s.overlay && s.overlay.parentNode) s.overlay.parentNode.removeChild(s.overlay);
  const globalFxWrap = document.getElementById('brGlobalFxContainer');
  if (globalFxWrap && globalFxWrap.parentNode) globalFxWrap.parentNode.removeChild(globalFxWrap);
  _brState = null;
}

console.log('battleReplay.js loaded');