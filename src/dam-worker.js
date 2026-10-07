import { chooseTurn } from './dam-haji.js?v=1.5.0';
self.onmessage = ({ data }) => {
  try { self.postMessage({ steps: chooseTurn(data.match) }); }
  catch { self.postMessage({ error: true }); }
};
