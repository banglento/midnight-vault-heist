// Keyboard and mouse input: WASD / arrows to move, Shift to sneak,
// Space or Enter to start and restart, click also starts. Nothing else.

export function createInput(canvas) {
  const keys = new Set();
  let clicked = false;

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('pointerdown', () => { clicked = true; });

  return {
    axis() {
      let x = 0;
      let y = 0;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;
      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      return { x, y };
    },
    sneaking() { return keys.has('shift'); },
    confirmPressed() {
      return keys.has(' ') || keys.has('enter') || clicked;
    },
    consumeClick() { clicked = false; },
  };
}
