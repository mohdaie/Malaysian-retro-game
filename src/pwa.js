// Installation belongs to this game, including when hosted in a Pages subfolder.
const root = new URL('../', import.meta.url);
const buttons = [...document.querySelectorAll('[data-install-game]')];
let installPrompt;
const installed = () => matchMedia('(display-mode: fullscreen)').matches ||
  matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const syncButtons = () => {
  for (const button of buttons) button.hidden = !installPrompt || installed();
};
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  syncButtons();
});
window.addEventListener('appinstalled', () => {
  installPrompt = undefined;
  syncButtons();
});
for (const button of buttons) button.addEventListener('click', async () => {
  if (!installPrompt) return;
  const prompt = installPrompt;
  installPrompt = undefined;
  syncButtons();
  try {
    await prompt.prompt();
    await prompt.userChoice;
  } catch (error) { console.warn('Retro Malaysia installation:', error); }
});
syncButtons();

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(new URL('sw.js', root), {
        scope: root.pathname,
        updateViaCache: 'none'
      });
      const showUpdate = () => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          document.getElementById('pwa-update-note').hidden = false;
        }
      };
      showUpdate();
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', showUpdate);
      });
      // Let the current afternoon finish. New files activate after all game
      // windows close, without a forced reload or mixed old/new game modules.
    } catch (error) { console.warn('Retro Malaysia offline setup:', error); }
  });
}
