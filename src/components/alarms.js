export function initAlarms(element) {
  const getAlarms = () => JSON.parse(localStorage.getItem('alarms')) || [];
  const saveAlarms = (alarms) => localStorage.setItem('alarms', JSON.stringify(alarms));

  let audioContext = null;
  let activeOscillator = null;

  // Create Alarm Overlay
  let alarmOverlay = document.getElementById('alarm-overlay');
  if (!alarmOverlay) {
    alarmOverlay = document.createElement('div');
    alarmOverlay.id = 'alarm-overlay';
    alarmOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.9); z-index: 2000;
      display: none; flex-direction: column; align-items: center; justify-content: center;
      backdrop-filter: blur(10px);
    `;
    alarmOverlay.innerHTML = `
      <div style="font-size: 5rem; margin-bottom: 2rem;">⏰</div>
      <h2 id="alarm-msg" style="font-size: 2rem; margin-bottom: 2rem;">Alarm Ringing!</h2>
      <button id="stop-alarm" style="
        background: #ef4444; color: white; border: none; padding: 1rem 3rem;
        border-radius: 50px; font-size: 1.5rem; font-weight: bold; cursor: pointer;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
      ">Stop</button>
    `;
    document.body.appendChild(alarmOverlay);

    // Add Stop Listener only once
    const stopAlarm = () => {
      if (activeOscillator) {
        try { activeOscillator.stop(); } catch (e) { }
        activeOscillator = null;
      }
      alarmOverlay.style.display = 'none';
    };
    alarmOverlay.querySelector('#stop-alarm').onclick = stopAlarm;
  }

  const playAlarmSound = () => {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'square'; // More alarming sound
    osc.frequency.setValueAtTime(440, audioContext.currentTime);

    // Beep pattern
    gain.gain.setValueAtTime(0.5, audioContext.currentTime);
    gain.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
    gain.gain.setValueAtTime(0.5, audioContext.currentTime + 0.4);
    gain.gain.setValueAtTime(0, audioContext.currentTime + 0.6);
    gain.gain.setValueAtTime(0.5, audioContext.currentTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);

    osc.start();
    activeOscillator = osc;

    // Auto stop after 10s if ignored, to be safe
    try { osc.stop(audioContext.currentTime + 10); } catch (e) { }
  };

  const checkAlarms = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = hours + ':' + minutes;
    const currentSeconds = now.getSeconds();

    if (currentSeconds === 0) {
      const alarms = getAlarms();
      alarms.forEach(alarm => {
        // Prevent re-triggering if already ringing
        if (alarm.time === currentTime && alarm.enabled && alarmOverlay.style.display === 'none') {
          playAlarmSound();
          const msgEl = document.getElementById('alarm-msg');
          if (msgEl) msgEl.innerText = alarm.label || 'Alarm';
          alarmOverlay.style.display = 'flex';
        }
      });
    }
  };

  // Check loop - Clear existing interval if any (not easily possible here without global state, but basic protection)
  // We assume initAlarms is called once.
  setInterval(checkAlarms, 1000);

  const render = () => {
    const alarms = getAlarms();

    const listHtml = alarms.map((alarm, index) => {
      return `
      <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.05); padding:0.5rem; border-radius:8px; margin-bottom:0.5rem;">
        <div>
          <div style="font-size:1.2rem; font-weight:600;">${alarm.time}</div>
          <div style="font-size:0.8rem; opacity:0.7;">${alarm.label}</div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button data-toggle="${index}" style="background:${alarm.enabled ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'}; border:none; color:white; padding:5px 10px; border-radius:4px; font-size:0.8rem; cursor:pointer;">
            ${alarm.enabled ? 'ON' : 'OFF'}
          </button>
          <button data-delete="${index}" style="background:none; border:none; color:#ef4444; cursor:pointer;">✕</button>
        </div>
      </div>
      `;
    }).join('');

    element.innerHTML = `
      <h2>Alarms</h2>
      <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
        <input type="time" id="alarm-time" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.2); color:white; padding:0.5rem; border-radius:8px;">
        <input type="text" id="alarm-label" placeholder="Label" style="flex:1;">
        <button id="add-alarm" style="background:var(--accent-color); border:none; color:white; width:40px; border-radius:8px;">+</button>
      </div>
      <div style="max-height:150px; overflow-y:auto;">
        ${listHtml}
      </div>
    `;

    // Listeners
    element.querySelector('#add-alarm').onclick = () => {
      const time = element.querySelector('#alarm-time').value;
      const label = element.querySelector('#alarm-label').value || 'Alarm';
      if (time) {
        const alarms = getAlarms();
        alarms.push({ time, label, enabled: true });
        saveAlarms(alarms);
        render();
      }
    };

    element.querySelectorAll('button[data-toggle]').forEach(btn => {
      btn.onclick = (e) => {
        const idx = e.target.dataset.toggle;
        const alarms = getAlarms();
        alarms[idx].enabled = !alarms[idx].enabled;
        saveAlarms(alarms);
        render();
      };
    });

    element.querySelectorAll('button[data-delete]').forEach(btn => {
      btn.onclick = (e) => {
        const idx = e.target.dataset.delete;
        const alarms = getAlarms();
        alarms.splice(idx, 1);
        saveAlarms(alarms);
        render();
      };
    });
  };

  render();
}
