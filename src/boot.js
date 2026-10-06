// Load the game dynamically so a missing module can show a recoverable error,
// rather than leaving the HTML loading overlay visible indefinitely.
(() => {
  let ready = false;
  const showFailure = error => {
    if (ready) return;
    console.error('Retro Malaysia startup failed:', error);
    document.getElementById('loading').hidden = true;
    document.getElementById('start-screen').hidden = true;
    const panel = document.getElementById('error-panel');
    if (panel.hidden) {
      document.getElementById('error-text').textContent = 'The game files could not load. Tap Try again to reload the page. If this continues, the published game needs an update.';
      panel.hidden = false;
    }
  };
  const timeout = setTimeout(() => showFailure(new Error('Game startup timed out after 30 seconds.')), 30000);
  import('./main.js?v=0.3.0').then(() => {
    ready = true;
    clearTimeout(timeout);
    document.getElementById('error-panel').hidden = true;
    document.getElementById('start-screen').hidden = false;
  }).catch(error => {
    clearTimeout(timeout);
    showFailure(error);
  });
})();
