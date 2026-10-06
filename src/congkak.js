// Turn-based teaching variant. Indexed counterclockwise: player pits 0–6,
// player store 7, opponent pits 8–14, opponent store 15.
export function newRound() {
  return { pits: Array.from({ length: 16 }, (_, i) => i === 7 || i === 15 ? 0 : 7), turn: 0, over: false, winner: null };
}
export function legalMoves(state) {
  if (state.over) return [];
  const start = state.turn === 0 ? 0 : 8;
  return Array.from({ length: 7 }, (_, i) => start + i).filter(i => state.pits[i] > 0);
}
export function playMove(state, pit) {
  if (!legalMoves(state).includes(pit)) throw new Error('Choose a non-empty house on the active player’s side.');
  const next = { ...state, pits: [...state.pits] };
  const ownStore = state.turn === 0 ? 7 : 15;
  const skippedStore = state.turn === 0 ? 15 : 7;
  let hand = next.pits[pit];
  next.pits[pit] = 0;
  let cursor = pit;
  const frames = [{ pits: [...next.pits], active: cursor, hand }];
  let steps = 0;
  while (hand > 0) {
    cursor = (cursor + 1) % 16;
    if (cursor === skippedStore) continue;
    next.pits[cursor]++;
    hand--;
    frames.push({ pits: [...next.pits], active: cursor, hand });
    // Relay sowing: an occupied small house releases all its shells again.
    if (hand === 0 && cursor !== ownStore && next.pits[cursor] > 1) {
      hand = next.pits[cursor];
      next.pits[cursor] = 0;
      frames.push({ pits: [...next.pits], active: cursor, hand });
    }
    if (++steps > 20000) throw new Error('Sowing did not terminate.');
  }
  const onOwnSide = state.turn === 0 ? cursor < 7 : cursor > 7 && cursor < 15;
  const opposite = 14 - cursor;
  let capture = 0;
  if (onOwnSide && next.pits[cursor] === 1 && next.pits[opposite] > 0) {
    capture = next.pits[opposite] + 1;
    next.pits[ownStore] += capture;
    next.pits[cursor] = next.pits[opposite] = 0;
    frames.push({ pits: [...next.pits], active: ownStore, hand: 0 });
  }
  const extraTurn = cursor === ownStore;
  next.turn = extraTurn ? state.turn : 1 - state.turn;
  if (next.pits.slice(0, 7).every(n => n === 0) || next.pits.slice(8, 15).every(n => n === 0)) {
    next.pits[7] += next.pits.slice(0, 7).reduce((a, b) => a + b, 0);
    next.pits[15] += next.pits.slice(8, 15).reduce((a, b) => a + b, 0);
    for (let i = 0; i < 16; i++) if (i !== 7 && i !== 15) next.pits[i] = 0;
    next.over = true;
    next.winner = next.pits[7] === next.pits[15] ? null : next.pits[7] > next.pits[15] ? 0 : 1;
    frames.push({ pits: [...next.pits], active: -1, hand: 0 });
  }
  return { state: next, frames, capture, extraTurn };
}
export function opponentMove(state) {
  // Pak Mat chooses a simple one-move lookahead; no external AI calls.
  return legalMoves(state).map(pit => {
    const { state: next, extraTurn } = playMove(state, pit);
    return { pit, score: next.pits[15] - state.pits[15] + (extraTurn ? 4 : 0) };
  }).sort((a, b) => b.score - a.score)[0]?.pit;
}
