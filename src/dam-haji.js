// Pekan's 8x8 house rules: men move/capture forward; compulsory capture,
// any complete capture sequence; flying Haji; crowning ends the turn.
// Positive/red pieces belong to the player; negative/black to Pak Din.
export const LEVELS = { belajar: 'Belajar', santai: 'Santai', jaguh: 'Jaguh' };
const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const sign = turn => turn === 0 ? 1 : -1;
const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
export const squareName = i => `${'abcdefgh'[i % 8]}${8 - Math.floor(i / 8)}`;
const positionKey = s => `${s.turn}:${s.cells.join(',')}`;

export function newMatch(level = 'santai') {
  if (!LEVELS[level]) throw new Error('Unknown Dam Haji level');
  const cells = Array(64).fill(0);
  for (let i = 0; i < 64; i++) if ((Math.floor(i / 8) + i % 8) % 2) {
    if (i < 24) cells[i] = -1;
    if (i >= 40) cells[i] = 1;
  }
  const s = { cells, turn: 0, chain: null, level, over: false, winner: null,
    reason: '', turns: 0, quiet: 0, history: [], settled: false, last: null };
  s.history.push(positionKey(s));
  return s;
}

function pieceMoves(s, from, captureOnly = false) {
  const piece = s.cells[from], r = Math.floor(from / 8), c = from % 8, moves = [];
  if (!piece || Math.sign(piece) !== sign(s.turn)) return moves;
  for (const [dr, dc] of dirs) {
    if (Math.abs(piece) === 1 && dr !== -Math.sign(piece)) continue;
    if (Math.abs(piece) === 1) {
      const rr = r + dr, cc = c + dc;
      if (!inside(rr, cc)) continue;
      const mid = rr * 8 + cc, target = (r + dr * 2) * 8 + c + dc * 2;
      if (!captureOnly && !s.cells[mid]) moves.push({ from, to: mid, captured: null });
      if (s.cells[mid] && Math.sign(s.cells[mid]) !== Math.sign(piece) && inside(r + dr * 2, c + dc * 2) && !s.cells[target])
        moves.push({ from, to: target, captured: mid });
    } else {
      let enemy = null;
      for (let rr = r + dr, cc = c + dc; inside(rr, cc); rr += dr, cc += dc) {
        const to = rr * 8 + cc, occupant = s.cells[to];
        if (occupant) {
          if (Math.sign(occupant) === Math.sign(piece) || enemy !== null) break;
          enemy = to;
        } else if (enemy !== null || !captureOnly) moves.push({ from, to, captured: enemy });
      }
    }
  }
  return moves;
}

export function legalSteps(s) {
  if (s.over) return [];
  if (s.chain !== null) return pieceMoves(s, s.chain, true);
  const moves = s.cells.flatMap((p, i) => Math.sign(p) === sign(s.turn) ? pieceMoves(s, i) : []);
  const captures = moves.filter(m => m.captured !== null);
  return captures.length ? captures : moves;
}

function endTurn(s) {
  s.chain = null; s.turn = 1 - s.turn; s.turns++;
  const key = positionKey(s);
  s.history.push(key); s.history = s.history.slice(-81);
  if (!legalSteps(s).length) {
    s.over = true; s.winner = 1 - s.turn; s.reason = 'no-moves';
  } else if (s.history.filter(k => k === key).length >= 3 || s.quiet >= 80) {
    s.over = true; s.winner = null; s.reason = 'draw';
  }
}

export function playStep(state, from, to) {
  const move = legalSteps(state).find(m => m.from === from && m.to === to);
  if (!move) throw new Error('Illegal Dam Haji move');
  const s = { ...state, cells: [...state.cells], history: [...state.history] };
  const piece = s.cells[from]; s.cells[from] = 0; s.cells[to] = piece;
  if (move.captured !== null) s.cells[move.captured] = 0;
  const promoted = Math.abs(piece) === 1 && (piece > 0 ? to < 8 : to >= 56);
  if (promoted) s.cells[to] = Math.sign(piece) * 2;
  s.last = { from, to, captured: move.captured, promoted };
  s.quiet = move.captured !== null || Math.abs(piece) === 1 ? 0 : s.quiet + 1;
  if (move.captured !== null && !promoted && pieceMoves(s, to, true).length) s.chain = to;
  else endTurn(s);
  return s;
}

// Search works in complete turns, including every compulsory jump.
export function legalTurns(s) {
  const result = [];
  function walk(current, steps) {
    for (const m of legalSteps(current)) {
      const next = playStep(current, m.from, m.to), path = [...steps, m];
      if (next.over || next.turn !== s.turn) result.push({ steps: path, state: next });
      else walk(next, path);
    }
  }
  walk(s, []); return result;
}
function evaluate(s, root) {
  if (s.over) return s.winner === null ? 0 : s.winner === root ? 100000 - s.turns : -100000 + s.turns;
  let score = 0;
  s.cells.forEach((p, i) => {
    if (!p) return;
    const row = Math.floor(i / 8), col = i % 8;
    const worth = Math.abs(p) === 2 ? 330 : 100 + (p > 0 ? 7 - row : row) * 5;
    score += Math.sign(p) * (worth + (col > 1 && col < 6 ? 6 : 0));
  });
  return score * sign(root);
}
export function chooseTurn(s, level = s.level) {
  const turns = legalTurns(s); if (!turns.length) return null;
  const depth = level === 'jaguh' ? 5 : level === 'santai' ? 3 : 1;
  const limit = level === 'jaguh' ? 14000 : 3500;
  let nodes = 0;
  function search(board, remaining, alpha, beta) {
    if (!remaining || board.over || ++nodes > limit) return evaluate(board, s.turn);
    const maximize = board.turn === s.turn;
    let best = maximize ? -Infinity : Infinity;
    const children = legalTurns(board).sort((a, b) => b.steps.filter(m => m.captured !== null).length - a.steps.filter(m => m.captured !== null).length);
    for (const child of children) {
      const value = search(child.state, remaining - 1, alpha, beta);
      best = maximize ? Math.max(best, value) : Math.min(best, value);
      if (maximize) alpha = Math.max(alpha, best); else beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  // Iterative deepening keeps the last fully searched level if the budget ends.
  let chosen = turns[0];
  for (let d = 1; d <= depth; d++) {
    let candidate = chosen, best = -Infinity;
    for (const turn of turns) {
      const value = search(turn.state, d - 1, -Infinity, Infinity);
      if (value > best) { best = value; candidate = turn; }
    }
    if (nodes > limit) break;
    chosen = candidate;
  }
  return chosen.steps;
}

// Save only valid board shapes and a consistent turn/result. An interrupted
// capture retains its forced piece; history is bounded and used for draws.
export function cleanMatch(v) {
  if (!v || !LEVELS[v.level] || !Array.isArray(v.cells) || v.cells.length !== 64 || ![0, 1].includes(v.turn)) return null;
  if (!v.cells.every((p, i) => [-2, -1, 0, 1, 2].includes(p) && (!p || (Math.floor(i / 8) + i % 8) % 2))) return null;
  if (v.cells.some((p, i) => p === 1 && i < 8 || p === -1 && i >= 56)) return null;
  if ([1, -1].some(side => v.cells.filter(p => Math.sign(p) === side).length > 12)) return null;
  if (typeof v.over !== 'boolean' || typeof v.settled !== 'boolean' || ![null, 0, 1].includes(v.winner)) return null;
  if (![v.turns, v.quiet].every(n => Number.isInteger(n) && n >= 0 && n <= 1e6)) return null;
  if (v.chain !== null && (!Number.isInteger(v.chain) || v.chain < 0 || v.chain > 63)) return null;
  const s = { cells: [...v.cells], turn: v.turn, chain: v.chain, level: v.level, over: v.over, winner: v.winner,
    reason: ['no-moves', 'draw', 'resigned'].includes(v.reason) ? v.reason : '', turns: v.turns, quiet: v.quiet,
    history: Array.isArray(v.history) ? v.history.filter(k => typeof k === 'string' && /^([01]):(-?[012],){63}-?[012]$/.test(k)).slice(-81) : [], settled: v.settled, last: null };
  if (s.over) {
    if (s.chain !== null || !s.reason || s.winner === null && s.reason !== 'draw' || s.winner !== null && s.winner !== 1 - s.turn) return null;
    if (s.reason === 'no-moves' && legalSteps({ ...s, over: false }).length) return null;
  } else {
    if (s.winner !== null || s.settled || s.reason || !legalSteps(s).length) return null;
    if (s.chain !== null && (Math.sign(s.cells[s.chain]) !== sign(s.turn) || !pieceMoves(s, s.chain, true).length)) return null;
  }
  return s;
}
