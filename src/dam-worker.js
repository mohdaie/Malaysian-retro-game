import { chooseTurn } from './dam-haji.js?v=2.7.3';
self.onmessage = ({ data }) => {
  try { self.postMessage({ steps: chooseTurn(data.match) }); }
  catch { self.postMessage({ error: true }); }
};
