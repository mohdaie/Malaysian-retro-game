import { SKATE_SLOTS, SKATE_PARTS, SKATE_PART_IDS } from './skate-parts.js?v=2.13.0';

// One group per slot, one button per part. The chosen part is pressed, and each
// button shows its colour chips so the three slots read apart at a glance.
export function renderSkateOptions(root, chosen, onChoose) {
  root.replaceChildren();
  for (const [slot, heading] of Object.entries(SKATE_SLOTS)) {
    const group = document.createElement('fieldset'), legend = document.createElement('legend');
    group.className = 'skate-slot'; legend.textContent = heading; group.append(legend);
    for (const id of SKATE_PART_IDS.filter(id => SKATE_PARTS[id].slot === slot)) {
      const part = SKATE_PARTS[id], btn = document.createElement('button'), chips = document.createElement('span'), name = document.createElement('b'), note = document.createElement('small');
      btn.type = 'button'; btn.className = 'secondary skate-option'; btn.dataset.part = id;
      btn.setAttribute('aria-pressed', String(chosen[slot] === id)); btn.title = part.note;
      chips.className = 'skate-chips';
      for (const hex of Object.values(part.colours)) { const chip = document.createElement('i'); chip.style.background = '#' + hex.toString(16).padStart(6, '0'); chips.append(chip); }
      name.textContent = part.name; note.textContent = part.note;
      btn.append(chips, name, note);
      btn.onclick = () => onChoose(slot, id);
      group.append(btn);
    }
    root.append(group);
  }
}
