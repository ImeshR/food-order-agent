/**
 * Voice web client – bundled with Vite so @twilio/voice-sdk works in the browser.
 * Run: npm run build:voice
 * Output: public/voice-client-bundle.js
 */
import { Device } from '@twilio/voice-sdk';

const API_BASE = '';

async function getToken(identity) {
  const q = identity ? `?identity=${encodeURIComponent(identity)}` : '';
  const r = await fetch(`${API_BASE}/voice/token${q}`);
  const data = await r.json();
  if (!r.ok || data.error) throw new Error(data.error || 'Failed to get token');
  return data.token;
}

function init() {
  const statusEl = document.getElementById('status');
  const btnStart = document.getElementById('btnStart');
  const btnCall = document.getElementById('btnCall');
  const btnHangup = document.getElementById('btnHangup');
  const identityInput = document.getElementById('identity');
  const targetInput = document.getElementById('target');

  if (!statusEl || !btnStart) return;

  function setStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.className = 'status ' + (isError ? 'error' : 'success');
  }

  let device = null;
  let activeCall = null;

  btnStart.addEventListener('click', async () => {
    try {
      btnStart.disabled = true;
      setStatus('Getting token...');
      const token = await getToken(identityInput.value.trim() || 'web_user');
      device = new Device(token, { logLevel: 1 });

      device.on('registered', () => {
        setStatus('Device ready. You can place a call.');
        btnCall.disabled = false;
      });
      device.on('error', (e) => setStatus('Device error: ' + (e.message || e), true));
      device.on('tokenWillExpire', async () => {
        const newToken = await getToken(identityInput.value.trim() || 'web_user');
        device.updateToken(newToken);
      });

      await device.register();
    } catch (e) {
      setStatus('Error: ' + (e.message || e), true);
      btnStart.disabled = false;
    }
  });

  btnCall.addEventListener('click', async () => {
    if (!device) return;
    try {
      btnCall.disabled = true;
      setStatus('Connecting...');
      const params = {};
      const target = targetInput.value.trim();
      if (target) params.To = target;
      activeCall = await device.connect({ params });
      activeCall.on('accept', () => setStatus('Call connected.'));
      activeCall.on('disconnect', () => {
        activeCall = null;
        btnCall.disabled = false;
        btnHangup.disabled = true;
        setStatus('Call ended.');
      });
      activeCall.on('error', (e) => setStatus('Call error: ' + (e.message || e), true));
      btnHangup.disabled = false;
    } catch (e) {
      setStatus('Call failed: ' + (e.message || e), true);
      btnCall.disabled = false;
    }
  });

  btnHangup.addEventListener('click', () => {
    if (activeCall) {
      activeCall.disconnect();
      activeCall = null;
    }
    btnHangup.disabled = true;
    btnCall.disabled = false;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
